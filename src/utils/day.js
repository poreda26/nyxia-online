// Günlük ("bugün mü, değil mi") karşılaştırmalar için paylaşılan tek bir
// gün anahtarı — klan zindanı/boss'u (utils/clan.js, utils/clanBoss.js),
// günlük giriş ödülü ve günlük görevler (utils/dailyLogin.js,
// utils/dailyQuests.js) hepsi aynı "bugün" tanımını kullanıyor.
//
// Gün sınırı herkes için (cihaz saat dilimi ne olursa olsun) İstanbul'dadır; sunucu ve istemci
// aynı "bugün"ü görür. Biçim eskisiyle aynı ("Sun Oct 04 2026"), İstanbul'daki kayıtlar bozulmaz.
const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;
export function dayKeyAt(ms) {
  const [weekday, day, month, year] = new Date(ms + ISTANBUL_OFFSET_MS).toUTCString().split(" ");
  return `${weekday.replace(",", "")} ${month} ${day} ${year}`;
}
export function todayKey() {
  return dayKeyAt(Date.now());
}
export function yesterdayKey() {
  return dayKeyAt(Date.now() - 24 * 60 * 60 * 1000);
}
