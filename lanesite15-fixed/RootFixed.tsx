// Fixed 15s composition root (1080x1920 master).
// The source folder lanesite15-source/ is never edited; this root registers
// the fixed copy only.
import React from "react";
import { Composition } from "remotion";
import { LaneSite15Fixed } from "./src/LaneSite15";
import { KitPreview, KIT_PREVIEW_FRAMES } from "../kit/KitPreview";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="LaneSite15Fixed"
      component={LaneSite15Fixed}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={450}
      defaultProps={{ showZones: false }}
    />
    <Composition
      id="LaneSite15FixedZones"
      component={LaneSite15Fixed}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={450}
      defaultProps={{ showZones: true }}
    />
    <Composition
      id="KitPreview"
      component={KitPreview}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={KIT_PREVIEW_FRAMES}
      defaultProps={{ showZones: true }}
    />
  </>
);
