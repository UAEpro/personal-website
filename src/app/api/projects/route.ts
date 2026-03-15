import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error } from "@/lib/api";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);

  const projects = await prisma.project.findMany({
    where: user ? {} : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return success(projects);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json();
  const { title, description, techStack, url, image, isActive, sortOrder } = body;

  if (!title) return error("title is required");

  const project = await prisma.project.create({
    data: {
      title,
      description: description || null,
      techStack: techStack || null,
      url: url || null,
      image: image || null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
    },
  });

  return created(project);
}
