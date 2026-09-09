# Nyxia denge V1

Mevcut görseller ve silah adları korunur; yeni varyantlar aynı görseli kullanır. Her sınıfın T1–T6 havuzunda en az üç seçenek vardır. İsimler hâlâ geçicidir. Kaynak referans tabloları saklanır, etkin sayılar `balancedWeapons.js` içinde belirlenir.

Silah +1 tabanları 20/48/76/104/132/154; sınıf katsayıları Warrior 1, Rogue 0.94, Mage 1.12. +1–+8 çarpanları 1/1.07/1.14/1.22/1.31/1.42/1.57/1.78. Varyantlar dengeli, can bonuslu ve %4 yüksek saldırılıdır. Referans oyundan gelen ikincil stat sıçramaları yerine bu güç bütçesi kullanılır. Upgrade başarı oranları, kırılma ve maliyetler değişmez. Zırh set bonusları değişmez.

Mage'in harcaması zorunlu INT puanları saldırı ölçeğine de katkı verir. Silah gereksinimleri seviye puanı bütçesine uyar. Mevcut kayıtlı silahlar ve banka eşyaları yeni sayılara taşınır; id, isim, +seviye ve dayanıklılık oranı korunur. Bilinmeyen özel eşyalar değiştirilmez.

PvE isabet farkı sınırlanır: ATK'nın DEX vekili olarak kullanılmasının %55'e düşüren etkisi kalkar. HP/DEF sınıf katsayıları ve normal canavar can eğrisi yenilenir. Her savaş başlangıcında kaynak doldurma ve sınırsız normal farm devam eder. Boss ve zindanlarda HP, ATK ve DEF aynı oranda çarpılmaz. Harita boss'u günlük tekrar ödülü alamaz.

PvP ortak snapshot/hasar yordamını iki yönde kullanır. Silah gücü, stat yatırımı, zırh ve upgrade önemlidir. Sınıfların farklı PvE can ölçekleri düello hasarına dönüştürülür; görünen can ve iksir sistemi korunur. Rogue kritik sıklığı korunur fakat beklenen hasar bütçesine dahil edilir. Hayaletler seçilen sınıfın gerçek, kuşanılabilir karşılık ekipmanıyla oluşturulur. Bu hâlâ çevrimdışı hayalet PvP'dir; online sunucu veya matchmaking değildir.

## Doğrulama

`node scripts/balance-audit.mjs`: mevcut formülleri kullanarak harita girişleri, seviye 65/T6 ve +1/+3/+5/+8 silahlarla değerlendirme. Varsayım: erişilebilir en güçlü silah, +3 tam/erişilebilir zırh, ana stat odaklı dağılım; Mage önce zırh INT gereksinimini karşılar. Temel saldırı simülasyonunda her eşleşme 1000 tekrar, başlangıç sırası dönüşümlü ve sabit rastgele tohum kullanır. 96.000 düelloda ilk sınıfın kazanması %39.8–64.3. Test matrisi seviye 1'i iki kez içerir. Bu sonuç pot/beceri stratejilerini, bütün takıları veya eksik ekipman olasılıklarını kapsamaz; tam ekonomi/farm simülasyonu değildir. Normal savaş sayıları isabet ve kritik beklentisiyle hesaplanan yaklaşık sürelerdir.

`npm run test:world` kayıt/upgrade/ortak PvP davranışını, `node --test tests/battle-visuals.test.mjs` görsel eşlemeyi kontrol eder. Üretim derlemesi ayrıca çalıştırılır. Yeni düzende gerçek oyuncu oturumlarından sınıf, seviye, eşya seviyesi, ölüm, tur ve iksir tüketimi kaydı sonraki denge değerlendirmesinin temelidir.
