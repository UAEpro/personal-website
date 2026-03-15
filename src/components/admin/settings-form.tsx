"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SiteSettings {
  theme: { preset?: string; accent?: string };
  socialToggles: { x?: boolean; instagram?: boolean; snapchat?: boolean };
  socialLinks: {
    xUrl?: string;
    instagramUrl?: string;
    snapchatUrl?: string;
    instagramToken?: string;
  };
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
];

const themePresets = [
  { id: "orange", color: "#f97316", label: "برتقالي" },
  { id: "emerald", color: "#10b981", label: "أخضر" },
  { id: "cyan", color: "#06b6d4", label: "سماوي" },
  { id: "red", color: "#ef4444", label: "أحمر" },
  { id: "amber", color: "#f59e0b", label: "عنبري" },
  { id: "syntax", color: "#cba6f7", label: "بنفسجي" },
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
  const [themePreset, setThemePreset] = useState(settings.theme?.preset || "orange");
  const [customColor, setCustomColor] = useState(settings.theme?.accent || "#f97316");

  // Social state
  const [socialToggles, setSocialToggles] = useState(
    settings.socialToggles || { x: false, instagram: false, snapchat: false }
  );
  const [socialLinks, setSocialLinks] = useState(
    settings.socialLinks || {
      xUrl: "",
      instagramUrl: "",
      snapchatUrl: "",
      instagramToken: "",
    }
  );

  // SEO state
  const [seoTitle, setSeoTitle] = useState(settings.seoDefaults?.title || "");
  const [seoDescription, setSeoDescription] = useState(settings.seoDefaults?.description || "");
  const [seoOgImage, setSeoOgImage] = useState(settings.seoDefaults?.ogImage || "");

  // Content state
  const [heroTagline, setHeroTagline] = useState(settings.heroTagline || "");
  const [aboutContent, setAboutContent] = useState(settings.aboutContent || "");

  // API state
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

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
        setGeneratedKey(result.data.apiKey);
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
    saveSettings({ socialToggles, socialLinks });
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
              الألوان المحددة مسبقاً
            </h3>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {themePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setThemePreset(preset.id);
                    setCustomColor(preset.color);
                  }}
                  style={{
                    width: 80,
                    padding: "12px 8px",
                    borderRadius: 8,
                    border:
                      themePreset === preset.id
                        ? `2px solid ${preset.color}`
                        : "2px solid var(--border)",
                    background: themePreset === preset.id ? `${preset.color}15` : "var(--bg-primary)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: preset.color,
                    }}
                  />
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
              لون مخصص
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
            {(["x", "instagram", "snapchat"] as const).map((platform) => {
              const labels: Record<string, { name: string; urlKey: string }> = {
                x: { name: "X (تويتر)", urlKey: "xUrl" },
                instagram: { name: "انستغرام", urlKey: "instagramUrl" },
                snapchat: { name: "سناب شات", urlKey: "snapchatUrl" },
              };
              const info = labels[platform];
              return (
                <div
                  key={platform}
                  style={{
                    marginBottom: 20,
                    paddingBottom: 20,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>
                      {info.name}
                    </span>
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
      </div>
    </div>
  );
}
