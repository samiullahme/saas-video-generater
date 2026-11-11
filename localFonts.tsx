// Local font loading — the sandbox's Chromium cannot fetch
// fonts.gstatic.com (ERR_SSL_PROTOCOL_ERROR through the sandbox proxy),
// while curl can. So the five faces live in public/fonts/ as woff2 files
// (downloaded from Google Fonts 2026-11-11) and are served by Remotion
// itself. All five are OFL 1.1 (see phase1/LICENSES.md).
// Google's css2 API served VARIABLE-font woff2 files for Inter, Bricolage
// Grotesque, Plus Jakarta Sans and JetBrains Mono (one file per family,
// weight range 100–900); Anton is static at weight 400.
import React from "react";
import { staticFile } from "remotion";

export const ANTON = "Anton";
export const INTER = "Inter";
export const DISPLAY = "Bricolage Grotesque";
export const BODY = "Plus Jakarta Sans";
export const MONO = "JetBrains Mono";

const FACES: Array<{ family: string; file: string; weight: string }> = [
  { family: ANTON, file: "Anton-400.woff2", weight: "400" },
  { family: DISPLAY, file: "BricolageGrotesque-700.woff2", weight: "100 900" },
  { family: INTER, file: "Inter-400.woff2", weight: "100 900" },
  { family: MONO, file: "JetBrainsMono-500.woff2", weight: "100 900" },
  { family: BODY, file: "PlusJakartaSans-400.woff2", weight: "100 900" },
];

export const LocalFonts: React.FC = () => {
  const css = FACES.map(
    (f) =>
      `@font-face{font-family:'${f.family}';src:url(${staticFile("lanesite15/fonts/" + f.file)}) format('woff2');font-weight:${f.weight};font-style:normal;font-display:swap;}`
  ).join("\n");
  return <style>{css}</style>;
};
