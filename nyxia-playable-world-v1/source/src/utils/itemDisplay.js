import { SLOTS } from "../data/armor";
import { WEAPON_TYPE_LABEL } from "../data/warriorWeapons";
import { STAT_LABELS } from "../data/stats";

export const ACCESSORY_SLOT_LABEL = { necklace: "Kolye", belt: "Kemer", ring: "Yüzük", earring: "Küpe" };

export function itemSubLabel(item) {
  if (item.kind === "armor") return SLOTS.find((s) => s.key === item.slot)?.label;
  if (item.kind === "accessory") return ACCESSORY_SLOT_LABEL[item.slot];
  if (item.kind === "potion") return `${item.potionType === "hp" ? "Can" : "Mana"} · T${item.tier}`;
  if (item.kind === "scroll") return `T${item.tier} Parşömen`;
  if (item.kind === "raceScroll") return "Irk Değiştirme";
  if (item.kind === "jobScroll") return "Sınıf Değiştirme";
  if (item.kind === "bonusScroll") return "Yükseltme Bonusu";
  if (item.weaponType) return WEAPON_TYPE_LABEL[item.weaponType];
  if (item.weaponSlot === "twoHand") return "Çift El";
  if (item.weaponSlot === "mainHand") return "Ana El";
  return item.isShield ? "Kalkan" : "Yardımcı El";
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
