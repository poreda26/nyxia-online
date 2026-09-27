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
// canavarlar (1-9) → Kök Parçası (şans), Mid-Boss (10) → Gözcü Nişanı
// (garanti), geç normal canavarlar (11-19) → Alacakaranlık Özü (şans),
// Final Boss (20) → Efendi Mührü (garanti). Renkler CLAN_BOSS_STAGES'teki
// paletle bilerek aynı (bkz. data/clanBoss.js) — iki klan sistemi görsel
// olarak aynı aileden hissettirsin diye.
export const CLAN_DUNGEON_MATERIALS = {
  rootFragment: { key: "rootFragment", id: "clan-material-root-fragment", name: "Kök Parçası", tier: 1, color: "#8FA35E", dropChance: 0.35 },
  midBossTrophy: { key: "midBossTrophy", id: "clan-material-midboss-trophy", name: "Gözcü Nişanı", tier: 2, color: "#C97A3D", dropChance: 1 },
  twilightEssence: { key: "twilightEssence", id: "clan-material-twilight-essence", name: "Alacakaranlık Özü", tier: 3, color: "#6FD1E0", dropChance: 0.35 },
  finalBossTrophy: { key: "finalBossTrophy", id: "clan-material-finalboss-trophy", name: "Efendi Mührü", tier: 4, color: "#A34FD9", dropChance: 1 },
};

// Sunucuda çağrılıyor (bkz. server/app.mjs'teki attack endpoint'i) — şans
// otoriter olsun diye Math.random() burada, istemci "düştü" diyemiyor.
export function rollClanDungeonMaterial(stageIndex) {
  let key;
  if (stageIndex === MID_BOSS_INDEX) key = "midBossTrophy";
  else if (stageIndex === FINAL_BOSS_INDEX) key = "finalBossTrophy";
  else if (stageIndex < MID_BOSS_INDEX) key = "rootFragment";
  else key = "twilightEssence";
  const def = CLAN_DUNGEON_MATERIALS[key];
  return { key, dropped: Math.random() < def.dropChance };
}

// Klan Binası yükseltmesi artık altın/elmas (bkz. data/clanBoss.js#CLAN_BUILDING_UPGRADE_COST,
// değişmedi) ÜSTÜNE bu 4 malzemeyi de istiyor — kullanıcı isteği: "her klan
// seviyesi için 4 farklı malzeme istesin". Ucuz/erken malzemeler yüksek
// seviyede de daha bol isteniyor, nadir boss ganimetleri her zaman az.
export const CLAN_BUILDING_MATERIAL_COST = {
  2: { rootFragment: 60, midBossTrophy: 15, twilightEssence: 10, finalBossTrophy: 3 },
  3: { rootFragment: 120, midBossTrophy: 40, twilightEssence: 30, finalBossTrophy: 8 },
  4: { rootFragment: 200, midBossTrophy: 80, twilightEssence: 70, finalBossTrophy: 20 },
  5: { rootFragment: 320, midBossTrophy: 140, twilightEssence: 130, finalBossTrophy: 45 },
};
