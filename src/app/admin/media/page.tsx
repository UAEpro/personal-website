import { prisma } from "@/lib/db";
import MediaGrid from "@/components/admin/media-grid";

async function getMedia() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });
  return media;
}

export default async function AdminMediaPage() {
  const media = await getMedia();

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
        الوسائط
      </h1>
      <MediaGrid media={JSON.parse(JSON.stringify(media))} />
    </div>
  );
}
