"use client";

import { useEffect, useState } from "react";
import type { HeadingItem } from "@/lib/heading-ids";

interface TOCProps {
  headings: HeadingItem[];
}

export default function TableOfContents({ headings }: TOCProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0.1 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      className="toc-sidebar"
      aria-label="جدول المحتويات"
      style={{
        position: "sticky",
        top: 80,
        alignSelf: "flex-start",
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
        minWidth: 200,
        maxWidth: 240,
        paddingRight: 24,
        borderRight: "1px solid var(--border)",
      }}
    >
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: "var(--accent)",
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        {"// "}المحتويات
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {headings.map((h) => (
          <li key={h.id} style={{ marginBottom: 6 }}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                color: activeId === h.id ? "var(--accent)" : "var(--text-secondary)",
                textDecoration: "none",
                fontSize: 13,
                lineHeight: 1.5,
                display: "block",
                paddingRight: h.level === 3 ? 16 : 0,
                transition: "color 0.2s",
                fontWeight: activeId === h.id ? 600 : 400,
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
