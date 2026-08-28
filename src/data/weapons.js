// Per-class weapon catalog. Warriors get the richest set (two-handers,
// dual-wield combos, and a spear+shield tank line); every class has more
// distinct weapon names than there are armor slots (5).
export const WEAPON_CATALOG = {
  warrior: {
    twoHand: ["Geniş Kılıç", "Savaş Baltası", "Savaş Çekici", "İki Elli Mızrak"],
    mainHand: ["Tek Elli Kılıç", "Mızrak", "Savaş Baltası"],
    offHandWeapon: ["Tek Elli Kılıç", "El Baltası", "Hançer"],
    offHandShield: ["Kalkan", "Kule Kalkanı", "Tokmak Kalkan"],
  },
  rogue: {
    twoHand: ["Uzun Yay", "Avcı Yayı", "Savaş Yayı"],
    mainHand: ["Hançer", "Kısa Kılıç"],
    offHandWeapon: ["Hançer", "Kısa Kılıç"],
    offHandShield: [],
  },
  mage: {
    twoHand: ["Büyü Asası", "Arkane Asa", "Kristal Asa"],
    mainHand: ["Değnek"],
    offHandWeapon: ["Büyü Kitabı", "Grimoire", "Kristal Küre"],
    offHandShield: [],
  },
  priest: {
    twoHand: [],
    mainHand: ["Kutsal Çekiç", "Topuz", "Savaş Topuzu", "Asa Değnek"],
    offHandWeapon: ["Kutsal Tılsım"],
    offHandShield: ["Kalkan", "Kutsal Kalkan"],
  },
};
