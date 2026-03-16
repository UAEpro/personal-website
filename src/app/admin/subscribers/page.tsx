import { prisma } from "@/lib/db";

export default async function SubscribersPage() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
          المشتركين ({subscribers.length})
        </h1>
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
              <th style={{ textAlign: "right", padding: "10px 20px", fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
                البريد الإلكتروني
              </th>
              <th style={{ textAlign: "right", padding: "10px 20px", fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
                تاريخ الاشتراك
              </th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 20px", color: "var(--text-primary)", fontSize: 14 }}>
                  {sub.email}
                </td>
                <td style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: 13 }}>
                  {new Date(sub.subscribedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={2} style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
                  لا يوجد مشتركين بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
