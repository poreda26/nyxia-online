// Rogue weapon catalog — eski hazır liste kullanıcı isteğiyle SİLİNDİ,
// yerine görsel görsel yeniden dolduruluyor (bkz. utils/loot.js#rollWeapon,
// GmItemPanel). Eski katalog
// C:\Users\akcel\Desktop\RPGMarket\_legacy_items_backup\rogueWeapons.js'te
// yedekli duruyor, gerekirse referans alınabilir.
//
// Bu ilk parti tamamı "Bow" ailesi (Kind=6, gerçek KO'da "Iron Crossbow"
// gibi isimler de aynı Bow kind'ının içinde yer alır — ayrı bir Crossbow
// silah türü henüz yok, kullanıcı "Bowları bitirince Crossbowlara
// geçeceğiz" dediği için o ayrım ileride kendi weaponType'ıyla gelecek).
// Menzil (range) çoğu bowda WEAPON_TYPE_RANGE.bow (40) ile aynı ama Bow/
// Bamboo Bow'un ekran görüntüsünde 35 yazıyor — bu yüzden loot.js#
// buildWeaponFromTemplate artık `w.range` kök alanını (varsa) tip-bazlı
// sabitin önüne alıyor, tıpkı `w.weight`/`w.durability` override'ları gibi.

// Statü bonusu/HP/MP vermeyen, sade bowlar için paylaşılan satır üretici
// (Bow/Bamboo Bow/Iron Crossbow/Iron Bow) — Required Dexterity kontrol
// ediyor (Warrior'ın STR'sinin yerini Rogue'da DEX alıyor), element hasarı
// hepsinde "poison" (Zehir). `itemGrade` gerçek KO'nun Middle/High Class
// ayrımı — dormant veri (bkz. warriorWeapons.js#simpleWeaponLevel'daki
// aynı not).
function simpleBowLevel(atk, poison, reqDex, durability, itemGrade) {
  return { atk, elementBonus: poison, reqStats: [{ key: "dex", value: reqDex }], durability, itemGrade };
}

// Scorpion Bow — Unique ama kullanıcı Tier 4 dedi (eski "Unique=T6" kuralı
// bu partide kullanıcının verdiği açık tier'lara yerini bırakıyor).
// Dayanıklılığı diğerlerinin aksine SABİT 13000 (ekran görüntüsünde tüm
// sütunlarda tek bir birleşik hücre olarak duruyor, seviyeyle büyümüyor).
// Poison Damage satırında ekran görüntüsünde +8 hücresi boş/kopuk
// görünüyordu (45,55,65,75,85,95,105,[boşluk],115) — diğer tüm satırların
// kusursuz +10/seviye deseniyle (Resistance to Poison da temiz +5/seviye)
// çelişen bariz bir kopukluk olduğu için 115,125,135 yerine desenin devamı
// olan 115(+8)/125(+9)/135(+10) alındı (Glave/Halberd/Raptor'daki
// dayanıklılık yazım hatasıyla aynı muhakeme).
function scorpionBowLevel(atk, hp, poison, resPoison, reqDex) {
  return {
    atk, hp, mp: 0, elementBonus: poison,
    resistances: { poison: resPoison },
    reqStats: [{ key: "dex", value: reqDex }],
    durability: 13000,
  };
}

// Chitin Bow — Scorpion Bow ile aynı iskelet (sabit 13000 dayanıklılık,
// Resistance to Poison +5/seviye, Required Dexterity +1/seviye) ama HP
// yerine MP Bonusu veriyor, element "flame" (Alev). Kullanıcı: "gerçekten
// alev alev parlayan bir bow olmalı" — görsel buna göre tasarlandı.
function chitinBowLevel(atk, mp, flame, resPoison, reqDex) {
  return {
    atk, hp: 0, mp, elementBonus: flame,
    resistances: { poison: resPoison },
    reqStats: [{ key: "dex", value: reqDex }],
    durability: 13000,
  };
}

// Enion Bow — dayanıklılığı (diğer iki unique'in aksine) her seviyede
// büyüyor (10000→14500), STR Bonusu veriyor (ekran görüntüsündeki tabloda
// literal "Strength Bonus" yazıyor, Giantic Axe'daki DEX→STR dönüşümünün
// aksine burada kullanıcı bir değişiklik istemedi, tabloya birebir
// uyuluyor), element "lightning" (Yıldırım).
function enionBowLevel(atk, strBonus, lightning, reqDex, durability) {
  return {
    atk, statBonus: { str: strBonus }, elementBonus: lightning,
    reqStats: [{ key: "dex", value: reqDex }],
    durability,
  };
}

// Eagle's Eye — en karmaşık satır: STR Bonusu + HP/MP Bonusu (ikisi de
// aynı değeri alıyor, Avedon'daki "aynı satırda görünme" deseniyle aynı
// sebep) + Poison Damage + yeni "Defense Ability (Sword)" alanı + Flame/
// Glacier direnci (ikisi de aynı değer). Defense Ability henüz kurulmamış
// bir anti-def mekaniği (kullanıcı: "bu sistemi yakın zamanda kuracağız,
// atlamadan ekle") — `resistances`/`itemGrade` gibi motorumuzda henüz
// karşılığı olmayan dormant bir alan olarak `defenseAbility: { vs, value }`
// şeklinde saklanıyor, ekran görüntüsünde +1/+2'de boş, +3'ten itibaren
// (1,2,3,4,5,7,10,14) değer alıyor.
function eaglesEyeLevel(atk, strBonus, hpmp, poison, defAbility, res, reqDex, durability) {
  return {
    atk, statBonus: { str: strBonus }, hp: hpmp, mp: hpmp, elementBonus: poison,
    defenseAbility: defAbility ? { vs: "sword", value: defAbility } : null,
    resistances: { flame: res, glacier: res },
    reqStats: [{ key: "dex", value: reqDex }],
    durability,
  };
}

// Helenid — Enion Bow ile aynı dayanıklılık eğrisi (10000-14500) ve Eagle's
// Eye ile aynı ATK eğrisi (95-163) taşıyan üçüncü T6 crossbow'u. Glacier
// Damage (element "ice") + ekran görüntüsündeki "Required Health: 80"
// satırı (her seviyede sabit, Avedon'daki aynı özel `key: "hp"` desteği).
function helenidLevel(atk, glacier, reqDex, durability) {
  return {
    atk, elementBonus: glacier,
    reqStats: [{ key: "dex", value: reqDex }, { key: "hp", value: 80 }],
    durability,
  };
}

export const ROGUE_WEAPONS = [
  // Bow — oyunumuzdaki en güçsüz bow, Tier 1. Basit, süslemesiz bir avcı
  // yayı tasarlandı: düz ahşap gövde, gergin kiriş, hiç metal/süsleme yok.
  {
    tier: 1, levelMin: 1, levelMax: 15, name: "Bow", weaponType: "bow", weaponSlot: "twoHand",
    weight: 3, range: 35, element: "poison",
    levels: [
      simpleBowLevel(8, 10, 56, 5000, "low"),    // +1
      simpleBowLevel(12, 20, 60, 6000, "low"),   // +2
      simpleBowLevel(16, 30, 64, 7000, "low"),   // +3
      simpleBowLevel(20, 40, 68, 8000, "low"),   // +4
      simpleBowLevel(24, 50, 72, 9000, "low"),   // +5
      simpleBowLevel(28, 60, 76, 10000, "middle"), // +6
      simpleBowLevel(34, 70, 80, 11000, "middle"), // +7
      simpleBowLevel(43, 80, 84, 12000, "middle"), // +8
      simpleBowLevel(56, 90, 88, 13000, "middle"), // +9
      simpleBowLevel(76, 100, 92, 14000, "middle"), // +10
    ],
  },
  // Bamboo Bow — Bow'un biraz daha güçlü hali, Tier 1. Bow'a göre çok az
  // daha ihtişamlı: bambu-yeşili gövde, ince desenli sarım.
  {
    tier: 1, levelMin: 1, levelMax: 15, name: "Bamboo Bow", weaponType: "bow", weaponSlot: "twoHand",
    weight: 3, range: 35, element: "poison",
    levels: [
      simpleBowLevel(15, 10, 64, 5000, "low"),    // +1
      simpleBowLevel(19, 20, 68, 6000, "low"),    // +2
      simpleBowLevel(23, 30, 72, 7000, "low"),    // +3
      simpleBowLevel(27, 40, 76, 8000, "low"),    // +4
      simpleBowLevel(31, 50, 80, 9000, "low"),    // +5
      simpleBowLevel(35, 60, 84, 10000, "middle"), // +6
      simpleBowLevel(41, 70, 88, 11000, "middle"), // +7
      simpleBowLevel(50, 80, 92, 12000, "middle"), // +8
      simpleBowLevel(63, 90, 96, 13000, "middle"), // +9
      simpleBowLevel(83, 100, 100, 14000, "middle"), // +10
    ],
  },
  // Iron Crossbow (Normal) — Tier 3, Bamboo Bow'dan daha ihtişamlı: demir
  // gövdeli, gerçek bir mekanik germe kolu olan bir arbalet görünümü.
  {
    tier: 3, levelMin: 30, levelMax: 45, name: "Iron Crossbow", weaponType: "bow", weaponSlot: "twoHand",
    weight: 4, element: "poison",
    levels: [
      simpleBowLevel(84, 10, 130, 5000, "middle"),   // +1
      simpleBowLevel(88, 20, 134, 6000, "middle"),   // +2
      simpleBowLevel(92, 30, 138, 7000, "middle"),   // +3
      simpleBowLevel(96, 40, 142, 8000, "middle"),   // +4
      simpleBowLevel(100, 50, 146, 9000, "middle"),  // +5
      simpleBowLevel(104, 60, 150, 10000, "high"),   // +6
      simpleBowLevel(110, 70, 154, 11000, "high"),   // +7
      simpleBowLevel(119, 80, 158, 12000, "high"),   // +8
      simpleBowLevel(132, 90, 162, 13000, "high"),   // +9
      simpleBowLevel(152, 100, 166, 14000, "high"),  // +10
    ],
  },
  // Scorpion Bow (Unique) — Tier 4. HP Bonusu olduğu için AP'si düşük ama
  // fena değil. Iron Crossbow'dan daha ihtişamlı: zehirli-yeşil parlayan
  // bir akrep kuyruğu siluetiyle şekillendirilmiş yay kolları.
  {
    tier: 4, levelMin: 45, levelMax: 55, name: "Scorpion Bow", weaponType: "bow", weaponSlot: "twoHand",
    weight: 3, element: "poison",
    levels: [
      scorpionBowLevel(71, 100, 45, 30, 94),   // +1
      scorpionBowLevel(75, 130, 55, 35, 95),   // +2
      scorpionBowLevel(79, 160, 65, 40, 96),   // +3
      scorpionBowLevel(83, 190, 75, 45, 97),   // +4
      scorpionBowLevel(87, 220, 85, 50, 98),   // +5
      scorpionBowLevel(91, 250, 95, 55, 99),   // +6
      scorpionBowLevel(97, 280, 105, 60, 100), // +7
      scorpionBowLevel(106, 310, 115, 65, 101), // +8
      scorpionBowLevel(119, 350, 125, 70, 102), // +9
      scorpionBowLevel(139, 400, 135, 75, 103), // +10
    ],
  },
  // Iron Bow (Normal) — Tier 5, oldukça güçlü ve güzel. İhtişamlı bir
  // görünüm: parlak çelik uçlu, gergin çift kiriş.
  {
    tier: 5, levelMin: 55, levelMax: 65, name: "Iron Bow", weaponType: "bow", weaponSlot: "twoHand",
    weight: 4, element: "poison",
    levels: [
      simpleBowLevel(93, 10, 140, 5000),   // +1
      simpleBowLevel(97, 20, 144, 6000),   // +2
      simpleBowLevel(101, 30, 148, 7000),  // +3
      simpleBowLevel(105, 40, 152, 8000),  // +4
      simpleBowLevel(109, 50, 156, 9000),  // +5
      simpleBowLevel(113, 60, 160, 10000), // +6
      simpleBowLevel(119, 70, 164, 11000), // +7
      simpleBowLevel(128, 80, 168, 12000), // +8
      simpleBowLevel(141, 90, 172, 13000), // +9
      simpleBowLevel(161, 100, 176, 14000), // +10
    ],
  },
  // Chitin Bow (Unique) — Tier 6, müthiş bir eşya, gerçekten alev alev
  // parlayan bir bow. Kitin-kabuk dokulu koyu kahve gövde, uçları ateşle
  // kaplı.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Chitin Bow", weaponType: "bow", weaponSlot: "twoHand",
    weight: 3, element: "flame",
    levels: [
      chitinBowLevel(101, 100, 10, 30, 94),   // +1
      chitinBowLevel(103, 130, 20, 35, 95),   // +2
      chitinBowLevel(105, 160, 30, 40, 96),   // +3
      chitinBowLevel(107, 190, 40, 45, 97),   // +4
      chitinBowLevel(109, 220, 50, 50, 98),   // +5
      chitinBowLevel(111, 250, 60, 55, 99),   // +6
      chitinBowLevel(116, 280, 70, 60, 100),  // +7
      chitinBowLevel(125, 310, 80, 65, 101),  // +8
      chitinBowLevel(138, 350, 90, 70, 102),  // +9
      chitinBowLevel(158, 400, 100, 75, 103), // +10
    ],
  },
  // Enion Bow (Unique) — Tier 6, Chitin Bow gibi muazzam. STR Bonusu +
  // Yıldırım hasarı, çok ihtişamlı bir görünüm: elektrik-mavi parıltılı,
  // yıldırım çatlaklı bir gövde.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Enion Bow", weaponType: "bow", weaponSlot: "twoHand",
    weight: 4, element: "lightning",
    levels: [
      enionBowLevel(91, 5, 30, 130, 10000),   // +1
      enionBowLevel(95, 7, 40, 134, 10500),   // +2
      enionBowLevel(99, 9, 50, 138, 11000),   // +3
      enionBowLevel(103, 11, 60, 142, 11500), // +4
      enionBowLevel(107, 13, 70, 146, 12000), // +5
      enionBowLevel(111, 15, 80, 150, 12500), // +6
      enionBowLevel(117, 17, 90, 154, 13000), // +7
      enionBowLevel(126, 20, 100, 158, 13500), // +8
      enionBowLevel(139, 24, 110, 162, 14000), // +9
      enionBowLevel(159, 30, 120, 166, 14500), // +10
    ],
  },
  // Eagle's Eye (Unique) — Tier 6, en güçlü ve en karmaşık bow. Sword'a
  // karşı yeni "Defense Ability" mekaniği (henüz dormant, ileride anti-def
  // sistemi kurulunca devreye girecek) taşıyan tek eşya. Çok ihtişamlı bir
  // görünüm: altın-beyaz kartal tüyü motifli, gerilimde parlayan bir yay.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Eagle's Eye", weaponType: "bow", weaponSlot: "twoHand",
    weight: 4, element: "poison",
    levels: [
      eaglesEyeLevel(95, 1, 70, 11, 0, 13, 140, 10000),    // +1
      eaglesEyeLevel(99, 2, 80, 20, 0, 14, 144, 10500),    // +2
      eaglesEyeLevel(103, 3, 90, 30, 1, 15, 148, 11000),   // +3
      eaglesEyeLevel(107, 5, 100, 40, 2, 16, 152, 11500),  // +4
      eaglesEyeLevel(111, 7, 110, 50, 3, 17, 156, 12000),  // +5
      eaglesEyeLevel(115, 9, 130, 60, 4, 18, 160, 12500),  // +6
      eaglesEyeLevel(121, 11, 150, 71, 5, 20, 164, 13000), // +7
      eaglesEyeLevel(130, 13, 170, 90, 7, 22, 168, 13500), // +8
      eaglesEyeLevel(143, 16, 200, 110, 10, 30, 172, 14000), // +9
      eaglesEyeLevel(163, 20, 250, 140, 14, 46, 176, 14500), // +10
    ],
  },
  // Crossbow — Tier 2. İsminde "Crossbow" geçse de kullanıcı isteğiyle
  // kategori/weaponType hâlâ "bow" (Iron Crossbow'daki aynı karar) — gerçek
  // bir Crossbow silah türü henüz yok. Görseli sade/işlenmemiş bir arbalet:
  // ham ahşap dipçik, süslemesiz düz gri demir kollar.
  {
    tier: 2, levelMin: 15, levelMax: 30, name: "Crossbow", weaponType: "bow", weaponSlot: "twoHand",
    weight: 4.5, element: "poison",
    levels: [
      simpleBowLevel(63, 10, 110, 5000),   // +1
      simpleBowLevel(67, 20, 114, 6000),   // +2
      simpleBowLevel(71, 30, 118, 7000),   // +3
      simpleBowLevel(75, 40, 122, 8000),   // +4
      simpleBowLevel(79, 50, 126, 9000),   // +5
      simpleBowLevel(83, 60, 130, 10000),  // +6
      simpleBowLevel(89, 70, 134, 11000),  // +7
      simpleBowLevel(98, 80, 138, 12000),  // +8
      simpleBowLevel(111, 90, 142, 13000), // +9
      simpleBowLevel(131, 100, 146, 14000), // +10
    ],
  },
  // Horn Crossbow — Tier 2, normal Crossbow'dan daha ihtişamlı: boynuz/kemik
  // kollu, cilalı ahşap dipçikli daha zarif bir arbalet.
  {
    tier: 2, levelMin: 15, levelMax: 30, name: "Horn Crossbow", weaponType: "bow", weaponSlot: "twoHand",
    weight: 4.5, element: "poison",
    levels: [
      simpleBowLevel(74, 10, 120, 5000),   // +1
      simpleBowLevel(78, 20, 124, 6000),   // +2
      simpleBowLevel(82, 30, 128, 7000),   // +3
      simpleBowLevel(86, 40, 132, 8000),   // +4
      simpleBowLevel(90, 50, 136, 9000),   // +5
      simpleBowLevel(94, 60, 140, 10000),  // +6
      simpleBowLevel(100, 70, 144, 11000), // +7
      simpleBowLevel(109, 80, 148, 12000), // +8
      simpleBowLevel(122, 90, 152, 13000), // +9
      simpleBowLevel(142, 100, 156, 14000), // +10
    ],
  },
  // Helenid (Unique) — Tier 6, üçüncü ve en güçlü crossbow'umuz. Oldukça
  // ihtişamlı bir görünüm: buz-mavi parıldayan, donmuş kristal kollu bir
  // arbalet — diğer iki Crossbow'un (ham ahşap, boynuz/altın) sıcak
  // paletlerinden bilinçli olarak ayrışan soğuk bir tasarım.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Helenid", weaponType: "bow", weaponSlot: "twoHand",
    weight: 4, element: "ice",
    levels: [
      helenidLevel(95, 30, 188, 10000),   // +1
      helenidLevel(99, 40, 192, 10500),   // +2
      helenidLevel(103, 50, 196, 11000),  // +3
      helenidLevel(107, 60, 200, 11500),  // +4
      helenidLevel(111, 70, 204, 12000),  // +5
      helenidLevel(115, 80, 208, 12500),  // +6
      helenidLevel(121, 90, 212, 13000),  // +7
      helenidLevel(130, 100, 216, 13500), // +8
      helenidLevel(143, 110, 220, 14000), // +9
      helenidLevel(163, 120, 224, 14500), // +10
    ],
  },
];
