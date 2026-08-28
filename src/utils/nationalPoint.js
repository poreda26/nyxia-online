import { premiumNpBonus, premiumNpLossReduction } from "./premium";
import { currentWeekId } from "./week";
import { leaderboardFor, WEEKLY_REWARDS } from "./leaderboard";
import { NP_LOSS_PENALTY, NP_RECOVERY_GOLD_COST, NP_RECOVERY_NP_AMOUNT } from "./nationalPointConstants";

const BASE_NATIONAL_POINT = 50;

// Karşı ırktan bir hayaleti PK'lediğinde kazanılan National Point — Apex
// +10, Mythic +25 (bkz. data/premium.js#nationalPointBonus).
export function nationalPointGain(player) {
  return BASE_NATIONAL_POINT + premiumNpBonus(player);
}

export function awardNationalPoint(player) {
  const gain = nationalPointGain(player);
  return {
    player: { ...player, nationalPoint: player.nationalPoint + gain, weeklyPoint: player.weeklyPoint + gain },
    gain,
  };
}

// Bir PvP düellosunu kaybedince (ya da onaylı "Geri Çekil" ile pes edince)
// 50 National Point (ve aynı miktar Weekly Point) kaybedilir — Mythic bu
// kaybı %10, Apex %5 azaltır (bkz. data/premium.js#nationalPointLossReduction,
// kazanım tarafındaki bonustan farklı bir alan). 0'ın altına inmez.
export function penalizeNationalPoint(player) {
  const loss = Math.round(NP_LOSS_PENALTY * (1 - premiumNpLossReduction(player)));
  return {
    ...player,
    nationalPoint: Math.max(0, player.nationalPoint - loss),
    weeklyPoint: Math.max(0, player.weeklyPoint - loss),
  };
}

// Kaptan'ın National Point takviyesi — SADECE National Point'i tamamen
// tükenmiş (0'a düşmüş, bu yüzden Savaş Alanı'na giremeyen) oyuncular
// altın karşılığında yeniden National Point satın alabilir. Altınla
// istenildiği kadar National Point biriktirilebilecek bir şey değil —
// hâlâ National Point'i olan biri bu teklifi kullanamaz (bkz.
// components/CaptainTab.jsx).
export function canBuyNationalPoint(player) {
  return player.nationalPoint <= 0 && player.gold >= NP_RECOVERY_GOLD_COST;
}

export function buyNationalPoint(player) {
  if (player.nationalPoint > 0) return { player, bought: false, reason: "National Point'in hâlâ var — bu teklif sadece 0'a düşünce açılır." };
  if (player.gold < NP_RECOVERY_GOLD_COST) return { player, bought: false, reason: "Yeterli altının yok." };
  return {
    player: {
      ...player,
      gold: player.gold - NP_RECOVERY_GOLD_COST,
      nationalPoint: player.nationalPoint + NP_RECOVERY_NP_AMOUNT,
      weeklyPoint: player.weeklyPoint + NP_RECOVERY_NP_AMOUNT,
    },
    bought: true,
  };
}

// Karakter her yüklendiğinde çağrılır (bkz. App.jsx#handlePlay, migratePlayer
// hemen sonrasında). Gerçek hafta player.weekId'den farklıysa: oyuncunun
// ÇIKIŞ haftasındaki (player.weekId) sırasını bulur, ilk 3'teyse elmas verir
// (bkz. utils/leaderboard.js#WEEKLY_REWARDS), sonra weeklyPoint'i sıfırlayıp
// yeni haftaya geçer. Hâlâ aynı haftadaysa no-op.
export function applyWeeklyRollover(player) {
  const nowWeek = currentWeekId();
  if (player.weekId === nowWeek) return { player, diamondsAwarded: 0, rank: null };

  const standings = leaderboardFor(player.race, player.class, player.weekId, player, "weeklyPoint");
  const own = standings.find((e) => e.isPlayer);
  const rank = own ? own.rank : null;
  const diamondsAwarded = rank && rank <= WEEKLY_REWARDS.length ? WEEKLY_REWARDS[rank - 1] : 0;

  return {
    player: { ...player, diamonds: player.diamonds + diamondsAwarded, weeklyPoint: 0, weekId: nowWeek },
    diamondsAwarded,
    rank,
  };
}
