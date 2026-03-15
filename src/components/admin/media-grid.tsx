"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string | null;
  createdAt: string;
}

export default function MediaGrid({ media }: { media: MediaItem[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      try {
        for (const file of Array.from(files)) {
          const formData = new FormData();
          formData.append("file", file);
          await fetch("/api/media", { method: "POST", body: formData });
        }
        router.refresh();
      } catch {
        alert("فشل رفع الملف");
      } finally {
        setUploading(false);
      }
    },
    [router]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      upload(e.dataTransfer.files);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذا الملف؟")) return;
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      router.refresh();
    } else {
      alert(data.error || "فشل الحذف");
    }
  }

  function copyUrl(id: number, url: string) {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <div>
      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 8,
          padding: 40,
          textAlign: "center",
          cursor: "pointer",
          marginBottom: 24,
          background: dragOver ? "rgba(249,115,22,0.05)" : "var(--bg-secondary)",
          transition: "all 0.15s ease",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={(e) => e.target.files && upload(e.target.files)}
          style={{ display: "none" }}
        />
        <div style={{ fontSize: 32, marginBottom: 8 }}>
          {uploading ? "⏳" : "📁"}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          {uploading
            ? "جاري الرفع..."
            : "اسحب الملفات هنا أو اضغط للرفع"}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
          صور (JPEG, PNG, GIF, WebP, SVG) أو PDF — حد أقصى 10MB
        </div>
      </div>

      {/* Media grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {media.map((item) => (
          <div
            key={item.id}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                height: 140,
                background: "var(--bg-terminal)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {isImage(item.mimeType) ? (
                <img
                  src={item.url}
                  alt={item.alt || item.originalName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 32 }}>📄</span>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: "10px 12px" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: 4,
                }}
                title={item.originalName}
              >
                {item.originalName}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 8 }}>
                {formatSize(item.size)}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => copyUrl(item.id, item.url)}
                  style={{
                    fontSize: 11,
                    color: copied === item.id ? "#10b981" : "var(--accent)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {copied === item.id ? "تم النسخ" : "نسخ الرابط"}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    fontSize: 11,
                    color: "#ef4444",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {media.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: "var(--text-secondary)",
            fontSize: 14,
          }}
        >
          لا توجد ملفات وسائط بعد
        </div>
      )}
    </div>
  );
}
