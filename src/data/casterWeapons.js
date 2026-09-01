// Mage-only staff catalog (Kind 110) — eski hazır liste kullanıcı isteğiyle
// SİLİNDİ, yerine görsel görsel yeniden dolduruluyor (bkz.
// utils/loot.js#rollWeapon, GmItemPanel). Priest bu tabloyu kullanmıyor
// (bkz. data/priestWeapons.js). Eski katalog
// C:\Users\akcel\Desktop\RPGMarket\_legacy_items_backup\casterWeapons.js'te
// yedekli duruyor, gerekirse referans alınabilir.
//
// Scorching Staff / Oasis Staff / Chaotic Staff: kullanıcı "üçünün de
// özellikleri aynı, tek fark bonusları (element)" dedi — gerçekten de
// Durability/Attack Power/Health Bonus/Defense Ability/Required Int/
// Required Magic Power satırları üçünde de birebir aynı, sadece element
// hasarının türü (Flame/Glacier/Lightning) değişiyor. Tek bir paylaşımlı
// satır üretici (staffLevel) bu yüzden yeterli.
//
// Attack Speed "Very Slow" ve Effective Range "1.00" — WEAPON_TYPE_SPEED.
// staff (Yavaş) / WEAPON_TYPE_RANGE.staff (3.0) varsayılanlarından farklı
// olduğu için loot.js#buildWeaponFromTemplate'in `w.attackSpeed`/`w.range`
// override desteğiyle (bkz. Bow/Bamboo Bow'daki aynı desen) her üç eşyada
// da kök seviyede ezildi.
//
// "Defense Ability (Dagger)" — Eagle's Eye'ın "Defense Ability (Sword)"
// ile aynı dormant anti-melee mekaniği (bkz. rogueWeapons.js), burada
// Rogue'un hançerine karşı. Değerleri de birebir aynı (1,2,3,4,5,7,10,14,
// +3'ten itibaren) — muhtemelen gerçek KO'da tek bir ortak eğri.
//
// "Required Magic Power" satırında ekran görüntüsünde +8/+9 hücreleri
// boş/kopuk görünüyordu (86,90,94,98,102,106,110,114,[boşluk],118) — her
// diğer satırın (Durability, Attack Power, Health/Defense Ability) kusursuz
// +4/seviye deseniyle çelişen bariz bir kopukluk (muhtemelen filigran/OCR
// kaybı) olduğu için 118/122/126 yerine desenin temiz devamı alındı
// (Glave/Halberd/Raptor'daki dayanıklılık yazım hatasıyla aynı muhakeme).
//
// Kullanıcı bu partide tier belirtmedi — önceki genel kural "Uniqe
// eşyaların hepsi Tier 6 olacak, sadece belirli kutulardan/bosslardan
// elde edilecek" hâlâ geçerli sayıldı (bu turda kullanıcı bazı Unique'lerde
// bunu bilinçli olarak T4/T3'e düşürmüştü ama burada hiç tier belirtmediği
// için varsayılan T6 uygulandı).
function staffLevel(atk, hp, elementDmg, defAbility, reqMag, durability) {
  return {
    atk, hp, mp: 0, elementBonus: elementDmg,
    defenseAbility: defAbility ? { vs: "dagger", value: defAbility } : null,
    reqStats: [{ key: "mag", value: reqMag }, { key: "int", value: 112 }],
    durability,
  };
}

export const CASTER_WEAPONS = [
  // Wooden Staff — Tier 1 giriş asası. Kullanıcı testinde ortaya çıktı:
  // bu tabloda T6 Unique'lerden ÖNCE hiçbir alt tier yoktu, yani Mage'in T1
  // canavarlardan HİÇ silah düşmüyordu (rollFromWeaponTable boş dönüyordu).
  // Elimizde gerçek KO'nun decrypted T1 staff verisi yok (altta ki
  // uniqueler ekran görüntüsünden birebir alındı) — bu basit giriş eşyası
  // onun yerine komşu tier1 silahların (Weight Hammer/Bow) güç bandına
  // kalibre edildi, sabit tek satır (levels dizisi yok, forge'un ×1.18
  // tahminiyle yükseliyor, bkz. utils/upgrade.js#bumpedStats).
  {
    tier: 1, levelMin: 1, levelMax: 15, name: "Wooden Staff", weaponType: "staff", weaponSlot: "twoHand",
    weight: 3, atk: 10, mp: 5,
    reqStats: [{ key: "mag", value: 50 }, { key: "int", value: 50 }],
  },
  // Apprentice Staff — Wooden Staff'la aynı sebepten (tek tier1 seçenek =
  // her seferinde aynı silah) ikinci bir tier1 alternatif olarak eklendi.
  {
    tier: 1, levelMin: 1, levelMax: 15, name: "Apprentice Staff", weaponType: "staff", weaponSlot: "twoHand",
    weight: 3, atk: 13, mp: 3,
    reqStats: [{ key: "mag", value: 58 }, { key: "int", value: 46 }],
  },
  // T2-T5 giriş asaları — kullanıcının bildirdiği "bazı sandıklarda siyah
  // bir kutucuk kalıyor" bug'ının kök nedeniydi: bu tablo T1'in HEMEN
  // ÜSTÜNDE (T2-T5) TAMAMEN boştu, T6 uniqueler dışında hiçbir şey yoktu.
  // Mage bir T2-T5 sandık/canavar dropunda silah dalını çekince rollWeapon
  // null dönüyordu, ChestModal da null bir sonucu boş bir kutu olarak
  // render ediyordu (bkz. ChestModal.jsx'teki düzeltme). Elimizde gerçek
  // veri yok — reqStats mage zırhının aynı tier'daki int gereksinimiyle
  // (bkz. data/armorSets.js) hizalandı, atk Rogue'un T2-T5 eğrisine yakın
  // bir bantta kalibre edildi.
  {
    tier: 2, levelMin: 15, levelMax: 25, name: "Iron-Tipped Staff", weaponType: "staff", weaponSlot: "twoHand",
    weight: 3, atk: 65, mp: 8,
    reqStats: [{ key: "mag", value: 105 }, { key: "int", value: 100 }],
  },
  {
    tier: 3, levelMin: 25, levelMax: 40, name: "Silk-Bound Staff", weaponType: "staff", weaponSlot: "twoHand",
    weight: 3, atk: 85, mp: 14,
    reqStats: [{ key: "mag", value: 130 }, { key: "int", value: 124 }],
  },
  {
    tier: 4, levelMin: 40, levelMax: 60, name: "Crimson-Runed Staff", weaponType: "staff", weaponSlot: "twoHand",
    weight: 4, atk: 105, mp: 20,
    reqStats: [{ key: "mag", value: 168 }, { key: "int", value: 160 }],
  },
  {
    tier: 5, levelMin: 60, levelMax: 65, name: "Chitin-Woven Staff", weaponType: "staff", weaponSlot: "twoHand",
    weight: 4, atk: 120, mp: 26,
    reqStats: [{ key: "mag", value: 168 }, { key: "int", value: 160 }],
  },
  // Scorching Staff (Unique) — Flame. Görseli: kıvrık siyah-kızıl bir asa,
  // ucunda alevli bir kristal/kafatası motifi.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Scorching Staff", weaponType: "staff", weaponSlot: "twoHand",
    weight: 4, element: "flame", attackSpeed: "Çok Yavaş", range: 1,
    levels: [
      staffLevel(87, 0, 8, 0, 90, 6000),    // +1
      staffLevel(91, 0, 16, 0, 94, 7000),   // +2
      staffLevel(95, 1, 24, 1, 98, 8000),   // +3
      staffLevel(99, 2, 32, 2, 102, 9000),  // +4
      staffLevel(103, 3, 40, 3, 106, 10000), // +5
      staffLevel(107, 4, 48, 4, 110, 11000), // +6
      staffLevel(113, 5, 56, 5, 114, 12000), // +7
      staffLevel(122, 6, 64, 7, 118, 13000), // +8
      staffLevel(135, 8, 72, 10, 122, 14000), // +9
      staffLevel(155, 11, 80, 14, 126, 15000), // +10
    ],
  },
  // Oasis Staff (Unique) — Glacier (element "ice", bkz. data/elements.js).
  // Görseli: mavi-turkuaz buz kristalleriyle kaplı, serin bir asa.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Oasis Staff", weaponType: "staff", weaponSlot: "twoHand",
    weight: 4, element: "ice", attackSpeed: "Çok Yavaş", range: 1,
    levels: [
      staffLevel(87, 0, 8, 0, 90, 6000),    // +1
      staffLevel(91, 0, 16, 0, 94, 7000),   // +2
      staffLevel(95, 1, 24, 1, 98, 8000),   // +3
      staffLevel(99, 2, 32, 2, 102, 9000),  // +4
      staffLevel(103, 3, 40, 3, 106, 10000), // +5
      staffLevel(107, 4, 48, 4, 110, 11000), // +6
      staffLevel(113, 5, 56, 5, 114, 12000), // +7
      staffLevel(122, 6, 64, 7, 118, 13000), // +8
      staffLevel(135, 8, 72, 10, 122, 14000), // +9
      staffLevel(155, 11, 80, 14, 126, 15000), // +10
    ],
  },
  // Chaotic Staff (Unique) — Lightning. Görseli: mor-eflatun yıldırım
  // çatlaklarıyla kaplı, kaotik bir asa.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Chaotic Staff", weaponType: "staff", weaponSlot: "twoHand",
    weight: 4, element: "lightning", attackSpeed: "Çok Yavaş", range: 1,
    levels: [
      staffLevel(87, 0, 8, 0, 90, 6000),    // +1
      staffLevel(91, 0, 16, 0, 94, 7000),   // +2
      staffLevel(95, 1, 24, 1, 98, 8000),   // +3
      staffLevel(99, 2, 32, 2, 102, 9000),  // +4
      staffLevel(103, 3, 40, 3, 106, 10000), // +5
      staffLevel(107, 4, 48, 4, 110, 11000), // +6
      staffLevel(113, 5, 56, 5, 114, 12000), // +7
      staffLevel(122, 6, 64, 7, 118, 13000), // +8
      staffLevel(135, 8, 72, 10, 122, 14000), // +9
      staffLevel(155, 11, 80, 14, 126, 15000), // +10
    ],
  },
];

// Hell Blood / Elysium / Garp (Unique) — Scorching/Oasis/Chaotic Staff'ın
// ikinci "ailesi", kullanıcının deyimiyle "aynı mantıkta": tek fark yine
// element bonusları, geri kalan tüm satırlar üçünde de birebir aynı. Bu
// aile öncekinden farklı bir iskelete oturuyor — sabit +1000/seviye
// dayanıklılık yerine Eagle's Eye/Enion Bow/Helenid'in kullandığı ölçekli
// eğri (9000→14500), ATK eğrisi de Eagle's Eye'la birebir aynı (95→163).
// Ayrıca "Defense Ability" yok, bunun yerine "Intelligence Bonus" (statBonus
// int) + element direnci var — Scorching ailesinin aksine dormant anti-
// melee mekaniği taşımıyor.
//
// "Intelligence Bonus" ve element hasarı satırlarında ekran görüntüsünde
// ortak bir "10" hücresi iki satır arasında paylaşılıyor gibi görünüyordu
// (rowspan/birleşik hücre) — her iki satırın da +1 değeri olarak okundu:
// Intelligence Bonus 10→28 (+2/seviye), element hasarı 10→55 (+5/seviye).
// Bu okuma her iki satırı da tam 10 temiz değere (+1..+10) tamamlıyor,
// hemen altındaki "Resistance to X" satırının (20→38, kusursuz +2/seviye,
// hiç belirsizlik yok) aynı temiz deseniyle tutarlı.
function bloodStaffLevel(atk, intBonus, elementDmg, resKey, res, reqMag, durability) {
  return {
    atk, statBonus: { int: intBonus }, elementBonus: elementDmg,
    resistances: { [resKey]: res },
    reqStats: [{ key: "mag", value: reqMag }, { key: "int", value: 138 }],
    durability,
  };
}

CASTER_WEAPONS.push(
  // Hell Blood (Unique) — Flame. Görseli: kan-kızıl, kafatası-tepelikli
  // koyu bir asa — Scorching Staff'ın sade kristalinden bilinçli olarak
  // daha karanlık/organik.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Hell Blood", weaponType: "staff", weaponSlot: "twoHand",
    weight: 3, element: "flame", attackSpeed: "Çok Yavaş", range: 1,
    levels: [
      bloodStaffLevel(95, 10, 10, "flame", 20, 114, 10000),   // +1
      bloodStaffLevel(99, 12, 15, "flame", 22, 118, 10500),   // +2
      bloodStaffLevel(103, 14, 20, "flame", 24, 122, 11000),  // +3
      bloodStaffLevel(107, 16, 25, "flame", 26, 126, 11500),  // +4
      bloodStaffLevel(111, 18, 30, "flame", 28, 130, 12000),  // +5
      bloodStaffLevel(115, 20, 35, "flame", 30, 134, 12500),  // +6
      bloodStaffLevel(121, 22, 40, "flame", 32, 138, 13000),  // +7
      bloodStaffLevel(130, 24, 45, "flame", 34, 142, 13500),  // +8
      bloodStaffLevel(143, 26, 50, "flame", 36, 146, 14000),  // +9
      bloodStaffLevel(163, 28, 55, "flame", 38, 150, 14500),  // +10
    ],
  },
  // Elysium (Unique) — Lightning. Görseli: mor-eflatun, elektrik çatlaklı
  // zarif bir asa.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Elysium", weaponType: "staff", weaponSlot: "twoHand",
    weight: 3, element: "lightning", attackSpeed: "Çok Yavaş", range: 1,
    levels: [
      bloodStaffLevel(95, 10, 10, "lightning", 20, 114, 10000),   // +1
      bloodStaffLevel(99, 12, 15, "lightning", 22, 118, 10500),   // +2
      bloodStaffLevel(103, 14, 20, "lightning", 24, 122, 11000),  // +3
      bloodStaffLevel(107, 16, 25, "lightning", 26, 126, 11500),  // +4
      bloodStaffLevel(111, 18, 30, "lightning", 28, 130, 12000),  // +5
      bloodStaffLevel(115, 20, 35, "lightning", 30, 134, 12500),  // +6
      bloodStaffLevel(121, 22, 40, "lightning", 32, 138, 13000),  // +7
      bloodStaffLevel(130, 24, 45, "lightning", 34, 142, 13500),  // +8
      bloodStaffLevel(143, 26, 50, "lightning", 36, 146, 14000),  // +9
      bloodStaffLevel(163, 28, 55, "lightning", 38, 150, 14500),  // +10
    ],
  },
  // Garp (Unique) — Glacier (element "ice"). Görseli: buz-beyaz, sivri
  // kristal uçlu soğuk bir asa.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Garp", weaponType: "staff", weaponSlot: "twoHand",
    weight: 3, element: "ice", attackSpeed: "Çok Yavaş", range: 1,
    levels: [
      bloodStaffLevel(95, 10, 10, "glacier", 20, 114, 10000),   // +1
      bloodStaffLevel(99, 12, 15, "glacier", 22, 118, 10500),   // +2
      bloodStaffLevel(103, 14, 20, "glacier", 24, 122, 11000),  // +3
      bloodStaffLevel(107, 16, 25, "glacier", 26, 126, 11500),  // +4
      bloodStaffLevel(111, 18, 30, "glacier", 28, 130, 12000),  // +5
      bloodStaffLevel(115, 20, 35, "glacier", 30, 134, 12500),  // +6
      bloodStaffLevel(121, 22, 40, "glacier", 32, 138, 13000),  // +7
      bloodStaffLevel(130, 24, 45, "glacier", 34, 142, 13500),  // +8
      bloodStaffLevel(143, 26, 50, "glacier", 36, 146, 14000),  // +9
      bloodStaffLevel(163, 28, 55, "glacier", 38, 150, 14500),  // +10
    ],
  },
);

// Prismatic Triad Staff / Ron's Staff — kullanıcı: "hem glacier hem
// lightning hem de flame özelliklerinin olması... her beceriyi
// kullanıyorken güzel hasarlar verebiliyor." Motorumuzda bir eşya şimdiye
// kadar TEK bir `element`/`elementBonus` taşıyabiliyordu — bu iki eşya için
// yeni bir `elements: [{ key, bonus }, ...]` alanı eklendi (bkz.
// utils/upgrade.js#applyLevelData, utils/loot.js#buildWeaponFromTemplate,
// ItemTooltip.jsx — üçü de bu alanı destekleyecek şekilde güncellendi).
// Element anahtarı "glacier" değil "ice" (bkz. data/elements.js#
// ELEMENT_LABELS).
//
// Ekran görüntülerinde Flame/Glacier/Lightning satırlarının hepsinde ayrı
// ayrı sayı yoktu (bazılarında tamamen boştu, bazılarında sadece biri
// doluydu) — ama kullanıcı sözlü olarak "bu iki eşyanın ÖZELLİĞİ üçünün de
// olması" dedi, bu yüzden okunabilen tek eğri (Prismatic Triad Staff'ta
// Glacier, Ron's Staff'ta Flame/Glacier) üç elemente de birebir uygulandı.
//
// İsim "Staff of <selfname>" idi (gerçek KO'nun karakterin kendi adını
// taşıyan özel eşya kalıbı) — kullanıcı sabit bir isim istedi: "Prismatic
// Triad Staff". Required Level 70 de kaldırıldı (kullanıcı: "gerekli
// değil") — artık diğer T6 uniqueler gibi sade reqStats (mag+int).
function selfnameStaffLevel(atk, magBonus, elemVal, resVal, reqMag, durability) {
  return {
    atk, statBonus: { mag: magBonus },
    elements: [
      { key: "flame", bonus: elemVal },
      { key: "ice", bonus: elemVal },
      { key: "lightning", bonus: elemVal },
    ],
    resistances: { flame: resVal, glacier: resVal, lightning: resVal },
    reqStats: [
      { key: "mag", value: reqMag },
      { key: "int", value: 100 },
    ],
    durability,
  };
}

function ronsStaffLevel(atk, dexBonus, magBonus, mpBonus, elemVal, resVal, reqMag, durability) {
  return {
    atk, statBonus: { dex: dexBonus, mag: magBonus }, mp: mpBonus,
    elements: [
      { key: "flame", bonus: elemVal },
      { key: "ice", bonus: elemVal },
      { key: "lightning", bonus: elemVal },
    ],
    resistances: { flame: resVal, glacier: resVal, lightning: resVal },
    reqStats: [{ key: "mag", value: reqMag }, { key: "int", value: 112 }],
    durability,
  };
}

CASTER_WEAPONS.push(
  // Prismatic Triad Staff (Unique) — Tier 6. Kullanıcının sabitlediği isim
  // ("Staff of <selfname>" gerçek KO kalıbından, artık sade bir sabit ad).
  // Görseli: kişiselleştirilmiş, gösterişli bir asa (kullanıcı görselleri
  // sonradan Gemini ile ayrıca yenileyecek).
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Prismatic Triad Staff", weaponType: "staff", weaponSlot: "twoHand",
    weight: 3, attackSpeed: "Çok Yavaş", range: 1,
    levels: [
      selfnameStaffLevel(85, 1, 8, 2, 150, 6000),    // +1
      selfnameStaffLevel(89, 2, 16, 4, 154, 7000),   // +2
      selfnameStaffLevel(93, 3, 24, 6, 158, 8000),   // +3
      selfnameStaffLevel(97, 4, 32, 8, 162, 9000),   // +4
      selfnameStaffLevel(101, 5, 40, 10, 166, 10000), // +5
      selfnameStaffLevel(105, 6, 48, 12, 170, 11000), // +6
      selfnameStaffLevel(111, 7, 56, 14, 174, 12000), // +7
      selfnameStaffLevel(120, 8, 64, 16, 178, 13000), // +8
      selfnameStaffLevel(133, 9, 72, 18, 182, 14000), // +9
      selfnameStaffLevel(153, 10, 80, 20, 186, 15000), // +10
    ],
  },
  // Ron's Staff (Unique) — Tier 6. Dexterity Bonus + Magic Power Bonus + MP
  // (mana havuzu) Bonusu bir arada taşıyan hibrit bir eşya, MP Bonusu
  // ekran görüntüsünde +2'den itibaren başlıyordu (+1'de yok).
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Ron's Staff", weaponType: "staff", weaponSlot: "twoHand",
    weight: 4, attackSpeed: "Çok Yavaş", range: 1,
    levels: [
      ronsStaffLevel(60, 5, 1, 0, 20, 5, 86, 10000),     // +1
      ronsStaffLevel(64, 6, 2, 50, 25, 7, 90, 10500),    // +2
      ronsStaffLevel(68, 7, 3, 80, 30, 9, 94, 11000),    // +3
      ronsStaffLevel(72, 8, 4, 110, 35, 11, 98, 11500),  // +4
      ronsStaffLevel(76, 9, 5, 140, 40, 13, 102, 12000), // +5
      ronsStaffLevel(80, 10, 6, 170, 45, 15, 106, 12500), // +6
      ronsStaffLevel(86, 11, 7, 200, 50, 17, 110, 13000), // +7
      ronsStaffLevel(95, 13, 9, 240, 55, 19, 114, 13500), // +8
      ronsStaffLevel(108, 16, 12, 290, 60, 21, 118, 14000), // +9
      ronsStaffLevel(128, 20, 16, 350, 65, 23, 122, 14500), // +10
    ],
  },
);
