import { SKILLS_BY_CLASS, MAX_LOADOUT_SLOTS } from "../data/skills";
import { isTierQuestClaimed } from "./quests";
import { mitigate, MONSTER_DEF_K } from "./combat";

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
export function canUnlockSkill(player, skill) {
  if (isKnown(player, skill.id)) return { ok: false, reason: "Zaten öğrenildi." };
  if (player.level < skill.unlockLevel) return { ok: false, reason: `Seviye ${skill.unlockLevel} gerekiyor.` };
  if (skill.tier === "basic") return { ok: true }; // free, granted by learnFreeSkills already
  if (!isTierQuestClaimed(player, skill.questTier)) return { ok: false, reason: `Kaptan'ın T${skill.questTier} görevini tamamlamalısın.` };
  if (player.gold < skill.goldCost) return { ok: false, reason: "Yeterli altının yok." };
  return { ok: true };
}

export function unlockSkill(player, skillId) {
  const skill = getSkill(player.class, skillId);
  if (!skill) return { player, unlocked: false, reason: "Geçersiz beceri." };
  const check = canUnlockSkill(player, skill);
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

// Human-readable Turkish blurb for a skill's mechanical effect — used by
// CharacterTab's Beceriler list and nowhere else, but kept here next to the
// effect types themselves so the two never drift apart.
export function describeEffect(effect) {
  switch (effect.type) {
    case "damage": return `Normal saldırının ×${effect.mult} katı hasar verir.`;
    case "heal": return `Canının %${Math.round(effect.pct * 100)}'ünü yeniler.`;
    case "buffAtk": return `${effect.turns} vuruş boyunca saldırı gücünü ×${effect.mult} artırır.`;
    case "buffDef": return `${effect.turns} vuruş boyunca savunmayı ×${effect.mult} artırır.`;
    case "dot": return `${effect.turns} vuruş boyunca hedefe ek hasar verir.`;
    case "execute": return `Hedefin canı %${Math.round(effect.hpPctThreshold * 100)} altındaysa ×${effect.mult} hasar verir.`;
    default: return "";
  }
}
