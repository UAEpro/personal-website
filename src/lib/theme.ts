export interface ThemeConfig {
  accent: string;
  accentHover: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTerminal: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  dotGrid: string;
}

export const themePresets: Record<string, ThemeConfig> = {
  "carbon-orange": {
    accent: "#f97316",
    accentHover: "#ea580c",
    bgPrimary: "#111113",
    bgSecondary: "#1a1a1e",
    bgTerminal: "#0d0d0f",
    textPrimary: "#e4e4e7",
    textSecondary: "#888888",
    border: "#2a2a2e",
    dotGrid: "rgba(255,255,255,0.03)",
  },
  "midnight-purple": {
    accent: "#a78bfa",
    accentHover: "#8b5cf6",
    bgPrimary: "#0f0c29",
    bgSecondary: "#1a1540",
    bgTerminal: "#0a0820",
    textPrimary: "#e8e4f0",
    textSecondary: "#9990b0",
    border: "#2d2555",
    dotGrid: "rgba(167,139,250,0.04)",
  },
  "ocean-cyan": {
    accent: "#06b6d4",
    accentHover: "#0891b2",
    bgPrimary: "#0c1222",
    bgSecondary: "#131d33",
    bgTerminal: "#080e1a",
    textPrimary: "#e0eaf5",
    textSecondary: "#7a8fa8",
    border: "#1e2d45",
    dotGrid: "rgba(6,182,212,0.04)",
  },
  "ember-red": {
    accent: "#ef4444",
    accentHover: "#dc2626",
    bgPrimary: "#120c0c",
    bgSecondary: "#1e1414",
    bgTerminal: "#0e0808",
    textPrimary: "#f0e4e4",
    textSecondary: "#a08888",
    border: "#2e1e1e",
    dotGrid: "rgba(239,68,68,0.04)",
  },
  "forest-green": {
    accent: "#10b981",
    accentHover: "#059669",
    bgPrimary: "#0c1210",
    bgSecondary: "#141e1a",
    bgTerminal: "#080e0c",
    textPrimary: "#e0f0ea",
    textSecondary: "#7aa898",
    border: "#1e2e28",
    dotGrid: "rgba(16,185,129,0.04)",
  },
};

export function getThemeCSS(theme: { preset?: string; accent?: string }): string {
  const preset = themePresets[theme.preset || "carbon-orange"] || themePresets["carbon-orange"];
  return `
    :root {
      --bg-primary: ${preset.bgPrimary};
      --bg-secondary: ${preset.bgSecondary};
      --bg-terminal: ${preset.bgTerminal};
      --text-primary: ${preset.textPrimary};
      --text-secondary: ${preset.textSecondary};
      --accent: ${theme.accent || preset.accent};
      --accent-hover: ${preset.accentHover};
      --border: ${preset.border};
      --dot-grid: ${preset.dotGrid};
    }
  `;
}
