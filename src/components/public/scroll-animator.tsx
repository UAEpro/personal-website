"use client";

import { useEffect } from "react";

export default function ScrollAnimator() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = document.querySelectorAll(".section-container");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    sections.forEach((s) => {
      const rect = s.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        s.classList.add("revealed");
      } else {
        s.classList.add("scroll-hidden");
        observer.observe(s);
      }
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
