// Accessory catalog — eski hazır liste kullanıcı isteğiyle SİLİNDİ, yerine
// görsel görsel yeniden dolduruluyor (bkz. utils/loot.js#rollAccessory,
// GmItemPanel). Eski katalog
// C:\Users\akcel\Desktop\RPGMarket\_legacy_items_backup\accessories.js'te
// yedekli duruyor, gerekirse referans alınabilir. Tablet branch'inin
// eklediği jenerik "Basit/Gümüş/Oyma/Kristal/Kutsanmış" placeholder seti de
// kullanıcı isteğiyle kaldırıldı.
//
// Takılar artık silah/zırhtan FARKLI bir yükseltme mantığı kullanıyor:
// forge/parşömen yerine, aynı isim+seviyeden 3 takı + 1 Aksesuar Yükseltme
// Kağıdı %100 oranda bir sonraki seviyeye birleşiyor (bkz.
// utils/accessoryUpgrade.js). Bu yüzden +0'da DÜŞEBİLİYORLAR (silah/zırhın
// aksine, bkz. utils/loot.js#rollAccessory'nin applyStartingPlusOne
// SARMAYAN hali) — +0 tablodaki gerçek bir taban durum, "henüz
// yükseltilmemiş" değil "hiç yükseltilmemiş ama tam bir eşya".
// `levels[0]` = +1, ..., `levels[4]` = +5 (silah/zırhla aynı 1-index
// kuralı, bkz. utils/upgrade.js#statsAtLevel). +4/+5 şu an oyunda
// KİLİTLİ (bkz. utils/accessoryUpgrade.js#ACCESSORY_UPGRADE_MAX_LEVEL) —
// kullanıcı: "ama +4 ve +5 yükseltmeler daha sonrasında açılacak."
//
// `defenseAbility`/`attackPowerPct` henüz hiçbir yerde tüketilmeyen DORMANT
// alanlar (Eagle's Eye/Prismatic Triad Staff'taki defenseAbility ile aynı
// desen) — kullanıcı: "Bunun ayarlarını yapacağız tabiki ama sen gördüğün
// her şeyi ekle hazır olsun." Defense Ability, elinde Dagger/Club/Spear
// olan birinden daha az hasar yeme mekaniği olacak (henüz kurulmadı).
export const ACCESSORY_SETS = {
  earring: [],
  necklace: [],
  ring: [],
  belt: [
    {
      // Gerçek görünür tier'ı henüz belirtilmedi (kullanıcı: "ayarlarını
      // yapacağız") — T3 geçici bir yer tutucu, ileride birlikte kesinleşecek.
      tier: 3, name: "String of Skulls", def: 10, hp: 5, statBonus: { str: 5 },
      defenseAbility: { vs: "dagger", value: 5 },
      resistances: { lightning: 30 },
      attackPowerPct: 0,
      levels: [
        { def: 12, hp: 9, statBonus: { str: 9 }, defenseAbility: { vs: "dagger", value: 6 }, resistances: { lightning: 33 }, attackPowerPct: 0.5 }, // +1
        { def: 14, hp: 13, statBonus: { str: 13 }, defenseAbility: { vs: "dagger", value: 8 }, resistances: { lightning: 36 }, attackPowerPct: 0.5 }, // +2
        { def: 16, hp: 17, statBonus: { str: 17 }, defenseAbility: { vs: "dagger", value: 10 }, resistances: { lightning: 39 }, attackPowerPct: 0.5 }, // +3
        { def: 18, hp: 21, statBonus: { str: 21 }, defenseAbility: { vs: "dagger", value: 13 }, resistances: { lightning: 45 }, attackPowerPct: 0.5 }, // +4
        { def: 20, hp: 25, statBonus: { str: 25 }, defenseAbility: { vs: "dagger", value: 17 }, resistances: { lightning: 60 }, attackPowerPct: 0.5 }, // +5
      ],
    },
  ],
};
