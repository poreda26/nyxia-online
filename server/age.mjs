// Yaş kontrolü: kayıtta doğum tarihi alınır. MIN_AGE'den küçükler hesap açamaz; 18 yaş altı "reşit değil" sayılır.
// Doğum tarihi yalnızca bu eşiği hesaplamak ve yaşa uygun davranmak için saklanır (gizlilik politikasında belirtilir).
export const MIN_AGE = 13;
export const ADULT_AGE = 18;

// "YYYY-MM-DD" gerçek bir takvim günü mü (gelecek olmayan, 1900'den sonra)?
export function parseBirthDate(value, now = Date.now()) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  if (year < 1900 || date.getTime() > now) return null;
  return { year, month, day };
}

export function ageOf({ year, month, day }, now = Date.now()) {
  const today = new Date(now);
  let age = today.getUTCFullYear() - year;
  if (today.getUTCMonth() + 1 < month || (today.getUTCMonth() + 1 === month && today.getUTCDate() < day)) age -= 1;
  return age;
}

// Geçerli tarih ve yeterli yaş şartı; yoksa uygun hatayı fırlatır. Geçerliyse "YYYY-MM-DD" döner.
export function requireAdultEnough(fail, value, now = Date.now()) {
  const parsed = parseBirthDate(value, now);
  if (!parsed) throw fail(400, 'INVALID_BIRTHDATE');
  if (ageOf(parsed, now) < MIN_AGE) throw fail(403, 'UNDER_AGE');
  return value;
}
