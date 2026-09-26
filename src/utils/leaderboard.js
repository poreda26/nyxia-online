import { CLASSES } from "../data/classes";

export const WEEKLY_REWARDS = [7000, 4000, 2000]; // index 0 = 1. sıra

// Kullanıcı isteği: "Artık bot oyuncular klanlar pazarlar yok" — sahte
// (decoy) sıralama kayıtları kaldırıldı. Gerçek başka oyuncuları listelemek
// için paylaşımlı bir backend gerekiyor, henüz yok; bu yüzden tablo artık
// sadece (varsa) oyuncunun KENDİ girdisini gösteriyor. `sortBy` parametresi
// (utils/nationalPoint.js#applyWeeklyRollover'ın geçmiş hafta sorgusu için)
// korunuyor ama artık tek satırlık bir listede sıralamanın bir etkisi yok.
export function leaderboardFor(race, cls, weekId, player, sortBy = "weeklyPoint") {
  if (player && player.race === race && player.class === cls) {
    return [{
      name: player.nickname || CLASSES[cls]?.name || "Sen",
      nationalPoint: player.nationalPoint || 0,
      weeklyPoint: player.weeklyPoint || 0,
      isPlayer: true,
      rank: 1,
    }];
  }
  return [];
}
