# Mobil yerleşim ve hasar kontrolü

- Kuşanılmış: portre %64 genişlikte, merkezde; 12 yuva iki sütunda. Altı sınıf/ırk için aynı yerleşim.
- Envanter alt ekranları: Kuşanılmış, Çanta, Depo, Sandık. Uzun menüler Önceki/Sonraki ile ilerler; ana ekran telefon yüksekliğine bağlıdır.
- Tarayıcı: 360×640, 390×844, 430×932; altı karakter; sekme değişimi ve göğüslük çıkarma. Küçük telefonda savaş düğmeleri de görünür. Eşya ayrıntıları gerektiğinde kendi penceresinde kaydırılabilir.

## Düzeltilen hatalar

- Önizlemenin alta hizalanması ve kesen büyütme animasyonu.
- PvP eşya ana stat bonusunun iki kez sayılması.
- Mage zırhının MP yükseltme bonusunun PvP saldırısına eklenmesi.
- Önceki T4 testinde Warrior'a fazla stat puanı verilmesi ve Rogue'a STR takısı takılması.
- Aksesuar kâğıdının kuşanılarak geçersiz ekipman yuvasına taşınabilmesi.
- T3 haritanın T2 eşya atması sırasında başlangıç yüzüklerinin yanlış haritada düşebilmesi.

## Hasar sonuçları ve kapsam

45. seviye, yasal 142 dağıtım puanı, T4 +5 silah ve tam zırh, sınıfın ana statını veren T4 +3 takılar: 2.000 sırayla başlayan normal saldırı düellosunda Warrior %52,55, Rogue %47,45.

Bu sonuç tüm oyunun dengeli olduğunu kanıtlamaz. `scripts/balance-audit.mjs` farklı seviye, kullanılabilir silah ve + değerlerini de tarar. Örneğin 50. seviye +3 silah senaryosunda Warrior/Rogue %74,7/%25,3; burada kullanılan ekipmanlar gereksinimlere göre seçilir ve tüm slotların T4 olduğu varsayılmaz. Beta sırasında bu ilerleme eşleşmeleri ayrıca değerlendirilmelidir.

Simülasyon mevcut PvP normal saldırı/isabet/kritik/savunma kurallarını kullanır; oyuncu taktikleri, potlar ve tam skill rotasyonları için bir kazanma oranı iddiası yoktur. PvE audit'i hasar ve hayatta kalma süresini hesaplar. Gerçek online yük/ağ testi yapılmadı.

Doğrulama: `npm run test:world` (34), görsel veri testleri (14), `node scripts/check-beta-mobile.mjs`, `node scripts/balance-audit.mjs`, `npm run build`.
