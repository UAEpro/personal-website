import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div>
      <Skeleton width={150} height={28} style={{ marginBottom: 24 }} />

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} style={{
            background: "var(--bg-secondary)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "20px 24px",
          }}>
            <Skeleton width={80} height={14} style={{ marginBottom: 8 }} />
            <Skeleton width={60} height={32} />
          </div>
        ))}
      </div>

      {/* Recent posts table */}
      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
          <Skeleton width={100} height={18} />
          <Skeleton width={60} height={16} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 20 }}>
            <Skeleton width="40%" height={16} />
            <Skeleton width={60} height={20} radius={10} />
            <Skeleton width={80} height={16} />
            <Skeleton width={100} height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}
