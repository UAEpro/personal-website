import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { created, error } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`subscribe-${ip}`, 3, 600000)) {
    return error("Too many requests. Please try again later.", 429);
  }

  const body = await req.json();
  const email = body.email?.trim()?.toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return error("البريد الإلكتروني غير صالح", 400);
  }

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    return created({ message: "تم الاشتراك مسبقاً" });
  }

  await prisma.subscriber.create({
    data: {
      email,
      confirmToken: uuid(),
      unsubToken: uuid(),
    },
  });

  return created({ message: "تم الاشتراك بنجاح" });
}
