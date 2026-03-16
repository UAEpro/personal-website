import { prisma } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://uaepro.me";

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/links`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  let posts: { slug: string; updatedAt: Date }[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    // DB unavailable during build
  }

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${encodeURIComponent(post.slug)}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...postPages];
}
