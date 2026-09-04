import { Sparkles } from "lucide-react";

// Belirli saatlerde (cihazın yerel saatine göre — sunucu olmadığı için
// gerçek bir "herkes aynı anda" senkronu yok, bkz. utils/scheduledEvents.js'in
// üstündeki not) her gün tekrarlayan dünya etkinlikleri. Kullanıcı isteği:
// "öğlen 12.30'da açılacak... katılan oyuncular her 2 dakikada bir kendi
// leveline göre %3 exp kazanacak... 10 dakika sürecek... toplam %15 exp...
// etkinlik alanı 5dk erken açılacak, vakti geldiğinde geri sayımla açılacak."
export const SCHEDULED_EVENTS = [
  {
    id: "noon_exp_rush",
    name: "Öğlen EXP Rush",
    icon: Sparkles,
    color: "#D4AF6A",
    hour: 12, minute: 30, // günlük başlama saati (yerel saat)
    preOpenMinutes: 5, // etkinlik alanı bu kadar erken açılır (geri sayımla)
    durationMinutes: 10,
    tickIntervalMinutes: 2, // her tick'te tickPercent kadar XP
    tickPercent: 3, // xpToNext(level)'in yüzdesi — 5 tick x %3 = toplam %15
  },
];
