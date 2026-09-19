import { getMonsterRewardConfig } from "../utils/dropConfig";

// Her haritanın son canavarından türetilen günlük bölge boss'u. Yeni sprite
// istemez; BattleScene mevcut haritanın boss görselini kullanır. Altın/xp,
// admin.html'de base canavar için bir override varsa onu (bkz.
// utils/dropConfig.js) 3 katına katlayarak kullanıyor — böylece "Harita Sonu
// Boss"un ödülü, o haritanın en güçlü canavarına ayarlanan drop'larla
// otomatik tutarlı kalıyor, ayrıca elle senkronlanmaya gerek kalmıyor.
export function buildMapBoss(map) {
  const base = map.monsters[map.monsters.length - 1];
  const rewardCfg = getMonsterRewardConfig(base, map);
  return {
    id: `map_boss_${map.id}`,
    name: `${map.name} Muhafızı`,
    hp: Math.round(base.hp * 2.5),
    atk: Math.round(base.atk * 1.15),
    def: Math.round(base.def * 1.3),
    xp: Math.round(rewardCfg.xp * 3),
    goldMin: Math.round(rewardCfg.goldMin * 3),
    goldMax: Math.round(rewardCfg.goldMax * 3),
    mapBoss: true,
    isBoss: true,
    visualSourceId: base.id,
  };
}
