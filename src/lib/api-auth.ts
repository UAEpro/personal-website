import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "./auth";
import { prisma } from "./db";
import { NextRequest } from "next/server";

export async function requireAuth(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user) return session.user;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const key = authHeader.slice(7);
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (settings?.apiKeyHash) {
      const valid = await bcrypt.compare(key, settings.apiKeyHash);
      if (valid) return { id: "api", email: "api@uaepro.me", name: "API" };
    }
  }

  return null;
}
