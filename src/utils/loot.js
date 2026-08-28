import { CLASSES } from "../data/classes";
import { SLOTS } from "../data/armor";
import { WEAPON_CATALOG } from "../data/weapons";
import { WARRIOR_WEAPONS, WARRIOR_SHIELDS, WEAPON_TYPE_ICON, WEAPON_TYPE_SPEED, WEAPON_TYPE_RANGE, weaponDurability } from "../data/warriorWeapons";
import { ROGUE_WEAPONS } from "../data/rogueWeapons";
import { CASTER_WEAPONS } from "../data/casterWeapons";
import { PRIEST_WEAPONS } from "../data/priestWeapons";
import { ARMOR_SETS } from "../data/armorSets";
import { ACCESSORY_SETS } from "../data/accessories";
import { TIER_PREFIX } from "../data/itemRarity";
import { weaponIconKey } from "../data/weaponIcons";
import { rand, pick, uid } from "./random";
import { bumpedStats, applyLevelData, MAX_UPGRADE_LEVEL } from "./upgrade";
import { STARTING_WEAPONS } from "../data/startingWeapons";

// Hiçbir eşya +0 doğmuyor — her üretici bu sarmalayıcıdan geçiyor.
// Gerçek KO ekran görüntüsünden birebir `levels` dizisi taşıyan eşyalar
// (bkz. buildWeaponFromTemplate) zaten kurulurken +1'e ayarlanmış geliyor,
// dokunmadan geçilir. Diğerleri için bumpedStats "bir yükseltme adımının"
// atk/def/hp/mp'ye ne yaptığını (×1.18, bkz. utils/upgrade.js) hesaplıyor;
// burada gerçek bir forge basışıymış gibi BİR KEZ uygulanıp upgradeLevel
// 1'e ayarlanıyor — kozmetik bir "+1" etiketi değil, gerçek stat artışı.
function applyStartingPlusOne(item) {
  if (!item) return item;
  if (item.levels) return item;
  const bumped = bumpedStats(item);
  return { ...item, atk: bumped.atk, def: bumped.def, hp: bumped.hp, mp: bumped.mp, upgradeLevel: 1 };
}

// Every class now has a hand-authored weapon table with its own Tier 6
// unique (see data/warriorWeapons.js, rogueWeapons.js, casterWeapons.js,
// priestWeapons.js — names/stats sourced from Knight Online's real item
// tables, see ko-item-tbl-to-sql-main).
export const MAX_WEAPON_TIER = { warrior: 6, rogue: 6, mage: 6, priest: 6 };
export function maxWeaponTier(cls) { return MAX_WEAPON_TIER[cls] || 5; }

// Tek bir zırh şablonundan (ARMOR_SETS satırı) gerçek eşya objesi kurar —
// hem rastgele rollArmor hem GM'in tam seçim yaptığı gmBuildArmor bunu
// paylaşır, obje şekli tek yerden garanti altında.
function buildArmorFromTemplate(a, tierId, dropClass, slot) {
  const weight = a.weight ?? (tierId * 2);
  const durability = a.durability ?? weaponDurability(tierId);
  const base = {
    id: uid(), kind: "armor", slot, tier: tierId, class: dropClass, name: a.name, atk: 0, def: a.def || 0, hp: a.hp || 0, mp: a.mp || 0, weight,
    durability, currentDurability: durability,
    upgradeLevel: 0, stackable: false, reqStats: a.reqStats, levels: a.levels || null,
  };
  // Gerçek KO ekran görüntüsünden birebir `levels` dizisi taşıyan eşyalar
  // (bkz. data/warriorWeapons.js#Giantic Axe'daki aynı desen) +1'e kurulu
  // doğar, ×1.18 tahminine hiç girmez.
  return base.levels ? applyLevelData(base, 1) : base;
}

export function rollArmor(tierId, forceClass) {
  // Armor drops for a RANDOM class, not necessarily the player's own —
  // this is what creates cross-class loot that needs to be traded away.
  // forceClass lets the Trade Post hand back a same-class replacement.
  const dropClass = forceClass || pick(Object.keys(CLASSES));
  const slot = pick(SLOTS).key;
  const options = ARMOR_SETS.filter((a) => a.cls === dropClass && a.slot === slot && a.tier === tierId);
  // Katalog eşya-eşya yeniden dolduruluyor (bkz. kullanıcı isteği) — havuz
  // boşken pick() undefined döner, o objeyi inşa etmeye çalışmak çökerdi.
  if (options.length === 0) return null;
  return applyStartingPlusOne(buildArmorFromTemplate(pick(options), tierId, dropClass, slot));
}

// Tek bir silah şablonundan (WARRIOR_WEAPONS/ROGUE_WEAPONS/CASTER_WEAPONS
// satırı) gerçek eşya objesi kurar — hem rastgele rollFromWeaponTable hem
// GM'in tam seçim yaptığı gmBuildWeaponById bunu paylaşır.
function buildWeaponFromTemplate(w, tierId, cls) {
  const weaponSlot = w.weaponSlot || "twoHand";
  // Çoğu eşya ağırlığını/dayanıklılığını tier/slot formülünden alıyor, ama
  // gerçek KO verisine göre eklenen eşyalar (bkz. Giantic Axe) kendi sabit
  // değerlerini taşıyabilir — şablonda varsa o kazanır.
  const weight = w.weight ?? (tierId * (weaponSlot === "twoHand" ? 3 : 2));
  const durability = w.durability ?? weaponDurability(tierId);
  const base = {
    id: uid(), kind: "weapon", weaponSlot, isShield: false, cls, tier: tierId,
    name: w.name, icon: WEAPON_TYPE_ICON[w.weaponType], weaponType: w.weaponType,
    attackSpeed: w.attackSpeed ?? WEAPON_TYPE_SPEED[w.weaponType], range: w.range ?? WEAPON_TYPE_RANGE[w.weaponType],
    atk: w.atk || 0, def: 0, hp: w.hp || 0, mp: w.mp || 0, statBonus: w.statBonus || null,
    element: w.element || null, elementBonus: w.elementBonus || null, elements: w.elements || null,
    lore: w.lore || null, noTrade: !!w.noTrade,
    durability, currentDurability: durability,
    weight, upgradeLevel: 0, stackable: false, reqStats: w.reqStats, levels: w.levels || null,
  };
  // Gerçek KO ekran görüntüsünden birebir +1..+10 satırları girilmiş
  // eşyalar (bkz. data/warriorWeapons.js#"Giantic Axe") +1'e kurulu doğar,
  // applyStartingPlusOne'ın ×1.18 tahminine hiç girmez — kendi gerçek
  // sayıları zaten var.
  return base.levels ? applyLevelData(base, 1) : base;
}

// Shared roller for every hand-authored weapon table (Warrior/Rogue/Mage/
// Priest) — each entry supplies its own weaponSlot (mainHand/offHand/
// twoHand), defaulting to twoHand for older entries that predate that field.
function rollFromWeaponTable(table, tierId, cls) {
  const options = table.filter((w) => w.tier === tierId);
  if (options.length === 0) return null;
  return buildWeaponFromTemplate(pick(options), tierId, cls);
}

function buildShieldFromTemplate(w, tierId) {
  const weight = tierId * 2;
  const durability = weaponDurability(tierId);
  return {
    id: uid(), kind: "weapon", weaponSlot: "offHand", isShield: true, cls: "warrior", tier: tierId,
    name: w.name, icon: WEAPON_TYPE_ICON.shield, weaponType: "shield",
    attackSpeed: WEAPON_TYPE_SPEED.shield, range: WEAPON_TYPE_RANGE.shield,
    atk: 0, def: w.def, hp: 0, mp: 0,
    durability, currentDurability: durability,
    weight, upgradeLevel: 0, stackable: false, reqStats: w.reqStats,
  };
}

function rollWarriorShield(tierId) {
  const options = WARRIOR_SHIELDS.filter((w) => w.tier === tierId);
  if (options.length === 0) return null;
  return buildShieldFromTemplate(pick(options), tierId);
}

// Old procedural generator — kept only as a safety-net fallback for a class
// that somehow isn't warrior/rogue/mage/priest. Every real class now routes
// through a hand-authored table above, so this should be unreachable.
function rollProceduralWeapon(tierId, cls) {
  const catalog = WEAPON_CATALOG[cls];
  const categories = Object.keys(catalog).filter((k) => catalog[k].length > 0);
  const cat = pick(categories);
  const baseName = pick(catalog[cat]);
  const power = tierId * 10 + rand(-2, 4);
  let atk = 0, def = 0, hp = 0, weaponSlot = "mainHand", isShield = false;

  if (cat === "twoHand") { weaponSlot = "twoHand"; atk = Math.round(power * 1.1) + rand(0, 4); hp = Math.round(power * 0.2) + rand(0, 2); }
  else if (cat === "mainHand") { weaponSlot = "mainHand"; atk = Math.round(power * 0.8) + rand(0, 3); hp = Math.round(power * 0.15) + rand(0, 1); }
  else if (cat === "offHandWeapon") { weaponSlot = "offHand"; atk = Math.round(power * 0.5) + rand(0, 2); }
  else if (cat === "offHandShield") { weaponSlot = "offHand"; isShield = true; def = Math.round(power * 0.9) + rand(0, 3); hp = Math.round(power * 0.4) + rand(0, 2); }

  const weight = weaponSlot === "twoHand" ? tierId * 3 : tierId * 2;
  const durability = weaponDurability(tierId);
  const iconKey = weaponIconKey(baseName);
  const name = `${pick(TIER_PREFIX[tierId])} ${baseName}`;
  return {
    id: uid(), kind: "weapon", weaponSlot, isShield, cls, tier: tierId, name, icon: iconKey, atk, def, hp, weight,
    attackSpeed: WEAPON_TYPE_SPEED[iconKey] || "Normal", range: WEAPON_TYPE_RANGE[iconKey] || 2.5,
    durability, currentDurability: durability,
    upgradeLevel: 0, stackable: false, reqStats: [{ key: CLASSES[cls].mainStat, value: tierId * 10 }],
  };
}

export function rollWeapon(tierId, cls) {
  return applyStartingPlusOne(rollWeaponBase(tierId, cls));
}

function rollWeaponBase(tierId, cls) {
  if (cls === "warrior") {
    // Shields are Warrior-only off-hand gear — a fifth of the roll goes to
    // one instead of a hand weapon, same 15%-equipment-drop budget just
    // split between the two.
    if (Math.random() < 0.2) {
      const shield = rollWarriorShield(tierId);
      if (shield) return shield;
    }
    return rollFromWeaponTable(WARRIOR_WEAPONS, tierId, "warrior");
  }
  if (cls === "rogue") return rollFromWeaponTable(ROGUE_WEAPONS, tierId, "rogue");
  if (cls === "mage") return rollFromWeaponTable(CASTER_WEAPONS, tierId, "mage");
  // Priest is a melee "paper attacker" in real KO (Sword/Mace, same
  // families Warrior uses at a lower ReqStr) — not a staff-caster like
  // Mage. See data/priestWeapons.js.
  if (cls === "priest") return rollFromWeaponTable(PRIEST_WEAPONS, tierId, "priest");
  return rollProceduralWeapon(tierId, cls);
}

// Tek bir aksesuar şablonundan (ACCESSORY_SETS[slot] satırı) gerçek eşya
// objesi kurar — hem rastgele rollAccessory hem GM'in tam seçim yaptığı
// gmBuildAccessory bunu paylaşır.
function buildAccessoryFromTemplate(a, tierId, slotType) {
  const weight = a.weight ?? tierId;
  const durability = a.durability ?? weaponDurability(tierId);
  const base = {
    id: uid(), kind: "accessory", slot: slotType, tier: tierId, name: a.name, atk: 0, def: a.def || 0, hp: a.hp || 0, mp: a.mp || 0,
    statBonus: a.statBonus, weight, reqStats: a.reqStats || null,
    durability, currentDurability: durability, upgradeLevel: 0, stackable: false, levels: a.levels || null,
  };
  return base.levels ? applyLevelData(base, 1) : base;
}

// Accessories are universal — any class can wear a ring, earring, necklace
// or belt, so they never need a class lock or trade detour.
export function rollAccessory(tierId) {
  const slotType = pick(["necklace", "belt", "ring", "earring"]);
  const a = ACCESSORY_SETS[slotType].find((it) => it.tier === tierId);
  // Katalog eşya-eşya yeniden dolduruluyor — o slot/tier boşken çökmek
  // yerine sessizce null dön (bkz. rollArmor'daki aynı güvenlik notu).
  if (!a) return null;
  return applyStartingPlusOne(buildAccessoryFromTemplate(a, tierId, slotType));
}

// Karakter oluşturulunca kuşandırılan sınıfa özel +1 başlangıç silahı —
// bkz. data/startingWeapons.js. Genel loot rulet'inden geçmiyor, tek bir
// sabit şablonu gerçek bir eşya objesine çeviriyor.
export function buildStartingWeapon(cls) {
  const w = STARTING_WEAPONS[cls];
  if (!w) return null;
  const durability = weaponDurability(1);
  return applyStartingPlusOne({
    id: uid(), kind: "weapon", weaponSlot: w.weaponSlot, isShield: false, cls, tier: 1,
    name: w.name, icon: WEAPON_TYPE_ICON[w.weaponType], weaponType: w.weaponType,
    attackSpeed: WEAPON_TYPE_SPEED[w.weaponType], range: WEAPON_TYPE_RANGE[w.weaponType],
    atk: w.atk, def: 0, hp: 0, mp: 0, statBonus: null,
    durability, currentDurability: durability,
    weight: 2, upgradeLevel: 0, stackable: false, reqStats: w.reqStats,
  });
}

// Single entry point used by both monster drops and chest openings so the
// loot table only lives in one place: ~38% weapon (own class, always
// usable), ~34% armor (random class — the trade bait), ~28% accessory.
export function rollLoot(tierId, playerClass) {
  const r = Math.random();
  if (r < 0.38) return rollWeapon(tierId, playerClass);
  if (r < 0.72) return rollArmor(tierId);
  return rollAccessory(tierId);
}

// Special Etkinlik Sandığı — granted only through events (GM-only for now;
// the actual event trigger system comes later), never a monster drop. This
// is the ONLY path to a Tier 6 "Eşsiz" item outside a GM /silah grant, and
// even here the odds are deliberately brutal (3%) so a unique stays unique.
const SPECIAL_CHEST_UNIQUE_CHANCE = 0.03;

export function rollSpecialChestLoot(playerClass) {
  if (maxWeaponTier(playerClass) >= 6 && Math.random() < SPECIAL_CHEST_UNIQUE_CHANCE) {
    // Katalog eşya-eşya yeniden dolduruluyor — bu sınıfın T6'sı henüz
    // eklenmemişse (rollWeapon null döner) T5 havuzuna düş, hiç düşmemiş
    // gibi davranma.
    const unique = rollWeapon(6, playerClass);
    if (unique) return unique;
  }
  return rollLoot(5, playerClass);
}

// ---- GM Eşya Üretici (components/GmItemPanel.jsx) ----
// Yukarıdaki roll* fonksiyonlarının aksine RASTGELE değil, GM'in listeden
// TAM olarak seçtiği kalemi üretir. `levels` taşıyan (gerçek KO ekran
// görüntüsünden birebir girilmiş) eşyalarda doğrudan o seviyenin gerçek
// satırını okur (applyLevelData, +9/+10 dahil — bkz. utils/upgrade.js).
// Diğer eşyalerde eskisi gibi bumpedStats'ı N kez ardışık uygulayarak
// gerçek forge'un adım adım yuvarlamasını TAHMİN eder (base*1.18^N tek
// seferde değil — her basışın kendi yuvarlaması bir sonrakine girer).
function applyUpgradeLevel(item, level) {
  if (item.levels) return applyLevelData(item, level);
  let next = item;
  for (let i = 0; i < level; i++) {
    const bumped = bumpedStats(next);
    next = { ...next, atk: bumped.atk, def: bumped.def, hp: bumped.hp, mp: bumped.mp };
  }
  return { ...next, upgradeLevel: level };
}

// Bir sınıfın seçilebilir tüm silahlarını (Warrior'da kalkanlar dahil)
// GmItemPanel'in dropdown'ı için düz bir listeye çevirir — `id` alanı
// gmBuildWeaponById'e geri verilecek stabil bir anahtar.
function weaponTableFor(cls) {
  if (cls === "warrior") return WARRIOR_WEAPONS;
  if (cls === "rogue") return ROGUE_WEAPONS;
  if (cls === "priest") return PRIEST_WEAPONS;
  return CASTER_WEAPONS; // mage
}

// `maxLevel`: bu eşyanın gerçek KO verisiyle kaç seviyeye kadar (+1..+N)
// authored edildiği — `levels` dizisi varsa onun uzunluğu (ör. Giantic Axe
// için 10, oyunun asıl forge tavanı olan MAX_UPGRADE_LEVEL 8'i aşabilir,
// GM önden test edebilsin diye), yoksa her zamanki MAX_UPGRADE_LEVEL.
export function gmWeaponTemplates(cls) {
  const table = weaponTableFor(cls);
  // `levels` taşıyan eşyalerde düz `atk` alanı yok — dropdown önizlemesi
  // için +1 satırından (levels[0]) okunuyor.
  const weapons = table.map((w, i) => ({ id: `w${i}`, tier: w.tier, name: w.name, atk: w.atk ?? w.levels?.[0]?.atk ?? 0, def: 0, maxLevel: w.levels ? w.levels.length : MAX_UPGRADE_LEVEL }));
  if (cls !== "warrior") return weapons;
  const shields = WARRIOR_SHIELDS.map((w, i) => ({ id: `s${i}`, tier: w.tier, name: `${w.name} (Kalkan)`, atk: 0, def: w.def, maxLevel: w.levels ? w.levels.length : MAX_UPGRADE_LEVEL }));
  return [...weapons, ...shields];
}

export function gmBuildWeaponById(cls, id, level) {
  if (id.startsWith("s")) {
    const w = WARRIOR_SHIELDS[parseInt(id.slice(1), 10)];
    if (!w) return null;
    return applyUpgradeLevel(buildShieldFromTemplate(w, w.tier), level);
  }
  const table = weaponTableFor(cls);
  const w = table[parseInt(id.slice(1), 10)];
  if (!w) return null;
  return applyUpgradeLevel(buildWeaponFromTemplate(w, w.tier, cls), level);
}

// Bir sınıf+slot kombinasyonunun 5 tier'lik zırh ilerlemesi — tier tek
// başına bu listede benzersiz bir anahtar (bkz. data/armorSets.js).
export function gmArmorTemplates(cls, slot) {
  return ARMOR_SETS.filter((a) => a.cls === cls && a.slot === slot);
}

export function gmBuildArmor(cls, slot, tier, level) {
  const a = ARMOR_SETS.find((x) => x.cls === cls && x.slot === slot && x.tier === tier);
  if (!a) return null;
  return applyUpgradeLevel(buildArmorFromTemplate(a, tier, cls, slot), level);
}

export function gmAccessoryTemplates(slot) {
  return ACCESSORY_SETS[slot] || [];
}

export function gmBuildAccessory(slot, tier, level) {
  const a = ACCESSORY_SETS[slot]?.find((x) => x.tier === tier);
  if (!a) return null;
  return applyUpgradeLevel(buildAccessoryFromTemplate(a, tier, slot), level);
}
