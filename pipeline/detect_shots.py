import json
from scenedetect import detect, ContentDetector
SRC = '/home/hatch/workspace/user/media_library/video/c7/c7b82b463091b047e98098a4b5d28fe5b802a1448885dd73339272185c58333a.mp4'
# Pass 1: threshold 20
scene_list = detect(SRC, ContentDetector(threshold=20.0, min_scene_len=15))
print('pass1 scenes:', len(scene_list))
shots = []
for i, (s, e) in enumerate(scene_list):
    shots.append({'shot_id': f'S{i+1:03d}', 'start': round(s.get_seconds(),2), 'end': round(e.get_seconds(),2)})
# Merge <1s into previous
merged = []
for sh in shots:
    if merged and sh['end'] - sh['start'] < 1.0:
        merged[-1]['end'] = sh['end']
    else:
        merged.append(sh)
print('after merge <1s:', len(merged))
# Pass 2: split shots >12s at strongest internal content change
import cv2
cap = cv2.VideoCapture(SRC)
fps = cap.get(cv2.CAP_PROP_FPS)
def frame_at(t):
    cap.set(cv2.CAP_PROP_POS_MSEC, t*1000)
    ok, fr = cap.read()
    if not ok: return None
    return cv2.cvtColor(cv2.resize(fr, (160,90)), cv2.COLOR_BGR2GRAY)
final = []
for sh in merged:
    dur = sh['end'] - sh['start']
    if dur <= 12:
        final.append(sh); continue
    # sample every 1s inside, find biggest frame diff
    best_t, best_d = None, 0
    prev = frame_at(sh['start'] + 0.5)
    t = sh['start'] + 1.5
    while t < sh['end'] - 0.5:
        cur = frame_at(t)
        if prev is not None and cur is not None:
            d = float(cv2.absdiff(prev, cur).mean())
            if d > best_d: best_d, best_t = d, t
        prev = cur; t += 1.0
    if best_t is not None and best_d > 12:
        final.append({'shot_id': sh['shot_id'], 'start': sh['start'], 'end': round(best_t,2), 'split_from': sh['shot_id']})
        final.append({'shot_id': sh['shot_id']+'b', 'start': round(best_t,2), 'end': sh['end'], 'split_from': sh['shot_id']})
        print(f"split {sh['shot_id']} ({dur:.1f}s) at {best_t:.1f} diff {best_d:.1f}")
    else:
        final.append(sh)
cap.release()
# renumber
for i, sh in enumerate(final):
    sh['shot_id'] = f'S{i+1:03d}'
json.dump({'shots': final}, open('shots.json','w'), indent=1)
print('final shots:', len(final))
# known problem shots check: v1 S110 was ~15.6s long (find shots covering 770-790s and 1040-1080s)
for sh in final:
    if (770 <= sh['start'] <= 800) or (1040 <= sh['start'] <= 1090):
        print('check:', sh)
