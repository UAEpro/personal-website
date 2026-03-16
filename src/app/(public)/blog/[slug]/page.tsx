import { prisma } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ShareButtons from "@/components/public/share-buttons";
import CommentSection from "@/components/public/comment-section";
import BlogContentStyles from "@/components/public/blog-content-styles";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
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
  const { slug } = await params;

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://uaepro.me";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  const commentsForClient = post.comments.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <article className="blog-post-article" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
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
        dangerouslySetInnerHTML={{ __html: post.content }}
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

      {/* Blog content styling */}
      <BlogContentStyles />
    </article>
  );
}
