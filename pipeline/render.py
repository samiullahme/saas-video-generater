"""Stage I (v2): render the recap with ffmpeg.

For each narration line, build a video segment from ONLY its shot_ids whose
total length equals that line's measured TTS duration:
- the needed time is split PROPORTIONALLY across the line's shots (so every
  referenced shot appears on screen);
- if the shots are shorter than the narration, slow the footage uniformly,
  at most to 0.85x; if STILL short, FREEZE the last frame (tpad clone) —
  NEVER borrow shots from the next scene (that was v1's misplaced-frames bug).
- original audio at 15% volume under the narration; amix normalize=0 +
  narration +3.5dB (v1's fix: amix defaults to dividing by input count).
Then concatenate all segments, burn in Devanagari subtitles (Noto Sans
Devanagari, verified to render Hindi correctly), export 640x360 H.264 + AAC.
"""
import json
import subprocess
import os

WORK = os.path.dirname(os.path.abspath(__file__))
SRC = "/home/hatch/workspace/user/media_library/video/c7/c7b82b463091b047e98098a4b5d28fe5b802a1448885dd73339272185c58333a.mp4"

script = json.load(open(f"{WORK}/script.json"))
vo = {l["line_id"]: l["duration"] for l in json.load(open(f"{WORK}/voiceover.json"))["lines"]}
shots = json.load(open(f"{WORK}/shots.json"))["shots"]
smap = {s["shot_id"]: s for s in shots}

ONLY = os.environ.get("SEGMENTS_ONLY")
ONLY_IDX = {int(x) for x in ONLY.split(",")} if ONLY else None

os.makedirs(f"{WORK}/segments", exist_ok=True)


def build_segment(line, idx):
    lid = line["line_id"]
    need = vo[lid]
    sids = list(line["shot_ids"])
    clips = [(smap[s]["start"], smap[s]["end"]) for s in sids]
    total = sum(e - s for s, e in clips)
    f = 1.0
    if total < need:
        f = min(need / total, 1 / 0.85)
    slowed = total * f
    freeze = max(0.0, need - slowed)
    # proportional allocation of the TARGET duration across clips: when the
    # shots are longer than the narration we trim proportionally to `need`;
    # when shorter we use all of them slowed, then freeze to reach `need`.
    target = min(need, slowed)
    alloc = []
    for (s, e) in clips:
        dur = e - s
        alloc.append((s, target * dur / total))
    drift = target - sum(a for _, a in alloc)
    alloc[-1] = (alloc[-1][0], alloc[-1][1] + drift)

    vfilters, afilters = [], []
    for i, ((s, _), (_, a)) in enumerate(zip(clips, alloc)):
        src_dur = a / f
        vfilters.append(
            f"[0:v]trim=start={s:.2f}:end={s + src_dur:.2f},"
            f"setpts=(PTS-STARTPTS)*{f:.4f},scale=640:360,fps=25[v{i}]"
        )
        afilters.append(
            f"[0:a]atrim=start={s:.2f}:end={s + src_dur:.2f},"
            f"asetpts=PTS-STARTPTS,atempo={1 / f:.4f},volume=0.15,"
            f"aresample=48000[a{i}]"
        )
    n = len(clips)
    vcat = "".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[vcat]"
    acat = "".join(f"[a{i}]" for i in range(n)) + f"concat=n={n}:v=0:a=1[amix0]"
    parts = vfilters + afilters + [vcat, acat]
    vout = "[vcat]"
    if freeze > 0.05:
        parts.append(f"[vcat]tpad=stop_mode=clone:stop_duration={freeze:.2f}[vout]")
        vout = "[vout]"
    parts += [
        "[amix0]apad,atrim=0:{:.2f}[a0p]".format(need),
        "[1:a]aresample=48000,volume=1.5,apad,atrim=0:{:.2f}[a1p]".format(need),
        "[a0p][a1p]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[aout]",
    ]
    fc = ";".join(parts)
    out = f"{WORK}/segments/seg_{idx:02d}_{lid}.mp4"
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", SRC, "-i", f"{WORK}/vo/{lid}.mp3",
           "-filter_complex", fc,
           "-map", vout, "-map", "[aout]",
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
           "-c:a", "aac", "-b:a", "128k", "-video_track_timescale", "25", out]
    subprocess.run(cmd, check=True)
    p = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", out], capture_output=True, text=True)
    got = float(p.stdout.strip())
    print(f"{lid}: need {need:.2f}s, shots {len(clips)}, slow x{f:.3f}, freeze {freeze:.2f}s -> {got:.2f}s", flush=True)
    return out, got


def probe_dur(path):
    p = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True, text=True)
    return float(p.stdout.strip())


seg_files = []
starts = []
t = 0.0
for i, line in enumerate(script["lines"], 1):
    out = f"{WORK}/segments/seg_{i:02d}_{line['line_id']}.mp4"
    if ONLY_IDX is None or i in ONLY_IDX:
        out, got = build_segment(line, i)
    else:
        got = probe_dur(out)
    seg_files.append(out)
    starts.append((t, t + got, line["text"]))
    t += got

with open(f"{WORK}/segments/concat.txt", "w") as f:
    for p in seg_files:
        f.write(f"file '{p}'\n")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0",
                "-i", f"{WORK}/segments/concat.txt", "-c", "copy",
                f"{WORK}/recap_nosub.mp4"], check=True)


def srt_time(sec):
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


with open(f"{WORK}/recap.srt", "w") as f:
    for i, (a, b, text) in enumerate(starts, 1):
        f.write(f"{i}\n{srt_time(a)} --> {srt_time(b)}\n{text}\n\n")

style = ("FontName=Noto Sans Devanagari,FontSize=22,PrimaryColour=&HFFFFFF,"
         "OutlineColour=&H000000,BorderStyle=1,Outline=2,Alignment=2,MarginV=18")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{WORK}/recap_nosub.mp4",
                "-vf", f"subtitles={WORK}/recap.srt:force_style='{style}'",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                "-c:a", "copy", "-movflags", "+faststart",
                f"{WORK}/recap.mp4"], check=True)
print(f"DONE: recap.mp4 total {t:.1f}s from {len(seg_files)} segments")
