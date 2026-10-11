// See data/warriorSkills.js for the shared unlock-level/mp/cooldown/effect
// template this follows — same power curve across all 4 classes, only
// name/flavor differs here.
export const MAGE_SKILLS = [
  { id: "m1", unlockLevel: 1, name: "Büyü Oku", tier: "basic", mpCost: 8, cooldown: 0, effect: { type: "damage", mult: 1.3 } },
  { id: "m2", unlockLevel: 5, name: "Mana Akışı", tier: "basic", mpCost: 12, cooldown: 3, effect: { type: "heal", pct: 0.15 } },
  { id: "m3", unlockLevel: 10, name: "Alev Topu", tier: "advanced", mpCost: 20, cooldown: 2, effect: { type: "damage", mult: 1.9 }, goldCost: 400, questTier: 1 },
  { id: "m4", unlockLevel: 15, name: "Arkane Yoğunlaşma", tier: "advanced", mpCost: 18, cooldown: 4, effect: { type: "buffAtk", mult: 1.25, turns: 3 }, goldCost: 600, questTier: 2 },
  { id: "m5", unlockLevel: 20, name: "Yıldırım Zinciri", tier: "advanced", mpCost: 22, cooldown: 2, effect: { type: "damage", mult: 2 }, goldCost: 800, questTier: 2 },
  { id: "m6", unlockLevel: 25, name: "Kükürt Yağmuru", tier: "advanced", mpCost: 20, cooldown: 3, effect: { type: "dot", mult: 0.6, turns: 3 }, goldCost: 1000, questTier: 2 },
  { id: "m7", unlockLevel: 30, name: "Donma Patlaması", tier: "advanced", mpCost: 26, cooldown: 3, effect: { type: "damage", mult: 2.2 }, goldCost: 1200, questTier: 3 },
  { id: "m8", unlockLevel: 35, name: "Ruh Tüketimi", tier: "advanced", mpCost: 24, cooldown: 3, effect: { type: "execute", mult: 3, hpPctThreshold: 0.3 }, goldCost: 1400, questTier: 3 },
  { id: "m9", unlockLevel: 40, name: "Meteor Yağmuru", tier: "advanced", mpCost: 28, cooldown: 3, effect: { type: "damage", mult: 2.35 }, goldCost: 1600, questTier: 3 },
  { id: "m10", unlockLevel: 45, name: "Zaman Bükümü", tier: "advanced", mpCost: 26, cooldown: 4, effect: { type: "buffAtk", mult: 1.3, turns: 3 }, goldCost: 1800, questTier: 4 },
  { id: "m11", unlockLevel: 50, name: "Kaos Büyüsü", tier: "advanced", mpCost: 32, cooldown: 3, effect: { type: "damage", mult: 2.5 }, goldCost: 2000, questTier: 4 },
  { id: "m12", unlockLevel: 55, name: "Yaşam Çalma", tier: "advanced", mpCost: 30, cooldown: 4, effect: { type: "heal", pct: 0.25 }, goldCost: 2200, questTier: 4 },
  { id: "m13", unlockLevel: 60, name: "Arkane Kıyamet", tier: "advanced", mpCost: 40, cooldown: 4, effect: { type: "damage", mult: 2.8 }, goldCost: 2400, questTier: 5 },
];
