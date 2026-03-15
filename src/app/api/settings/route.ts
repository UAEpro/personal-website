import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Fields that are safe to expose publicly (no tokens or hashed keys)
const PUBLIC_FIELDS = {
  theme: true,
  socialToggles: true,
  seoDefaults: true,
  aboutContent: true,
  heroTagline: true,
} as const;

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);

  // Ensure settings row exists
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, aboutContent: "" },
    update: {},
  });

  if (user) {
    // Admin gets full settings
    return success(settings);
  }

  // Public gets safe subset — omit apiKeyHash and socialLinks (may contain tokens)
  const publicSettings = {
    theme: settings.theme,
    socialToggles: settings.socialToggles,
    seoDefaults: settings.seoDefaults,
    aboutContent: settings.aboutContent,
    heroTagline: settings.heroTagline,
  };

  return success(publicSettings);
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json();
  const {
    theme,
    socialToggles,
    socialLinks,
    seoDefaults,
    aboutContent,
    heroTagline,
    regenerateApiKey,
  } = body;

  const updateData: Record<string, unknown> = {};
  if (theme !== undefined) updateData.theme = theme;
  if (socialToggles !== undefined) updateData.socialToggles = socialToggles;
  if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
  if (seoDefaults !== undefined) updateData.seoDefaults = seoDefaults;
  if (aboutContent !== undefined) updateData.aboutContent = aboutContent;
  if (heroTagline !== undefined) updateData.heroTagline = heroTagline;

  let plaintextKey: string | null = null;

  if (regenerateApiKey) {
    plaintextKey = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(plaintextKey, 12);
    updateData.apiKeyHash = hash;
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, aboutContent: "", ...updateData },
    update: updateData,
  });

  const updated = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  const response: Record<string, unknown> = { settings: updated };
  if (plaintextKey) {
    response.apiKey = plaintextKey;
    response.apiKeyNote = "Store this key securely — it will not be shown again.";
  }

  return success(response);
}
