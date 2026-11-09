"""Stage H (v2): Hindi voiceover — one TTS call per script line, --language hi.
Measures each file with ffprobe and writes voiceover.json {lines: [{line_id, duration, file}]}.
Retries a failed line once. Run in background; it takes several minutes.
"""
import json
import subprocess
import os
import sys
import time

WORK = os.path.dirname(os.path.abspath(__file__))
os.makedirs(f"{WORK}/vo", exist_ok=True)
script = json.load(open(f"{WORK}/script.json"))["lines"]


def probe_dur(path):
    p = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True, text=True)
    return float(p.stdout.strip())


def tts_line(lid, text):
    out = f"{WORK}/vo/{lid}.mp3"
    if os.path.exists(out):
        try:
            d = probe_dur(out)
            if d > 0:
                print(f"{lid}: exists {d:.2f}s", flush=True)
                return d
        except Exception:
            pass
    for attempt in (1, 2, 3, 4):
        p = subprocess.run(["/opt/hatch/bin/tts", "speak", "--output", out,
                            "--language", "hi", "--text-stdin"],
                           input=text, text=True, capture_output=True)
        if p.returncode == 0 and os.path.exists(out):
            try:
                d = probe_dur(out)
                print(f"{lid}: {d:.2f}s (attempt {attempt})", flush=True)
                return d
            except Exception as e:
                print(f"{lid}: probe failed {e}", flush=True)
        else:
            print(f"{lid}: tts failed attempt {attempt}: {p.stderr[-200:]}", flush=True)
        time.sleep(5 * attempt)
    print(f"{lid}: FAILED after 4 attempts — skipping, will retry later", flush=True)
    return None


results = []
failed = []
for line in script:
    d = tts_line(line["line_id"], line["text"])
    if d is None:
        failed.append(line["line_id"])
        continue
    results.append({"line_id": line["line_id"], "duration": round(d, 2),
                    "file": f"vo/{line['line_id']}.mp3", "words": line["words"]})
total = sum(r["duration"] for r in results)
words = sum(r["words"] for r in results)
json.dump({"lines": results, "total_duration": round(total, 2), "total_words": words,
           "pace_wps": round(words / total, 2) if total else 0, "failed": failed},
          open(f"{WORK}/voiceover.json", "w"), ensure_ascii=False, indent=1)
print(f"VOICEOVER DONE: {len(results)} lines, {total:.1f}s, {words} words, {words/total:.2f} wps; failed: {failed}")
