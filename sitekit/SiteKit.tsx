// SiteKit — the bakery demo site rebuilt as LIVE React components.
// Replaces every PNG website screenshot in the 15s video (P0 #3: the
// "Building preview…" bar was baked into maple_hero.png itself).
// Data comes from sitekit/data.ts (live lanesite.pro, verified 2026-11-11).
// Never paste a screenshot of a site here again for a fixed section.
//
// Coordinate space: components are designed at 480 wide (composition
// space) and fit into any slot via transform scale; the fixed composition
// scales the whole frame 2.25x to 1080x1920, so all text stays vector-crisp.

import React from "react";
import { BAKERY, DEMO } from "./data";
import { SITE } from "./tokens";

// Font families are served locally (see ../lanesite15-fixed/src/localFonts.ts)
// — the renderers include <LocalFonts /> at the composition root, so these
// names resolve to the local woff2 files, not Google Fonts.
const display = "Bricolage Grotesque";
const body = "Plus Jakarta Sans";
const mono = "JetBrains Mono";

// Flat loaf mark, drawn in code — the hero has no photo asset, so the
// visual is an illustrated panel (warm gradient + loaf + grain shapes),
// never a screenshot crop.
export const Loaf: React.FC<{ size?: number; color?: string }> = ({ size = 40, color = "#FFF7E6" }) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 48 35" fill="none">
    <path d="M4 21c0-3 1-6 3-8s5-3 8-3l1-1c5-2 10 0 11 5l1 3c3 2 6 6 6 11 0 3-2 7-5 9l-1 1H9l-2-1C5 35 4 30 4 28z" fill={color} opacity="0.95" />
    <path d="M12 14l4-3M20 11l5-2M28 12l5-1" stroke="#8c6a34" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M8 26h32" stroke="#8c6a34" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// Clean published-page chrome: lock + live domain. No preview bar, ever.
export const SiteChrome: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: compact ? "8px 10px" : "10px 12px", borderBottom: `1px solid ${SITE.line}`, background: "#fff", flexShrink: 0 }}>
    <div style={{ display: "flex", gap: 4 }}>
      {["#E4572E", "#F2C14E", "#1E9E5A"].map((c) => (
        <span key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
      ))}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: SITE.bg, borderRadius: 999, padding: "3px 8px", flex: 1, minWidth: 0 }}>
      <svg width="9" height="11" viewBox="0 0 10 12" fill="none">
        <rect x="1" y="5" width="8" height="6" rx="1.5" fill={SITE.muted} />
        <path d="M3 5V3.5a2 2 0 1 1 4 0V5" stroke={SITE.muted} strokeWidth="1.4" />
      </svg>
      <span style={{ fontFamily: mono, fontSize: compact ? 8 : 10, color: SITE.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {BAKERY.domain}
      </span>
    </div>
    <span style={{ fontFamily: body, fontWeight: 800, fontSize: 9, color: SITE.green, letterSpacing: 0.4 }}>LIVE</span>
  </div>
);

export const SiteNav: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 16px 0", flexShrink: 0, whiteSpace: "nowrap" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
      <span style={{ width: 26, height: 26, borderRadius: 8, background: SITE.brass, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: display, fontWeight: 800, fontSize: 15 }}>M</span>
      <span style={{ fontFamily: display, fontWeight: 800, fontSize: 15, color: SITE.fg, whiteSpace: "nowrap" }}>{BAKERY.name}</span>
    </div>
    <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
      {BAKERY.nav.map((n, i) => (
        <span key={n} style={{ fontFamily: body, fontWeight: i === 0 ? 800 : 600, fontSize: 11, color: i === 0 ? SITE.fg : SITE.muted, whiteSpace: "nowrap" }}>{n}</span>
      ))}
    </div>
    <span style={{ background: SITE.accentText, color: "#fff", fontFamily: body, fontWeight: 800, fontSize: 11, padding: "7px 10px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>Order now</span>
  </div>
);

// Illustrated hero visual — warm gradient, loaf mark, grain arcs.
export const HeroVisual: React.FC<{ height?: number }> = ({ height = 250 }) => (
  <div
    style={{
      position: "relative", height, borderRadius: 22, overflow: "hidden",
      background: "linear-gradient(135deg, #8c6a34 0%, #C49A5C 48%, #E8C98F 100%)",
    }}
  >
    <div style={{ position: "absolute", inset: 0, opacity: 0.16, background: "radial-gradient(circle at 78% 22%, #fff 0 90px, transparent 90px), radial-gradient(circle at 18% 82%, #fff 0 120px, transparent 120px)" }} />
    <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Loaf size={110} />
      <span style={{ fontFamily: display, fontWeight: 800, fontSize: 15, color: "#FFF7E6", letterSpacing: 2 }}>MAPLE BAKERY</span>
    </div>
    <span style={{ position: "absolute", left: 12, bottom: 10, fontFamily: body, fontWeight: 700, fontSize: 10, color: "#FFF7E6", background: "rgba(26,25,22,0.55)", padding: "4px 8px", borderRadius: 999 }}>
      {BAKERY.hours}
    </span>
  </div>
);

export const SiteHero: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div style={{ background: SITE.bg, color: SITE.fg, padding: compact ? "0 14px 14px" : "0 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
    {!compact && <SiteNav />}
    <div>
      <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: SITE.brass }}>{BAKERY.area.toUpperCase()}</span>
      <h1 style={{ fontFamily: display, fontWeight: 800, fontSize: compact ? 26 : 40, lineHeight: 1.05, margin: "6px 0 0", letterSpacing: -0.5 }}>
        {BAKERY.tagline}
      </h1>
      <p style={{ fontFamily: body, fontSize: compact ? 11 : 13, lineHeight: 1.5, color: SITE.muted, margin: "8px 0 0" }}>{BAKERY.sub}</p>
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ background: SITE.accentText, color: "#fff", fontFamily: body, fontWeight: 800, fontSize: 12, padding: "8px 14px", borderRadius: 999 }}>Order now</span>
      <span style={{ fontFamily: body, fontWeight: 700, fontSize: 12, color: SITE.fg, padding: "8px 12px", border: `1.5px solid ${SITE.fg}`, borderRadius: 999 }}>Call the shop</span>
    </div>
    <HeroVisual height={compact ? 150 : 250} />
    <div style={{ display: "flex", gap: 6 }}>
      {BAKERY.chips.map((c) => (
        <span key={c} style={{ fontFamily: body, fontWeight: 700, fontSize: 10.5, color: SITE.green, background: SITE.greenSoft, padding: "5px 9px", borderRadius: 999 }}>
          ● {c}
        </span>
      ))}
    </div>
  </div>
);

export const MenuList: React.FC = () => (
  <div style={{ background: SITE.bg, color: SITE.fg, padding: "14px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
    <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: SITE.brass }}>MENU · PARK SLOPE</span>
    <h2 style={{ fontFamily: display, fontWeight: 800, fontSize: 30, margin: 0 }}>Baked today</h2>
    {BAKERY.menu.map((m) => (
      <div key={m.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: `1px solid ${SITE.line}`, borderRadius: 16, padding: "13px 14px" }}>
        <div>
          <div style={{ fontFamily: body, fontWeight: 700, fontSize: 13.5 }}>{m.name}</div>
          <div style={{ fontFamily: body, fontSize: 11, color: SITE.muted, marginTop: 2 }}>Baked this morning</div>
        </div>
        <span style={{ fontFamily: display, fontWeight: 800, fontSize: 17 }}>{m.price}</span>
      </div>
    ))}
  </div>
);

export const OrderBox: React.FC<{ selected?: number }> = ({ selected = 1 }) => (
  <div style={{ background: SITE.bg, color: SITE.fg, padding: "14px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
    <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: SITE.brass }}>ORDER FORM</span>
    <h2 style={{ fontFamily: display, fontWeight: 800, fontSize: 30, margin: 0 }}>Order for pickup today</h2>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {BAKERY.pickupTimes.map((t, i) => (
        <span
          key={t}
          style={{
            fontFamily: body, fontWeight: 800, fontSize: 14, padding: "10px 16px", borderRadius: 999,
            background: i === selected ? SITE.fg : "#fff", color: i === selected ? "#fff" : SITE.fg,
            border: `1.5px solid ${i === selected ? SITE.fg : SITE.line}`,
          }}
        >
          {t}
        </span>
      ))}
    </div>
    <span style={{ background: SITE.accentText, color: "#fff", fontFamily: body, fontWeight: 800, fontSize: 13, padding: "12px", borderRadius: 12, textAlign: "center" }}>
      Place order · {BAKERY.pickupTimes[selected]}
    </span>
    <span style={{ fontFamily: body, fontSize: 11, color: SITE.muted }}>{BAKERY.hours} · Pay at pickup</span>
  </div>
);

// Code-drawn dashboard chart — replaces dashboard-stats-clean.png.
// The count-up is DEMO data and is labelled as such on screen.
export const DashboardStats: React.FC<{ count?: number; frame?: number }> = ({ count = DEMO.inquiries, frame = 0 }) => {
  const pts = "0,52 30,48 60,50 90,40 120,44 150,30 180,34 210,18 240,22 270,10 300,6";
  return (
    <div style={{ padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: body, fontWeight: 700, fontSize: 11, color: SITE.muted }}>This week</span>
        <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, letterSpacing: 1, color: SITE.brass, background: SITE.brassSoft, padding: "3px 6px", borderRadius: 4 }}>{DEMO.demoTag}</span>
      </div>
      <svg width="100%" height="64" viewBox="0 0 300 64" preserveAspectRatio="none" style={{ marginTop: 6 }}>
        <defs>
          <linearGradient id="dashfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SITE.brass} stopOpacity="0.35" />
            <stop offset="100%" stopColor={SITE.brass} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M${pts} L300,64 L0,64 Z`} fill="url(#dashfill)" />
        <polyline points={pts} fill="none" stroke={SITE.brass} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="270" cy="10" r="4" fill={SITE.accent} />
      </svg>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
        <span style={{ fontFamily: display, fontWeight: 800, fontSize: 30, color: SITE.fg }}>{count}</span>
        <span style={{ fontFamily: body, fontWeight: 700, fontSize: 11, color: SITE.muted }}>{DEMO.label}</span>
      </div>
    </div>
  );
};

// Full published page: chrome + one section. `fit` scales the 480-wide
// design into the caller's slot (slotW/480). The caller clips overflow.
export const SiteScene: React.FC<{
  page: "hero" | "menu" | "order";
  slotW: number;
  slotH: number;
}> = ({ page, slotW, slotH }) => {
  const s = slotW / 480;
  const content =
    page === "hero" ? <SiteHero /> : page === "menu" ? <MenuList /> : <OrderBox />;
  return (
    <div style={{ position: "relative", width: slotW, height: slotH, overflow: "hidden", background: SITE.bg, borderRadius: 18 }}>
      <div style={{ width: 480, height: slotH / s, transform: `scale(${s})`, transformOrigin: "top left", display: "flex", flexDirection: "column" }}>
        <SiteChrome />
        {content}
      </div>
    </div>
  );
};
