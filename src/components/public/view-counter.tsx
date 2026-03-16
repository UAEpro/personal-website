"use client";

import { useEffect } from "react";

interface ViewCounterProps {
  postId: number;
  initialCount: number;
}

export default function ViewCounter({ postId, initialCount }: ViewCounterProps) {
  useEffect(() => {
    fetch(`/api/posts/${postId}/view`, { method: "POST" }).catch(() => {});
  }, [postId]);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {initialCount}
    </span>
  );
}
