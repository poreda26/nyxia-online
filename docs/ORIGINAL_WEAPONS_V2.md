# Özgün silahlar — kopya varyantların kaldırılması

20 otomatik Muhafız/Avcı varyantı katalogdan kaldırılır. Eski kayıtlar id, sahiplik, +seviye ve dayanıklılık oranı korunarak aşağıdaki özgün silahlara dönüşür. Her silah ayrı PNG dosyasına bağlıdır. Eski özgün silah görselleri değiştirilmez. Görseller built-in image_gen ile ayrı ayrı üretilmiştir.

| Sınıf | Tier | Yeni ad | Eski kopya | Dosya |
|---|---|---|---|---|
| warrior | 2 | Közdiş | Halberd · Avcı | src/assets/items/nyxia_emberfang.png |
| warrior | 4 | Gökyarık | Blade Axe · Muhafız | src/assets/items/nyxia_skyrend.png |
| warrior | 4 | Mezarkıran | Blade Axe · Avcı | src/assets/items/nyxia_gravebreaker.png |
| rogue | 1 | Çalıpençe | Bow · Avcı | src/assets/items/nyxia_briarclaw.png |
| rogue | 2 | Şafak Teli | Crossbow · Avcı | src/assets/items/nyxia_dawnstring.png |
| rogue | 3 | Akrep İğnesi | Iron Crossbow · Muhafız | src/assets/items/nyxia_scorpionsting.png |
| rogue | 3 | Yelkanat | Iron Crossbow · Avcı | src/assets/items/nyxia_windwing.png |
| rogue | 4 | Gece Kirişi | Scorpion Bow · Muhafız | src/assets/items/nyxia_nightstring.png |
| rogue | 4 | Gökzıpkın | Scorpion Bow · Avcı | src/assets/items/nyxia_skyharpoon.png |
| rogue | 5 | Kızıl Hilal | Iron Bow · Muhafız | src/assets/items/nyxia_crimsoncrescent.png |
| rogue | 5 | Fırtına Gözü | Iron Bow · Avcı | src/assets/items/nyxia_stormeye.png |
| mage | 1 | Çiydalı | Wooden Staff · Avcı | src/assets/items/nyxia_dewbranch.png |
| mage | 2 | Kor Feneri | Iron-Tipped Staff · Muhafız | src/assets/items/nyxia_emberlantern.png |
| mage | 2 | Ay Sarmalı | Iron-Tipped Staff · Avcı | src/assets/items/nyxia_mooncoil.png |
| mage | 3 | Buz Çanı | Silk-Bound Staff · Muhafız | src/assets/items/nyxia_frostbell.png |
| mage | 3 | Kum Saati | Silk-Bound Staff · Avcı | src/assets/items/nyxia_hourglass.png |
| mage | 4 | Ruh Feneri | Crimson-Runed Staff · Muhafız | src/assets/items/nyxia_soullight.png |
| mage | 4 | Gök Mührü | Crimson-Runed Staff · Avcı | src/assets/items/nyxia_skyseal.png |
| mage | 5 | Hiçlik Tacı | Chitin-Woven Staff · Muhafız | src/assets/items/nyxia_voidcrown.png |
| mage | 5 | Güneş Çekirdeği | Chitin-Woven Staff · Avcı | src/assets/items/nyxia_suncore.png |

## Kontrol

Yerel geliştirici önizlemesi: `/nyxia-online/weapon-check.html`. 20 silahın görseli ve +1–+8 değerleri oyuncu kaydına dokunmadan incelenebilir. Her sınıf/tier içindeki gereksinimler farklıdır; toplam özellik profilleri ve PNG içerikleri tekrarsızdır. Upgrade başarı, kırılma ve set kuralları değiştirilmedi.

28 dünya/kayıt testi, 4 savaş görsel testi ve üretim derlemesi geçti. 20 PNG'nin şeffaf arka planı kontrol edildi. V1 düello yüzdeleri yeni katalog için yeniden ölçülmüş sonuç sayılmaz.

## Üretim promptları

Ortak prompt: Use case: stylized-concept. One standalone inventory weapon icon for Nyxia dark fantasy mobile RPG. Subject: [aşağıdaki tanım]. Distinct coherent complete weapon, diagonal bottom-left to top-right, fills 85% square canvas, hand painted textured early 2000s MMORPG aesthetic remastered, sharp readable silhouette, no person, no floor, no labels, no frame. Actual transparent PNG background.

- Közdiş: a hooked single-edged iron falchion with jagged ember-red spine, charred leather grip
- Gökyarık: a crescent-shaped blue steel poleaxe with open crescent head and long ivory wrapped haft
- Mezarkıran: a massive square-headed basalt war maul with green runes and short heavy black chain pommel
- Çalıpençe: a short asymmetrical recurve bow carved from pale thornwood, small hooked tips and braided green bowstring
- Şafak Teli: a tall slender golden elm longbow with sunburst bronze center and straight long tapering limbs
- Akrep İğnesi: a compact horizontal steel crossbow with scorpion-tail shaped stock and twin narrow black limbs
- Yelkanat: a white wood reflex bow with sweeping feather-shaped limbs and turquoise central gemstone
- Gece Kirişi: a black obsidian longbow with angular bat-wing limbs and purple silk string
- Gökzıpkın: a heavy silver siege crossbow with ornate circular crank and sapphire-tipped loaded bolt
- Kızıl Hilal: a huge crimson crescent warbow with overlapping dragon scale limbs and dark gold grip
- Fırtına Gözü: a mechanical brass crossbow with three open circular sight rings and blue electric crystal core
- Çiydalı: a slender crooked willow staff topped by a closed translucent dew teardrop, dangling tiny leaves
- Kor Feneri: a copper staff topped with a small hanging hexagonal lantern containing an amber flame
- Ay Sarmalı: a silver twisted staff topped with a hollow spiral crescent and floating pearl
- Buz Çanı: a white crystalline staff topped by an upside-down ice bell containing a small blue crystal clapper
- Kum Saati: an aged bronze staff with a narrow hourglass head containing glowing golden sand
- Ruh Feneri: a black iron staff topped with a cage of elongated skeletal fingers holding a green spirit flame
- Gök Mührü: a dark azure staff topped by three interlocking open silver triangles around a cyan star
- Hiçlik Tacı: an ebony scepter with a wide fractured floating amethyst crown head and empty dark central void
- Güneş Çekirdeği: a white and gold staff crowned with a radial spiked sun disk containing a bright orange orb
