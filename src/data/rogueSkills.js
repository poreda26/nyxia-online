// See data/warriorSkills.js for the shared unlock-level/mp/cooldown/effect
// template this follows — same power curve across all 4 classes, only
// name/flavor differs here.
export const ROGUE_SKILLS = [
  { id: "r1", unlockLevel: 1, name: "Sinsi Bıçak", tier: "basic", mpCost: 8, cooldown: 0, effect: { type: "damage", mult: 1.3 } },
  { id: "r2", unlockLevel: 5, name: "Çabuk Toparlanma", tier: "basic", mpCost: 12, cooldown: 3, effect: { type: "heal", pct: 0.15 } },
  { id: "r3", unlockLevel: 10, name: "Gölge Saldırısı", tier: "advanced", mpCost: 20, cooldown: 2, effect: { type: "damage", mult: 1.9 }, goldCost: 400, questTier: 1 },
  { id: "r4", unlockLevel: 15, name: "Suikastçı Refleksi", tier: "advanced", mpCost: 18, cooldown: 4, effect: { type: "buffAtk", mult: 1.25, turns: 3 }, goldCost: 600, questTier: 2 },
  { id: "r5", unlockLevel: 20, name: "Çifte Bıçak", tier: "advanced", mpCost: 22, cooldown: 2, effect: { type: "damage", mult: 2 }, goldCost: 800, questTier: 2 },
  { id: "r6", unlockLevel: 25, name: "Zehirli Bıçak", tier: "advanced", mpCost: 20, cooldown: 3, effect: { type: "dot", mult: 0.6, turns: 3 }, goldCost: 1000, questTier: 2 },
  { id: "r7", unlockLevel: 30, name: "Karanlık Sıçrayış", tier: "advanced", mpCost: 26, cooldown: 3, effect: { type: "damage", mult: 2.2 }, goldCost: 1200, questTier: 3 },
  { id: "r8", unlockLevel: 35, name: "Suikast", tier: "advanced", mpCost: 24, cooldown: 3, effect: { type: "execute", mult: 3, hpPctThreshold: 0.3 }, goldCost: 1400, questTier: 3 },
  { id: "r9", unlockLevel: 40, name: "Sessiz Ölüm", tier: "advanced", mpCost: 28, cooldown: 3, effect: { type: "damage", mult: 2.35 }, goldCost: 1600, questTier: 3 },
  { id: "r10", unlockLevel: 45, name: "Avcı İçgüdüsü", tier: "advanced", mpCost: 26, cooldown: 4, effect: { type: "buffAtk", mult: 1.3, turns: 3 }, goldCost: 1800, questTier: 4 },
  { id: "r11", unlockLevel: 50, name: "Kan Ayini", tier: "advanced", mpCost: 32, cooldown: 3, effect: { type: "damage", mult: 2.5 }, goldCost: 2000, questTier: 4 },
  { id: "r12", unlockLevel: 55, name: "Gölgelere Karışma", tier: "advanced", mpCost: 30, cooldown: 4, effect: { type: "heal", pct: 0.25 }, goldCost: 2200, questTier: 4 },
  { id: "r13", unlockLevel: 60, name: "Ölüm Meleği", tier: "advanced", mpCost: 40, cooldown: 4, effect: { type: "damage", mult: 2.8 }, goldCost: 2400, questTier: 5 },
];
