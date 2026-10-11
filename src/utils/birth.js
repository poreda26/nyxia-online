// Yaş kapısı yardımcıları. Sunucu da aynı kuralı uygular (server/age.mjs); buradaki kontrol yalnızca kullanıcıyı erken uyarır.
export const MIN_AGE = 13;
export const ADULT_AGE = 18;
const BLOCK_KEY = "nyxia:agegate:blocked";

export const todayIso = () => new Date().toISOString().slice(0, 10);

// "YYYY-MM-DD" → tam yaş; geçersiz ya da gelecek tarih için null.
export function ageFromBirth(value, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [y, m, d] = value.split("-").map(Number);
  const born = new Date(Date.UTC(y, m - 1, d));
  if (born.getUTCFullYear() !== y || born.getUTCMonth() !== m - 1 || born.getUTCDate() !== d || y < 1900 || born > now) return null;
  let age = now.getUTCFullYear() - y;
  if (now.getUTCMonth() + 1 < m || (now.getUTCMonth() + 1 === m && now.getUTCDate() < d)) age -= 1;
  return age;
}

// Yaş sınırının altında bir tarih girildiyse bu cihazda hemen yeniden denemeyi engellemek için işaret bırakılır (yalnızca rahatsız edici bir bariyer).
export const rememberAgeBlock = () => { try { localStorage.setItem(BLOCK_KEY, "1"); } catch { /* depolama kapalı */ } };
export const ageBlocked = () => { try { return localStorage.getItem(BLOCK_KEY) === "1"; } catch { return false; } };

// Çeviri anahtarı döner; sorun yoksa null. Eşik değeri kullanıcıya gösterilmez (tarafsız yaş ekranı).
export function birthProblem(value) {
  if (ageBlocked()) return "login.underAgeError";
  const age = ageFromBirth(value);
  if (age === null) return "login.birthRequiredError";
  if (age < MIN_AGE) { rememberAgeBlock(); return "login.underAgeError"; }
  return null;
}
