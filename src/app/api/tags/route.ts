import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error } from "@/lib/api";
import { slugify } from "@/lib/utils";

export async function GET(_req: NextRequest) {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: true } },
    },
  });
  return success(tags);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json();
  const { name } = body;
  if (!name) return error("name is required");

  const slug = slugify(name);

  const existing = await prisma.tag.findUnique({ where: { slug } });
  if (existing) return error("Tag with this slug already exists", 409);

  const tag = await prisma.tag.create({
    data: { name, slug },
  });

  return created(tag);
}
