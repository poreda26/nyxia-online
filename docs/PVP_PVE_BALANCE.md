# Beceri, PvP ve PvE denge raporu — 24 Eylül 2026

## Uygulanan kurallar

- PvP iki tarafta da otomatik. Öğrenilmiş ve beşli dizilime alınmış beceriler; gerçek mana, bekleme, güçlendirme, süreli hasar ve iyileştirme kuralları kullanılır. Ücretsiz rakip iyileşmesi kaldırıldı. PvP iyileştirmesi aksiyon başına en fazla %20 HP; iksirle manuel hız avantajı yok.
- Başlangıç sırası tohumla belirlenir, sonraki turlarda taraf önceliği dönüşür. Vuruşlar ±%12 dağılımla hesaplanır; kritik ve kaçınma korunur. 100 tur sınırı beraberliktir, ödül verilmez. Bitmiş düello tekrar ilerletilmez.
- Becerili PvP için sınıf/seviye/yükseltme katsayıları açık tablolar halinde pvpBalance.js içindedir. Rakibe göre gizli ölçekleme yapılmaz; kendi eşyasının gücü kullanılmaya devam eder. PvE ve set bonusları bu PvP tablolarından etkilenmez.
- Kanadın saldırı/stat bonusları, geçerli saldırı-savunma-HP parşömenleri ve takı statları hesaba katılır. EXP/drop/altın/NP bonusları hasara dönüşmez. Savaş başında alınan değerler düello boyunca sabittir.
- T5/T6: altı silah savunması × dört takı slotu × iki tier = 48 yeni takı. Eski takılar ve üçlü yükseltme korunur. Anti-def puanları yalnızca eşleşen silaha karşı puan/(100+puan) oranında azaltma sağlar; üst sınır %25. Crossbow, yay savunmasına dahildir. Asa savunması Mage saldırı/becerilerini karşılar. Kırık eşya bonusu çalışmaz.
- Savunma takıları normal takılara göre ana stat/savunma takası yapar. T5 normal nadir takı havuzuna eklendi. T6 özel etkinlik sandığında %1 ayrı şansa sahip; bu, normal canavar başına %1 değildir.
- Savaş Alanı giriş ekranında ödülsüz yerel VS antrenmanı var. Gerçek oyuncu bağlantısı henüz yok. Karşılıklı karakter, ekipman, HP/MP ve beceri efektleri gösterilir; antrenman kayda dokunmaz.

## Test kapsamı ve sınırlar

54 PvP senaryosu × 2.000 = 108.000 düello: üç sınıf eşleşmesi, altı seviye/ekipman basamağı, +1/+5/+8. Kalibrasyon ve doğrulama farklı rastgelelik tohumlarını kullanır. Ortak, seviyeye uygun beşli beceri dizilimi ve +0 sınıfa uygun takılar kullanılmıştır. Bu sonuçlar her olası silah, stat dağılımı veya beceri diziliminin eşit olduğu anlamına gelmez.
243 normal canavar senaryosu × 2.000 = 486.000 karşılaşma: 27 canavarın tümü, üç sınıf ve üç ekipman durumu. Harita orta seviyesi, aynı seviye stat yatırımı; uygun +5, önceki kademe +5 ve başlangıç +1/zırhsız. Standart beceri rotasyonu kullanılır, iksir/kanat/ücretli bonus yok. PvE test simülatörü hasar yardımcılarını paylaşır; tıklama sürelerini, uzun farm kaynak yenilemesini ve gerçek otomatik beceri seçimini birebir taklit etmez.
Ek olarak 30.000 bonus düellosu; 36.000 harita/zindan boss karşılaşması. Bosslarda harita son seviyesi ve +8 ekipman; iksirsiz ve en fazla 5 büyük HP + 3 büyük MP iksiri senaryoları ayrı raporlanır. Savaş Alanı grup bossları tek oyuncu dengesi kapsamında değildir.
Toplam 660.000 doğrulama karşılaşması. Sonuçlar istatistiksel örneklemdir; canlı oyuncu telemetrisi yerine geçmez.

## PvP sonuçları

54 senaryoda ilk sınıfın kazanma aralığı: %41.45–%61.75. Tam eşitlik iddiası yok; uç eşleşmeler beta takibinde öncelikli.

| T4 +5, Lv50 | İlk sınıf kazanma | Ortalama tur |
|---|---:|---:|
| warrior / rogue | %50.05 | 12 |
| warrior / mage | %45.65 | 12 |
| rogue / mage | %50.45 | 12 |

## Harita ilerlemesi

Uygun +5 ekipmanla Warrior örneği; haritanın son normal canavarı. Diğer sınıflar dahil bütün satırlar BALANCE_RESULTS.json içindedir.

| Harita | Son canavar | Ortalama tur | Kalan HP |
|---|---|---:|---:|
| Fallow Valley | Nadas Devi | 6.2 | %83 |
| Ashen Canyon | Lav Ruhu | 5.2 | %87 |
| Frostburn Summit | Zirve Muhafızı | 6.2 | %83 |
| Ruined Sanctuary | Gölge Vaizi | 8 | %78 |
| Abyssal Pit | Uçurum Efendisi | 10.7 | %58 |
| Crimson Battlefront | Kıyamet Ejderhası | 15 | %46 |

Başlangıç ekipmanıyla yüksek haritalarda kazanma oranı düşer. Uygun ekipmanla sıradan farm mümkün kalır; düşük ekipmanla tur ve can maliyeti yükselir. Harita HP/ATK/DEF değerleri sabittir; oyuncunun eşyasına göre canavar güçlendirilmez.

## Bonuslar ve dikkat edilmesi gerekenler

Aynı sınıfın aynı ekipmanlı aynası karşısında yalnızca ilk tarafın bonusu değişir. Anti-def testindeki takı değişimi diğer statları da değiştirir; saf hasar azaltması ayrıca birim testiyle doğrulanır.

| Sınıf | Bonus | Kazanma |
|---|---|---:|
| warrior | baseline | %50.25 |
| warrior | wings | %64.30 |
| warrior | boosts | %96.10 |
| warrior | antiMatch | %59.05 |
| warrior | antiWrong | %52.35 |
| rogue | baseline | %50.30 |
| rogue | wings | %60.55 |
| rogue | boosts | %87.05 |
| rogue | antiMatch | %68.60 |
| rogue | antiWrong | %52.20 |
| mage | baseline | %50.10 |
| mage | wings | %54.20 |
| mage | boosts | %90.45 |
| mage | antiMatch | %74.10 |
| mage | antiWrong | %50.20 |

Kanat, toplam statlarıyla gerçek avantaj sağlar. Geçici parşömenler belirgin avantaj sağlar; özellikleri sessizce kaldırılmadı. Öneri: dereceli VS için parşömenleri kapatan ayrı bir kural, serbest Savaş Alanında mevcut bonuslar. Bu öneri henüz uygulanmadı.
İkinci öneri: seviyeye ve ekipman gücüne göre eşleştirme aralıkları. Üçüncü öneri: sunucuda tur kayıtları, kazanma oranı ve bağlantı kopması takibi.

## Online geçiş

duelEngine.js deterministik, arayüzden bağımsız tur motorudur; bu bir online sunucu değildir. Gerçek bağlantıda eşya/beceri sahipliği ve seed sunucudan gelmeli, turlar/sonuçlar/ödüller sunucuda hesaplanmalıdır. İstemci sonucu kabul edilmemeli; maç kimliği ile tek ödül, bağlantı kopma süresi ve tekrar oynatılabilir tur kaydı gereklidir.

## Tekrar çalıştırma

PowerShell: `$env:SAMPLES="2000"; npm run test:balance`. Birim testleri: `npm run test:world`. Tarayıcı: `node scripts/check-duel-ui.mjs` (5177 yerel sunucu). Ham rapor: BALANCE_RESULTS.json.
