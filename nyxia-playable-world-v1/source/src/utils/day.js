// Günlük ("bugün mü, değil mi") karşılaştırmalar için paylaşılan tek bir
// gün anahtarı — klan zindanı/boss'u (utils/clan.js, utils/clanBoss.js),
// günlük giriş ödülü ve günlük görevler (utils/dailyLogin.js,
// utils/dailyQuests.js) hepsi aynı "bugün" tanımını kullanıyor.
export function todayKey() {
  return new Date().toDateString();
}
