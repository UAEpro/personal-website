"use client";

import { useState, type FormEvent } from "react";

interface Comment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
}

export default function CommentSection({ postId, comments }: CommentSectionProps) {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (honeypot) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, authorName, authorEmail, content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "حدث خطأ أثناء الإرسال");
      }

      setStatus("success");
      setAuthorName("");
      setAuthorEmail("");
      setContent("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ أثناء الإرسال");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "var(--bg-terminal)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text-primary)",
    fontSize: 14,
    fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "var(--text-secondary)",
    fontSize: 13,
    marginBottom: 6,
    fontWeight: 500,
  };

  function formatCommentDate(dateStr: string) {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr));
  }

  return (
    <div style={{ marginTop: 48 }}>
      <h3
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          color: "var(--accent)",
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 24,
        }}
      >
        {"// "}التعليقات ({comments.length})
      </h3>

      {/* Display approved comments */}
      {comments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    fontSize: 14,
                  }}
                >
                  {comment.authorName}
                </span>
                <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                  {formatCommentDate(comment.createdAt)}
                </span>
              </div>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      {status === "success" ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 24px",
            background: "var(--bg-secondary)",
            borderRadius: 12,
            border: "1px solid var(--border)",
          }}
        >
          <p style={{ color: "var(--accent)", fontSize: 16, fontWeight: 600, margin: 0 }}>
            تم إرسال تعليقك بنجاح
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>
            سيظهر التعليق بعد مراجعته والموافقة عليه
          </p>
          <button
            onClick={() => setStatus("idle")}
            style={{
              marginTop: 16,
              padding: "8px 20px",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
            }}
          >
            إضافة تعليق آخر
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <h4
            style={{
              color: "var(--text-primary)",
              fontSize: 15,
              fontWeight: 600,
              margin: 0,
            }}
          >
            أضف تعليقك
          </h4>

          {/* Honeypot */}
          <div style={{ position: "absolute", left: "-9999px", opacity: 0 }} aria-hidden="true">
            <input
              type="text"
              name="_hp"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>الاسم</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                style={inputStyle}
                placeholder="اسمك"
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={labelStyle}>البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                style={inputStyle}
                placeholder="email@example.com"
                dir="ltr"
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>التعليق</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="اكتب تعليقك هنا..."
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          {status === "error" && (
            <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              alignSelf: "flex-start",
              padding: "10px 24px",
              background: status === "loading" ? "var(--border)" : "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: status === "loading" ? "not-allowed" : "pointer",
              fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
            }}
          >
            {status === "loading" ? "جاري الإرسال..." : "إرسال التعليق"}
          </button>
        </form>
      )}
    </div>
  );
}
