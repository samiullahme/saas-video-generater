// KitPreview — one composition showing every Phase 1 kit variant in sequence.
// 1080x1920, 30fps. Each variant gets 45 frames (1.5s) inside the 2.25x
// scale wrapper, with a label chip and (optionally) the safe-zone overlay.
// Render: npx remotion render phase1/lanesite15-fixed/entry.ts KitPreview out/kit-preview.mp4
// Stills: npx remotion still phase1/lanesite15-fixed/entry.ts KitPreview --frame=N out/kit-still.png
import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { SCALE } from "../tokens";
import { LocalFonts } from "../localFonts";
import { SafeZoneOverlay } from "./SafeZoneOverlay";
import { PhoneChrome, ChatBubble, TypingDots, Notification, CommentSheet } from "./Chat";
import { BeatMenu, BeatPrices, BeatBooking, BeatDashboard, BeatOrders, BuildLog } from "./Beats";
import { KineticType, TapCursor, EndCardA, EndCardB, EndCardC } from "./EndCards";
import { SiteScene } from "../sitekit/SiteKit";
import { BAKERY } from "../sitekit/data";

export const KIT_VARIANTS = [
  "PhoneChrome + ChatBubble",
  "Notification",
  "CommentSheet (typing)",
  "BeatCard · Menu",
  "BeatCard · Prices",
  "BeatCard · Booking",
  "BeatCard · Dashboard",
  "BeatCard · Orders",
  "BuildLog",
  "SiteKit · Hero",
  "SiteKit · Menu",
  "SiteKit · Order",
  "KineticType",
  "TapCursor",
  "EndCard · A (LINK slam)",
  "EndCard · B (price-led)",
  "EndCard · C (loop-back)",
] as const;

export const KIT_PREVIEW_FRAMES = KIT_VARIANTS.length * 45;

const Label: React.FC<{ i: number }> = ({ i }) => (
  <div style={{ position: "absolute", top: 112, left: 16, right: 16, zIndex: 90, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ background: "rgba(0,0,0,0.72)", color: "#fff", fontSize: 13, fontWeight: 800, padding: "7px 12px", borderRadius: 999 }}>
      {i + 1}. {KIT_VARIANTS[i]}
    </span>
    <span style={{ background: "rgba(0,0,0,0.72)", color: "#F3EDE2", fontSize: 11, fontWeight: 700, padding: "7px 10px", borderRadius: 999 }}>
      {i + 1}/{KIT_VARIANTS.length}
    </span>
  </div>
);

// The 480x854 comp-space stage, scaled 2.25x to fill 1080x1920.
const Stage: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => (
  <AbsoluteFill style={{ background: "#0B0908" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 480, height: 854, transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
      <div style={{ position: "absolute", inset: 0, background: "#0B0908", color: "#fff", fontFamily: "Inter, sans-serif", overflow: "hidden" }}>
        {children}
        <Label i={i} />
      </div>
    </div>
  </AbsoluteFill>
);

const V: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => (
  <Sequence from={i * 45} durationInFrames={45}>
    <Stage i={i}>{children}</Stage>
  </Sequence>
);

export const KitPreview: React.FC<{ showZones?: boolean }> = ({ showZones = true }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ width, height, background: "#0B0908" }}>
      <LocalFonts />
      <V i={0}>
        <PhoneChrome clock="9:38" title="Maya · Maple Bakery">
          <div style={{ padding: "14px 14px 0", display: "flex", flexDirection: "column", gap: 10 }}>
            <ChatBubble side="left" text="You built this?" time="9:38 PM" at={2} avatarSeed="Maya" />
            <ChatBubble side="right" text="Last night." time="9:38 PM" at={10} avatarSeed="Zara" />
            <TypingDots at={18} until={40} />
          </div>
        </PhoneChrome>
      </V>
      <V i={1}>
        <div style={{ position: "absolute", inset: 0, background: "#141110" }} />
        <Notification title="Maya · Maple Bakery" body="Comment link. I'll send it to you." at={2} avatarSeed="Maya" badge="1" />
      </V>
      <V i={2}>
        <div style={{ position: "absolute", inset: 0, background: "#141110" }} />
        <CommentSheet at={2} typed="link" reply={{ text: "Sending it now — check your DMs.", at: 30, avatarSeed: "Maya" }} />
      </V>
      <V i={3}>
        <div style={{ position: "absolute", inset: 0, padding: "180px 24px 0" }}><BeatMenu /></div>
      </V>
      <V i={4}>
        <div style={{ position: "absolute", inset: 0, padding: "180px 24px 0" }}><BeatPrices /></div>
      </V>
      <V i={5}>
        <div style={{ position: "absolute", inset: 0, padding: "180px 24px 0" }}><BeatBooking /></div>
      </V>
      <V i={6}>
        <div style={{ position: "absolute", inset: 0, padding: "180px 24px 0" }}><BeatDashboard /></div>
      </V>
      <V i={7}>
        <div style={{ position: "absolute", inset: 0, padding: "180px 24px 0" }}><BeatOrders /></div>
      </V>
      <V i={8}>
        <div style={{ position: "absolute", inset: 0, padding: "180px 24px 0" }}>
          <BuildLog steps={BAKERY.buildSteps.slice(0, 6)} startFrame={2} tickEvery={6} />
        </div>
      </V>
      <V i={9}>
        <div style={{ position: "absolute", inset: 0, padding: "170px 14px 0" }}>
          <SiteScene page="hero" slotW={452} slotH={600} />
        </div>
      </V>
      <V i={10}>
        <div style={{ position: "absolute", inset: 0, padding: "170px 14px 0" }}>
          <SiteScene page="menu" slotW={452} slotH={600} />
        </div>
      </V>
      <V i={11}>
        <div style={{ position: "absolute", inset: 0, padding: "170px 14px 0" }}>
          <SiteScene page="order" slotW={452} slotH={600} />
        </div>
      </V>
      <V i={12}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
          <KineticType words={["IT", "BUILT", "EVERYTHING."]} at={2} fontSize={72} accentLast />
        </div>
      </V>
      <V i={13}>
        <div style={{ position: "absolute", inset: 0, background: "#141110" }}>
          <div style={{ position: "absolute", left: 60, top: 300, width: 360, height: 120, background: "#F7F5F0", borderRadius: 16 }} />
          <TapCursor keys={[[0, 200, 420], [12, 320, 360], [24, 320, 360]]} tapAt={24} />
        </div>
      </V>
      <V i={14}><EndCardA at={0} /></V>
      <V i={15}><EndCardB at={0} /></V>
      <V i={16}><EndCardC at={0} /></V>
      {showZones && <SafeZoneOverlay />}
    </AbsoluteFill>
  );
};
