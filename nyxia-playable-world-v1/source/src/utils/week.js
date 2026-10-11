// ISO hafta kimliği ("2026-W35") — Weekly Point'in hangi haftaya ait
// olduğunu takip etmek için kullanılır (bkz. utils/nationalPoint.js). Kendi
// dosyasında duruyor çünkü hem utils/player.js (varsayılan değer) hem de
// utils/nationalPoint.js (haftalık geçiş kontrolü) buna ihtiyaç duyuyor —
// nationalPoint.js zaten utils/premium.js üzerinden player.js'e bağımlı,
// player.js'in de doğrudan nationalPoint.js'e bağımlı olması döngüsel import
// yaratırdı.
export function currentWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}
