import { CLASSES } from "../data/classes";
import { ghostNamesForRace } from "../data/warzoneNames";
import { seededRng, seededShuffle } from "./seededRng";

export const WEEKLY_REWARDS = [7000, 4000, 2000]; // index 0 = 1. sıra

// Sıralama tablolarındaki sahte (decoy) kayıtlar — gerçek oyuncu gelene
// kadar `race:cls:weekId` string'inden türetilen deterministik bir seed
// kullanır, böylece aynı hafta içinde tablo sabit kalır ama hafta değişince
// (bkz. utils/week.js#currentWeekId) yeni bir dağılıma geçer.
function decoyLeaderboard(race, cls, weekId) {
  const rng = seededRng(`${race}:${cls}:${weekId}`);
  const names = seededShuffle(ghostNamesForRace(race), rng).slice(0, 7);
  return names.map((name) => ({
    name,
    nationalPoint: Math.round(400 + rng() * 4200),
    weeklyPoint: Math.round(rng() * 950),
  }));
}

// Belirtilen ırk×sınıf (job) tablosunu döner — oyuncu o ırk/sınıftaysa kendi
// GERÇEK skoruyla listeye eklenir (isPlayer: true), aksi halde sadece
// decoy'lar görünür. `sortBy`: "weeklyPoint" (varsayılan, haftalık görünüm)
// ya da "nationalPoint" (kalıcı görünüm). `weekId` çağıran tarafından
// verilir ki utils/nationalPoint.js#applyWeeklyRollover geçmiş haftanın
// tablosunu da sorgulayabilsin.
export function leaderboardFor(race, cls, weekId, player, sortBy = "weeklyPoint") {
  const entries = decoyLeaderboard(race, cls, weekId).map((e) => ({ ...e, isPlayer: false }));
  if (player && player.race === race && player.class === cls) {
    entries.push({
      name: player.nickname || CLASSES[cls]?.name || "Sen",
      nationalPoint: player.nationalPoint || 0,
      weeklyPoint: player.weeklyPoint || 0,
      isPlayer: true,
    });
  }
  entries.sort((a, b) => b[sortBy] - a[sortBy]);
  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}
