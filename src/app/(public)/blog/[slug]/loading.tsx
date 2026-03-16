import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      {/* Cover image */}
      <Skeleton height={300} radius={12} style={{ marginBottom: 32 }} />

      {/* Category badge */}
      <Skeleton width={80} height={24} radius={4} style={{ marginBottom: 16 }} />

      {/* Title */}
      <Skeleton width="85%" height={32} style={{ marginBottom: 8 }} />
      <Skeleton width="60%" height={32} style={{ marginBottom: 16 }} />

      {/* Meta */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
        <Skeleton width={80} height={16} />
        <Skeleton width={100} height={16} />
        <Skeleton width={120} height={16} />
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {[60, 70, 50].map((w, i) => (
          <Skeleton key={i} width={w} height={26} radius={4} />
        ))}
      </div>

      {/* Content body */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SkeletonText lines={4} />
        <Skeleton height={24} width="40%" />
        <SkeletonText lines={5} />
        <Skeleton height={200} radius={8} />
        <SkeletonText lines={3} />
      </div>
    </div>
  );
}
