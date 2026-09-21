import './RewardPanels.css';
export default function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

      /* Locks the app to exactly one screen's worth of height (the real
         viewport, not "however tall the current tab's content happens to
         be") — without this, html/body/#root have no defined height, so
         appRoot's height:100% resolves to nothing and it silently falls
         back to growing with content instead, which is why the frame used
         to visibly resize switching between tabs. */
      html, body, #root { height: 100%; height:100dvh; overflow:hidden; }
      #root { box-sizing:border-box; padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }
      body { margin: 0; overscroll-behavior: none; }

      :root {
        --bg-void: #0B0C10;
        --bg-panel: #15171E;
        --bg-panel-alt: #1B1E27;
        --border: #262A35;
        --text-primary: #EDE8DC;
        --text-muted: #9CA1B0;
        --text-faint: #5C6072;
        --gold-text: #D4AF6A;
        --font-display: 'Cinzel', serif;
        --font-body: 'Manrope', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
      }

      /* Kullanıcı isteği: "Oyunumuz çok Dark temada, kullanıcılarımıza
         daha light bir tema yapabiliriz, yine de bu beyaz olmasın biraz
         daha aydınlık bir tema olsun." — sadece bu nötr (arkaplan/metin)
         değişkenler değişiyor; sınıf/harita/rarity gibi anlamlı renkler
         (kırmızı, mavi, mor vb.) her iki temada da aynı kalıyor. App.jsx
         bu attribute'u <html> üzerine yazıyor (bkz. utils/settings.js#
         loadSettings'in "theme" alanı, Ayarlar > Tema). Ilık/parşömen
         tonlar seçildi ki "beyaz olmasın" isteğine uysun, saf beyaz/gri
         değil. [data-theme], plain :root'tan daha spesifik olduğu için
         sırası önemli değil — hep bunu eziyor.

         Kullanıcı isteği (sonraki turda bulunan bug): "Aydınlık mod'da
         envanterde okunmayan yazılar var" — kök neden iki ayrı kontrast
         sorunuydu, otomatik bir kontrast tarayıcı script'iyle doğrulandı:
         1) --text-faint (#948A78) açık zemine karşı sadece ~2.7:1 kontrast
            veriyordu (WCAG AA eşiği 4.5:1) — koyu temada iyi çalışan bir
            değer birebir renk-tersine çevrilip açık temaya taşınmıştı,
            ama parlaklığı açık zeminlere çok yakın kalıyordu.
         2) Altın vurgu rengi (#D4AF6A) — dark temada neredeyse siyah bir
            zemine karşı parlak durduğu için hep "sabit, tema-bağımsız"
            sanılmıştı, ama açık, ılık bir zeminde ~1.9:1'e düşüyordu.
            Bu yüzden artık ayrı bir --gold-text değişkeni var (yukarıdaki
            yorumun "her ikisiyle de kontrastı yeten sabit tonlar" iddiası
            bu yönüyle YANLIŞ çıktı) — dark'ta aynı altın, light'ta daha
            koyu bir amber/bronz (okunurluk için), ikisi de "altın" hissi
            veriyor. Butonların SABİT altın ARKA PLANI (background:
            "#D4AF6A", koyu metinle eşleşen) bu değişikliğin dışında —
            o zaten kendi kendine yeten bir kontrast çifti, temaya göre
            değişmesine gerek yok. */
      :root[data-theme="light"] {
        --bg-void: #EDE6D8;
        --bg-panel: #F8F3E8;
        --bg-panel-alt: #EFE7D5;
        --border: #D9CEB6;
        --text-primary: #2B2621;
        --text-muted: #6B6253;
        --text-faint: #7A705F;
        --gold-text: #7A5A10;
      }

      .shake { animation: shakeAnim 0.26s ease; }
      @keyframes shakeAnim {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
      }

      .chest-shake { animation: chestShake 0.5s ease-in-out infinite; display: inline-block; }
      @keyframes chestShake {
        0%, 100% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(-8deg) scale(1.03); }
        75% { transform: rotate(8deg) scale(1.03); }
      }

      .chest-reveal { display: flex; flex-direction: column; align-items: center; position: relative; animation: revealPop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      @keyframes revealPop {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }

      .confetti-wrap { position: absolute; top: -20px; left: 0; right: 0; height: 120px; pointer-events: none; }
      .confetti-bit { position: absolute; top: 0; width: 5px; height: 10px; border-radius: 1px; animation: confettiFall 1.1s ease-in forwards; }
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110px) rotate(340deg); opacity: 0; }
      }

      .toast {
        position: fixed; bottom: 92px; left: 50%; transform: translateX(-50%);
        background: var(--bg-panel-alt); border: 1.5px solid var(--border);
        color: var(--text-primary); font-family: var(--font-body); font-size: 13px; font-weight: 600;
        padding: 12px 18px; border-radius: 12px; z-index: 999; max-width: 92%;
        box-shadow: 0 10px 28px -8px rgba(0,0,0,0.7);
        animation: toastIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        text-align: center; line-height: 1.5;
      }
      @keyframes toastIn {
        0% { opacity: 0; transform: translate(-50%, 14px) scale(0.92); }
        100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
      }
      .forge-hit { animation: forgeHit 0.5s ease-in-out infinite; display: inline-block; }
      @keyframes forgeHit {
        0%, 100% { transform: rotate(0deg) scale(1); }
        30% { transform: rotate(-18deg) scale(1.06); }
        55% { transform: rotate(8deg) scale(0.96); }
      }

      .forge-glow { animation: forgeGlow 1s ease-in-out infinite; }
      @keyframes forgeGlow {
        0%, 100% { box-shadow: 0 0 0px rgba(212,175,106,0); }
        50% { box-shadow: 0 0 26px rgba(212,175,106,0.35); }
      }

      .forge-fail-shake { animation: forgeFailShake 0.4s ease; }
      @keyframes forgeFailShake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }

      /* Kullanıcı: "exp gold düşen eşya bildirimi... yakalamakta
         zorlanıyorum" — her öldürmede görünen loot bildirimi artık sadece
         ince bir kenarlık değil, dolgun bir altın arka plan + daha güçlü
         bir gölge taşıyor, göz kaçırmasın diye. */
      .toast-loot {
        border-color: #D4AF6A; background: linear-gradient(180deg, #D4AF6A2E, var(--bg-panel-alt) 65%);
        box-shadow: 0 10px 32px -6px #D4AF6A66;
      }
      .toast-warn { border-color: #C9425A55; color: #E8A5AF; }
      .toast-heal { border-color: #5FA8A055; }
      .toast-level { border-color: #4FC3D9; box-shadow: 0 10px 32px -6px #4FC3D988; }

      .wz-spin { animation: wzSpin 0.9s linear infinite; }
      @keyframes wzSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .wz-countdown-pop { animation: wzCountdownPop 1s ease-out; }
      @keyframes wzCountdownPop {
        0% { transform: scale(0.4); opacity: 0; }
        30% { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Kullanıcı isteği: "Savaş sekmesinde 1-15 yazıyor yanındaki Fallow
         Valley okunmuyor. Siyah kalıyor... bir kaç yerde bu şekilde
         okunmama sorunları mevcut." — kök neden: tarayıcının button
         elemanı için varsayılan metin rengi (ButtonText, genelde siyaha
         yakın) normal CSS mirasını EZİYOR; bu app'te birçok buton kendi
         içindeki span'e hiç renk vermeden koyu temaya güveniyordu, o
         yüzden buton kendi rengini hiç ayarlamayan her yerde siyah/okunmaz
         kalıyordu. Global reset'e renk eklemek TÜM bu butonları tek
         seferde düzeltiyor — inline style'dan renk veren butonlar zaten
         (daha yüksek öncelikli olduğu için) etkilenmiyor, bu sadece hiç
         renk vermeyenler için bir varsayılan sağlıyor. */
      button { font-family: var(--font-body); cursor: pointer; color: var(--text-primary); }
      input, select { font-family: var(--font-body); color: var(--text-primary); }

      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    `}</style>
  );
}
