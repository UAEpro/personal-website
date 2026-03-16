"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/blog", label: "المدونة" },
  { href: "/links", label: "الروابط" },
  { href: "#contact", label: "تواصل" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("#")) return false;
    return pathname.startsWith(href);
  }

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(17, 17, 19, 0.85)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--accent)",
            textDecoration: "none",
          }}
        >
          UAEpro
        </Link>

        {/* Desktop Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
          className="nav-desktop"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: active ? 600 : 500,
                  transition: "color 0.2s",
                  borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                  paddingBottom: 4,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="nav-hamburger"
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
            {menuOpen ? (
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

      {/* Mobile Menu */}
      <div
        className="nav-mobile-menu"
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--bg-secondary)",
          padding: menuOpen ? "16px 24px" : "0 24px",
          display: "flex",
          flexDirection: "column",
          gap: menuOpen ? 16 : 0,
          maxHeight: menuOpen ? 400 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease, padding 0.3s ease, gap 0.3s ease",
        }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            style={{
              color: isActive(link.href) ? "var(--accent)" : "var(--text-secondary)",
              textDecoration: "none",
              fontSize: 16,
              fontWeight: isActive(link.href) ? 600 : 500,
              padding: "8px 0",
              opacity: menuOpen ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

    </nav>
  );
}
