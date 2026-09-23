// Ses ayarları hesaba değil cihaza bağlı — bkz. App.jsx'teki müzik/efekt
// motorlarının kurulumu. localStorage okurken/yazarken tarayıcı izin
// vermezse (gizli sekme vb.) sessizce varsayılana düşer.
const KEYS = {
  musicVolume: "rpgmarket:musicVolume",
  musicMuted: "rpgmarket:musicMuted",
  sfxVolume: "rpgmarket:sfxVolume",
  sfxMuted: "rpgmarket:sfxMuted",
  language: "rpgmarket:language",
  theme: "rpgmarket:theme",
  haptics: "rpgmarket:haptics",
  reducedMotion: "rpgmarket:reducedMotion",
  effects: "rpgmarket:effects",
  highContrast: "rpgmarket:highContrast",
};

function readNum(key, fallback) {
  try {
    const v = parseInt(localStorage.getItem(key), 10);
    return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : fallback;
  } catch { return fallback; }
}
function readBool(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch { return fallback; }
}
function readStr(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

export function loadSettings() {
  return {
    musicVolume: readNum(KEYS.musicVolume, 55),
    musicMuted: readBool(KEYS.musicMuted, false),
    sfxVolume: readNum(KEYS.sfxVolume, 60),
    sfxMuted: readBool(KEYS.sfxMuted, false),
    language: readStr(KEYS.language, "tr") === "en" ? "en" : "tr",
    haptics: readBool(KEYS.haptics,true),
    reducedMotion: readBool(KEYS.reducedMotion,false),
    effects: readStr(KEYS.effects,"full") === "low" ? "low" : "full",
    highContrast: readBool(KEYS.highContrast,false),
    // Kullanıcı isteği: "Oyunumuz çok Dark temada, daha light bir tema
    // yapabiliriz" — cihaza bağlı bir tercih, diğerleriyle aynı desen.
    theme: readStr(KEYS.theme, "dark") === "light" ? "light" : "dark",
  };
}

export function saveSetting(key, value) {
  if(!KEYS[key])return;
  try { localStorage.setItem(KEYS[key], typeof value === "boolean" ? (value ? "1" : "0") : String(value)); } catch {}
}

export function applyDisplaySettings(settings) {
 const root=document.documentElement;
 root.dataset.theme=settings.theme;
 root.dataset.motion=settings.reducedMotion?'reduced':'full';
 root.dataset.effects=settings.effects;
 root.dataset.contrast=settings.highContrast?'high':'normal';
}
export function hapticsEnabled(){return readBool(KEYS.haptics,true);}
