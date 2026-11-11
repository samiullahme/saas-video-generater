// SafeZoneOverlay — draws the TikTok UI zones over a 1080x1920 frame.
// Dev-only: pass showZones to the composition; never bake into the master.
// Zones (QA): bottom 16.7% (320px) covered by the bottom bar + caption row,
// top 12% (230px) covered by the top bar, right rail ~110px wide.
import React from "react";
import { SAFE, W, H } from "../tokens";

export const SafeZoneOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.85 }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 500, fontFamily: "Inter, sans-serif" }}>

    {/* Bottom covered zone */}
    <div
      style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: SAFE.bottomClearPx,
        background: "repeating-linear-gradient(45deg, rgba(255,60,46,0.22) 0 14px, rgba(255,60,46,0.10) 14px 28px)",
        borderTop: "3px solid #FF3C2E",
      }}
    >
      <span style={{ position: "absolute", top: 8, left: 16, fontSize: 22, fontWeight: 800, color: "#FF3C2E", background: "rgba(0,0,0,0.65)", padding: "4px 10px", borderRadius: 6 }}>
        TIKTOK UI — KEEP CLEAR · bottom {SAFE.bottomClearPct}%
      </span>
    </div>

    {/* Caption safe line: captions must sit on or above this line */}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: SAFE.captionBottomPx, borderTop: "2px dashed #22C55E" }}>
      <span style={{ position: "absolute", right: 16, top: -30, fontSize: 20, fontWeight: 800, color: "#22C55E", background: "rgba(0,0,0,0.65)", padding: "4px 10px", borderRadius: 6 }}>
        CAPTIONS ≥ {SAFE.captionBottomPct}% · {SAFE.captionBottomPx}px
      </span>
    </div>

    {/* Top covered zone */}
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: 0, height: SAFE.topClearPx,
        background: "repeating-linear-gradient(45deg, rgba(255,60,46,0.16) 0 14px, rgba(255,60,46,0.07) 14px 28px)",
        borderBottom: "3px solid #FF3C2E",
      }}
    >
      <span style={{ position: "absolute", bottom: 8, left: 16, fontSize: 22, fontWeight: 800, color: "#FF3C2E", background: "rgba(0,0,0,0.65)", padding: "4px 10px", borderRadius: 6 }}>
        TOP UI — KEEP CLEAR · 12%
      </span>
    </div>

    {/* Right rail */}
    <div
      style={{
        position: "absolute", right: 0, top: SAFE.topClearPx, bottom: SAFE.bottomClearPx, width: SAFE.rightRailPx,
        background: "repeating-linear-gradient(45deg, rgba(255,60,46,0.16) 0 14px, rgba(255,60,46,0.07) 14px 28px)",
        borderLeft: "3px solid #FF3C2E",
      }}
    >
      <span style={{ position: "absolute", top: 12, right: 8, fontSize: 18, fontWeight: 800, color: "#FF3C2E", background: "rgba(0,0,0,0.65)", padding: "4px 8px", borderRadius: 6, writingMode: "vertical-rl" }}>
        RIGHT RAIL
      </span>
    </div>

    {/* Side margins */}
    <div style={{ position: "absolute", left: SAFE.sideMarginPx - 2, top: SAFE.topClearPx, bottom: SAFE.bottomClearPx, width: 2, background: "#22C55E", opacity }} />
    <div style={{ position: "absolute", right: SAFE.sideMarginPx - 2, top: SAFE.topClearPx, bottom: SAFE.bottomClearPx, width: 2, background: "#22C55E", opacity }} />
    {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
    {void W, void H}
  </div>
);
