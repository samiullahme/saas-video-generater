// EndCard x3 + KineticType + TapCursor. Comp-space (480x854).
// EndCard variants — the fixed composition uses variant A (LINK slam, with
// motion added through the last 70 frames) + the price line.
// Variant B is price-led; variant C loops back to the opening chat.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../tokens";
import { BAKERY } from "../sitekit/data";

// KineticType — word-by-word slam; each word springs in with a stagger.
// Words are the actual VO words; never change them without the audio.
export const KineticType: React.FC<{
  words: string[];
  at: number;
  fontSize?: number;
  color?: string;
  accentLast?: boolean;
}> = ({ words, at, fontSize = 88, color = "#fff", accentLast }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.18em", justifyContent: "center", fontFamily: "Anton, sans-serif", fontSize, lineHeight: 0.95, letterSpacing: 0.5, textTransform: "uppercase" }}>
      {words.map((w, i) => {
        const s = spring({ frame: frame - (at + i * 3), fps, config: { damping: 9, stiffness: 260, mass: 0.7 } });
        const sc = interpolate(s, [0, 1], [2.6, 1]);
        const op = interpolate(frame, [at + i * 3, at + i * 3 + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const last = accentLast && i === words.length - 1;
        return (
          <span key={i} style={{ display: "inline-block", opacity: op, transform: `scale(${sc})`, color: last ? COLORS.accent : color, textShadow: "0 6px 30px rgba(0,0,0,0.45)" }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

// TapCursor — a finger cursor that moves along keyframes and taps with a
// ripple. Deterministic: positions are (frame, x, y) keyframes.
export const TapCursor: React.FC<{
  keys: [number, number, number][]; // [frame, x, y]
  tapAt: number;
}> = ({ keys, tapAt }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, keys.map((k) => k[0]), keys.map((k) => k[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, keys.map((k) => k[0]), keys.map((k) => k[2]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tap = interpolate(frame, [tapAt, tapAt + 2, tapAt + 6], [1, 0.82, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ripple = frame >= tapAt ? interpolate(frame, [tapAt, tapAt + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : -1;
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 70, pointerEvents: "none" }}>
      {ripple >= 0 && <div style={{ position: "absolute", left: -14, top: -14, width: 28, height: 28, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.9)", transform: `scale(${1 + ripple * 1.6})`, opacity: 1 - ripple }} />}
      <svg width="34" height="34" viewBox="0 0 34 34" style={{ transform: `scale(${tap})`, filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.5))" }}>
        <path d="M11 3c3.2-1 6.5 1 7.3 4.2l1.6 7.2c2.9.8 5.8 2.8 6.6 5.5.7 2.9-.8 5.6-3.6 7.2L17 30.5c-1.5.9-3.6.7-5-0.6l-6-6.5c-.8-.9-1.5-1.8-2-3L2.6 15c-.9-2.5.7-5 3.3-5.4 1.2-.2 2.2.1 3.1.8L11 3z" fill="#fff" />
      </svg>
    </div>
  );
};

// Shared end-card shell: breathing background + brand lockup.
const EndShell: React.FC<{ children: React.ReactNode; frameBase?: number }> = ({ children }) => {
  const frame = useCurrentFrame();
  const breathe = 1 + 0.02 * Math.sin(frame * 0.06);
  const glow = 0.5 + 0.3 * Math.sin(frame * 0.05);
  return (
    <div style={{ position: "absolute", inset: 0, background: COLORS.bg, color: "#fff", overflow: "hidden", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "absolute", inset: -40, background: `radial-gradient(circle at 50% 30%, rgba(255,90,46,${0.16 * glow}) 0 180px, transparent 180px), radial-gradient(circle at 80% 85%, rgba(176,141,87,0.20) 0 200px, transparent 200px)`, transform: `scale(${breathe})` }} />
      {children}
    </div>
  );
};

const BrandLockup: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 160 } });
  const y = interpolate(s, [0, 1], [16, 0]);
  const op = interpolate(frame, [at, at + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: op, transform: `translateY(${y}px)` }}>
      <span style={{ display: "flex", gap: 2.5 }}>
        <span style={{ width: 4, height: 18, background: "#f6f0e4", borderRadius: 2, transform: "skewX(-10deg)" }} />
        <span style={{ width: 4, height: 24, background: COLORS.accent, borderRadius: 2, transform: "skewX(-10deg)" }} />
        <span style={{ width: 4, height: 18, background: "#f6f0e4", borderRadius: 2, transform: "skewX(-10deg)" }} />
      </span>
      <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.3 }}>Lane<span style={{ color: COLORS.accent }}>Site</span></span>
    </div>
  );
};

export const EndCardA: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <EndShell>
      <div style={{ marginTop: 250, textAlign: "center", width: "100%", padding: "0 24px" }}>
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 2.4, color: "#F3EDE2", marginBottom: 12 }}>COMMENT</div>
        <KineticType words={["“LINK”"]} at={at + 4} fontSize={152} accentLast={false} />
        <div style={{ fontSize: 14, color: "#D8D0BF", marginTop: 14 }}>and I’ll send you the link</div>
        <div style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, padding: "9px 16px", fontSize: 14, fontWeight: 700 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", animation: undefined, opacity: 0.6 + 0.4 * Math.sin(frame * 0.15) }} />
          {BAKERY.domain}
        </div>
        <div style={{ fontSize: 12.5, color: "#A8A094", marginTop: 12 }}>
          Free to start · {BAKERY.pricing.pro}/mo Pro · {BAKERY.pricing.trial}
        </div>
      </div>
      <div style={{ marginTop: "auto", marginBottom: 200, textAlign: "center" }}>
        <BrandLockup at={at + 40} />
        <div style={{ fontSize: 12, color: "#A8A094", marginTop: 8 }}>Get your business in its own lane.</div>
      </div>
    </EndShell>
  );
};

export const EndCardB: React.FC<{ at?: number }> = ({ at = 0 }) => (
  <EndShell>
    <div style={{ marginTop: 230, textAlign: "center", width: "100%", padding: "0 30px" }}>
      <KineticType words={["FREE", "TO", "START"]} at={at + 4} fontSize={110} accentLast />
      <div style={{ fontSize: 16, lineHeight: 1.5, color: "#E8E0D2", marginTop: 16 }}>
        Your bakery’s website, live in 5 minutes.<br />Pro is {BAKERY.pricing.pro}/month — {BAKERY.pricing.trial}.
      </div>
      <div style={{ marginTop: 22, display: "inline-block", background: COLORS.accent, color: "#fff", fontSize: 15, fontWeight: 800, padding: "13px 24px", borderRadius: 999 }}>
        Comment “LINK”
      </div>
    </div>
    <div style={{ marginTop: "auto", marginBottom: 200 }}>
      <BrandLockup at={at + 40} />
    </div>
  </EndShell>
);

export const EndCardC: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const frame = useCurrentFrame();
  const shimmer = 0.6 + 0.4 * Math.sin(frame * 0.12);
  return (
    <EndShell>
      <div style={{ marginTop: 250, textAlign: "center", width: "100%", padding: "0 24px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: "#A8A094" }}>THIS WAS A REAL DEMO</div>
        <KineticType words={["Yours", "is", "next."]} at={at + 4} fontSize={96} accentLast />
        <div style={{ fontSize: 14, color: "#D8D0BF", marginTop: 14, opacity: shimmer }}>
          Comment “LINK” and I’ll send you the link
        </div>
      </div>
      <div style={{ marginTop: "auto", marginBottom: 200 }}>
        <BrandLockup at={at + 40} />
      </div>
    </EndShell>
  );
};
