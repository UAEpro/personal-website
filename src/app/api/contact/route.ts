import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error, paginated, parseSearchParams } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { page, limit } = parseSearchParams(req.url);

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactMessage.count(),
  ]);

  return paginated(messages, total, page, limit);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip, 3, 600000)) {
    return error("Too many requests. Please try again later.", 429);
  }

  const body = await req.json();

  // Honeypot check
  if (body.website || body.honeypot) {
    return error("Spam detected", 400);
  }

  const { name, email, message } = body;
  if (!name || !email || !message) {
    return error("name, email, and message are required");
  }

  const contact = await prisma.contactMessage.create({
    data: { name, email, message },
  });

  return created(contact);
}
