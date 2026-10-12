# Google Play yayın rehberi (Nyxia Online)

## 1. Hesap
- Play Console geliştirici hesabı: tek seferlik 25 USD, kimlik doğrulaması gerekir.
- Kişisel hesap Kasım 2023'ten sonra açıldıysa: **üretim (production) yayını için önce kapalı test** zorunlu: en az **12 test kullanıcısı, kesintisiz 14 gün** kapalı testte olmalı, sonra "üretim erişimi için başvur" denir. Kurumsal (şirket) hesapta bu şart yok.
- Bu yüzden önce kapalı teste yükleyip 12+ kişiyi (Gmail adresleri) davet et; 14 gün dolmadan üretime geçilemez.

## 2. İmzalama
- Yükleme anahtarı (upload key): `C:\Users\akcel\NyxiaSecrets\nyxia-upload.jks` (+ `keystore.properties`, şifreler orada). **Yedeğini al** (USB / şifreli bulut). Kaybolursa Google destek ile sıfırlanır ama günler sürer.
- `android/keystore.properties` aynı bilgiyi gösterir ve git'e girmez.
- Play Console'da **Play Uygulama İmzalama (Play App Signing)** açık bırakılır: Google asıl imza anahtarını tutar, biz yükleme anahtarıyla yükleriz.
- Yükleme anahtarı parmak izi (SHA-1): `26:81:1C:24:27:2B:7A:EE:05:70:DF:04:07:A6:C3:22:78:7A:39:FE`
- İlk yüklemeden sonra Play Console → Uygulama bütünlüğü (App integrity) → **Uygulama imzalama anahtarı SHA-1** değerini kopyala ve Google Cloud'da **ikinci bir Android OAuth istemcisi** (paket `com.nyxiaonline.game`) olarak ekle; yoksa mağazadan inen uygulamada Google ile giriş çalışmaz. (Debug ve yükleme anahtarı için de ayrı istemci eklenebilir.)

## 3. Sürüm derleme
Sürüm numarası: `android/app/build.gradle` → `versionCode` (her yüklemede ARTAR) ve `versionName`. `src/version.js` CLIENT_BUILD ile aynı tut.
```
VITE_ADMOB_RELEASE=1 npx vite build --base ./
npx cap sync android
cd android && ./gradlew bundleRelease     # çıktı: app/build/outputs/bundle/release/app-release.aab
```
`VITE_ADMOB_RELEASE=1` gerçek reklamı açar (onsuz test reklamı gösterilir). **Kendi cihazında gerçek reklama basma** (hesap riski); deneme için `VITE_ADMOB_RELEASE` olmadan derlenmiş APK kullan.
Sunucunun en düşük sürümü: `node server/set-min-build.mjs <n>`; yeni sürümü yayınlamadan önce yükseltme.

## 4. Mağaza sayfası
- Metinler: `docs/STORE_LISTING.md` (Türkçe ana dil, İngilizce çeviri ekle).
- Grafikler: `store/` klasörü (simge 512×512, öne çıkan grafik 1024×500, ekran görüntüleri).
- Kategori: Oyun → Rol Yapma. Etiketler: RPG, MMORPG, çevrimiçi, klan, fantezi.
- İletişim e-postası: yanıt verebileceğin bir adres (no-reply olmasın).

## 5. Politika formları (Play Console → Uygulama içeriği)
**Gizlilik politikası:** https://nyxiaonline.com/privacy.html

**Uygulama erişimi:** Giriş gerekiyor → inceleme ekibi için hazır bir hesap ver (`NyxiaSecrets\play-reviewer.txt` içinde kullanıcı adı/şifre). Kayıt e-posta kodu istediği için kullanıcı adı + şifre girişi tarif et ("Kullanıcı adınla giriş yap").

**Reklamlar:** Evet, reklam içeriyor (AdMob ödüllü reklam).

**Hedef kitle ve içerik:** 13 yaş ve üzeri (13-15, 16-17, 18+ seçenekleri; 13 altını SEÇME). Çocuklara yönelik değil.

**İçerik derecelendirme (IARC) için cevaplar:** Şiddet: fantezi/hafif (canavar savaşı, kan yok). Kullanıcılar etkileşir: evet (sohbet, özel mesaj, klan). Kullanıcı üretimli içerik: evet; küfür filtresi, şikayet ve engelleme var. Konum paylaşımı: hayır. Dijital satın alma: şu an hayır (elmas paketi satışı açılınca evet). Kumar/gerçek para: hayır. Beklenen sonuç: 12+/Teen.

**Kullanıcı üretimli içerik politikası:** uygulama içi şikayet ve engelleme var (sohbet ve arkadaş listesi), küfür filtresi var, sahip panelinden moderasyon (susturma, engelleme) var.

**Hesap silme:** uygulama içi (Ayarlar → Hesap → Hesabı sil) ve web: https://nyxiaonline.com/delete-account.html

**Veri güvenliği formu (Data safety):**
| Veri | Toplanıyor mu | Paylaşılıyor mu | Amaç | Not |
|---|---|---|---|---|
| E-posta adresi | Evet (isteğe bağlı: Google/e-posta girişinde) | Hayır (e-posta gönderimi için Resend hizmet sağlayıcıdır) | Hesap yönetimi, kurtarma | Silinebilir |
| Kullanıcı kimlikleri (hesap adı, Google kullanıcı numarası) | Evet | Hayır | Hesap yönetimi | |
| Doğum tarihi | Evet | Hayır | Yaş denetimi (uygulama işlevi) | Bir kez sorulur |
| Uygulama etkileşimi / oyun verisi (karakter, envanter, ilerleme) | Evet | Hayır | Uygulama işlevi | Sunucuda saklanır |
| Mesajlar (oyun içi sohbet, özel mesaj) | Evet | Hayır | Uygulama işlevi | Diğer oyuncularla görünür |
| Cihaz veya diğer kimlikler (reklam kimliği) | Evet (AdMob SDK) | Evet (Google AdMob, reklam) | Reklam | Reklam göstermek için |
| Konum, kişiler, fotoğraf, mikrofon, kamera | Hayır | - | - | |
Aktarım sırasında şifreleme: Evet. Kullanıcı veri silme isteyebilir: Evet.

## 6. Yayın sırası
1. Hesap + doğrulama → uygulamayı oluştur (ad: Nyxia Online, dil: Türkçe, oyun, ücretsiz).
2. Uygulama içeriği formlarını doldur (yukarıdaki cevaplar).
3. Mağaza sayfası (metin + grafikler).
4. **Kapalı test** kanalına AAB yükle, 12+ test kullanıcısını ekle, 14 gün bekle.
5. Üretim erişimi için başvur → üretim sürümü oluştur → incelemeye gönder.
6. Yayınlandıktan sonra: AdMob'da uygulamayı mağaza sayfasına bağla; sitedeki "yakında" rozetlerini gerçek Google Play rozetine çevir; Google girişi için Play imzalama SHA-1'ini ekle.

## 7. Yayın öncesi kontrol
- [ ] Oyuncu kayıtlarını sıfırlama kararı (açık onay gerekir)
- [ ] Hukuki metinlerin avukat incelemesi
- [ ] Reklam testi (SSV) arkadaşta çalıştı
- [ ] `play-reviewer` hesabı çalışıyor
- [ ] Yükleme anahtarı yedeklendi
