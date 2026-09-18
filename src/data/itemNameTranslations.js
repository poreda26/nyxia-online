// English display names for weapon/accessory catalogs whose `name` field is
// Turkish and doubles as an internal lookup key (data/itemImages.js,
// data/starterWeaponArt.js, characterWeaponManifest.json, world/
// warriorVisuals.js's regex alternations) — same constraint as monster
// names (see i18n/sections/monsters.js's note), so the underlying data is
// NEVER renamed. utils/player.js#displayItemName looks names up here at
// render time when lang === "en"; any item without an entry falls back to
// its stored (Turkish) name, so a missed entry never renders blank/broken.
export const WEAPON_NAME_EN = {
  // Warrior (data/warriorWeapons.js)
  "Gökdev Baltası": "Sky Giant's Axe",
  "Kara Diken": "Black Thorn",
  "Yılan Ucu": "Serpent's Tip",
  "Yırtıcı Pençe": "Savage Claw",
  "Ayaz Balta": "Frost Axe",
  "Buzul Kıran": "Glacier Breaker",
  "Ateş Dili": "Tongue of Flame",
  "Serap": "Mirage",
  "Fırtına Ustası": "Storm Master",
  "Cehennem Kıran": "Hellbreaker",
  "Şimşek Yumruğu": "Lightning Fist",
  "Totem Topuzu": "Totem Mace",
  "Kırıcı Gürz": "Crusher Mace",
  "Ağır Çekiç": "Heavy Hammer",
  "Paslı Kılıç": "Rusty Sword",
  "Demir Balta": "Iron Axe",
  // Rogue (data/rogueWeapons.js)
  "Avcı Yayı": "Hunter's Bow",
  "Bambu Yay": "Bamboo Bow",
  "Demir Arbalet": "Iron Crossbow",
  "Zehir Dikeni": "Poison Thorn",
  "Çelik Yay": "Steel Bow",
  "Köz Yayı": "Ember Bow",
  "Yıldırım Teli": "Lightning String",
  "Kartal Bakışı": "Eagle's Gaze",
  "Arbalet": "Crossbow",
  "Boynuz Arbalet": "Horn Crossbow",
  "Ayaz Yayı": "Frost Bow",
  // Mage (data/casterWeapons.js)
  "Tahta Asa": "Wooden Staff",
  "Çırak Asası": "Apprentice Staff",
  "Demir Uçlu Asa": "Iron-Tipped Staff",
  "İpek Sarılı Asa": "Silk-Wrapped Staff",
  "Kızıl Rün Asası": "Crimson Rune Staff",
  "Kabuk Dokuma Asa": "Shellweave Staff",
  "Kavurucu Asa": "Scorching Staff",
  "Buzvaha Asası": "Frost Oasis Staff",
  "Kaos Asası": "Chaos Staff",
  "Cehennem Kanı": "Hellblood Staff",
  "Cennetbahçe": "Heaven's Garden Staff",
  "Poyraz": "Northwind Staff",
  "Gökkuşağı Asası": "Rainbow Staff",
  "Kadim Asa": "Ancient Staff",
  // data/originalWeapons.js#ORIGINAL_WEAPONS — individually authored items
  // folded into BALANCED_WEAPONS (see data/balancedWeapons.js) alongside
  // the 3 catalogs above; each already has an English `id` (e.g.
  // "nyxia_emberfang") the Turkish `name` was built from, so translations
  // here follow that same concept rather than a literal re-translation.
  "Közdiş": "Emberfang",
  "Gökyarık": "Skyrend",
  "Mezarkıran": "Gravebreaker",
  "Çalıpençe": "Briarclaw",
  "Şafak Teli": "Dawnstring",
  "Akrep İğnesi": "Scorpion Sting",
  "Yelkanat": "Windwing",
  "Gece Kirişi": "Nightstring",
  "Gökzıpkın": "Sky Harpoon",
  "Kızıl Hilal": "Crimson Crescent",
  "Fırtına Gözü": "Storm Eye",
  "Çiydalı": "Dewbranch",
  "Kor Feneri": "Ember Lantern",
  "Ay Sarmalı": "Mooncoil",
  "Buz Çanı": "Frostbell",
  "Kum Saati": "Hourglass",
  "Ruh Feneri": "Soullight",
  "Gök Mührü": "Sky Seal",
  "Hiçlik Tacı": "Voidcrown",
  "Güneş Çekirdeği": "Suncore",
};

// data/accessories.js#MAP_ACCESSORIES — the 3 T1/T2 map-drop starter rings
// (family: "starter", not part of the procedural FAMILIES catalog below).
export const STARTER_ACCESSORY_NAME_EN = {
  "Yıpranmış Güç Yüzüğü": "Worn Power Ring",
  "Kül Güç Yüzüğü": "Ash Power Ring",
  "Volkan Güç Yüzüğü": "Volcanic Power Ring",
};

// Flavor/lore text (item.lore, shown in ItemTooltip.jsx below the item
// grade line) — keyed by the same Turkish weapon name as WEAPON_NAME_EN,
// since only T6/unique weapons carry lore.
export const WEAPON_LORE_EN = {
  "Gökdev Baltası": "*Forged by giants, this axe is too heavy to swing with one hand — but for the one who can lift it, it falls as fast as lightning.*",
  "Buzul Kıran": "*It once belonged to a king — now only one as strong as a king can wield it.*",
  "Fırtına Ustası": "*Forged from the storm itself — with every swing, the sky falls silent for a moment.*",
  "Cehennem Kıran": "*Forged in hell's own furnace — every strike snuffs out one more soul.*",
  "Közdiş": "An ember-hardened, notched blade. A power-focused melee sword.",
  "Gökyarık": "A long axe with a broad crescent head. Balanced between health and mana.",
  "Mezarkıran": "A war hammer with a heavy stone head that bolsters endurance.",
  "Çalıpençe": "A light starter bow with a short, thorny frame.",
  "Şafak Teli": "A hunting bow with long, golden limbs and mana support.",
  "Akrep İğnesi": "An attack-focused crossbow with narrow steel arms and a scorpion-shaped frame.",
  "Yelkanat": "A bow with feather-shaped limbs that offers health support.",
  "Gece Kirişi": "A mana-supporting war bow with sharply angled obsidian limbs.",
  "Gökzıpkın": "A heavy, health-supporting crossbow with a round winding mechanism.",
  "Kızıl Hilal": "A high-attack crimson war bow with dragon-scale limbs.",
  "Fırtına Gözü": "A mechanical crossbow with a ring sight, offering health and mana support.",
  "Çiydalı": "Its translucent dewdrop head provides both health and mana support.",
  "Kor Feneri": "An attack-focused staff with a flame-bearing lantern head.",
  "Ay Sarmalı": "Its spiraling moon head offers generous mana support.",
  "Buz Çanı": "A health-focused frost staff with a crystal bell head.",
  "Kum Saati": "A mana-focused staff with a head filled with golden sand.",
  "Ruh Feneri": "The soul-light within its caged head offers health support.",
  "Gök Mührü": "A high-attack staff with a head of three interlocking seals.",
  "Hiçlik Tacı": "Its shattered crown head offers high mana support.",
  "Güneş Çekirdeği": "A staff balanced between attack and mana, with a ray-shaped head.",
};

// data/accessories.js#FAMILIES — procedurally combined with a slot label
// ("${family.names[tier-1]} ${SLOT_LABEL[slot]}") into the stored `name`.
// Every accessory keeps its `family`/`tier`/`slot` fields, so the English
// name is rebuilt the same way from these two small tables instead of
// string-matching the combined Turkish name.
export const ACCESSORY_FAMILY_NAME_EN = {
  guardian: ["Path Guardian", "Rock Guardian", "Fortress Guardian", "Dragon Guardian", "Titan Guardian"],
  ranger: ["Trailblazer", "Ash Hunter", "Night Hunter", "Storm Hunter", "Star Hunter"],
  arcane: ["Apprentice's Arcanum", "Secret Arcanum", "Rune Arcanum", "Crystal Arcanum", "Astral Arcanum"],
};
