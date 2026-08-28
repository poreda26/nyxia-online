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

// Gerçek KO araştırması (Ebenezer/User.cpp#SetUserAbility, satır 4213-4221):
// DEX archer/rogue hasarına ek olarak Hit Rate VE Evasion Rate'i de
// besliyor — "1 + katsayı*Seviye*DEX" şeklinde, saldıranın Hit Rate'i
// savunanın Evasion Rate'ine karşı bir olasılık oranı oluşturuyor. Bizim
// motorumuzda bu, saldıranın/savunanın DEX farkına ve saldıranın
// seviyesine göre 0.55-0.97 bandında bir "isabet ihtimali"ne
// sadeleştirildi — KO'nun ham oranını birebir taşımak yerine (bizim
// ölçeğimizde anlamsız büyük sayılar üretirdi) doğrudan kullanılabilir bir
// yüzdeye indirgiyor. Canavarların gerçek bir DEX'i yok — çağıranlar onun
// yerine `monster.atk`'yi bir "çeviklik" vekili olarak geçiyor (bkz.
// BattleTab.jsx#attack/resolveMonsterTurn).
export function hitChance(attackerDex, defenderDex, attackerLevel) {
  const diff = attackerDex - defenderDex;
  const chance = 0.85 + diff * 0.0015 + attackerLevel * 0.0005;
  return Math.min(0.97, Math.max(0.55, chance));
}
export function rollHit(attackerDex, defenderDex, attackerLevel) {
  return Math.random() < hitChance(attackerDex, defenderDex, attackerLevel);
}
