// SiteKit tokens — taken from the LIVE lanesite.pro page (verified 2026-11-11
// via the public page text; QA amendment also lists them).
// These are the real Maple Bakery demo tokens. SiteKit components are
// authored in composition space (480x854); the fixed composition scales
// them 2.25x to 1080x1920, so text stays vector-crisp.

export const SITE = {
  bg: "#f7f5f0",
  fg: "#1a1916",
  brass: "#8c6a34",
  brassSoft: "#F0E7D6",
  cream: "#FBF8F2",
  line: "#E8E0D2",
  muted: "#6E655A", // 5.72:1 on #f7f5f0 — text-safe (see phase1/tokens.ts)
  accent: "#FF5A2E", // film accent; large display type only
  accentText: "#C73E12", // white on this = 5.09:1 — small buttons
  green: "#1E9E5A",
  greenSoft: "#E4F5EA",
  radius: 26,
} as const;
