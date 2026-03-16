"use client";

import Link from "next/link";

interface HeroProps {
  tagline: string;
}

export default function Hero({ tagline }: HeroProps) {
  return (
    <section
      className="dot-grid hero-section"
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "min(700px, 100%)", width: "100%", textAlign: "center", padding: "0 16px", boxSizing: "border-box" }}>
        {/* Terminal Window */}
        <div className="terminal-window" style={{ marginBottom: 40, textAlign: "left", direction: "ltr" }}>
          <div className="terminal-header">
            <span className="terminal-dot" style={{ background: "#ef4444" }} />
            <span className="terminal-dot" style={{ background: "#eab308" }} />
            <span className="terminal-dot" style={{ background: "#22c55e" }} />
          </div>
          <div
            style={{
              padding: "24px 28px",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 8 }}>
              <span style={{ color: "var(--accent)" }}>$</span> whoami
            </div>
            <div
              style={{
                fontSize: "clamp(36px, 6vw, 56px)",
                fontWeight: 700,
                color: "var(--accent)",
                lineHeight: 1.1,
              }}
            >
              UAEpro
            </div>
          </div>
        </div>

        {/* Tagline with blinking cursor */}
        <p
          style={{
            fontSize: "clamp(18px, 3vw, 24px)",
            color: "var(--text-secondary)",
            marginBottom: 40,
            fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
          }}
        >
          {tagline}
          <span className="blink-cursor" style={{ color: "var(--accent)", marginRight: 4 }}>
            |
          </span>
        </p>

        {/* CTA Button */}
        <Link
          href="/blog"
          style={{
            display: "inline-block",
            background: "var(--accent)",
            color: "#fff",
            padding: "14px 36px",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textDecoration: "none",
            transition: "background 0.2s, transform 0.2s",
            fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-hover)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--accent)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          تصفح المدونة
        </Link>
      </div>

    </section>
  );
}
