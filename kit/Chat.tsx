// PhoneChrome + ChatBubble + LinkPreview + CommentSheet + Notification.
// Comp-space (480x854). Avatars are DiceBear "adventurer" SVGs (CC BY 4.0 —
// see LICENSES.md for the attribution note) generated deterministically
// from a seed; the fixed composition keeps its flat letter avatars, kit
// variants may use these illustrated ones.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { createAvatar } from "@dicebear/core";
import * as adventurer from "@dicebear/adventurer";
import { COLORS } from "../tokens";

export const diceAvatar = (seed: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    createAvatar(adventurer, { seed, backgroundColor: ["f7f5f0"] }).toString()
  )}`;

export const PhoneChrome: React.FC<{
  clock: string;
  title?: string;
  children: React.ReactNode;
}> = ({ clock, title, children }) => (
  <div style={{ width: "100%", height: "100%", background: COLORS.bg, color: "#fff", position: "relative", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
    <div style={{ display: "flex", alignItems: "center", padding: "14px 20px 6px", fontSize: 13, fontWeight: 700 }}>
      <span>{clock}</span>
      <span style={{ margin: "0 auto", width: 64, height: 18, background: "#000", borderRadius: 999 }} />
      <span style={{ fontSize: 11, color: "#C9C2B4" }}>5G ▂▄▆</span>
    </div>
    {title && (
      <div style={{ padding: "6px 20px 10px", fontSize: 17, fontWeight: 800, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {title}
      </div>
    )}
    {children}
  </div>
);

export const springIn = (frame: number, fps: number, at: number, cfg = {}) =>
  spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 160, mass: 0.6, ...cfg } });

export const ChatBubble: React.FC<{
  side: "left" | "right";
  text: string;
  time: string;
  at: number;
  avatarSeed?: string;
  accent?: boolean;
}> = ({ side, text, time, at, avatarSeed, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springIn(frame, fps, at);
  const opacity = interpolate(frame, [at, at + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(s, [0, 1], [14, 0]);
  const scale = interpolate(s, [0, 1], [0.7, 1]);
  return (
    <div
      style={{
        display: "flex", justifyContent: side === "left" ? "flex-start" : "flex-end", alignItems: "flex-end", gap: 8,
        opacity, transform: `translateY(${y}px) scale(${scale})`, transformOrigin: side === "left" ? "bottom left" : "bottom right",
      }}
    >
      {side === "left" && avatarSeed && (
        <img src={diceAvatar(avatarSeed)} alt="" style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "#F7F5F0" }} />
      )}
      <div
        style={{
          maxWidth: "78%", padding: "12px 15px", borderRadius: 20,
          borderBottomLeftRadius: side === "left" ? 4 : 20, borderBottomRightRadius: side === "right" ? 4 : 20,
          background: accent ? COLORS.accent : side === "left" ? COLORS.left : "#EFE9DC",
          color: accent ? "#fff" : side === "left" ? COLORS.leftText : "#1A1712",
          fontSize: 15, lineHeight: 1.4,
        }}
      >
        {text}
        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.65, textAlign: "right" }}>{time}</div>
      </div>
    </div>
  );
};

export const TypingDots: React.FC<{ at: number; until?: number }> = ({ at, until = 99999 }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > until) return null;
  const dots = [0, 1, 2].map((i) => {
    const p = 0.5 + 0.5 * Math.sin((frame / 6) + i * 1.05);
    return <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#D8D0BF", transform: `translateY(${-2 * p}px)` }} />;
  });
  return (
    <div style={{ display: "flex", gap: 4, background: COLORS.left, padding: "12px 14px", borderRadius: 20, borderBottomLeftRadius: 4, width: 58 }}>{dots}</div>
  );
};

export const Notification: React.FC<{
  title: string;
  body: string;
  at: number;
  avatarSeed?: string;
  badge?: string;
}> = ({ title, body, at, avatarSeed, badge }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 200 } });
  const y = interpolate(s, [0, 1], [-90, 0]);
  const opacity = interpolate(frame, [at, at + 4, at + 90, at + 100], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", top: 46, left: 14, right: 14, zIndex: 60, opacity, transform: `translateY(${y}px)` }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(28,25,23,0.96)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 18, padding: "10px 12px", boxShadow: "0 12px 30px rgba(0,0,0,0.45)" }}>
        {avatarSeed ? (
          <img src={diceAvatar(avatarSeed)} alt="" style={{ width: 38, height: 38, borderRadius: 10, background: "#F7F5F0" }} />
        ) : (
          <span style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>L</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#fff", fontWeight: 700 }}>
            <span>{title}</span>
            <span style={{ color: "#A8A094", fontWeight: 600, fontSize: 11 }}>now</span>
          </div>
          <div style={{ fontSize: 12.5, color: "#D8D0BF", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{body}</div>
        </div>
        {badge && <span style={{ background: COLORS.accent, color: "#fff", fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "3px 7px" }}>{badge}</span>}
      </div>
    </div>
  );
};

export const CommentSheet: React.FC<{
  at: number;
  typed: string;
  placeholder?: string;
  reply?: { text: string; at: number; avatarSeed?: string };
}> = ({ at, typed, placeholder = "Add a comment…", reply }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 18, stiffness: 180 } });
  const y = interpolate(s, [0, 1], [220, 0]);
  const shown = typed.slice(0, Math.max(0, Math.floor(interpolate(frame, [at + 8, at + 8 + typed.length * 1.6], [0, typed.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))));
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 205, zIndex: 40, transform: `translateY(${y}px)` }}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "14px 16px 12px", color: "#141110" }}>
        <div style={{ width: 36, height: 4, borderRadius: 999, background: "#E5DED2", margin: "0 auto 10px" }} />
        <div style={{ fontSize: 13, fontWeight: 800 }}>Comments</div>
        {reply && frame >= reply.at && (
          <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "flex-start" }}>
            {reply.avatarSeed && <img src={diceAvatar(reply.avatarSeed)} alt="" style={{ width: 28, height: 28, borderRadius: "50%", background: "#F7F5F0" }} />}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800 }}>Maya · Maple Bakery</div>
              <div style={{ fontSize: 13, marginTop: 2 }}>{reply.text}</div>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
          <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>Z</span>
          <span style={{ flex: 1, fontSize: 13, color: shown ? "#141110" : "#9C9184", borderBottom: "1px solid #ECE6DA", paddingBottom: 6 }}>
            {shown || placeholder}
            {shown.length < typed.length && frame >= at + 8 && <span style={{ opacity: 0.6 + 0.4 * Math.sin(frame / 3) }}>|</span>}
          </span>
          <span style={{ background: shown ? COLORS.accent : "#E5DED2", color: "#fff", fontSize: 12, fontWeight: 800, padding: "8px 14px", borderRadius: 999 }}>Post</span>
        </div>
      </div>
    </div>
  );
};

// Kept so AbsoluteFill import is used by the kit's showcase wrapper.
export const KitFill: React.FC<{ children: React.ReactNode }> = ({ children }) => <AbsoluteFill>{children}</AbsoluteFill>;
