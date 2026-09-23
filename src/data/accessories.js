// Universal accessory catalog. Every class can equip every entry. Three
// identical accessories at the same + level merge into the next level.
const SLOT_LABEL = { earring: "Küpe", necklace: "Kolye", ring: "Yüzük", belt: "Kemer" };

const FAMILIES = [
  { key: "guardian", names: ["Yol Muhafızı", "Kaya Muhafızı", "Kale Muhafızı", "Ejder Muhafızı", "Titan Muhafızı"], statBonus: (n) => ({ str: n }) },
  { key: "ranger", names: ["İz Sürücü", "Kül Avcısı", "Gece Avcısı", "Fırtına Avcısı", "Yıldız Avcısı"], statBonus: (n) => ({ dex: n }) },
  { key: "arcane", names: ["Çırak Arkanı", "Sır Arkanı", "Rün Arkanı", "Kristal Arkanı", "Astral Arkanı"], statBonus: (n) => ({ int: n, mag: n }) },
];

const SLOT_SCALE = { earring: 0.85, necklace: 1.2, ring: 1, belt: 1.1 };
const round = (n) => Math.max(1, Math.round(n));
const scaleStats = (stats, factor) => Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, round(value * factor)]));

function statLine(tier, family, slot, level = 0) {
  const scale = SLOT_SCALE[slot];
  const statBase = tier + level * 0.55;
  return {
    def: round((tier * 2 + level * 1.4) * scale), hp: round((tier * 6 + level * 4) * scale),
    mp: family.key === "arcane" ? round((tier * 5 + level * 3) * scale) : 0,
    statBonus: scaleStats(family.statBonus(statBase), scale),
  };
}

function makeAccessory(family, slot, tier) {
  return {
    ...statLine(tier, family, slot), tier, slot, family: family.key,
    name: `${family.names[tier - 1]} ${SLOT_LABEL[slot]}`,
    levels: [1, 2, 3, 4, 5].map((level) => statLine(tier, family, slot, level)),
  };
}

function catalogFor(slot) {
  return FAMILIES.flatMap((family) => [1, 2, 3, 4, 5].map((tier) => makeAccessory(family, slot, tier)));
}

export const ACCESSORY_SETS = { earring: catalogFor("earring"), necklace: catalogFor("necklace"), ring: catalogFor("ring"), belt: catalogFor("belt") };

// T1/T2 map drops: intentionally modest, STR-only and permanently locked.
export const MAP_ACCESSORIES = [
  { tier: 1, mapTier: 1, slot: "ring", family: "starter", name: "Yıpranmış Güç Yüzüğü", def: 1, hp: 3, mp: 0, statBonus: { str: 6 }, upgradeLocked: true },
  { tier: 2, mapTier: 2, slot: "ring", family: "starter", name: "Kül Güç Yüzüğü", def: 2, hp: 5, mp: 0, statBonus: { str: 7 }, upgradeLocked: true },
  { tier: 2, mapTier: 2, slot: "ring", family: "starter", name: "Volkan Güç Yüzüğü", def: 2, hp: 6, mp: 0, statBonus: { str: 8 }, upgradeLocked: true },
];

// PvP specializations trade raw stats for protection against ONE weapon family.
// Values are defense points: points/(100+points), capped at 25% per attack.
const WARDS=[
 {key:'sword',name:'Kesik Ay',stat:'str'}, {key:'axe',name:'Kırılmaz Mühür',stat:'sta'},
 {key:'longspear',name:'Mızrak Kıran',stat:'dex'}, {key:'mace',name:'Taş Yürek',stat:'sta'},
 {key:'bow',name:'Rüzgâr Perdesi',stat:'dex'}, {key:'staff',name:'Sessiz Rün',stat:'mag'},
];
for(const tier of [5,6])for(const ward of WARDS)for(const slot of Object.keys(ACCESSORY_SETS)){
 const stats=level=>({def:Math.round((tier+level)*SLOT_SCALE[slot]),hp:Math.round((tier*8+level*5)*SLOT_SCALE[slot]),mp:ward.key==='staff'?tier*4+level*3:0,statBonus:{[ward.stat]:Math.round((tier*.6+level*.4)*SLOT_SCALE[slot])},defenseAbility:{vs:ward.key,value:(tier===6?6:4)+level}});
 ACCESSORY_SETS[slot].push({...stats(0),tier,slot,family:'ward_'+ward.key,name:`${tier===6?'Kadim ':''}${ward.name} ${SLOT_LABEL[slot]}`,levels:[1,2,3,4,5].map(stats)});
}
