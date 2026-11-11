# License Ledger — LaneSite Phase 1 video assets

Every asset, font, icon and library used by the fixed 15s video and the
Phase 1 component kit. If it is not on this list, it is not in the video.

## Audio (pulled read-only from the VPS kit, `public/lanesite15/`)

| Asset | Source | License | Notes |
|---|---|---|---|
| Voiceover F1–F4, M1–M5 (`vo15/*.mp3`) | ElevenLabs eleven_v3 — Maya = Alice (`Xb7hH8MSUJpSbSDk0k2`), Zara = Matilda (`XrExE9yKIg1WjnnlVkGX`) | ElevenLabs generated voice — user's own account, commercial use per ElevenLabs terms | Durations measured with ffprobe (see `qa/harness.mjs`); captions are the measured ElevenLabs character timings |
| Music `music/music.mp3` | Mixkit (per QA audit § sound) | Mixkit free license, no attribution required | Track title not recorded in the kit; raw stem −11.97 LUFS; ducked 0.34 under VO, 0.5 in gaps (see `tokens.ts`) |
| SFX `sfx/*.mp3` — boom, click, notif, notif_short, pop, pop2, success, swipe, tick, typing, typing_short, whoosh, whoosh2, whoosh2_short | Mixkit | Mixkit free license, no attribution required | Timings verified against the video frames (see QA_15S.md § sound) |

## Fonts

| Font | Source | License | Used for |
|---|---|---|---|
| Anton | Google Fonts — **local woff2** in `public/fonts/Anton-400.woff2` | OFL 1.1 | Big display type ("NO WAY.", "LINK") |
| Inter | Google Fonts — **local variable woff2** in `public/fonts/Inter-400.woff2` | OFL 1.1 | UI / chat / captions |
| Archivo Black | Google Fonts — local TTF in `public/lanesite15/ArchivoBlack-Regular.ttf` (reference only, not loaded) | OFL 1.1 | Kit source heritage; not used in the fixed video |
| Bricolage Grotesque | Google Fonts — **local variable woff2** in `public/fonts/BricolageGrotesque-700.woff2` | OFL 1.1 | SiteKit display (live lanesite.pro display face) |
| Plus Jakarta Sans | Google Fonts — **local variable woff2** in `public/fonts/PlusJakartaSans-400.woff2` | OFL 1.1 | SiteKit body (live lanesite.pro body face) |
| JetBrains Mono | Google Fonts — **local variable woff2** in `public/fonts/JetBrainsMono-500.woff2` | OFL 1.1 | SiteKit URL / mono labels |

The five render fonts are downloaded from Google Fonts (2026-11-11) and
served locally by Remotion (`phase1/localFonts.ts` injects the `@font-face`
rules). The sandbox's Chromium cannot fetch fonts.gstatic.com
(ERR_SSL_PROTOCOL_ERROR via the sandbox proxy) — that is why
`@remotion/google-fonts` `loadFont` is no longer called at render time.
The package stays installed but unused by the render path. No font files
are shipped in the repo beyond `public/fonts/`.

## Icons & illustration

| Asset | Source | License | Notes |
|---|---|---|---|
| DiceBear "adventurer" avatars (kit variants only — `kit/Chat.tsx`) | `@dicebear/adventurer` 9.4.2 + `@dicebear/core` 10.7.0, generated locally at render | Code MIT; **artwork CC BY 4.0** | Artwork by Lisa Wischofsky. **Attribution required** when a kit avatar appears in a published video — credit "Avatars: DiceBear (CC BY 4.0)" in the post caption or video credits. The fixed 15s composition does NOT use DiceBear (it keeps flat letter avatars), so no attribution is needed for the 15s master. |
| Lucide icons | `lucide-react` 1.71.0 | ISC | Kit components (reserved for future kit variants; the fixed 15s comp uses hand-drawn inline SVG) |
| Loaf mark (`sitekit/SiteKit.tsx`) | Drawn in code (inline SVG) | Original | Stylised bread mark — no photo asset |
| Grain texture (`public/lanesite15/grain.png`) | Pulled from the VPS kit | Kit asset (author unknown) | Texture overlay only; not a screenshot |

## Libraries (Remotion 4.0.541 line)

| Package | Version | License |
|---|---|---|
| `remotion`, `@remotion/cli`, `@remotion/google-fonts` | 4.0.541 | MIT (Remotion free license covers the user as an individual; commercial use — see remotion.dev/license) |
| `@remotion/transitions`, `@remotion/motion-blur`, `@remotion/shapes`, `@remotion/paths`, `@remotion/layout-utils`, `@remotion/noise` | 4.0.541 | MIT |
| `react`, `react-dom` | 19.3.1 | MIT |
| `@dicebear/core` | 9.2.4 | MIT |

**Version note (QA pin resolved):** the QA audit pinned `@remotion/transitions`
to 4.0.538 because the VPS kit is frozen at Remotion 4.0.538. The sandbox
project is Remotion 4.0.541, and Remotion requires all `@remotion/*`
packages to match the core version exactly — mixing 4.0.538 packages with a
4.0.541 core is unsupported. All `@remotion/*` packages here are therefore
4.0.541 (same major line, same APIs). If the VPS kit is ever re-frozen to
4.0.541, the two line up again.

**Skipped, per the QA:** `@remotion/three`, glitch/particle packs, GSAP,
Framer Motion.

## Images — NONE in the fixed video

The fixed 15s composition contains **no raster website screenshots**:
`maple_hero.png`, `maple_menu.png`, `maple_order.png`,
`dashboard-stats-clean.png`, `maple_site.png`, `hero_1500.png` and
`buildlog.png` are NOT referenced. The bakery site sections are rebuilt as
live components in `sitekit/` from the real lanesite.pro markup/data
(verified 2026-11-11). The PNGs stay in `public/lanesite15/` only as
reference for the source folder — the fixed composition never loads them.

## Data

- Maple Bakery name, area, menu items, prices, pickup times, hours, build
  log steps and pricing: live lanesite.pro, verified 2026-11-11
  (see `sitekit/data.ts`). No invented stats.
- Dashboard "18 inquiries" is **demo data** and is labelled "DEMO DATA"
  on screen wherever it appears.
