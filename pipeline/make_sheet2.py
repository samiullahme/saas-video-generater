import json
from PIL import Image, ImageDraw
d = json.load(open('descriptions_draft.json'))['shots']
want = ['S001','S015','S017','S018','S110','S192','S193','S194','S195','S199','S200','S215']
items = [(s['shot_id'], s['keyframe_paths'][0], round(s['start'],1), round(s['end'],1)) for s in d if s['shot_id'] in want]
print('items:', len(items), [i[0] for i in items])
for si in range(0, len(items), 9):
    batch = items[si:si+9]
    sheet = Image.new('RGB', (960, 540+90), 'white')
    dr = ImageDraw.Draw(sheet)
    for i, (sid, path, st, en) in enumerate(batch):
        im = Image.open(path).resize((320,180))
        x, y = (i%3)*320, (i//3)*180
        sheet.paste(im, (x, y))
        dr.text((x+4, y+164), f"{sid} {st}-{en}s", fill='yellow')
    sheet.save(f'sheets/flag_{si//9+1:02d}.jpg', quality=85)
    print(f'sheets/flag_{si//9+1:02d}.jpg')
