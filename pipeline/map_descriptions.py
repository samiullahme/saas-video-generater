import json
v1 = json.load(open('/home/hatch/workspace/recapmaker/data/jobs/manual1/descriptions.json'))
v1s = v1.get('shots', v1) if isinstance(v1, dict) else v1
v2 = json.load(open('shots.json'))['shots']
def v1_at(t):
    for s in v1s:
        if s['start'] <= t < s['end']:
            return s
    return None
mapped = []
needs_fresh = []
for sh in v2:
    mid = (sh['start'] + sh['end']) / 2
    src = v1_at(mid)
    if src is None:
        needs_fresh.append(sh['shot_id']); mapped.append({**sh, 'action': '', 'characters': [], 'location': '', 'objects_or_animals': [], 'mood': '', 'importance': 0, '_source': None})
        continue
    mapped.append({**sh,
        'action': src.get('action',''), 'characters': list(src.get('characters',[])),
        'location': src.get('location',''), 'objects_or_animals': list(src.get('objects_or_animals',[])),
        'mood': src.get('mood',''), 'importance': src.get('importance',3),
        'transcript': src.get('transcript',''), '_source': src.get('shot_id')})
    if src.get('shot_id') and (sh.get('split_from') or abs((sh['end']-sh['start']) - (src['end']-src['start'])) > 3):
        needs_fresh.append(sh['shot_id'])
json.dump({'shots': mapped}, open('descriptions_draft.json','w'), ensure_ascii=False, indent=1)
print('mapped:', len(mapped), '| needs fresh review:', len(needs_fresh))
print('needs_fresh:', needs_fresh[:60])
