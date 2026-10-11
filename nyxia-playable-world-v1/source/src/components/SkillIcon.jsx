import { Flame, Heart, ShieldPlus, Swords, Skull, Crosshair } from "lucide-react";

// One icon per effect type (not per skill — 52 unique icons would be a
// maintenance burden for no real payoff) — see utils/skills.js's effect
// type set.
const EFFECT_ICON = {
  damage: Swords,
  heal: Heart,
  buffAtk: Flame,
  buffDef: ShieldPlus,
  dot: Skull,
  execute: Crosshair,
};

export default function SkillIcon({ effectType, size = 16, color = "currentColor", strokeWidth = 1.6 }) {
  const Icon = EFFECT_ICON[effectType] || Swords;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
