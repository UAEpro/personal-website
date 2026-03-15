import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error, paginated, parseSearchParams } from "@/lib/api";
import { slugify, calculateReadingTime } from "@/lib/utils";
import { PostStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { page, limit, search, searchParams } = parseSearchParams(req.url);
  const user = await requireAuth(req);

  const statusParam = searchParams.get("status") as PostStatus | null;
  const categoryParam = searchParams.get("category");
  const tagParam = searchParams.get("tag");

  // Public only sees published posts
  const statusFilter = user
    ? statusParam
      ? { status: statusParam }
      : {}
    : { status: PostStatus.PUBLISHED };

  const where = {
    ...statusFilter,
    ...(categoryParam ? { categoryId: parseInt(categoryParam) } : {}),
    ...(tagParam
      ? { tags: { some: { tag: { slug: tagParam } } } }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { excerpt: { contains: search } },
          ],
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        author: { select: { id: true, name: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return paginated(posts, total, page, limit);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json();
  const { title, content, excerpt, coverImage, status, categoryId, seoTitle, seoDescription, ogImage, tags } = body;

  if (!title || !content) return error("title and content are required");

  // Generate unique slug
  let baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const readingTime = calculateReadingTime(content);
  const postStatus: PostStatus = status || PostStatus.DRAFT;
  const publishedAt = postStatus === PostStatus.PUBLISHED ? new Date() : null;

  // Resolve authorId — api key user gets id "api", map to first user
  let authorId: number;
  if (user.id === "api") {
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) return error("No users found", 500);
    authorId = firstUser.id;
  } else {
    authorId = parseInt(user.id);
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || "",
      coverImage: coverImage || null,
      status: postStatus,
      categoryId: categoryId ? parseInt(categoryId) : null,
      readingTime,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      ogImage: ogImage || null,
      publishedAt,
      authorId,
      tags: tags?.length
        ? {
            create: tags.map((tagId: number) => ({
              tag: { connect: { id: tagId } },
            })),
          }
        : undefined,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: true } },
      author: { select: { id: true, name: true } },
    },
  });

  return created(post);
}
