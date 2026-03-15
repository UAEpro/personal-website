import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error } from "@/lib/api";

export async function GET(_req: NextRequest) {
  const skills = await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  // Group by category
  const grouped = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return success(grouped);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json();
  const { name, icon, category, sortOrder } = body;

  if (!name) return error("name is required");

  const skill = await prisma.skill.create({
    data: {
      name,
      icon: icon || null,
      category: category || "other",
      sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
    },
  });

  return created(skill);
}
