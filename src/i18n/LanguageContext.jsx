import { createContext, useContext, useCallback, useEffect } from "react";
import { translations } from "./translations";
import { monstersSection } from "./sections/monsters";
import { MAPS } from "../data/maps";

const LanguageContext = createContext(null);

// Günlük Solo Zindan'ın 5 normal aşaması (data/soloDungeon.js#
// buildSoloDungeonStages) Türkçe " (Zindan N)" ekini doğrudan `name` alanına
// gömüyor — o dosyayı değiştirmeden (loot/id eşlemelerini bozmamak için)
// bu deseni burada tanıyıp taban canavarın zaten sözlükte olan İngilizce
// adına "(Dungeon N)" ekliyoruz. "_risk" varyantı aynı taban aşamayı
// kullanıyor (Riskli/Güvenli Yol ayrımı zaten seçim modalının kendi
// etiketlerinde var, isimde tekrar etmesine gerek yok).
const DUNGEON_STAGE_RE = /^dungeon_([a-z_]+?)_(\d+)(?:_risk)?$/;
function translateDungeonStageName(id) {
  const match = DUNGEON_STAGE_RE.exec(id);
  if (!match) return null;
  const [, mapId, stageNum] = match;
  const map = MAPS.find((m) => m.id === mapId);
  const base = map?.monsters[map.monsters.length - 1];
  const baseName = base && monstersSection.en.monsters[base.id];
  return baseName ? `${baseName} (Dungeon ${stageNum})` : null;
}

// Canavar/boss görünen-ad çevirisi — data/maps.js, data/mapBosses.js ve
// data/soloDungeon.js'teki `name` alanları KASITLI olarak Türkçe kalıyor
// (loot/görev/id eşlemelerini bozmamak için, bkz. sections/monsters.js'in
// üstündeki not); bu yüzden ekranda gösterilecek ad t()'nin normal
// namespace.key sözlüğünden DEĞİL, doğrudan monstersSection'dan id'ye göre
// aranıyor. `en` dilinde bir çeviri yoksa (ya da dil `tr`'yse) her zaman
// çağıranın verdiği orijinal (Türkçe) `name` alanına düşer — asla boş/kırık
// bir ad göstermez.
export function translateMonsterName(lang, id, fallbackName) {
  if (lang !== "en" || !id) return fallbackName;
  if (monstersSection.en.monsters[id]) return monstersSection.en.monsters[id];
  return translateDungeonStageName(id) ?? fallbackName;
}

function lookup(dict, path) {
  let node = dict;
  for (const part of path.split(".")) {
    if (node == null) return undefined;
    node = node[part];
  }
  return node;
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}

// App.jsx kendisi LanguageProvider'ı SARDIĞI için useTranslation() hook'unu
// kullanamıyor (provider'ın DIŞINDA yaşıyor) — birkaç toast'ı orada
// çevirmek için t()'nin hook'suz halini burada ayrıca dışa açıyoruz.
// Pek çok utils fonksiyonu { ok:false, reason:"code", reasonVars? } döner
// (bkz. utils/clan.js, quests.js, accessoryUpgrade.js vb.) — "code" burada
// common.reason.* altında aranıyor, hiç eşleşme yoksa (ya da reason hiç
// yoksa) çağıranın verdiği varsayılan çeviri anahtarına düşülüyor.
// utils/inventory.js#addItemToInventory ise (BattleTab/WarzoneTab'ın kendi
// REASON_KEY haritalarıyla aynı sebeple, bkz. o dosyalardaki not) hâlâ ham
// Türkçe metin döndürüyor — withdrawFromBank üzerinden buraya da sızabildiği
// için aynı eşleme burada da tekrarlanıyor.
const RAW_REASON_KEY = { "ağırlık kapasitesi dolu.": "battle.reason.weightFull", "çanta dolu.": "battle.reason.bagFull" };
export function formatReason(t, result, fallbackKey) {
  if (!result?.reason) return fallbackKey ? t(fallbackKey) : "";
  if (RAW_REASON_KEY[result.reason]) return t(RAW_REASON_KEY[result.reason]);
  return t(`common.reason.${result.reason}`, result.reasonVars);
}

export function translateWith(lang, key, vars) {
  const primary = lookup(translations[lang], key);
  const value = primary ?? lookup(translations.tr, key);
  if (value == null) return key;
  return typeof value === "string" ? interpolate(value, vars) : value;
}

// Kullanıcı isteği: "İngilizce dil seçeneği ekle." — App.jsx bunu en dışta
// sarıyor, SettingsModal dili değiştiriyor. `t()` iki seviyeli (namespace.key)
// bir sözlükte arar; hedef dilde eksikse sessizce Türkçe'ye düşer (bkz.
// translations.js'in üstündeki not) — kısmi çeviri hiçbir zaman boş/kırık
// bir satır göstermez.
export function LanguageProvider({ lang, setLang, children }) {
  // index.html sabit lang="tr" ile başlıyor — düzeltilmezse CSS'teki
  // textTransform:uppercase, İngilizce metinlerde bile Türkçe büyük harf
  // kuralını uyguluyor (ör. "region" -> "REGİON", noktalı İ). Dil
  // değişince <html lang> da senkron değişmeli.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key, vars) => {
    const primary = lookup(translations[lang], key);
    const value = primary ?? lookup(translations.tr, key);
    if (value == null) return key;
    return typeof value === "string" ? interpolate(value, vars) : value;
  }, [lang]);

  // tm(monster): convenience wrapper around translateMonsterName for a
  // monster/boss object shaped like data/maps.js's entries ({ id, name }).
  const tm = useCallback((monster) => translateMonsterName(lang, monster?.id, monster?.name), [lang]);

  return <LanguageContext.Provider value={{ lang, setLang, t, tm }}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
