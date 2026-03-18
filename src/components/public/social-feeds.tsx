"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface SocialFeedsProps {
  toggles: {
    x?: boolean;
    instagram?: boolean;
    snapchat?: boolean;
    github?: boolean;
  };
  links: {
    xUrl?: string;
    instagramUrl?: string;
    snapchatUrl?: string;
    githubUrl?: string;
  };
  order?: string[];
}

interface SnapItem {
  thumbnail: string;
  contentUrl: string;
  uploadDate: string;
  mediaType: "image" | "video";
  link?: string;
}

interface HighlightGroup {
  title: string;
  thumbnail: string;
  snaps: SnapItem[];
}

/* ─── Tweet type ─── */
interface Tweet {
  id: string;
  text: string;
  createdAt: string;
  user: { name: string; username: string; avatar: string };
  likes: number;
  retweets: number;
  media?: { url: string; type: string }[];
}

/* ─── Arabic relative time ─── */
function relativeTimeAr(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "الآن";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} د`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} س`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} ي`;
  const diffMon = Math.floor(diffDay / 30);
  if (diffMon < 12) return `${diffMon} ش`;
  return `${Math.floor(diffMon / 12)} سنة`;
}

/* ─── Twitter / X Server-Side Feed ─── */
function TwitterFeed({ url }: { url: string }) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const username = url
    .replace(/\/$/, "")
    .replace(/https?:\/\/(www\.)?(x\.com|twitter\.com)\/?/, "")
    .split("/")[0] || "";

  useEffect(() => {
    if (!username) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch(`/api/twitter?username=${encodeURIComponent(username)}`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data) => {
        if (data.tweets?.length) {
          setTweets(data.tweets);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
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

      {/* Tweet List */}
      <div
        style={{
          maxHeight: 450,
          overflowY: "auto",
          padding: "8px 0",
        }}
      >
        {/* Loading skeleton */}
        {loading &&
          [0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--bg-primary)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      width: "40%",
                      height: 12,
                      borderRadius: 4,
                      background: "var(--bg-primary)",
                      marginBottom: 6,
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                  <div
                    style={{
                      width: "25%",
                      height: 10,
                      borderRadius: 4,
                      background: "var(--bg-primary)",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  width: "90%",
                  height: 12,
                  borderRadius: 4,
                  background: "var(--bg-primary)",
                  marginBottom: 6,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  width: "70%",
                  height: 12,
                  borderRadius: 4,
                  background: "var(--bg-primary)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
          ))}

        {/* Error state */}
        {!loading && error && (
          <div style={{ padding: 24, textAlign: "center" }}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
                fontSize: 14,
                fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
              }}
            >
              عرض التغريدات على X &#x2197;
            </a>
          </div>
        )}

        {/* Tweet cards */}
        {!loading &&
          tweets.map((tweet) => (
            <a
              key={tweet.id}
              href={`https://x.com/${tweet.user.username}/status/${tweet.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "14px 20px",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none",
                color: "inherit",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {/* User row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                {tweet.user.avatar ? (
                  <img
                    src={tweet.user.avatar}
                    alt=""
                    width={36}
                    height={36}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--bg-primary)",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      color: "var(--text-primary)",
                      fontWeight: 600,
                      fontSize: 14,
                      fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
                    }}
                  >
                    {tweet.user.name}
                  </span>{" "}
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 13,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    @{tweet.user.username}
                  </span>{" "}
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 12,
                    }}
                  >
                    &middot; {relativeTimeAr(tweet.createdAt)}
                  </span>
                </div>
              </div>

              {/* Tweet text */}
              <p
                dir="auto"
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--text-primary)",
                  fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {tweet.text}
              </p>

              {/* Media */}
              {tweet.media?.[0] && (
                <div
                  style={{
                    marginTop: 10,
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                  }}
                >
                  <img
                    src={tweet.media[0].url}
                    alt=""
                    style={{
                      width: "100%",
                      maxHeight: 220,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              )}

              {/* Engagement */}
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  marginTop: 10,
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {tweet.likes > 0 ? tweet.likes.toLocaleString() : ""}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                  {tweet.retweets > 0 ? tweet.retweets.toLocaleString() : ""}
                </span>
              </div>
            </a>
          ))}
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.15; }
        }
      `}</style>
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

/* ─── Snapchat Story Viewer Modal (Instagram/Snapchat style) ─── */
function StoryViewer({
  snaps,
  initialIndex,
  groupTitle,
  onClose,
}: {
  snaps: SnapItem[];
  initialIndex: number;
  groupTitle?: string;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const snap = snaps[currentIndex];
  const isVideo = snap?.mediaType === "video";
  const IMAGE_DURATION = 5000; // 5 seconds for images

  const goNext = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setCurrentIndex((i) => {
      if (i < snaps.length - 1) return i + 1;
      onClose();
      return i;
    });
    setProgress(0);
  }, [snaps.length, onClose]);

  const goPrev = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setCurrentIndex((i) => (i > 0 ? i - 1 : 0));
    setProgress(0);
  }, []);

  // Image auto-advance timer
  useEffect(() => {
    if (!snap || isVideo) return;
    setProgress(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / IMAGE_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        goNext();
      }
    }, 50);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, snap, isVideo, goNext]);

  // Video progress tracking
  const handleVideoTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (v && v.duration) setProgress(v.currentTime / v.duration);
  }, []);

  const handleVideoEnded = useCallback(() => {
    goNext();
  }, [goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goPrev();
      if (e.key === "ArrowLeft") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Tap handler: left half = next, right half = prev (RTL)
  // Ignore clicks that were part of a drag
  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragYRef.current > 5) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      goNext();
    } else {
      goPrev();
    }
  }, [goNext, goPrev]);

  // Swipe/drag down to close (touch + mouse)
  const dragStartRef = useRef<{ y: number } | null>(null);
  const dragYRef = useRef(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const applyDrag = useCallback((dy: number) => {
    if (!frameRef.current) return;
    dragYRef.current = dy;
    frameRef.current.style.transform = `translateY(${dy}px) scale(${Math.max(1 - dy / 1000, 0.92)})`;
    frameRef.current.style.transition = "none";
  }, []);

  const releaseDrag = useCallback(() => {
    if (!frameRef.current) return;
    if (dragYRef.current > 100) {
      onClose();
    } else {
      frameRef.current.style.transform = "";
      frameRef.current.style.transition = "transform 0.3s ease";
    }
    dragYRef.current = 0;
    dragStartRef.current = null;
    isDraggingRef.current = false;
  }, [onClose]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartRef.current = { y: e.touches[0].clientY };
  }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragStartRef.current) return;
    const dy = Math.max(0, e.touches[0].clientY - dragStartRef.current.y);
    applyDrag(dy);
  }, [applyDrag]);
  const handleTouchEnd = useCallback(() => {
    releaseDrag();
  }, [releaseDrag]);

  // Mouse handlers (desktop drag down)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartRef.current = { y: e.clientY };
    isDraggingRef.current = true;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !dragStartRef.current) return;
      const dy = Math.max(0, e.clientY - dragStartRef.current.y);
      applyDrag(dy);
    };
    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      releaseDrag();
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [applyDrag, releaseDrag]);

  if (!snap) return null;

  return (
    <div
      className="story-viewer-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Story frame */}
      <div
        ref={frameRef}
        className="story-viewer-frame"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          height: "90vh",
          aspectRatio: "9 / 16",
          maxWidth: "90vw",
          borderRadius: 16,
          overflow: "hidden",
          background: "#000",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Blurred background fill */}
        <div style={{
          position: "absolute",
          inset: -20,
          backgroundImage: `url(${snap.thumbnail || snap.contentUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(30px) brightness(0.4)",
          zIndex: 0,
        }} />

        {/* Progress bars */}
        <div style={{
          position: "absolute",
          top: 8,
          left: 8,
          right: 8,
          display: "flex",
          gap: 3,
          zIndex: 10,
        }}>
          {snaps.map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.3)",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                borderRadius: 2,
                background: "white",
                width: i < currentIndex ? "100%" : i === currentIndex ? `${progress * 100}%` : "0%",
                transition: i === currentIndex ? "none" : "width 0.2s",
              }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{
          position: "absolute",
          top: 18,
          left: 12,
          right: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}>
          <div style={{
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
            maxWidth: "60%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {groupTitle || ""}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              {currentIndex + 1}/{snaps.length}
            </span>
            <button
              className="story-viewer-close"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                background: "rgba(0,0,0,0.4)",
                color: "white",
                fontSize: 22,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content (tap to navigate, drag down to close) */}
        <div
          className="story-viewer-content"
          onClick={handleContentClick}
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            userSelect: "none",
            zIndex: 1,
          }}
        >
          {isVideo ? (
            <video
              ref={videoRef}
              key={snap.contentUrl}
              src={snap.contentUrl}
              autoPlay
              playsInline
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <img
              key={snap.contentUrl}
              src={snap.contentUrl || snap.thumbnail}
              alt="Story"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </div>

        {/* Link attachment */}
        {snap.link && (
          <a
            href={snap.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              background: "rgba(255, 255, 255, 0.95)",
              color: "#000",
              borderRadius: 24,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {(() => {
              try {
                return new URL(snap.link!).hostname.replace("www.", "");
              } catch {
                return "فتح الرابط";
              }
            })()}
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── Story Carousel Row (for active stories - individual snaps) ─── */
function StoryCarouselRow({
  items,
  onItemClick,
  emptyMessage,
  loading,
  fetchError,
  profileUrl,
}: {
  items: SnapItem[];
  onItemClick: (index: number) => void;
  emptyMessage: string;
  loading: boolean;
  fetchError: boolean;
  profileUrl: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const formatStoryDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return "\u0627\u0644\u0622\u0646";
      if (diffHours < 24) return `${diffHours} \u0633`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} \u064A`;
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
    <div style={{ position: "relative", padding: "0 8px" }}>
      {items.length > 3 && (
        <>
          <button
            className="snap-scroll-btn"
            onClick={scrollLeft}
            aria-label="Scroll left"
            style={{
              position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
              zIndex: 2, width: 32, height: 32, borderRadius: "50%",
              border: "1px solid var(--border)", background: "var(--bg-secondary)",
              color: "var(--text-primary)", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 16, opacity: 0.8,
            }}
          >
            &#x2039;
          </button>
          <button
            className="snap-scroll-btn"
            onClick={scrollRight}
            aria-label="Scroll right"
            style={{
              position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
              zIndex: 2, width: 32, height: 32, borderRadius: "50%",
              border: "1px solid var(--border)", background: "var(--bg-secondary)",
              color: "var(--text-primary)", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 16, opacity: 0.8,
            }}
          >
            &#x203A;
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="snap-stories-scroll"
        style={{
          overflowX: "auto", display: "flex", gap: 12, padding: "16px 8px",
          scrollbarWidth: "none", msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              style={{
                flexShrink: 0, width: 120, aspectRatio: "9/16", borderRadius: 12,
                background: "var(--bg-terminal)", border: "2px solid var(--border)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}

        {!loading &&
          items.length > 0 &&
          items.map((story, i) => (
            <button
              key={`story-${i}`}
              className="snap-story-item"
              onClick={() => onItemClick(i)}
              style={{
                flexShrink: 0, width: 120, aspectRatio: "9/16", borderRadius: 12,
                overflow: "hidden", position: "relative", cursor: "pointer",
                border: "2px solid #FFFC00", textDecoration: "none", display: "block",
                transition: "transform 0.2s, box-shadow 0.2s",
                background: "transparent", padding: 0,
              }}
            >
              {story.thumbnail ? (
                <img
                  src={story.thumbnail}
                  alt={`Story ${i + 1}`}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    position: "absolute", top: 0, left: 0,
                  }}
                  loading="lazy"
                />
              ) : (
                <div style={{
                  width: "100%", height: "100%", position: "absolute", top: 0, left: 0,
                  background: "linear-gradient(135deg, #FFFC00 0%, #FF6B00 100%)",
                }} />
              )}
              {story.mediaType === "video" && (
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)", width: 36, height: 36,
                  borderRadius: "50%", background: "rgba(0,0,0,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1,
                }}>
                  <div style={{
                    width: 0, height: 0, borderTop: "8px solid transparent",
                    borderBottom: "8px solid transparent", borderLeft: "14px solid white",
                    marginLeft: 3,
                  }} />
                </div>
              )}
              {story.link && (
                <div style={{
                  position: "absolute", top: 6, right: 6, zIndex: 2,
                  width: 24, height: 24, borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </div>
              )}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
                background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                display: "flex", alignItems: "flex-end", padding: 8,
              }}>
                <span style={{
                  color: "rgba(255,255,255,0.9)", fontSize: 11,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  {formatStoryDate(story.uploadDate)}
                </span>
              </div>
            </button>
          ))}

        {!loading && items.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", width: "100%", padding: "32px 24px", gap: 12,
          }}>
            {fetchError ? (
              <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="var(--text-secondary)" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{
                  color: "var(--text-secondary)", fontSize: 13,
                  fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
                  textAlign: "center",
                }}>
                  تعذر التحميل
                </span>
              </>
            ) : (
              <span style={{
                color: "var(--text-secondary)", fontSize: 13,
                fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
                textAlign: "center",
              }}>
                {emptyMessage}
              </span>
            )}
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" style={{
              marginTop: 4, color: "#FFFC00", fontSize: 12, fontWeight: 500,
              textDecoration: "none", fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
              padding: "6px 16px", borderRadius: 20,
              background: "rgba(255, 252, 0, 0.1)", border: "1px solid rgba(255, 252, 0, 0.25)",
              transition: "background 0.2s",
            }}>
              تابعنا على Snapchat &#x2197;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Highlight Groups Row (circular thumbnails like Instagram) ─── */
function HighlightGroupsRow({
  groups,
  onGroupClick,
  loading,
  fetchError,
  profileUrl,
}: {
  groups: HighlightGroup[];
  onGroupClick: (group: HighlightGroup) => void;
  loading: boolean;
  fetchError: boolean;
  profileUrl: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", padding: "0 8px" }}>
      {groups.length > 4 && (
        <>
          <button
            className="snap-scroll-btn"
            onClick={scrollLeft}
            aria-label="Scroll left"
            style={{
              position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
              zIndex: 2, width: 32, height: 32, borderRadius: "50%",
              border: "1px solid var(--border)", background: "var(--bg-secondary)",
              color: "var(--text-primary)", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 16, opacity: 0.8,
            }}
          >
            &#x2039;
          </button>
          <button
            className="snap-scroll-btn"
            onClick={scrollRight}
            aria-label="Scroll right"
            style={{
              position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
              zIndex: 2, width: 32, height: 32, borderRadius: "50%",
              border: "1px solid var(--border)", background: "var(--bg-secondary)",
              color: "var(--text-primary)", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 16, opacity: 0.8,
            }}
          >
            &#x203A;
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="snap-stories-scroll"
        style={{
          overflowX: "auto", display: "flex", gap: 16, padding: "16px 12px",
          scrollbarWidth: "none", msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`hl-skel-${i}`} style={{
              flexShrink: 0, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6, width: 80,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--bg-terminal)", border: "2px solid var(--border)",
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
              <div style={{
                width: 48, height: 10, borderRadius: 4,
                background: "var(--bg-terminal)",
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
            </div>
          ))}

        {!loading &&
          groups.length > 0 &&
          groups.map((group, i) => (
            <button
              key={`hl-group-${i}`}
              onClick={() => onGroupClick(group)}
              style={{
                flexShrink: 0, display: "flex", flexDirection: "column",
                alignItems: "center", gap: 6, width: 80,
                background: "transparent", border: "none", cursor: "pointer",
                padding: 0, textDecoration: "none",
              }}
            >
              {/* Circular thumbnail with gradient ring */}
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg, #FFFC00 0%, #FF6B00 50%, #FFFC00 100%)",
                padding: 3, position: "relative",
              }}>
                <div style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  overflow: "hidden", background: "var(--bg-terminal)",
                  border: "2px solid var(--bg-secondary)",
                }}>
                  {group.thumbnail ? (
                    <img
                      src={group.thumbnail}
                      alt={group.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      background: "linear-gradient(135deg, #FFFC00 0%, #FF6B00 100%)",
                    }} />
                  )}
                </div>
                {/* Snap count badge */}
                <div style={{
                  position: "absolute", bottom: -2, right: -2,
                  background: "#FFFC00", color: "#000", fontSize: 10,
                  fontWeight: 700, borderRadius: 10, padding: "1px 6px",
                  minWidth: 20, textAlign: "center",
                  border: "2px solid var(--bg-secondary)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  {group.snaps.length}
                </div>
              </div>
              {/* Title */}
              <span style={{
                color: "var(--text-secondary)", fontSize: 11,
                fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
                textAlign: "center", maxWidth: 80,
                overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap", lineHeight: 1.2,
              }}>
                {group.title}
              </span>
            </button>
          ))}

        {!loading && groups.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", width: "100%", padding: "24px 24px", gap: 12,
          }}>
            {fetchError ? (
              <span style={{
                color: "var(--text-secondary)", fontSize: 13,
                fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
              }}>
                تعذر التحميل
              </span>
            ) : (
              <span style={{
                color: "var(--text-secondary)", fontSize: 13,
                fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
              }}>
                لا توجد لحظات محفوظة
              </span>
            )}
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" style={{
              marginTop: 4, color: "#FFFC00", fontSize: 12, fontWeight: 500,
              textDecoration: "none", fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
              padding: "6px 16px", borderRadius: 20,
              background: "rgba(255, 252, 0, 0.1)", border: "1px solid rgba(255, 252, 0, 0.25)",
            }}>
              تابعنا على Snapchat &#x2197;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Snapchat Stories Component ─── */
function SnapchatStories({ url }: { url: string }) {
  const [stories, setStories] = useState<SnapItem[]>([]);
  const [highlightGroups, setHighlightGroups] = useState<HighlightGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [viewerSnaps, setViewerSnaps] = useState<SnapItem[] | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerTitle, setViewerTitle] = useState<string | undefined>(undefined);

  const username = url
    .replace(/\/$/, "")
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace("@", "") || "";

  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/snapchat?username=${encodeURIComponent(username)}`
        );
        const json = await res.json();
        if (json.success && json.data) {
          setStories(json.data.stories || []);
          setHighlightGroups(json.data.highlightGroups || []);
        } else {
          setFetchError(true);
        }
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const openStoriesViewer = (index: number) => {
    setViewerSnaps(stories);
    setViewerIndex(index);
    setViewerTitle("\u0627\u0644\u0642\u0635\u0635");
  };

  const openHighlightViewer = (group: HighlightGroup) => {
    setViewerSnaps(group.snaps);
    setViewerIndex(0);
    setViewerTitle(group.title);
  };

  const hasStories = stories.length > 0;
  const hasHighlights = highlightGroups.length > 0;
  const hasAny = hasStories || hasHighlights;

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

      {/* Stories section */}
      {(loading || hasStories || (!hasAny && !loading)) && (
        <div>
          <div
            style={{
              padding: "12px 24px 0",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
              fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: hasStories ? "#4ade80" : "var(--border)", display: "inline-block" }} />
            القصص
          </div>
          <StoryCarouselRow
            items={stories}
            onItemClick={(i) => openStoriesViewer(i)}
            emptyMessage="لا توجد قصص حاليا"
            loading={loading}
            fetchError={fetchError}
            profileUrl={url}
          />
        </div>
      )}

      {/* Highlights section - groups */}
      {(loading || hasHighlights) && (
        <div>
          <div
            style={{
              padding: "4px 24px 0",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
              fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
              borderTop: hasStories || loading ? "1px solid var(--border)" : "none",
              paddingTop: hasStories || loading ? 12 : 4,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFFC00", display: "inline-block" }} />
            أبرز اللحظات
          </div>
          <HighlightGroupsRow
            groups={highlightGroups}
            onGroupClick={openHighlightViewer}
            loading={loading}
            fetchError={fetchError}
            profileUrl={url}
          />
        </div>
      )}

      {/* Story Viewer Modal (portal to body to avoid transform/stacking issues) */}
      {viewerSnaps && viewerSnaps.length > 0 && createPortal(
        <StoryViewer
          snaps={viewerSnaps}
          initialIndex={viewerIndex}
          groupTitle={viewerTitle}
          onClose={() => { setViewerSnaps(null); setViewerTitle(undefined); }}
        />,
        document.body
      )}

      {/* CSS for pulse animation */}
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

/* ─── GitHub Contribution Chart ─── */
function GitHubChart({ url }: { url: string }) {
  const username = url.replace(/\/$/, "").split("/").filter(Boolean).pop() || "";

  const chartUrl = `https://ghchart.rshah.org/${username}`;

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)" }}>
        <svg height="20" width="20" viewBox="0 0 16 16" fill="var(--text-primary)">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/>
        </svg>
        <h3 style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--text-primary)", fontSize: 16, fontWeight: 600, margin: 0 }}>GitHub</h3>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ marginInlineStart: "auto", color: "var(--text-secondary)", fontSize: 13, textDecoration: "none", fontFamily: "'IBM Plex Mono', monospace" }}>
          @{username} &#x2197;
        </a>
      </div>

      {/* Contribution Chart */}
      <div style={{ padding: 16, overflowX: "auto" }}>
        <img
          src={chartUrl}
          alt={`${username}'s GitHub Contributions`}
          style={{ width: "100%", minWidth: 300, filter: "invert(1) hue-rotate(180deg) brightness(1.5) contrast(0.8)" }}
        />
      </div>

      {/* View Profile Link */}
      <div style={{ padding: "0 16px 16px", textAlign: "center" }}>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none" }}>
          عرض الملف الشخصي على GitHub &#x2197;
        </a>
      </div>
    </div>
  );
}

/* ─── Main Social Feeds Component ─── */
export default function SocialFeeds({ toggles, links, order }: SocialFeedsProps) {
  const hasAny = toggles.x || toggles.instagram || toggles.snapchat || toggles.github;

  if (!hasAny) return null;

  // Build ordered list of active platforms
  const platformOrder = order || ["x", "instagram", "snapchat", "github"];
  const activePlatforms = platformOrder.filter((p) => {
    if (p === "x") return toggles.x && links.xUrl;
    if (p === "instagram") return toggles.instagram && links.instagramUrl;
    if (p === "snapchat") return toggles.snapchat && links.snapchatUrl;
    if (p === "github") return toggles.github && links.githubUrl;
    return false;
  });

  if (activePlatforms.length === 0) return null;

  const renderPlatform = (platform: string) => {
    if (platform === "x") return <TwitterFeed key="x" url={links.xUrl!} />;
    if (platform === "instagram") return <InstagramFeed key="ig" url={links.instagramUrl!} />;
    if (platform === "snapchat") return <SnapchatStories key="snap" url={links.snapchatUrl!} />;
    if (platform === "github") return <GitHubChart key="github" url={links.githubUrl!} />;
    return null;
  };

  return (
    <>
      <div
        className={`social-feeds-grid social-feeds-grid-${activePlatforms.length}`}
        style={{
          display: "grid",
          gap: 24,
        }}
      >
        {activePlatforms.map((platform) => renderPlatform(platform))}
      </div>
    </>
  );
}
