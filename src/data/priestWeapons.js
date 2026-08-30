// Priest weapon catalog (Sword/Mace, "paper attacker" — bkz. eski dosyanın
// yorumu) — eski hazır liste kullanıcı isteğiyle SİLİNDİ, yerine görsel
// görsel yeniden dolduruluyor (bkz. utils/loot.js#rollWeapon, GmItemPanel).
// Eski katalog
// C:\Users\akcel\Desktop\RPGMarket\_legacy_items_backup\priestWeapons.js'te
// yedekli duruyor, gerekirse referans alınabilir.
//
// Wooden Mace — Tier 1 giriş silahı. Kullanıcı testinde ortaya çıktı: bu
// tablo TAMAMEN boştu (tüm tier'larda), yani Priest'in canavarlardan HİÇ
// silah düşmüyordu. Elimizde gerçek KO'nun decrypted Priest verisi yok, bu
// yüzden Warrior'ın aynı bantındaki Weight Hammer'a (mace, twoHand) yakın
// bir güçte ama Priest'in düşük ReqStr'ine göre kalibre edilmiş basit bir
// giriş eşyası — sabit tek satır (levels dizisi yok, forge'un ×1.18
// tahminiyle yükseliyor). Tier 2-6 hâlâ boş, ayrı bir dolum gerekiyor.
export const PRIEST_WEAPONS = [
  {
    tier: 1, levelMin: 1, levelMax: 15, name: "Wooden Mace", weaponType: "mace", weaponSlot: "twoHand",
    weight: 10, atk: 40, hp: 8,
    reqStats: [{ key: "str", value: 55 }, { key: "int", value: 40 }],
  },
];
