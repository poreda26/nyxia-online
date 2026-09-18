import { SLOTS } from "../data/armor";
import { WEAPON_TYPE_LABEL } from "../data/warriorWeapons";
import { STAT_LABELS } from "../data/stats";

export const ACCESSORY_SLOT_LABEL = { necklace: "Kolye", belt: "Kemer", ring: "Yüzük", earring: "Küpe" };

// GmItemPanel.jsx'in aksesuar slot seçici dropdown'ı ACCESSORY_SLOT_LABEL'ı
// (ve armor.js#SLOTS'un kendi .label'ını) hâlâ doğrudan kullanıyor — GM/test
// aracı olduğu için (bkz. utils/gmCommands.js'in aynı gerekçesi) bilerek
// Türkçe bırakıldı. Oyuncunun GÖRDÜĞÜ itemSubLabel ise kendi ayrı,
// dil-farkında etiket setini kullanıyor.
const ARMOR_SLOT_LABEL = {
  tr: { head: "Kask", chest: "Göğüslük", legs: "Don/Bacaklık", gauntlets: "Eldiven", boots: "Bot" },
  en: { head: "Helmet", chest: "Chestplate", legs: "Leggings", gauntlets: "Gauntlets", boots: "Boots" },
};
export const PLAYER_ACCESSORY_SLOT_LABEL = {
  tr: ACCESSORY_SLOT_LABEL,
  en: { necklace: "Necklace", belt: "Belt", ring: "Ring", earring: "Earring" },
};

export function itemSubLabel(item, lang = "tr") {
  if (item.kind === "armor") return ARMOR_SLOT_LABEL[lang]?.[item.slot] || SLOTS.find((s) => s.key === item.slot)?.label;
  if (item.kind === "accessory") {
    const locked = lang === "en" ? " · Upgrade locked" : " · Yükseltme kapalı";
    return `${PLAYER_ACCESSORY_SLOT_LABEL[lang][item.slot]}${item.upgradeLocked ? locked : ""}`;
  }
  if (item.kind === "potion") return lang === "en" ? `${item.potionType === "hp" ? "Health" : "Mana"} · T${item.tier}` : `${item.potionType === "hp" ? "Can" : "Mana"} · T${item.tier}`;
  if (item.kind === "scroll") return lang === "en" ? `T${item.tier} Scroll` : `T${item.tier} Parşömen`;
  if (item.kind === "raceScroll") return lang === "en" ? "Race Change" : "Irk Değiştirme";
  if (item.kind === "jobScroll") return lang === "en" ? "Class Change" : "Sınıf Değiştirme";
  if (item.kind === "bonusScroll") return lang === "en" ? "Upgrade Bonus" : "Yükseltme Bonusu";
  if (item.weaponType) return WEAPON_TYPE_LABEL[lang]?.[item.weaponType];
  if (item.weaponSlot === "twoHand") return lang === "en" ? "Two-Handed" : "Çift El";
  if (item.weaponSlot === "mainHand") return lang === "en" ? "Main Hand" : "Ana El";
  return item.isShield ? (lang === "en" ? "Shield" : "Kalkan") : (lang === "en" ? "Off Hand" : "Yardımcı El");
}

// Potions and scrolls are pure consumables — no atk/def/hp stats, so the
// bag detail panel shows just their weight instead of an empty stat line.
export function isConsumable(item) {
  return item.kind === "potion" || item.kind === "scroll" || item.kind === "raceScroll" || item.kind === "jobScroll" || item.kind === "bonusScroll";
}

export function itemStatLabel(item) {
  const bits = [];
  if (item.atk) bits.push(`ATK ${item.atk}`);
  if (item.def) bits.push(`DEF ${item.def}`);
  if (item.hp) bits.push(`HP ${item.hp}`);
  if (item.mp) bits.push(`MP ${item.mp}`);
  if (item.statBonus) {
    Object.entries(item.statBonus).forEach(([key, value]) => {
      if (value) bits.push(`${STAT_LABELS[key]} +${value}`);
    });
  }
  return bits.join(" · ");
}
