// Günlük giriş ödülü + günlük görevler — kullanıcı isteği: "insanlar nasıl
// daha çok eğlenebilir" sorusuna verdiğimiz iki öneriden ilki (diğeri bir
// başarım/unvan sistemi, henüz yapılmadı). İkisi de her gün geri gelmek
// için somut bir sebep yaratıyor.

// 7 günlük bir döngü, 7. gün en büyük ödül — sonra 8. gün 1. güne döner
// (streak sayacı büyümeye devam eder, sadece ödül döngüsü sarmalanır).
// chestTier: null ise sandık yok, "map" ise oyuncunun şu an açık olan en
// yüksek haritasının tier'ı (bkz. utils/dailyLogin.js#dailyLoginReward).
export const DAILY_LOGIN_REWARDS = [
  { day: 1, gold: 100, diamonds: 0, scrollCount: 0, chestTier: null, bonusScroll: false },
  { day: 2, gold: 200, diamonds: 0, scrollCount: 0, chestTier: null, bonusScroll: false },
  { day: 3, gold: 150, diamonds: 0, scrollCount: 3, chestTier: null, bonusScroll: false },
  { day: 4, gold: 400, diamonds: 0, scrollCount: 0, chestTier: null, bonusScroll: false },
  { day: 5, gold: 250, diamonds: 0, scrollCount: 0, chestTier: "map", bonusScroll: false },
  { day: 6, gold: 300, diamonds: 5, scrollCount: 0, chestTier: null, bonusScroll: false },
  { day: 7, gold: 800, diamonds: 15, scrollCount: 0, chestTier: null, bonusScroll: true },
];

// Günlük görevler — Kaptan'ın kalıcı canavar-görevlerinden AYRI, her gün
// sıfırlanan 3 basamaklı bir "bugün X canavar öldür" merdiveni. Kullanıcının
// canavar-bazlı kalıcı görev sistemini (data/quests.js#MONSTER_QUESTS)
// tekrar icat etmek yerine oyuncunun GÜNLÜK öldürme sayacını (bkz.
// utils/dailyQuests.js) kullanıyor — hangi canavarı/haritayı seçtiği
// önemli değil, sadece bugün kaç canavar öldürdüğü.
export const DAILY_QUEST_SLOTS = [
  { target: 10, goldReward: 150, xpReward: 400, chest: false },
  { target: 25, goldReward: 400, xpReward: 1000, chest: false },
  { target: 50, goldReward: 900, xpReward: 2200, chest: true },
];
