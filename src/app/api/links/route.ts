import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error } from "@/lib/api";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);

  const links = await prisma.link.findMany({
    where: user ? {} : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return success(links);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json();
  const { title, description, url, icon, category, isActive, sortOrder } = body;

  if (!title || !url) return error("title and url are required");

  const link = await prisma.link.create({
    data: {
      title,
      description: description || null,
      url,
      icon: icon || null,
      category: category || "other",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
    },
  });

  return created(link);
}
