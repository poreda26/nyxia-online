import { SKILLS_BY_CLASS, MAX_LOADOUT_SLOTS } from "../data/skills";
import { isTierQuestClaimed } from "./quests";
import { mitigate, MONSTER_DEF_K } from "./combat";
import { tierName } from "../data/itemRarity";

export function classSkills(cls) {
  return SKILLS_BY_CLASS[cls] || [];
}

export function getSkill(cls, skillId) {
  return classSkills(cls).find((s) => s.id === skillId) || null;
}

export function isKnown(player, skillId) {
  return (player.skills?.known || []).includes(skillId);
}

// Basic (Lv.1/Lv.5) skills are free — they're granted automatically the
// moment the level requirement is met, same trigger point as stat points on
// level-up (see BattleTab#applyLoot). Idempotent: safe to call every level-up
// without checking first.
export function learnFreeSkills(player) {
  const toLearn = classSkills(player.class).filter(
    (s) => s.tier === "basic" && s.unlockLevel <= player.level && !isKnown(player, s.id)
  );
  if (toLearn.length === 0) return player;
  return { ...player, skills: { ...player.skills, known: [...player.skills.known, ...toLearn.map((s) => s.id)] } };
}

// Advanced (Lv.10+) skills need all three: the level, the gold, and having
// claimed at least one Kaptan quest for the skill's questTier (see
// utils/quests.js#isTierQuestClaimed) — that's the "gold + görev" gate the
// whole system exists for.
//
// `t` is the i18n translate function from useTranslation() (see
// i18n/LanguageContext.jsx). It's optional and defaults to a passthrough
// that renders the Turkish reason text below, so any caller that doesn't
// pass one keeps the original behavior; CharacterTab.jsx (the only current
// caller) always passes the real `t` so reasons render in the active
// language via i18n/sections/character.js's character.skills.reason.* keys.
function defaultT(key, vars) {
  const REASONS = {
    "character.skills.reason.invalidSkill": "Geçersiz beceri.",
    "character.skills.reason.known": "Zaten öğrenildi.",
    "character.skills.reason.levelRequired": `Seviye ${vars?.level} gerekiyor.`,
    "character.skills.reason.questRequired": `Kaptan'ın ${tierName("tr", vars?.tier)} görevini tamamlamalısın.`,
    "character.skills.reason.notEnoughGold": "Yeterli altının yok.",
  };
  return REASONS[key] ?? key;
}

// lang: kullanıcı isteği ("Tier sistemini kaldırmak... farklı isimler") —
// çeviri metnindeki {tier} artık ham sayı değil, tierName() ile renk adına
// çevrilmiş halini bekliyor; CharacterTab.jsx zaten kendi `lang`'ını
// biliyor, buraya iletiyor. `t` varsayılanı (defaultT) zaten Türkçe sabit
// olduğu için `lang` sadece gerçek i18n `t` ile birlikte anlam kazanıyor.
export function canUnlockSkill(player, skill, t = defaultT, lang = "tr") {
  if (isKnown(player, skill.id)) return { ok: false, reason: t("character.skills.reason.known") };
  if (player.level < skill.unlockLevel) return { ok: false, reason: t("character.skills.reason.levelRequired", { level: skill.unlockLevel }) };
  if (skill.tier === "basic") return { ok: true }; // free, granted by learnFreeSkills already
  if (!isTierQuestClaimed(player, skill.questTier)) return { ok: false, reason: t("character.skills.reason.questRequired", { tier: tierName(lang, skill.questTier) }) };
  if (player.gold < skill.goldCost) return { ok: false, reason: t("character.skills.reason.notEnoughGold") };
  return { ok: true };
}

export function unlockSkill(player, skillId, t = defaultT, lang = "tr") {
  const skill = getSkill(player.class, skillId);
  if (!skill) return { player, unlocked: false, reason: t("character.skills.reason.invalidSkill") };
  const check = canUnlockSkill(player, skill, t, lang);
  if (!check.ok) return { player, unlocked: false, reason: check.reason };
  const goldCost = skill.tier === "advanced" ? skill.goldCost : 0;
  return {
    player: {
      ...player,
      gold: player.gold - goldCost,
      skills: { ...player.skills, known: [...player.skills.known, skillId] },
    },
    unlocked: true,
  };
}

// Loadout: up to MAX_LOADOUT_SLOTS known skills equipped for battle use.
// Assigning a skill already sitting in another slot moves it (no
// duplicates) rather than erroring — matches the tap-to-place feel of
// BankGrid/UpgradeTab's scroll boxes elsewhere in this app.
export function setLoadoutSlot(player, slotIndex, skillId) {
  if (skillId && !isKnown(player, skillId)) return player;
  const loadout = (player.skills.loadout || Array(MAX_LOADOUT_SLOTS).fill(null)).map((id, i) => {
    if (i === slotIndex) return skillId;
    return id === skillId ? null : id;
  });
  return { ...player, skills: { ...player.skills, loadout } };
}

export function computeSkillDamage(skill, { clsAtk, atk, monsterDef, monsterHpPct, rand }) {
  const e = skill.effect;
  let mult = e.mult ?? 1;
  if (e.type === "execute" && !(monsterHpPct <= e.hpPctThreshold)) mult = 1;
  return Math.max(1, Math.round(mitigate((clsAtk + atk * 0.9) * mult, monsterDef, MONSTER_DEF_K) + rand(-2, 3)));
}

export function computeSkillHeal(skill, maxHp) {
  return Math.round((skill.effect.pct || 0) * maxHp);
}

// Human-readable blurb for a skill's mechanical effect — used by
// CharacterTab's Beceriler list and nowhere else, but kept here next to the
// effect types themselves so the two never drift apart. `t` is the i18n
// translate function from useTranslation(); it's optional and defaults to
// rendering the original Turkish sentences, so any caller that doesn't pass
// one keeps the original behavior. CharacterTab.jsx always passes the real
// `t`, so this renders via i18n/sections/character.js's
// character.skills.effect.* keys (keyed by effect.type, not by skill id,
// since the sentence only depends on the mechanical effect + numbers).
function defaultEffectT(key, vars) {
  const EFFECTS = {
    "character.skills.effect.damage": `Normal saldırının ×${vars?.mult} katı hasar verir.`,
    "character.skills.effect.heal": `Canının %${vars?.pct}'ünü yeniler.`,
    "character.skills.effect.buffAtk": `${vars?.turns} vuruş boyunca saldırı gücünü ×${vars?.mult} artırır.`,
    "character.skills.effect.buffDef": `${vars?.turns} vuruş boyunca savunmayı ×${vars?.mult} artırır.`,
    "character.skills.effect.dot": `${vars?.turns} vuruş boyunca hedefe ek hasar verir.`,
    "character.skills.effect.execute": `Hedefin canı %${vars?.pct} altındaysa ×${vars?.mult} hasar verir.`,
  };
  return EFFECTS[key] ?? "";
}

export function describeEffect(effect, t = defaultEffectT) {
  switch (effect.type) {
    case "damage": return t("character.skills.effect.damage", { mult: effect.mult });
    case "heal": return t("character.skills.effect.heal", { pct: Math.round(effect.pct * 100) });
    case "buffAtk": return t("character.skills.effect.buffAtk", { turns: effect.turns, mult: effect.mult });
    case "buffDef": return t("character.skills.effect.buffDef", { turns: effect.turns, mult: effect.mult });
    case "dot": return t("character.skills.effect.dot", { turns: effect.turns });
    case "execute": return t("character.skills.effect.execute", { pct: Math.round(effect.hpPctThreshold * 100), mult: effect.mult });
    default: return "";
  }
}
