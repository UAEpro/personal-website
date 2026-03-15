import { prisma } from "@/lib/db";
import MessagesClient from "@/components/admin/messages-client";

async function getMessages() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return messages;
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();

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
        الرسائل
      </h1>
      <MessagesClient messages={JSON.parse(JSON.stringify(messages))} />
    </div>
  );
}
