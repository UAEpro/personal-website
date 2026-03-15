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
  const projectId = parseInt(id);
  if (isNaN(projectId)) return error("Invalid ID");

  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing) return error("Project not found", 404);

  const body = await req.json();
  const { title, description, techStack, url, image, isActive, sortOrder } = body;

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(techStack !== undefined && { techStack }),
      ...(url !== undefined && { url }),
      ...(image !== undefined && { image }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
    },
  });

  return success(project);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const projectId = parseInt(id);
  if (isNaN(projectId)) return error("Invalid ID");

  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing) return error("Project not found", 404);

  await prisma.project.delete({ where: { id: projectId } });
  return success({ deleted: true });
}
