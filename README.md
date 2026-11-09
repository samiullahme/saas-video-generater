# RecapMaker v2 — Hindi film-clip recap pipeline

A reproducible, script-by-script record of the manual test run that turned a
21-minute Hindi film clip into a **5 min 45 s narrated Hindi recap video**.

- **Source:** 21-minute Hindi clip from the film **Karan Arjun (1995)** —
  village confrontation, palace, night camp, chase/fights, B&W flashback.
- **Result:** `recap.mp4` — 344.96 s (5:45), 640×360, H.264 + AAC,
  65 narration lines / 1,124 words, Hindi voiceover, Devanagari subtitles
  burned in, original audio at 15% under the narration.
- **Style:** Movie Gyaan-style recap — greeting + backstory hook, one short
  present-tense sentence per shot, characters named properly, dialogue
  paraphrased ("kehta hai ki…"), hard cuts, ends on a "next part" teaser.

This repo is the **v2 build**. The earlier v1 (English summary narration,
38 lines) was judged weak and deleted — do not rebuild it.

## What is NOT in this repo (read first)

- **The source clip** (`source.mp4`, 70 MB) and **the finished `recap.mp4`**
  (23 MB) are not committed. The video is film footage under copyright; it
  was a private test, not a redistribution. Run the pipeline below on your
  own clip and the finished video is reproduced exactly.
- **No keyframes, voice clips, or per-line segments** — they are
  intermediates. The stage JSONs in `outputs/` are the durable record.

## Requirements

| Need | Version used in the test |
| --- | --- |
| Linux (tested on Ubuntu; any VPS or local machine) | 4 cores, ~8 GB RAM |
| ffmpeg + ffprobe | 8.1.2 (any recent 6+ works) |
| Python | 3.12 |
| Font for subtitles | **Noto Sans Devanagari** (must be installed or Devanagari renders as boxes) |
| Disk | ~2 GB free for one job (audio, keyframes, segments) |

No API keys are needed for the pipeline as written, except the voice step
(see below). No login, no payments, no public deploy.

## Install

```bash
# 1. ffmpeg + the Devanagari font (Ubuntu/Debian)
sudo apt update && sudo apt install -y ffmpeg fonts-noto-core fonts-noto-ui-core

# 2. Python environment (system pip is externally managed on some boxes — use a venv)
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

`requirements.txt` pins **`av==13.1.0`** — do not "upgrade" it.
faster-whisper 1.2.1 passes `metadata_errors` to `av.open`, which av ≥ 14
removed, and av 11 has no Python 3.12 wheel. 13.1.0 is the working pin
(verified 2026-11-08).

## Inputs

Put your clip at `input/source.mp4` (any length; the test used 21 min) and
note its language. You must own the video or have permission to use it.

The pipeline scripts in `pipeline/` are the **exact scripts from the test
run** — they contain the original absolute paths. Before running, set the
paths at the top of each script:

- `SRC` — your `input/source.mp4` (render.py) / extracted audio (transcribe.py)
- `WORK` — your job folder, e.g. `jobs/<job-name>/`

## Run it — stage by stage

```bash
# 0. Extract audio once (transcribe.py reads this file)
ffmpeg -y -i input/source.mp4 -vn -ar 16000 -ac 1 jobs/v2/audio16k.wav

# 1. Transcribe — faster-whisper "small", forced language, beam 5
#    Run in ~210 s chunks with resume; assembles transcript.json.
#    (The test ran 6 chunks; small model, NOT tiny — v1 used tiny and its
#    Hindi names/dialogue were garbled.)
python3 pipeline/transcribe.py
#    -> outputs/transcript.json  (366 segments in the test)

# 2. Detect shots — PySceneDetect ContentDetector threshold 20.0,
#    min_scene_len 15, then a second pass that splits any shot > 12 s at its
#    strongest internal frame change (OpenCV, 160x90 gray, mean absdiff > 12).
#    Threshold 27 (v1) missed cuts in dark/B&W scenes; 20 + split caught them.
python3 pipeline/detect_shots.py
#    -> outputs/shots.json  (234 shots in the test; v1 had 197)

# 3. Keyframes — one JPEG per keyframe at source width (640 px in the test,
#    no upscale) + contact sheets for describing.
python3 pipeline/extract_kf.py
python3 pipeline/make_sheets.py

# 4. Describe shots — read the keyframes yourself (or a vision model),
#    one entry per shot: characters (consistent names), action, location,
#    objects/animals, mood, importance 1-5. Mark filler skippable.
#    In the test this was done by hand from the contact sheets, then
#    apply_corrections.py renamed every clothes-based label
#    ("Green-Shirt Man" -> a person code -> real name via the bible).
#    -> outputs/descriptions.json  (234 described; 105 skippable in the test)

# 5. Identify the film and people FIRST — before writing the script.
#    Face close-ups + frames at fixed times, cross-checked against the
#    dialogue names and the film's known story. Record confidence per person
#    in the character bible. Never name a character by their clothes
#    ("Man in Green Shirt"); a random unnamed person is "a man" / "a person".
#    -> outputs/character_bible.json  (20 people in the test)

# 6. Story outline + script — outline (premise, characters, key events with
#    shot_ids, turning point, ending hook), then one flowing sentence per
#    shot, present tense, narration language = video language, sized to the
#    measured TTS pace (see "Pace" below). Only real shot_ids, only what the
#    shots/transcript show, never invent plot details.
#    -> outputs/outline.json, outputs/script.json  (65 lines / 1,124 words)

# 7. Verification — check every line against its shot_ids' descriptions.
#    Rewrite unsupported lines, add shots where a line would freeze on one
#    frame. Save the result; re-voice and re-render changed lines only.
#    -> outputs/verification.json  (4 rewrites in the test: L33, L09, L14, L55)

# 8. Voiceover — ONE TTS call per line, then measure each file with ffprobe.
#    The test used a sandbox-only TTS binary (see "Voice" below) — replace
#    that one call with your provider, keeping the per-line files and the
#    ffprobe measurement. Retry up to 4x with backoff on failure.
#    -> outputs/voiceover.json  (65/65 lines, 344.03 s in the test)

# 9. Render — per line, build a segment from ONLY its shot_ids, length =
#    the measured voice duration (see "Render math"). Concatenate, burn in
#    Devanagari subtitles from recap.srt, export H.264 + AAC.
python3 pipeline/render.py
#    -> recap.mp4 (5:45, 640x360)
```

## Voice (the one machine-specific step)

`pipeline/voiceover.py` calls `/opt/hatch/bin/tts speak --language hi
--text-stdin`. That binary exists only on the machine the test ran on.
**On any other machine, replace that single call** with your TTS provider
(Edge TTS, Piper, ElevenLabs, OpenAI TTS, …) and keep everything else:
one file per line (`vo/L01.mp3` …), each measured with ffprobe, durations
written to `voiceover.json`. The render step only reads those files and
durations — it does not care which provider made them.

## Pace — plan for the measured number, not the textbook one

The script was sized for ~2.3 words/sec. The Hindi voice actually spoke at
**3.24 words/sec**, so 1,124 words became 344 s of voice, not the planned
~420 s. That is the real reason the target 7:00 recap came out 5:45.
**Size every future script from a measured pace for that voice and
language, and re-measure after the first 5 lines.**

## Render math (the part v1 got wrong)

- Per line, split the needed time **proportionally across all its shots**
  so every referenced shot appears.
- If the shots are shorter than the narration, slow uniformly with `setpts`,
  **capped at 0.85x** (factor ≤ ~1.176). If still short, **freeze the last
  frame** (`tpad=stop_mode=clone`).
- **Never borrow the next scene's shots** — v1 did that and the narration
  played over the wrong picture. That was v1's biggest defect.
- Mix: original audio `volume=0.15`, narration `volume=1.5` (≈ +3.5 dB),
  `amix … normalize=0`. (`amix` defaults to dividing by the input count —
  v1's narration was buried ~9 dB until this was fixed.)
- Subtitles: `subtitles` filter, Noto Sans Devanagari, 22 pt, white with
  black outline 2, bottom-centre, MarginV 18. Verify the font renders
  Devanagari on a test frame **before** the full render — the first v2 pass
  burned Roman-script subtitles and had to be re-rendered.

## Genre rules (from the Movie Gyaan example)

1. Narration language **must match the video language** (Hindi video →
   Hindi narration, never English).
2. Name characters properly: hero, villain, heroine — understand the
   story's emotional catch (here: a mother waiting 20 years for her
   murdered sons). Never name by clothes. Random person = "a man".
3. Frames must match the voiceover **exactly** — each line over shots
   showing that exact beat, no misplaced shots.
4. Judge valuable vs skippable — compress filler, keep story-carrying
   beats. (105 of 234 shots were skipped in the test.)
5. One short sentence per shot, present tense, "hum dekhte hain";
   dialogue paraphrased, never quoted at length; hard cuts with
   "Phir / Tabhi / Agle scene mein…"; end on a next-part teaser.

## File map

```
README.md                  this file
requirements.txt           faster-whisper, av==13.1.0 (pinned, see Install),
                           scenedetect[opencv-headless]
pipeline/
  transcribe.py            faster-whisper "small", chunked with resume
  detect_shots.py          threshold 20.0 + >12 s split pass
  extract_kf.py            keyframes at source width
  make_sheets.py           contact sheets for describing
  map_descriptions.py      description bookkeeping
  apply_corrections.py     clothes-label -> person code -> real name
  build_script.py          outline -> 65-line script
  transliterate.py         Roman draft -> Devanagari
  voiceover.py             per-line TTS + ffprobe (replace the TTS call)
  render.py                per-line segments, mix, subtitles, export
outputs/                   the durable record of the test run
  transcript.json          366 segments (faster-whisper small, hi)
  shots.json               234 shots
  descriptions.json        234 described, importance 1-5
  character_bible.json     20 people with confidence + evidence
  outline.json             premise / characters / key events / hook
  script.json              65 lines with shot_ids
  verification.json        structural checks + 4 rewrites, frame checks
  voiceover.json           65 lines, 344.03 s, 3.24 wps, failed: []
  recap.srt                65 entries, Devanagari subtitles
skills/recapmaker-pipeline/SKILL.md
                           the same pipeline as a reusable agent skill
```

## Known limits of this build

- 5:45, not the 7:00 target (pace — see above).
- A few short freezes remain where one shot had to cover a long line
  (L04 6.50 s, L25 5.01 s, L26 4.00 s).
- Names Bindiya / Ajay / Vijay are confirmed by the film's story, not by
  dialogue in the clip. Sonia **is** confirmed in dialogue (spoken 3× near
  the end, 1227–1232 s). "Rana" was a Whisper mishearing — no such character.
- The B&W flashback is identified as the murder/funeral from the line
  "Karan Arjun ki shmashan yatra" (927 s).
