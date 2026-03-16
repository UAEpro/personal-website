import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";

export default function HomeLoading() {
  const sectionStyle = { maxWidth: 1200, margin: "0 auto", padding: "64px 24px" };

  return (
    <>
      {/* Hero skeleton */}
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <div style={{ maxWidth: 700, width: "100%", textAlign: "center" }}>
          <div style={{ background: "var(--bg-terminal)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 40 }}>
            <div style={{ background: "var(--bg-secondary)", padding: "8px 12px", display: "flex", gap: 6 }}>
              <Skeleton width={8} height={8} radius={4} />
              <Skeleton width={8} height={8} radius={4} />
              <Skeleton width={8} height={8} radius={4} />
            </div>
            <div style={{ padding: "24px 28px" }}>
              <Skeleton width={120} height={14} style={{ marginBottom: 12 }} />
              <Skeleton width={200} height={48} />
            </div>
          </div>
          <Skeleton width={300} height={24} style={{ margin: "0 auto 40px" }} />
          <Skeleton width={160} height={48} radius={8} style={{ margin: "0 auto" }} />
        </div>
      </div>

      {/* Blog posts skeleton */}
      <div style={sectionStyle}>
        <Skeleton width={150} height={20} style={{ marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>

      {/* Projects skeleton */}
      <div style={sectionStyle}>
        <Skeleton width={120} height={20} style={{ marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
              <Skeleton width="60%" height={20} style={{ marginBottom: 12 }} />
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      </div>

      {/* Skills skeleton */}
      <div style={sectionStyle}>
        <Skeleton width={100} height={20} style={{ marginBottom: 32 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[90, 70, 100, 60, 80, 110, 75, 95].map((w, i) => (
            <Skeleton key={i} width={w} height={36} radius={20} />
          ))}
        </div>
      </div>
    </>
  );
}
