export const colors = {
  bg: "#050506",
  surface: "#0c0c0f",
  card: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.08)",
  glass: "rgba(22,22,26,0.92)",
  glassBorder: "rgba(255,255,255,0.1)",
  accent: "#ff6b2b",
  accentSoft: "#ff8f4c",
  accentGlow: "rgba(255,107,43,0.15)",
  text: "#ffffff",
  textMuted: "#a1a1aa",
  textDim: "#71717a",
  fresh: "#3dd68c",
  fatigued: "#ff5c5c",
  neutral: "#8b8b96",
  blue: "#4d9fff",
  green: "#3dd68c",
  amber: "#fbbf24",
  error: "#f87171",
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const spacing = {
  screen: 20,
  card: 16,
  gap: 12,
  section: 20,
};

export const type = {
  label: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.8, textTransform: "uppercase" as const },
  title: { fontSize: 28, fontWeight: "800" as const },
  subtitle: { fontSize: 14, fontWeight: "500" as const },
  body: { fontSize: 15, fontWeight: "500" as const },
  stat: { fontSize: 26, fontWeight: "800" as const },
};

export const bento = {
  blue: { bg: ["#141c2d", "#0a0c12"] as const, border: "rgba(77,159,255,0.18)", accent: colors.blue },
  orange: { bg: ["#28160c", "#0c0a08"] as const, border: "rgba(255,107,43,0.18)", accent: colors.accent },
  green: { bg: ["#0c2018", "#080e0a"] as const, border: "rgba(61,214,140,0.18)", accent: colors.green },
};

export const coachTone = {
  fresh: { border: "rgba(61,214,140,0.25)", bg: ["rgba(61,214,140,0.12)", "rgba(61,214,140,0.04)"] as const, text: "#6ee7b7" },
  balanced: { border: "rgba(255,255,255,0.1)", bg: ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"] as const, text: "#f4f4f5" },
  building: { border: "rgba(251,191,36,0.25)", bg: ["rgba(251,191,36,0.12)", "rgba(251,191,36,0.04)"] as const, text: "#fcd34d" },
  risk: { border: "rgba(248,113,113,0.25)", bg: ["rgba(248,113,113,0.12)", "rgba(248,113,113,0.04)"] as const, text: "#fca5a5" },
};
