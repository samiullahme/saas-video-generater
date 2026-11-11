import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, INTER } from "./fonts15";

export const C = {
  bg: "#0B0B0D",
  panel: "#151518",
  panel2: "#1F1F25",
  white: "#F5F3EE",
  dim: "#8B8B92",
  orange: "#FF6B35",
  lime: "#B9FF3B",
  green: "#3DDC84",
  line: "rgba(255,255,255,0.09)",
};

export const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

type PopConfig = { damping?: number; stiffness?: number; mass?: number };

export const usePop = (delay = 0, config: PopConfig = {}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: Math.max(0, f - delay),
    fps,
    config: { damping: 13, stiffness: 220, mass: 0.5, ...config },
  });
};

export const GridBG: React.FC<{ opacity?: number }> = ({ opacity = 0.45 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        backgroundPosition: `${(f * 0.22) % 22}px ${(f * 0.12) % 22}px`,
        opacity,
      }}
    />
  );
};

export const Glow: React.FC<{ x?: number; y?: number; size?: number; color?: string; opacity?: number }> = ({
  x = -100,
  y = -150,
  size = 650,
  color = "255,107,53",
  opacity = 0.16,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, rgba(${color},${opacity}), transparent 65%)`,
      pointerEvents: "none",
    }}
  />
);

export const Big: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  stroke?: string;
  style?: React.CSSProperties;
}> = ({ children, size = 64, color = C.white, stroke = "rgba(0,0,0,0.6)", style }) => (
  <div
    style={{
      fontFamily: ANTON,
      fontSize: size,
      lineHeight: 0.86,
      letterSpacing: "-0.01em",
      color,
      WebkitTextStroke: `2px ${stroke}`,
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      fontFamily: INTER,
      fontWeight: 800,
      fontSize: 10,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: C.dim,
      ...style,
    }}
  >
    {children}
  </div>
);

const ICONS: Record<string, React.ReactNode> = {
  chat: <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H6l-4 3v-8.5A8.5 8.5 0 0 1 10.5 3h2A8.5 8.5 0 0 1 21 11.5Z" />,
  check: <path d="m4 12 5 5L20 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h10" />,
  tag: (
    <>
      <path d="M20 13 13 20 4 11V4h7l9 9Z" />
      <circle cx="8.5" cy="8.5" r="1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />,
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </>
  ),
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
};

export const Icon: React.FC<{ name: string; size?: number; color?: string; strokeWidth?: number }> = ({
  name,
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {ICONS[name] ?? null}
  </svg>
);

export const Phone: React.FC<{ children: React.ReactNode; width?: number; height?: number; style?: React.CSSProperties }> = ({
  children,
  width = 290,
  height = 600,
  style,
}) => (
  <div
    style={{
      width,
      height,
      borderRadius: 46,
      background: "#050506",
      padding: 9,
      boxShadow: "0 30px 70px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.10)",
      ...style,
    }}
  >
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 38, overflow: "hidden", background: "#0E0E11" }}>
      <div
        style={{
          position: "absolute",
          top: 9,
          left: "50%",
          transform: "translateX(-50%)",
          width: 74,
          height: 20,
          borderRadius: 12,
          background: "#000",
          zIndex: 60,
        }}
      />
      {children}
    </div>
  </div>
);

export const TypeDots: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", height: 12 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: C.dim,
            opacity: 0.4 + 0.6 * Math.abs(Math.sin(f * 0.35 + i)),
            transform: `translateY(${Math.sin(f * 0.35 + i) * 1.5}px)`,
          }}
        />
      ))}
    </div>
  );
};

const PIECES = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 79) % 460 + 10,
  delay: (i * 13) % 34,
  rot: (i * 53) % 360,
  w: 4 + (i % 3) * 2,
  h: 8 + (i % 4) * 4,
  color: [C.orange, C.white, C.lime][i % 3],
}));

export const Confetti: React.FC<{ start: number; count?: number }> = ({ start, count = 28 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {PIECES.slice(0, count).map((p, i) => {
        const local = f - start - p.delay;
        if (local < 0) return null;
        const opacity = local > 42 ? Math.max(0, 1 - (local - 42) / 12) : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + Math.sin((local + i) * 0.2) * 10,
              top: -30 + local * 11,
              width: p.w,
              height: p.h,
              background: p.color,
              opacity,
              transform: `rotate(${p.rot + local * 9}deg)`,
              borderRadius: 1,
              zIndex: 70,
            }}
          />
        );
      })}
    </>
  );
};

export const Cursor: React.FC<{ x: number; y: number; press?: number; size?: number; opacity?: number }> = ({
  x,
  y,
  press = 0,
  size = 28,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-2px,-2px) scale(${1 - 0.16 * press})`,
      opacity,
      filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.55))",
      zIndex: 85,
    }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M4 2l16 10-7 1.5L9 22z" fill="#fff" stroke="#000" strokeWidth="1.4" />
    </svg>
  </div>
);

export const LogoMark: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, transform: `scale(${scale})` }}>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 34 }}>
      <div style={{ width: 7, height: 24, borderRadius: 4, background: C.white }} />
      <div style={{ width: 7, height: 34, borderRadius: 4, background: C.orange }} />
      <div style={{ width: 7, height: 24, borderRadius: 4, background: C.white }} />
    </div>
    <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 26, letterSpacing: "-1px", color: C.white }}>
      Lane<span style={{ color: C.orange }}>Site</span>
    </div>
  </div>
);

export const Progress: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 4,
        width: `${Math.min(100, (f / 449) * 100)}%`,
        background: C.orange,
        zIndex: 200,
      }}
    />
  );
};

export const Flash: React.FC<{ frames: number[] }> = ({ frames }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#fff", opacity: frames.includes(f) ? 0.82 : 0, zIndex: 190, pointerEvents: "none" }} />;
};
