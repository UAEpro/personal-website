import { prisma } from "@/lib/db";
import PostForm from "@/components/admin/post-form";

async function getData() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { categories, tags };
}

export default async function NewPostPage() {
  const { categories, tags } = await getData();

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
        مقالة جديدة
      </h1>
      <PostForm
        categories={JSON.parse(JSON.stringify(categories))}
        tags={JSON.parse(JSON.stringify(tags))}
      />
    </div>
  );
}
