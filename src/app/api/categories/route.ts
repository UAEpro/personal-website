import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error } from "@/lib/api";
import { slugify } from "@/lib/utils";

export async function GET(_req: NextRequest) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: true } },
    },
  });
  return success(categories);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json();
  const { name, description } = body;
  if (!name) return error("name is required");

  const slug = slugify(name);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return error("Category with this slug already exists", 409);

  const category = await prisma.category.create({
    data: { name, slug, description: description || null },
  });

  return created(category);
}
