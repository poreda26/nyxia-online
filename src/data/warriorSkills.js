// Hand-authored skill list for warrior — 2 free "basic" skills (Lv.1, Lv.5)
// plus 11 "advanced" skills unlocking every 5 levels from Lv.10 to Lv.60,
// each gated by gold + the matching tier's Kaptan quest (see
// data/quests.js#MONSTER_QUESTS, utils/skills.js#canUnlockSkill). The
// mp/cooldown/effect-multiplier at each unlock level is identical across
// all 4 classes — only the name/flavor differs — so no class is ever
// ahead of another in raw skill power at the same level.
export const WARRIOR_SKILLS = [
  { id: "w1", unlockLevel: 1, name: "Kılıç Darbesi", tier: "basic", mpCost: 8, cooldown: 0, effect: { type: "damage", mult: 1.3 } },
  { id: "w2", unlockLevel: 5, name: "Savaşçı Azmi", tier: "basic", mpCost: 12, cooldown: 3, effect: { type: "heal", pct: 0.15 } },
  { id: "w3", unlockLevel: 10, name: "Yıkıcı Vuruş", tier: "advanced", mpCost: 20, cooldown: 2, effect: { type: "damage", mult: 1.9 }, goldCost: 400, questTier: 1 },
  { id: "w4", unlockLevel: 15, name: "Savaş Narası", tier: "advanced", mpCost: 18, cooldown: 4, effect: { type: "buffAtk", mult: 1.25, turns: 3 }, goldCost: 600, questTier: 2 },
  { id: "w5", unlockLevel: 20, name: "Çift Kesim", tier: "advanced", mpCost: 22, cooldown: 2, effect: { type: "damage", mult: 2 }, goldCost: 800, questTier: 2 },
  { id: "w6", unlockLevel: 25, name: "Kanayan Yara", tier: "advanced", mpCost: 20, cooldown: 3, effect: { type: "dot", mult: 0.6, turns: 3 }, goldCost: 1000, questTier: 2 },
  { id: "w7", unlockLevel: 30, name: "Toprak Sarsıntısı", tier: "advanced", mpCost: 26, cooldown: 3, effect: { type: "damage", mult: 2.2 }, goldCost: 1200, questTier: 3 },
  { id: "w8", unlockLevel: 35, name: "Can Alıcı Darbe", tier: "advanced", mpCost: 24, cooldown: 3, effect: { type: "execute", mult: 3, hpPctThreshold: 0.3 }, goldCost: 1400, questTier: 3 },
  { id: "w9", unlockLevel: 40, name: "Kalkan Parçalayan", tier: "advanced", mpCost: 28, cooldown: 3, effect: { type: "damage", mult: 2.35 }, goldCost: 1600, questTier: 3 },
  { id: "w10", unlockLevel: 45, name: "Zafer Çığlığı", tier: "advanced", mpCost: 26, cooldown: 4, effect: { type: "buffAtk", mult: 1.3, turns: 3 }, goldCost: 1800, questTier: 4 },
  { id: "w11", unlockLevel: 50, name: "Ejder Kesici", tier: "advanced", mpCost: 32, cooldown: 3, effect: { type: "damage", mult: 2.5 }, goldCost: 2000, questTier: 4 },
  { id: "w12", unlockLevel: 55, name: "Demir İrade", tier: "advanced", mpCost: 30, cooldown: 4, effect: { type: "heal", pct: 0.25 }, goldCost: 2200, questTier: 4 },
  { id: "w13", unlockLevel: 60, name: "Kaos Yıkımı", tier: "advanced", mpCost: 40, cooldown: 4, effect: { type: "damage", mult: 2.8 }, goldCost: 2400, questTier: 5 },
];
