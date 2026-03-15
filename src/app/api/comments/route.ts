import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error, paginated, parseSearchParams } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  const { page, limit, searchParams } = parseSearchParams(req.url);
  const postIdParam = searchParams.get("postId");

  if (user) {
    // Admin: return all comments, optionally filtered by postId
    const where = postIdParam ? { postId: parseInt(postIdParam) } : {};
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { post: { select: { id: true, title: true, slug: true } } },
      }),
      prisma.comment.count({ where }),
    ]);
    return paginated(comments, total, page, limit);
  }

  // Public: requires ?postId, only approved
  if (!postIdParam) return error("postId is required", 400);
  const postId = parseInt(postIdParam);
  if (isNaN(postId)) return error("Invalid postId");

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { postId, isApproved: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        authorName: true,
        content: true,
        createdAt: true,
      },
    }),
    prisma.comment.count({ where: { postId, isApproved: true } }),
  ]);

  return paginated(comments, total, page, limit);
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip, 5, 600000)) {
    return error("Too many requests. Please try again later.", 429);
  }

  const body = await req.json();

  // Honeypot check
  if (body.website || body.honeypot) {
    return error("Spam detected", 400);
  }

  const { postId, authorName, authorEmail, content } = body;
  if (!postId || !authorName || !authorEmail || !content) {
    return error("postId, authorName, authorEmail, and content are required");
  }

  const post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
  if (!post) return error("Post not found", 404);

  const comment = await prisma.comment.create({
    data: {
      postId: parseInt(postId),
      authorName,
      authorEmail,
      content,
      isApproved: false,
    },
    select: {
      id: true,
      authorName: true,
      content: true,
      createdAt: true,
    },
  });

  return created(comment);
}
