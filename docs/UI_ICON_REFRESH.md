# Arayüz ikonları ve günlük çark

- GameIcons.jsx: ortak oyun amblemleri ve yeniden çizilmiş temel kontroller. Envanter, pazar, savaş, sohbet, arkadaşlar, klan, kaptan, karakter, yükseltme, ayarlar, üst bar, öğretici ve yönetici ekranları bu kaynağı kullanır.
- MenuEmblem.jsx: altın/metal menü stili; para, elmas, taç, parşömen, iksir, kalp, mana, kanat, çark ve sandık çizimleri.
- CatalogIcons.js: Node ESM ile okunabilen veri dosyaları için JSX içermeyen ikonlar.
- Eski lucide-react çalışma zamanı importları src altında kalmadı. İşlevsel kapat/geri/onay/engel simgeleri tanınabilir biçimlerini korur.
- Çark: metal çerçeve, merkez taşı, belirgin işaretçi, ödül görseli, açılabilir 12 ödüllük liste ve mobil düzen.
- Ödül oranları, günlük limit ve sunucu ödül seçimi değiştirilmedi.

Kontroller: üretim derlemesi; 7 çark/zırh testi; 320x568, 390x844, 430x932, 844x390 ekranlarında yerel API taklidiyle çark, ödül gösterimi, günlük kilit ve taşma kontrolü. Canlı hesaba istek gönderilmedi.
