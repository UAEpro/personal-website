"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SiteSettings {
  theme: { preset?: string; accent?: string };
  socialToggles: { x?: boolean; instagram?: boolean; snapchat?: boolean; github?: boolean };
  socialLinks: {
    xUrl?: string;
    instagramUrl?: string;
    snapchatUrl?: string;
    instagramToken?: string;
    githubUrl?: string;
  };
  socialOrder?: string[];
  seoDefaults: { title?: string; description?: string; ogImage?: string };
  aboutContent: string;
  heroTagline: string;
  apiKeyHash: string;
}

interface SettingsFormProps {
  settings: SiteSettings;
}

const tabs = [
  { id: "theme", label: "المظهر" },
  { id: "social", label: "التواصل الاجتماعي" },
  { id: "seo", label: "SEO" },
  { id: "content", label: "المحتوى" },
  { id: "api", label: "API" },
  { id: "skill", label: "المهارة" },
];

const themePresetsList = [
  { id: "carbon-orange", label: "كربوني برتقالي", accent: "#f97316", bgPrimary: "#111113", bgSecondary: "#1a1a1e" },
  { id: "midnight-purple", label: "بنفسجي ليلي", accent: "#a78bfa", bgPrimary: "#0f0c29", bgSecondary: "#1a1540" },
  { id: "ocean-cyan", label: "محيط سماوي", accent: "#06b6d4", bgPrimary: "#0c1222", bgSecondary: "#131d33" },
  { id: "ember-red", label: "أحمر ملتهب", accent: "#ef4444", bgPrimary: "#120c0c", bgSecondary: "#1e1414" },
  { id: "forest-green", label: "غابة خضراء", accent: "#10b981", bgPrimary: "#0c1210", bgSecondary: "#141e1a" },
];

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

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("theme");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Theme state
  const [themePreset, setThemePreset] = useState(settings.theme?.preset || "carbon-orange");
  const [customColor, setCustomColor] = useState(settings.theme?.accent || "#f97316");

  // Social state
  const [socialToggles, setSocialToggles] = useState(
    settings.socialToggles || { x: false, instagram: false, snapchat: false, github: false }
  );
  const [socialLinks, setSocialLinks] = useState(
    settings.socialLinks || {
      xUrl: "",
      instagramUrl: "",
      snapchatUrl: "",
      instagramToken: "",
      githubUrl: "",
    }
  );
  type Platform = "x" | "instagram" | "snapchat" | "github";
  const [socialOrder, setSocialOrder] = useState<Platform[]>(
    (settings.socialOrder as Platform[]) || ["x", "instagram", "snapchat", "github"]
  );
  const [dragItem, setDragItem] = useState<number | null>(null
  );

  // SEO state
  const [seoTitle, setSeoTitle] = useState(settings.seoDefaults?.title || "");
  const [seoDescription, setSeoDescription] = useState(settings.seoDefaults?.description || "");
  const [seoOgImage, setSeoOgImage] = useState(settings.seoDefaults?.ogImage || "");

  // Content state
  const [heroTagline, setHeroTagline] = useState(settings.heroTagline || "");
  const [aboutContent, setAboutContent] = useState(settings.aboutContent || "");

  // API state — persist key in localStorage so it survives page refresh
  const [generatedKey, setGeneratedKey] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("uaepro_api_key");
    }
    return null;
  });

  const saveGeneratedKey = (key: string) => {
    setGeneratedKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("uaepro_api_key", key);
    }
  };

  // Skill tab state
  const [skillCopied, setSkillCopied] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);

  const curlInstallCmd = `mkdir -p ~/.claude/skills && curl -o ~/.claude/skills/uaepro-blog.md ${process.env.NEXT_PUBLIC_SITE_URL || "https://uaepro.me"}/api/skill -H "Authorization: Bearer YOUR_API_KEY"`;

  async function handleDownloadSkill() {
    const res = await fetch("/api/skill");
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uaepro-blog.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopySkill() {
    const res = await fetch("/api/skill");
    if (!res.ok) return;
    const text = await res.text();
    await navigator.clipboard.writeText(text);
    setSkillCopied(true);
    setTimeout(() => setSkillCopied(false), 2000);
  }

  function handleCopyCurl() {
    navigator.clipboard.writeText(curlInstallCmd);
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 2000);
  }

  async function saveSettings(data: Record<string, unknown>) {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      if (result.data?.apiKey) {
        saveGeneratedKey(result.data.apiKey);
      }

      setMessage("تم الحفظ بنجاح");
      router.refresh();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  function handleSaveTheme() {
    saveSettings({
      theme: { preset: themePreset, accent: customColor },
    });
  }

  function handleSaveSocial() {
    saveSettings({ socialToggles, socialLinks, socialOrder });
  }

  function handleSaveSeo() {
    saveSettings({
      seoDefaults: { title: seoTitle, description: seoDescription, ogImage: seoOgImage },
    });
  }

  function handleSaveContent() {
    saveSettings({ heroTagline, aboutContent });
  }

  function handleRegenerateApiKey() {
    if (!confirm("سيتم إنشاء مفتاح جديد وإلغاء المفتاح القديم. هل أنت متأكد؟")) return;
    saveSettings({ regenerateApiKey: true });
  }

  return (
    <div>
      {/* Tabs */}
      <div
        className="settings-tabs"
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--border)",
          marginBottom: 24,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === tab.id ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? 600 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status message */}
      {message && (
        <div
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 13,
            background: message.includes("فشل") ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
            color: message.includes("فشل") ? "#ef4444" : "#10b981",
          }}
        >
          {message}
        </div>
      )}

      <div
        className="settings-content"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 24,
        }}
      >
        {/* Theme Tab */}
        {activeTab === "theme" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
              المظاهر
            </h3>
            <div className="theme-presets-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
              {themePresetsList.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setThemePreset(preset.id);
                    setCustomColor(preset.accent);
                  }}
                  style={{
                    padding: 0,
                    borderRadius: 10,
                    border:
                      themePreset === preset.id
                        ? `2px solid ${preset.accent}`
                        : "2px solid var(--border)",
                    background: "transparent",
                    cursor: "pointer",
                    overflow: "hidden",
                    textAlign: "center",
                  }}
                >
                  {/* Mini preview */}
                  <div
                    style={{
                      height: 64,
                      background: preset.bgPrimary,
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: 8,
                    }}
                  >
                    {/* Simulated secondary block */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        background: preset.bgSecondary,
                        border: `1px solid ${preset.accent}33`,
                      }}
                    />
                    {/* Accent circle */}
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: preset.accent,
                      }}
                    />
                    {/* Simulated text lines */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <div style={{ width: 32, height: 4, borderRadius: 2, background: "#e4e4e780" }} />
                      <div style={{ width: 24, height: 3, borderRadius: 2, background: "#88888860" }} />
                    </div>
                  </div>
                  {/* Label */}
                  <div
                    style={{
                      padding: "8px 4px",
                      fontSize: 12,
                      color: themePreset === preset.id ? preset.accent : "var(--text-secondary)",
                      fontWeight: themePreset === preset.id ? 600 : 400,
                      background: themePreset === preset.id ? `${preset.accent}10` : "var(--bg-primary)",
                    }}
                  >
                    {preset.label}
                  </div>
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
              لون مخصص (يُطبق فوق المظهر المختار)
            </h3>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                style={{
                  width: 48,
                  height: 36,
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  cursor: "pointer",
                  background: "var(--bg-primary)",
                }}
              />
              <input
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                style={{ ...inputStyle, width: 120 }}
              />
            </div>

            <button
              onClick={handleSaveTheme}
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: 6,
                border: "none",
                background: "var(--accent)",
                color: "var(--bg-primary)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {saving ? "جاري الحفظ..." : "حفظ المظهر"}
            </button>
          </div>
        )}

        {/* Social Tab */}
        {activeTab === "social" && (
          <div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
              اسحب لتغيير ترتيب العرض في الموقع
            </p>
            {socialOrder.map((platform: Platform, index: number) => {
              const labels: Record<Platform, { name: string; urlKey: string; icon: string }> = {
                x: { name: "X (تويتر)", urlKey: "xUrl", icon: "𝕏" },
                instagram: { name: "انستغرام", urlKey: "instagramUrl", icon: "📷" },
                snapchat: { name: "سناب شات", urlKey: "snapchatUrl", icon: "👻" },
                github: { name: "GitHub", urlKey: "githubUrl", icon: "🐙" },
              };
              const info = labels[platform];
              if (!info) return null;
              return (
                <div
                  key={platform}
                  draggable
                  onDragStart={() => setDragItem(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragItem === null || dragItem === index) return;
                    const newOrder = [...socialOrder];
                    const item = newOrder.splice(dragItem, 1)[0];
                    newOrder.splice(index, 0, item);
                    setSocialOrder(newOrder);
                    setDragItem(index);
                  }}
                  onDragEnd={() => setDragItem(null)}
                  style={{
                    marginBottom: 20,
                    paddingBottom: 20,
                    borderBottom: "1px solid var(--border)",
                    opacity: dragItem === index ? 0.5 : 1,
                    cursor: "grab",
                    transition: "opacity 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: 16, cursor: "grab", userSelect: "none" }}>⠿</span>
                      <span style={{ fontSize: 16 }}>{info.icon}</span>
                      <span style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>
                        {info.name}
                      </span>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <div
                        onClick={() =>
                          setSocialToggles((prev) => ({
                            ...prev,
                            [platform]: !prev[platform],
                          }))
                        }
                        style={{
                          width: 40,
                          height: 22,
                          borderRadius: 11,
                          background: socialToggles[platform] ? "var(--accent)" : "var(--border)",
                          position: "relative",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "white",
                            position: "absolute",
                            top: 2,
                            right: socialToggles[platform] ? 2 : 20,
                            transition: "right 0.2s",
                          }}
                        />
                      </div>
                    </label>
                  </div>
                  {socialToggles[platform] && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input
                        value={(socialLinks as Record<string, string>)[info.urlKey] || ""}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({
                            ...prev,
                            [info.urlKey]: e.target.value,
                          }))
                        }
                        placeholder={`رابط ${info.name}`}
                        style={inputStyle}
                      />
                      {platform === "instagram" && (
                        <input
                          value={socialLinks.instagramToken || ""}
                          onChange={(e) =>
                            setSocialLinks((prev) => ({
                              ...prev,
                              instagramToken: e.target.value,
                            }))
                          }
                          placeholder="Instagram Access Token"
                          style={inputStyle}
                          type="password"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={handleSaveSocial}
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: 6,
                border: "none",
                background: "var(--accent)",
                color: "var(--bg-primary)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {saving ? "جاري الحفظ..." : "حفظ إعدادات التواصل"}
            </button>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>عنوان الموقع</label>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                style={inputStyle}
                placeholder="UAEpro"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>وصف الموقع</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="وصف مختصر للموقع..."
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>صورة OG</label>
              <input
                value={seoOgImage}
                onChange={(e) => setSeoOgImage(e.target.value)}
                style={inputStyle}
                placeholder="رابط صورة المشاركة..."
              />
            </div>

            <button
              onClick={handleSaveSeo}
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: 6,
                border: "none",
                background: "var(--accent)",
                color: "var(--bg-primary)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {saving ? "جاري الحفظ..." : "حفظ إعدادات SEO"}
            </button>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>شعار الصفحة الرئيسية</label>
              <input
                value={heroTagline}
                onChange={(e) => setHeroTagline(e.target.value)}
                style={inputStyle}
                placeholder="مبرمج | صانع محتوى | قيمر"
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>محتوى صفحة &quot;عنّي&quot;</label>
              <textarea
                value={aboutContent}
                onChange={(e) => setAboutContent(e.target.value)}
                rows={10}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "'IBM Plex Sans Arabic', system-ui" }}
                placeholder="اكتب محتوى صفحة عنّي..."
              />
            </div>

            <button
              onClick={handleSaveContent}
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: 6,
                border: "none",
                background: "var(--accent)",
                color: "var(--bg-primary)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {saving ? "جاري الحفظ..." : "حفظ المحتوى"}
            </button>
          </div>
        )}

        {/* API Tab */}
        {activeTab === "api" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
              مفتاح API
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
              يُستخدم هذا المفتاح للوصول إلى API من تطبيقات خارجية.
            </p>

            <div
              style={{
                padding: "12px 16px",
                borderRadius: 6,
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                marginBottom: 16,
                fontFamily: "monospace",
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              {generatedKey
                ? generatedKey
                : settings.apiKeyHash
                  ? "••••••••••••••••••••••••••••••••"
                  : "لم يتم إنشاء مفتاح بعد"}
            </div>

            {generatedKey && (
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  background: "rgba(245,158,11,0.15)",
                  color: "#f59e0b",
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                احفظ هذا المفتاح الآن — لن يتم عرضه مرة أخرى.
              </div>
            )}

            <button
              onClick={handleRegenerateApiKey}
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: 6,
                border: "none",
                background: "#ef4444",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {saving ? "جاري الإنشاء..." : settings.apiKeyHash ? "إعادة إنشاء المفتاح" : "إنشاء مفتاح جديد"}
            </button>
          </div>
        )}

        {/* Skill Tab */}
        {activeTab === "skill" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              مهارة Claude Code
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
              هذه المهارة تتيح لـ Claude Code إدارة مقالات المدونة مباشرةً من سطر الأوامر.
              يمكنك كتابة مقالات، نشرها، وتعديلها بالكلام الطبيعي.
            </p>

            {/* Step 1: API Key */}
            <div style={{ marginBottom: 24, padding: 16, borderRadius: 8, background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ background: "var(--accent)", color: "var(--bg-primary)", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>1</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>مفتاح API</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
                {generatedKey ? "احفظ هذا المفتاح — ستحتاجه في الخطوة التالية. لن يظهر مرة أخرى." : settings.apiKeyHash ? "لديك مفتاح بالفعل. إذا نسيته، أنشئ واحداً جديداً." : "أنشئ مفتاح API أولاً."}
              </p>
              <div style={{ padding: "10px 14px", borderRadius: 6, background: "var(--bg-secondary)", border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 13, color: generatedKey ? "var(--accent)" : "var(--text-secondary)", marginBottom: 12, wordBreak: "break-all" }}>
                {generatedKey || (settings.apiKeyHash ? "••••••••••••••••••••••••••••••••" : "لم يتم إنشاء مفتاح بعد")}
              </div>
              {generatedKey && (
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedKey); }}
                  style={{ padding: "6px 14px", borderRadius: 4, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", marginLeft: 8 }}
                >
                  نسخ المفتاح
                </button>
              )}
              <button
                onClick={handleRegenerateApiKey}
                disabled={saving}
                style={{ padding: "6px 14px", borderRadius: 4, border: "none", background: generatedKey ? "var(--border)" : "var(--accent)", color: generatedKey ? "var(--text-secondary)" : "var(--bg-primary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                {saving ? "..." : settings.apiKeyHash ? "إنشاء مفتاح جديد" : "إنشاء مفتاح"}
              </button>
            </div>

            {/* Step 2: Install */}
            <div style={{ marginBottom: 24, padding: 16, borderRadius: 8, background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ background: "var(--accent)", color: "var(--bg-primary)", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>2</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>تثبيت المهارة في Claude Code</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
                انسخ هذا الأمر وشغّله في Terminal. سيُنشئ مجلد المهارة ويحمّل الملف مع مفتاح API مدمج:
              </p>
              <div style={{ position: "relative" }}>
                <pre style={{ padding: "12px 14px", borderRadius: 6, background: "var(--bg-secondary)", border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 11, color: "var(--text-secondary)", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0, lineHeight: 1.6 }}>
{`mkdir -p ~/.claude/skills/uaepro-blog && curl -s -o ~/.claude/skills/uaepro-blog/SKILL.md "${typeof window !== "undefined" ? window.location.origin : "https://uaepro.me"}/api/skill${generatedKey ? `?key=${generatedKey}` : ""}" -H "Authorization: Bearer ${generatedKey || "<YOUR_API_KEY>"}"${generatedKey ? "" : `

# استبدل <YOUR_API_KEY> بمفتاح API من الخطوة 1`}`}
                </pre>
                <button
                  onClick={() => {
                    const cmd = `mkdir -p ~/.claude/skills/uaepro-blog && curl -s -o ~/.claude/skills/uaepro-blog/SKILL.md "${window.location.origin}/api/skill${generatedKey ? `?key=${generatedKey}` : ""}" -H "Authorization: Bearer ${generatedKey || "<YOUR_API_KEY>"}"`;
                    navigator.clipboard.writeText(cmd);
                    setCurlCopied(true);
                    setTimeout(() => setCurlCopied(false), 2000);
                  }}
                  style={{ position: "absolute", top: 8, left: 8, padding: "4px 10px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-secondary)", fontSize: 11, cursor: "pointer" }}
                >
                  {curlCopied ? "تم!" : "نسخ"}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 8 }}>
                المسار: <code style={{ fontFamily: "monospace", color: "var(--accent)" }}>~/.claude/skills/uaepro-blog/SKILL.md</code>
              </p>
            </div>

            {/* Step 3: Use */}
            <div style={{ marginBottom: 24, padding: 16, borderRadius: 8, background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ background: "var(--accent)", color: "var(--bg-primary)", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>3</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>الاستخدام</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.7 }}>
                بعد التثبيت، افتح Claude Code وقل أي شيء مثل:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "اكتب لي مقال عن الذكاء الاصطناعي",
                  "شوف مسوداتي في المدونة",
                  "انشر المقال رقم 5",
                  "write a blog post about Next.js",
                ].map((ex) => (
                  <div key={ex} style={{ padding: "8px 12px", borderRadius: 6, background: "var(--bg-secondary)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif" }}>
                    &ldquo;{ex}&rdquo;
                  </div>
                ))}
              </div>
            </div>

            {/* Download as file button */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleDownloadSkill}
                style={{ padding: "10px 20px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 13, cursor: "pointer" }}
              >
                تحميل SKILL.md
              </button>
              <button
                onClick={handleCopySkill}
                style={{ padding: "10px 20px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 13, cursor: "pointer" }}
              >
                {skillCopied ? "تم النسخ!" : "نسخ محتوى المهارة"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
