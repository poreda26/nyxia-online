# Altı kimlik, kuşanılan silah görünümü

Kapsam: Human/Karus × Warrior/Rogue/Mage; 61 katalog silahı, iki başlangıç adı eşlemesi ve altı silahsız görünüm. Rogue yalnızca okçudur. Kaynak katalog, statlar, set bonusları, kayıt, loot ve upgrade kuralları bu görsel çalışmada değiştirilmez.

`CharacterFigure` savaş sahnesi ve Paperdoll içindeki Kuşanılmış portresinde ortaktır. Tek kaynak `player.equipped.mainHand` olduğundan çantada bir eşyayı incelemek görünümü değiştirmez. Aynı sınıf/ırk aynı kimliği kullanır; yalnızca silaha uygun hazır tutuş pozu seçilir. Görsel ile silah birlikte hareket eder. +7/+8 ışığı tutuşu veya geometriyi bozmaz. Bu, eklem tabanlı bir 3B sistem değil, hazır pozlar ve mevcut basit savaş animasyonudur.

PNG'ler `src/assets/characters/weapons/` içindedir. `characterWeaponManifest.json` ad → atlas/sütun eşlemesini; `characterAtlasFrames.json` kesim sınırlarını içerir. Bütünlük ve tutuş için karakter/silah birlikte çizilmiştir. Kullanıcının izniyle silahlar gerektiğinde mevcut eşyanın benzer, ayrı bir tasarımıdır. PNG kaynaklarına dokunulmadan, okunan sınırlar SVG clipPath ile gösterilir; bazı kaynaklardaki dama fonu da bu kesim sınırlarının dışında tutulur. `scripts/index-character-atlases.ps1` yalnızca metaveri üretir, PNG piksellerini değiştirmez.

Yerel kontrol: `/nyxia-online/character-check.html`. Sınıf, ırk, silah ve +seviye değiştirilebilir. Kullanıcı kaydına yazmaz. `scripts/check-character-browser.mjs --all` gerçek kuşanma yordamıyla iki görünümün eşleşmesini tarayıcıda kontrol eder.

## Sıradaki aşama: zırhlar

Zırhlar kullanıcıyla en son, tek tek denenerek hazırlanacak. Şimdilik her kimliğin sabit temel kıyafeti var; zırh çıkarınca bu kıyafetin değiştiği iddia edilmez. `characterArmorLook` ve `CHARACTER_LOOKS` genişletme noktalarıdır. Yeni zırh görünümü eklenirken aynı kimlik, silah/tutuş eşlemeleri, ayak hizası ve iki ekranın ortak bileşeni korunmalı. Her zırh görünümüne uygun pozlar ayrıca gerekir; rastgele zırh resmini mevcut gövdeye yapıştırma.

## Üretim

Built-in image_gen kullanıldı. Her atlas 3 silah × 2 ırk içerir. İlk atlas Warrior kimlik referansıdır. Sütunlardaki silah tanımları `characterWeaponManifest.json` içinde, tam promptlar `character-weapon-prompts.json` içinde saklanır. Aynı satırda yüz, gövde, kıyafet ve ayak hizası korunarak yalnızca tutuş değiştirilir.

## Doğrulama — 14 Eylül 2026

30 dünya/ekipman testi ve 4 savaş görseli testi geçti. Edge mobil ekran boyutunda 61 silah × 2 ırk ve 6 silahsız görünüm olmak üzere 128 geçişte iki önizleme eşleşti, görseller yüklendi, tarayıcı hatası oluşmadı. Üretim derlemesi geçti. Fiziksel telefonda test yapılmadı. Üretim pozlarında küçük kıyafet/ışık farklılıkları olabilir; zırh varyantları henüz hazırlanmadı.

## Nefes ve elemental parıltı

Kuşanılmış portresinde ayak bölgesine bağlı hafif nefes döngüsü vardır. +7/+8 elemental efektleri yalnızca silahın açıkta kalan uç/baş bölgesine uygulanır; tüm gövde parlatılmaz. Poison mor-pembe, flame turuncu, lightning mor-beyaz, glacier/ice buz mavisi; +8 daha yoğun ışıklıdır. Çok elementli silahların bonusları korunur. Azaltılmış hareket tercihinde döngüler durur. Gerçek 360 derece için mevcut tek açılı PNG'ler yeterli değildir; 3B model veya çok açılı varlık üretimi ayrı çalışma gerektirir ve kullanıcı kararı beklenir. Silindir gibi döndürülen düz resim 360 derece karakter olarak sunulmaz.

Doğrulama: iki elemental veri testi; tarayıcıda dört element için +6/+7/+8, silah çıkarma ve hareket eden portre kontrolü geçti.

Poison referans düzeltmesi: mor-pembe dış aura ve açık mor kenar ışığı, silahın mevcut efekt sınırından türetilir. Silah dokusu düz renkle kapatılmaz. +8 daha geniş aura üretir. 128 ekipman geçişi ve elemental tarayıcı kontrolleri geçti.
