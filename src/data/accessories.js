// Accessory catalog — eski hazır liste kullanıcı isteğiyle SİLİNDİ, yerine
// görsel görsel yeniden dolduruluyor (bkz. utils/loot.js#rollAccessory,
// GmItemPanel). Eski katalog
// C:\Users\akcel\Desktop\RPGMarket\_legacy_items_backup\accessories.js'te
// yedekli duruyor, gerekirse referans alınabilir.
//
// Dört slot da TAMAMEN boştu (tüm tier'larda) — rollAccessory her zaman
// null dönüyordu, yani loot ruletinin %28'i (bkz. utils/loot.js#rollLoot)
// hep sessizce "hiç düşmedi" oluyordu. Elimizde gerçek KO'nun decrypted
// aksesuar verisi yok, bu yüzden aşağıdakiler ARMOR_SETS'in tier1 def/reqStat
// bandına kalibre edilmiş basit giriş eşyaları — aksesuarlar zaten sınıfa
// özel değil (bkz. utils/loot.js#rollAccessory'nin üstündeki not), o yüzden
// reqStats gerekmiyor. Tier 2-5 hâlâ boş, ayrı bir dolum gerekiyor.
export const ACCESSORY_SETS = {
  earring: [
    { tier: 1, name: "Basit Küpe", hp: 6, statBonus: { sta: 2 } },
  ],
  necklace: [
    { tier: 1, name: "Basit Kolye", hp: 4, statBonus: { str: 1, dex: 1 } },
  ],
  ring: [
    { tier: 1, name: "Basit Yüzük", statBonus: { int: 2, mag: 1 } },
  ],
  belt: [
    { tier: 1, name: "Basit Kemer", def: 4 },
  ],
};
