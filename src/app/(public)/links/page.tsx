import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الروابط | UAEpro",
  description: "روابط وخدمات وأدوات مفيدة",
};

const categoryLabels: Record<string, string> = {
  service: "خدمات",
  "mini-app": "تطبيقات مصغرة",
  tool: "أدوات",
  other: "أخرى",
};

const categoryOrder = ["service", "mini-app", "tool", "other"];

export default async function LinksPage() {
  let links: Awaited<ReturnType<typeof prisma.link.findMany>> = [];
  try {
    links = await prisma.link.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    // DB not available at build time
  }

  // Group by category
  const grouped: Record<string, typeof links> = {};
  for (const link of links) {
    const cat = link.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(link);
  }

  // Sort categories by predefined order
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const aIdx = categoryOrder.indexOf(a);
    const bIdx = categoryOrder.indexOf(b);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Page Header */}
      <h1
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          color: "var(--accent)",
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 40,
        }}
      >
        {"// "}الروابط
      </h1>

      {links.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            color: "var(--text-secondary)",
          }}
        >
          <p style={{ fontSize: 18 }}>لا توجد روابط حالياً</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {sortedCategories.map((category) => (
            <section key={category}>
              <h2
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 20,
                  fontFamily: "'IBM Plex Mono', monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {categoryLabels[category] || category}
              </h2>

              <div
                className="responsive-grid-links"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 16,
                }}
              >
                {grouped[category].map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "20px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      textDecoration: "none",
                      transition: "border-color 0.2s, transform 0.2s",
                    }}
                  >
                    {link.icon && (
                      <span
                        style={{
                          fontSize: 28,
                          flexShrink: 0,
                          width: 44,
                          height: 44,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "var(--bg-terminal)",
                          borderRadius: 10,
                          border: "1px solid var(--border)",
                        }}
                      >
                        {link.icon}
                      </span>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: "var(--text-primary)",
                          fontSize: 15,
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        {link.title}
                      </div>
                      {link.description && (
                        <div
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: 13,
                            lineHeight: 1.5,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {link.description}
                        </div>
                      )}
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--text-secondary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
