import { prisma } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import Hero from "@/components/public/hero";
import ContactForm from "@/components/public/contact-form";
import SocialFeeds from "@/components/public/social-feeds";
import Link from "next/link";
import Image from "next/image";
import ScrollAnimator from "@/components/public/scroll-animator";
import NewsletterForm from "@/components/public/newsletter-form";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [settings, posts, projects, skills, links] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: 1 } }),
      prisma.post.findMany({
        where: { status: PostStatus.PUBLISHED },
        orderBy: { publishedAt: "desc" },
        take: 3,
        include: {
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.project.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.skill.findMany({
        orderBy: [{ sortOrder: "asc" }],
      }),
      prisma.link.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
    ]);

    return { settings, posts, projects, skills, links };
  } catch (e) {
    console.error("getData error:", e);
    return { settings: null, posts: [], projects: [], skills: [], links: [] };
  }
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        color: "var(--accent)",
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 32,
      }}
    >
      {"// "}
      {title}
    </h2>
  );
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function HomePage() {
  const { settings, posts, projects, skills, links } = await getData();

  const tagline = settings?.heroTagline || "مبرمج | صانع محتوى | قيمر";
  const aboutContent = settings?.aboutContent || "";

  const socialToggles = (settings?.socialToggles as {
    x?: boolean;
    instagram?: boolean;
    snapchat?: boolean;
    github?: boolean;
  }) || {};

  const socialLinks = (settings?.socialLinks as {
    xUrl?: string;
    instagramUrl?: string;
    snapchatUrl?: string;
    githubUrl?: string;
  }) || {};

  const socialOrder = (settings?.socialOrder as string[]) || ["x", "instagram", "snapchat", "github"];

  // Group skills by category
  const skillsByCategory: Record<string, typeof skills> = {};
  for (const skill of skills) {
    const cat = skill.category || "other";
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat].push(skill);
  }

  const categoryLabels: Record<string, string> = {
    frontend: "الواجهة الأمامية",
    backend: "الواجهة الخلفية",
    devops: "DevOps",
    tools: "أدوات",
    languages: "لغات البرمجة",
    frameworks: "أُطر العمل",
    databases: "قواعد البيانات",
    other: "أخرى",
  };

  const sectionStyle: React.CSSProperties = {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "64px 24px",
  };

  const sectionClassName = "section-container";

  const hasAnySocialToggle = socialToggles.x || socialToggles.instagram || socialToggles.snapchat || socialToggles.github;

  return (
    <>
      {/* Scroll reveal animator */}
      <ScrollAnimator />

      {/* 1. Hero */}
      <Hero tagline={tagline} />

      {/* 2. About Me */}
      {aboutContent && (
        <section className={sectionClassName} style={sectionStyle}>
          <SectionHeading title="عني" />
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "32px",
              color: "var(--text-primary)",
              fontSize: 16,
              lineHeight: 1.8,
            }}
            dangerouslySetInnerHTML={{ __html: aboutContent }}
          />
        </section>
      )}

      {/* 3. Latest Blog Posts */}
      {posts.length > 0 && (
        <section className={sectionClassName} style={sectionStyle}>
          <SectionHeading title="آخر المقالات" />
          <div
            className="responsive-grid-posts"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: "none" }}
              >
                <article className="hover-card"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  {post.coverImage && (
                    <div style={{ position: "relative", width: "100%", height: 180 }}>
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div style={{ padding: 20 }}>
                    {post.category && (
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 12,
                          color: "var(--accent)",
                          background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                          padding: "4px 10px",
                          borderRadius: 4,
                          fontWeight: 600,
                          marginBottom: 10,
                        }}
                      >
                        {post.category.name}
                      </span>
                    )}
                    <h3
                      style={{
                        color: "var(--text-primary)",
                        fontSize: 18,
                        fontWeight: 600,
                        marginBottom: 8,
                        lineHeight: 1.5,
                      }}
                    >
                      {post.title}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        color: "var(--text-secondary)",
                        fontSize: 13,
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
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link
              href="/blog"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {"عرض جميع المقالات ->"}
            </Link>
          </div>
        </section>
      )}

      {/* 4. Social Feeds */}
      {hasAnySocialToggle && (
        <section className={sectionClassName} style={sectionStyle}>
          <SectionHeading title="تابعني" />
          <SocialFeeds toggles={socialToggles} links={socialLinks} order={socialOrder} />
        </section>
      )}

      {/* 5. Projects */}
      {projects.length > 0 && (
        <section className={sectionClassName} style={sectionStyle}>
          <SectionHeading title="المشاريع" />
          <div
            className="responsive-grid-projects"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {projects.map((project) => (
              <div
                key={project.id}
                className="hover-card"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    color: "var(--text-primary)",
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {project.title} &#x2197;
                    </a>
                  ) : (
                    project.title
                  )}
                </h3>
                {project.description && (
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 14,
                      lineHeight: 1.7,
                      marginBottom: 16,
                    }}
                  >
                    {project.description}
                  </p>
                )}
                {project.techStack && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {project.techStack.split(",").map((tech, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 12,
                          color: "var(--accent)",
                          background: "var(--bg-terminal)",
                          padding: "4px 10px",
                          borderRadius: 4,
                          border: "1px solid var(--border)",
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Skills */}
      {skills.length > 0 && (
        <section className={sectionClassName} style={sectionStyle}>
          <SectionHeading title="المهارات" />
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category}>
                <h3
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 12,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {categoryLabels[category] || category}
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {categorySkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="skill-pill"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        borderRadius: 20,
                        color: "var(--text-primary)",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {skill.icon && <span>{skill.icon}</span>}
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Links / Services */}
      {links.length > 0 && (
        <section className={sectionClassName} style={sectionStyle}>
          <SectionHeading title="روابط وخدمات" />
          <div
            className="responsive-grid-links"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "20px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  textDecoration: "none",
                }}
              >
                {link.icon && (
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{link.icon}</span>
                )}
                <div>
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
                      }}
                    >
                      {link.description}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 8. Newsletter */}
      <section className={sectionClassName} style={sectionStyle}>
        <SectionHeading title="النشرة البريدية" />
        <div style={{ maxWidth: 500 }}>
          <NewsletterForm />
        </div>
      </section>

      {/* 9. Contact Form */}
      <section id="contact" className={sectionClassName} style={sectionStyle}>
        <SectionHeading title="تواصل معي" />
        <ContactForm />
      </section>
    </>
  );
}
