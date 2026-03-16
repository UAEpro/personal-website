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

interface MediaItem {
  id: number;
  url: string;
  originalName: string;
  mimeType: string;
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

  // Inline create state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [localTags, setLocalTags] = useState<Tag[]>(tags);

  // Cover image state
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const coverSectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleCreateCategory() {
    if (!newCategoryName.trim() || creatingCategory) return;
    setCreatingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const newCat = data.data as Category;
        setLocalCategories((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
        setCategoryId(String(newCat.id));
        setNewCategoryName("");
      }
    } catch {
      // silent
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleCreateTag() {
    if (!newTagName.trim() || creatingTag) return;
    setCreatingTag(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const newTag = data.data as Tag;
        setLocalTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedTags((prev) => [...prev, newTag.id]);
        setNewTagName("");
      }
    } catch {
      // silent
    } finally {
      setCreatingTag(false);
    }
  }

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: form });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setCoverImage(data.data.url);
      }
    } catch {
      // silent
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleOpenGallery() {
    setShowGallery(true);
    setLoadingGallery(true);
    try {
      const res = await fetch("/api/media?limit=50");
      const data = await res.json();
      if (data.success && data.data) {
        setGalleryItems(data.data);
      }
    } catch {
      // silent
    } finally {
      setLoadingGallery(false);
    }
  }

  // Paste handler for cover image section
  useEffect(() => {
    const el = coverSectionRef.current;
    if (!el) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items || []);
      const imageItem = items.find((item) => item.type.startsWith("image/"));
      if (imageItem) {
        e.preventDefault();
        const file = imageItem.getAsFile();
        if (file) handleCoverUpload(file);
      }
    };
    el.addEventListener("paste", handlePaste);
    return () => el.removeEventListener("paste", handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="post-form-layout" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
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
        className="post-form-sidebar"
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
            style={{ ...inputStyle, cursor: "pointer", marginBottom: 8 }}
          >
            <option value="">بدون تصنيف</option>
            {localCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="تصنيف جديد..."
              style={{ ...inputStyle, fontSize: 12 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleCreateCategory(); }
              }}
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={creatingCategory || !newCategoryName.trim()}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-primary)",
                color: "var(--accent)",
                fontSize: 16,
                cursor: "pointer",
                flexShrink: 0,
                opacity: creatingCategory || !newCategoryName.trim() ? 0.5 : 1,
              }}
            >
              +
            </button>
          </div>
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {localTags.map((tag) => (
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
            {localTags.length === 0 && (
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                لا توجد وسوم
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="وسم جديد..."
              style={{ ...inputStyle, fontSize: 12 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleCreateTag(); }
              }}
            />
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={creatingTag || !newTagName.trim()}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-primary)",
                color: "var(--accent)",
                fontSize: 16,
                cursor: "pointer",
                flexShrink: 0,
                opacity: creatingTag || !newTagName.trim() ? 0.5 : 1,
              }}
            >
              +
            </button>
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
          ref={coverSectionRef}
          tabIndex={0}
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            outline: "none",
          }}
        >
          <label style={labelStyle}>صورة الغلاف</label>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCoverUpload(file);
              e.target.value = "";
            }}
          />

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCover}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {uploadingCover ? "جاري الرفع..." : "رفع صورة"}
            </button>
            <button
              type="button"
              onClick={handleOpenGallery}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              اختر من المعرض
            </button>
          </div>

          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 8px 0" }}>
            يمكنك لصق صورة من الحافظة (Ctrl+V) في هذا القسم
          </p>

          {/* URL input fallback */}
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="أو أدخل رابط الصورة..."
            style={{ ...inputStyle, fontSize: 12 }}
          />

          {coverImage && (
            <div style={{ position: "relative", marginTop: 8 }}>
              <img
                src={coverImage}
                alt="غلاف"
                style={{
                  width: "100%",
                  borderRadius: 6,
                  maxHeight: 150,
                  objectFit: "cover",
                }}
              />
              <button
                type="button"
                onClick={() => setCoverImage("")}
                style={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                x
              </button>
            </div>
          )}
        </div>

        {/* Gallery Modal */}
        {showGallery && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowGallery(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 20,
                width: "90%",
                maxWidth: 600,
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: "var(--text-primary)" }}>
                  اختر صورة من المعرض
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGallery(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-secondary)",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  x
                </button>
              </div>
              {loadingGallery ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
                  جاري التحميل...
                </div>
              ) : galleryItems.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
                  لا توجد صور
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                  {galleryItems
                    .filter((m) => m.mimeType.startsWith("image/"))
                    .map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setCoverImage(m.url);
                          setShowGallery(false);
                        }}
                        style={{
                          padding: 0,
                          border: coverImage === m.url ? "2px solid var(--accent)" : "2px solid var(--border)",
                          borderRadius: 8,
                          overflow: "hidden",
                          cursor: "pointer",
                          background: "var(--bg-primary)",
                          aspectRatio: "1",
                        }}
                      >
                        <img
                          src={m.url}
                          alt={m.originalName}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

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
