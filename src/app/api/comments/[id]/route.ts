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
  const commentId = parseInt(id);
  if (isNaN(commentId)) return error("Invalid ID");

  const existing = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!existing) return error("Comment not found", 404);

  const body = await req.json();
  const { isApproved } = body;

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      ...(isApproved !== undefined && { isApproved: Boolean(isApproved) }),
    },
  });

  return success(comment);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const commentId = parseInt(id);
  if (isNaN(commentId)) return error("Invalid ID");

  const existing = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!existing) return error("Comment not found", 404);

  await prisma.comment.delete({ where: { id: commentId } });
  return success({ deleted: true });
}
