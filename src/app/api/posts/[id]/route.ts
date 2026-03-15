import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";
import { slugify, calculateReadingTime } from "@/lib/utils";
import { PostStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) return error("Invalid ID");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: true } },
      author: { select: { id: true, name: true } },
    },
  });

  if (!post) return error("Post not found", 404);
  return success(post);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) return error("Invalid ID");

  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) return error("Post not found", 404);

  const body = await req.json();
  const { title, content, excerpt, coverImage, status, categoryId, seoTitle, seoDescription, ogImage, tags } = body;

  // Recalculate slug if title changed
  let slug = existing.slug;
  if (title && title !== existing.title) {
    let baseSlug = slugify(title);
    let candidate = baseSlug;
    let counter = 1;
    while (true) {
      const conflict = await prisma.post.findUnique({ where: { slug: candidate } });
      if (!conflict || conflict.id === postId) break;
      candidate = `${baseSlug}-${counter++}`;
    }
    slug = candidate;
  }

  const readingTime = content ? calculateReadingTime(content) : existing.readingTime;
  const postStatus: PostStatus = status || existing.status;

  // Set publishedAt when transitioning to PUBLISHED
  let publishedAt = existing.publishedAt;
  if (postStatus === PostStatus.PUBLISHED && existing.status !== PostStatus.PUBLISHED) {
    publishedAt = new Date();
  }

  const updateData: Record<string, unknown> = {
    ...(title !== undefined && { title }),
    slug,
    ...(content !== undefined && { content }),
    ...(excerpt !== undefined && { excerpt }),
    ...(coverImage !== undefined && { coverImage }),
    status: postStatus,
    ...(categoryId !== undefined && { categoryId: categoryId ? parseInt(categoryId) : null }),
    readingTime,
    ...(seoTitle !== undefined && { seoTitle }),
    ...(seoDescription !== undefined && { seoDescription }),
    ...(ogImage !== undefined && { ogImage }),
    publishedAt,
  };

  // Handle tags update: delete all then re-create
  if (tags !== undefined) {
    await prisma.postTag.deleteMany({ where: { postId } });
    if (tags.length > 0) {
      await prisma.postTag.createMany({
        data: tags.map((tagId: number) => ({ postId, tagId })),
      });
    }
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data: updateData,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: true } },
      author: { select: { id: true, name: true } },
    },
  });

  return success(post);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) return error("Invalid ID");

  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) return error("Post not found", 404);

  await prisma.post.delete({ where: { id: postId } });
  return success({ deleted: true });
}
