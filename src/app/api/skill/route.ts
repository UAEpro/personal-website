import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Read the skill template
  const skillPath = join(process.cwd(), "public", "skill", "uaepro-blog.md");
  const content = await readFile(skillPath, "utf-8");

  // Replace placeholder with actual URL
  const siteUrl = process.env.NEXTAUTH_URL || "https://uaepro.me";
  const filled = content.replace(/\$\{UAEPRO_API_URL\}/g, siteUrl);

  return new Response(filled, {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": "attachment; filename=uaepro-blog.md",
    },
  });
}
