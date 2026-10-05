import { MAPS, findMap, GATE_TELEPORT_COST } from "../data/maps";
import { buildMapBoss } from "../data/mapBosses";
import { buildSoloDungeonStages, buildDungeonStageChoices } from "../data/soloDungeon";
import { grantMonsterReward } from "../utils/monsterRewards";
import { canFightMapBoss } from "../utils/mapBoss";
import { isMonsterUnlocked, isMapProgressUnlocked } from "../utils/mapProgress";
import { canEnterSoloDungeon, consumeDungeonEntry } from "../utils/soloDungeon";
import { usePotion, bestAvailablePotionTier } from "../utils/potions";
import { applyDeathPenalty, damageEquippedDurability, WEAPON_SLOTS, ARMOR_SLOTS, playerMaxHp, playerMaxMp, clampGold } from "../utils/player";
import { rand, uid } from "../utils/random";
import { replayFight, MIN_TURN_MS } from "./fight";

// Savaş gelirleri (Faz 3a): öldürme ödülü, ölüm cezası, pot, zindan, kapı. Savaşın kendisi
// (vuruş/can) istemcide oynanır; sunucu yalnızca KİMİN NEYİ KAZANDIĞINI belirler: canavar
// istemcinin gönderdiği nesneyle değil, kimliğiyle verilerden kurulur ve ödül ona göre verilir.
// Savaşın kendisi: sunucu `battle/start`ta tohum verir; istemci savaşı aynı motorla (game/fight.js) oynar ve
// bitince eylem dizisini `battle/settle` ile gönderir. Sunucu savaşı baştan oynatıp sonucu (kazanma/ölme/geri
// çekilme), ödülü, silah/zırh aşınmasını ve harcanan potları KENDİ hesaplar; istemcinin söylediği hasar/ödül yoktur.
// Hile sınırı: savaş başlamış olmalı, süre eylem sayısıyla orantılı geçmiş olmalı, zindan aşamaları sırayla ilerler.
export const MIN_FIGHT_MS = 700;
const MAX_WEAR_PER_REPORT = 1500;

const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });

// Statik canavar tablosu: id -> { monster, map, kind, index, stage, risk }.
let staticIndex = null;
function buildIndex() {
  const index = new Map();
  MAPS.forEach((map) => {
    map.monsters.forEach((monster, i) => index.set(monster.id, { monster, map, kind: "normal", index: i }));
    const stages = buildSoloDungeonStages(map);
    stages.forEach((stage, i) => {
      if (stage.isBoss) { index.set(stage.id, { monster: stage, map, kind: "dungeon", stage: i, risk: false }); return; }
      buildDungeonStageChoices(map, i).forEach((choice) => index.set(choice.risk ? choice.id : stage.id, { monster: choice, map, kind: "dungeon", stage: i, risk: !!choice.risk }));
    });
  });
  return index;
}

export function resolveMonster(monsterId) {
  if (typeof monsterId !== "string") return null;
  staticIndex ||= buildIndex();
  const hit = staticIndex.get(monsterId);
  if (hit) return hit;
  const map = MAPS.find((m) => monsterId === `map_boss_${m.id}`);
  return map ? { monster: buildMapBoss(map), map, kind: "boss" } : null;
}

const currentMap = (player) => {
  const map = findMap(player.currentMapId);
  return player.level >= map.levelMin ? map : null;
};

// Aynı kapı hem savaşı başlatır hem ödülü verirken yeniden denetlenir.
function checkAccess(player, target) {
  const map = currentMap(player);
  if (!map) return "locked";
  if (target.map.id !== map.id) return "wrongMap";
  if (target.kind === "normal" && !isMonsterUnlocked(player, map, target.index)) return "monsterLocked";
  if (target.kind === "boss") {
    const gate = canFightMapBoss(player, map.id);
    if (!gate.ok) return gate.reason === "mapIncomplete" ? "mapIncomplete" : "defeatedToday";
  }
  if (target.kind === "dungeon") {
    const run = player.dungeonRun;
    if (!run || run.mapId !== map.id || run.stage !== target.stage) return "noDungeonRun";
  }
  return null;
}

const asCount = (value) => (Number.isFinite(value) && value > 0 ? Math.min(MAX_WEAR_PER_REPORT, Math.floor(value)) : 0);
function applyWear(player, wear) {
  let next = player;
  const weapon = asCount(wear?.weapon);
  const armor = asCount(wear?.armor);
  if (weapon) next = damageEquippedDurability(next, WEAPON_SLOTS, weapon);
  if (armor) next = damageEquippedDurability(next, ARMOR_SLOTS, armor);
  return next;
}

const clearFight = (player) => (player.fight || player.dungeonRun ? { ...player, fight: null, dungeonRun: null } : player);

export const battleReducers = {
  "battle/start"(state, { monsterId }) {
    const target = resolveMonster(monsterId);
    if (!target) return fail(state, "unknownMonster");
    const denied = checkAccess(state.player, target);
    if (denied) return fail(state, denied);
    const seed = (Math.floor(Math.random() * 4294967296) >>> 0) || 1;
    const player = { ...state.player, fight: { monsterId, startedAt: Date.now(), seed }, hp: playerMaxHp(state.player), mp: playerMaxMp(state.player) };
    return done({ ...state, player }, { seed });
  },

  // Savaşı sunucuda baştan oynatır ve sonucu uygular. Sonuç: "win" (ödül), "lose" (ölüm cezası) ya da
  // "retreat" (bitmemiş savaş: yalnızca aşınma ve harcanan potlar). Savaş bir kez ödeme yapar.
  "battle/settle"(state, { monsterId, actions }) {
    const target = resolveMonster(monsterId);
    if (!target) return fail(state, "unknownMonster");
    const fight = state.player.fight;
    if (!fight || fight.monsterId !== monsterId || !Number.isInteger(fight.seed)) return fail(state, "noFight");
    const replay = replayFight(state.player, target.monster, target.map.levelMax, fight.seed, actions);
    if (replay.error) return fail(state, "invalidLog", { detail: replay.error });
    // Süre tabanı: tur başına en az MIN_TURN_MS (ağ gecikmesi payı için 1,5 sn düşülür).
    const elapsed = Date.now() - fight.startedAt;
    if (elapsed < replay.fight.turn * MIN_TURN_MS - 1500) return fail(state, "tooFast");
    const denied = checkAccess(state.player, target);
    if (denied) return fail(state, denied);

    // Aşınma ve harcanan potlar savaşın sonucundan bağımsız uygulanır.
    let player = applyWear({ ...state.player, fight: null }, replay.fight.wear);
    for (const kind of ["hp", "mp"]) {
      for (const [tier, count] of Object.entries(replay.fight.used[kind])) {
        for (let n = 0; n < count; n++) player = usePotion(player, kind, Number(tier)).player;
      }
    }
    const outcome = replay.fight.ended || "retreat";

    if (outcome === "lose") {
      const penalty = applyDeathPenalty(clearFight(player));
      return done({ ...state, player: penalty.player }, { outcome, xpLost: penalty.xpLost });
    }
    if (outcome === "retreat") return done({ ...state, player: clearFight(player) }, { outcome });

    const reward = grantMonsterReward(player, target.monster, target.map);
    if (reward.blockedReasonKey) return done({ ...state, player }, { outcome, blockedReasonKey: reward.blockedReasonKey, tone: reward.tone, drops: [], levelUp: null });
    player = reward.player;
    let completion = null;
    if (target.kind === "dungeon") {
      if (target.monster.isBoss) {
        const bonusGold = rand(target.monster.goldMin, target.monster.goldMax) * 2;
        const gold = clampGold(player.gold + bonusGold);
        completion = { bonusGold: gold - player.gold, chestTier: target.map.tier };
        player = { ...player, gold, chests: [...player.chests, { id: uid(), tier: target.map.tier }], dungeonRun: null };
      } else {
        player = { ...player, dungeonRun: { ...player.dungeonRun, stage: target.stage + 1 } };
      }
    }
    return done({ ...state, player }, { outcome, drops: reward.drops, tone: reward.tone, levelUp: reward.levelUp, completion });
  },

  // Savaş Alanı/klan zindanı gibi henüz kendi savaş kaydı olmayan yerler için ölüm cezası.
  "battle/death"(state, { wear }) {
    const penalty = applyDeathPenalty(clearFight(applyWear(state.player, wear)));
    return done({ ...state, player: penalty.player }, { xpLost: penalty.xpLost });
  },

  // Savaş kaydını ve zindan koşusunu temizler (sekmeden çıkış vb.); aşınma/pot için `battle/settle` kullanılır.
  "battle/retreat"(state) {
    return done({ ...state, player: clearFight(state.player) });
  },

  // hp/mp istemcide canlı tutulur; pot hesabı istemcinin söylediği güncel değerlerle yapılır
  // (yalnızca kendi savaş ekranındaki iyileşmeyi etkiler), tüketilen pot sunucuda düşer.
  "battle/potion"(state, { kind, hp, mp }) {
    if (kind !== "hp" && kind !== "mp") return fail(state, "invalidKind");
    const tier = bestAvailablePotionTier(state.player, kind);
    if (!tier) return fail(state, "noPotionsLeft");
    const reported = {
      ...state.player,
      hp: Number.isFinite(hp) ? Math.max(0, Math.min(playerMaxHp(state.player), hp)) : state.player.hp,
      mp: Number.isFinite(mp) ? Math.max(0, Math.min(playerMaxMp(state.player), mp)) : state.player.mp,
    };
    const used = usePotion(reported, kind, tier);
    if (used.reason) return fail(state, used.reason);
    return done({ ...state, player: used.player }, { healed: used.healed, tier });
  },

  "map/teleport"(state, { mapId }) {
    const idx = MAPS.findIndex((m) => m.id === mapId);
    if (idx < 0) return fail(state, "unknownMap");
    const target = MAPS[idx];
    const { player } = state;
    if (player.level < target.levelMin) return fail(state, "locked");
    if (!isMapProgressUnlocked(player, idx, MAPS)) return fail(state, "mapProgressLocked");
    if (target.id === player.currentMapId) return fail(state, "sameMap");
    if (player.gold < GATE_TELEPORT_COST) return fail(state, "notEnoughGold", { cost: GATE_TELEPORT_COST });
    return done({ ...state, player: { ...clearFight(player), gold: player.gold - GATE_TELEPORT_COST, currentMapId: target.id } }, { cost: GATE_TELEPORT_COST });
  },

  "battle/dungeonEntry"(state) {
    const map = currentMap(state.player);
    if (!map) return fail(state, "locked");
    const check = canEnterSoloDungeon(state.player);
    if (!check.ok) return fail(state, "entriesExhausted");
    const player = { ...consumeDungeonEntry(state.player), fight: null, dungeonRun: { mapId: map.id, stage: 0 } };
    return done({ ...state, player });
  },
};
