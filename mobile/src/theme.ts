export const colors = {
  bg: "#050507",
  bgElevated: "#0c0d11",
  surface: "#111318",
  surfaceRaised: "#171a21",
  card: "rgba(255,255,255,0.03)",
  cardBorder: "rgba(255,255,255,0.06)",
  glass: "rgba(14,15,20,0.88)",
  glassBorder: "rgba(255,255,255,0.08)",
  accent: "#ff6b35",
  accentSoft: "#ff8a5c",
  accentGlow: "rgba(255,107,53,0.14)",
  accentSubtle: "rgba(255,107,53,0.08)",
  text: "#f8fafc",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  fresh: "#34d399",
  fatigued: "#fb7185",
  neutral: "#94a3b8",
  blue: "#60a5fa",
  green: "#34d399",
  amber: "#fbbf24",
  error: "#f87171",
  divider: "rgba(255,255,255,0.06)",
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
};

export const spacing = {
  screen: 18,
  card: 16,
  gap: 10,
  section: 16,
};

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  float: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const type = {
  eyebrow: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 0.3 },
  display: { fontSize: 32, fontWeight: "800" as const, letterSpacing: -0.8 },
  title: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, fontWeight: "500" as const },
  body: { fontSize: 15, fontWeight: "500" as const },
  label: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.6, textTransform: "uppercase" as const },
  stat: { fontSize: 22, fontWeight: "800" as const, letterSpacing: -0.5 },
  caption: { fontSize: 12, fontWeight: "500" as const },
};

export const bento = {
  blue: { bg: ["#0f1729", "#0a0d14"] as const, border: "rgba(96,165,250,0.2)", accent: colors.blue },
  orange: { bg: ["#1c1008", "#0d0a08"] as const, border: "rgba(255,107,53,0.2)", accent: colors.accent },
  green: { bg: ["#0a1a14", "#080d0a"] as const, border: "rgba(52,211,153,0.2)", accent: colors.green },
};

export const coachTone = {
  fresh: { border: "rgba(52,211,153,0.2)", bg: ["rgba(52,211,153,0.1)", "rgba(52,211,153,0.03)"] as const, text: "#6ee7b7" },
  balanced: { border: "rgba(255,255,255,0.08)", bg: ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"] as const, text: "#f1f5f9" },
  building: { border: "rgba(251,191,36,0.2)", bg: ["rgba(251,191,36,0.1)", "rgba(251,191,36,0.03)"] as const, text: "#fcd34d" },
  risk: { border: "rgba(248,113,113,0.2)", bg: ["rgba(248,113,113,0.1)", "rgba(248,113,113,0.03)"] as const, text: "#fca5a5" },
};
