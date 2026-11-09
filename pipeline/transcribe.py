"""Stage B (v2, retry): transcribe with faster-whisper 'small', cpu, int8,
language hi, beam 5 — in 6 sequential chunks (~210s each) so that a killed
run loses at most one chunk and a re-run skips finished chunks. Each chunk's
segments are appended (with time offsets) to transcript_partial.jsonl as
soon as the chunk finishes; transcript.json is assembled at the end.
"""
from faster_whisper import WhisperModel
import json
import os
import subprocess
import sys

WORK = os.path.dirname(os.path.abspath(__file__))
SRC = '/home/hatch/workspace/recapmaker/data/jobs/manual1/audio16k.wav'
PARTIAL = f"{WORK}/transcript_partial.jsonl"
OUT = f"{WORK}/transcript.json"
CHUNK = 210.0
TOTAL = 1257.9

m = WhisperModel('small', device='cpu', compute_type='int8')
print("model loaded", flush=True)

done = set()
if os.path.exists(PARTIAL):
    for line in open(PARTIAL):
        rec = json.loads(line)
        if '_chunk_done' in rec:
            done.add(rec['_chunk_done'])
    print(f"resuming: chunks already done: {sorted(done)}", flush=True)

n_chunks = int(TOTAL // CHUNK) + 1
all_segs = []
for c in range(n_chunks):
    if c in done:
        continue
    start = c * CHUNK
    dur = min(CHUNK, TOTAL - start)
    chunk_wav = f"/tmp/tr_chunk{c}.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(start), "-t", str(dur),
                    "-i", SRC, chunk_wav], check=True)
    segs, info = m.transcribe(chunk_wav, language='hi', beam_size=5)
    recs = []
    for s in segs:
        recs.append({'start': round(start + s.start, 2),
                     'end': round(start + s.end, 2),
                     'text': s.text.strip(), '_chunk': c})
    with open(PARTIAL, 'a') as pf:
        for r in recs:
            pf.write(json.dumps(r, ensure_ascii=False) + "\n")
        pf.write(json.dumps({'_chunk_done': c}) + "\n")
    print(f"chunk {c} ({start:.0f}-{start+dur:.0f}s): {len(recs)} segs, "
          f"lang={info.language} p={info.language_probability:.2f}", flush=True)
    os.remove(chunk_wav)

for line in open(PARTIAL):
    r = json.loads(line)
    if '_chunk_done' in r:
        continue
    r.pop('_chunk', None)
    all_segs.append(r)
all_segs.sort(key=lambda r: r['start'])
json.dump({'language': 'hi', 'segments': all_segs},
          open(OUT, 'w'), ensure_ascii=False, indent=1)
print(f"DONE segments: {len(all_segs)}", flush=True)
