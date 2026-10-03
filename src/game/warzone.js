import { MAPS } from "../data/maps";
import { WARZONE_BOSSES, WARZONE_UNLOCK_LEVEL, WARZONE_TELEPORT_COST } from "../data/warzone";
import { wingMultiplier } from "../data/wings";
import { grantMonsterReward } from "../utils/monsterRewards";
import { getWarzoneBossConfig, getWarzoneHuntConfig } from "../utils/dropConfig";
import { rollConfiguredLoot, rollLoot } from "../utils/loot";
import { addItemToInventory, makeScrollStack } from "../utils/inventory";
import { premiumGoldMultiplier, premiumDropMultiplier } from "../utils/premium";
import { playerMaxHp, playerMaxMp, clampGold } from "../utils/player";
import { rand, uid } from "../utils/random";
import { MIN_FIGHT_MS } from "./battle";

// Savaş Alanı gelirleri (Faz 3a): giriş ücreti, Dünya Canavarı ödülü, Canavar Ara avı.
// Dünya Canavarı'nın hasar/can paylaşımı ve kazananın çekilişi zaten sunucudadır
// (boss_loot_claims); burada yalnızca o hakkın karşılığındaki ödül sunucuda üretilir.
// Av: canavar şablonu kimlikten kurulur; av başlamadan önce "aranıyor" süresi geçmiş olmalıdır.
const CRIMSON_MAP = MAPS.find((m) => m.id === "crimson_battlefront");
export const MIN_HUNT_SEARCH_MS = 4500; // istemcide 5-15 sn bekleniyor; ağ gecikmesine pay
const HUNT_PREFIX = "hunt:";

const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });

const effectiveBoss = (boss) => {
  const override = getWarzoneBossConfig(boss.id);
  return override ? { ...boss, ...override } : boss;
};

function bossLoot(player, boss) {
  let np = { ...player, inventory: [...player.inventory], chests: [...player.chests] };
  const drops = [];
  const dropMult = wingMultiplier(player, "drop") * premiumDropMultiplier(player);
  const goldGain = Math.round(rand(boss.bonusGoldMin, boss.bonusGoldMax) * premiumGoldMultiplier(np));
  const goldBefore = np.gold;
  np.gold = clampGold(np.gold + goldGain);
  drops.push({ type: "gold", amount: np.gold - goldBefore });
  if (Math.random() < boss.equipDropChance * dropMult) {
    const item = Array.isArray(boss.loot) ? rollConfiguredLoot(boss.loot) : rollLoot(boss.lootTier);
    // Bu kademe/sınıf için eşya yoksa rollLoot null döner: hiç düşmemiş sayılır.
    if (item) {
      const res = addItemToInventory(np, item);
      np = res.player;
      drops.push(res.added ? { type: "itemDropped", itemName: item.name } : { type: "itemDropFailed", itemName: item.name, reason: res.reason });
    }
  }
  if (Math.random() < boss.chestDropChance * dropMult) {
    np.chests.push({ id: uid(), tier: boss.lootTier });
    drops.push({ type: "chestDropped", tier: boss.lootTier });
  }
  if (Math.random() < boss.scrollDropChance * dropMult) {
    const res = addItemToInventory(np, makeScrollStack(boss.lootTier, 1));
    np = res.player;
    drops.push(res.added ? { type: "scrollDropped", tier: boss.lootTier } : { type: "scrollDropFailed", reason: res.reason });
  }
  // Bir canavarı (boss da bir canavar) öldürünce can/mana tam yenilenir.
  np.hp = playerMaxHp(np);
  np.mp = playerMaxMp(np);
  return { player: np, drops };
}

const huntTemplate = (monsterId) => CRIMSON_MAP.monsters.find((m) => m.id === monsterId) || null;

export const warzoneReducers = {
  "warzone/enter"(state) {
    const { player } = state;
    if (player.level < WARZONE_UNLOCK_LEVEL) return fail(state, "locked");
    if (!(player.nationalPoint > 0)) return fail(state, "npLocked");
    if (player.gold < WARZONE_TELEPORT_COST) return fail(state, "notEnoughGold", { cost: WARZONE_TELEPORT_COST });
    return done({ ...state, player: { ...player, gold: player.gold - WARZONE_TELEPORT_COST, warzone: { enteredAt: Date.now() } } }, { cost: WARZONE_TELEPORT_COST });
  },

  "warzone/leave"(state) {
    if (!state.player.warzone && !state.player.huntSearch) return done(state);
    return done({ ...state, player: { ...state.player, warzone: null, huntSearch: null, fight: null } });
  },

  // Hak, sunucuda `boss_loot_claims` satırıdır (bkz. server/game.mjs: boss kimliği oradan alınır,
  // satır aynı işlemde silinir). İstemci yalnızca eski (bayrak kapalı) yolda boss kimliğini söyler.
  "warzone/bossLoot"(state, { bossId }) {
    const boss = WARZONE_BOSSES.find((b) => b.id === bossId);
    if (!boss) return fail(state, "unknownBoss");
    const result = bossLoot(state.player, effectiveBoss(boss));
    return done({ ...state, player: result.player }, { drops: result.drops, tier: boss.lootTier });
  },

  "warzone/huntSearch"(state) {
    if (!state.player.warzone) return fail(state, "notEntered");
    return done({ ...state, player: { ...state.player, huntSearch: { startedAt: Date.now() }, fight: null } });
  },

  "warzone/huntStart"(state, { monsterId }) {
    const { player } = state;
    if (!player.warzone) return fail(state, "notEntered");
    if (!huntTemplate(monsterId)) return fail(state, "unknownMonster");
    if (!player.huntSearch || Date.now() - player.huntSearch.startedAt < MIN_HUNT_SEARCH_MS) return fail(state, "searchTooShort");
    return done({ ...state, player: { ...player, huntSearch: null, fight: { monsterId: HUNT_PREFIX + monsterId, startedAt: Date.now() }, hp: playerMaxHp(player), mp: playerMaxMp(player) } });
  },

  "warzone/huntKill"(state, { monsterId }) {
    const { player } = state;
    const template = huntTemplate(monsterId);
    if (!template) return fail(state, "unknownMonster");
    const fight = player.fight;
    if (!player.warzone) return fail(state, "notEntered");
    if (!fight || fight.monsterId !== HUNT_PREFIX + monsterId) return fail(state, "noFight");
    if (Date.now() - fight.startedAt < MIN_FIGHT_MS) return fail(state, "tooFast");
    const cfg = getWarzoneHuntConfig();
    const reward = grantMonsterReward({ ...player, fight: null }, template, CRIMSON_MAP, { goldMult: cfg.goldMult, dropMult: cfg.dropMult });
    return done({ ...state, player: reward.player }, { drops: reward.drops, tone: reward.tone, levelUp: reward.levelUp });
  },
};
