import { prisma } from "@/lib/db";
import Link from "next/link";
import PostsListClient from "@/components/admin/posts-list-client";

async function getPosts() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      author: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });
  return posts;
}

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
          المقالات
        </h1>
        <Link
          href="/admin/posts/new"
          style={{
            padding: "8px 20px",
            borderRadius: 6,
            background: "var(--accent)",
            color: "var(--bg-primary)",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          + مقالة جديدة
        </Link>
      </div>

      <PostsListClient posts={JSON.parse(JSON.stringify(posts))} />
    </div>
  );
}
