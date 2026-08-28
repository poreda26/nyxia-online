// Item rarity color scale, keyed by tier. This is what codes ARMOR and
// WEAPON items — separate from the biome color used for regions/monsters.
export const ITEM_TIER_COLORS = {
  1: "#E7E7E4", // white — common
  2: "#3FCB6B", // green — uncommon
  3: "#4A90E2", // blue — rare
  4: "#B368F7", // purple — epic
  5: "#F5A623", // orange — legendary
  6: "#FF8C42", // hot orange — unique (GM-only / one-of-a-kind drops)
};

export function itemTierColor(tierId) { return ITEM_TIER_COLORS[tierId] || "#9CA1B0"; }

export const ITEM_TIER_LABEL = { 1: "Sıradan", 2: "Nadide", 3: "Nadir", 4: "Efsanevi Öncesi", 5: "Efsanevi", 6: "Eşsiz" };

export const TIER_PREFIX = {
  1: ["Sisli", "Puslu", "Solgun"],
  2: ["Külden", "Kavrulmuş", "Volkanik"],
  3: ["Gölgeli", "Karanlık", "Sessiz"],
  4: ["Kristal", "Arkane", "Parıldayan"],
  5: ["Kaotik", "Kıyamet", "Şeytani"],
};
