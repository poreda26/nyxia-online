# Nyxia Online sinematik fragman 2

Çıktı: **nyxia-fragman-2-1080x1920.mp4**, 50,5 saniye, dikey, 24 fps, H.264/AAC. Oyun arayüzü yok; oyunun kendi sanatı. Fragman 1 bölgeleri anlatır, bu fragman oyunun başka yönlerini anlatır.

Akış (yazılar okunabilsin diye her cümle 2,5-4 saniye ekranda kalır):
1. Prolog: "Güç bir gecede gelmez." / "Peki bedeli ne?"
2. Yükseltme: ateş asası +4'ten +7'ye tırmanır, çatlar. "Sekiz basamak. Her basamakta bir risk." / "Ya yükselir… ya kırılır." / "Sen basar mıydın?" Sonra +8 (oyunun en yüksek seviyesi), ışık halesi ve ışınlarla. "Bu sefer yükseldi."
3. Klan: devasa boss (ekrana tamamen sığar), önünde üç sınıf. "Bazı canavarlar tek başına yenilmez." / "Yanına kimi alırdın?"
4. Savaş Alanı: iki oyuncu karşı karşıya, çarpışma. "Bu hafta zirvede kim olacak?" / "En iyiler elmas kazanır."
5. Pazar: karışık kademelerden eşyalar. "Aradığın eşya, başka bir oyuncunun tezgâhında olabilir." / "Pazar senin."
6. Bitiş: logo, "ÇOK YAKINDA!", App Store ve Google Play ikonları.

## Zırh ve silah
Her sahne farklı zırh kademesi kullanır: klan T3 (+7), düello T4 (+7) ve T5 (+8), pazar karışık kademeler. Silahlar +7 / +8'dir ve elementli parıltıları (şimşek, alev, buz) görünür.

Oyunda bu efektler gerçek saatle yanıp söner; kare kare çekimde rastgele patlamasın diye `fragman2.jsx` içindeki `window.settle` silah parıltılarını en parlak anda sabitler (yalnızca nefes alma zamana bağlıdır). Zırh ışığı katmanları (`.armor-effect`, `.armor-sweep`) video sayfasında kapalıdır, çünkü zırhı mavi-yeşil, yarı saydam gösteriyordu.

## Ses
Müzik oyunun `mist-valley.mp3` dosyasının 70. saniyesinden başlar. Vuruş, demir, gerilim yükselişi ve bozuk para sesleri FFmpeg ile üretilir. Bitiş geçişinde keskin çın yerine yavaş yükselen, alçak ve yumuşak bir ses kullanılır.

Mağaza ikonları `../nyxia-fragman/badges/` klasöründeki türevlerdir; aynı uyarılar geçerli (bkz. `../nyxia-fragman/README.md`).

## Yeniden üretme (depo kökünden)
1. `npx vite --port 5188 --host 127.0.0.1 --strictPort`
2. `NYXIA_FFMPEG=<ffmpeg yolu> node marketing/nyxia-fragman-2/build-audio.mjs`
3. `NYXIA_FFMPEG=<ffmpeg yolu> NYXIA_PLAYWRIGHT=<playwright yolu> node marketing/nyxia-fragman-2/render.mjs`
