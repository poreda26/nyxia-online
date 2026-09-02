import { ACHIEVEMENTS } from "../data/achievements";

function totalKills(player) {
  return Object.values(player.monsterKills || {}).reduce((s, n) => s + n, 0);
}

export function isAchievementUnlocked(player, ach) {
  switch (ach.type) {
    case "kills": return totalKills(player) >= ach.target;
    case "level": return player.level >= ach.target;
    case "awakened": return !!player.awakened;
    case "flag": return !!player.milestones?.[ach.flag];
    case "counter": return (player.milestones?.[ach.counter] || 0) >= ach.target;
    default: return false;
  }
}

export function unlockedAchievements(player) {
  return ACHIEVEMENTS.filter((a) => isAchievementUnlocked(player, a));
}

// prevPlayer/nextPlayer arasında YENİ açılan başarımları döner — kilit
// açılma anını yakalayıp bildirim (toast) göstermek isteyen her çağıran
// (BattleTab, UpgradeTab, WarzoneTab, InventoryTab, ClanTab) aynı diff
// mantığını tekrarlamasın diye tek bir yerden.
export function newlyUnlocked(prevPlayer, nextPlayer) {
  return ACHIEVEMENTS.filter((a) => !isAchievementUnlocked(prevPlayer, a) && isAchievementUnlocked(nextPlayer, a));
}

// Aktif unvan olarak sadece kilidi zaten açılmış bir başarımın unvanı
// seçilebilir. Hiçbir başarım kilidi sonradan kapanmadığı için (hepsi
// kalıcı/monoton, bkz. data/achievements.js'in üstündeki not) seçili bir
// unvan bir daha asla geçersiz hale gelmez.
export function setActiveTitle(player, achievementId) {
  if (achievementId === null) return { ...player, activeTitle: null };
  const ach = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!ach || !isAchievementUnlocked(player, ach)) return player;
  return { ...player, activeTitle: achievementId };
}

// TopBar'da isminin yanında gösterilecek metin+renk — activeTitle boşsa ya
// da (teorik olarak hiç olmaması gereken bir durumda) artık kilidi açık
// değilse null döner.
export function activeTitleInfo(player) {
  if (!player.activeTitle) return null;
  const ach = ACHIEVEMENTS.find((a) => a.id === player.activeTitle);
  if (!ach || !isAchievementUnlocked(player, ach)) return null;
  return { text: ach.title, color: ach.color };
}
