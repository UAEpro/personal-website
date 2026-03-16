import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) return error("Invalid ID", 400);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`view-${ip}-${postId}`, 1, 600000)) {
    return success({ counted: false });
  }

  await prisma.post.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
  });

  return success({ counted: true });
}
