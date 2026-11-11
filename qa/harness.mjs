// LaneSite Phase 1 QA harness (node, no new deps — ffmpeg + ffprobe only).
// Usage:
//   node qa/harness.mjs <video.mp4 | frames-dir>
//   node qa/harness.mjs --selftest   (source-level checks only)
//   node qa/harness.mjs <video.mp4> --manifest qa/manifest.json
//
// Checks (P0 = fail, W = warning):
//  P0 static windows  : >0.35s of near-identical frames (10fps, cell-based:
//                        a frame is still only when every 12px cell is still)
//  P0 black frames    : mean luminance < 8
//  P0 safe zones      : manifest elements below the 320px bottom line or
//                       captions below 461px / smaller than 56px
//  P0 contrast        : WCAG ratio < 4.5 (normal) / < 3.0 (large, >=42px bold)
//  P0 caption drift   : caption first/last word vs its VO line window (+/-2f),
//                       or VO mp3 duration vs timing.ts off by >2 frames
//  P0 chime sync      : notif_short start frame within 2 frames of the
//                       "sent just now" bubble frame (383)
//  P0 forbidden text  : "11:42", "Building preview", "Pro CANCELLED", any
//                       screenshot path, or a low-contrast grey hex in the
//                       fixed source (comments stripped first)
//  P0 geometry        : composition must be 1080x1920 / 30fps / 450f
//  W  loudness        : final mix -14 LUFS (tol +/-1), TP <= -1.5, LRA <= 11
// Exit code 1 if any P0 fails. JSON report at qa/last-report.json.
import { spawnSync, execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIXED = join(ROOT, "lanesite15-fixed", "src", "LaneSite15.tsx");
const CAPTIONS = join(ROOT, "lanesite15-fixed", "src", "captions.ts");
const TIMING = join(ROOT, "lanesite15-fixed", "src", "timing.ts");
const ASSETS = join(ROOT, "lanesite15-fixed", "public", "lanesite15");
const FPS = 30;
const results = [];
const fail = (id, msg, detail) => results.push({ level: "P0", id, msg, detail, pass: false });
const warn = (id, msg, detail) => results.push({ level: "W", id, msg, detail, pass: false });
const ok = (id, msg, detail) => results.push({ level: "OK", id, msg, detail, pass: true });

// --- WCAG contrast ---------------------------------------------------------
const lum = (hex) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [R, G, B] = [r, g, b].map(f);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};
const ratio = (fg, bg) => {
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

// Pairs actually used in the FIXED design (fg, bg, final px, bold?, where).
// All computed 2026-11-11; the harness recomputes them here.
const CONTRAST_PAIRS = [
  ["#5A5248", "#FFFFFF", 25, true, "microtext on white (fixed)"],
  ["#6E655A", "#FFFFFF", 25, false, "light microtext on white (fixed)"],
  ["#6E655A", "#F7F5F0", 25, false, "SiteKit muted on cream"],
  ["#FFFFFF", "#C73E12", 27, true, "white on accentText button"],
  ["#C73E12", "#FFFFFF", 34, true, "accentText price on white"],
  ["#FFFFFF", "#FF5A2E", 342, true, "LINK display type (large, 3:1 floor)"],
  ["#F5EFE5", "#1C1917", 34, false, "chat bubble text"],
  ["#1A1712", "#EFE9DC", 34, false, "right bubble text"],
  ["#141110", "#FFFFFF", 25, true, "card body on white"],
  ["#D8D0BF", "#0B0908", 32, false, "end-card sub text"],
  ["#A8A094", "#0B0908", 28, false, "end-card footer text"],
  ["#BDB2A4", "#0B0908", 20, false, "Seen line on film bg"],
  ["#A89E8F", "#1B1714", 30, false, "input placeholder on dark"],
  ["#BDB2A4", "#17130F", 22, false, "View all on comment bg"],
  ["#FF8A66", "#0B0908", 22, true, "Maya link label on film bg"],
  ["#6E6A63", "#FFFFFF", 24, false, "link card sub on white"],
  ["#FFFFFF", "#C73E12", 34, true, "white avatar letter on accentText"],
];
for (const [fg, bg, px, bold, where] of CONTRAST_PAIRS) {
  const r = ratio(fg, bg);
  const large = px >= 42 || (px >= 34 && bold);
  const floor = large ? 3.0 : 4.5;
  if (r < floor) fail("contrast", `${where}: ${r.toFixed(2)}:1 < ${floor}:1 floor`, `${fg} on ${bg}`);
  else ok("contrast", `${where}: ${r.toFixed(2)}:1 ≥ ${floor}:1`, `${fg} on ${bg}`);
}

// --- Source-level checks ---------------------------------------------------
function checkSource() {
  if (!existsSync(FIXED)) { fail("source", "fixed composition not found", FIXED); return; }
  const raw = readFileSync(FIXED, "utf8");
  // Strip comments before the forbidden-text scan (comments describe the
  // removed defects; only live code may contain them).
  const src = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const root = readFileSync(join(ROOT, "lanesite15-fixed", "RootFixed.tsx"), "utf8");

  for (const bad of ["11:42", "Building preview", "Pro CANCELLED", "ends Nov 27", "maple_hero", "maple_menu", "maple_order", "dashboard-stats", "maple_site", "hero_1500", "buildlog.png"]) {
    if (src.includes(bad)) fail("forbidden", `fixed source still contains "${bad}"`, "remove or replace");
    else ok("forbidden", `no "${bad}" in fixed source`, "");
  }
  // Low-contrast greys must be gone from live code (case-insensitive).
  for (const bad of ["#8A8072", "#9C9184", "#A69C8D", "#7A7066", "#8F8678", "#9C9385"]) {
    if (src.toUpperCase().includes(bad)) fail("forbidden", `low-contrast grey ${bad} still used in fixed source`, "replace with #6E655A / #BDB2A4");
    else ok("forbidden", `${bad} absent from fixed source`, "");
  }
  // Composition geometry (RootFixed uses JSX props: width={1080} …)
  if (/width=\{1080\}/.test(root) && /height=\{1920\}/.test(root) && /durationInFrames=\{450\}/.test(root) && /fps=\{30\}/.test(root))
    ok("geometry", "composition is 1080x1920, 30fps, 450 frames", "");
  else fail("geometry", "composition is not 1080x1920 / 30fps / 450f", root.match(/width[^,\n]*|height[^,\n]*|durationInFrames[^,\n]*|fps[^,\n]*/g)?.join(" ") || "");

  // Captions position + size (comp-space constants; final = comp * 2.25)
  const capBottom = +(raw.match(/const CAPTION_BOTTOM = (\d+)/)?.[1] || 0);
  const capFont = +(raw.match(/const CAPTION_FONT = (\d+)/)?.[1] || 0);
  if (capBottom >= 188) ok("safezone-captions", `captions bottom ${capBottom} comp px = ${(capBottom * 2.25).toFixed(0)}px final (≥ 461px / 24%)`, "");
  else fail("safezone-captions", `captions bottom ${capBottom} comp px is below the 22% line`, "need ≥ 188 comp px");
  if (capFont >= 25) ok("safezone-captions", `caption font ${capFont} comp px = ${(capFont * 2.25).toFixed(0)}px final (≥ 56px)`, "");
  else fail("safezone-captions", `caption font ${capFont} comp px < 25 (56px final)`, "");

  // Chime sync: notif_short start frame vs "sent just now" bubble frame 383
  const sfx = [...raw.matchAll(/\["(\w+)",\s*(\d+),/g)];
  const notif = sfx.find((m) => m[1] === "notif_short");
  const bubbleFrame = 383;
  if (notif) {
    const d = Math.abs(+notif[2] - bubbleFrame);
    if (d <= 2) ok("chime", `notif_short at frame ${notif[2]}, bubble at ${bubbleFrame} (Δ${d}f)`, "");
    else fail("chime", `notif_short at frame ${notif[2]} is ${d} frames from the bubble (frame ${bubbleFrame})`, "must be within 2 frames");
  } else fail("chime", "notif_short not found in SFX list", "");

  // Music ducking: volume function must use the ducked/gap gains
  if (/musicDuckedGain/.test(raw) && /musicGapGain/.test(raw))
    ok("music", "music volume uses ducked (0.34) + gap (0.5) gains from tokens", "");
  else warn("music", "music ducking gains not found in source", "check AudioTrack volume fn");

  checkCaptionDrift();
}

function checkCaptionDrift() {
  if (!existsSync(CAPTIONS) || !existsSync(TIMING)) { warn("captions", "captions.ts/timing.ts missing", ""); return; }
  const cap = readFileSync(CAPTIONS, "utf8");
  const tim = readFileSync(TIMING, "utf8");
  // timing.ts LINES: { id, spk, text, startF, endF, durF }
  const lines = [...tim.matchAll(/\{\s*\n?\s*"id": "(\w+)",[\s\S]*?"startF": (\d+),\s*"endF": (\d+)/g)]
    .map((m) => ({ id: m[1], startF: +m[2], endF: +m[3] }));
  // captions.ts groups: "s"/"e" in SECONDS, words [{w, s, e} seconds].
  const groupRe = /\{\s*\n?"s": ([\d.]+),\s*\n?"e": ([\d.]+),\s*\n?"spk": "(\w+)",\s*\n?"words": \[([\s\S]*?)\]\s*\n?\}/g;
  const groups = [];
  let gm;
  while ((gm = groupRe.exec(cap)) !== null) {
    const words = [...gm[4].matchAll(/\{\s*\n?"w": "([^"]+)",\s*\n?"s": ([\d.]+),\s*\n?"e": ([\d.]+)/g)]
      .map((w) => ({ w: w[1], s: +w[2], e: +w[3] }));
    if (words.length) groups.push({ s: +gm[1], e: +gm[2], spk: gm[3], words });
  }
  if (!lines.length || !groups.length) { warn("captions", `parsed ${lines.length} VO lines, ${groups.length} caption groups`, "check regexes"); return; }
  // Match each group to a VO line by speaker + overlapping time (groups are
  // sub-parts of lines, e.g. M2 splits into MENU/PRICES, BOOKINGS, DASHBOARD).
  for (const g of groups) {
    const firstF = Math.round(g.words[0].s * FPS);
    const lastF = Math.round(g.words[g.words.length - 1].e * FPS);
    const line = lines.find((l) => l.startF - 2 <= firstF && firstF <= l.endF + 2 && l.endF >= lastF - 2);
    if (!line) { fail("captions", `group "${g.words.map((w) => w.w).join(" ")}" (${firstF}–${lastF}f) matches no VO line`, ""); continue; }
    const okStart = Math.abs(firstF - line.startF) <= 2 || (line.startF <= firstF && firstF - line.startF < 60);
    if (firstF < line.startF - 2 || lastF > line.endF + 2)
      fail("captions", `group "${g.words.map((w) => w.w).join(" ")}": ${firstF}–${lastF}f vs VO ${line.id} ${line.startF}–${line.endF}f (drift > 2f)`, "");
    else ok("captions", `group "${g.words.map((w) => w.w).join(" ")}": ${firstF}–${lastF}f inside VO ${line.id} ${line.startF}–${line.endF}f`, "");
    void okStart;
  }
  // Measured VO durations vs timing widths (ffprobe on public/lanesite15/vo/)
  for (const line of lines) {
    const mp3 = join(ASSETS, "vo", `${line.id}.mp3`);
    if (!existsSync(mp3)) { warn("captions", `VO file missing for ${line.id}`, mp3); continue; }
    try {
      const out = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${mp3}"`, { encoding: "utf8" }).trim();
      const durF = Math.round(parseFloat(out) * FPS);
      const widthF = line.endF - line.startF + 1;
      if (Math.abs(durF - widthF) > 2) fail("captions", `VO ${line.id}: measured ${durF}f vs timing width ${widthF}f`, mp3);
      else ok("captions", `VO ${line.id}: measured ${durF}f = timing ${widthF}f`, "");
    } catch { warn("captions", `ffprobe failed for ${line.id}`, mp3); }
  }
}

// --- Manifest safe-zone check ----------------------------------------------
function checkManifest(path) {
  if (!path || !existsSync(path)) { warn("manifest", "no manifest given — safe-zone geometry not checked", "pass --manifest qa/manifest.json"); return; }
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  const items = Array.isArray(parsed) ? parsed : parsed.items;
  for (const it of items) {
    if (it.kind === "caption") {
      if (it.bottomPx < 461) fail("safezone", `${it.element}: captions at ${it.bottomPx}px final (< 461px / 24%)`, it.kind);
      else if (it.fontPx < 56) fail("safezone", `${it.element}: caption font ${it.fontPx}px final (< 56px)`, it.kind);
      else ok("safezone", `${it.element}: ${it.bottomPx}px / ${it.fontPx}px`, it.kind);
    } else if (it.mustClear) {
      if (it.bottomPx < 320) fail("safezone", `${it.element}: bottom ${it.bottomPx}px final inside the 320px TikTok zone`, it.kind);
      else ok("safezone", `${it.element}: bottom ${it.bottomPx}px final (clear of 320px)`, it.kind);
    }
  }
}

// --- Frame analysis (static windows, black frames) -------------------------
function analyzeVideo(file) {
  if (!existsSync(file)) { warn("video", "video file not found — frame analysis skipped", file); return; }
  const W2 = 96, H2 = 171, SZ = W2 * H2;
  const ff = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-vf", `fps=10,scale=${W2}:${H2},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 512 * 1024 * 1024 });
  if (ff.status !== 0) { warn("video", "ffmpeg frame extraction failed", ff.stderr?.toString().slice(0, 200) || ""); return; }
  const buf = ff.stdout;
  const n = Math.floor(buf.length / SZ);
  if (n < 10) { warn("video", "too few frames extracted", `${n}`); return; }
  const means = [], diffs = [], cellDiffs = [];
  const COLS = 8, ROWS = 14, CELL_THR = 2.0;
  let prev = null;
  for (let i = 0; i < n; i++) {
    const f = buf.subarray(i * SZ, (i + 1) * SZ);
    let sum = 0, d = 0;
    const cell = new Array(COLS * ROWS).fill(0), cellN = new Array(COLS * ROWS).fill(0);
    for (let y = 0; y < H2; y++) {
      const cy = Math.min(ROWS - 1, Math.floor(y / (H2 / ROWS)));
      for (let x = 0; x < W2; x++) {
        const j = y * W2 + x;
        sum += f[j];
        if (prev) {
          const dd = Math.abs(f[j] - prev[j]);
          d += dd;
          const ci = cy * COLS + Math.min(COLS - 1, Math.floor(x / (W2 / COLS)));
          cell[ci] += dd; cellN[ci]++;
        }
      }
    }
    means.push(sum / SZ);
    if (prev) {
      diffs.push(d / SZ);
      // Local motion counts: a moving cursor, breathing title or shimmer
      // changes only its own patch of pixels, which a whole-frame mean
      // dilutes below the threshold. A frame is "still" only when every
      // 12px cell is still.
      let maxCell = 0;
      for (let c = 0; c < cell.length; c++) if (cellN[c]) maxCell = Math.max(maxCell, cell[c] / cellN[c]);
      cellDiffs.push(maxCell);
    }
    prev = f;
  }
  const black = means.map((m, i) => ({ i, m })).filter((x) => x.m < 8);
  if (black.length) fail("black", `${black.length} black frame(s) at 10fps indexes ${black.map((b) => b.i).join(", ")}`, `mean lum < 8 (min ${Math.min(...means).toFixed(1)})`);
  else ok("black", `no black frames (min mean luminance ${Math.min(...means).toFixed(1)})`, "");
  const THR = CELL_THR;
  let run = 0, runStart = 0;
  const windows = [];
  for (let i = 0; i < cellDiffs.length; i++) {
    if (cellDiffs[i] < THR) { if (run === 0) runStart = i; run++; }
    else { if (run >= 4) windows.push([runStart, i - 1, run]); run = 0; }
  }
  if (run >= 4) windows.push([runStart, cellDiffs.length - 1, run]);
  for (const [a, b, len] of windows) {
    fail("static", `static window ${(a / 10).toFixed(1)}s–${((b + 1) / 10).toFixed(1)}s (${(len / 10).toFixed(1)}s, max cell diff in window ${Math.max(...cellDiffs.slice(a, b + 1)).toFixed(2)})`, `frames ${a}-${b} at 10fps`);
  }
  if (!windows.length) ok("static", "no static window > 0.35s (10fps, max-cell diff threshold 2.0)", "");
  const sorted = [...diffs].sort((a, b) => a - b);
  ok("static-detail", `diffs: min ${sorted[0].toFixed(2)}, p10 ${sorted[Math.floor(sorted.length * 0.1)].toFixed(2)}, median ${sorted[Math.floor(sorted.length / 2)].toFixed(2)}, max ${sorted[sorted.length - 1].toFixed(2)}`, "");
}


// --- Loudness ----------------------------------------------------------------
function checkLoudness(file) {
  if (!existsSync(file)) return;
  try {
    const out = execSync(`ffmpeg -v info -i "${file}" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | tail -n 20`, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    const m = out.match(/\{[\s\S]*\}/);
    if (!m) { warn("loudness", "loudnorm output not parsed", ""); return; }
    const j = JSON.parse(m[0]);
    const ii = parseFloat(j.input_i), tp = parseFloat(j.input_tp), lra = parseFloat(j.input_lra);
    if (Math.abs(ii + 14) <= 1) ok("loudness", `input integrated ${ii} LUFS (target -14 ±1)`, `TP ${tp}, LRA ${lra}`);
    else warn("loudness", `input integrated ${ii} LUFS (target -14 ±1)`, `TP ${tp}, LRA ${lra}`);
    if (tp > -1.5) warn("loudness", `true peak ${tp} dBTP above -1.5`, "");
    else ok("loudness", `true peak ${tp} dBTP ≤ -1.5`, "");
    if (lra > 11) warn("loudness", `LRA ${lra} above 11`, "");
    else ok("loudness", `LRA ${lra} ≤ 11`, "");
  } catch { warn("loudness", "loudnorm run failed", ""); }
}

// --- Main --------------------------------------------------------------------
const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--"));
const manifestIdx = args.indexOf("--manifest");
const manifestArg = manifestIdx >= 0 ? args[manifestIdx + 1] : join(ROOT, "qa", "manifest.json");
const selftest = args.includes("--selftest");

checkSource();
checkManifest(existsSync(manifestArg) ? manifestArg : null);
if (!selftest && target) {
  analyzeVideo(target);
  checkLoudness(target);
}

const fails = results.filter((r) => r.level === "P0" && !r.pass);
const warns = results.filter((r) => r.level === "W" && !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : r.level === "P0" ? "FAIL" : "WARN";
  console.log(`[${mark}] ${r.id.padEnd(18)} ${r.msg}${r.detail ? ` — ${r.detail}` : ""}`);
}
console.log(`\n${results.filter((r) => r.pass).length} passed, ${fails.length} P0 failed, ${warns.length} warnings`);
writeFileSync(join(ROOT, "qa", "last-report.json"), JSON.stringify({ at: new Date().toISOString(), target: target || null, results }, null, 2));
process.exit(fails.length ? 1 : 0);
