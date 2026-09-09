# Savaş görünümü — ilk sahne

9 Eylül 2026. Yerleşik image_gen ile üretildi.

- BattleTab içine salt görsel BattleScene eklendi. Hasar, tur süresi, beceri, iksir, ödül ve kayıt hesapları değiştirilmedi. Önceki BattleTab: visual-backup-battle/BattleTab.jsx.
- İlk sahne Fallow Valley'nin beş normal yaratığını ve üç sınıfın İnsan/Ork görünümlerini kapsar. Diğer bölge ve zindan yaratıkları mevcut arayüzünü kullanır. Dünya ve Warzone değiştirilmedi.
- Karakterler silah ve kıyafetiyle tek parçadır; kuşanılan her eşya görünüşe yansımaz. Mevcut eşya ikonları ve stat etkileri korunur. Atlas içindeki kullanılmayan priest figürleri oyuna sınıf eklemez.
- Hafif nefes, kısa öne atılma, menzilli iz, destek aurası ve yenilme hareketleri CSS ile çizilir. Gerçek kare kare iskelet animasyonu değildir. Efektler 300 ms sürer; mevcut 320 ms aksiyon kilidi uzatılmadı. Azaltılmış hareket tercihi desteklenir.
- Dosyalar: src/assets/battle/actors-v1.png (1448×1086 gerçek RGBA); src/assets/battle/arena-v1.png.
- Kayıt yazmayan test sayfası: /nyxia-online/battle-check.html. Üretim menüsüne eklenmedi; gerçek BattleTab kullanılır.
- Doğrulama: 20 mevcut dünya testi geçti. Üretim derlemesi geçti (500 kB paket boyutu uyarısı mevcut). Tarayıcıda savaşçı saldırısı/karşılık hasarı, büyücü/golem, dar görünümde okçu kontrol edildi. Konsol hatası görülmedi.

## Karakter atlası promptu

undefined

## Sahne promptu

undefined


## Dikey mobil düzen
Referansa göre üstte iki can göstergesi ve oyuncu manası, ortada karşılaşma, alt bölümde karakter ön planı ve beş beceri yuvası yerleştirildi. Saldırı ve iksir düğmeleri en az 46 px yüksekliğinde. Savaş kaydı açılır bölüme taşındı. Yeni düzen mevcut Fallow Valley sahnesini kapsar. Önizleme karakterlerine yalnızca kayıt yazmayan kontrol sayfasında beş beceri atanır; gerçek oyuncunun becerileri değiştirilmez. Derleme ve tarayıcıda beceri kullanımı/mana yetersizliği kontrolü geçti.

Güncelleme: Altı harita tamamlandı. Güncel kapsam ve üretim notları BATTLE_ALL_MAPS.md dosyasında.
