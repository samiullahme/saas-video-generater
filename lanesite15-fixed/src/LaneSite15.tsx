import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CAPS } from "./captions";
import { ANTON, INTER, LocalFonts } from "../../localFonts";
import { SiteScene, SiteHero, DashboardStats } from "../../sitekit/SiteKit";
import { AUDIO, SCALE } from "../../tokens";
import { SafeZoneOverlay } from "../../kit/SafeZoneOverlay";

const C = {
  bg: "#0B0908",
  card: "#FFFFFF",
  ink: "#141110",
  sub: "#6F6860",
  line: "#ECE6DA",
  accent: "#FF5A2E", // display type / icons / large text only (white on it is 3.11:1)
  accentText: "#C73E12", // small text / buttons on accent — white on it is 5.09:1
  accentSoft: "#FFE7DE",
  micro: "#6E655A", // 5.72:1 on white — lightest grey allowed for small text
  microDark: "#BDB2A4", // 8.9:1 on near-black — microtext on dark backgrounds
  left: "#1C1917",
  leftText: "#F5EFE5",
  green: "#1E9E5A",
  greenSoft: "#E4F5EA",
};

// FIXED (P0 #1): captions sit at 24% from the bottom of the 1080x1920 frame
// (461px final) with a 56px font. Comp-space values = final / 2.25.
const CAPTION_BOTTOM = 205; // 205 * 2.25 = 461px final (24%)
const CAPTION_FONT = 25; // 25 * 2.25 = 56px final
const INPUT_BOTTOM = 150; // 150 * 2.25 = 338px final — clears the 320px TikTok line

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const sp = (F: number, fps: number, at: number, cfg: Record<string, number> = {}) =>
  spring({ frame: F - at, fps, config: { damping: 13, stiffness: 210, mass: 0.7, ...cfg } });

const fade = (F: number, a: number, b: number) => interpolate(F, [a, b], [0, 1], CL);

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.16)",
  color: "rgba(255,255,255,0.85)",
  borderRadius: 99,
  padding: "5px 10px",
  fontFamily: INTER,
  fontWeight: 800,
  fontSize: 9.5,
  letterSpacing: 1.4,
};

const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({ name, size = 20, color = "#fff" }) => {
  const paths: Record<string, React.ReactNode> = {
    bread: <path d="M5.5 9.2c0-2.3 1.9-4.2 4.2-4.2h4.6c2.3 0 4.2 1.9 4.2 4.2 0 2-1.4 3.6-3.3 4v5.3c0 .8-.7 1.5-1.5 1.5h-3.4c-.8 0-1.5-.7-1.5-1.5v-5.3c-1.9-.4-3.3-2-3.3-4Z" />,
    check: <polyline points="4.5 12.5 9.5 17.5 19.5 6.5" />,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2.5" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" /></>,
    cal: <><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>,
    chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
    tag: <><path d="M20.6 13.6 12 22.2 1.8 12 1.8 1.8 12 1.8l8.6 8.6a1.4 1.4 0 0 1 0 3.2Z" /><circle cx="7.3" cy="7.3" r="1.6" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

const LaneMark: React.FC<{ size: number; color: string; accent: string }> = ({ size, color, accent }) => {
  const w = size / 6;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: size * 0.14 }}>
      <div style={{ width: w, height: size * 0.72, background: color, borderRadius: w * 0.45 }} />
      <div style={{ width: w, height: size, background: accent, borderRadius: w * 0.45 }} />
      <div style={{ width: w, height: size * 0.72, background: color, borderRadius: w * 0.45 }} />
    </div>
  );
};

// FIXED (P0 #2): the phone clock follows the same evening timeline as
// the chat — 9:38 while the first messages land, 9:39 through the middle,
// 9:41 from the "The link?" scene on.
const StatusBar: React.FC = () => {
  const F = useCurrentFrame();
  const clock = F < 200 ? "9:38" : F < 348 ? "9:39" : "9:41";
  return (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 50,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      padding: "0 24px 10px",
      zIndex: 80,
      color: "#fff",
      fontFamily: INTER,
      fontWeight: 700,
      fontSize: 14,
    }}
  >
    <span style={{ letterSpacing: 0.2 }}>{clock}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <svg width="17" height="11" viewBox="0 0 17 11">
        <rect x="0" y="7" width="3" height="4" rx="1" fill="#fff" />
        <rect x="4.5" y="5" width="3" height="6" rx="1" fill="#fff" />
        <rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="#fff" />
        <rect x="13.5" y="0" width="3" height="11" rx="1" fill="#fff" />
      </svg>
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round">
        <path d="M1 3.5a10.5 10.5 0 0 1 14 0" />
        <path d="M3.5 6a7 7 0 0 1 9 0" />
        <path d="M6 8.4a3.5 3.5 0 0 1 4 0" />
        <circle cx="8" cy="10" r="0.7" fill="#fff" stroke="none" />
      </svg>
      <svg width="25" height="12" viewBox="0 0 25 12">
        <rect x="0.7" y="0.7" width="20" height="10.6" rx="3" stroke="#fff" strokeWidth="1.3" fill="none" opacity="0.6" />
        <rect x="2.4" y="2.4" width="14" height="7.2" rx="1.8" fill="#fff" />
        <rect x="22.3" y="3.8" width="2.2" height="4.4" rx="1.1" fill="#fff" opacity="0.6" />
      </svg>
    </div>
  </div>
  );
};

const ChatHeader: React.FC = () => {
  const F = useCurrentFrame();
  // The green dot breathes so the chat header is never fully static.
  const dot = 0.6 + 0.4 * Math.sin(F * 0.18);
  return (
  <div
    style={{
      position: "absolute",
      top: 50,
      left: 0,
      right: 0,
      height: 58,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 16px",
      zIndex: 50,
      background: "rgba(11,9,8,0.92)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <svg width="10" height="17" viewBox="0 0 10 17" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8.5 1.7 2 8.5 8.5 15.3" />
    </svg>
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: C.accentText,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: 15,
        fontFamily: INTER,
      }}
    >
      M
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: INTER }}>Maya · Maple Bakery</div>
      <div style={{ color: "#7ED9A3", fontSize: 10.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, fontFamily: INTER }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#35C46F", opacity: dot }} />
        active now
      </div>
    </div>
    <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>···</div>
  </div>
  );
};

const Bubble: React.FC<{ at: number; side: "left" | "right"; text: string; name?: string; time?: string; big?: boolean }> = ({
  at,
  side,
  text,
  name,
  time,
  big,
}) => {
  const F = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(F, fps, at, { stiffness: 260, damping: 15 });
  const o = fade(F, at, at + 3);
  return (
    <div style={{ display: "flex", justifyContent: side === "right" ? "flex-end" : "flex-start", padding: "5px 16px", opacity: o }}>
      <div
        style={{
          maxWidth: "80%",
          transform: `translateY(${(1 - p) * 26}px) scale(${0.9 + 0.1 * p})`,
          transformOrigin: side === "right" ? "bottom right" : "bottom left",
        }}
      >
        {name ? (
          <div
            style={{
              fontFamily: INTER,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.7,
              color: side === "right" ? C.accent : "#BDB3A6",
              margin: "0 7px 4px",
              textAlign: side === "right" ? "right" : "left",
            }}
          >
            {name}
            {time ? ` · ${time}` : ""}
          </div>
        ) : null}
        <div
          style={{
            background: side === "right" ? C.accent : C.left,
            color: side === "right" ? "#fff" : C.leftText,
            borderRadius: side === "right" ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
            padding: big ? "12px 16px" : "10px 14px",
            fontFamily: INTER,
            fontWeight: 600,
            fontSize: big ? 17 : 15,
            lineHeight: 1.25,
            boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

const TypingDots: React.FC<{ at: number; until: number }> = ({ at, until }) => {
  const F = useCurrentFrame();
  if (F < at || F > until) return null;
  return (
    <div style={{ display: "flex", padding: "6px 20px" }}>
      <div style={{ display: "flex", gap: 4, background: C.left, padding: "10px 14px", borderRadius: "16px 16px 16px 5px" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#9A9086",
              opacity: 0.4 + 0.6 * Math.abs(Math.sin(F * 0.35 + i * 0.9)),
            }}
          />
        ))}
      </div>
    </div>
  );
};

// FIXED (P0 #3): the thumbnail is a LIVE SiteKit render of the bakery
// hero — the old hero screenshot carried a baked-in preview bar
// browser bar. FIXED (P0 #2): Maya's stamp is 9:38 PM, matching the chip.
const LinkCard: React.FC<{ at: number }> = ({ at }) => {
  const F = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(F, fps, at, { damping: 14, stiffness: 200 });
  const bob = Math.sin(F * 0.09) * 4;
  return (
    <div style={{ alignSelf: "flex-end", marginRight: 16, marginTop: 6, width: 306, transform: `translateY(${bob}px)` }}>
      <div style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, letterSpacing: 0.7, color: "#FF8A66", textAlign: "right", margin: "0 6px 5px" }}>
        MAYA · 9:38 PM
      </div>
      <div
        style={{
          background: "#17130F",
          border: "1px solid #2A241E",
          borderRadius: 18,
          overflow: "hidden",
          transform: `translateY(${(1 - p) * 24}px) scale(${0.92 + 0.08 * p})`,
          opacity: interpolate(p, [0, 0.3], [0, 1], CL),
          boxShadow: "0 18px 44px rgba(0,0,0,0.35)",
        }}
      >
        {/* Live site thumb: 480-wide SiteHero scaled to the 306px slot. */}
        <div style={{ width: 306, height: 112, overflow: "hidden" }}>
          <div style={{ width: 480, transform: "scale(0.6375)", transformOrigin: "top left" }}>
            <SiteHero compact />
          </div>
        </div>
        <div style={{ padding: "9px 12px 11px", background: C.card }}>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 12.5, color: "#141414" }}>maple-bakery.lanesite.pro</div>
          <div style={{ fontFamily: INTER, fontSize: 10.5, color: "#6E6A63", marginTop: 2 }}>My bakery&apos;s new website</div>
        </div>
      </div>
    </div>
  );
};

const InputBar: React.FC<{ typed?: string; pressAt?: number; placeholder?: string; pulseGlow?: boolean }> = ({
  typed = "",
  pressAt,
  placeholder = "Message…",
  pulseGlow = false,
}) => {
  const F = useCurrentFrame();
  const { fps } = useVideoConfig();
  const press = pressAt !== undefined ? sp(F, fps, pressAt, { stiffness: 320, damping: 18 }) : 0;
  const ring = pressAt !== undefined ? interpolate(F, [pressAt, pressAt + 14], [0, 1], CL) : 0;
  const glow = pulseGlow && typed ? 0.25 + 0.2 * Math.sin(F * 0.25) : 0;
  return (
    // FIXED (P0 #1): input bar raised to 150 comp px (338px final) so it
    // clears the 320px TikTok bottom zone.
    <div style={{ position: "absolute", left: 12, right: 12, bottom: INPUT_BOTTOM, zIndex: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#1B1714",
          border: "1px solid #2C2620",
          borderRadius: 24,
          padding: "9px 10px 9px 14px",
          boxShadow: glow ? `0 0 18px rgba(255,90,46,${glow})` : "none",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "1.5px solid #4A423A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8D8377",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          +
        </div>
        <div style={{ flex: 1, fontFamily: INTER, fontSize: 13.5, fontWeight: 500, color: typed ? "#F5EFE5" : "#A89E8F" }}>
          {typed || placeholder}
          {typed ? (
            <span
              style={{
                display: "inline-block",
                width: 1.5,
                height: 16,
                background: C.accent,
                marginLeft: 2,
                verticalAlign: -3,
                opacity: Math.sin(F * 0.5) > 0 ? 1 : 0,
              }}
            />
          ) : null}
        </div>
        {typed ? (
          <div style={{ position: "relative", width: 30, height: 30 }}>
            {ring > 0 && ring < 1 ? (
              <div
                style={{
                  position: "absolute",
                  inset: -4,
                  borderRadius: "50%",
                  border: `2px solid ${C.accent}`,
                  opacity: 1 - ring,
                  transform: `scale(${0.8 + ring * 0.9})`,
                }}
              />
            ) : null}
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: C.accentText,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${1 - 0.12 * Math.sin(Math.min(1, press) * Math.PI)})`,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </div>
          </div>
        ) : (
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#2C2620", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8AEA2" strokeWidth="1.9" strokeLinecap="round">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0" />
              <path d="M12 18v3" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

const TapCursor: React.FC<{ from: number; to: number; x1: number; y1: number; x2: number; y2: number; clickAt: number }> = (p) => {
  const F = useCurrentFrame();
  if (F < p.from || F > p.clickAt + 18) return null;
  const t = interpolate(F, [p.from, p.to], [0, 1], CL);
  const x = p.x1 + (p.x2 - p.x1) * t;
  const y = p.y1 + (p.y2 - p.y1) * t;
  const r = interpolate(F, [p.clickAt, p.clickAt + 16], [0, 1], CL);
  return (
    <>
      {r > 0 && r < 1 ? (
        <div
          style={{
            position: "absolute",
            left: x - 26,
            top: y - 26,
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "2.5px solid #fff",
            opacity: (1 - r) * 0.9,
            transform: `scale(${0.4 + r * 1.1})`,
            zIndex: 70,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: x - 11,
          top: y - 11,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.95)",
          border: "2px solid rgba(0,0,0,0.35)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          zIndex: 70,
          transform: `scale(${F >= p.clickAt ? 0.86 : 1})`,
        }}
      />
    </>
  );
};

const SceneChatIntro: React.FC = () => {
  const F = useCurrentFrame();
  return (
  <AbsoluteFill>
    <ChatHeader />
    <div style={{ position: "absolute", top: 118, left: 0, right: 0 }}>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <span style={chipStyle}>TODAY 9:38 PM</span>
      </div>
      <Bubble at={0} side="right" name="MAYA" time="9:38 PM" text="Okay, sending you the link" />
      <LinkCard at={2} />
      <TypingDots at={2} until={8} />
      <Bubble at={9} side="left" name="ZARA" time="9:39 PM" text="You built this?" />
      <TypingDots at={36} until={47} />
      <div style={{ textAlign: "right", padding: "2px 22px 0", fontFamily: INTER, fontSize: 9, fontWeight: 600, color: C.microDark, opacity: fade(F, 26, 30) }}>Seen 9:39 PM</div>
    </div>
    <InputBar />
    <TapCursor from={20} to={29} x1={390} y1={700} x2={292} y2={250} clickAt={30} />
  </AbsoluteFill>
  );
};

const SceneExpand: React.FC = () => {
  const F = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(F, fps, 48, { stiffness: 150, damping: 18 });
  const zoom = interpolate(F, [48, 79], [1.0, 1.05], CL);
  const slam = sp(F, fps, 51, { stiffness: 300, damping: 16 });
  const o = fade(F, 50, 53);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute",
          left: 14,
          top: 64,
          width: 452,
          height: 762,
          borderRadius: 26,
          overflow: "hidden",
          boxShadow: "0 40px 90px rgba(0,0,0,0.65)",
          transform: `scale(${zoom})`,
          opacity: interpolate(p, [0, 0.4], [0.5, 1], CL),
        }}
      >
        {/* FIXED (P0 #3): live SiteKit hero — no screenshot, no preview bar. */}
        <SiteScene page="hero" slotW={452} slotH={762} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0.6), rgba(0,0,0,0) 58%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0) 30%, rgba(0,0,0,0.55))" }} />
      </div>
      {/* No floating url pill here — SiteKit's chrome already shows the
          domain + LIVE; the old pill doubled it on screen. */}
      <div
        style={{
          position: "absolute",
          top: 322,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
          opacity: o,
          transform: `scale(${1 + (1 - slam) * 0.8}) rotate(-1.5deg)`,
        }}
      >
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 60,
            color: "#fff",
            letterSpacing: 1,
            lineHeight: 1,
            textShadow: "0 6px 0 rgba(0,0,0,0.35), 0 24px 50px rgba(0,0,0,0.6)",
          }}
        >
          LAST <span style={{ color: C.accent }}>NIGHT.</span>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 14,
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 99,
            padding: "6px 12px",
            fontFamily: INTER,
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: 0.4,
          }}
        >
          posted 9:39 PM
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneWhole: React.FC = () => {
  const F = useCurrentFrame();
  const op0 = F < 89 ? 1 : F < 92 ? (92 - F) / 3 : 0;
  const op1 = F < 89 ? 0 : F < 92 ? (F - 89) / 3 : F < 101 ? 1 : F < 104 ? (104 - F) / 3 : 0;
  const op2 = F < 101 ? 0 : F < 104 ? (F - 101) / 3 : 1;
  const idx = F < 90 ? 0 : F < 102 ? 1 : 2;
  const pages: Array<"hero" | "menu" | "order"> = ["hero", "menu", "order"];
  const ops = [op0, op1, op2];
  // FIXED (P0 #7): the spoken "Whole site?" is hard to catch in ASR, so the
  // words also slam in as an on-screen title for the first 20 frames of the
  // scene. (Preferred fix remains a re-record — see the report.)
  const title = fade(F, 79, 82) * (F < 100 ? 1 : Math.max(0, (104 - F) / 4));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <ChatHeader />
      <div style={{ position: "absolute", top: 122, left: 0, right: 0 }}>
        <Bubble at={80} side="left" name="ZARA" time="9:39 PM" text="Whole site?" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 212,
          width: 336,
          height: 458,
          borderRadius: 24,
          overflow: "hidden",
          background: "#F6F1E7",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* FIXED (P0 #3): the three "pages" are live SiteKit sections, not
            screenshots — the menu/order shots were the same preview captures. */}
        {pages.map((page, i) => (
          <div key={page} style={{ position: "absolute", inset: 0, opacity: ops[i] }}>
            <SiteScene page={page} slotW={336} slotH={458} />
          </div>
        ))}
        {/* No page label here: over live SiteKit sections it collides with
            the site's own nav/headline. The dots below already say which
            of the three pages is showing. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 56,
            textAlign: "center",
            fontFamily: ANTON,
            fontSize: 34,
            color: "#fff",
            letterSpacing: 0.5,
            textShadow: "0 3px 0 rgba(0,0,0,0.5), 0 10px 26px rgba(0,0,0,0.7)",
            opacity: title,
            transform: `scale(${0.7 + 0.3 * Math.min(1, title)})`,
            pointerEvents: "none",
          }}
        >
          THE WHOLE <span style={{ color: C.accent }}>SITE?</span>
        </div>
        <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: i === idx ? 14 : 5,
                height: 5,
                borderRadius: 3,
                background: i === idx ? C.accent : "rgba(20,17,16,0.3)",
                transition: "none",
              }}
            />
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 636,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: fade(F, 84, 88),
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: 0.6,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        3 pages · 1 form · 0 broken links
      </div>
      <InputBar />
    </AbsoluteFill>
  );
};

const BeatTitle: React.FC<{ text: string; at: number; icon: string; F: number; fps: number }> = ({ text, at, icon, F, fps }) => {
  const p = sp(F, fps, at, { stiffness: 260, damping: 16 });
  return (
    <div style={{ position: "absolute", top: 88, left: 28, display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: C.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -18}deg)`,
        }}
      >
        <Icon name={icon} size={21} color="#fff" />
      </div>
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 48,
            color: "#fff",
            letterSpacing: 0.5,
            lineHeight: 1,
            transform: `translateY(${(1 - p) * 40}px)`,
            opacity: fade(F, at, at + 2),
          }}
        >
          {text}
        </div>
        <div style={{ height: 3, width: `${64 * p}px`, background: C.accent, borderRadius: 2, marginTop: 6 }} />
      </div>
    </div>
  );
};

const MenuCard: React.FC<{ F: number; fps: number; at: number }> = ({ F, fps, at }) => {
  const p = sp(F, fps, at, { stiffness: 180 });
  const rows: Array<[string, string]> = [
    ["Fresh milk bread", "$5"],
    ["Chocolate fudge cake, 2 lb", "$48"],
    ["Chicken patties, box of 6", "$12"],
  ];
  // FIXED (P0 #4): the card keeps drifting after the rows land, so the
  // 129–141 static window breaks up.
  const drift = Math.sin(F * 0.08) * 4;
  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        width: 424,
        top: 176,
        background: C.card,
        borderRadius: 26,
        padding: 18,
        boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
        transform: `translateY(${(1 - p) * 40 + drift}px) scale(${0.94 + 0.06 * p})`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 11, letterSpacing: 1.6, color: C.micro }}>MAPLE BAKERY</div>
        <div style={{ background: C.accentSoft, color: C.ink, borderRadius: 99, padding: "4px 9px", fontFamily: INTER, fontWeight: 800, fontSize: 9.5, letterSpacing: 0.8 }}>
          ONLINE MENU
        </div>
      </div>
      {rows.map(([name, price], i) => {
        const rp = sp(F, fps, at + 1 + i * 2, { stiffness: 240, damping: 16 });
        return (
          <div
            key={name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "13px 2px",
              borderTop: i ? `1px solid ${C.line}` : "none",
              opacity: interpolate(rp, [0, 0.5], [0, 1], CL),
              transform: `translateX(${(1 - rp) * 18}px)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "#F4EFE6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="bread" size={16} color="#A5764B" />
              </div>
              <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 14, color: C.ink }}>{name}</div>
            </div>
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 15, color: C.accentText }}>{price}</div>
          </div>
        );
      })}
    </div>
  );
};

const PricesCard: React.FC<{ F: number; fps: number; at: number }> = ({ F, fps, at }) => {
  const tags = [
    { t: "$5", l: "fresh milk bread", x: 14, y: 8, r: -6, d: 2 },
    { t: "$48", l: "fudge cake · 2 lb", x: 212, y: 92, r: 5, d: 6 },
    { t: "$12", l: "chicken patties", x: 42, y: 192, r: -3, d: 10 },
  ];
  return (
    <div style={{ position: "absolute", left: 28, top: 176, width: 424, height: 340 }}>
      {tags.map((tag, i) => {
        const p = sp(F, fps, at + tag.d, { stiffness: 300, damping: 12 });
        const float = Math.sin(F * 0.09 + i * 1.7) * 4;
        return (
          <div
            key={tag.t}
            style={{
              position: "absolute",
              left: tag.x,
              top: tag.y + float,
              background: C.card,
              borderRadius: 18,
              padding: "14px 18px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              transform: `scale(${0.5 + 0.5 * p}) rotate(${tag.r}deg)`,
              opacity: interpolate(p, [0, 0.4], [0, 1], CL),
            }}
          >
            <div style={{ fontFamily: ANTON, fontSize: 46, color: i === 1 ? C.accentText : C.ink, lineHeight: 1 }}>{tag.t}</div>
            <div style={{ fontFamily: INTER, fontSize: 10.5, fontWeight: 700, color: C.micro, marginTop: 3, letterSpacing: 0.5, textTransform: "uppercase" }}>
              {tag.l}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 318,
          fontFamily: INTER,
          fontSize: 12.5,
          fontWeight: 600,
          color: "rgba(255,255,255,0.6)",
          opacity: fade(F, at + 12, at + 16),
        }}
      >
        real prices, straight from her menu
      </div>
    </div>
  );
};

const BookingCard: React.FC<{ F: number; fps: number; at: number }> = ({ F, fps, at }) => {
  const p = sp(F, fps, at);
  const daySel = sp(F, fps, at + 5);
  const timeSel = sp(F, fps, at + 9);
  const press = sp(F, fps, at + 13, { stiffness: 320, damping: 18 });
  const sent = sp(F, fps, at + 16, { stiffness: 260, damping: 14 });
  const ring = interpolate(F, [at + 13, at + 27], [0, 1], CL);
  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        top: 176,
        width: 424,
        background: "#17120E",
        border: "1px solid #2B241D",
        borderRadius: 26,
        padding: 20,
        boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
        transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + 0.06 * p})`,
      }}
    >
      <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 16, color: "#F7F1E7" }}>Order for pickup today</div>
      <div style={{ fontFamily: INTER, fontSize: 11.5, color: C.microDark, marginTop: 3 }}>Maple Bakery · Park Slope</div>
      <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
          <div
            key={d}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "9px 0",
              borderRadius: 11,
              background: i === 2 ? C.accentText : "#241E18",
              color: i === 2 ? "#fff" : "#BDB2A4",
              fontFamily: INTER,
              fontWeight: 700,
              fontSize: 11.5,
              transform: i === 2 ? `scale(${0.9 + 0.1 * daySel})` : "none",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        {/* FIXED: pickup times from the live site (11:00 / 4:30 / 7:00) —
            the old 4-slot list (incl. 1:30, 6:00) was not on the site. */}
        {["11:00", "4:30", "7:00"].map((t, i) => (
          <div
            key={t}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "9px 0",
              borderRadius: 11,
              background: i === 1 ? C.accentText : "#241E18",
              color: i === 1 ? "#fff" : "#BDB2A4",
              fontFamily: INTER,
              fontWeight: 700,
              fontSize: 11.5,
              transform: i === 1 ? `scale(${0.9 + 0.1 * timeSel})` : "none",
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div style={{ position: "relative", marginTop: 14 }}>
        {ring > 0 && ring < 1 ? (
          <div style={{ position: "absolute", inset: 0, borderRadius: 13, border: `2px solid ${C.accent}`, opacity: 1 - ring, transform: `scale(${0.9 + ring * 0.25})` }} />
        ) : null}
        <div
          style={{
            background: C.accentText,
            borderRadius: 13,
            padding: "13px 0",
            textAlign: "center",
            fontFamily: INTER,
            fontWeight: 800,
            fontSize: 13.5,
            color: "#fff",
            letterSpacing: 0.2,
            transform: `scale(${1 - 0.06 * Math.sin(Math.min(1, press) * Math.PI)})`,
          }}
        >
          Send booking request
        </div>
      </div>
      {sent > 0 ? (
        <div
          style={{
            marginTop: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(53,196,111,0.14)",
            border: "1px solid rgba(53,196,111,0.35)",
            color: "#6FE0A1",
            borderRadius: 99,
            padding: "7px 12px",
            fontFamily: INTER,
            fontWeight: 800,
            fontSize: 11,
            opacity: interpolate(sent, [0, 0.5], [0, 1], CL),
            transform: `translateY(${(1 - sent) * 10}px)`,
          }}
        >
          <Icon name="check" size={12} color="#6FE0A1" />
          Request sent
        </div>
      ) : null}
    </div>
  );
};

const DashCard: React.FC<{ F: number; fps: number; at: number }> = ({ F, fps, at }) => {
  const p = sp(F, fps, at);
  const count = Math.round(interpolate(F, [at + 3, at + 13], [0, 18], CL));
  const bars = [5, 9, 7, 12, 8, 14, 11];
  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        top: 176,
        width: 424,
        background: C.card,
        borderRadius: 26,
        padding: 18,
        boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
        transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + 0.06 * p})`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 12, color: C.ink }}>Maple Bakery · dashboard</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: C.greenSoft, color: C.green, borderRadius: 99, padding: "4px 9px", fontFamily: INTER, fontWeight: 800, fontSize: 9.5 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green }} />
          LIVE
        </div>
      </div>
      {/* FIXED (P0 #3): code-drawn chart + count — the old dashboard chart
          was another screenshot. The count is demo data and is
          labelled DEMO DATA on screen (see sitekit/data.ts). */}
      <DashboardStats count={count} />
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 6 }}>
        <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: C.micro }}>This week · 7 days</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 56 }}>
          {bars.map((b, i) => {
            const bp = sp(F, fps, at + 4 + i * 2, { stiffness: 160, damping: 14 });
            return <div key={i} style={{ width: 12, height: 6 + b * 2.6 * bp, background: i === 5 ? C.accent : "#E9E2D6", borderRadius: 4 }} />;
          })}
        </div>
      </div>
    </div>
  );
};

const SceneCards: React.FC = () => {
  const F = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = F < 140 ? 0 : F < 154 ? 1 : F < 178 ? 2 : 3;
  const at = [114, 140, 154, 178][beat];
  const titles = ["MENU", "PRICES", "BOOKINGS", "DASHBOARD"];
  const icons = ["bread", "tag", "cal", "chart"];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 30%, rgba(255,90,46,0.10), rgba(0,0,0,0) 60%)" }} />
      <BeatTitle text={titles[beat]} at={at} icon={icons[beat]} F={F} fps={fps} />
      {beat === 0 ? <MenuCard F={F} fps={fps} at={at} /> : null}
      {beat === 1 ? <PricesCard F={F} fps={fps} at={at} /> : null}
      {beat === 2 ? <BookingCard F={F} fps={fps} at={at} /> : null}
      {beat === 3 ? <DashCard F={F} fps={fps} at={at} /> : null}
    </AbsoluteFill>
  );
};

const SceneNoWay: React.FC = () => {
  const F = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(F, fps, 203, { stiffness: 300, damping: 15 });
  const sh = Math.sin((F - 203) * 2.6) * 9 * Math.exp(-(F - 203) / 7);
  const shy = Math.cos((F - 203) * 3.3) * 6 * Math.exp(-(F - 203) / 7);
  const flick = F < 210 ? 0.75 + 0.25 * Math.abs(Math.sin(F * 1.7)) : 1;
  const sparks = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2 + 0.4;
    const r = 120 + (i % 5) * 22;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.75, s: 3 + (i % 4) * 1.4 };
  });
  const t = interpolate(F, [203, 222], [0, 1], CL);
  // The tail of the scene (222–237) was fully static in the original.
  // Slow zoom + title breathing + chip pulse keep it alive to the cut.
  const zoom = interpolate(F, [203, 237], [1, 1.03], CL);
  const breathe = F >= 222 ? 1 + 0.012 * Math.sin((F - 222) * 0.12) : 1;
  const chipPulse = F >= 214 ? 0.75 + 0.25 * Math.sin(F * 0.15) : 1;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* FIXED (P0 #3): the blurred backdrop is the live SiteKit hero, not
          the old hero screenshot (which carried the preview bar). */}
      <div style={{ position: "absolute", inset: "-10%", width: "120%", height: "120%", filter: "blur(16px) brightness(0.5)", opacity: 0.5, transform: `scale(${zoom})` }}>
        <div style={{ width: 480, height: 854, transform: "scale(1.2)", transformOrigin: "top left", display: "flex", flexDirection: "column" }}>
          <SiteHero />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, rgba(255,90,46,0.18), rgba(0,0,0,0.75) 60%)" }} />
      {sparks.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 240 + s.x * t,
            top: 400 + s.y * t,
            width: s.s,
            height: s.s,
            borderRadius: "50%",
            background: i % 3 ? C.accent : "#fff",
            opacity: (1 - t) * 0.9,
          }}
        />
      ))}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `translate(${sh}px, ${shy}px)` }}>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 88,
            color: "#fff",
            letterSpacing: 1.5,
            transform: `scale(${(1 + (1 - p) * 0.9) * breathe}) rotate(-2deg)`,
            opacity: fade(F, 203, 206) * flick,
            textShadow: "0 8px 0 rgba(0,0,0,0.4), 0 30px 70px rgba(0,0,0,0.7)",
          }}
        >
          NO <span style={{ color: C.accent }}>WAY.</span>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 160, left: 0, right: 0, textAlign: "center", opacity: fade(F, 208, 214) * chipPulse }}>
        <span style={{ ...chipStyle, fontSize: 10.5 }}>SHE DIDN&apos;T BELIEVE IT EITHER</span>
      </div>
    </AbsoluteFill>
  );
};

const SceneDescribe: React.FC = () => {
  const F = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(F, fps, 237);
  const full = "Maple Bakery, Park Slope. Fresh bread, cakes, open 7am to 10pm.";
  const n = Math.floor(interpolate(F, [241, 266], [0, full.length], CL));
  const typed = full.slice(0, n);
  const press = sp(F, fps, 270, { stiffness: 320, damping: 18 });
  const ring = interpolate(F, [270, 285], [0, 1], CL);
  const building = F >= 272;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", top: 82, left: 28 }}>
        <div style={chipStyle}>STEP 1 · DESCRIBE</div>
        <div style={{ fontFamily: ANTON, fontSize: 36, color: "#fff", marginTop: 10, lineHeight: 1.02 }}>
          I DESCRIBED
          <br />
          MY BAKERY.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 218,
          width: 432,
          background: C.card,
          borderRadius: 26,
          padding: 20,
          boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
          transform: `translateY(${(1 - p) * 40}px) scale(${0.95 + 0.05 * p})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LaneMark size={16} color={C.ink} accent={C.accent} />
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 14, color: C.ink }}>LaneSite</div>
          <div style={{ marginLeft: "auto", background: "#F2EDE4", color: C.micro, borderRadius: 99, padding: "3px 8px", fontFamily: INTER, fontWeight: 800, fontSize: 8.5, letterSpacing: 0.8 }}>
            NEW WEBSITE
          </div>
        </div>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 11, letterSpacing: 1.2, color: C.micro, marginTop: 18 }}>DESCRIBE YOUR SHOP</div>
        <div
          style={{
            marginTop: 8,
            minHeight: 92,
            background: "#F7F3EB",
            border: "1px solid #E8E0D2",
            borderRadius: 14,
            padding: "11px 12px",
            fontFamily: INTER,
            fontSize: 13.5,
            fontWeight: 600,
            color: C.ink,
            lineHeight: 1.4,
          }}
        >
          {typed}
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: 15,
              background: C.accent,
              marginLeft: 1,
              verticalAlign: -2,
              opacity: Math.sin(F * 0.6) > 0 ? 1 : 0,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {["Bakery", "Salon", "Pharmacy"].map((t, i) => (
            <div
              key={t}
              style={{
                borderRadius: 99,
                padding: "6px 11px",
                fontFamily: INTER,
                fontWeight: 700,
                fontSize: 10.5,
                background: i === 0 ? C.accentSoft : "#F2EDE4",
                border: i === 0 ? `1px solid ${C.accentText}` : "1px solid transparent",
                color: i === 0 ? C.accentText : C.micro,
              }}
            >
              {t}
            </div>
          ))}
        </div>
        <div style={{ position: "relative", marginTop: 14 }}>
          {ring > 0 && ring < 1 ? (
            <div style={{ position: "absolute", inset: 0, borderRadius: 14, border: `2px solid ${C.accent}`, opacity: 1 - ring, transform: `scale(${0.92 + ring * 0.2})` }} />
          ) : null}
          <div
            style={{
              background: C.accentText,
              borderRadius: 14,
              padding: "13px 0",
              textAlign: "center",
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 14,
              color: "#fff",
              transform: `scale(${1 - 0.05 * Math.sin(Math.min(1, press) * Math.PI)})`,
              // FIXED (P0 #4): the button breathes while the text is typing
              // (frames 241–266), so the 8.5–8.9s window is not static.
              boxShadow: F >= 241 && F < 270 ? `0 0 ${18 + 10 * Math.sin(F * 0.28)}px rgba(255,90,46,0.55)` : "none",
            }}
          >
            {building ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                Building
                <span style={{ display: "inline-flex", gap: 3 }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "#fff",
                        opacity: 0.35 + 0.65 * Math.abs(Math.sin(F * 0.4 + i)),
                      }}
                    />
                  ))}
                </span>
              </span>
            ) : (
              "Build my site →"
            )}
          </div>
        </div>
      </div>
      {F >= 278 ? (
        <div style={{ position: "absolute", left: 352, top: 252, display: "flex", flexDirection: "column", gap: 7 }}>
          {["Menu", "Bookings", "Photos"].map((t, i) => {
            const q = sp(F, fps, 278 + i * 3, { stiffness: 280, damping: 14 });
            return (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "rgba(53,196,111,0.12)",
                  border: "1px solid rgba(53,196,111,0.4)",
                  borderRadius: 99,
                  padding: "5px 9px",
                  fontFamily: INTER,
                  fontWeight: 800,
                  fontSize: 9.5,
                  color: "#6FE0A1",
                  opacity: interpolate(q, [0, 0.4], [0, 1], CL),
                  transform: `translateX(${(1 - q) * 20}px)`,
                }}
              >
                <Icon name="check" size={9} color="#6FE0A1" />
                {t}
              </div>
            );
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const SceneBuild: React.FC = () => {
  const F = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flash = F >= 334;
  if (flash) {
    const fp = sp(F, fps, 334, { stiffness: 260, damping: 16 });
    return (
      <AbsoluteFill style={{ background: C.bg }}>
        {/* FIXED (P0 #3): the flash frame is the live SiteKit hero — the old
            frame showed the old hero screenshot's top strip (the preview bar)
            over the "IT BUILT EVERYTHING." title. */}
        <div style={{ position: "absolute", inset: 0, transform: `scale(${interpolate(F, [334, 348], [1.06, 1.0], CL)})`, display: "flex", flexDirection: "column" }}>
          <SiteHero />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.88), rgba(0,0,0,0.6) 32%, rgba(0,0,0,0.9))" }} />
        </div>
        <div style={{ position: "absolute", top: 296, left: 0, right: 0, textAlign: "center", transform: `scale(${1 + (1 - fp) * 0.7})`, opacity: fade(F, 334, 337) }}>
          <div style={{ fontFamily: ANTON, fontSize: 44, color: "#fff", letterSpacing: 0.5, textShadow: "0 5px 0 rgba(0,0,0,0.55), 0 20px 50px rgba(0,0,0,0.7)" }}>
            IT BUILT <span style={{ color: C.accent }}>EVERYTHING.</span>
          </div>
        </div>
        <div style={{ position: "absolute", top: 372, left: 0, right: 0, textAlign: "center", opacity: fade(F, 337, 341) }}>
          <span style={{ ...chipStyle, background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.25)", fontSize: 11 }}>0 LINES OF CODE</span>
        </div>
      </AbsoluteFill>
    );
  }
  const p = sp(F, fps, 291);
  const rows: Array<[string, string, number]> = [
    ["Reading your brief", "Maple Bakery · Park Slope", 297],
    ["Choosing layout and colors", "Palette: warm crust", 302],
    ["Writing the pages", "Home · Menu · Gallery · Contact", 307],
    ["Adding bookings", "Order form · owner dashboard", 312],
    ["Testing in a browser", "5 pages · 1 form · 0 broken links", 317],
    ["Publishing with HTTPS", "maple-bakery.lanesite.pro", 324],
  ];
  const prog = interpolate(F, [294, 326], [0, 1], CL);
  const live = sp(F, fps, 328, { stiffness: 240, damping: 15 });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", top: 78, left: 28 }}>
        <div style={chipStyle}>STEP 2 · IT BUILDS</div>
        <div style={{ fontFamily: ANTON, fontSize: 34, color: "#fff", marginTop: 10 }}>
          IT BUILT <span style={{ color: C.accent }}>EVERYTHING.</span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 196,
          width: 432,
          background: C.card,
          borderRadius: 24,
          padding: "16px 18px",
          boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
          transform: `translateY(${(1 - p) * 40}px) scale(${0.95 + 0.05 * p})`,
        }}
      >
        {rows.map(([label, sub, tick], i) => {
          const done = F >= tick;
          const tp = sp(F, fps, tick, { stiffness: 320, damping: 14 });
          return (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7.5px 0",
                borderTop: i ? `1px solid ${C.line}` : "none",
                opacity: done ? 1 : 0.35,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: done ? C.green : "#EBE4D8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: done ? `scale(${0.7 + 0.3 * tp})` : "none",
                }}
              >
                {done ? <Icon name="check" size={11} color="#fff" /> : <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9BFAF" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 12.5, color: done ? C.ink : C.micro }}>{label}</div>
                <div style={{ fontFamily: INTER, fontSize: 9.5, color: C.micro, marginTop: 1 }}>{sub}</div>
              </div>
            </div>
          );
        })}
        <div style={{ height: 6, background: "#EFE9DE", borderRadius: 4, marginTop: 12, overflow: "hidden", position: "relative" }}>
          <div style={{ height: 6, width: `${prog * 100}%`, background: C.accent, borderRadius: 4 }} />
          {/* FIXED (P0 #4): a shimmer rides the progress bar so the
              10.4–11.0s window keeps moving after the last tick. */}
          <div
            style={{
              position: "absolute", top: 0, bottom: 0, width: 70,
              left: `${Math.max(0, Math.min(100, prog * 100 - 10 + 14 * Math.sin(F * 0.28)))}%`,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <div style={{ fontFamily: INTER, fontSize: 8.5, color: C.micro, fontWeight: 700, letterSpacing: 0.4 }}>SPEED-UP DEMO</div>
          <div style={{ fontFamily: INTER, fontSize: 8.5, color: C.micro, fontWeight: 700 }}>0:0{Math.min(8, Math.floor(F / 20))}</div>
        </div>
      </div>
      {live > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            top: 636,
            display: "flex",
            justifyContent: "center",
            opacity: interpolate(live, [0, 0.5], [0, 1], CL),
            transform: `translateY(${(1 - live) * 16}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: C.greenSoft,
              border: "1px solid #BFE6CC",
              color: C.green,
              borderRadius: 99,
              padding: "10px 14px",
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: 0.2,
              boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, opacity: 0.6 + 0.4 * Math.sin(F * 0.2) }} />
            LIVE at maple-bakery.lanesite.pro
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const SceneLinkAsk: React.FC = () => {
  const F = useCurrentFrame();
  const typed = F >= 356 ? "link".slice(0, Math.max(0, Math.min(4, Math.floor(interpolate(F, [356, 368], [0, 4.4], CL))))) : "";
  // A slow breathing glow keeps the big black middle alive while the
  // comment is being typed (the 12.0–12.4s static window).
  const glow = 0.6 + 0.4 * Math.sin(F * 0.07);
  const glowY = 55 + 3 * Math.sin(F * 0.1);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(circle at 50% ${glowY}%, rgba(255,90,46,${0.18 * glow}), rgba(0,0,0,0) 55%)`,
        }}
      />
      <ChatHeader />
      <div style={{ position: "absolute", top: 122, left: 0, right: 0 }}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <span style={chipStyle}>TODAY 9:41 PM</span>
        </div>
        <Bubble at={349} side="left" name="ZARA" time="9:41 PM" text="The link?" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 216,
          background: "#17130F",
          border: "1px solid #2B241D",
          borderRadius: 20,
          padding: "14px 14px 12px",
          opacity: fade(F, 352, 356),
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 11, color: C.microDark, letterSpacing: 1.2 }}>COMMENTS · 1</div>
          <div style={{ fontFamily: INTER, fontSize: 10, color: C.microDark }}>View all</div>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: C.accentText,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            M
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 11, color: "#BDB2A4" }}>
              Maya <span style={{ color: C.microDark, fontWeight: 600 }}>· now</span>
            </div>
            <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 12.5, color: "#F5EFE5", marginTop: 3 }}>sending it to everyone who asks</div>
          </div>
        </div>
      </div>
      <InputBar typed={typed} pressAt={370} pulseGlow />
    </AbsoluteFill>
  );
};

const SceneEnd: React.FC = () => {
  const F = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bubble = sp(F, fps, 383, { stiffness: 240, damping: 14 });
  const kick = fade(F, 386, 390);
  const lp = sp(F, fps, 392, { stiffness: 300, damping: 14 });
  const sub = fade(F, 407, 411);
  const url = fade(F, 415, 419);
  const logo = sp(F, fps, 420, { stiffness: 200, damping: 15 });
  // FIXED (P0 #4): the end card never sits still now. The "link" bubble
  // bobs, the LINK title breathes after it lands, the url pill pulses, and
  // Zara's reply slides in at 425 — the 13.8–14.9s frozen window is gone.
  const reply = sp(F, fps, 425, { stiffness: 240, damping: 14 });
  const zoom = interpolate(F, [380, 450], [1, 1.04], CL);
  const breath = F >= 395 ? 1 + 0.025 * Math.sin((F - 395) * 0.1) : 1;
  const glow = 0.7 + 0.3 * Math.sin(F * 0.07);
  const pillPulse = F >= 420 ? 1 + 0.08 * Math.sin(F * 0.16) : 1;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 42%, rgba(255,90,46,${0.16 * glow}), rgba(0,0,0,0) 55%)`,
          transform: `scale(${zoom})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 36,
          top: 116,
          opacity: interpolate(bubble, [0, 0.5], [0, 1], CL),
          transform: `translateY(${(1 - bubble) * 30 + Math.sin(F * 0.08) * 2}px) scale(${0.85 + 0.15 * bubble})`,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: C.accentText,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            M
          </div>
          <div>
            <div
              style={{
                background: "#1E1915",
                border: "1px solid #332B24",
                borderRadius: "14px 14px 14px 4px",
                padding: "9px 13px",
                fontFamily: INTER,
                fontWeight: 700,
                fontSize: 14,
                color: "#fff",
              }}
            >
              link
            </div>
            <div style={{ fontFamily: INTER, fontSize: 9.5, color: C.microDark, marginTop: 4 }}>sent just now</div>
          </div>
        </div>
      </div>
      {/* Zara's reply — the conversation keeps going through the end card. */}
      {F >= 425 ? (
        <div
          style={{
            position: "absolute",
            left: 36,
            top: 196,
            opacity: interpolate(reply, [0, 0.5], [0, 1], CL),
            transform: `translateY(${(1 - reply) * 22}px) scale(${0.85 + 0.15 * reply})`,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#2E2A26",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: INTER,
                fontWeight: 800,
                fontSize: 13,
                border: "1px solid #4A423A",
              }}
            >
              Z
            </div>
            <div>
              <div
                style={{
                  background: "#EFE9DC",
                  borderRadius: "14px 14px 14px 4px",
                  padding: "9px 13px",
                  fontFamily: INTER,
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#1A1712",
                }}
              >
                Got it — thanks!
              </div>
              <div style={{ fontFamily: INTER, fontSize: 9.5, color: C.microDark, marginTop: 4 }}>Zara · just now</div>
            </div>
          </div>
        </div>
      ) : null}
      <div style={{ position: "absolute", top: 276, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 12, letterSpacing: 4, color: "rgba(255,255,255,0.65)", opacity: kick }}>COMMENT</div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 152,
            color: C.accent,
            lineHeight: 0.95,
            letterSpacing: 2,
            opacity: interpolate(lp, [0, 0.3], [0, 1], CL),
            transform: `scale(${(0.7 + 0.3 * lp) * breath})`,
          }}
        >
          LINK
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 600,
            fontSize: 18,
            color: "#F5EFE5",
            marginTop: 6,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 12}px)`,
          }}
        >
          and I&apos;ll send it to you.
        </div>
        <div style={{ marginTop: 16, opacity: url }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "1.5px solid rgba(255,255,255,0.3)",
              borderRadius: 99,
              padding: "8px 16px",
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 13,
              color: "#fff",
              letterSpacing: 0.3,
              transform: `scale(${pillPulse})`,
            }}
          >
            lanesite.pro
          </span>
        </div>
        {/* Real value line (live pricing: Free $0, Pro $5/mo, 7 days free). */}
        <div style={{ marginTop: 10, opacity: url, fontFamily: INTER, fontSize: 12.5, fontWeight: 600, color: "#A8A094" }}>
          Free to start · $5/mo Pro · 7 days free
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 200,
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(logo, [0, 0.5], [0, 1], CL),
          transform: `translateY(${(1 - logo) * 14}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LaneMark size={20} color="#fff" accent={C.accent} />
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 19, color: "#fff", letterSpacing: -0.3 }}>
            Lane<span style={{ color: C.accent }}>Site</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const F = useCurrentFrame();
  const t = F / 30;
  let g = CAPS.filter((c) => t >= c.s && t <= c.e).sort((a, b) => b.s - a.s)[0];
  if (!g) {
    const prev = CAPS.filter((c) => c.e < t).sort((a, b) => b.e - a.e)[0];
    if (prev && t - prev.e < 0.25) g = prev;
  }
  if (!g) return null;
  const active = (w: { s: number; e: number }) => t >= w.s - 0.02 && t <= w.e + 0.02;
  const isMaya = g.spk === "MAYA";
  return (
    // FIXED (P0 #1): captions at CAPTION_BOTTOM (205 comp = 461px final,
    // 24%) with CAPTION_FONT (25 comp = 56px final) — above the TikTok UI.
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: CAPTION_BOTTOM,
        zIndex: 55,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 7,
        padding: "0 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: isMaya ? C.accent : "rgba(255,255,255,0.16)",
          borderRadius: 99,
          padding: "3px 8px",
          fontFamily: INTER,
          fontWeight: 800,
          fontSize: 10,
          letterSpacing: 1.2,
          color: "#fff",
        }}
      >
        {g.spk}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 7px", textAlign: "center" }}>
        {g.words.map((w, i) => (
          <span
            key={i}
            style={{
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: CAPTION_FONT,
              letterSpacing: 0.2,
              color: active(w) ? C.accent : "#fff",
              textShadow: "0 2px 0 rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.55)",
              lineHeight: 1.15,
            }}
          >
            {w.w}
          </span>
        ))}
      </div>
    </div>
  );
};

const Flash: React.FC<{ at: number; opacity?: number }> = ({ at, opacity = 0.35 }) => {
  const F = useCurrentFrame();
  if (F < at || F >= at + 7) return null;
  return <AbsoluteFill style={{ background: "#fff", opacity: interpolate(F, [at, at + 6], [opacity, 0], CL), zIndex: 65 }} />;
};

const VO: Array<[string, number]> = [
  ["F1", 6],
  ["M1", 48],
  ["F2", 79],
  ["M2", 114],
  ["F3", 202],
  ["M3", 237],
  ["M4", 291],
  ["F4", 348],
  ["M5", 380],
];

const SFX: Array<[string, number, number, number?]> = [
  ["pop", 2, 0.5],
  ["pop", 9, 0.45],
  ["whoosh2_short", 22, 0.25],
  ["click", 30, 0.6],
  ["whoosh", 48, 0.5],
  ["boom", 51, 0.55],
  ["whoosh2_short", 79, 0.3],
  ["pop", 80, 0.45],
  ["swipe", 90, 0.3],
  ["swipe", 102, 0.3],
  ["whoosh", 114, 0.45],
  ["pop", 116, 0.45],
  ["tick", 122, 0.25],
  ["tick", 128, 0.25],
  ["tick", 134, 0.25],
  ["whoosh2_short", 140, 0.3],
  ["pop", 142, 0.5],
  ["pop2", 150, 0.45],
  ["whoosh2_short", 154, 0.3],
  ["click", 163, 0.5],
  ["click", 167, 0.4],
  ["click", 171, 0.55],
  ["pop2", 175, 0.4],
  ["whoosh2_short", 178, 0.3],
  ["pop", 180, 0.5],
  ["tick", 188, 0.3],
  ["whoosh", 202, 0.55],
  ["boom", 203, 0.7],
  ["whoosh2_short", 237, 0.35],
  ["typing_short", 240, 0.35, 28],
  ["click", 270, 0.65],
  ["pop2", 271, 0.4],
  ["pop2", 278, 0.4],
  ["pop2", 281, 0.4],
  ["pop2", 284, 0.4],
  ["whoosh", 291, 0.4],
  ["tick", 297, 0.3],
  ["tick", 302, 0.3],
  ["tick", 307, 0.3],
  ["tick", 312, 0.3],
  ["tick", 317, 0.3],
  ["tick", 324, 0.3],
  ["success", 329, 0.5],
  ["whoosh", 334, 0.4],
  ["boom", 335, 0.4],
  ["whoosh2_short", 348, 0.3],
  ["pop", 349, 0.45],
  ["typing_short", 356, 0.3, 15],
  ["click", 370, 0.55],
  ["whoosh", 380, 0.4],
  ["pop2", 383, 0.45],
  ["pop", 392, 0.55],
  // FIXED (P0 #8): the notification chime now lands on the bubble frame
  // (bubble pops at 383) — was 398, 0.5s late.
  ["notif_short", 384, 0.5],
  ["pop2", 407, 0.4],
  ["success", 420, 0.35],
];

const AudioTrack: React.FC = () => (
  <>
    {VO.map(([id, fr]) => (
      <Sequence key={id} from={fr} durationInFrames={120}>
        <Audio src={staticFile(`lanesite15/vo/${id}.mp3`)} volume={1.0} />
      </Sequence>
    ))}
    {SFX.map(([name, fr, vol, end], i) => (
      <Sequence key={`s${i}`} from={fr} durationInFrames={end || 90}>
        <Audio src={staticFile(`lanesite15/sfx/${name}.mp3`)} volume={vol} endAt={end} />
      </Sequence>
    ))}
    <Audio
      src={staticFile("lanesite15/music/music.mp3")}
      // FIXED (P0 #5): ducking, not a flat 0.15. The music stem measures
      // -11.97 LUFS, so gain 0.34 puts it at -21.3 LUFS under the VO
      // (target -22..-20) and 0.5 lifts it to -18 LUFS in the outro once
      // the last line ends at frame 438. VO occupies 6–438 with only
      // ≤2-frame gaps, so there is no audible bed swell mid-speech.
      volume={(f) =>
        interpolate(f, [0, 6, 438, 442, 450], [0, AUDIO.musicDuckedGain, AUDIO.musicDuckedGain, AUDIO.musicGapGain, 0], CL)
      }
    />
  </>
);

// FIXED (P0 #6): the master is 1080x1920 (see RootFixed). The scene tree
// is still authored in 480x854 composition space, but it is rendered inside
// a 2.25x scale wrapper, so every line of text is live HTML rendered
// crisply at 1080p — 480p is preview-only from here on. The 1.5px height
// overshoot (854 * 2.25 = 1921.5) is clipped by the frame.
export const LaneSite15Fixed: React.FC<{ showZones?: boolean }> = ({ showZones = false }) => {
  const F = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: INTER }}>
      <LocalFonts />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 480,
          height: 854,
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        {F < 48 ? <SceneChatIntro /> : null}
        {F >= 48 && F < 79 ? <SceneExpand /> : null}
        {F >= 79 && F < 114 ? <SceneWhole /> : null}
        {F >= 114 && F < 202 ? <SceneCards /> : null}
        {F >= 202 && F < 237 ? <SceneNoWay /> : null}
        {F >= 237 && F < 291 ? <SceneDescribe /> : null}
        {F >= 291 && F < 348 ? <SceneBuild /> : null}
        {F >= 348 && F < 380 ? <SceneLinkAsk /> : null}
        {F >= 380 ? <SceneEnd /> : null}
        {/* Captions run F < 348 only: during SceneLinkAsk the words "The
            link?" / "link" are already on screen (bubble + typed input),
            and the caption block at 24% would sit on top of the comment
            sheet (bottom 216 comp px). */}
        {F < 348 ? <Captions /> : null}
        <Flash at={203} opacity={0.32} />
        <Flash at={335} opacity={0.28} />
        <Flash at={392} opacity={0.22} />
        <StatusBar />
      </div>
      {showZones ? <SafeZoneOverlay /> : null}
      <AudioTrack />
    </AbsoluteFill>
  );
};
