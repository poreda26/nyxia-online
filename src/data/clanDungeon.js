// Klan Dungeon (Clan Raid) — kullanıcının pasted spec'i: 40 oyuncu (zaten
// data/clan.js#CLAN_MAX_MEMBERS ile eşleşiyor, ayrı sabit gerekmiyor),
// oyuncu başı günde 2 giriş, 1. girişten sonra 2. giriş için 20dk bekleme,
// sunucu saatiyle her gün 00:00 sıfırlanma, 20 canavarlık sıralı bir
// zindan (10. = Mid-Boss, 20. = Final Boss), aşama arttıkça HP/ATK/DEF
// katlanarak büyüyor, boss aşamaları ekstra çarpan alıyor. Loot bilerek
// ayrı bir modüler katman olarak eklendi (kullanıcının kendi isteği):
// "her klan seviyesi için 4 farklı malzeme... ticarete açık... klan
// dungeon'daki canavar ve bosslardan düşecek" — bu dosyada hem 20 aşamalı
// güçlenme eğrisi hem de o 4 malzeme birlikte tanımlı.
export const TOTAL_STAGES = 20;
export const MID_BOSS_INDEX = 10;
export const FINAL_BOSS_INDEX = 20;

export const CLAN_DUNGEON_DAILY_ENTRIES = 2;
export const CLAN_DUNGEON_COOLDOWN_MS = 20 * 60 * 1000; // 1. giriş sonrası 2. giriş için bekleme
// Gerçek "bağlantı koptu" tespiti yok (websocket'siz, oturum bazlı istek-cevap
// mimarisi) — bir oyuncu zindanı kilitleyip sayfayı kapatırsa kilidin sonsuza
// kadar takılı kalmaması için bu süre sonunda otomatik açılıyor (bkz.
// server/app.mjs'teki kilit kontrolü).
export const CLAN_DUNGEON_LOCK_TIMEOUT_MS = 5 * 60 * 1000;

const BASE_MONSTER = { hp: 400, atk: 22, def: 18, xp: 60, goldMin: 15, goldMax: 30 };
const STAGE_GROWTH = 1.15; // her aşamada ~%15 güçlenme (bileşik)
const MID_BOSS_BONUS_MULT = 1.6;
const FINAL_BOSS_BONUS_MULT = 2.4;

function stageMultiplier(index) {
  let mult = STAGE_GROWTH ** (index - 1);
  if (index === MID_BOSS_INDEX) mult *= MID_BOSS_BONUS_MULT;
  if (index === FINAL_BOSS_INDEX) mult *= FINAL_BOSS_BONUS_MULT;
  return mult;
}

// HP mult ile tam orantılı büyürken ATK/DEF çok daha yavaş büyüyor (aynı
// desen data/soloDungeon.js#scaleStage'te de var) — 20. aşamada HP ~30 kat
// olsa bile ATK/DEF makul kalıyor, savaş oynanabilir kalıyor.
function scaleStage(base, mult) {
  return {
    hp: Math.round(base.hp * mult),
    atk: Math.round(base.atk * (1 + (mult - 1) * 0.15)),
    def: Math.round(base.def * (1 + (mult - 1) * 0.10)),
    xp: Math.round(base.xp * mult),
    goldMin: Math.round(base.goldMin * mult),
    goldMax: Math.round(base.goldMax * mult),
  };
}

export function clanDungeonStage(index) {
  const clamped = Math.min(TOTAL_STAGES, Math.max(1, index));
  const isMidBoss = clamped === MID_BOSS_INDEX;
  const isFinalBoss = clamped === FINAL_BOSS_INDEX;
  return {
    index: clamped,
    name: isFinalBoss ? "Klan Zindanı Efendisi" : isMidBoss ? "Klan Zindanı Gözcüsü" : `Klan Zindanı Canavarı ${clamped}`,
    isBoss: isMidBoss || isFinalBoss,
    isMidBoss,
    isFinalBoss,
    ...scaleStage(BASE_MONSTER, stageMultiplier(clamped)),
  };
}

// 4 malzeme, zindanın kendi 4 doğal aşama bandına bağlı: erken normal
// canavarlar (1-9) → Odun (şans), Mid-Boss (10) → Gümüş (garanti), geç
// normal canavarlar (11-19) → Demir (şans), Final Boss (20) → Altın Külçesi
// (garanti) — kullanıcı isteği: "odun gümüş altın gibi 4 tane mantıklı
// temamıza uygun malzeme", inşaat/kuşanım temalı klasik hammaddeler, Klan
// Binası'nı yükseltmekle tematik olarak da örtüşüyor. Görselleri kullanıcı
// kendi üretecek — ItemIcon.jsx zaten HER item kind'i için item.name'e göre
// data/itemImages.js#itemImageFor'a bakıyor, o yüzden görsel eklenince
// sadece o dosyaya "Odun"/"Demir"/"Gümüş"/"Altın Külçesi" girişleri eklemek
// yeterli — burada ekstra kod değişikliği gerekmiyor.
// NOT: anahtar "gold" DEĞİL "goldBar" — klanın gerçek "gold" (altın) para
// birimi anahtarıyla (bkz. server/app.mjs#/api/clan/donate'in currency
// alanı) çakışmasın diye bilerek farklı. Aynı ada iki farklı anlam (gerçek
// altın PARA vs. bu malzeme) vermek, bağış uç noktasında hangi hazine
// kolonunun güncelleneceğini belirsizleştirir — canlıda gerçek altın
// bağışının yanlışlıkla malzeme hazinesine yazılmasına yol açan bir bug
// olarak yakalandı, bu yüzden kalıcı olarak ayrı tutuluyor.
export const CLAN_DUNGEON_MATERIALS = {
  wood: { key: "wood", id: "clan-material-wood", name: "Odun", tier: 1, color: "#8B5A2B", dropChance: 0.35 },
  silver: { key: "silver", id: "clan-material-silver", name: "Gümüş", tier: 2, color: "#B8C2CC", dropChance: 1 },
  iron: { key: "iron", id: "clan-material-iron", name: "Demir", tier: 3, color: "#8C92AC", dropChance: 0.35 },
  goldBar: { key: "goldBar", id: "clan-material-gold-bar", name: "Altın Külçesi", tier: 4, color: "#D4AF6A", dropChance: 1 },
};

// Sunucuda çağrılıyor (bkz. server/app.mjs'teki attack endpoint'i) — şans
// otoriter olsun diye Math.random() burada, istemci "düştü" diyemiyor.
export function rollClanDungeonMaterial(stageIndex) {
  let key;
  if (stageIndex === MID_BOSS_INDEX) key = "silver";
  else if (stageIndex === FINAL_BOSS_INDEX) key = "goldBar";
  else if (stageIndex < MID_BOSS_INDEX) key = "wood";
  else key = "iron";
  const def = CLAN_DUNGEON_MATERIALS[key];
  return { key, dropped: Math.random() < def.dropChance };
}

// Klan Binası yükseltmesi artık altın/elmas (bkz. data/clanBoss.js#CLAN_BUILDING_UPGRADE_COST,
// değişmedi) ÜSTÜNE bu 4 malzemeyi de istiyor — kullanıcı isteği: "her klan
// seviyesi için 4 farklı malzeme istesin". Ucuz/erken malzemeler yüksek
// seviyede de daha bol isteniyor, nadir boss ganimetleri her zaman az.
export const CLAN_BUILDING_MATERIAL_COST = {
  2: { wood: 60, silver: 15, iron: 10, goldBar: 3 },
  3: { wood: 120, silver: 40, iron: 30, goldBar: 8 },
  4: { wood: 200, silver: 80, iron: 70, goldBar: 20 },
  5: { wood: 320, silver: 140, iron: 130, goldBar: 45 },
};
