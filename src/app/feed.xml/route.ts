import { prisma } from "@/lib/db";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://uaepro.me";

  let posts: { title: string; slug: string; excerpt: string | null; publishedAt: Date | null }[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      select: { title: true, slug: true, excerpt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });
  } catch {
    // DB unavailable
  }

  const escapeXml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${encodeURIComponent(post.slug)}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${encodeURIComponent(post.slug)}</guid>
      <description>${escapeXml(post.excerpt || "")}</description>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : ""}</pubDate>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>UAEpro</title>
    <link>${siteUrl}</link>
    <description>مبرمج | صانع محتوى</description>
    <language>ar</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
