// Standalone per-class/slot/tier armor ICON art (420x420, src/assets/items/
// {cls}-t{tier}-{slot}.png) — separate from the big multi-region character
// sprite atlas (src/assets/characters/weapons/*-armor-t{tier}.png, used by
// CharacterFigure.jsx for the worn-on-body preview). These files sat
// unused — ItemIcon.jsx always fell back to the generic ArmorIcon vector
// silhouette for every armor item in the game because nothing ever looked
// them up. Coverage isn't complete: Rogue has all 5 tiers, Warrior only
// has t4/t5 complete (t3 partial: boots+gauntlets only), Mage has none yet
// — armorIconImage returns null for anything missing so ItemIcon can keep
// falling back to the vector icon there.
const images = import.meta.glob("../assets/items/*-t[1-9]-*.png", { eager: true, query: "?url", import: "default" });

export function armorIconImage(cls, slot, tier) {
  return images[`../assets/items/${cls}-t${tier}-${slot}.png`] || null;
}
