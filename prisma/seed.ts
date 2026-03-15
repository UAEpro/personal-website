import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!email || !passwordHash) {
    const hash = await bcrypt.hash("admin123", 12);
    await prisma.user.upsert({
      where: { email: "admin@uaepro.me" },
      update: {},
      create: { email: "admin@uaepro.me", passwordHash: hash, name: "UAEpro" },
    });
    console.log("Created default admin user (admin@uaepro.me / admin123)");
  } else {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash, name: "UAEpro" },
    });
    console.log(`Created admin user: ${email}`);
  }

  const apiKey = randomBytes(32).toString("hex");
  const apiKeyHash = await bcrypt.hash(apiKey, 12);

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      theme: { preset: "carbon-orange", accent: "#f97316" },
      socialToggles: { x: false, instagram: false, snapchat: false },
      socialLinks: { xUrl: "", instagramUrl: "", snapchatUrl: "", instagramToken: "" },
      seoDefaults: { title: "UAEpro", description: "مبرمج | صانع محتوى | قيمر", ogImage: "" },
      aboutContent: "",
      heroTagline: "مبرمج | صانع محتوى | قيمر",
      apiKeyHash,
    },
  });

  console.log(`SiteSettings created. API Key (save this!): ${apiKey}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
