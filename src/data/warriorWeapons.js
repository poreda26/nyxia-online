// Warrior weapon catalog — eski hazır liste kullanıcı isteğiyle SİLİNDİ,
// yerine görsel görsel (ekran görüntüsü referans alınarak) yeniden
// dolduruluyor (bkz. utils/loot.js#rollWeapon, GmItemPanel). Eski katalog
// C:\Users\akcel\Desktop\RPGMarket\_legacy_items_backup\warriorWeapons.js'te
// yedekli duruyor, gerekirse referans alınabilir.
export const WEAPON_TYPE_LABEL = {
  dagger: "Hançer", sword: "Kılıç", axe: "Balta", mace: "Balyoz", spear: "Mızrak", longspear: "Uzun Mızrak",
  shield: "Kalkan", bow: "Yay", longbow: "Uzun Yay", staff: "Asa", javelin: "Cirit",
};

export const WEAPON_TYPE_ICON = {
  dagger: "dagger", sword: "sword", axe: "axe", mace: "hammer", spear: "spear", longspear: "spear",
  shield: "shield", bow: "bow", longbow: "bow", staff: "staff", javelin: "spear",
};

// Attack speed and effective range are per weapon-type constants, not
// hand-authored per item — real KO ties both to the weapon's Kind. Long
// Spear (Glave/Glaive family) is real KO's own separate Kind from Spear —
// same "long variant" pattern already used for bow/longbow.
// "axe" burada tek bir gerçek eşyanın (Giantic Axe, çift el) değerlerini
// taşıyor — Slow/1.50, kullanıcının ekran görüntüsünden. "sword" (Durandal)
// ve "mace" (Hell Breaker) da aynı şekilde kendi ilk gerçek eşyalarından
// Slow/1.50 aldı. Not: Türkçe arayüzle tutarlı olsun diye "Slow" değil
// "Yavaş" kullanılıyor — daha önce axe/sword'a yanlışlıkla İngilizce
// "Slow" yazılmıştı, burada düzeltildi.
export const WEAPON_TYPE_SPEED = {
  dagger: "Hızlı", sword: "Yavaş", axe: "Yavaş", mace: "Yavaş", hammer: "Yavaş", spear: "Normal", longspear: "Çok Yavaş",
  shield: "Normal", bow: "Yavaş", longbow: "Yavaş", staff: "Yavaş", javelin: "Normal",
  book: "Yavaş", orb: "Yavaş", talisman: "Normal",
};

export const WEAPON_TYPE_RANGE = {
  dagger: 2.0, sword: 1.5, axe: 1.5, mace: 1.5, hammer: 2.5, spear: 3.5, longspear: 2.0,
  shield: 2.0, bow: 40.0, longbow: 45.0, staff: 3.0, javelin: 12.0,
  book: 3.0, orb: 3.0, talisman: 2.5,
};

// Every point of tier adds 1500 max durability — a T6 unique tops out at
// exactly 9000, matching the reference KO tooltip for a top-end item.
export function weaponDurability(tierId) { return tierId * 1500; }

// Bir eşyanın +1'den +10'a HER seviyesinin gerçek değerini taşıyan satır
// üretici — kullanıcının ekran görüntüsündeki tabloyu birebir kodluyor.
// Durability/Attack Speed/Weight gibi sabit alanlar şablon kökünde kalıyor
// (bkz. GianticAxe objesi), sadece seviyeye göre DEĞİŞEN alanlar burada.
// `resistances` bizim motorumuzda henüz karşılığı olan bir savunma
// mekaniği değil — dormant veri olarak duruyor, ileride bir direnç sistemi
// kurulursa kullanılabilir. NOT: ekran görüntüsünde "Dexterity Bonus"
// yazıyordu ama kullanıcı bunu STR'ye çevirtti — DEX'in Warrior'a bir
// katkısı yok (bkz. utils/player.js#totalStats, ATK'ya küçük bir katkı
// dışında; Warrior'ın asıl gücü STR'de), bu yüzden gerçek tablo yerine
// bilinçli bir sapma.
function gianticAxeLevel(atk, strBonus, hp, lightning, reqStr, resFrom6) {
  return {
    atk, hp, mp: hp, elementBonus: lightning, statBonus: { str: strBonus },
    reqStats: [{ key: "str", value: reqStr }],
    resistances: resFrom6 ? { flame: resFrom6, glacier: resFrom6, lightning: resFrom6 } : { flame: 0, glacier: 0, lightning: 0 },
  };
}

// Statü bonusu/HP/MP vermeyen, sade eşyalar için paylaşılan satır üretici
// (Uzun Mızrak ailesi: Glave/Halberd/Raptor, artık Blade Axe da) —
// dayanıklılığı seviyeyle büyüyor (Giantic Axe'ın aksine sabit değil),
// bkz. kullanıcının ekran görüntüleri. NOT: Glave/Halberd/Raptor'ın
// görüntüsünde "+3 Dayanıklılık" hücresi "1000" gösteriyordu — her diğer
// hücre net +1000 artıyor (8000,9000,[10000],11000...17000), 1000 tek
// başına bu düzenle çelişen bariz bir yazım hatası olduğu için 10000
// olarak düzeltildi (Blade Axe'ın kendi görüntüsünde bu hata yok).
// `itemGrade` gerçek KO'nun Middle/High Class ayrımı — bizim motorumuzda
// henüz karşılığı olan bir mekanik değil, dormant veri.
function simpleWeaponLevel(atk, elementDmg, reqStr, durability, itemGrade) {
  return { atk, elementBonus: elementDmg, reqStats: [{ key: "str", value: reqStr }], durability, itemGrade };
}

// Avedon — kullanıcının ekran görüntüsünde ayrı bir satır olarak "Required
// Health: 80" var (her seviyede sabit) — bizim reqStats sistemimiz normalde
// 5 dağıtılabilir statüden birini kontrol eder, HP bir statü değil türeme
// bir havuz olduğu için özel `key: "hp"` desteği eklendi (bkz.
// utils/player.js#equipItem, data/stats.js#STAT_LABELS). Dayanıklılık da
// (Glave/Halberd/Raptor gibi) her seviyede büyüyor ama Giantic Axe'la aynı
// +500'lük artıştan sonra +1000'e geçiyor (11000,12000,12500,13000...) —
// ekran görüntüsündeki "0" sütunu (11000) bizim +0-doğmaz kuralımızla
// uyuşmadığı için atlandı, "+1" (12000) taban alındı, tıpkı diğer tüm
// eşyalarda olduğu gibi.
function avedonLevel(atk, hp, glacier, reqStr, durability) {
  return {
    atk, hp, mp: hp, elementBonus: glacier,
    reqStats: [{ key: "str", value: reqStr }, { key: "hp", value: 80 }],
    durability,
  };
}

// Stormweaver — "Two-handed Sword of <selfname>" gerçek KO'nun oyuncu
// tarafından isimlendirilebilen özel silah şablonu (<selfname> yer
// tutucusu); kullanıcı bu şablonu "Stormweaver" adıyla somutlaştırdı.
// STR Bonus VE Health Bonus aynı satırda gösterildiği için (kullanıcının
// notu) ikisi de aynı ham değeri alıyor — düz +1 statü puanı gibi, +1'de
// 1 → +10'da 10. Sadece Glacier direnci var (Flame/Lightning satırları
// boştu) ve Avedon'un aksine +1'den itibaren aktif, +6'ya kadar
// beklemiyor. Dayanıklılık Mirage/Durandal gibi seviyeyle büyüyor
// (Giantic Axe/Avedon'un aksine sabit değil).
function stormweaverLevel(atk, bonus, lightning, reqStr, durability, glacierRes) {
  return {
    atk, hp: bonus, statBonus: { str: bonus }, elementBonus: lightning,
    reqStats: [{ key: "str", value: reqStr }],
    resistances: { flame: 0, glacier: glacierRes, lightning: 0 },
    durability,
  };
}

// Hell Breaker — ekran görüntüsünde "Intelligence Bonus" yazıyordu ama
// kullanıcı bunu STR'ye çevirtti (aynı Giantic Axe'taki DEX→STR
// düzeltmesi gibi) — parametre adı buna göre. HP/MP bonusu veya direnç
// satırı yok (Stormweaver/Avedon'un aksine), sadece atk+statBonus+
// element+reqStr+büyüyen dayanıklılık.
function hellBreakerLevel(atk, strBonus, flame, reqStr, durability) {
  return {
    atk, statBonus: { str: strBonus }, elementBonus: flame,
    reqStats: [{ key: "str", value: reqStr }],
    durability,
  };
}

export const WARRIOR_WEAPONS = [
  // Giantic Axe — kullanıcının isteğiyle YENİDEN tasarlandı: eski hali
  // (tek el, yan el/offHand slotu, Mızrak'ın yanında ikinci silah olarak)
  // tamamen kaldırıldı — oyun artık tek silah slotlu (bkz.
  // utils/player.js#equipItem, data/paperdoll.js). Yeni hali çift el
  // (twoHand), "Axe" kategorisinde, T6 Eşsiz. Aynı pixel-art görseli
  // (src/assets/items/giantic-axe.svg, isim aynı kaldığı için
  // data/itemImages.js'te değişiklik gerekmedi). Kullanıcının ekran
  // görüntüsündeki +1'den +10'a TAM tablo birebir girildi (levels dizisi,
  // bkz. utils/upgrade.js#statsAtLevel/applyLevelData). Durability 15000 ve
  // Ağırlık 12.00 her seviyede sabit. Oyunun asıl forge tavanı hâlâ +8
  // (MAX_UPGRADE_LEVEL) — +9/+10 verisi burada duruyor ama GmItemPanel
  // dışında normal forge ile henüz erişilemiyor. Tier 6 eşyalar takas/satış
  // edilebilir (kullanıcının kuralı) — noTrade yok.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Giantic Axe", weaponType: "axe", weaponSlot: "twoHand",
    durability: 15000, weight: 12, element: "lightning",
    lore: "*Devlerin dövdüğü bu balta, tek elle savrulacak kadar hafif değil — ama onu kaldırabilen için yıldırım kadar hızlı düşer.*",
    levels: [
      gianticAxeLevel(134, 5, 100, 50, 142),   // +1
      gianticAxeLevel(140, 6, 130, 60, 143),   // +2
      gianticAxeLevel(146, 7, 160, 70, 144),   // +3
      gianticAxeLevel(152, 8, 190, 80, 145),   // +4
      gianticAxeLevel(158, 9, 220, 90, 146),   // +5
      gianticAxeLevel(164, 10, 250, 100, 147, 10), // +6
      gianticAxeLevel(172, 11, 280, 110, 148, 15), // +7
      gianticAxeLevel(184, 12, 310, 120, 149, 20), // +8
      gianticAxeLevel(202, 13, 350, 130, 150, 25), // +9
      gianticAxeLevel(232, 14, 400, 140, 151, 30), // +10
    ],
  },
  // Uzun Mızrak (Long Spear) — sadece Warrior, iki elle kullanılıyor
  // (twoHand), "Normal" kalite (Unique değil — bu yüzden lore yok, diğer
  // tüm eşyalar gibi takas/satış/forge edilebilir). Kullanıcının ekran
  // görüntüsündeki +1'den +10'a TAM tablo birebir girildi. Tier 3
  // (kullanıcının düzeltmesi). Attack Speed "Very Slow" ve Menzil 2.00
  // real KO'nun Spear'dan ayrı "Long Spear" Kind'ına özel — bkz. yukarıdaki
  // WEAPON_TYPE_* tablolarına eklenen "longspear" girdisi (bow/longbow'daki
  // aynı desen).
  {
    tier: 3, levelMin: 30, levelMax: 45, name: "Glave", weaponType: "longspear", weaponSlot: "twoHand",
    weight: 15, element: "poison",
    levels: [
      simpleWeaponLevel(127, 10, 190, 8000),   // +1
      simpleWeaponLevel(133, 20, 194, 9000),   // +2
      simpleWeaponLevel(139, 30, 198, 10000),  // +3
      simpleWeaponLevel(145, 40, 202, 11000),  // +4
      simpleWeaponLevel(151, 50, 206, 12000),  // +5
      simpleWeaponLevel(157, 60, 210, 13000),  // +6
      simpleWeaponLevel(165, 70, 214, 14000),  // +7
      simpleWeaponLevel(177, 80, 218, 15000),  // +8
      simpleWeaponLevel(195, 90, 222, 16000),  // +9
      simpleWeaponLevel(225, 100, 226, 17000), // +10
    ],
  },
  // Halberd — Glave'in aynı ailesinden (Long Spear), Tier 2. Kullanıcının
  // ekran görüntüsündeki +1'den +10'a TAM tablo birebir girildi. "Item
  // Grade" satırı +1..+7 "Middle Class", +8..+10 "High Class" — itemGrade
  // olarak dormant veri (bkz. longspearLevel).
  {
    tier: 2, levelMin: 15, levelMax: 30, name: "Halberd", weaponType: "longspear", weaponSlot: "twoHand",
    weight: 15, element: "poison",
    levels: [
      simpleWeaponLevel(107, 10, 168, 8000, "middle"),   // +1
      simpleWeaponLevel(113, 20, 172, 9000, "middle"),   // +2
      simpleWeaponLevel(119, 30, 176, 10000, "middle"),  // +3
      simpleWeaponLevel(125, 40, 180, 11000, "middle"),  // +4
      simpleWeaponLevel(131, 50, 184, 12000, "middle"),  // +5
      simpleWeaponLevel(137, 60, 188, 13000, "middle"),  // +6
      simpleWeaponLevel(145, 70, 192, 14000, "middle"),  // +7
      simpleWeaponLevel(157, 80, 196, 15000, "high"),    // +8
      simpleWeaponLevel(175, 90, 200, 16000, "high"),    // +9
      simpleWeaponLevel(205, 100, 204, 17000, "high"),   // +10
    ],
  },
  // Raptor — kullanıcının kendi sözleriyle oyunun en ikonik silahlarından
  // biri, Warrior'ın en yüksek ATK'lı silahlarından (T5, +10'da 235 —
  // şu ana kadarki her şeyden yüksek: Giantic Axe 121, Glave 225,
  // Halberd 205). Aynı Long Spear ailesi (Glave/Halberd) ama kendine özel,
  // daha detaylı bir pixel-art aldı (bkz. src/assets/items/raptor.svg —
  // pençe biçimli kavisli kama, altın kenar çizgisi, kırmızı göz taşı).
  // Kullanıcının ekran görüntüsündeki +1'den +10'a TAM tablo birebir
  // girildi (aynı +3 dayanıklılık yazım hatası düzeltmesi burada da var).
  {
    tier: 5, levelMin: 55, levelMax: 65, name: "Raptor", weaponType: "longspear", weaponSlot: "twoHand",
    weight: 15, element: "poison",
    levels: [
      simpleWeaponLevel(137, 10, 200, 8000),   // +1
      simpleWeaponLevel(143, 20, 204, 9000),   // +2
      simpleWeaponLevel(149, 30, 208, 10000),  // +3
      simpleWeaponLevel(155, 40, 212, 11000),  // +4
      simpleWeaponLevel(161, 50, 216, 12000),  // +5
      simpleWeaponLevel(167, 60, 220, 13000),  // +6
      simpleWeaponLevel(175, 70, 224, 14000),  // +7
      simpleWeaponLevel(187, 80, 228, 15000),  // +8
      simpleWeaponLevel(205, 90, 232, 16000),  // +9
      simpleWeaponLevel(235, 100, 236, 17000), // +10
    ],
  },
  // Blade Axe — Giantic Axe ile aynı kategori (Axe, çift el) ama
  // kullanıcının isteğiyle bilinçli olarak FARKLI bir pixel-art aldı: tek
  // geniş düz bıçaklı bir savaş baltası, buzul mavisi tonlarda (bkz.
  // src/assets/items/blade-axe.svg) — Giantic Axe'ın çift kanatlı/mor-
  // altın tasarımından ayrışsın diye. Tier 4, "Normal" kalite. Kullanıcının
  // ekran görüntüsündeki +1'den +10'a TAM tablo birebir girildi — bu
  // sefer +3 dayanıklılık hücresinde yazım hatası YOK (7000→16000 düz
  // +1000). "Glacier Damage" bizim element sistemimizde "ice" karşılığı.
  {
    tier: 4, levelMin: 45, levelMax: 55, name: "Blade Axe", weaponType: "axe", weaponSlot: "twoHand",
    weight: 12, element: "ice",
    levels: [
      simpleWeaponLevel(117, 10, 172, 7000),   // +1
      simpleWeaponLevel(123, 20, 176, 8000),   // +2
      simpleWeaponLevel(129, 30, 180, 9000),   // +3
      simpleWeaponLevel(135, 40, 184, 10000),  // +4
      simpleWeaponLevel(141, 50, 188, 11000),  // +5
      simpleWeaponLevel(147, 60, 192, 12000),  // +6
      simpleWeaponLevel(155, 70, 196, 13000),  // +7
      simpleWeaponLevel(167, 80, 200, 14000),  // +8
      simpleWeaponLevel(185, 90, 204, 15000),  // +9
      simpleWeaponLevel(215, 100, 208, 16000), // +10
    ],
  },
  // Avedon — kullanıcının kendi sözleriyle "oldukça değerli" bir T6 Eşsiz.
  // Aynı Axe kategorisi (Giantic Axe/Blade Axe) ama kendine has, en detaylı
  // pixel-art'ı aldı (bkz. src/assets/items/avedon.svg — simetrik çift
  // kanat, lacivert-altın kraliyet paleti, ortada büyüyen mavi güç taşı).
  // Ağırlığı (80) diğer tüm Axe'lardan (12) kat kat fazla — bu ağırlığı
  // taşıyabilmek ciddi bir STR yatırımı gerektiriyor, tam "değerli/zor
  // kazanılan eşya" hissi. Kullanıcının ekran görüntüsündeki +1'den +10'a
  // TAM tablo birebir girildi.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Avedon", weaponType: "axe", weaponSlot: "twoHand",
    weight: 80, element: "ice",
    lore: "*Bir zamanlar bir kralın elindeydi — şimdi onu ancak bir kral kadar güçlü olan kaldırabilir.*",
    levels: [
      avedonLevel(134, 50, 20, 188, 12000),   // +1
      avedonLevel(140, 75, 30, 192, 12500),   // +2
      avedonLevel(146, 100, 40, 196, 13000),  // +3
      avedonLevel(152, 125, 50, 200, 13500),  // +4
      avedonLevel(158, 150, 60, 204, 14000),  // +5
      avedonLevel(164, 175, 70, 208, 14500),  // +6
      avedonLevel(172, 200, 80, 212, 15000),  // +7
      avedonLevel(184, 225, 90, 216, 15500),  // +8
      avedonLevel(202, 250, 100, 220, 16000), // +9
      avedonLevel(232, 275, 110, 224, 16500), // +10
    ],
  },
  // Durandal — kataloğumuzdaki ilk "Sword" kategorisi eşya, bu yüzden
  // WEAPON_TYPE_SPEED/RANGE.sword'u da (Slow/1.50) buradan aldı — Giantic
  // Axe'ın "axe" tipini ilk kez tanımlamasıyla aynı desen. Tier 3, "Normal"
  // kalite, tek el (mainHand). Kullanıcının ekran görüntüsündeki +1'den
  // +10'a TAM tablo birebir girildi — yazım hatası yok, düz +1000
  // dayanıklılık artışı. Kendine özel, klasik dikey kılıç silüetinde bir
  // pixel-art aldı (bkz. src/assets/items/durandal.svg — alev turuncusu
  // parıltılı, Flame Damage temasına uygun).
  {
    tier: 3, levelMin: 30, levelMax: 45, name: "Durandal", weaponType: "sword", weaponSlot: "mainHand",
    weight: 10, element: "flame",
    levels: [
      simpleWeaponLevel(112, 10, 166, 5000),   // +1
      simpleWeaponLevel(118, 20, 170, 6000),   // +2
      simpleWeaponLevel(124, 30, 174, 7000),   // +3
      simpleWeaponLevel(130, 40, 178, 8000),   // +4
      simpleWeaponLevel(136, 50, 182, 9000),   // +5
      simpleWeaponLevel(142, 60, 186, 10000),  // +6
      simpleWeaponLevel(150, 70, 190, 11000),  // +7
      simpleWeaponLevel(162, 80, 194, 12000),  // +8
      simpleWeaponLevel(180, 90, 198, 13000),  // +9
      simpleWeaponLevel(210, 100, 202, 14000), // +10
    ],
  },
  // Mirage — Durandal'ın aynı ailesinden (Sword, tek el), Tier 5. Kullanıcı
  // "güzel bir görsel" istediği için Durandal'ın düz bıçağından bilinçli
  // olarak ayrışan, eğri bir saber tasarladım — parlak mor-mavi-gümüş bir
  // "serap" ışıltısı, ince bir alev kenar parıltısıyla (bkz.
  // src/assets/items/mirage.svg). Kullanıcının ekran görüntüsündeki
  // +1'den +10'a TAM tablo birebir girildi.
  {
    tier: 5, levelMin: 55, levelMax: 65, name: "Mirage", weaponType: "sword", weaponSlot: "mainHand",
    weight: 10, element: "flame",
    levels: [
      simpleWeaponLevel(123, 10, 178, 5000),   // +1
      simpleWeaponLevel(129, 20, 182, 6000),   // +2
      simpleWeaponLevel(135, 30, 186, 7000),   // +3
      simpleWeaponLevel(141, 40, 190, 8000),   // +4
      simpleWeaponLevel(147, 50, 194, 9000),   // +5
      simpleWeaponLevel(153, 60, 198, 10000),  // +6
      simpleWeaponLevel(161, 70, 202, 11000),  // +7
      simpleWeaponLevel(173, 80, 206, 12000),  // +8
      simpleWeaponLevel(191, 90, 210, 13000),  // +9
      simpleWeaponLevel(221, 100, 214, 14000), // +10
    ],
  },
  // Stormweaver — kullanıcının kendi sözleriyle "çok güçlü" bir T6 Eşsiz,
  // Mirage'ın çift-el/ihtişamlı versiyonu. Görseli bilinçli olarak Mirage'ı
  // büyütüp fırtına/yıldırım temasına (bkz. src/assets/items/
  // stormweaver.svg — elektrik mavisi-beyaz enerji, altın el siperi,
  // parlayan yıldırım çekirdeği) çevirdi. Kullanıcının ekran görüntüsündeki
  // +1'den +10'a TAM tablo birebir girildi.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Stormweaver", weaponType: "sword", weaponSlot: "twoHand",
    weight: 10, element: "lightning",
    lore: "*Fırtınanın kendisinden dövülmüş — her savuruşunda gökyüzü bir an için susar.*",
    levels: [
      stormweaverLevel(134, 1, 10, 200, 5000, 2),    // +1
      stormweaverLevel(140, 2, 20, 204, 6000, 4),    // +2
      stormweaverLevel(146, 3, 30, 208, 7000, 6),    // +3
      stormweaverLevel(152, 4, 40, 212, 8000, 8),    // +4
      stormweaverLevel(158, 5, 50, 216, 9000, 10),   // +5
      stormweaverLevel(164, 6, 60, 220, 10000, 12),  // +6
      stormweaverLevel(172, 7, 70, 224, 11000, 14),  // +7
      stormweaverLevel(184, 8, 80, 228, 12000, 16),  // +8
      stormweaverLevel(202, 9, 90, 232, 13000, 18),  // +9
      stormweaverLevel(232, 10, 100, 236, 14000, 20), // +10
    ],
  },
  // Hell Breaker — kullanıcının kendi sözleriyle "oldukça epik ve ikonik"
  // bir T6 Eşsiz, Club (Balyoz) kategorisi. Bu yüzden özenle, diğer T6
  // eşyalardan (Giantic Axe'ın mor-altın, Avedon'un lacivert-altın,
  // Stormweaver'ın mavi-beyaz) bilinçli olarak ayrışan cehennemi bir
  // renk şemasıyla tasarlandı: dikenli, kafatası motifli, için için yanan
  // kor-kırmızı bir savaş topuzu (bkz. src/assets/items/hell-breaker.svg).
  // Ekran görüntüsünde "Intelligence Bonus" yazıyordu ama kullanıcı
  // "değişecek tek şey INT yerine STR bonusu" dedi — aynı sayılar (5→30),
  // sadece STR'ye bağlandı. Kullanıcının ekran görüntüsündeki +1'den
  // +10'a TAM tablo birebir girildi.
  {
    tier: 6, levelMin: 60, levelMax: 65, name: "Hell Breaker", weaponType: "mace", weaponSlot: "twoHand",
    weight: 16, element: "flame",
    lore: "*Cehennemin kendi demirhanesinde dövüldü — her darbesi bir ruhu daha söndürür.*",
    levels: [
      hellBreakerLevel(131, 5, 50, 150, 15000),   // +1
      hellBreakerLevel(137, 7, 65, 154, 15500),   // +2
      hellBreakerLevel(143, 9, 80, 158, 16000),   // +3
      hellBreakerLevel(149, 11, 95, 162, 16500),  // +4
      hellBreakerLevel(155, 13, 110, 166, 17000), // +5
      hellBreakerLevel(161, 15, 125, 170, 17500), // +6
      hellBreakerLevel(169, 17, 140, 174, 18000), // +7
      hellBreakerLevel(181, 20, 155, 178, 18500), // +8
      hellBreakerLevel(199, 24, 170, 182, 19000), // +9
      hellBreakerLevel(229, 30, 185, 186, 19500), // +10
    ],
  },
  // Iron Impact — Hell Breaker'ın aynı kategorisi (Club/Balyoz, çift el)
  // ama kullanıcının isteğiyle bilinçli olarak FARKLI bir pixel-art aldı:
  // Hell Breaker'ın dikenli/kafatası/kor-kırmızı cehennemi temasından
  // ayrışan, sade ve endüstriyel bir demir flanşlı gürz, çelik-gri gövde,
  // çatırdayan sarı-beyaz yıldırım enerjisiyle (bkz. src/assets/items/
  // iron-impact.svg). Tier 5, "Normal" kalite (Hell Breaker gibi Eşsiz
  // değil — bu yüzden lore/statBonus yok, sade simpleWeaponLevel yeterli).
  // Kullanıcının ekran görüntüsündeki +1'den +10'a TAM tablo birebir
  // girildi — Gerekli STR bu sefer +2/seviye artıyor (diğer çoğu eşyada
  // +4'tü), tabloya sadık kalındı.
  {
    tier: 5, levelMin: 55, levelMax: 65, name: "Iron Impact", weaponType: "mace", weaponSlot: "twoHand",
    weight: 14, element: "lightning",
    levels: [
      simpleWeaponLevel(130, 10, 176, 10000),  // +1
      simpleWeaponLevel(136, 20, 178, 11000),  // +2
      simpleWeaponLevel(142, 30, 180, 12000),  // +3
      simpleWeaponLevel(148, 40, 182, 13000),  // +4
      simpleWeaponLevel(154, 50, 184, 14000),  // +5
      simpleWeaponLevel(160, 60, 186, 15000),  // +6
      simpleWeaponLevel(168, 70, 188, 16000),  // +7
      simpleWeaponLevel(180, 80, 190, 17000),  // +8
      simpleWeaponLevel(198, 90, 192, 18000),  // +9
      simpleWeaponLevel(228, 100, 194, 19000), // +10
    ],
  },
  // Totamic Club — Iron Impact/Hell Breaker'ın aynı kategorisi (Club/
  // Balyoz, çift el) ama üçünden de ayrışan üçüncü bir stil: oyulmuş
  // ahşap bir kabile topuzu, totem oymaları, tüy püskülü, kemik süsü
  // (bkz. src/assets/items/totamic-club.svg) — Iron Impact'in
  // endüstriyel çeliğinden ve Hell Breaker'ın cehennemi metalinden
  // bilinçli olarak farklı. Tier 3, "Normal" kalite. Kullanıcının ekran
  // görüntüsündeki +1'den +10'a TAM tablo birebir girildi — Gerekli STR
  // yine +2/seviye (Iron Impact'le aynı oran).
  {
    tier: 3, levelMin: 30, levelMax: 45, name: "Totamic Club", weaponType: "mace", weaponSlot: "twoHand",
    weight: 14, element: "lightning",
    levels: [
      simpleWeaponLevel(117, 10, 164, 10000),  // +1
      simpleWeaponLevel(123, 20, 166, 11000),  // +2
      simpleWeaponLevel(129, 30, 168, 12000),  // +3
      simpleWeaponLevel(135, 40, 170, 13000),  // +4
      simpleWeaponLevel(141, 50, 172, 14000),  // +5
      simpleWeaponLevel(147, 60, 174, 15000),  // +6
      simpleWeaponLevel(155, 70, 176, 16000),  // +7
      simpleWeaponLevel(167, 80, 178, 17000),  // +8
      simpleWeaponLevel(185, 90, 180, 18000),  // +9
      simpleWeaponLevel(215, 100, 182, 19000), // +10
    ],
  },
  // Large Hacker — Club ailesinin dördüncü üyesi (Hell Breaker/Iron
  // Impact/Totamic Club ile aynı Durability/Weight/Lightning kalıbı,
  // sadece tier'a göre atk/reqStr ölçekleniyor) — kullanıcı bu turda
  // kategoriyi tekrar yazmadı ama tablo deseni (Dayanıklılık 10000-19000,
  // Ağırlık 14.00, Yıldırım Hasarı 10-100, +2/seviye ReqStr) birebir aynı
  // aile, bu yüzden yine "mace"/twoHand. Tier 2, "Normal" kalite. Kendine
  // özel geniş düz yüzeyli, "Hacker" adına uygun keskin köşeli bir savaş
  // çekici tasarlandı (bkz. src/assets/items/large-hacker.svg) — diğer
  // üç Club'dan farklı bir silüet. Kullanıcının ekran görüntüsündeki
  // +1'den +10'a TAM tablo birebir girildi.
  {
    tier: 2, levelMin: 15, levelMax: 30, name: "Large Hacker", weaponType: "mace", weaponSlot: "twoHand",
    weight: 14, element: "lightning",
    levels: [
      simpleWeaponLevel(107, 10, 154, 10000),  // +1
      simpleWeaponLevel(113, 20, 156, 11000),  // +2
      simpleWeaponLevel(119, 30, 158, 12000),  // +3
      simpleWeaponLevel(125, 40, 160, 13000),  // +4
      simpleWeaponLevel(131, 50, 162, 14000),  // +5
      simpleWeaponLevel(137, 60, 164, 15000),  // +6
      simpleWeaponLevel(145, 70, 166, 16000),  // +7
      simpleWeaponLevel(157, 80, 168, 17000),  // +8
      simpleWeaponLevel(175, 90, 170, 18000),  // +9
      simpleWeaponLevel(205, 100, 172, 19000), // +10
    ],
  },
  // Weight Hammer — Club ailesinin beşinci üyesi, Tier 1 (giriş seviyesi).
  // Aynı Durability/Weight/Lightning kalıbı (10000-19000 / 14.00 / 10-100)
  // ama ATK eğrisi diğerlerinden farklı: ilk 5 seviye +6/adım, sonra
  // +8/+12/+18/+30 şeklinde hızlanıyor (48,54,60,66,72,78,86,98,116,146) —
  // kullanıcının ekran görüntüsündeki tabloya birebir. Gerekli STR yine
  // +2/seviye ama en düşük tabanla başlıyor (114), ailenin en giriş
  // seviyesi silahı olduğunu yansıtıyor.
  {
    tier: 1, levelMin: 1, levelMax: 15, name: "Weight Hammer", weaponType: "mace", weaponSlot: "twoHand",
    weight: 14, element: "lightning",
    levels: [
      simpleWeaponLevel(48, 10, 114, 10000),   // +1
      simpleWeaponLevel(54, 20, 116, 11000),   // +2
      simpleWeaponLevel(60, 30, 118, 12000),   // +3
      simpleWeaponLevel(66, 40, 120, 13000),   // +4
      simpleWeaponLevel(72, 50, 122, 14000),   // +5
      simpleWeaponLevel(78, 60, 124, 15000),   // +6
      simpleWeaponLevel(86, 70, 126, 16000),   // +7
      simpleWeaponLevel(98, 80, 128, 17000),   // +8
      simpleWeaponLevel(116, 90, 130, 18000),  // +9
      simpleWeaponLevel(146, 100, 132, 19000), // +10
    ],
  },
];

// Shields — real KO's Kind 60, off-hand only, pure defense. Eski hazır
// liste silindi, görsel görsel yeniden dolduruluyor (bkz. yukarıdaki not).
export const WARRIOR_SHIELDS = [];
