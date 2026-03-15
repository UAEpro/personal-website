"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useState } from "react";
import type { EditorView } from "@tiptap/pm/view";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const btnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--text-secondary)",
  padding: "4px 8px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 13,
  lineHeight: 1,
  minWidth: 28,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const activeBtnStyle: React.CSSProperties = {
  ...btnStyle,
  background: "var(--accent)",
  color: "var(--bg-primary)",
  borderColor: "var(--accent)",
};

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={active ? activeBtnStyle : btnStyle}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [uploading, setUploading] = useState(false);

  const uploadAndInsertImage = useCallback(async (file: File, view: EditorView) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: form });
      const data = await res.json();
      if (data.success && data.data?.url) {
        const { tr } = view.state;
        const pos = view.state.selection.from;
        const node = view.state.schema.nodes.image.create({ src: data.data.url });
        view.dispatch(tr.insert(pos, node));
      }
    } catch {
      // Upload failed silently
    } finally {
      setUploading(false);
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: false,
        horizontalRule: {},
      }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "ابدأ الكتابة هنا..." }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "arabic-content",
        dir: "rtl",
        style:
          "min-height: 400px; padding: 20px; outline: none; font-size: 16px; line-height: 1.8; color: var(--text-primary);",
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find(item => item.type.startsWith("image/"));
        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) uploadAndInsertImage(file, view);
          return true;
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFile = files.find(f => f.type.startsWith("image/"));
        if (imageFile) {
          event.preventDefault();
          uploadAndInsertImage(imageFile, view);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
    // Only run when content prop changes from outside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const insertImage = useCallback(() => {
    const url = prompt("رابط الصورة:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertLink = useCallback(() => {
    const url = prompt("رابط:", "https://");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--bg-terminal)",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          padding: "8px 12px",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="H1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="H2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="H3"
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          title="H4"
        >
          H4
        </ToolbarButton>

        <span style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />

        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="غامق"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="مائل"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="تسطير"
        >
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="يتوسطه خط"
        >
          <s>S</s>
        </ToolbarButton>

        <span style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />

        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="قائمة نقطية"
        >
          •
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="قائمة مرقمة"
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="اقتباس"
        >
          &ldquo;
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="كود"
        >
          {"</>"}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="خط فاصل"
        >
          ―
        </ToolbarButton>

        <span style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />

        <ToolbarButton onClick={insertImage} title="إدراج صورة">
          IMG
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("link")}
          onClick={insertLink}
          title="رابط"
        >
          🔗
        </ToolbarButton>

        <span style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />

        <ToolbarButton
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="محاذاة يمين"
        >
          ≡→
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="توسيط"
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="محاذاة يسار"
        >
          ←≡
        </ToolbarButton>

        <span style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="تراجع"
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="إعادة"
        >
          ↷
        </ToolbarButton>
      </div>

      {/* Uploading indicator */}
      {uploading && (
        <div
          style={{
            padding: "6px 12px",
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border)",
            fontSize: 12,
            color: "var(--accent)",
            textAlign: "center",
          }}
        >
          جاري رفع الصورة...
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
