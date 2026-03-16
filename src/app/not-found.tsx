import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="dot-grid"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "var(--bg-primary)",
      }}
    >
      <div style={{ maxWidth: 500, width: "100%", textAlign: "center" }}>
        <div
          className="terminal-window"
          style={{ marginBottom: 32, textAlign: "left", direction: "ltr" }}
        >
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
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                marginBottom: 8,
              }}
            >
              <span style={{ color: "var(--accent)" }}>$</span> cd
              /requested-page
            </div>
            <div
              style={{ color: "#ef4444", fontSize: 14, marginBottom: 16 }}
            >
              bash: cd: /requested-page: No such file or directory
            </div>
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
              }}
            >
              <span style={{ color: "var(--accent)" }}>$</span> echo $?
            </div>
            <div
              style={{
                fontSize: "clamp(48px, 10vw, 80px)",
                fontWeight: 700,
                color: "var(--accent)",
                lineHeight: 1.1,
                margin: "8px 0",
              }}
            >
              404
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize: 18,
            color: "var(--text-secondary)",
            marginBottom: 32,
            fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
          }}
        >
          الصفحة التي تبحث عنها غير موجودة
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "var(--accent)",
            color: "#fff",
            padding: "12px 32px",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textDecoration: "none",
            fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif",
          }}
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
