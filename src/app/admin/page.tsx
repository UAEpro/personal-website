import { prisma } from "@/lib/db";
import Link from "next/link";

async function getDashboardData() {
  const [totalPosts, publishedPosts, draftPosts, pendingComments, unreadMessages, recentPosts] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.comment.count({ where: { isApproved: false } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true } },
          author: { select: { name: true } },
        },
      }),
    ]);

  return { totalPosts, publishedPosts, draftPosts, pendingComments, unreadMessages, recentPosts };
}

const cardStyle: React.CSSProperties = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "20px 24px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const statLabel: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-secondary)",
};

const statValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: "var(--text-primary)",
};

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 24,
        }}
      >
        لوحة التحكم
      </h1>

      {/* Unread messages banner */}
      {data.unreadMessages > 0 && (
        <Link
          href="/admin/messages"
          style={{
            display: "block",
            background: "rgba(249,115,22,0.1)",
            border: "1px solid var(--accent)",
            borderRadius: 8,
            padding: "12px 20px",
            marginBottom: 24,
            color: "var(--accent)",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          لديك {data.unreadMessages} رسالة غير مقروءة — اضغط للعرض
        </Link>
      )}

      {/* Stats cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div style={cardStyle}>
          <span style={statLabel}>إجمالي المقالات</span>
          <span style={statValue}>{data.totalPosts}</span>
        </div>
        <div style={cardStyle}>
          <span style={statLabel}>منشورة</span>
          <span style={{ ...statValue, color: "#10b981" }}>{data.publishedPosts}</span>
        </div>
        <div style={cardStyle}>
          <span style={statLabel}>مسودات</span>
          <span style={{ ...statValue, color: "#f59e0b" }}>{data.draftPosts}</span>
        </div>
        <div style={cardStyle}>
          <span style={statLabel}>تعليقات معلقة</span>
          <span style={{ ...statValue, color: data.pendingComments > 0 ? "#ef4444" : "var(--text-primary)" }}>
            {data.pendingComments}
          </span>
        </div>
      </div>

      {/* Recent posts table */}
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
            آخر المقالات
          </h2>
          <Link
            href="/admin/posts"
            style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none" }}
          >
            عرض الكل
          </Link>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px 20px",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                العنوان
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px 20px",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                الحالة
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px 20px",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                التصنيف
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px 20px",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                التاريخ
              </th>
            </tr>
          </thead>
          <tbody>
            {data.recentPosts.map((post) => (
              <tr key={post.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 20px" }}>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    style={{
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      fontSize: 14,
                    }}
                  >
                    {post.title}
                  </Link>
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <StatusBadge status={post.status} />
                </td>
                <td
                  style={{
                    padding: "12px 20px",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  {post.category?.name || "—"}
                </td>
                <td
                  style={{
                    padding: "12px 20px",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  {new Date(post.createdAt).toLocaleDateString("ar-SA")}
                </td>
              </tr>
            ))}
            {data.recentPosts.length === 0 && (
              <tr>
                <td
                  colSpan={4}
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
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    PUBLISHED: { bg: "rgba(16,185,129,0.15)", text: "#10b981" },
    DRAFT: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" },
    ARCHIVED: { bg: "rgba(136,136,136,0.15)", text: "#888888" },
  };
  const labels: Record<string, string> = {
    PUBLISHED: "منشور",
    DRAFT: "مسودة",
    ARCHIVED: "مؤرشف",
  };
  const c = colors[status] || colors.DRAFT;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 500,
        background: c.bg,
        color: c.text,
      }}
    >
      {labels[status] || status}
    </span>
  );
}
