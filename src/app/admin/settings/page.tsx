import { prisma } from "@/lib/db";
import SettingsForm from "@/components/admin/settings-form";

async function getSettings() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, aboutContent: "" },
    update: {},
  });
  return settings;
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  const settingsData = {
    theme: settings.theme as { preset?: string; accent?: string },
    socialToggles: settings.socialToggles as { x?: boolean; instagram?: boolean; snapchat?: boolean },
    socialLinks: settings.socialLinks as {
      xUrl?: string;
      instagramUrl?: string;
      snapchatUrl?: string;
      instagramToken?: string;
    },
    seoDefaults: settings.seoDefaults as { title?: string; description?: string; ogImage?: string },
    aboutContent: settings.aboutContent,
    heroTagline: settings.heroTagline,
    apiKeyHash: settings.apiKeyHash,
  };

  return (
    <div>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 24,
        }}
      >
        الإعدادات
      </h1>
      <SettingsForm settings={settingsData} />
    </div>
  );
}
