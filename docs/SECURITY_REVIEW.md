# Güvenlik incelemesi (2026-10-05)

Kapsam: sunucu (`server/*`), paylaşılan oyun kuralları (`src/game/*`), istemcinin sunucuya güvendiği yerler.

## Bulunan ve kapatılanlar
| Bulgu | Risk | Çözüm |
|---|---|---|
| Terk edilen savaş cezasız: istemci tohumu bilir, kaybedeceği savaşı hiç bitirmeyip kazanacağını oynayabilir | Orta (ölüm cezasını atlatma) | Bildirilmeden yeni savaş başlarsa ölüm cezası (`startGate`); 2 turdan kısa geri çekilmeler 60 sn içinde 6'yı geçerse yeni savaş geçici engellenir (`fightGuard`) |
| Rehber hediyesi ve altın takviyesi karakter başına; karakter silip yeniden oluşturarak sınırsız altın | Orta (altın üretimi) | Hesap başına bir kez (`account_flags` + kanca); takviye için ayrıca `tutorialTopUp` |
| Karakter oluşturma sınırı yok (başlangıç ödülleri/günlük giriş toplamak için) | Orta | 24 saatte en fazla 2 yeni karakter; fazlası yedekten çıkarılır (`character_creations`) |
| Irk/meslek parşömeni klan kontrolünü yedekteki `clan` alanından yapıyordu (istemci yansıması, sahte `null` yazılabilir) | Düşük | Klan üyeliği sunucudaki `clan_members` kaydından okunur (kanca) |
| Push abonelik adresi keyfi URL: sunucu bildirim yollarken iç ağa istek atabilirdi (SSRF) | Yüksek | Yalnızca https ve bilinen push servisleri (`isPushEndpointAllowed`) |
| Statik dosya yolu önek kontrolü (`dist-server` ≈ `dist-server-old`) | Düşük | Ayırıcıyla (`sep`) kök kontrolü |
| Giriş denemesi yalnızca IP başına sınırlı (dağıtık şifre tahmini) | Orta | Hesap adı başına 10/dk; kayıt IP başına 6/dk |
| Savaş eylem sayısı üst sınırı 4000 (CPU) | Düşük | 2000 |

## Doğrulananlar (sorun yok)
- Oturum çerezi: HttpOnly, SameSite=Strict, Secure; jeton veritabanında özetle (hash) tutulur; şifre scrypt + zamanlama güvenli karşılaştırma.
- Yönetici uçları yalnızca sahip hesaba açık; GM eylemleri sunucuda `isGm` ile denetlenir.
- Ödeme webhook'u sabit-zamanlı bearer karşılaştırması, işlem kimliğiyle tekrar korumalı.
- Eylemlerde bilinmeyen tür / `__proto__`, negatif ve kesirli sayılar, dizi/nesne türü hataları reddedilir (testli).
- Yedek yazımı sürüm (revision) çakışmasına karşı korumalı, boyut sınırlı, sunucuya ait alanlar geri çevrilir.

## Bilinen kalan riskler (kabul edildi / ileride)
- Bot/otomasyon: tur başına 300 ms alt sınırı var ama gerçek istemci gibi davranan bir program engellenemez.
- Birden çok hesapla pazar üzerinden altın/eşya aktarımı (kural gereği serbest).
- Başarım ilerlemesi, klan boss'u gibi küçük istemci alanları.
- Bağımsız (dış) bir sızma testi yapılmadı.
