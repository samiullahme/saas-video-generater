// BeatCard x5 layouts + BuildLog. Comp-space (480x854).
// BeatCard is the "proof" card that cycles every 2s in the middle of the
// reel: menu, prices, booking, dashboard, orders. Each layout is a variant;
// the fixed composition uses all five in sequence (SceneCards).
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../tokens";
import { BAKERY, DEMO } from "../sitekit/data";
import { SITE } from "../sitekit/tokens";
import { DashboardStats } from "../sitekit/SiteKit";

const Card: React.FC<{ children: React.ReactNode; title: string; icon: React.ReactNode }> = ({ children, title, icon }) => (
  <div style={{ background: "#fff", borderRadius: 22, padding: 16, color: COLORS.ink, fontFamily: "Inter, sans-serif", boxShadow: "0 18px 44px rgba(0,0,0,0.4)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span style={{ width: 30, height: 30, borderRadius: 10, background: COLORS.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: COLORS.micro }}>{title}</span>
    </div>
    {children}
  </div>
);

const Icon = {
  menu: <span style={{ fontSize: 16 }}>☰</span>,
  price: <span style={{ fontSize: 16 }}>$</span>,
  cal: <span style={{ fontSize: 16 }}>▦</span>,
  chart: <span style={{ fontSize: 16 }}>↗</span>,
  stack: <span style={{ fontSize: 16 }}>▤</span>,
};

// Float helper — every proof card keeps drifting so no frame is static.
export const floatY = (frame: number, amp = 2.5, speed = 0.09, phase = 0) => Math.sin(frame * speed + phase) * amp;

export const BeatMenu: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Card title="ONLINE MENU" icon={Icon.menu}>
      <div style={{ transform: `translateY(${floatY(frame)}px)` }}>
        {BAKERY.menu.map((m, i) => (
          <div key={m.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 2px", borderBottom: i < 2 ? "1px solid #F1EBDF" : "none", opacity: interpolate(frame, [i * 4, i * 4 + 8], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            <span style={{ fontSize: 14.5, fontWeight: 700 }}>{m.name}</span>
            <span style={{ fontSize: 14.5, fontWeight: 800, color: COLORS.accentText }}>{m.price}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: COLORS.micro, marginTop: 6 }}>Updated today · prices live on the site</div>
    </Card>
  );
};

export const BeatPrices: React.FC = () => {
  const frame = useCurrentFrame();
  const tags = ["Free to start", "No credit card", "Live with HTTPS", "In 5 minutes"];
  return (
    <Card title="SIMPLE PRICING" icon={Icon.price}>
      <div style={{ fontSize: 15, lineHeight: 1.5 }}>
        Your site is live in <b>5 minutes</b> — and you keep <b>every rupee it earns</b>.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {tags.map((t, i) => (
          <span key={t} style={{ fontSize: 11.5, fontWeight: 800, background: i === 0 ? COLORS.greenSoft : "#F4EFE6", color: i === 0 ? COLORS.green : COLORS.ink, padding: "6px 10px", borderRadius: 999, transform: `translateY(${floatY(frame + i * 9, 2, 0.09, i)}px)` }}>
            {i === 0 ? "✓ " : ""}{t}
          </span>
        ))}
      </div>
    </Card>
  );
};

export const BeatBooking: React.FC = () => {
  const frame = useCurrentFrame();
  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  return (
    <Card title="BOOKINGS" icon={Icon.cal}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Order for pickup today</div>
      <div style={{ display: "flex", gap: 6 }}>
        {days.map((d, i) => (
          <span key={d} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 800, padding: "8px 0", borderRadius: 10, background: i === 2 ? COLORS.ink : "#F4EFE6", color: i === 2 ? "#fff" : COLORS.micro }}>{d}</span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        {BAKERY.pickupTimes.map((t, i) => (
          <span key={t} style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: 800, padding: "8px 0", borderRadius: 999, border: `1.5px solid ${i === 1 ? COLORS.ink : "#E8E0D2"}`, background: i === 1 ? "#FFF4DE" : "#fff", transform: `translateY(${floatY(frame + i * 11, 1.5, 0.11, i)}px)` }}>{t}</span>
        ))}
      </div>
    </Card>
  );
};

export const BeatDashboard: React.FC<{ count?: number }> = ({ count = DEMO.inquiries }) => (
  <Card title="OWNER DASHBOARD" icon={Icon.chart}>
    <DashboardStats count={count} />
  </Card>
);

export const BeatOrders: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { text: "2× milk bread · 11:00 pickup", state: "Paid" },
    { text: "Fudge cake 2 lb · today", state: "Paid" },
    { text: "6 patties · 4:30 pickup", state: "New" },
  ];
  return (
    <Card title="TODAY'S ORDERS" icon={Icon.stack}>
      {rows.map((r, i) => (
        <div key={r.text} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 2px", borderBottom: i < 2 ? "1px solid #F1EBDF" : "none", opacity: interpolate(frame, [i * 5, i * 5 + 8], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r.text}</span>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: r.state === "New" ? COLORS.accentText : COLORS.green, background: r.state === "New" ? COLORS.accentSoft : COLORS.greenSoft, padding: "4px 8px", borderRadius: 999 }}>{r.state}</span>
        </div>
      ))}
    </Card>
  );
};

// BuildLog — ticks rows in sequence; progress fills with frame.
export const BuildLog: React.FC<{
  steps: { label: string; sub?: string }[];
  startFrame: number;
  tickEvery?: number;
  logColor?: string;
}> = ({ steps, startFrame, tickEvery = 7 }) => {
  const frame = useCurrentFrame();
  const done = steps.filter((_, i) => frame >= startFrame + (i + 1) * tickEvery).length;
  const progress = interpolate(frame, [startFrame, startFrame + steps.length * tickEvery], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "14px 16px", color: COLORS.ink, fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: COLORS.micro }}>
        <span>LANESITE · BUILDING YOUR SITE</span>
        <span style={{ color: COLORS.green }}>{done === steps.length ? "● LIVE" : "● BUILDING"}</span>
      </div>
      <div style={{ height: 6, background: "#F0EADC", borderRadius: 999, margin: "10px 0 6px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: `linear-gradient(90deg, ${COLORS.accent}, ${SITE.brass})`, borderRadius: 999, transition: "none" }} />
      </div>
      {steps.map((s, i) => {
        const ticked = frame >= startFrame + (i + 1) * tickEvery;
        const active = !ticked && frame >= startFrame + i * tickEvery;
        return (
          <div key={s.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0", borderBottom: i < steps.length - 1 ? "1px solid #F4EFE6" : "none" }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: ticked ? COLORS.green : "#EFE9DC", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
              {ticked ? "✓" : "·"}
            </span>
            <div style={{ opacity: ticked ? 1 : active ? 0.9 : 0.55 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</div>
              {s.sub && <div style={{ fontSize: 11, color: COLORS.micro, marginTop: 1 }}>{s.sub}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
