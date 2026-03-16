import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";
import { v4 as uuid } from "uuid";

const ALLOWED_EMOJIS = ["fire", "heart", "thumbsUp", "rocket", "thinking"];

function getSessionId(req: NextRequest): { sessionId: string; isNew: boolean } {
  const cookie = req.cookies.get("reaction_session");
  if (cookie?.value) return { sessionId: cookie.value, isNew: false };
  return { sessionId: uuid(), isNew: true };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) return error("Invalid ID", 400);

  const reactions = await prisma.reaction.groupBy({
    by: ["emoji"],
    where: { postId },
    _count: { emoji: true },
  });

  const counts: Record<string, number> = {};
  for (const r of reactions) {
    counts[r.emoji] = r._count.emoji;
  }

  return success(counts);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) return error("Invalid ID", 400);

  const body = await req.json();
  const emoji = body.emoji;
  if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
    return error("Invalid emoji", 400);
  }

  const { sessionId, isNew } = getSessionId(req);

  // Toggle: if exists, remove. If not, create.
  const existing = await prisma.reaction.findUnique({
    where: { postId_emoji_sessionId: { postId, emoji, sessionId } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { postId, emoji, sessionId } });
  }

  // Return updated counts
  const reactions = await prisma.reaction.groupBy({
    by: ["emoji"],
    where: { postId },
    _count: { emoji: true },
  });
  const counts: Record<string, number> = {};
  for (const r of reactions) {
    counts[r.emoji] = r._count.emoji;
  }

  const response = NextResponse.json({ success: true, data: counts, toggled: !existing });
  if (isNew) {
    response.cookies.set("reaction_session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return response;
}
