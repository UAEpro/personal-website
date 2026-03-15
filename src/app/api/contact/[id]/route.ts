import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const msgId = parseInt(id);
  if (isNaN(msgId)) return error("Invalid ID");

  const existing = await prisma.contactMessage.findUnique({ where: { id: msgId } });
  if (!existing) return error("Message not found", 404);

  const body = await req.json();
  const { isRead } = body;

  const message = await prisma.contactMessage.update({
    where: { id: msgId },
    data: {
      ...(isRead !== undefined && { isRead: Boolean(isRead) }),
    },
  });

  return success(message);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const msgId = parseInt(id);
  if (isNaN(msgId)) return error("Invalid ID");

  const existing = await prisma.contactMessage.findUnique({ where: { id: msgId } });
  if (!existing) return error("Message not found", 404);

  await prisma.contactMessage.delete({ where: { id: msgId } });
  return success({ deleted: true });
}
