// Her haritanın son canavarından türetilen günlük bölge boss'u. Yeni sprite
// istemez; BattleScene mevcut haritanın boss görselini kullanır.
export function buildMapBoss(map) {
  const base = map.monsters[map.monsters.length - 1];
  return {
    id: `map_boss_${map.id}`,
    name: `${map.name} Muhafızı`,
    hp: Math.round(base.hp * 4.25),
    atk: Math.round(base.atk * 1.45),
    def: Math.round(base.def * 1.3),
    xp: Math.round(base.xp * 3),
    goldMin: Math.round(base.goldMin * 3),
    goldMax: Math.round(base.goldMax * 3),
    mapBoss: true,
    isBoss: true,
    visualSourceId: base.id,
  };
}
