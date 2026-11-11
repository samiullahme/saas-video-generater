import React from "react";
import { Composition } from "remotion";
import { LaneSite15 } from "./LaneSite15";
import { Probe15 } from "./Probe15";
export const Root15: React.FC = () => (
  <>
    <Composition id="LaneSite15" component={LaneSite15} width={480} height={854} fps={30} durationInFrames={450} />
    <Composition id="LaneSite15Test" component={Probe15} width={480} height={854} fps={30} durationInFrames={30} />
  </>
);
