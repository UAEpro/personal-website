"use client";

import { useEffect } from "react";

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

export default function SocialFeeds({ toggles, links }: SocialFeedsProps) {
  const hasAny = toggles.x || toggles.instagram || toggles.snapchat;

  useEffect(() => {
    if (toggles.x && links.xUrl) {
      // Load Twitter widget script
      const existingScript = document.getElementById("twitter-wjs");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "twitter-wjs";
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);
      } else {
        // Re-render widgets if script already loaded
        const win = window as unknown as Record<string, unknown>;
        if (win.twttr) {
          const twttr = win.twttr as { widgets?: { load: () => void } };
          twttr.widgets?.load();
        }
      }
    }
  }, [toggles.x, links.xUrl]);

  if (!hasAny) return null;

  // Extract X username from URL for timeline embed
  const xUsername = links.xUrl
    ? links.xUrl.replace(/\/$/, "").split("/").pop()
    : "";

  const cardStyle: React.CSSProperties = {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 24,
    flex: "1 1 300px",
    minWidth: 280,
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        justifyContent: "center",
      }}
    >
      {/* X / Twitter */}
      {toggles.x && links.xUrl && (
        <div style={cardStyle}>
          <h3
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: "var(--text-primary)",
              fontSize: 16,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--text-primary)">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X (Twitter)
          </h3>
          <a
            className="twitter-timeline"
            data-height="400"
            data-theme="dark"
            data-chrome="noheader nofooter noborders transparent"
            href={`https://twitter.com/${xUsername}`}
          >
            تحميل التغريدات...
          </a>
        </div>
      )}

      {/* Instagram */}
      {toggles.instagram && links.instagramUrl && (
        <div style={cardStyle}>
          <h3
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: "var(--text-primary)",
              fontSize: 16,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            Instagram
          </h3>
          <a
            href={links.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 24px",
              background: "var(--bg-terminal)",
              borderRadius: 8,
              border: "1px solid var(--border)",
              color: "var(--accent)",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 500,
              transition: "border-color 0.2s",
              fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
            }}
          >
            زيارة حسابنا على Instagram &#x2197;
          </a>
        </div>
      )}

      {/* Snapchat */}
      {toggles.snapchat && links.snapchatUrl && (
        <div style={cardStyle}>
          <h3
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: "var(--text-primary)",
              fontSize: 16,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--text-primary)">
              <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.095-.034.185-.066.272-.093a.72.72 0 0 1 .115-.018c.249 0 .44.2.44.443 0 .199-.123.384-.313.472-.116.054-.25.097-.39.141l-.004.002c-.477.156-.783.308-.796.629-.006.147.08.295.196.442l.018.023c.349.46 1.036 1.1 1.632 1.369.18.08.377.198.377.456 0 .166-.1.346-.305.485-.472.323-1.235.422-1.518.467l-.037.006c-.064.01-.093.028-.105.07-.014.046-.007.115.007.195.017.095.038.191.062.29.024.096.05.194.067.268a.524.524 0 0 1-.105.484c-.168.192-.464.292-.84.292-.196 0-.409-.026-.626-.065-.298-.054-.632-.072-.982-.072-.327 0-.637.015-.883.08a3.567 3.567 0 0 0-.793.39c-.627.37-1.204.759-2.403.759h-.058c-1.2 0-1.777-.39-2.404-.76a3.568 3.568 0 0 0-.793-.39c-.247-.064-.556-.08-.883-.08-.35 0-.684.02-.981.073a4.876 4.876 0 0 1-.627.064c-.396 0-.68-.113-.836-.302a.52.52 0 0 1-.1-.475c.017-.075.042-.17.066-.267.024-.099.045-.196.063-.29.014-.08.02-.149.006-.196-.012-.042-.04-.06-.105-.07l-.037-.006c-.283-.045-1.046-.144-1.518-.467-.205-.139-.305-.319-.305-.485 0-.258.197-.376.377-.456.596-.27 1.283-.91 1.632-1.37l.018-.022c.116-.147.203-.295.196-.442-.013-.32-.319-.473-.796-.63l-.004-.001a2.853 2.853 0 0 1-.39-.14c-.19-.09-.313-.274-.313-.473 0-.243.19-.443.44-.443l.115.018c.087.027.177.06.272.093.263.094.622.23.922.214.198 0 .326-.045.401-.09a10.86 10.86 0 0 1-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C7.846 1.069 11.216.793 12.206.793" />
            </svg>
            Snapchat
          </h3>
          <a
            href={links.snapchatUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 24px",
              background: "var(--bg-terminal)",
              borderRadius: 8,
              border: "1px solid var(--border)",
              color: "var(--accent)",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 500,
              transition: "border-color 0.2s",
              fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
            }}
          >
            تابعنا على Snapchat &#x2197;
          </a>
        </div>
      )}
    </div>
  );
}
