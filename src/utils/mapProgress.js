// Kullanıcı isteği: "Canavarlarda sırayla ilk canavardan 20 tane kesmeden
// 2. canavar açılmasın... Tüm haritalar için bir önceki haritadan tüm
// canavarlardan 20'şer tane kesilme şartı ekle." — hem harita içindeki
// canavar sırası hem haritalar arası geçiş aynı `player.monsterKills`
// sayacını kullanıyor (bkz. utils/monsterRewards.js#grantMonsterReward —
// her öldürmede bir artıyor, zaten Kaptan görevleri için tutuluyordu,
// burada ikinci bir amaçla okunuyor, ayrı bir sayaç eklenmedi).
//
// Bu şart haritanın kendi seviye kilidinin (data/maps.js#levelMin) YERİNE
// değil, ÜSTÜNE ekleniyor — ikisi de sağlanmalı. Zaten bir haritada bu
// kadar canavar öldürene kadar oyuncu doğal olarak seviye şartını da
// aşmış oluyor, ama seviye şartı kullanıcı isteğiyle kaldırılmadığı için
// duruyor.
export const KILLS_TO_UNLOCK_NEXT = 20;

export function monsterKillCount(player, monsterId) {
  return player.monsterKills?.[monsterId] || 0;
}

// map.monsters dizisindeki index'teki canavar açık mı — ilk canavar
// (index 0) her zaman açık, sonrakiler bir öncekinden KILLS_TO_UNLOCK_NEXT
// kesim ister.
export function isMonsterUnlocked(player, map, index) {
  if (index <= 0) return true;
  const prev = map.monsters[index - 1];
  return monsterKillCount(player, prev.id) >= KILLS_TO_UNLOCK_NEXT;
}

// allMaps dizisindeki mapIndex'teki harita, SEVİYE şartından bağımsız
// olarak (o ayrıca kontrol edilmeli) canavar-kesim şartını sağlıyor mu —
// ilk harita (index 0) bu şarttan muaf, sonrakiler bir önceki haritadaki
// HER canavardan KILLS_TO_UNLOCK_NEXT tane ister.
export function isMapProgressUnlocked(player, mapIndex, allMaps) {
  if (mapIndex <= 0) return true;
  const prevMap = allMaps[mapIndex - 1];
  return prevMap.monsters.every((m) => monsterKillCount(player, m.id) >= KILLS_TO_UNLOCK_NEXT);
}
