import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";
import { PostStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      author: { select: { id: true, name: true } },
      comments: {
        where: { isApproved: true },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          authorName: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!post || post.status !== PostStatus.PUBLISHED) {
    return error("Post not found", 404);
  }

  return success(post);
}
