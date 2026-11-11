import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Anton";
const anton = loadFont();
export const Probe15: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0b0b0d", justifyContent: "center", alignItems: "center" }}>
      <div style={{ color: "#fff", fontFamily: anton.fontFamily, fontSize: 72, transform: `scale(${0.9 + f / 300})` }}>LANESITE 15</div>
    </AbsoluteFill>
  );
};
