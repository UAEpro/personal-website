import { prisma } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ShareButtons from "@/components/public/share-buttons";
import CommentSection from "@/components/public/comment-section";
import BlogContentStyles from "@/components/public/blog-content-styles";
import type { Metadata } from "next";
import ReadingProgress from "@/components/public/reading-progress";
import TableOfContents from "@/components/public/table-of-contents";
import FloatingShare from "@/components/public/floating-share";
import { addHeadingIds } from "@/lib/heading-ids";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  let post = null;
  try {
    post = await prisma.post.findUnique({
      where: { slug },
      select: {
        title: true,
        excerpt: true,
        seoTitle: true,
        seoDescription: true,
        ogImage: true,
        coverImage: true,
      },
    });
  } catch {
    // DB not available
  }

  if (!post) return { title: "غير موجود" };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const image = post.ogImage || post.coverImage;

  return {
    title: `${title} | UAEpro`,
    description,
    openGraph: {
      title,
      description: description || "",
      images: image ? [image] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || "",
      images: image ? [image] : [],
    },
  };
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  let post = null;
  try {
    post = await prisma.post.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
        author: { select: { name: true } },
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            authorName: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
  } catch {
    notFound();
  }

  if (!post || post.status !== PostStatus.PUBLISHED) {
    notFound();
  }

  // Related posts
  let relatedPosts: { id: number; title: string; slug: string; coverImage: string | null; readingTime: number; publishedAt: Date | null }[] = [];
  try {
    relatedPosts = await prisma.post.findMany({
      where: {
        id: { not: post.id },
        status: PostStatus.PUBLISHED,
        OR: [
          ...(post.categoryId ? [{ categoryId: post.categoryId }] : []),
          { tags: { some: { tagId: { in: post.tags.map((t) => t.tagId) } } } },
        ],
      },
      select: { id: true, title: true, slug: true, coverImage: true, readingTime: true, publishedAt: true },
      take: 3,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    // ignore
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://uaepro.me";
  const postUrl = `${siteUrl}/blog/${encodeURIComponent(post.slug)}`;

  const commentsForClient = post.comments.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  const { html: processedContent, headings } = addHeadingIds(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: { "@type": "Person", name: post.author?.name || "UAEpro" },
    description: post.excerpt || "",
    image: post.coverImage || undefined,
    url: postUrl,
  };

  return (
    <>
    <ReadingProgress />
    <FloatingShare url={postUrl} title={post.title} />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div className="blog-post-layout" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", display: "flex", gap: 40 }}>
      {headings.length >= 2 && <TableOfContents headings={headings} />}
      <article className="blog-post-article" style={{ flex: 1, minWidth: 0 }}>
      {/* Cover Image */}
      {post.coverImage && (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "clamp(200px, 40vw, 400px)",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 32,
          }}
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      )}

      {/* Category Badge */}
      {post.category && (
        <Link
          href={`/blog?category=${post.category.slug}`}
          style={{
            display: "inline-block",
            fontSize: 13,
            color: "var(--accent)",
            background: "color-mix(in srgb, var(--accent) 15%, transparent)",
            padding: "4px 12px",
            borderRadius: 4,
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: 16,
          }}
        >
          {post.category.name}
        </Link>
      )}

      {/* Title */}
      <h1
        style={{
          fontSize: "clamp(24px, 4vw, 36px)",
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1.4,
          marginBottom: 16,
        }}
      >
        {post.title}
      </h1>

      {/* Meta: reading time, date, author */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          color: "var(--text-secondary)",
          fontSize: 14,
          marginBottom: 24,
          paddingBottom: 24,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {post.author?.name && <span>{post.author.name}</span>}
        <span>{post.readingTime} دقائق قراءة</span>
        <span>{formatDate(post.publishedAt)}</span>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
          {post.tags.map((pt) => (
            <Link
              key={pt.tag.slug}
              href={`/blog?tag=${pt.tag.slug}`}
              style={{
                fontSize: 12,
                color: "var(--accent)",
                background: "var(--bg-terminal)",
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid var(--border)",
                textDecoration: "none",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              #{pt.tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Share Buttons */}
      <div style={{ marginBottom: 32 }}>
        <ShareButtons url={postUrl} title={post.title} />
      </div>

      {/* Content */}
      <div
        className="blog-content"
        style={{
          color: "var(--text-primary)",
          fontSize: 16,
          lineHeight: 2,
        }}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      {/* Share buttons at end */}
      <div
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
        }}
      >
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 12 }}>
          شارك هذه المقالة:
        </p>
        <ShareButtons url={postUrl} title={post.title} />
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} comments={commentsForClient} />

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
          <h3 style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--accent)", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
            {"// "}مقالات ذات صلة
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {relatedPosts.map((rp) => (
              <Link key={rp.id} href={`/blog/${rp.slug}`} style={{ textDecoration: "none" }}>
                <div className="hover-card" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                  {rp.coverImage && (
                    <div style={{ position: "relative", width: "100%", height: 120 }}>
                      <Image src={rp.coverImage} alt={rp.title} fill style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ padding: 14 }}>
                    <h4 style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 600, lineHeight: 1.5, marginBottom: 6 }}>{rp.title}</h4>
                    <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{rp.readingTime} دقائق قراءة</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Blog content styling */}
      <BlogContentStyles />
    </article>
    </div>
    </>
  );
}
