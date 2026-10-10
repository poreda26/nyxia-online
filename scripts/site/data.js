// Wiki için oyun verisini toplar. scripts/build-site.mjs bunu paketleyip çalıştırır; görsel içe aktarmaları dosya yolu olur.
import { CLASSES } from '../../src/data/classes.js';
import { RACES } from '../../src/data/races.js';
import { MAPS } from '../../src/data/maps.js';
import { buildMapBoss } from '../../src/data/mapBosses.js';
import { SKILLS_BY_CLASS, MAX_LOADOUT_SLOTS } from '../../src/data/skills.js';
import { WARRIOR_WEAPONS, WEAPON_TYPE_LABEL } from '../../src/data/warriorWeapons.js';
import { ROGUE_WEAPONS } from '../../src/data/rogueWeapons.js';
import { CASTER_WEAPONS } from '../../src/data/casterWeapons.js';
import { ORIGINAL_WEAPONS } from '../../src/data/originalWeapons.js';
import { ARMOR_SETS } from '../../src/data/armorSets.js';
import { SLOTS } from '../../src/data/armor.js';
import { ACCESSORY_SETS } from '../../src/data/accessories.js';
import { ITEM_TIER_LABEL, ITEM_TIER_COLORS } from '../../src/data/itemRarity.js';
import { itemImageFor } from '../../src/data/itemImages.js';
import { POINTS_PER_LEVEL, STAT_CAP, STAT_FULL_LABELS } from '../../src/data/stats.js';
import { HP_POTION_TIERS, MP_POTION_TIERS, POTION_TIER_NAMES, POTION_TIER_PRICES } from '../../src/data/potions.js';
import { PREMIUM_TIERS } from '../../src/data/premium.js';
import { WINGS } from '../../src/data/wings.js';
import { BOOST_SCROLLS, BOOST_DURATION_MIN, BOOST_SCROLL_PACK_SIZE } from '../../src/data/boostScrolls.js';
import { DAILY_LOGIN_REWARDS, DAILY_QUEST_SLOTS } from '../../src/data/dailySystems.js';
import { SCHEDULED_EVENTS } from '../../src/data/scheduledEvents.js';
import { WEEKLY_QUESTS } from '../../src/data/weeklyQuests.js';
import { DIAMOND_PRICES, PREMIUM_DURATION_DAYS, CHARACTER_SLOTS, DAILY_LOGIN_DIAMONDS, WEEKLY_RANK_REWARDS } from '../../src/data/diamondPrices.js';
import { MARKET_DURATIONS_HOURS, MARKET_DURATION_FEE, MARKET_STALL_MAX_ITEMS } from '../../src/data/market.js';
import { CLAN_MAX_MEMBERS, CLAN_MAX_OFFICERS, CLAN_MAX_DEPUTIES, CLAN_FOUND_COST_DIAMONDS, CLAN_EXP_TIERS } from '../../src/data/clan.js';
import { CLAN_PERMISSIONS, DEFAULT_CLAN_PERMISSIONS, CLAN_VAULT_CAPACITY } from '../../src/data/clanPermissions.js';
import { CLAN_BOSS_STAGES, CLAN_BUILDING_UPGRADE_COST, CLAN_BUILDING_MAX_LEVEL } from '../../src/data/clanBoss.js';
import { TOTAL_STAGES, MID_BOSS_INDEX, FINAL_BOSS_INDEX, CLAN_DUNGEON_DAILY_ENTRIES, CLAN_DUNGEON_MATERIALS, clanDungeonStage } from '../../src/data/clanDungeon.js';
import { SOLO_DUNGEON_DAILY_LIMIT, SOLO_DUNGEON_STAGE_COUNT, EXTRA_DUNGEON_ENTRY_COST_DIAMONDS, buildSoloDungeonStages } from '../../src/data/soloDungeon.js';
import * as WZ from '../../src/data/warzone.js';

const strip = (value) => JSON.parse(JSON.stringify(value, (key, v) => (typeof v === 'function' ? undefined : v)));
const weaponView = (cls, list) => list.map((w) => ({
  cls, name: w.name, tier: w.tier, levelMin: w.levelMin, levelMax: w.levelMax, weaponType: w.weaponType, element: w.element || null,
  lore: w.lore || '', atk: w.levels?.[0]?.atk ?? w.atk ?? null, maxAtk: w.levels?.length ? w.levels[Math.min(w.levels.length, 8) - 1].atk : null, image: itemImageFor(w.name, 0),
}));

export function collect() {
  const weapons = [
    ...weaponView('warrior', WARRIOR_WEAPONS),
    ...weaponView('rogue', ROGUE_WEAPONS),
    ...weaponView('mage', CASTER_WEAPONS),
  ];
  const originals = ORIGINAL_WEAPONS.map((w) => ({ cls: w.cls, name: w.name, tier: w.tier, weaponType: w.weaponType, element: w.element || null, lore: w.lore || '', image: itemImageFor(w.name, 0) }));
  return strip({
    classes: Object.entries(CLASSES).map(([id, c]) => ({ id, name: c.name, color: c.color, atk: c.atk, def: c.def, maxHp: c.maxHp, maxMp: c.maxMp, crit: c.crit, mainStat: c.mainStat, baseStats: c.baseStats, desc: c.desc })),
    races: Object.entries(RACES).map(([id, r]) => ({ id, name: r.name, color: r.color, desc: r.desc })),
    skills: Object.fromEntries(Object.entries(SKILLS_BY_CLASS).map(([cls, list]) => [cls, list.map((s) => ({ id: s.id, name: s.name, tier: s.tier, unlockLevel: s.unlockLevel, mpCost: s.mpCost, cooldown: s.cooldown, goldCost: s.goldCost || 0, effect: s.effect }))])),
    loadoutSlots: MAX_LOADOUT_SLOTS,
    maps: MAPS.map((m) => ({ id: m.id, name: m.name, levelMin: m.levelMin, levelMax: m.levelMax, color: m.color, monsters: m.monsters.map((x) => ({ id: x.id, name: x.name, hp: x.hp, atk: x.atk, def: x.def, xp: x.xp })), boss: (() => { const b = buildMapBoss(m); return { name: b.name, hp: b.hp, atk: b.atk, def: b.def, xp: b.xp, goldMin: b.goldMin, goldMax: b.goldMax }; })(), dungeon: buildSoloDungeonStages(m).map((s) => ({ name: s.name, hp: s.hp, atk: s.atk, def: s.def, isBoss: !!s.isBoss })) })),
    tiers: { labels: ITEM_TIER_LABEL.tr, colors: ITEM_TIER_COLORS },
    weaponTypeLabels: WEAPON_TYPE_LABEL.tr,
    weapons, originals,
    armor: ARMOR_SETS.map((a) => ({ cls: a.cls, slot: a.slot, tier: a.tier, levelMin: a.levelMin, levelMax: a.levelMax, name: a.name, def: a.def, req: a.reqStats })),
    armorSlots: SLOTS.map((s) => ({ key: s.key, label: s.label })),
    accessories: Object.fromEntries(Object.entries(ACCESSORY_SETS).map(([slot, list]) => [slot, list.map((a) => ({ name: a.name, tier: a.tier, family: a.family, def: a.def, hp: a.hp, mp: a.mp, statBonus: a.statBonus }))])),
    stats: { pointsPerLevel: POINTS_PER_LEVEL, cap: STAT_CAP, labels: STAT_FULL_LABELS },
    potions: { hp: HP_POTION_TIERS, mp: MP_POTION_TIERS, names: POTION_TIER_NAMES.tr, prices: POTION_TIER_PRICES },
    premium: PREMIUM_TIERS, premiumDays: PREMIUM_DURATION_DAYS,
    wings: WINGS.map((w) => ({ id: w.id, name: w.name, nameEn: w.nameEn, color: w.color, price: w.price })),
    boosts: { scrolls: BOOST_SCROLLS, minutes: BOOST_DURATION_MIN, pack: BOOST_SCROLL_PACK_SIZE },
    daily: { login: DAILY_LOGIN_REWARDS, quests: DAILY_QUEST_SLOTS, loginDiamonds: DAILY_LOGIN_DIAMONDS },
    weekly: WEEKLY_QUESTS, weeklyRank: WEEKLY_RANK_REWARDS,
    events: SCHEDULED_EVENTS,
    prices: DIAMOND_PRICES, characterSlots: CHARACTER_SLOTS,
    market: { hours: MARKET_DURATIONS_HOURS, fee: MARKET_DURATION_FEE, maxItems: MARKET_STALL_MAX_ITEMS },
    clan: { maxMembers: CLAN_MAX_MEMBERS, maxOfficers: CLAN_MAX_OFFICERS, maxDeputies: CLAN_MAX_DEPUTIES, foundCost: CLAN_FOUND_COST_DIAMONDS, expTiers: CLAN_EXP_TIERS, permissions: CLAN_PERMISSIONS, defaultPermissions: DEFAULT_CLAN_PERMISSIONS, vault: CLAN_VAULT_CAPACITY, bossStages: CLAN_BOSS_STAGES, buildingCost: CLAN_BUILDING_UPGRADE_COST, buildingMax: CLAN_BUILDING_MAX_LEVEL },
    clanDungeon: { total: TOTAL_STAGES, mid: MID_BOSS_INDEX, final: FINAL_BOSS_INDEX, dailyEntries: CLAN_DUNGEON_DAILY_ENTRIES, materials: Object.values(CLAN_DUNGEON_MATERIALS).map((m) => ({ name: m.name, tier: m.tier, color: m.color })), first: clanDungeonStage(1), mid_: clanDungeonStage(MID_BOSS_INDEX), last: clanDungeonStage(FINAL_BOSS_INDEX) },
    solo: { dailyLimit: SOLO_DUNGEON_DAILY_LIMIT, stages: SOLO_DUNGEON_STAGE_COUNT, extraCost: EXTRA_DUNGEON_ENTRY_COST_DIAMONDS },
    warzone: { unlockLevel: WZ.WARZONE_UNLOCK_LEVEL, teleportCost: WZ.WARZONE_TELEPORT_COST, bossSlotHours: WZ.WARZONE_BOSS_SLOT_HOURS, fightWindowMin: WZ.WARZONE_BOSS_FIGHT_WINDOW_MIN, huntPower: WZ.WARZONE_HUNT_POWER_MULT, huntGold: WZ.WARZONE_HUNT_GOLD_MULT, huntDrop: WZ.WARZONE_HUNT_DROP_MULT, bosses: WZ.WARZONE_BOSSES.map((b) => ({ id: b.id, name: b.name, color: b.color, hp: b.hp, atk: b.atk, def: b.def })) },
  });
}
