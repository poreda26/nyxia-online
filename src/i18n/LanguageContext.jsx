import { createContext, useContext, useCallback, useEffect } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);

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

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
