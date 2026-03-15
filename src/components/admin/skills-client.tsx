"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Skill {
  id: number;
  name: string;
  icon: string | null;
  category: string;
  sortOrder: number;
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

const defaultCategories = ["frontend", "backend", "devops", "tools", "languages", "other"];

export default function SkillsClient({ skills }: { skills: Skill[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", icon: "", category: "other" });
  const [saving, setSaving] = useState(false);

  // Group by category
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    frontend: "الواجهة الأمامية",
    backend: "الخلفية",
    devops: "DevOps",
    tools: "الأدوات",
    languages: "اللغات",
    other: "أخرى",
  };

  function startEdit(skill: Skill) {
    setEditId(skill.id);
    setForm({ name: skill.name, icon: skill.icon || "", category: skill.category });
    setShowForm(true);
  }

  function startNew() {
    setEditId(null);
    setForm({ name: "", icon: "", category: "other" });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return alert("الاسم مطلوب");
    setSaving(true);

    try {
      const url = editId ? `/api/skills/${editId}` : "/api/skills";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          icon: form.icon || null,
          category: form.category,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setShowForm(false);
      setForm({ name: "", icon: "", category: "other" });
      setEditId(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذه المهارة؟")) return;
    const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      router.refresh();
    } else {
      alert(data.error || "فشل الحذف");
    }
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
        + مهارة جديدة
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
            {editId ? "تعديل المهارة" : "إضافة مهارة"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>الاسم *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>الأيقونة</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} style={inputStyle} placeholder="اسم الأيقونة أو إيموجي" />
            </div>
            <div>
              <label style={labelStyle}>التصنيف</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                {defaultCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat] || cat}
                  </option>
                ))}
              </select>
            </div>
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

      {/* Skills grouped by category */}
      {Object.entries(grouped).length > 0 ? (
        Object.entries(grouped).map(([category, categorySkills]) => (
          <div key={category} style={{ marginBottom: 20 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--accent)",
                marginBottom: 8,
                textTransform: "capitalize",
              }}
            >
              {categoryLabels[category] || category}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {categorySkills.map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {skill.icon && <span style={{ fontSize: 14 }}>{skill.icon}</span>}
                  <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{skill.name}</span>
                  <button
                    onClick={() => startEdit(skill)}
                    style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0, marginRight: 4 }}
                  >
                    تحرير
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)", fontSize: 14 }}>
          لا توجد مهارات بعد
        </div>
      )}
    </div>
  );
}
