import { Skeleton } from "@/components/ui/skeleton";

export default function LinksLoading() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Title */}
      <Skeleton width={130} height={28} style={{ marginBottom: 40 }} />

      {/* Category group */}
      {[1, 2].map((group) => (
        <div key={group} style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Skeleton width={8} height={8} radius={4} />
            <Skeleton width={80} height={18} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16, padding: 20,
                background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12,
              }}>
                <Skeleton width={44} height={44} radius={10} />
                <div style={{ flex: 1 }}>
                  <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
                  <Skeleton width="80%" height={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
