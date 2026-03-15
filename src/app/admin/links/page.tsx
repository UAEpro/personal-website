import { prisma } from "@/lib/db";
import LinksClient from "@/components/admin/links-client";

async function getLinks() {
  const links = await prisma.link.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return links;
}

export default async function AdminLinksPage() {
  const links = await getLinks();

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
        الروابط
      </h1>
      <LinksClient links={JSON.parse(JSON.stringify(links))} />
    </div>
  );
}
