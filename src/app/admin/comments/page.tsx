import { prisma } from "@/lib/db";
import CommentsClient from "@/components/admin/comments-client";

async function getComments() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { id: true, title: true, slug: true } },
    },
  });
  return comments;
}

export default async function AdminCommentsPage() {
  const comments = await getComments();

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
        التعليقات
      </h1>
      <CommentsClient comments={JSON.parse(JSON.stringify(comments))} />
    </div>
  );
}
