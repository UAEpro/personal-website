export function Skeleton({ width, height, radius = 8, style }: {
  width?: string | number;
  height?: string | number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton-pulse"
      style={{
        width: width || "100%",
        height: height || 20,
        borderRadius: radius,
        background: "var(--bg-secondary)",
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ hasImage = true }: { hasImage?: boolean }) {
  return (
    <div style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {hasImage && <Skeleton height={200} radius={0} />}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <Skeleton width={80} height={20} radius={4} />
        <Skeleton height={20} />
        <Skeleton width="70%" height={16} />
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <Skeleton width={80} height={14} />
          <Skeleton width={100} height={14} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, widths }: { lines?: number; widths?: string[] }) {
  const defaultWidths = ["100%", "90%", "75%", "85%", "60%"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={widths?.[i] || defaultWidths[i % defaultWidths.length]}
          height={16}
        />
      ))}
    </div>
  );
}
