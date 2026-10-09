# Giriş seçenekleri (Google / Apple / e-posta)

Sunucu: `server/identity.mjs`, `server/mailer.mjs`. Hiçbir şey açılmadan önce kapalıdır (`GET /api/auth/providers` boş döner, giriş ekranında düğme çıkmaz).

## Ne yapar
- **Google / Apple ile giriş:** uygulama sağlayıcının kimlik belgesini (idToken) sunucuya yollar; sunucu imzayı sağlayıcının açık anahtarlarıyla, `iss`, `aud`, `exp` ile doğrular. Hesap yoksa `oyuncu_xxxxxx` adlı yeni hesap açılır. Mevcut hesaplar Ayarlar → Hesap → "Google hesabını bağla" ile bağlanır.
- **E-posta (kurtarma + e-postayla giriş):** Ayarlar → Hesap → e-posta + 6 haneli kod. Doğrulanmış e-postayla kullanıcı adı yerine giriş yapılır. "Şifremi unuttum" kodu e-postaya gönderir; kod 15 dk geçerli, 5 yanlış denemede yanar, dakikada 1 / saatte 5 kod sınırı vardır. Şifre sıfırlanınca tüm oturumlar kapanır.
- Tek oturum kuralı ve giriş sınırları Google/Apple girişinde de geçerlidir. Şifresiz (sosyal) hesap, silmek için kimliğini sağlayıcıyla yeniden doğrular.

## Açmak için (sunucu ortam değişkenleri, `nyxia-backend.service`)
| Değişken | Anlamı |
|---|---|
| `GOOGLE_CLIENT_IDS` | Google Cloud'daki **Web application** OAuth istemci kimliği (Android uygulaması bu kimliği `webClientId` olarak kullanır). Virgülle birden çok. |
| `APPLE_CLIENT_IDS` | Apple Services/App kimliği (iOS paketi). iOS çıkınca. |
| `RESEND_API_KEY`, `MAIL_FROM` | resend.com API anahtarı ve doğrulanmış gönderen adresi (ör. `Nyxia <no-reply@sametcantas.com>`). E-posta özellikleri bunlar olmadan kapalı. |

## Google Cloud tarafı (ücretsiz)
1. console.cloud.google.com → proje → **APIs & Services → OAuth consent screen** (External, uygulama adı Nyxia Online).
2. **Credentials → Create credentials → OAuth client ID**:
   - **Web application** → bu kimlik `GOOGLE_CLIENT_IDS` olur.
   - **Android** → paket adı (`com.rpgmarket.testapp` ya da yayın paketi) + imza SHA-1 (debug ve yayın anahtarı ayrı ayrı).
3. Kimlik sunucuya girilir, yeni APK yayınlanır (eklenti `@capgo/capacitor-social-login`).

## Apple (iOS uygulaması çıkınca)
Apple Developer hesabında "Sign in with Apple" yeteneğini aç, `APPLE_CLIENT_IDS` olarak paket kimliğini ver. Hesap silinirken Apple'ın "token iptali" çağrısı gerekir (henüz eklenmedi, iOS ile birlikte yapılacak).
