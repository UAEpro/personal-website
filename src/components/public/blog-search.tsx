"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BlogSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/blog?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث في المقالات..."
        style={{
          flex: 1,
          background: "var(--bg-terminal)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 16px",
          color: "var(--text-primary)",
          fontSize: 15,
          fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
          outline: "none",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
      <button
        type="submit"
        style={{
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        بحث
      </button>
    </form>
  );
}
