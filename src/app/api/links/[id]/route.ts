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
  const linkId = parseInt(id);
  if (isNaN(linkId)) return error("Invalid ID");

  const existing = await prisma.link.findUnique({ where: { id: linkId } });
  if (!existing) return error("Link not found", 404);

  const body = await req.json();
  const { title, description, url, icon, category, isActive, sortOrder } = body;

  const link = await prisma.link.update({
    where: { id: linkId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(url !== undefined && { url }),
      ...(icon !== undefined && { icon }),
      ...(category !== undefined && { category }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
    },
  });

  return success(link);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const linkId = parseInt(id);
  if (isNaN(linkId)) return error("Invalid ID");

  const existing = await prisma.link.findUnique({ where: { id: linkId } });
  if (!existing) return error("Link not found", 404);

  await prisma.link.delete({ where: { id: linkId } });
  return success({ deleted: true });
}
