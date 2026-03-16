import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Title */}
      <Skeleton width={150} height={28} style={{ marginBottom: 32 }} />

      {/* Search bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <Skeleton height={42} radius={8} />
        <Skeleton width={80} height={42} radius={8} />
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
        {[60, 80, 70, 90, 75].map((w, i) => (
          <Skeleton key={i} width={w} height={34} radius={20} />
        ))}
      </div>

      {/* Post grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
