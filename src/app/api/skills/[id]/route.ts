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
  const skillId = parseInt(id);
  if (isNaN(skillId)) return error("Invalid ID");

  const existing = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!existing) return error("Skill not found", 404);

  const body = await req.json();
  const { name, icon, category, sortOrder } = body;

  const skill = await prisma.skill.update({
    where: { id: skillId },
    data: {
      ...(name !== undefined && { name }),
      ...(icon !== undefined && { icon }),
      ...(category !== undefined && { category }),
      ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
    },
  });

  return success(skill);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const skillId = parseInt(id);
  if (isNaN(skillId)) return error("Invalid ID");

  const existing = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!existing) return error("Skill not found", 404);

  await prisma.skill.delete({ where: { id: skillId } });
  return success({ deleted: true });
}
