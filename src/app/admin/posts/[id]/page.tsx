import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PostForm from "@/components/admin/post-form";

async function getData(id: number) {
  const [post, categories, tags] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { post, categories, tags };
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) notFound();

  const { post, categories, tags } = await getData(postId);
  if (!post) notFound();

  const postData = {
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    coverImage: post.coverImage || "",
    status: post.status,
    categoryId: post.categoryId ? String(post.categoryId) : "",
    seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "",
    tags: post.tags,
  };

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
        تحرير المقالة
      </h1>
      <PostForm
        post={JSON.parse(JSON.stringify(postData))}
        categories={JSON.parse(JSON.stringify(categories))}
        tags={JSON.parse(JSON.stringify(tags))}
      />
    </div>
  );
}
