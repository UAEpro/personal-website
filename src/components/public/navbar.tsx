"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggle";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/blog", label: "المدونة" },
  { href: "/links", label: "الروابط" },
  { href: "#contact", label: "تواصل" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        background: scrolled
          ? "color-mix(in srgb, var(--bg-primary) 90%, transparent)"
          : "color-mix(in srgb, var(--bg-primary) 85%, transparent)",
        borderBottom: scrolled ? "none" : "1px solid var(--border)",
        border: scrolled ? "1px solid var(--border)" : undefined,
        borderRadius: scrolled ? 16 : 0,
        margin: scrolled ? "8px 16px 0" : 0,
        boxShadow: scrolled ? "0 8px 32px rgba(0, 0, 0, 0.2)" : "none",
        transition: "border-radius 0.3s ease, margin 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
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
            gap: 28,
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
          <ThemeToggle />
        </div>

        {/* Mobile: Theme Toggle + Hamburger */}
        <div className="nav-hamburger" style={{ display: "none", alignItems: "center", gap: 8 }}>
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="القائمة"
            style={{
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
          borderRadius: scrolled ? "0 0 16px 16px" : 0,
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
