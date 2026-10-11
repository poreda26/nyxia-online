// Günlük Solo Zindan — kullanıcı isteği: "günde 3 kez girilebilen, içinde
// aşamalı olarak gitgide güçleşen, en sonunda boss olan" bir etkinlik.
// Her giriş, oyuncunun O AN ışınlı olduğu haritanın (bkz. data/maps.js) en
// güçlü canavarını taban alıp 5 gitgide güçleşen aşama + 1 boss aşaması
// üretir — yeni canavar/görsel eklemeden, mevcut haritayla birlikte
// otomatik ölçeklenir. Aşama başına düşen loot (ekipman/sandık/parşömen)
// utils/combat akışındaki normal drop tablosunu (bkz. BattleTab#applyLoot)
// aynen kullanıyor; sadece boss aşaması bitince ayrı bir "tamamlama ödülü"
// (bonus altın + garanti sandık, bkz. BattleTab#grantDungeonCompletionReward)
// ekleniyor. Bu ödüllerin KESİN tasarımı (özel zindan-only eşya vb.) henüz
// belirlenmedi — kullanıcı: "droplarını sonra belirleyeceğiz" — o yüzden
// şimdilik var olan genel loot tablosu + mütevazı bir bonus kullanılıyor.
export const SOLO_DUNGEON_DAILY_LIMIT = 3;

// Taban canavara göre HP/ATK/DEF/XP/Altın çarpanı — her aşama bir öncekinden
// belirgin şekilde daha güçlü, son (boss) aşaması en güçlüsü.
const REGULAR_STAGE_MULT = [1.0, 1.22, 1.48, 1.8, 2.2];
const BOSS_STAGE_MULT = 3.2;

export const SOLO_DUNGEON_STAGE_COUNT = REGULAR_STAGE_MULT.length + 1; // + boss

function scaleStage(base, mult) {
  return {
    hp: Math.round(base.hp * mult),
    atk: Math.round(base.atk * mult),
    def: Math.round(base.def * mult),
    xp: Math.round(base.xp * mult),
    goldMin: Math.round(base.goldMin * mult),
    goldMax: Math.round(base.goldMax * mult),
  };
}

// map: data/maps.js#MAPS'ten bir harita. Dönen dizi her zaman
// SOLO_DUNGEON_STAGE_COUNT uzunluğunda, son eleman isBoss:true taşır.
export function buildSoloDungeonStages(map) {
  const base = map.monsters[map.monsters.length - 1];
  const regular = REGULAR_STAGE_MULT.map((mult, i) => ({
    id: `dungeon_${map.id}_${i + 1}`,
    name: `${base.name} (Zindan ${i + 1})`,
    ...scaleStage(base, mult),
    isBoss: false,
  }));
  const boss = {
    id: `dungeon_${map.id}_boss`,
    name: `${map.name} Zindan Efendisi`,
    ...scaleStage(base, BOSS_STAGE_MULT),
    isBoss: true,
  };
  return [...regular, boss];
}
