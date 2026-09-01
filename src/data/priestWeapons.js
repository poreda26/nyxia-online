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
  // Blunt Mace — Wooden Mace'le aynı sebepten (tek tier1 seçenek = her
  // seferinde aynı silah) ikinci bir tier1 alternatif olarak eklendi.
  {
    tier: 1, levelMin: 1, levelMax: 15, name: "Blunt Mace", weaponType: "mace", weaponSlot: "twoHand",
    weight: 11, atk: 36, hp: 12,
    reqStats: [{ key: "str", value: 62 }, { key: "int", value: 34 }],
  },
  // T2-T5 giriş silahları — kullanıcının bildirdiği "bazı sandıklarda siyah
  // bir kutucuk kalıyor" bug'ının kök nedeniydi: bu tablo T1'in HEMEN
  // ÜSTÜNDE (T2-T5) TAMAMEN boştu. Priest bir T2-T5 sandık/canavar
  // dropunda silah dalını çekince rollWeapon null dönüyordu, ChestModal da
  // null bir sonucu boş bir kutu olarak render ediyordu (bkz. ChestModal.jsx
  // #düzeltme). Elimizde gerçek veri yok — reqStats Priest zırhının aynı
  // tier'daki str/int gereksinimiyle (bkz. data/armorSets.js) hizalandı.
  {
    tier: 2, levelMin: 15, levelMax: 25, name: "Silver Mace", weaponType: "mace", weaponSlot: "twoHand",
    weight: 12, atk: 75, hp: 15,
    reqStats: [{ key: "str", value: 70 }, { key: "int", value: 100 }],
  },
  {
    tier: 3, levelMin: 25, levelMax: 40, name: "Consecrated Mace", weaponType: "mace", weaponSlot: "twoHand",
    weight: 13, atk: 90, hp: 20,
    reqStats: [{ key: "str", value: 82 }, { key: "int", value: 124 }],
  },
  {
    tier: 4, levelMin: 40, levelMax: 60, name: "Chitin-Bound Mace", weaponType: "mace", weaponSlot: "twoHand",
    weight: 14, atk: 105, hp: 26,
    reqStats: [{ key: "str", value: 90 }, { key: "int", value: 160 }],
  },
  {
    tier: 5, levelMin: 60, levelMax: 65, name: "Sanctified Mace", weaponType: "mace", weaponSlot: "twoHand",
    weight: 14, atk: 118, hp: 32,
    reqStats: [{ key: "str", value: 94 }, { key: "int", value: 176 }],
  },
];
