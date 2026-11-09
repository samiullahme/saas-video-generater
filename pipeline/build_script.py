# -*- coding: utf-8 -*-
"""RecapMaker v2 Hindi script draft — one flowing sentence per shot, present tense.
Word count target ~1150-1250 for ~350-380s at measured Hindi TTS pace ~3.35 wps.
Shot IDs refer to manual2 shots.json. Names per character_bible.json (medium+ confidence)."""
import json

LINES = [
 # INTRO — greeting + film + backstory (over the opening palace shots)
 ("L01", "Doston, swagat hai aapka. Aaj main aapke liye lekar aaya hoon Karan Arjun ki kahani.", ["S002"]),
 ("L02", "Ye kahani hai ek maa Durga ki, jiske do bete the — Karan aur Arjun.", ["S003"]),
 ("L03", "Bees saal pehle, Durjan Singh ne un dono ko unki maa ke saamne maar diya tha, taaki woh uski jaydad na le sakein.", ["S004"]),
 ("L04", "Lekin Durga ki dua se dono bhai dobara janm lete hain — Ajay aur Vijay ke roop mein, aur ab dono ko apne pehle janm ki koi yaad nahi hai.", ["S005"]),
 ("L05", "Aur aaj dono bhai Durjan ke mahal ke saamne khade hain, badla lene ke liye, bina ye jaane ki woh kaun hain.", ["S006"]),
 # PALACE CONFRONTATION
 ("L06", "Hum dekhte hain, mahal ke lawn mein Ajay aur Vijay, Munshiji se behes kar rahe hain, aur unke chehre par gussa saaf dikh raha hai.", ["S009"]),
 ("L07", "Durjan apne saathi Saxena ke saath khada hokar sab kuch dekh raha hai.", ["S007"]),
 ("L08", "Gaon mein bheed jama ho jaati hai, sab ye tamasha dekh rahe hain aur koi kuch nahi bol raha.", ["S023"]),
 # ELDER PANICS + VERANDA PLEA
 ("L09", "Munshiji ghabra jaata hai, uske chehre par darr saaf dikh raha hai, kyunki woh jaanta hai ki ye ladai ab rukne wali nahi hai.", ["S032"]),
 ("L10", "Phir woh ghabrahat mein charpai par gir jaata hai, aur gaon wale use dekhkar hairaan reh jaate hain.", ["S035"]),
 ("L11", "Agle scene mein hum dekhte hain, Munshiji ek bade ghar ki veranda par jaakar minnat karta hai.", ["S048"]),
 ("L12", "Ghar ka malik aur uski patni uski baat dhyaan se sunte hain, lekin kuch kehte nahi hain.", ["S049"]),
 # SONIA'S LETTER + DURGA
 ("L13", "Dusri taraf, Vijay akela terrace par khada soch raha hai, jaise use kuch yaad aane ki koshish kar raha ho.", ["S051"]),
 ("L14", "Sonia, gulabon ke beech baithi, ek chitthi padh rahi hai.", ["S081"]),
 ("L15", "Chitthi padhte hue use Vijay ka chehra yaad aata hai, aur woh chitthi ko seene se lagaakar muskuraati hai.", ["S082", "S083"]),
 ("L16", "Munshiji, Durga se milkar use sab kuch batata hai, aur Durga chupchaap sunti rehti hai.", ["S086"]),
 ("L17", "Durga, Sonia ke saath khadi, sab kuch sunti hai, aur uske chehre par chinta aur ummeed dono dikh rahe hain.", ["S091"]),
 # NIGHT CAMP — ARMS TRADE
 ("L18", "Raat ko hum dekhte hain, ek aadmi lakdi ke crate ki taraf haath badhata hai.", ["S095"]),
 ("L19", "Durjan ke aadmi stacked crates ko kholte hain, aur andar se hathiyaar nikalte hain.", ["S098"]),
 ("L20", "Ye unka raat ka camp hai, jahan hathiyaaron ka kaala dhanda chalta hai, aur Saxena iska hissa hai.", ["S100"]),
 ("L21", "Tent ke andar, Saxena aur uske aadmi lantern ki roshni mein baat kar rahe hain, aur unke chehre par tension saaf dikh rahi hai.", ["S106"]),
 ("L22", "Saxena, gate par khada hokar truck ko dekh raha hai, jaise kisi ka intezaar kar raha ho.", ["S110"]),
 ("L23", "Aangan mein jeeps khadi hain aur hathiyarbund aadmi tayaar khade hain.", ["S115"]),
 # BOY BEATEN + GUN
 ("L24", "Ek chhota ladka, peeta hua, zameen par pada hai, aur ek aurat uske sir ko sehla rahi hai.", ["S132"]),
 ("L25", "Ajay, gaon walon ke saamne ek kagaz padhkar sunata hai, aur sab use dhyaan se sunte hain.", ["S133"]),
 ("L26", "Tabhi Durjan ka aadmi pistol nikaalta hai aur nishana lagata hai, aur hawa mein darr phail jaata hai.", ["S135"]),
 # JEEP DRAGGING + GARLANDS (emotional peak)
 ("L27", "Ajay, jeep ke paas ek aadmi se ladta hai aur rifle chheen ne ki koshish karta hai.", ["S158"]),
 ("L28", "Phir Durjan ke aadmi, Vijay aur Ajay ko rassi se baandhkar jeep ke peeche ghasit te hain.", ["S162"]),
 ("L29", "Dono bhai, ret par munh ke bal ghasit te hue ja rahe hain, aur unke haath mein rassi hai.", ["S164"]),
 ("L30", "Aur khet mein akeli khadi hai Durga — haath mein phoolon ki mala liye, jeep ko dekh rahi hai.", ["S168"]),
 ("L31", "Woh jeep ki taraf mala uthakar dikhati hai, use ab bhi yakeen hai ki uske Karan Arjun aayenge.", ["S172"]),
 ("L32", "Jeep mein baithe Durjan ke aadmi has rahe hain, unhe Durga ki dua ki koi parwah nahi hai.", ["S173"]),
 ("L33", "Lekin Durga ke chehre par koi darr nahi hai — sirf yakeen hai, aur wohi is kahani ki sabse badi taakat hai.", ["S174"]),
 # FLASHBACK
 ("L34", "Tabhi humein ek flashback dikhta hai — pehle janm ki ladai, jahan ghudsawar talwaron se lad rahe hain.", ["S188"]),
 ("L35", "Ek ghudsawar talwar uthakar hamla karta hai, aur maidan mein khoon kharaba hota hai.", ["S199"]),
 ("L36", "Ye wohi ladai hai, jisme Karan aur Arjun pehli baar mare gaye the, apni maa ke saamne.", ["S206"]),
 ("L37", "Do ghudsawar aamne-saamne aate hain — jaise itihaas khud ko dohra raha ho.", ["S207"]),
 # STANDOFF + ENDING + TEASER
 ("L38", "Agle scene mein hum dekhte hain, kuch aadmi aapas mein baat kar rahe hain, aur unke chehre par tension saaf dikh rahi hai.", ["S217"]),
 ("L39", "Teen aadmi khade hokar kisi baat par behes kar rahe hain, aur Munshiji beech mein khada hai.", ["S220"]),
 ("L40", "Ghar ke andar, Ajay, Vijay aur Munshiji baithe hain aur kuch sun rahe hain.", ["S230"]),
 ("L41", "Aur aakhir mein, Durga aur Bindiya, chupchaap baithe hain — dono ke chehre par chinta saaf dikh rahi hai.", ["S233"]),
 ("L42", "Ab sawaal ye hai — kya dono bhai ko apna pehla janm yaad aayega? Kya Durjan ka anth hoga? Ye hum next part mein dekhenge.", ["S233"]),
]

out = []
total = 0
for lid, text, shots in LINES:
    w = len(text.split())
    total += w
    out.append({"line_id": lid, "text": text, "shot_ids": shots, "words": w})
json.dump({"lines": out, "total_words": total, "estimated_seconds_at_3.35wps": round(total/3.35, 1)},
          open("script.json", "w"), ensure_ascii=False, indent=1)
print("lines:", len(out), "total words:", total, "est seconds:", round(total/3.35, 1))
for l in out:
    print(l["line_id"], l["words"], "w |", l["shot_ids"], "|", l["text"][:70])
