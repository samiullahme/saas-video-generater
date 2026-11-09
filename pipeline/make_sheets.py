import json
from PIL import Image
d = json.load(open('descriptions_draft.json'))['shots']
split_ids = [s['shot_id'] for s in d if s.get('split_from')]
# one representative keyframe per split shot (first)
items = []
for s in d:
    if s['shot_id'] in split_ids:
        items.append((s['shot_id'], s['keyframe_paths'][0], round(s['start'],1), round(s['end'],1)))
print('sheet items:', len(items))
# sheets of 9 (3x3), each cell 320x180 + label bar
import os
os.makedirs('sheets', exist_ok=True)
for si in range(0, len(items), 9):
    batch = items[si:si+9]
    sheet = Image.new('RGB', (960, 540+90), 'white')
    from PIL import ImageDraw
    dr = ImageDraw.Draw(sheet)
    for i, (sid, path, st, en) in enumerate(batch):
        im = Image.open(path).resize((320,180))
        x, y = (i%3)*320, (i//3)*180
        sheet.paste(im, (x, y))
        dr.text((x+4, y+164), f"{sid} {st}-{en}s", fill='yellow')
    sheet.save(f'sheets/split_{si//9+1:02d}.jpg', quality=85)
    print(f'sheets/split_{si//9+1:02d}.jpg', [b[0] for b in batch])
