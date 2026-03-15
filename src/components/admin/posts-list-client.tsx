"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Post {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  category: { id: number; name: string } | null;
  author: { id: number; name: string };
  _count: { comments: number };
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  PUBLISHED: { bg: "rgba(16,185,129,0.15)", text: "#10b981", label: "منشور" },
  DRAFT: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", label: "مسودة" },
  ARCHIVED: { bg: "rgba(136,136,136,0.15)", text: "#888888", label: "مؤرشف" },
};

export default function PostsListClient({ posts }: { posts: Post[] }) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذه المقالة؟")) return;

    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      router.refresh();
    } else {
      alert(data.error || "فشل الحذف");
    }
  }

  return (
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
            {["العنوان", "الحالة", "التصنيف", "التعليقات", "التاريخ", "إجراءات"].map(
              (h) => (
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
              )
            )}
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => {
            const sc = statusColors[post.status] || statusColors.DRAFT;
            return (
              <tr key={post.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 16px" }}>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    style={{
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {post.title}
                  </Link>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 9999,
                      fontSize: 12,
                      background: sc.bg,
                      color: sc.text,
                    }}
                  >
                    {sc.label}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  {post.category?.name || "—"}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  {post._count.comments}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  {new Date(post.createdAt).toLocaleDateString("ar-SA")}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      style={{
                        fontSize: 12,
                        color: "var(--accent)",
                        textDecoration: "none",
                      }}
                    >
                      تحرير
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
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
            );
          })}
          {posts.length === 0 && (
            <tr>
              <td
                colSpan={6}
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: 14,
                }}
              >
                لا توجد مقالات بعد
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
