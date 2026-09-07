// Accessory catalog — eski hazır liste kullanıcı isteğiyle SİLİNDİ, yerine
// görsel görsel yeniden dolduruluyor (bkz. utils/loot.js#rollAccessory,
// GmItemPanel). Eski katalog
// C:\Users\akcel\Desktop\RPGMarket\_legacy_items_backup\accessories.js'te
// yedekli duruyor, gerekirse referans alınabilir.
//
// Dört slot da TAMAMEN boştu (tüm tier'larda) — rollAccessory her zaman
// null dönüyordu, yani loot ruletinin %28'i (bkz. utils/loot.js#rollLoot)
// hep sessizce "hiç düşmedi" oluyordu. Elimizde gerçek KO'nun decrypted
// aksesuar verisi yok, bu yüzden aşağıdakiler basit, tier'a göre kademeli
// giriş eşyaları — aksesuarlar zaten sınıfa özel değil (bkz.
// utils/loot.js#rollAccessory'nin üstündeki not), o yüzden reqStats
// gerekmiyor.
//
// T2-T5 de sonradan eklendi: kullanıcının bildirdiği "bazı sandıklarda
// siyah bir kutucuk kalıyor" bug'ının ikinci kök nedeni buydu — sadece T1
// doluyken herhangi bir sınıfın T2-T5 bir sandıkta/canavarda aksesuar dalını
// çekmesi rollAccessory'yi null döndürüyordu, ChestModal da null bir
// sonucu boş bir kutu olarak render ediyordu (bkz. ChestModal.jsx
// #düzeltme).
export const ACCESSORY_SETS = {
  earring: [
    { tier: 1, name: "Basit Küpe", hp: 6, statBonus: { sta: 2 } },
    { tier: 2, name: "Gümüş Küpe", hp: 10, statBonus: { sta: 4 } },
    { tier: 3, name: "Oyma Küpe", hp: 14, statBonus: { sta: 6 } },
    { tier: 4, name: "Kristal Küpe", hp: 20, statBonus: { sta: 9 } },
    { tier: 5, name: "Kutsanmış Küpe", hp: 24, statBonus: { sta: 11 } },
  ],
  necklace: [
    { tier: 1, name: "Basit Kolye", hp: 4, statBonus: { str: 1, dex: 1 } },
    { tier: 2, name: "Gümüş Kolye", hp: 7, statBonus: { str: 2, dex: 2 } },
    { tier: 3, name: "Oyma Kolye", hp: 10, statBonus: { str: 3, dex: 3 } },
    { tier: 4, name: "Kristal Kolye", hp: 14, statBonus: { str: 4, dex: 4 } },
    { tier: 5, name: "Kutsanmış Kolye", hp: 17, statBonus: { str: 5, dex: 5 } },
  ],
  ring: [
    { tier: 1, name: "Basit Yüzük", statBonus: { int: 2, mag: 1 } },
    { tier: 2, name: "Gümüş Yüzük", statBonus: { int: 4, mag: 2 } },
    { tier: 3, name: "Oyma Yüzük", statBonus: { int: 6, mag: 3 } },
    { tier: 4, name: "Kristal Yüzük", statBonus: { int: 9, mag: 5 } },
    { tier: 5, name: "Kutsanmış Yüzük", statBonus: { int: 11, mag: 6 } },
  ],
  belt: [
    { tier: 1, name: "Basit Kemer", def: 4 },
    { tier: 2, name: "Gümüş Kemer", def: 7 },
    { tier: 3, name: "Oyma Kemer", def: 10 },
    { tier: 4, name: "Kristal Kemer", def: 14 },
    { tier: 5, name: "Kutsanmış Kemer", def: 17 },
  ],
};
