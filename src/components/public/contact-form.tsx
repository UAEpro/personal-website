"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (honeypot) return; // Bot trap

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "حدث خطأ أثناء الإرسال");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ أثناء الإرسال");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "var(--bg-terminal)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text-primary)",
    fontSize: 15,
    fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "var(--text-secondary)",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 500,
  };

  if (status === "success") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          background: "var(--bg-secondary)",
          borderRadius: 12,
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 16 }}>&#10003;</div>
        <h3 style={{ color: "var(--accent)", fontSize: 20, marginBottom: 8 }}>
          تم إرسال رسالتك بنجاح
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          سأقوم بالرد عليك في أقرب وقت ممكن
        </p>
        <button
          onClick={() => setStatus("idle")}
          style={{
            marginTop: 24,
            padding: "10px 24px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
          }}
        >
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 600,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Honeypot - hidden from users */}
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

      <div>
        <label style={labelStyle}>الاسم</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          placeholder="أدخل اسمك"
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      </div>

      <div>
        <label style={labelStyle}>البريد الإلكتروني</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder="example@email.com"
          dir="ltr"
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      </div>

      <div>
        <label style={labelStyle}>الرسالة</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="اكتب رسالتك هنا..."
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      </div>

      {status === "error" && (
        <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          padding: "14px 32px",
          background: status === "loading" ? "var(--border)" : "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
        }}
      >
        {status === "loading" ? "جاري الإرسال..." : "إرسال"}
      </button>
    </form>
  );
}
