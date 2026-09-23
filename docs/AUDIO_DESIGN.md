# Nyxia — Sisli Vadi

Tamamen özgün, örneksiz beste: 72 BPM, 48 ölçü / 160 saniye. D minör çevresinde flüt, arp, yumuşak yaylılar ve çok hafif çerçeve davul. Altı bölümde yoğunluk ve melodi değişir. Knight Online'dan melodi veya kayıt alınmadı.

`scripts/compose-nyxia.py` sabit rastgelelik tohumu ile notaları/enstrümanları üretir. Gereksinimler: Python, numpy, scipy, imageio-ffmpeg. Çıktı: `src/assets/audio/mist-valley.mp3` (128 kbps stereo, yaklaşık 2.56 MB). WAV ve 40 saniyelik önizleme yalnızca `output/` içine gider.

Oyun, besteyi HTMLAudio ile akış halinde çalar. Web Audio gain üzerinden iOS dahil ses seviyesi kontrol edilir. İlk etkileşimde başlar; sessizken indirme yapmaz; arka planda duraklar ve dönüşte kaldığı yerden sürer. Tarayıcı izin vermediyse sonraki dokunma tekrar dener. Müzik ve efekt ayarları ayrıdır.

Efektler yerel Web Audio sentezi: metal kesiş/darbe, yay kirişi/ok, büyü küresi, alev, buz, yıldırım, zehir, şifa, güçlendirme, hasar alma, ıskalama, örs, yükseltme sonucu, seviye, sandık, iksir, menü. Kısa atak zarfı tık sesini azaltır; sesler bitince düğümler ayrılır. Ortak kompresör ani ses yığılmalarını sınırlar. Savaş ve savaş alanı gerçek aksiyonlarına bağlanır; oynanış hesabı değişmez.

Kontrol: `node scripts/check-audio.mjs`. Gerçek MP3 oynatma/sessiz/dönüş/sıfır ses/temizleme, uygulamanın görünürlük olayı, 39 beceri ve temel efektlerin OfflineAudioContext çıktısı, eşzamanlı ses yükü, sessizken kaynak ayırmama. Bu tarayıcı testidir; fiziksel iOS/Android hoparlör/kulaklık dinleme testi ayrıca yapılmalıdır.

## Daha sıcak düzenleme
Kullanıcının tiz rahatsızlığı üzerine flüt ve arp bir oktav aşağı alındı; flütün üst harmonikleri ve nefes sesi azaltıldı. Melodi atakları yumuşatıldı, yankı ve ana karışım 1.8 kHz alçak geçiren filtreyle dengelendi. RMS en fazla 0.09, tepe en fazla 0.50 olacak şekilde seviye sınırlandı. Efektler değişmedi.
