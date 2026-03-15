import { prisma } from "@/lib/db";
import SkillsClient from "@/components/admin/skills-client";

async function getSkills() {
  const skills = await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
  return skills;
}

export default async function AdminSkillsPage() {
  const skills = await getSkills();

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
        المهارات
      </h1>
      <SkillsClient skills={JSON.parse(JSON.stringify(skills))} />
    </div>
  );
}
