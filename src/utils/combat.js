// KO'nun AC-bölme modeli: savunma hasarı hiçbir zaman tam sıfırlamıyor
// (payda hep K kadar pozitif kalıyor) ama azalan-getirili gerçek bir
// mitigasyon sağlıyor — eski `güç - savunma*sabit` çıkarma modelinin
// aksine, güçlendirme sistemiyle savunma saldırıya yetiştiğinde her
// vuruşun max(1,...) tabanına yapışma riski yok.
export function mitigate(rawPower, def, K) {
  return Math.max(0, rawPower) * K / (Math.max(0, def) + K);
}

// Fallow Valley'nin Nadas Devi'ne (def 15) karşı önceki turda canlı
// doğrulanmış hasarı (~44-47, crit ~90) korumak üzere kalibre edildi —
// bkz. plan dosyasının Doğrulama bölümü.
export const MONSTER_DEF_K = 120;
// RebalTest Priest'in (gearDef 0, o zamanki sınıf/seviye DEF'i devre dışı)
// Nadas Devi'den aldığı ~16-21 hasarı, artık devreye giren sınıf+seviye
// DEF'iyle birlikte benzer aralıkta tutmak üzere kalibre edildi.
export const PLAYER_DEF_K = 170;
