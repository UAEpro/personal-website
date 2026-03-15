import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";
import { slugify } from "@/lib/utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const tagId = parseInt(id);
  if (isNaN(tagId)) return error("Invalid ID");

  const existing = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!existing) return error("Tag not found", 404);

  const body = await req.json();
  const { name } = body;

  let slug = existing.slug;
  if (name && name !== existing.name) {
    slug = slugify(name);
    const conflict = await prisma.tag.findUnique({ where: { slug } });
    if (conflict && conflict.id !== tagId) return error("Slug already in use", 409);
  }

  const tag = await prisma.tag.update({
    where: { id: tagId },
    data: {
      ...(name !== undefined && { name }),
      slug,
    },
  });

  return success(tag);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const tagId = parseInt(id);
  if (isNaN(tagId)) return error("Invalid ID");

  const existing = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!existing) return error("Tag not found", 404);

  await prisma.tag.delete({ where: { id: tagId } });
  return success({ deleted: true });
}
