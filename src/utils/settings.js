// Ses ayarları hesaba değil cihaza bağlı — bkz. App.jsx'teki müzik/efekt
// motorlarının kurulumu. localStorage okurken/yazarken tarayıcı izin
// vermezse (gizli sekme vb.) sessizce varsayılana düşer.
const KEYS = {
  musicVolume: "rpgmarket:musicVolume",
  musicMuted: "rpgmarket:musicMuted",
  sfxVolume: "rpgmarket:sfxVolume",
  sfxMuted: "rpgmarket:sfxMuted",
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

export function loadSettings() {
  return {
    musicVolume: readNum(KEYS.musicVolume, 55),
    musicMuted: readBool(KEYS.musicMuted, false),
    sfxVolume: readNum(KEYS.sfxVolume, 60),
    sfxMuted: readBool(KEYS.sfxMuted, false),
  };
}

export function saveSetting(key, value) {
  try { localStorage.setItem(KEYS[key], typeof value === "boolean" ? (value ? "1" : "0") : String(value)); } catch {}
}
