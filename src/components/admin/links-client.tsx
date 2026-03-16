"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LinkItem {
  id: number;
  title: string;
  description: string | null;
  url: string;
  icon: string | null;
  category: string;
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

const defaultCategories = ["social", "portfolio", "blog", "streaming", "store", "other"];
const defaultLabels: Record<string, string> = {
  social: "تواصل اجتماعي",
  portfolio: "أعمال",
  blog: "مدونة",
  streaming: "بث",
  store: "متجر",
  other: "أخرى",
};

const emptyLink = { title: "", description: "", url: "", icon: "", category: "other", isActive: true };

export default function LinksClient({ links }: { links: LinkItem[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyLink);
  const [saving, setSaving] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Build categories from defaults + any custom ones found in existing links
  const existingCats = links.map(l => l.category).filter(c => !defaultCategories.includes(c));
  const allCategories = [...defaultCategories, ...Array.from(new Set(existingCats))];
  const [customCategories, setCustomCategories] = useState<string[]>(Array.from(new Set(existingCats)));
  const categoryLabels: Record<string, string> = { ...defaultLabels };
  customCategories.forEach(c => { if (!categoryLabels[c]) categoryLabels[c] = c; });

  function startEdit(link: LinkItem) {
    setEditId(link.id);
    setForm({
      title: link.title,
      description: link.description || "",
      url: link.url,
      icon: link.icon || "",
      category: link.category,
      isActive: link.isActive,
    });
    setShowForm(true);
  }

  function startNew() {
    setEditId(null);
    setForm(emptyLink);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.url.trim()) return alert("العنوان والرابط مطلوبان");
    setSaving(true);

    try {
      const url = editId ? `/api/links/${editId}` : "/api/links";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          url: form.url,
          icon: form.icon || null,
          category: form.category,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setShowForm(false);
      setForm(emptyLink);
      setEditId(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذا الرابط؟")) return;
    const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      router.refresh();
    } else {
      alert(data.error || "فشل الحذف");
    }
  }

  async function toggleActive(id: number, isActive: boolean) {
    await fetch(`/api/links/${id}`, {
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
        + رابط جديد
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
            {editId ? "تعديل الرابط" : "إضافة رابط"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>العنوان *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>الرابط *</label>
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} style={inputStyle} placeholder="https://..." />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>الأيقونة</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} style={inputStyle} placeholder="إيموجي أو اسم أيقونة" />
            </div>
            <div>
              <label style={labelStyle}>التصنيف</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: "pointer", marginBottom: 6 }}>
                {[...defaultCategories, ...customCategories].map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat] || cat}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="تصنيف جديد..."
                  style={{ ...inputStyle, fontSize: 12 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCatName.trim()) {
                      e.preventDefault();
                      const val = newCatName.trim();
                      if (!customCategories.includes(val) && !defaultCategories.includes(val)) {
                        setCustomCategories(prev => [...prev, val]);
                      }
                      categoryLabels[val] = val;
                      setForm({ ...form, category: val });
                      setNewCatName("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = newCatName.trim();
                    if (!val) return;
                    if (!customCategories.includes(val) && !defaultCategories.includes(val)) {
                      setCustomCategories(prev => [...prev, val]);
                    }
                    categoryLabels[val] = val;
                    setForm({ ...form, category: val });
                    setNewCatName("");
                  }}
                  disabled={!newCatName.trim()}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    background: "var(--bg-primary)",
                    color: "var(--accent)",
                    fontSize: 16,
                    cursor: "pointer",
                    flexShrink: 0,
                    opacity: !newCatName.trim() ? 0.5 : 1,
                  }}
                >
                  +
                </button>
              </div>
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

      {/* Links list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map((link) => (
          <div
            key={link.id}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                {link.icon && <span style={{ fontSize: 16 }}>{link.icon}</span>}
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                  {link.title}
                </span>
                <span
                  style={{
                    padding: "1px 8px",
                    borderRadius: 9999,
                    fontSize: 11,
                    background: link.isActive ? "rgba(16,185,129,0.15)" : "rgba(136,136,136,0.15)",
                    color: link.isActive ? "#10b981" : "#888",
                  }}
                >
                  {link.isActive ? "نشط" : "معطل"}
                </span>
                <span
                  style={{
                    padding: "1px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    background: "rgba(249,115,22,0.1)",
                    color: "var(--accent)",
                  }}
                >
                  {categoryLabels[link.category] || link.category}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", direction: "ltr", textAlign: "right" }}>
                {link.url}
              </div>
              {link.description && (
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                  {link.description}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => toggleActive(link.id, link.isActive)}
                style={{ fontSize: 12, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {link.isActive ? "تعطيل" : "تفعيل"}
              </button>
              <button
                onClick={() => startEdit(link)}
                style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                تحرير
              </button>
              <button
                onClick={() => handleDelete(link.id)}
                style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
        {links.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)", fontSize: 14 }}>
            لا توجد روابط بعد
          </div>
        )}
      </div>
    </div>
  );
}
