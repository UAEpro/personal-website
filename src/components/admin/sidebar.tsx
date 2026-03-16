"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: "◉" },
  { href: "/admin/posts", label: "المقالات", icon: "✎" },
  { href: "/admin/media", label: "الوسائط", icon: "◫" },
  { href: "/admin/comments", label: "التعليقات", icon: "◬" },
  { href: "/admin/projects", label: "المشاريع", icon: "⬡" },
  { href: "/admin/skills", label: "المهارات", icon: "◈" },
  { href: "/admin/messages", label: "الرسائل", icon: "✉" },
  { href: "/admin/links", label: "الروابط", icon: "⊙" },
  { href: "/admin/settings", label: "الإعدادات", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="admin-sidebar"
      style={{
        width: 240,
        minHeight: "100vh",
        background: "var(--bg-secondary)",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "16px 0",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "0 20px 20px",
          borderBottom: "1px solid var(--border)",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Link
            href="/admin"
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            UAEpro
          </Link>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            لوحة الإدارة
          </div>
        </div>

        {/* Mobile hamburger toggle */}
        <button
          className="admin-sidebar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="القائمة"
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-primary)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      <nav className={`admin-sidebar-nav${mobileOpen ? " open" : ""}`} style={{ flex: 1, padding: "8px 0" }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              fontSize: 14,
              color: isActive(item.href) ? "var(--accent)" : "var(--text-secondary)",
              background: isActive(item.href) ? "rgba(249,115,22,0.08)" : "transparent",
              borderRight: isActive(item.href) ? "3px solid var(--accent)" : "3px solid transparent",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div
        className={`admin-sidebar-footer${mobileOpen ? " open" : ""}`}
        style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Link
          href="/"
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          ↗ عرض الموقع
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--text-secondary)",
            padding: 0,
          }}
        >
          ← تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
