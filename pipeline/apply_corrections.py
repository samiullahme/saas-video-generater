import json
d = json.load(open('descriptions_draft.json'))['shots']
by_id = {s['shot_id']: s for s in d}

RENAME = {
 'Green-Shirt Man': 'PA', 'Vest Man': 'PB', 'Man in Vest': 'PB',
 'Man in Black Jacket': 'PB', 'Man in Orange Shirt': 'PA', 'Man in Tan Shirt': 'PA',
 'Man in Maroon Shirt': 'PA', 'Man in Brown Shirt': 'PA', 'Man in Yellow Shirt': 'PA',
 'Slicked-Hair Mustache Man': 'PL', 'Yellow-Turban Man': 'PE', 'White-Turban Elder': 'PR',
 'Woman in White Sari': 'PG', 'Woman with Garlands': 'PG', 'Young Woman in Red': 'PH',
 'Woman in Red Sari': 'PH', 'Woman in Blue Sari': 'PI', 'Woman in Green Sari': 'PJ',
 'Pink-Sari Woman': 'PK', 'Woman with Jewelry': 'PH', 'Woman in Purple Sari': 'PW',
 'Woman in Purple Headscarf': 'PW', 'Man in Patterned Kurta': 'PF',
 'Man in Striped Blanket': 'PF', 'Beret Man': 'PN', 'Man in Red Beret': 'PN',
 'Check-Jacket Man': 'PM', 'Man in Light Suit': 'PM', 'Man in Dark Suit': 'PM',
 'Man in Suit': 'PM', 'Man in Tan Suit': 'PM', 'Man in Hat': 'PO',
 'Man in Bowler Hat': 'P_BOWLER', 'Man in Striped Shirt': 'PP', 'Whipped Boy': 'PQ',
 'Watching Boy': 'PQ', 'Boys': 'PS', 'Man (superimposed)': 'PB',
 'Man (unidentified)': 'ek aadmi', 'villagers': 'gaaon wale', 'two men': 'do aadmi',
 'fighting men': 'ladte hue aadmi', 'men': 'kuch aadmi', 'police': 'police',
 'horseman': 'ghudsawar', 'two horsemen': 'do ghudsawar', 'two dragged men': 'do aadmi',
 'Two Lookout Men': 'do aadmi', 'men at the crates': 'kuch aadmi',
 'figures on the hill': 'kuch aadmi', 'camp people': 'kuch aadmi',
 'men in the courtyard': 'kuch aadmi', 'two armed men': 'do hathiyarbund aadmi',
 'man jumping from jeep': 'ek aadmi', 'falling man': 'ek aadmi',
 'two running men': 'do aadmi', 'figures on the bridge': 'kuch aadmi',
 'Man in Pink-Orange Turban': 'ek aadmi', 'Man in Orange Turban': 'ek aadmi',
 'Man in Light Blue Turban': 'ek aadmi', 'Man in Red Turban': 'ek aadmi',
 'village women': 'gaaon ki auratein', 'Man with Green-Tinted Beard': 'ek aadmi',
 'three young men': 'teen naujawan',
}
# Green-Shirt Man in Purple is ambiguous (v1 used it for the purple-shirt man) -> PC
RENAME['Green-Shirt Man in Purple'] = 'PC'

for s in d:
    s['characters'] = [RENAME.get(c, c) for c in s.get('characters', [])]
    s.pop('_source', None)

# Overrides for the 68 visually reviewed shots: (action, characters, location, mood, importance, valuable/skippable + why)
OV = {
 'S001': ("Ultra production logo on a black screen.", [], "Black screen", "neutral", 1, "skippable — logo only"),
 'S002': ("Close-up of Durjan in a riding jacket on the palace lawn, the pink-sari woman seated beside him.", ["PD","PK"], "Palace lawn", "tense", 4, "valuable — villain introduced"),
 'S003': ("Wide palace lawn: Durjan stands centre, the pink-sari woman sits, two men stand behind.", ["PD","PK"], "Palace lawn", "tense", 4, "valuable — sets the palace confrontation"),
 'S004': ("The two young men face the elder, who gestures at them angrily on the lawn.", ["PA","PB","PE"], "Palace lawn", "tense", 5, "valuable — heroes face the elder"),
 'S005': ("Same confrontation, closer on the two young men and the elder.", ["PA","PB","PE"], "Palace lawn", "tense", 4, "valuable — heroes' defiance"),
 'S006': ("Durjan and the suited man stand before the palace, talking.", ["PD","PM"], "Palace", "tense", 3, "valuable — villain and his partner"),
 'S007': ("Close on the suited man and Durjan as they talk.", ["PM","PD"], "Palace", "tense", 3, "valuable — villain's plan"),
 'S009': ("The two young men and the elder stand on the lawn again, the argument continuing.", ["PA","PB","PE"], "Palace lawn", "tense", 4, "valuable — confrontation continues"),
 'S010': ("Same trio, a brief beat.", ["PA","PB","PE"], "Palace lawn", "tense", 2, "skippable — repeat of S009"),
 'S015': ("Village crowd gathers; the elder and the beret man stand among them.", ["PE","PN","gaaon wale"], "Village square", "tense", 2, "skippable — crowd reaction"),
 'S017': ("Close-up of the first young man, blood on his face, in profile before the crowd.", ["PA"], "Village square", "tense", 3, "valuable — hero bloodied but standing"),
 'S018': ("The first young man faces the crowd, blood on his cheek.", ["PA","gaaon wale"], "Village square", "tense", 3, "valuable — hero stands his ground"),
 'S023': ("Village crowd; the elder stands in the middle, a pink-turban man beside him.", ["PE","ek aadmi","gaaon wale"], "Village square", "tense", 3, "valuable — village watches"),
 'S024': ("Wide village square, crowd gathered.", ["gaaon wale"], "Village square", "tense", 2, "skippable — establishing crowd"),
 'S032': ("Close-up of the elder, alarmed, a mustached man behind him.", ["PE","ek aadmi"], "Village square", "alarmed", 3, "valuable — elder panics"),
 'S033': ("The elder talks urgently with the mustached man.", ["PE","ek aadmi"], "Village square", "tense", 3, "valuable — elder pleads"),
 'S034': ("The elder outside a house, hand to his face, distressed.", ["PE"], "Outside village house", "distressed", 3, "valuable — elder's fear"),
 'S035': ("The elder collapses onto a charpai outside the house, dazed.", ["PE"], "Outside village house", "comic-distress", 4, "valuable — comic collapse beat"),
 'S044': ("The elder looks around outside the house.", ["PE"], "Outside village house", "nervous", 2, "skippable — filler reaction"),
 'S045': ("The elder talks with the shawl man outside the house.", ["PE","PF"], "Outside village house", "tense", 3, "valuable — elder and householder talk"),
 'S046': ("The elder and the shawl man stand outside the house with green and pink windows.", ["PE","PF"], "Outside village house", "tense", 3, "valuable — the plea builds"),
 'S047': ("Same two men, wider shot.", ["PE","PF"], "Outside village house", "tense", 2, "skippable — repeat of S046"),
 'S048': ("On the veranda, the shawl man and his wife sit while the elder stands pleading.", ["PF","PJ","PE"], "Veranda of large house", "tense", 4, "valuable — the plea to the householders"),
 'S049': ("The plea continues, closer on the seated couple.", ["PF","PJ","PE"], "Veranda", "tense", 3, "valuable — householders listen"),
 'S050': ("The elder gestures as he pleads; the couple watches.", ["PE","PF","PJ"], "Veranda", "tense", 3, "valuable — elder begs"),
 'S051': ("A young man in a vest stands alone on a terrace, looking out.", ["PB"], "Terrace", "quiet", 3, "valuable — hero alone, thinking"),
 'S068': ("The elder talks with the young man in the vest outdoors.", ["PE","PB"], "Outdoors", "tense", 3, "valuable — elder warns the hero"),
 'S069': ("The elder gestures while the young man listens.", ["PE","PB"], "Outdoors", "tense", 3, "valuable — warning continues"),
 'S079': ("The shawl man, the elder and a young man stand together talking.", ["PF","PE","PA"], "Outdoors", "tense", 3, "valuable — three men confer"),
 'S080': ("Close-up of the three men.", ["PF","PE","PA"], "Outdoors", "tense", 2, "skippable — repeat of S079"),
 'S085': ("Durga in a white sari, back to camera, speaks with the elder.", ["PG","PE"], "Outside house", "grave", 3, "valuable — mother and elder"),
 'S086': ("The elder talks with Durga, gesturing.", ["PE","PG"], "Outside house", "grave", 4, "valuable — elder tells the mother"),
 'S091': ("Close-up of Durga in a white sari; the young woman in red stands behind her.", ["PG","PH"], "Outside house", "grave", 4, "valuable — mother and heroine"),
 'S092': ("The two women stand together, listening gravely.", ["PG","PH"], "Outside house", "grave", 3, "valuable — mother listens"),
 'S110': ("A man in a tan suit and tie stands before a gate, a truck behind him.", ["PM"], "Gate", "tense", 3, "valuable — suited man arrives"),
 'S115': ("Courtyard with parked jeeps and armed men standing around.", ["kuch aadmi"], "Courtyard", "tense", 3, "valuable — villain's men gather"),
 'S116': ("Same courtyard, men by the jeeps.", ["kuch aadmi"], "Courtyard", "tense", 2, "skippable — repeat of S115"),
 'S119': ("The first young man in a mustard shirt stands on a terrace; the purple-shirt man walks in.", ["PA","PC"], "Terrace", "tense", 3, "valuable — villain's man confronts hero"),
 'S120': ("The purple-shirt man in profile, mustached, grey-streaked hair.", ["PC"], "Terrace", "menacing", 3, "valuable — villain's man introduced"),
 'S132': ("A woman in a purple sari cradles the bleeding boy's head; hands hold a cloth to him.", ["PW","PQ"], "Village ground", "distress", 5, "valuable — the boy is hurt, emotional beat"),
 'S133': ("Villagers gather; the first young man holds a paper and reads it aloud.", ["PA","gaaon wale"], "Village", "tense", 4, "valuable — the letter is read"),
 'S135': ("Close-up: the gunman aims a pistol, finger on the trigger.", ["PL"], "Field", "menacing", 4, "valuable — gun comes out"),
 'S136': ("Blurry fast motion of the jeep chase.", [], "Road", "chaotic", 2, "skippable — motion blur, no story"),
 'S150': ("The purple-shirt man and the mustard-shirt man stand in the tall grass, talking.", ["PC","PA"], "Field", "tense", 3, "valuable — villains confer"),
 'S151': ("The two men talk; the purple-shirt man hands something to the other.", ["PC","PA"], "Field", "tense", 3, "valuable — handover"),
 'S173': ("Two men laugh in the jeep, one driving, the purple-shirt man beside him.", ["PA","PC"], "Jeep", "cruel", 3, "valuable — villains laugh"),
 'S174': ("Close-up of Durga holding up flower garlands, resolute.", ["PG"], "Field", "resolute", 5, "valuable — mother's faith, emotional peak"),
 'S188': ("Black-and-white: men brawl in the field, one lies on the ground, horsemen nearby.", ["ladte hue aadmi","ghudsawar"], "Field (flashback)", "violent", 4, "valuable — flashback fight"),
 'S189': ("Black-and-white close-up: a man bends over in the fight.", ["ek aadmi"], "Field (flashback)", "violent", 3, "valuable — flashback continues"),
 'S192': ("Empty sand dune, no people.", [], "Sand dune", "quiet", 1, "skippable — empty establishing"),
 'S193': ("A man tumbles down the sand dune.", ["ek aadmi"], "Sand dune", "chaotic", 2, "skippable — fall, no story"),
 'S194': ("Black-and-white: two men walk along a dune ridge.", ["do aadmi"], "Sand dune (flashback)", "quiet", 2, "skippable — flashback walking"),
 'S195': ("Two men run down a sand dune.", ["do aadmi"], "Sand dune", "urgent", 2, "skippable — running filler"),
 'S199': ("A horseman raises a sword on horseback.", ["ghudsawar"], "Field", "violent", 4, "valuable — horseman attacks"),
 'S200': ("Black-and-white: a man stumbles and runs on the dune.", ["ek aadmi"], "Sand dune (flashback)", "urgent", 2, "skippable — flashback running"),
 'S206': ("Black-and-white: a horseman and men fight in the field.", ["ghudsawar","ladte hue aadmi"], "Field (flashback)", "violent", 4, "valuable — flashback battle"),
 'S207': ("Black-and-white: two horsemen charge at each other.", ["do ghudsawar"], "Field (flashback)", "violent", 4, "valuable — horsemen clash"),
 'S215': ("Blurry fast motion, chase.", [], "Road", "chaotic", 1, "skippable — motion blur"),
 'S217': ("Close-up: a man in a straw hat, a mustached man, and a third man talk.", ["PO","PD","ek aadmi"], "Outdoors", "tense", 3, "valuable — men confer"),
 'S218': ("The elder, the hat man and the mustached man talk.", ["PE","PO","PD"], "Outdoors", "tense", 3, "valuable — negotiation"),
 'S220': ("Three men stand together: the hat man, a man in a blue kurta, and the elder.", ["PO","ek aadmi","PE"], "Outdoors", "tense", 3, "valuable — standoff"),
 'S221': ("The same three men keep talking.", ["PO","ek aadmi","PE"], "Outdoors", "tense", 2, "skippable — repeat of S220"),
 'S227': ("The elder and the striped-shirt man sit together.", ["PE","PP"], "House interior", "quiet", 2, "skippable — sitting filler"),
 'S228': ("The striped-shirt man looks up at a standing man.", ["PP","ek aadmi"], "House interior", "quiet", 2, "skippable — reaction"),
 'S229': ("The elder stands in a doorway.", ["PE"], "House interior", "quiet", 2, "skippable — filler"),
 'S230': ("Three young men sit with the elder, listening.", ["PB","PE","PA"], "House interior", "grave", 3, "valuable — heroes listen to the elder"),
 'S233': ("The woman in the blue sari and Durga sit together inside, both serious.", ["PI","PG"], "House interior", "somber", 4, "valuable — women wait, somber ending"),
 'S234': ("Ultra end logo on black.", [], "Black screen", "neutral", 1, "skippable — end logo"),
}
for sid, (action, chars, loc, mood, imp, val) in OV.items():
    s = by_id[sid]
    s['action'] = action; s['characters'] = chars; s['location'] = loc
    s['mood'] = mood; s['importance'] = imp; s['valuable_or_skippable'] = val
# defaults for the rest
for s in d:
    if 'valuable_or_skippable' not in s:
        imp = s.get('importance', 3)
        s['valuable_or_skippable'] = ('valuable — carries story' if imp >= 3 else 'skippable — filler or repeat')
json.dump({'shots': d}, open('descriptions.json','w'), ensure_ascii=False, indent=1)
import collections
print('total:', len(d), '| valuable:', sum(1 for s in d if s['valuable_or_skippable'].startswith('valuable')), '| skippable:', sum(1 for s in d if s['valuable_or_skippable'].startswith('skippable')))
print('importance:', collections.Counter(s['importance'] for s in d))
