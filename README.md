# LaneSite video — Phase 1 foundation + fixed 15s video

Sandbox only. Nothing here writes to the user's VPS, and the source folder
`lanesite15-source/` is never edited — the fixed composition lives in
`lanesite15-fixed/` (a copy).

## The fixed video

`lanesite15-fixed/` — `LaneSite15Fixed`, 1080×1920, 30fps, 450 frames
(15.00s). The polished master is:

**`phase1/out/lanesite15-fixed-1080p.mp4`** — 3.34 MB, H.264 + AAC,
1080×1920, 30fps, 15.00s. Measured: **−14.17 LUFS integrated,
TP −2.23 dBTP, LRA 1.3** (targets: −14 ±1, TP ≤ −1.5, LRA ≤ 11).
The un-normalised Remotion output is kept as
`phase1/out/lanesite15-fixed-raw.mp4` (3.57 MB).

Render + loudnorm (verified 2026-11-11):

```
cd ~/workspace/remotion-test
./node_modules/.bin/remotion render phase1/lanesite15-fixed/entry.ts LaneSite15Fixed \
  --config=phase1/lanesite15-fixed/remotion.config.ts \
  phase1/out/lanesite15-fixed-raw.mp4
# loudnorm the mix (see the loudness note below)
ffmpeg -y -i phase1/out/lanesite15-fixed-raw.mp4 \
  -af loudnorm=I=-14:TP=-2.7:LRA=11 -c:v copy -c:a aac -b:a 192k \
  phase1/out/lanesite15-fixed-1080p.mp4
```

Render notes (sandbox-specific, all verified 2026-11-11):
- The scene tree is authored in 480×854 composition space and scaled
  2.25× by a wrapper to 1080×1920, so every text element is live HTML
  rendered crisply at 1080p (854 × 2.25 = 1921.5; the 1.5px overshoot is
  clipped by the frame).
- Fonts are local woff2 files in `lanesite15-fixed/public/lanesite15/fonts/`
  (OFL 1.1), loaded by `phase1/localFonts.tsx`. The sandbox's Chromium
  cannot fetch fonts.gstatic.com (ERR_SSL_PROTOCOL_ERROR via the proxy),
  so `@remotion/google-fonts` `loadFont` is not called at render time.
- The default public dir is a symlink `~/workspace/remotion-test/public`
  → `phase1/lanesite15-fixed/public`, so `staticFile("lanesite15/...")`
  resolves both with and without the fixed folder's `remotion.config.ts`.
- `DiceBear` needs matching major versions: `@dicebear/core` 9.2.4 +
  `@dicebear/adventurer` 9.4.2 (core 10.x breaks the 9.x style packages).
- All `@remotion/*` packages are 4.0.541 (the sandbox's Remotion version).
  The QA's 4.0.538 pin was for the VPS kit frozen at 4.0.538; mixing
  4.0.538 packages with a 4.0.541 core is unsupported.

## The 8 P0 fixes (defect → file:line in `lanesite15-fixed/src/LaneSite15.tsx`)

1. **Safe zone** — captions bottom 96→205 comp px (461px final, 24%),
   font 21→25 comp px (56px final); input bar bottom 26→150 (338px final);
   end logo bottom 106→200 (450px final). Constants `CAPTION_BOTTOM`,
   `CAPTION_FONT`, `INPUT_BOTTOM` at the top of the file.
2. **Timestamps** — one evening timeline: status-bar clock is frame-aware
   (9:38 < F200, 9:39 < F348, 9:41 after); Maya's stamps 11:42 PM → 9:38 PM
   (bubble + LinkCard); "posted 11:42 PM" → "posted 9:39 PM".
3. **"Building preview…"** — every website screenshot is gone. The bakery
   site is rebuilt as live components in `sitekit/` (from the real
   lanesite.pro markup/data, verified 2026-11-11): LinkCard thumbnail,
   SceneExpand, SceneWhole pages, SceneBuild flash, SceneNoWay backdrop,
   DashCard chart. No `maple_hero/menu/order`, `dashboard-stats-clean`,
   `maple_site`, `hero_1500` or `buildlog` image is referenced anywhere.
4. **Dead CTA** — end card: "link" bubble bobs, LINK breathes after landing,
   url pill pulses, Zara's reply "Got it — thanks!" slides in at frame 425,
   background glow breathes; LinkCard bobs, "active now" dot pulses,
   second typing dots at 36–47; MenuCard drifts; Describe button glows
   while typing; Build progress bar shimmers; LIVE dot pulses; LinkAsk
   has a breathing glow. Price line added: "Free to start · $5/mo Pro ·
   7 days free" (live pricing).
5. **Music ducking** — `AudioTrack`: gain 0.34 under VO (−21.3 LUFS, target
   −22..−20), 0.5 in the outro (−18 LUFS); fades at 0–6 and 438–450.
   Final mix loudnormed to −14 LUFS / TP ≤ −1.5 (see below).
6. **1080p master** — composition registered at 1080×1920 in `RootFixed.tsx`;
   480p stays preview-only.
7. **"Whole site?"** — the words slam in as an on-screen Anton title for
   the first 20 frames of SceneWhole (frames 79–99). Audio unchanged.
   Preferred fix remains a re-record (flagged for the user).
8. **Chime sync** — `notif_short` moved 398 → 384 (bubble pops at 383).

Contrast fixes (same file): `#8A8072`/`#9C9184`/`#A69C8D`/`#7A7066`/
`#8F8678`/`#9C9385` replaced by `#6E655A` (5.72:1) or `#BDB2A4`
(8.9:1 on dark); white-on-tomato buttons/avatars now use
`accentText #C73E12` (5.09:1). Booking times corrected to the live site's
11:00 / 4:30 / 7:00. "18 inquiries" is labelled DEMO DATA on screen.

## Phase 1 files

- `tokens.ts` — design tokens at 1080×1920 (safe zones, type scale,
  contrast floors, audio targets). `SCALE = 2.25`.
- `localFonts.tsx` — local `@font-face` loader (see above).
- `sitekit/` — `tokens.ts` (live lanesite.pro tokens), `data.ts` (verified
  live-site data — menu, prices, pickup times, build steps, pricing),
  `SiteKit.tsx` (SiteChrome, SiteNav, SiteHero, MenuList, OrderBox,
  DashboardStats, SiteScene, Loaf mark).
- `kit/` — component kit: `SafeZoneOverlay.tsx` (TikTok zones at 1080×1920),
  `Chat.tsx` (PhoneChrome, ChatBubble, TypingDots, Notification,
  CommentSheet, DiceBear avatars), `Beats.tsx` (BeatCard ×5 + BuildLog),
  `EndCards.tsx` (EndCard ×3, KineticType, TapCursor), `KitPreview.tsx`
  (one 1080×1920 composition showing every variant, 45 frames each).
- `qa/` — `harness.mjs` (node; static windows, black frames, safe zones,
  contrast, caption drift vs ffprobe-measured VO, chime sync, forbidden
  text, loudness), `manifest.json` (element positions, final px),
  `last-report.json` (latest run).
- `LICENSES.md` — every asset/source/license/URL.
- `lanesite15-fixed/` — fixed composition + `RootFixed.tsx` (registers
  `LaneSite15Fixed`, `LaneSite15FixedZones`, `KitPreview`) + `entry.ts` +
  `remotion.config.ts` + `public/lanesite15/` (VO/SFX/music + local fonts).

## QA harness

```
node phase1/qa/harness.mjs --selftest            # source-level checks only
node phase1/qa/harness.mjs out/lanesite15-fixed-1080p.mp4   # full check incl. video + loudness
```

Exit 0 = no P0 failures. **2026-11-11 results on the final deliverable:
77 passed, 0 P0 failed, 0 warnings** (source checks 71/71; the three
pre-render slices passed with 0 P0 failures each — 76/76/75).
Static detection is cell-based (a frame is still only when every 12px
cell is still, max-cell diff ≥ 2.0); the first slice run flagged 8
near-static windows at the whole-frame-mean threshold, which were
fixed with genuinely larger motion (LinkCard bob ±4 comp px, MenuCard
drift ±4, NoWay slow zoom + title breathing + chip pulse, Describe
button glow stronger, Build shimmer wider/faster, LinkAsk breathing
glow stronger + moving centre, End LINK breathing from frame 395
at ±2.5% and pill pulse ±8%) rather than by loosening the harness.

## Loudness (final encode)

Measured on the raw render: −15.52 LUFS / TP −0.58 / LRA 1.8.
**Sandbox lesson (2026-11-11):** loudnorm's own reported `output_tp`
is optimistic — the filter claims TP −1.50, but the AAC-encoded file
measures TP −0.36 (encoder inter-sample overshoot ≈ +0.5…1.1 dB).
So the final used `TP=-2.7` in the filter, landing at measured
TP −2.23 (integrated −14.17 LUFS, LRA 1.3). Always verify the encoded
file with a fresh loudnorm measure; do not trust the filter's
`output_tp` claim. The music ducking was verified separately:
outro 14.6–15.0s (music only, gain 0.5) mean −19.5 dB — audible; the
first 0.15s (music ramping in) mean −22.6 dB.

## Still to do / blockers (for the user)

- **Re-record (preferred fix for P0 #7):** "Whole site?" is still the same
  audio; the on-screen title covers it, but a clearer re-record
  ("Did you build the whole website?") with Zara/Matilda is better.
  Needs an ElevenLabs key/session — none here.
- **KitPreview** has not been rendered yet (only the fixed composition).
- The `public/` symlink at the project root is sandbox plumbing; if the
  project is ever moved, point the fixed folder's `remotion.config.ts`
  `setPublicDir` at the new location instead.
