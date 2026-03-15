import { prisma } from "@/lib/db";
import ProjectsClient from "@/components/admin/projects-client";

async function getProjects() {
  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return projects;
}

export default async function AdminProjectsPage() {
  const projects = await getProjects();

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
        المشاريع
      </h1>
      <ProjectsClient projects={JSON.parse(JSON.stringify(projects))} />
    </div>
  );
}
