"use client";

import { useEffect, useState } from "react";

const EMOJIS: { key: string; label: string; icon: string }[] = [
  { key: "fire", label: "نار", icon: "\u{1F525}" },
  { key: "heart", label: "قلب", icon: "\u{2764}\u{FE0F}" },
  { key: "thumbsUp", label: "إعجاب", icon: "\u{1F44D}" },
  { key: "rocket", label: "صاروخ", icon: "\u{1F680}" },
  { key: "thinking", label: "تفكير", icon: "\u{1F914}" },
];

interface PostReactionsProps {
  postId: number;
}

export default function PostReactions({ postId }: PostReactionsProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/posts/${postId}/reactions`)
      .then((r) => r.json())
      .then((r) => { if (r.success) setCounts(r.data); })
      .catch(() => {});
  }, [postId]);

  async function toggle(emoji: string) {
    if (loading) return;
    setLoading(emoji);
    try {
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      const data = await res.json();
      if (data.success) setCounts(data.data);
    } catch {
      // ignore
    }
    setLoading(null);
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      {EMOJIS.map((e) => (
        <button
          key={e.key}
          onClick={() => toggle(e.key)}
          disabled={loading === e.key}
          aria-label={e.label}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            background: counts[e.key] ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "var(--bg-terminal)",
            border: counts[e.key] ? "1px solid var(--accent)" : "1px solid var(--border)",
            borderRadius: 20,
            cursor: "pointer",
            fontSize: 14,
            color: "var(--text-primary)",
            transition: "border-color 0.2s, background 0.2s",
            opacity: loading === e.key ? 0.6 : 1,
          }}
        >
          <span style={{ fontSize: 16 }}>{e.icon}</span>
          {(counts[e.key] || 0) > 0 && (
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{counts[e.key]}</span>
          )}
        </button>
      ))}
      {total > 0 && (
        <span style={{ fontSize: 13, color: "var(--text-secondary)", marginRight: 4 }}>
          {total} تفاعل
        </span>
      )}
    </div>
  );
}
