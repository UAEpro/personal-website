"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesClient({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function markAsRead(id: number) {
    await fetch(`/api/contact/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    router.refresh();
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;
    const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      router.refresh();
    } else {
      alert(data.error || "فشل الحذف");
    }
  }

  function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      // Mark as read when expanding
      const msg = messages.find((m) => m.id === id);
      if (msg && !msg.isRead) {
        markAsRead(id);
      }
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
            {["الاسم", "البريد", "الرسالة", "الحالة", "التاريخ", "إجراءات"].map((h) => (
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
          {messages.map((msg) => (
            <>
              <tr
                key={msg.id}
                style={{
                  borderBottom: expandedId === msg.id ? "none" : "1px solid var(--border)",
                  cursor: "pointer",
                  background: !msg.isRead ? "rgba(249,115,22,0.03)" : "transparent",
                }}
                onClick={() => toggleExpand(msg.id)}
              >
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-primary)", fontWeight: msg.isRead ? 400 : 600 }}>
                  {msg.name}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                  {msg.email}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)", maxWidth: 250 }}>
                  <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {msg.message}
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 9999,
                      fontSize: 12,
                      background: msg.isRead ? "rgba(136,136,136,0.15)" : "rgba(249,115,22,0.15)",
                      color: msg.isRead ? "#888" : "var(--accent)",
                    }}
                  >
                    {msg.isRead ? "مقروءة" : "غير مقروءة"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                  {new Date(msg.createdAt).toLocaleDateString("ar-SA")}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                    {!msg.isRead && (
                      <button
                        onClick={() => markAsRead(msg.id)}
                        style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        قراءة
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(msg.id)}
                      style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
              {expandedId === msg.id && (
                <tr key={`${msg.id}-expanded`} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td
                    colSpan={6}
                    style={{
                      padding: "12px 20px 16px",
                      fontSize: 14,
                      color: "var(--text-primary)",
                      lineHeight: 1.8,
                      background: "var(--bg-primary)",
                    }}
                  >
                    {msg.message}
                  </td>
                </tr>
              )}
            </>
          ))}
          {messages.length === 0 && (
            <tr>
              <td
                colSpan={6}
                style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}
              >
                لا توجد رسائل بعد
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
