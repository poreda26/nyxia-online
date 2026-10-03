// Elmas harcamalarının TEK fiyat listesi — sunucu (server/wallet.mjs) bu dosyayı
// kullanarak her harcamanın bedelini kendisi belirler; istemcinin gönderdiği
// fiyata asla güvenilmez. Saf JS, hiç import yok (sunucu doğrudan yükleyebilsin).
// Oyundaki asıl veri dosyaları (premium, kanat, takviye, boya...) ile aynı
// olduğu tests/world.test.js'teki "fiyat listesi veri dosyalarıyla eşleşir"
// testiyle korunur: biri değişip diğeri unutulursa test düşer.
export const DIAMOND_PRICES = {
  premium: { mythic: 3000, apex: 1500 },
  wings: 2000,
  boostPack: { exp: 600, gold: 500, atk: 500, np: 350, def: 300, hp: 300 },
  bonusScroll: 800,
  raceScroll: 500,
  jobScroll: 1500,
  dye: { crimson: 250, azure: 250, emerald: 250, violet: 300, gold: 400, obsidian: 400 },
  avatarCosmetic: 250,
  bankPage: 400,
  dungeonEntry: 150,
  clanFound: 500,
  slotUnlock: 500,
  characterDelete: 500,
};

// Günlük giriş döngüsünün elmas kısmı (gün 1..7). Altın/parşömen/sandık hâlâ
// istemcide; elmas sunucudan.
export const DAILY_LOGIN_DIAMONDS = [0, 0, 0, 0, 0, 5, 15];

// Haftalık Savaş Alanı sıralaması ödülü (1., 2., 3.).
export const WEEKLY_RANK_REWARDS = [7000, 4000, 2000];

// kind + key -> fiyat (tamsayı) ya da geçersizse null.
export function diamondPrice(kind, key) {
  const entry = DIAMOND_PRICES[kind];
  if (entry === undefined) return null;
  const value = typeof entry === 'number' ? entry : entry[key];
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
