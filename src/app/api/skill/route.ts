import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import { join } from "path";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const skillPath = join(process.cwd(), "public", "skill", "uaepro-blog.md");
  let content = await readFile(skillPath, "utf-8");

  const siteUrl = process.env.NEXTAUTH_URL || "https://uaepro.me";

  // Get or generate API key for the skill
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  let apiKey = "";

  // Check if a key was just generated (passed as query param from the admin UI)
  const keyFromQuery = new URL(req.url).searchParams.get("key");
  if (keyFromQuery) {
    apiKey = keyFromQuery;
  }

  // Replace placeholders
  content = content.replace(/__SITE_URL__/g, siteUrl);
  content = content.replace(/__API_KEY__/g, apiKey || "<YOUR_API_KEY>");

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": "attachment; filename=SKILL.md",
    },
  });
}
