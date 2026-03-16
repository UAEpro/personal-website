import { prisma } from "@/lib/db";
import Navbar from "@/components/public/navbar";
import Footer from "@/components/public/footer";
import BackToTop from "@/components/public/back-to-top";

export const revalidate = 300;

async function getSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    return settings;
  } catch {
    return null;
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  const socialLinks = (settings?.socialLinks as {
    xUrl?: string;
    instagramUrl?: string;
    snapchatUrl?: string;
  }) || {};

  const socialToggles = (settings?.socialToggles as {
    x?: boolean;
    instagram?: boolean;
    snapchat?: boolean;
  }) || {};

  return (
    <div className="arabic-content">
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 64px)" }}>{children}</main>
      <Footer socialLinks={socialLinks} socialToggles={socialToggles} />
      <BackToTop />
    </div>
  );
}
