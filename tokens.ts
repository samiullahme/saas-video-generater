// LaneSite video — Phase 1 design tokens (1080x1920 master).
// All sizes below are FINAL output pixels at 1080x1920.
// The fixed 15s composition is authored in 480x854 composition space and
// scaled 2.25x by the render wrapper, so composition-space values are the
// final values divided by 2.25 (see SCALE in tokens and in the composition).
// Never use Math.random for motion — use frame-driven sin/spring only.

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const SCALE = 2.25; // 1080 / 480

// Comp-space (480x854) helpers: comp(x) = final px / 2.25
export const comp = (finalPx: number) => finalPx / SCALE;

export const COLORS = {
  bg: "#0B0908", // film background (chat/product dark)
  card: "#FFFFFF",
  ink: "#141110",
  sub: "#6F6860", // body-grey on light — do NOT use below 18px (contrast)
  line: "#ECE6DA",
  accent: "#FF5A2E", // tomato — display type / icons / large text only
  accentSoft: "#FFE7DE",
  left: "#1C1917", // left (received) chat bubble
  leftText: "#F5EFE5",
  green: "#1E9E5A",
  greenSoft: "#E4F5EA",
  // Text-safe colours (WCAG, computed 2026-11-11 — see qa/harness.mjs):
  // #6E655A on white = 5.72:1, #5A5248 on white = 7.68:1.
  // #8A8072 on white is only 3.88:1 — NEVER for text; borders/decoration only.
  micro: "#5A5248", // microtext / captions on light backgrounds
  microLight: "#6E655A", // lightest grey allowed for small text (5.72:1)
  // White text on tomato is 3.11:1 — large display type only.
  // Buttons / small white-on-accent text must use this darker tomato:
  accentText: "#C73E12", // white on #C73E12 = 5.09:1
  gold: "#B08D57",
  cream: "#F6F0E4",
  teal: "#0F766E",
} as const;

// Safe zones at 1080x1920 (TikTok UI covers the bottom ~16.7% = 320px,
// top ~12% = 230px; right rail ~110px wide in the middle band).
export const SAFE = {
  bottomClearPx: 320, // 16.7% of 1920 — nothing interactive below this line
  bottomClearPct: 16.7,
  topClearPx: 230, // 12% of 1920
  rightRailPx: 110,
  sideMarginPx: 140, // QA: 140px side margins
  captionBottomPct: 24, // captions sit at 22-24% from the bottom
  captionBottomPx: 461, // 24% of 1920
  captionFontPx: 56, // 56-60px caption font at 1080
  captionFontMinPx: 56,
  captionFontMaxPx: 60,
} as const;

// Type scale at 1080x1920 (final px). Comp-space values = final / 2.25.
export const TYPE = {
  heroAntonPx: 198, // 88 * 2.25 — "NO WAY." etc.
  titleAntonPx: 135, // 60 * 2.25
  beatAntonPx: 108, // 48 * 2.25
  sectionAntonPx: 81, // 36 * 2.25
  bodyPx: 34, // 15 * 2.25
  smallPx: 27, // 12 * 2.25
  microPx: 25, // 11 * 2.25 — minimum body text size at 1080
  captionPx: 56,
  chipPx: 22, // 9.5 * 2.25 — chips are labels, min 20px
} as const;

export const CONTRAST_FLOOR = 4.5; // WCAG AA for normal text
export const CONTRAST_LARGE_FLOOR = 3.0; // large text (>= 42px final bold, or >= 56px)

// Motion grammar (from QA + skill): something must move every ~0.35s.
export const MOTION = {
  maxStaticWindowSec: 0.35,
  maxStaticWindowFrames: 11, // at 30fps
  hookVisibleSec: 0.4, // first big visual change by 0.4s (frame 12)
  minCutsFirst3s: 2,
} as const;

// Audio targets (measured with ffmpeg loudnorm).
export const AUDIO = {
  finalIntegratedLufs: -14,
  finalTruePeakDb: -1.5,
  finalLra: 11,
  musicUnderVoLufs: -21, // -22 to -20 LUFS under VO
  musicGapLufs: -18, // between lines / intro / outro
  // Music stem measures -11.97 LUFS raw (ffmpeg loudnorm, 2026-11-11).
  // gain = 10^((target - raw)/20):
  musicDuckedGain: 0.34, // -11.97 + 20*log10(0.34) = -21.3 LUFS
  musicGapGain: 0.5, // -11.97 - 6.0 = -18.0 LUFS
  voTargetLufs: -18.3, // measured VO-only stem (QA)
} as const;
