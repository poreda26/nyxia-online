// Topluluk ödülü ("Tıkla ve Al"): Instagram'ı takip et / Discord'a katıl düğmesine basınca verilir, hesap başına bir kez.
// Doğrulama yoktur (sunucu tarafında bir API ile kontrol edilmez): amaç topluluğa katılımı teşvik etmektir.
// Sunucu (server/app.mjs 'social/claim') her platformu hesap başına yalnızca bir kez verir.
export const COMMUNITY_PLATFORMS = ["instagram", "discord"];
export const COMMUNITY_REWARD = { diamonds: 50, hpPotions: 5, mpPotions: 5, premiumTier: "mythic", premiumHours: 1 };
