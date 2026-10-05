// Sunucu ekonomisi açıkken değeri YALNIZCA sunucu eylemleriyle değişen oyuncu alanları. Sunucu bunları yedekten
// geri çevirir (server/game.mjs pin); istemci eylem hatasından sonra bunları sunucudan yeniden yükler (client.js resync).
// Canlı alanlar (hp, mp), arayüz tercihleri ve kozmetik seçimler bu listede değildir.
export const SERVER_OWNED_FIELDS = [
  // ekonomi
  "gold", "inventory", "equipped", "chests",
  // gelişim ve ilerleme
  "xp", "level", "statPoints", "stats", "skills", "class", "monsterKills", "claimedQuests", "claimedCollections", "awakened", "activeTitle",
  "dailyQuests", "weeklyQuests", "dailyLogin", "scheduledEvents", "tutorialGift", "wheelAppliedAt",
  // savaş, harita, forge
  "currentMapId", "mapBoss", "soloDungeon", "dungeonRun", "fight", "warzone", "huntSearch", "forge", "accForge", "activeBoosts", "eventExpBonus",
  // Savaş Alanı
  "nationalPoint", "weeklyPoint", "weekId", "pendingWeeklyClaim",
];
