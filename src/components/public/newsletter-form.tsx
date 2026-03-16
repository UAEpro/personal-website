"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.data?.message || "تم الاشتراك بنجاح!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "حدث خطأ");
      }
    } catch {
      setStatus("error");
      setMessage("حدث خطأ في الاتصال");
    }
  }

  if (status === "success") {
    return (
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <p style={{ color: "var(--text-primary)", fontSize: 16 }}>{message}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
        احصل على أحدث المقالات مباشرة في بريدك الإلكتروني
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="بريدك الإلكتروني"
          required
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
          disabled={status === "loading"}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
            whiteSpace: "nowrap",
            opacity: status === "loading" ? 0.7 : 1,
          }}
        >
          {status === "loading" ? "جاري..." : "اشترك"}
        </button>
      </div>
      {status === "error" && (
        <p style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>{message}</p>
      )}
    </form>
  );
}
