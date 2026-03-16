import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getThemeCSS } from "@/lib/theme";
import Providers from "@/components/shared/providers";
import "./globals.css";

async function getSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    return settings;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const seo = (settings?.seoDefaults as { title?: string; description?: string; ogImage?: string }) || {};
  return {
    title: seo.title || "UAEpro",
    description: seo.description || "مبرمج | صانع محتوى | قيمر",
    openGraph: {
      title: seo.title || "UAEpro",
      description: seo.description || "",
      images: seo.ogImage ? [seo.ogImage] : [],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const theme = (settings?.theme as { preset?: string; accent?: string }) || {};
  const themeCSS = getThemeCSS(theme);

  return (
    <html lang="ar" dir="rtl">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" type="application/rss+xml" title="UAEpro RSS" href="/feed.xml" />
      </head>
      <body className="antialiased">
        <div style={{ overflowX: "hidden", width: "100%", position: "relative" }}>
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
