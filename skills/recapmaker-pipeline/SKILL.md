# RecapMaker pipeline — video clip to narrated recap video

Turn a video clip into a narrated recap video: transcribe it, detect shots,
describe them, identify the film and people, write a narration script in the
video's own language, voice it line by line, and render picture-matched
segments with burned-in subtitles. Proven on a 21-minute Hindi film clip
(Karan Arjun, 1995) → 5:45 Hindi recap, 65 lines, 234 shots.

## Before you start

- Confirm the user owns the video or has permission to use it.
- Note the video language and the target recap length. Narration language
  **must match the video language** — never narrate a Hindi video in English.
- Work in a job folder (`jobs/<name>/`) with stage outputs saved as JSON at
  every step, so a failed job resumes from the failed stage.
- The voice step in the reference scripts calls a sandbox-only TTS binary —
  replace that one call with the machine's TTS provider and keep the
  per-line files and ffprobe measurement (see Voice).

## Transcribe with the small model, in chunks

- Use faster-whisper **"small"**, forced language, beam 5. Never "tiny" for
  a Hindi clip — tiny garbles names and dialogue and hallucinates on songs.
- Extract audio once: `ffmpeg -i source.mp4 -vn -ar 16000 -ac 1 audio16k.wav`.
- Run transcription in ~210 s chunks with resume markers and assemble
  `transcript.json` (segments with start/end seconds).
- Pin **`av==13.1.0`** in requirements: faster-whisper 1.2.1 passes
  `metadata_errors` to `av.open`, which av ≥ 14 removed, and av 11 has no
  Python 3.12 wheel.

## Detect shots at threshold 20, then split long shots

- PySceneDetect ContentDetector **threshold 20.0, min_scene_len 15**.
  Threshold 27 misses cuts in dark and black-and-white scenes.
- Second pass: split any shot longer than 12 s at its strongest internal
  frame change (OpenCV, 160×90 grayscale, mean absdiff > 12, sampled
  every 1 s). Merge shots shorter than 1 s into a neighbour.
- Extract one keyframe per keyframe point at source width (no upscale) and
  build contact sheets for the description step.

## Describe every shot, then identify the film and people first

- Describe all shots from the keyframes: characters (consistent names),
  action, location, objects/animals, mood, importance 1–5. Mark filler
  skippable. Do the describing from the pictures, with clothes-based labels
  only as a temporary stand-in — then rename every label to a person code
  and finally to a real name via the character bible.
- **Identify the film and the people before writing the script.** Face
  close-ups plus frames at fixed times, cross-checked against names heard
  in the dialogue and the film's known story. Record a confidence per
  person (high / medium / low) with the evidence.
- Never name a character by their clothes ("Man in Green Shirt"). A random
  unnamed person is "a man" / "a person".
- Understand the story's emotional catch first — hero, villain, heroine —
  before any line is written. In the reference run it was a mother waiting
  20 years for her murdered sons.

## Write the script from the outline and the shots only

- Outline first: premise, main characters, 4–6 key events with shot_ids,
  turning point, ending hook.
- Script: one flowing sentence per shot, present tense, conversational
  tone. Only real shot_ids. Narrate only what the shots and transcript
  show — never invent plot details. Prefer importance 4–5, skip filler.
- Dialogue is paraphrased ("kehta hai ki…"), never quoted at length.
  Hard cuts with "Phir / Tabhi / Agle scene mein…". End on a next-part
  teaser.
- **Size the script from a measured speaking pace, not the textbook 2.3
  words/sec.** The reference Hindi voice spoke at 3.24 words/sec, which
  turned a planned 7:00 recap into 5:45. Re-measure after the first 5
  voiced lines and resize if the pace differs.

## Verify every line against its shots

- Check each script line against its shot_ids' descriptions. Flag
  unsupported claims and rewrite them; add shots where a line would freeze
  on one frame. Save the result as `verification.json` with the rewrites
  listed. Re-voice and re-render changed lines only, then re-check frames
  from the rendered video (at least 4 times across the recap).

## Voice one line at a time and measure each file

- One TTS call per line, in the video's language. Retry up to 4 times with
  backoff on failure. Measure every file with ffprobe and write
  `voiceover.json` with each line's duration. Skip files that already
  exist and measure valid.
- If a line's voice file fails repeatedly, say so — never ship a silent
  line or a line voiced in the wrong language.

## Render picture-matched segments, never borrow the next scene

- Per line, build a segment from **only its shot_ids**, length equal to the
  measured voice duration. Split the needed time proportionally across
  all its shots so every referenced shot appears.
- If the shots are shorter than the narration, slow uniformly with
  `setpts`, capped at **0.85x** (factor ≤ ~1.176). If still short, freeze
  the last frame (`tpad=stop_mode=clone`). **Never borrow the next scene's
  shots** — that plays the wrong picture under the narration.
- Mix: original audio `volume=0.15`, narration `volume=1.5` (≈ +3.5 dB),
  `amix … normalize=0`. `amix` defaults to dividing by the input count,
  which buries the narration ~9 dB — always set `normalize=0`.
- Concatenate the segments, generate the `.srt` from the measured segment
  start/end times, and burn in subtitles with the `subtitles` filter in a
  font that renders the script (Noto Sans Devanagari, 22 pt, white, black
  outline 2, bottom-centre, MarginV 18). Verify the font on a test frame
  **before** the full render — a Roman-script first pass has to be
  re-rendered.
- Export H.264 + AAC at source resolution (upscaling adds no detail).
  Check the finished file with ffprobe and frame grabs before handover.

## Checks before you call it done

- Frame grabs from the rendered video at several times: picture matches
  narration, subtitles legible.
- Voice present in every line's window; no line silent, no line in the
  wrong language; no clipping (max below 0 dB).
- No invented names, dates, numbers or claims anywhere in the script or
  the frames; every name's confidence is on record in the bible.
- Report the honest numbers: final length vs target, pace measured,
  freezes remaining, names confirmed by dialogue vs by film knowledge.
