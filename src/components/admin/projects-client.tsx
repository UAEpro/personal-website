"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Project {
  id: number;
  title: string;
  description: string | null;
  techStack: string | null;
  url: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--bg-primary)",
  color: "var(--text-primary)",
  fontSize: 14,
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  color: "var(--text-secondary)",
  marginBottom: 4,
};

const emptyProject = {
  title: "",
  description: "",
  techStack: "",
  url: "",
  image: "",
  isActive: true,
};

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyProject);
  const [saving, setSaving] = useState(false);

  function startEdit(project: Project) {
    setEditId(project.id);
    setForm({
      title: project.title,
      description: project.description || "",
      techStack: project.techStack || "",
      url: project.url || "",
      image: project.image || "",
      isActive: project.isActive,
    });
    setShowForm(true);
  }

  function startNew() {
    setEditId(null);
    setForm(emptyProject);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return alert("العنوان مطلوب");
    setSaving(true);

    try {
      const url = editId ? `/api/projects/${editId}` : "/api/projects";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          techStack: form.techStack || null,
          url: form.url || null,
          image: form.image || null,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setShowForm(false);
      setForm(emptyProject);
      setEditId(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      router.refresh();
    } else {
      alert(data.error || "فشل الحذف");
    }
  }

  async function toggleActive(id: number, isActive: boolean) {
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={startNew}
        style={{
          padding: "8px 20px",
          borderRadius: 6,
          background: "var(--accent)",
          color: "var(--bg-primary)",
          border: "none",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        + مشروع جديد
      </button>

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
            {editId ? "تعديل المشروع" : "إضافة مشروع"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>العنوان *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>الرابط</label>
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} style={inputStyle} placeholder="https://..." />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>التقنيات (مفصولة بفواصل)</label>
              <input value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} style={inputStyle} placeholder="React, Node.js, ..." />
            </div>
            <div>
              <label style={labelStyle}>صورة المشروع</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} style={inputStyle} placeholder="رابط الصورة..." />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <label
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text-secondary)" }}
            >
              <div
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  background: form.isActive ? "var(--accent)" : "var(--border)",
                  position: "relative",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: 2,
                    right: form.isActive ? 2 : 18,
                    transition: "right 0.2s",
                  }}
                />
              </div>
              نشط
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: "8px 20px", borderRadius: 6, background: "var(--accent)", color: "var(--bg-primary)", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} style={{ padding: "8px 20px", borderRadius: 6, background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", fontSize: 13, cursor: "pointer" }}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Projects list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                  {project.title}
                </span>
                <span
                  style={{
                    padding: "1px 8px",
                    borderRadius: 9999,
                    fontSize: 11,
                    background: project.isActive ? "rgba(16,185,129,0.15)" : "rgba(136,136,136,0.15)",
                    color: project.isActive ? "#10b981" : "#888",
                  }}
                >
                  {project.isActive ? "نشط" : "معطل"}
                </span>
              </div>
              {project.description && (
                <div style={{ fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 500 }}>
                  {project.description}
                </div>
              )}
              {project.techStack && (
                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                  {project.techStack.split(",").map((tech, i) => (
                    <span
                      key={i}
                      style={{
                        padding: "1px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        background: "rgba(249,115,22,0.1)",
                        color: "var(--accent)",
                      }}
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => toggleActive(project.id, project.isActive)}
                style={{ fontSize: 12, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {project.isActive ? "تعطيل" : "تفعيل"}
              </button>
              <button
                onClick={() => startEdit(project)}
                style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                تحرير
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)", fontSize: 14 }}>
            لا توجد مشاريع بعد
          </div>
        )}
      </div>
    </div>
  );
}
