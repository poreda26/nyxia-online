// All 75 class/tier/slot combinations have inventory art. Missing originals
// were designed from worn armor references and exported by scripts/build-armor-icons.mjs.
const images = import.meta.glob("../assets/items/*-t[1-9]-*.png", { eager: true, query: "?url", import: "default" });
export function armorIconImage(cls, slot, tier) {
  return images[`../assets/items/${cls}-t${tier}-${slot}.png`] || null;
}
