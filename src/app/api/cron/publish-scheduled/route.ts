import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import { success, error } from "@/lib/api";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return error("Unauthorized", 401);
  }

  const now = new Date();
  const posts = await prisma.post.findMany({
    where: {
      status: PostStatus.SCHEDULED,
      scheduledAt: { lte: now },
    },
  });

  if (posts.length === 0) {
    return success({ published: 0 });
  }

  await prisma.post.updateMany({
    where: {
      id: { in: posts.map((p) => p.id) },
    },
    data: {
      status: PostStatus.PUBLISHED,
      publishedAt: now,
    },
  });

  return success({ published: posts.length, titles: posts.map((p) => p.title) });
}
