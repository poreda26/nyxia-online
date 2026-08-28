import { Sword, Wand2, Sparkles, Heart } from "lucide-react";

// baseStats: fixed starting values for the 5 allocatable stats — STR/STA/
// DEX/INT/Magic Power — granted automatically at character creation,
// separate from the 10 free points the player then chooses where to put
// (see player.js#initialPlayer). mainStat is the "Ana Statü" hint shown at
// character creation, not necessarily what that class's weapons gate on —
// Priest is the one class where these diverge: its weapons need STR (real
// KO Priests are melee "paper attackers", see data/priestWeapons.js) while
// mainStat stays INT since that's still what drives its heal power/mana.
// Warrior/Rogue are straightforwardly physical (STR/DEX gate both mainStat
// and weapons); Mage's Staff also gates on INT, but mainStat is now "mag" —
// kullanıcı isteğiyle CHA (gerçek KO'da olmayan bir statü, önceki bir turda
// yanlışlıkla eklenmişti) kaldırıldı, yerine Magic Power geldi ve Mage'in
// asıl hasar kaynağı oldu (bkz. utils/player.js#totalStats'taki mage-özel
// ağırlıklandırma — INT hâlâ mana havuzunu besliyor, mag ayrıca ve daha
// güçlü şekilde saldırı gücünü besliyor).
export const CLASSES = {
  warrior: {
    name: "Warrior", icon: Sword, color: "#C97A3D", atk: 13, def: 9, maxHp: 130, maxMp: 20, crit: 0.05, mainStat: "str",
    baseStats: { str: 65, sta: 60, dex: 60, int: 50, mag: 50 },
    desc: "Kalın zırh, sağlam yumruk. Ön safta durur.",
  },
  rogue: {
    name: "Rogue", icon: Wand2, color: "#8B6FC9", atk: 15, def: 5, maxHp: 95, maxMp: 30, crit: 0.28, mainStat: "dex",
    baseStats: { str: 60, sta: 60, dex: 70, int: 50, mag: 50 },
    desc: "Hızlı, ölümcül kritikler. Kırılgan ama acımasız.",
  },
  mage: {
    name: "Mage", icon: Sparkles, color: "#4FC3D9", atk: 19, def: 3, maxHp: 75, maxMp: 65, crit: 0.10, mainStat: "mag",
    baseStats: { str: 50, sta: 50, dex: 60, int: 70, mag: 70 },
    desc: "Yüksek hasar, düşük can. Mana yönetimi şart.",
  },
  priest: {
    name: "Priest", icon: Heart, color: "#5FA8A0", atk: 10, def: 4, maxHp: 90, maxMp: 70, crit: 0.06, mainStat: "int",
    baseStats: { str: 65, sta: 60, dex: 50, int: 70, mag: 50 },
    desc: "Dengeli, dayanıklı, kendini iyileştirir.",
  },
};
