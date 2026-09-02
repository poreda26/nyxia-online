import { todayKey } from "./day";
import { DAILY_LOGIN_REWARDS } from "../data/dailySystems";
import { highestUnlockedMap } from "../data/maps";
import { addItemToInventory, makeScrollStack, makeBonusScrollStack } from "./inventory";
import { uid } from "./random";

// Günlük giriş ödülü — kullanıcı isteği: her gün geri gelmek için somut bir
// sebep. Bir gün sadece BİR KEZ alınabilir (lastClaimDay bugünse tekrar
// alınamaz); ard arda gelinen her gün streak +1 artar, bir gün ATLANIRSA
// (dün giriş yapılmamışsa) streak 1'e döner — gerçek bir "kesintisiz giriş"
// zinciri. Ödül DAILY_LOGIN_REWARDS'ın 7 günlük döngüsünden gelir (streak
// 8. günde tekrar 1. güne sarar), streak sayacının kendisi hiç sıfırlanmaz
// (sadece hangi ödülün gösterileceğini belirler).
function yesterdayKey() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
}

function freshLogin() {
  return { streak: 0, lastClaimDay: null };
}

function nextStreakFor(login) {
  if (login.lastClaimDay === todayKey()) return login.streak;
  return login.lastClaimDay === yesterdayKey() ? login.streak + 1 : 1;
}

function cycleReward(streak) {
  return DAILY_LOGIN_REWARDS[(streak - 1) % DAILY_LOGIN_REWARDS.length];
}

export function canClaimDailyLogin(player) {
  const login = player.dailyLogin || freshLogin();
  return login.lastClaimDay !== todayKey();
}

// Claim'e basmadan önce modalda "bugün ne kazanacaksın" göstermek için.
export function previewDailyLoginReward(player) {
  const login = player.dailyLogin || freshLogin();
  const streak = nextStreakFor(login);
  return { streak, reward: cycleReward(streak) };
}

export function claimDailyLogin(player) {
  if (!canClaimDailyLogin(player)) return { player, claimed: false, reason: "Bugünkü ödülünü zaten aldın." };
  const login = player.dailyLogin || freshLogin();
  const streak = nextStreakFor(login);
  const reward = cycleReward(streak);

  let p = { ...player, gold: player.gold + reward.gold, diamonds: player.diamonds + reward.diamonds };
  if (reward.scrollCount > 0) {
    p = addItemToInventory(p, makeScrollStack(1, reward.scrollCount)).player;
  }
  if (reward.bonusScroll) {
    p = addItemToInventory(p, makeBonusScrollStack()).player;
  }
  if (reward.chestTier === "map") {
    const tier = highestUnlockedMap(p.level).tier;
    p = { ...p, chests: [...p.chests, { id: uid(), tier }] };
  }
  p = { ...p, dailyLogin: { streak, lastClaimDay: todayKey() } };
  return { player: p, claimed: true, reward, streak };
}
