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
  const categoryId = parseInt(id);
  if (isNaN(categoryId)) return error("Invalid ID");

  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existing) return error("Category not found", 404);

  const body = await req.json();
  const { name, description } = body;

  let slug = existing.slug;
  if (name && name !== existing.name) {
    slug = slugify(name);
    const conflict = await prisma.category.findUnique({ where: { slug } });
    if (conflict && conflict.id !== categoryId) return error("Slug already in use", 409);
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(name !== undefined && { name }),
      slug,
      ...(description !== undefined && { description }),
    },
  });

  return success(category);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const categoryId = parseInt(id);
  if (isNaN(categoryId)) return error("Invalid ID");

  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existing) return error("Category not found", 404);

  // Unlink posts first (set categoryId to null)
  await prisma.post.updateMany({
    where: { categoryId },
    data: { categoryId: null },
  });

  await prisma.category.delete({ where: { id: categoryId } });
  return success({ deleted: true });
}
