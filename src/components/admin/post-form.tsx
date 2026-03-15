"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/editor/tiptap-editor";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface PostData {
  id?: number;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  status: string;
  categoryId: string;
  seoTitle: string;
  seoDescription: string;
  tags: { tag: Tag }[];
}

interface PostFormProps {
  post?: PostData;
  categories: Category[];
  tags: Tag[];
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
  marginBottom: 6,
};

export default function PostForm({ post, categories, tags }: PostFormProps) {
  const router = useRouter();
  const isEdit = !!post?.id;

  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [status, setStatus] = useState(post?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(post?.categoryId || "");
  const [selectedTags, setSelectedTags] = useState<number[]>(
    post?.tags?.map((t) => t.tag.id) || []
  );
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || "");

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const dirtyRef = useRef(false);
  const lastSavedRef = useRef<string>("");

  // Track dirty state
  useEffect(() => {
    const current = JSON.stringify({ title, content, excerpt, coverImage, status, categoryId, selectedTags, seoTitle, seoDescription });
    if (current !== lastSavedRef.current) {
      dirtyRef.current = true;
    }
  }, [title, content, excerpt, coverImage, status, categoryId, selectedTags, seoTitle, seoDescription]);

  const save = useCallback(async (auto = false) => {
    if (auto && !dirtyRef.current) return;
    if (!title.trim()) {
      if (!auto) setErrorMsg("العنوان مطلوب");
      return;
    }

    setSaving(true);
    setSaveStatus("saving");
    setErrorMsg("");

    const body = {
      title,
      content,
      excerpt,
      coverImage: coverImage || null,
      status,
      categoryId: categoryId || null,
      tags: selectedTags,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
    };

    try {
      const url = isEdit ? `/api/posts/${post.id}` : "/api/posts";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "فشل الحفظ");
      }

      dirtyRef.current = false;
      lastSavedRef.current = JSON.stringify({ title, content, excerpt, coverImage, status, categoryId, selectedTags, seoTitle, seoDescription });
      setSaveStatus("saved");

      // If new post, redirect to edit page
      if (!isEdit && data.data?.id) {
        router.push(`/admin/posts/${data.data.id}`);
      } else {
        router.refresh();
      }

      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      setSaveStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }, [title, content, excerpt, coverImage, status, categoryId, selectedTags, seoTitle, seoDescription, isEdit, post?.id, router]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!isEdit) return;
    const interval = setInterval(() => {
      save(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [isEdit, save]);

  function toggleTag(tagId: number) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* Main area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title input */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان المقالة..."
          style={{
            ...inputStyle,
            fontSize: 22,
            fontWeight: 700,
            padding: "14px 16px",
            marginBottom: 16,
            background: "var(--bg-secondary)",
          }}
        />

        {/* Editor */}
        <TiptapEditor content={content} onChange={setContent} />
      </div>

      {/* Side panel */}
      <div
        style={{
          width: 300,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Save button + status */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <button
            onClick={() => save(false)}
            disabled={saving}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 6,
              border: "none",
              background: "var(--accent)",
              color: "var(--bg-primary)",
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "نشر المقالة"}
          </button>
          {saveStatus === "saved" && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#10b981", textAlign: "center" }}>
              تم الحفظ
            </div>
          )}
          {errorMsg && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#ef4444", textAlign: "center" }}>
              {errorMsg}
            </div>
          )}
        </div>

        {/* Status */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <label style={labelStyle}>الحالة</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="DRAFT">مسودة</option>
            <option value="PUBLISHED">منشور</option>
            <option value="ARCHIVED">مؤرشف</option>
          </select>
        </div>

        {/* Category */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <label style={labelStyle}>التصنيف</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">بدون تصنيف</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <label style={labelStyle}>الوسوم</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 9999,
                  fontSize: 12,
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  background: selectedTags.includes(tag.id)
                    ? "var(--accent)"
                    : "transparent",
                  color: selectedTags.includes(tag.id)
                    ? "var(--bg-primary)"
                    : "var(--text-secondary)",
                }}
              >
                {tag.name}
              </button>
            ))}
            {tags.length === 0 && (
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                لا توجد وسوم
              </span>
            )}
          </div>
        </div>

        {/* Excerpt */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <label style={labelStyle}>المقتطف</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="وصف مختصر للمقالة..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Cover Image */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <label style={labelStyle}>صورة الغلاف</label>
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="رابط الصورة..."
            style={inputStyle}
          />
          {coverImage && (
            <img
              src={coverImage}
              alt="غلاف"
              style={{
                width: "100%",
                borderRadius: 6,
                marginTop: 8,
                maxHeight: 150,
                objectFit: "cover",
              }}
            />
          )}
        </div>

        {/* SEO */}
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <label style={{ ...labelStyle, marginBottom: 12, fontWeight: 600, color: "var(--text-primary)" }}>
            SEO
          </label>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>عنوان SEO</label>
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="عنوان محركات البحث..."
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>وصف SEO</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={3}
              placeholder="وصف محركات البحث..."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
