"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Comment {
  id: number;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  post: { id: number; title: string; slug: string };
}

export default function CommentsClient({ comments }: { comments: Comment[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const filtered = comments.filter((c) => {
    if (filter === "pending") return !c.isApproved;
    if (filter === "approved") return c.isApproved;
    return true;
  });

  async function handleApprove(id: number, approve: boolean) {
    const res = await fetch(`/api/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: approve }),
    });
    const data = await res.json();
    if (data.success) {
      router.refresh();
    } else {
      alert(data.error || "فشلت العملية");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      router.refresh();
    } else {
      alert(data.error || "فشل الحذف");
    }
  }

  return (
    <div>
      {/* Filter buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {([
          { id: "all", label: "الكل" },
          { id: "pending", label: "معلقة" },
          { id: "approved", label: "موافق عليها" },
        ] as const).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: filter === f.id ? "var(--accent)" : "transparent",
              color: filter === f.id ? "var(--bg-primary)" : "var(--text-secondary)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["المقالة", "الكاتب", "التعليق", "الحالة", "التاريخ", "إجراءات"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "right",
                    padding: "10px 16px",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((comment) => (
              <tr key={comment.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-primary)", maxWidth: 160 }}>
                  <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {comment.post.title}
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                  {comment.authorName}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)", maxWidth: 250 }}>
                  <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {comment.content}
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 9999,
                      fontSize: 12,
                      background: comment.isApproved
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(245,158,11,0.15)",
                      color: comment.isApproved ? "#10b981" : "#f59e0b",
                    }}
                  >
                    {comment.isApproved ? "موافق" : "معلق"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                  {new Date(comment.createdAt).toLocaleDateString("ar-SA")}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!comment.isApproved && (
                      <button
                        onClick={() => handleApprove(comment.id, true)}
                        style={{
                          fontSize: 12,
                          color: "#10b981",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        قبول
                      </button>
                    )}
                    {comment.isApproved && (
                      <button
                        onClick={() => handleApprove(comment.id, false)}
                        style={{
                          fontSize: 12,
                          color: "#f59e0b",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        رفض
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      style={{
                        fontSize: 12,
                        color: "#ef4444",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}
                >
                  لا توجد تعليقات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
