// Maps each exact weapon name from WEAPON_CATALOG to a mini-icon key
// (see components/icons/WeaponIcon.jsx) so drops render a distinct
// silhouette instead of one generic weapon glyph.
export const WEAPON_ICON_MAP = {
  "Geniş Kılıç": "sword",
  "Tek Elli Kılıç": "sword",
  "Kısa Kılıç": "sword",
  "Savaş Baltası": "axe",
  "El Baltası": "axe",
  "Savaş Çekici": "hammer",
  "Kutsal Çekiç": "hammer",
  "Topuz": "hammer",
  "Savaş Topuzu": "hammer",
  "İki Elli Mızrak": "spear",
  "Mızrak": "spear",
  "Hançer": "dagger",
  "Kalkan": "shield",
  "Kule Kalkanı": "shield",
  "Tokmak Kalkan": "shield",
  "Kutsal Kalkan": "shield",
  "Uzun Yay": "bow",
  "Avcı Yayı": "bow",
  "Savaş Yayı": "bow",
  "Büyü Asası": "staff",
  "Arkane Asa": "staff",
  "Kristal Asa": "staff",
  "Değnek": "staff",
  "Asa Değnek": "staff",
  "Büyü Kitabı": "book",
  "Grimoire": "book",
  "Kristal Küre": "orb",
  "Kutsal Tılsım": "talisman",
};

export function weaponIconKey(baseName) {
  return WEAPON_ICON_MAP[baseName] || "sword";
}
