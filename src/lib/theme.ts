export const themePresets: Record<string, { accent: string; accentHover: string }> = {
  orange: { accent: "#f97316", accentHover: "#ea580c" },
  emerald: { accent: "#10b981", accentHover: "#059669" },
  cyan: { accent: "#06b6d4", accentHover: "#0891b2" },
  red: { accent: "#ef4444", accentHover: "#dc2626" },
  amber: { accent: "#f59e0b", accentHover: "#d97706" },
  syntax: { accent: "#cba6f7", accentHover: "#b48def" },
};

export function getThemeCSS(theme: { preset?: string; accent?: string }): string {
  const preset = themePresets[theme.preset || "orange"] || themePresets.orange;
  const accent = theme.accent || preset.accent;
  const accentHover = preset.accentHover;

  return `
    :root {
      --bg-primary: #111113;
      --bg-secondary: #1a1a1e;
      --bg-terminal: #0d0d0f;
      --text-primary: #e4e4e7;
      --text-secondary: #888888;
      --accent: ${accent};
      --accent-hover: ${accentHover};
      --border: #2a2a2e;
      --dot-grid: rgba(255, 255, 255, 0.03);
    }
  `;
}
