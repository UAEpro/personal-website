"use client";

import { useEffect, useState, useRef } from "react";

interface SocialFeedsProps {
  toggles: {
    x?: boolean;
    instagram?: boolean;
    snapchat?: boolean;
  };
  links: {
    xUrl?: string;
    instagramUrl?: string;
    snapchatUrl?: string;
  };
}

interface SnapStory {
  url: string;
  thumbnail: string;
  contentUrl: string;
  uploadDate: string;
  description: string;
}

interface SnapProfile {
  name: string;
  image: string | null;
  description: string;
  url: string;
}

/* ─── Twitter / X Embedded Timeline ─── */
function TwitterFeed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const username = url.replace(/\/$/, "").split("/").pop() || "";

  useEffect(() => {
    if (!username) return;

    const loadWidgets = () => {
      const win = window as unknown as Record<string, unknown>;
      if (win.twttr) {
        const twttr = win.twttr as { widgets?: { load: (el?: HTMLElement) => void } };
        twttr.widgets?.load(containerRef.current || undefined);
      }
    };

    const existingScript = document.getElementById("twitter-wjs");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "twitter-wjs";
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = loadWidgets;
      document.body.appendChild(script);
    } else {
      // Script already exists, just reload widgets
      loadWidgets();
    }
  }, [username]);

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-primary)">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <h3
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: "var(--text-primary)",
            fontSize: 16,
            fontWeight: 600,
            margin: 0,
          }}
        >
          X (Twitter)
        </h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginInlineStart: "auto",
            color: "var(--text-secondary)",
            fontSize: 13,
            textDecoration: "none",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          @{username} &#x2197;
        </a>
      </div>

      {/* Embedded Timeline */}
      <div
        ref={containerRef}
        style={{
          padding: "0 4px",
          minHeight: 400,
          maxHeight: 500,
          overflowY: "auto",
        }}
      >
        <a
          className="twitter-timeline"
          data-height="480"
          data-theme="dark"
          data-chrome="noheader nofooter noborders transparent"
          data-tweet-limit="3"
          href={`https://twitter.com/${username}`}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              color: "var(--text-secondary)",
              fontSize: 14,
              fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
            }}
          >
            جاري تحميل التغريدات...
          </div>
        </a>
      </div>
    </div>
  );
}

/* ─── Instagram Profile Card ─── */
function InstagramFeed({ url }: { url: string }) {
  const username = url
    .replace(/\/$/, "")
    .split("/")
    .filter(Boolean)
    .pop() || "";

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
        <h3
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: "var(--text-primary)",
            fontSize: 16,
            fontWeight: 600,
            margin: 0,
          }}
        >
          Instagram
        </h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginInlineStart: "auto",
            color: "var(--text-secondary)",
            fontSize: 13,
            textDecoration: "none",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          @{username} &#x2197;
        </a>
      </div>

      {/* Instagram-themed profile card */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        <div
          style={{
            margin: 16,
            padding: "48px 24px",
            borderRadius: 12,
            background:
              "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          {/* Instagram icon large */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </div>

          <div
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
            }}
          >
            @{username}
          </div>

          <div
            style={{
              color: "rgba(255,255,255,0.95)",
              fontSize: 15,
              fontWeight: 500,
              padding: "10px 24px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: 24,
              backdropFilter: "blur(10px)",
              fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
            }}
          >
            زيارة الحساب على Instagram &#x2197;
          </div>
        </div>
      </a>
    </div>
  );
}

/* ─── Snapchat Stories Carousel ─── */
function SnapchatStories({ url }: { url: string }) {
  const [stories, setStories] = useState<SnapStory[]>([]);
  const [profile, setProfile] = useState<SnapProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Extract username from URL like https://snapchat.com/@username or https://www.snapchat.com/add/username
  const username = url
    .replace(/\/$/, "")
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace("@", "") || "";

  useEffect(() => {
    if (!username) return;

    const fetchStories = async () => {
      try {
        const res = await fetch(
          `/api/snapchat?username=${encodeURIComponent(username)}`
        );
        const json = await res.json();
        if (json.success && json.data) {
          setStories(json.data.stories || []);
          setProfile(json.data.profile || null);
        } else {
          setFetchError(true);
        }
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [username]);

  const formatStoryDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return "الآن";
      if (diffHours < 24) return `${diffHours} س`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} ي`;
      return new Intl.DateTimeFormat("ar-SA", {
        month: "short",
        day: "numeric",
      }).format(date);
    } catch {
      return "";
    }
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -260, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  };

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFC00">
          <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.095-.034.185-.066.272-.093a.72.72 0 0 1 .115-.018c.249 0 .44.2.44.443 0 .199-.123.384-.313.472-.116.054-.25.097-.39.141l-.004.002c-.477.156-.783.308-.796.629-.006.147.08.295.196.442l.018.023c.349.46 1.036 1.1 1.632 1.369.18.08.377.198.377.456 0 .166-.1.346-.305.485-.472.323-1.235.422-1.518.467l-.037.006c-.064.01-.093.028-.105.07-.014.046-.007.115.007.195.017.095.038.191.062.29.024.096.05.194.067.268a.524.524 0 0 1-.105.484c-.168.192-.464.292-.84.292-.196 0-.409-.026-.626-.065-.298-.054-.632-.072-.982-.072-.327 0-.637.015-.883.08a3.567 3.567 0 0 0-.793.39c-.627.37-1.204.759-2.403.759h-.058c-1.2 0-1.777-.39-2.404-.76a3.568 3.568 0 0 0-.793-.39c-.247-.064-.556-.08-.883-.08-.35 0-.684.02-.981.073a4.876 4.876 0 0 1-.627.064c-.396 0-.68-.113-.836-.302a.52.52 0 0 1-.1-.475c.017-.075.042-.17.066-.267.024-.099.045-.196.063-.29.014-.08.02-.149.006-.196-.012-.042-.04-.06-.105-.07l-.037-.006c-.283-.045-1.046-.144-1.518-.467-.205-.139-.305-.319-.305-.485 0-.258.197-.376.377-.456.596-.27 1.283-.91 1.632-1.37l.018-.022c.116-.147.203-.295.196-.442-.013-.32-.319-.473-.796-.63l-.004-.001a2.853 2.853 0 0 1-.39-.14c-.19-.09-.313-.274-.313-.473 0-.243.19-.443.44-.443l.115.018c.087.027.177.06.272.093.263.094.622.23.922.214.198 0 .326-.045.401-.09a10.86 10.86 0 0 1-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C7.846 1.069 11.216.793 12.206.793" />
        </svg>
        <h3
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: "var(--text-primary)",
            fontSize: 16,
            fontWeight: 600,
            margin: 0,
          }}
        >
          Snapchat
        </h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginInlineStart: "auto",
            color: "var(--text-secondary)",
            fontSize: 13,
            textDecoration: "none",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          @{username} &#x2197;
        </a>
      </div>

      {/* Stories carousel */}
      <div style={{ position: "relative", padding: "0 8px" }}>
        {/* Scroll buttons */}
        {stories.length > 3 && (
          <>
            <button
              onClick={scrollLeft}
              aria-label="Scroll left"
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                opacity: 0.8,
              }}
            >
              &#x2039;
            </button>
            <button
              onClick={scrollRight}
              aria-label="Scroll right"
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                opacity: 0.8,
              }}
            >
              &#x203A;
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          style={{
            overflowX: "auto",
            display: "flex",
            gap: 12,
            padding: "16px 8px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Loading state */}
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                style={{
                  flexShrink: 0,
                  width: 120,
                  aspectRatio: "9/16",
                  borderRadius: 12,
                  background: "var(--bg-terminal)",
                  border: "2px solid var(--border)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}

          {/* Stories */}
          {!loading &&
            stories.length > 0 &&
            stories.map((story, i) => (
              <a
                key={`story-${i}`}
                href={story.url || url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flexShrink: 0,
                  width: 120,
                  aspectRatio: "9/16",
                  borderRadius: 12,
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                  border: "2px solid #FFFC00",
                  textDecoration: "none",
                  display: "block",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {/* Thumbnail */}
                {story.thumbnail ? (
                  <img
                    src={story.thumbnail}
                    alt={story.description || `Story ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      background:
                        "linear-gradient(135deg, #FFFC00 0%, #FF6B00 100%)",
                    }}
                  />
                )}

                {/* Bottom gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: 8,
                  }}
                >
                  <span
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: 11,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {formatStoryDate(story.uploadDate)}
                  </span>
                </div>
              </a>
            ))}

          {/* No stories / error state */}
          {!loading && stories.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "40px 24px",
                gap: 12,
              }}
            >
              {fetchError ? (
                <>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-secondary)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 14,
                      fontFamily:
                        "'IBM Plex Sans Arabic', system-ui, sans-serif",
                      textAlign: "center",
                    }}
                  >
                    تعذر تحميل القصص
                  </span>
                </>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFFC00" opacity="0.5">
                    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.095-.034.185-.066.272-.093a.72.72 0 0 1 .115-.018c.249 0 .44.2.44.443 0 .199-.123.384-.313.472-.116.054-.25.097-.39.141l-.004.002c-.477.156-.783.308-.796.629-.006.147.08.295.196.442l.018.023c.349.46 1.036 1.1 1.632 1.369.18.08.377.198.377.456 0 .166-.1.346-.305.485-.472.323-1.235.422-1.518.467l-.037.006c-.064.01-.093.028-.105.07-.014.046-.007.115.007.195.017.095.038.191.062.29.024.096.05.194.067.268a.524.524 0 0 1-.105.484c-.168.192-.464.292-.84.292-.196 0-.409-.026-.626-.065-.298-.054-.632-.072-.982-.072-.327 0-.637.015-.883.08a3.567 3.567 0 0 0-.793.39c-.627.37-1.204.759-2.403.759h-.058c-1.2 0-1.777-.39-2.404-.76a3.568 3.568 0 0 0-.793-.39c-.247-.064-.556-.08-.883-.08-.35 0-.684.02-.981.073a4.876 4.876 0 0 1-.627.064c-.396 0-.68-.113-.836-.302a.52.52 0 0 1-.1-.475c.017-.075.042-.17.066-.267.024-.099.045-.196.063-.29.014-.08.02-.149.006-.196-.012-.042-.04-.06-.105-.07l-.037-.006c-.283-.045-1.046-.144-1.518-.467-.205-.139-.305-.319-.305-.485 0-.258.197-.376.377-.456.596-.27 1.283-.91 1.632-1.37l.018-.022c.116-.147.203-.295.196-.442-.013-.32-.319-.473-.796-.63l-.004-.001a2.853 2.853 0 0 1-.39-.14c-.19-.09-.313-.274-.313-.473 0-.243.19-.443.44-.443l.115.018c.087.027.177.06.272.093.263.094.622.23.922.214.198 0 .326-.045.401-.09a10.86 10.86 0 0 1-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C7.846 1.069 11.216.793 12.206.793" />
                  </svg>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 14,
                      fontFamily:
                        "'IBM Plex Sans Arabic', system-ui, sans-serif",
                      textAlign: "center",
                    }}
                  >
                    لا توجد قصص حاليا
                  </span>
                </>
              )}

              {/* Always show a link to the profile */}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 8,
                  color: "#FFFC00",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
                  padding: "8px 20px",
                  borderRadius: 20,
                  background: "rgba(255, 252, 0, 0.1)",
                  border: "1px solid rgba(255, 252, 0, 0.25)",
                  transition: "background 0.2s",
                }}
              >
                تابعنا على Snapchat &#x2197;
              </a>
            </div>
          )}
        </div>
      </div>

      {/* CSS for hiding scrollbar and pulse animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `,
        }}
      />
    </div>
  );
}

/* ─── Main Social Feeds Component ─── */
export default function SocialFeeds({ toggles, links }: SocialFeedsProps) {
  const hasAny = toggles.x || toggles.instagram || toggles.snapchat;

  if (!hasAny) return null;

  // Count active feeds for grid sizing
  const activeCount = [
    toggles.x && links.xUrl,
    toggles.instagram && links.instagramUrl,
    toggles.snapchat && links.snapchatUrl,
  ].filter(Boolean).length;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            activeCount === 1
              ? "1fr"
              : activeCount === 2
                ? "repeat(2, 1fr)"
                : "repeat(3, 1fr)",
          gap: 24,
        }}
      >
        {/* X / Twitter */}
        {toggles.x && links.xUrl && <TwitterFeed url={links.xUrl} />}

        {/* Instagram */}
        {toggles.instagram && links.instagramUrl && (
          <InstagramFeed url={links.instagramUrl} />
        )}

        {/* Snapchat */}
        {toggles.snapchat && links.snapchatUrl && (
          <SnapchatStories url={links.snapchatUrl} />
        )}
      </div>

      {/* Responsive grid override for mobile */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 900px) {
              /* Force single column on tablets */
              div[style*="grid-template-columns: repeat(3"] {
                grid-template-columns: 1fr !important;
              }
              div[style*="grid-template-columns: repeat(2"] {
                grid-template-columns: 1fr !important;
              }
            }
          `,
        }}
      />
    </>
  );
}
