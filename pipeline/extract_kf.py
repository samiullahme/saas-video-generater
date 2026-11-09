import json, subprocess, os
SRC = '/home/hatch/workspace/user/media_library/video/c7/c7b82b463091b047e98098a4b5d28fe5b802a1448885dd73339272185c58333a.mp4'
shots = json.load(open('shots.json'))['shots']
os.makedirs('keyframes', exist_ok=True)
for sh in shots:
    dur = sh['end'] - sh['start']
    times = []
    if dur <= 6:
        times = [(sh['start'] + sh['end']) / 2]
    else:
        t = sh['start'] + 0.5
        while t < sh['end'] - 0.3:
            times.append(round(t, 2)); t += 3.0
    paths = []
    for i, t in enumerate(times):
        p = f"keyframes/{sh['shot_id']}_{i}.jpg"
        subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',SRC,'-frames:v','1','-vf','scale=640:-1',p], check=True)
        paths.append(p)
    sh['keyframe_paths'] = paths
    sh['keyframe_times'] = times
json.dump({'shots': shots}, open('shots.json','w'), indent=1)
print('shots:', len(shots), 'keyframes:', sum(len(s['keyframe_paths']) for s in shots))
