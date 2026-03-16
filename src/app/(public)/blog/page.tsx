import { prisma } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "المدونة | UAEpro",
  description: "مقالات ومواضيع متنوعة في البرمجة والتقنية",
};

const POSTS_PER_PAGE = 9;

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    tag?: string;
    search?: string;
  }>;
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const categoryFilter = params.category || null;
  const tagFilter = params.tag || null;
  const searchFilter = params.search || null;

  // Build where clause
  const where: Record<string, unknown> = {
    status: PostStatus.PUBLISHED,
  };

  if (categoryFilter) {
    where.category = { slug: categoryFilter };
  }

  if (tagFilter) {
    where.tags = { some: { tag: { slug: tagFilter } } };
  }

  if (searchFilter) {
    where.OR = [
      { title: { contains: searchFilter } },
      { excerpt: { contains: searchFilter } },
    ];
  }

  let posts: Array<{
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string | null;
    readingTime: number;
    publishedAt: Date | null;
    category: { name: string; slug: string } | null;
    tags: Array<{ tag: { name: string; slug: string } }>;
  }> = [];
  let total = 0;
  let categories: Array<{ id: number; name: string; slug: string; description: string | null }> = [];

  try {
    const result = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * POSTS_PER_PAGE,
        take: POSTS_PER_PAGE,
        orderBy: { publishedAt: "desc" },
        include: {
          category: { select: { name: true, slug: true } },
          tags: { include: { tag: { select: { name: true, slug: true } } } },
        },
      }),
      prisma.post.count({ where }),
      prisma.category.findMany({
        where: {
          posts: { some: { status: PostStatus.PUBLISHED } },
        },
        orderBy: { name: "asc" },
      }),
    ]);
    posts = result[0];
    total = result[1];
    categories = result[2];
  } catch {
    // DB not available at build time
  }

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  // Build URL for filters
  function buildUrl(overrides: Record<string, string | null>) {
    const base: Record<string, string> = {};
    if (categoryFilter && !("category" in overrides)) base.category = categoryFilter;
    if (tagFilter && !("tag" in overrides)) base.tag = tagFilter;
    if (searchFilter && !("search" in overrides)) base.search = searchFilter;

    const merged = { ...base, ...overrides };
    const queryParts: string[] = [];
    for (const [key, val] of Object.entries(merged)) {
      if (val) queryParts.push(`${key}=${encodeURIComponent(val)}`);
    }
    return `/blog${queryParts.length ? `?${queryParts.join("&")}` : ""}`;
  }

  const chipStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "6px 16px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    textDecoration: "none",
    border: "1px solid var(--border)",
    transition: "border-color 0.2s, background 0.2s",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Page Header */}
      <h1
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          color: "var(--accent)",
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 32,
        }}
      >
        {"// "}المدونة
      </h1>

      {/* Category Filter Chips */}
      {categories.length > 0 && (
        <div className="filter-chips" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
          <Link
            href={buildUrl({ category: null, page: null })}
            style={{
              ...chipStyle,
              background: !categoryFilter ? "var(--accent)" : "var(--bg-secondary)",
              color: !categoryFilter ? "#fff" : "var(--text-secondary)",
              borderColor: !categoryFilter ? "var(--accent)" : "var(--border)",
            }}
          >
            الكل
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildUrl({ category: cat.slug, page: null })}
              style={{
                ...chipStyle,
                background:
                  categoryFilter === cat.slug ? "var(--accent)" : "var(--bg-secondary)",
                color:
                  categoryFilter === cat.slug ? "#fff" : "var(--text-secondary)",
                borderColor:
                  categoryFilter === cat.slug ? "var(--accent)" : "var(--border)",
              }}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Active tag/search filters */}
      {(tagFilter || searchFilter) && (
        <div style={{ marginBottom: 24, display: "flex", gap: 10, alignItems: "center" }}>
          {tagFilter && (
            <span
              style={{
                ...chipStyle,
                background: "var(--bg-terminal)",
                color: "var(--accent)",
                borderColor: "var(--accent)",
              }}
            >
              وسم: {tagFilter}
              <Link
                href={buildUrl({ tag: null })}
                style={{
                  marginRight: 8,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
              >
                &times;
              </Link>
            </span>
          )}
          {searchFilter && (
            <span
              style={{
                ...chipStyle,
                background: "var(--bg-terminal)",
                color: "var(--accent)",
                borderColor: "var(--accent)",
              }}
            >
              بحث: {searchFilter}
              <Link
                href={buildUrl({ search: null })}
                style={{
                  marginRight: 8,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
              >
                &times;
              </Link>
            </span>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div
          className="responsive-grid-posts"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 24,
          }}
        >
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: "none" }}
            >
              <article
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "border-color 0.2s, transform 0.2s",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {post.coverImage && (
                  <div style={{ position: "relative", width: "100%", height: 200 }}>
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                  {post.category && (
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        color: "var(--accent)",
                        background: "rgba(249, 115, 22, 0.1)",
                        padding: "3px 10px",
                        borderRadius: 4,
                        fontWeight: 600,
                        marginBottom: 10,
                        alignSelf: "flex-start",
                      }}
                    >
                      {post.category.name}
                    </span>
                  )}
                  <h2
                    style={{
                      color: "var(--text-primary)",
                      fontSize: 17,
                      fontWeight: 600,
                      marginBottom: 8,
                      lineHeight: 1.5,
                    }}
                  >
                    {post.title}
                  </h2>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 14,
                      lineHeight: 1.6,
                      marginBottom: 16,
                      flex: 1,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {post.excerpt}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      color: "var(--text-secondary)",
                      fontSize: 12,
                      borderTop: "1px solid var(--border)",
                      paddingTop: 12,
                    }}
                  >
                    <span>{post.readingTime} دقائق قراءة</span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            color: "var(--text-secondary)",
          }}
        >
          <p style={{ fontSize: 18, marginBottom: 8 }}>لا توجد مقالات</p>
          <p style={{ fontSize: 14 }}>لم يتم العثور على مقالات تطابق البحث الحالي</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="pagination-container"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 48,
            flexWrap: "wrap",
          }}
        >
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              السابق
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildUrl({ page: String(p) })}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: p === page ? "var(--accent)" : "var(--border)",
                background: p === page ? "var(--accent)" : "var(--bg-secondary)",
                color: p === page ? "#fff" : "var(--text-secondary)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: p === page ? 600 : 400,
              }}
            >
              {p}
            </Link>
          ))}

          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              التالي
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
