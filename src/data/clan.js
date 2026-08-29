// Klan sistemi — gerçek sunucu gelene kadar hem kurulan hem katılınan
// klanlar tamamen simüle (bkz. utils/clan.js). Bu dosya sadece sabitler.
export const CLAN_MAX_MEMBERS = 40;
export const CLAN_MAX_OFFICERS = 2;
export const CLAN_FOUND_COST_DIAMONDS = 500;

// En yüksek eşiğe göre TEK bir bonus uygulanır, üst üste binmez — 25 online
// üye "%2" alır, "%1 + %2" değil (bkz. utils/clan.js#clanExpBonus).
export const CLAN_EXP_TIERS = [
  { min: 31, bonus: 0.05 },
  { min: 21, bonus: 0.02 },
  { min: 11, bonus: 0.01 },
];

// NP bağışı — klandan ayrılınca oyuncunun KENDİ bağışladığı toplam NP'nin
// bu oranı geri veriliyor (kullanıcı isteği). Klanın diğer üyelerinin
// bağışları etkilenmez, sadece ayrılan oyuncunun kendi payı.
export const CLAN_NP_DONATION_REFUND_RATE = 0.35;

export const CLAN_NAMES = [
  "Kızıl Şafak", "Gölge Kardeşliği", "Demir Ahit", "Kutsal Meşale", "Kara Sancak",
  "Ejder Yürüyüşü", "Sessiz Kılıç", "Altın Şahin", "Fırtına Muhafızları", "Unutulmuş Tapınak",
  "Kan Yemini", "Ay Işığı Loncası", "Çelik Kardeşlik", "Son Umut", "Kadim Ocak",
];

export const CLAN_COLORS = ["#C9425A", "#4FC3D9", "#D4AF6A", "#8B6FC9", "#5FA8A0", "#C97A3D"];
