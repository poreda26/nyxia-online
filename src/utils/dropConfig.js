import { MAPS } from "../data/maps";
import { WARZONE_BOSSES, WARZONE_HUNT_POWER_MULT, WARZONE_HUNT_GOLD_MULT, WARZONE_HUNT_DROP_MULT } from "../data/warzone";

// Kullanıcı isteği: "Tüm dropları düzenleyebileceğim bir sistem yapmanı
// istiyorum" + "ayrı bir yerden yönetmem mümkün mü" — bu dosya, oyunun
// TAMAMININ (normal harita canavarları, Savaş Alanı bossları, Canavar Ara,
// sandıklar) altın/xp/düşme oranlarının TEK okunabilir/yazılabilir kaynağı.
// Oyunun hiç sunucusu yok (bkz. login ekranı: "şifre yok, sunucu yok"), bu
// yüzden ayarlar da aynı tarayıcının localStorage'ında saklanıyor — ayrı
// admin.html sayfası (proje kökünde, sadece `npm run dev`de erişilebilir,
// production build'e HİÇ girmiyor çünkü vite.config.js'nin
// rollupOptions.input'u sadece index.html'i derliyor) buraya YAZIYOR, oyun
// buradan OKUYOR. İkisi de aynı origin'de çalıştığı sürece (aynı tarayıcı,
// aynı localhost:5173) localStorage paylaşılıyor — oyun sekmesini
// yeniledikçe yeni değerler devreye giriyor.
//
// Kapsam bilinçli olarak SADECE oran/miktar (altın, xp, %'ler) — eşya
// TIER'ı (map.tier, boss.lootTier) buraya dahil değil çünkü o equipment
// katalog bantlamasını belirliyor (bkz. data/itemRarity.js), yanlış
// ayarlanırsa T1 bir canavar T5 eşya düşürebilir gibi dengesiz sonuçlar
// doğurur — "drop" isteği "ne kadar/ne sıklıkta" anlamında yorumlandı.
const STORAGE_KEY = "nyxia_drop_config_v1";

export const DEFAULT_CHEST_WEAPON_PCT = 0.46;
export const DEFAULT_CHEST_ARMOR_PCT = 0.46; // kalan (1 - weaponPct - armorPct) aksesuara gidiyor
export const DEFAULT_SPECIAL_CHEST_UNIQUE_CHANCE = 0.03;

function buildDefaultDropConfig() {
  const maps = {};
  for (const map of MAPS) {
    const monsters = {};
    for (const m of map.monsters) {
      monsters[m.id] = { goldMin: m.goldMin, goldMax: m.goldMax, xp: m.xp, dropChance: map.dropChance, chestChance: map.chestChance };
    }
    maps[map.id] = { monsters };
  }
  const warzoneBosses = {};
  for (const boss of WARZONE_BOSSES) {
    warzoneBosses[boss.id] = {
      bonusGoldMin: boss.bonusGoldMin,
      bonusGoldMax: boss.bonusGoldMax,
      equipDropChance: boss.equipDropChance,
      chestDropChance: boss.chestDropChance,
      scrollDropChance: boss.scrollDropChance,
    };
  }
  return {
    maps,
    warzoneBosses,
    warzoneHunt: { powerMult: WARZONE_HUNT_POWER_MULT, goldMult: WARZONE_HUNT_GOLD_MULT, dropMult: WARZONE_HUNT_DROP_MULT },
    chests: { weaponPct: DEFAULT_CHEST_WEAPON_PCT, armorPct: DEFAULT_CHEST_ARMOR_PCT, specialUniqueChance: DEFAULT_SPECIAL_CHEST_UNIQUE_CHANCE },
  };
}

// Modül yüklenince bir kere hesaplanıyor — MAPS/WARZONE_BOSSES zaten sabit
// (module-load'da bir kere kurulan) veriler, tekrar tekrar inşa etmeye gerek yok.
export const DEFAULT_DROP_CONFIG = buildDefaultDropConfig();

// localStorage'daki kayıt eksik/eski şemalıysa (örn. oyuna yeni bir canavar
// eklendi ama admin.html'de henüz kaydedilmedi) her seviyede varsayılana
// düşüyor — hiçbir zaman "undefined altın aralığı" gibi bir çökmeye yol açmaz.
//
// Güvenlik testi bulgusu: `override` JSON.parse'tan geliyor (bkz.
// getDropConfig) ve `out[key] = ...` bracket-notation'ı — `override` içinde
// "__proto__" adında bir key varsa (biri localStorage'ı elle bozarsa) bu
// döngü normal bir veri key'i YAZMAZ, `out`'un prototipini değiştirir
// (utils/storage.js#readAccounts'taki aynı bug sınıfı). admin.html
// production'a hiç girmiyor ve bu ayar sadece o panelden yazılıyor, ama
// biri kendi localStorage'ını elle değiştirirse yine de bu davranışa
// takılır — tehlikeli key'leri baştan atlıyoruz.
const UNSAFE_MERGE_KEYS = new Set(["__proto__", "constructor", "prototype"]);
function deepMerge(base, override) {
  if (!override || typeof override !== "object" || Array.isArray(override)) return base;
  const out = { ...base };
  for (const key of Object.keys(override)) {
    if (UNSAFE_MERGE_KEYS.has(key)) continue;
    const bv = base?.[key];
    const ov = override[key];
    out[key] = (ov && typeof ov === "object" && !Array.isArray(ov) && bv && typeof bv === "object")
      ? deepMerge(bv, ov)
      : ov;
  }
  return out;
}

export function getDropConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DROP_CONFIG;
    return deepMerge(DEFAULT_DROP_CONFIG, JSON.parse(raw));
  } catch {
    return DEFAULT_DROP_CONFIG;
  }
}

// admin.html'in kullandığı yazma/sıfırlama — oyun tarafı bunları hiç çağırmıyor.
export function setDropConfig(fullConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fullConfig));
}
export function resetDropConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

// ---- Oyunun okuma noktaları ----

// utils/monsterRewards.js#grantMonsterReward — hem normal harita
// canavarları hem Canavar Ara (Crimson Battlefront canavarlarını kullanıyor)
// bu TEK fonksiyondan geçiyor.
export function getMonsterRewardConfig(monster, map) {
  const override = getDropConfig().maps?.[map.id]?.monsters?.[monster.id];
  return {
    goldMin: override?.goldMin ?? monster.goldMin,
    goldMax: override?.goldMax ?? monster.goldMax,
    xp: override?.xp ?? monster.xp,
    dropChance: override?.dropChance ?? map.dropChance,
    chestChance: override?.chestChance ?? map.chestChance,
  };
}

// WarzoneTab.jsx'in 6 rotasyonlu bossu için — null dönerse (hiç override
// yoksa) çağıran taraf boss'un kendi ham değerlerini kullanmaya devam eder.
export function getWarzoneBossConfig(bossId) {
  return getDropConfig().warzoneBosses?.[bossId] || null;
}

export function getWarzoneHuntConfig() {
  return getDropConfig().warzoneHunt;
}

export function getChestConfig() {
  return getDropConfig().chests;
}
