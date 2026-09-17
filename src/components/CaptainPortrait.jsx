// Kaptan'ın elle çizilmiş SVG portresi — kullanıcı isteği: "Kaptan için bir
// görsel hazırla." Dış bir görsel üretme aracımız yok, bu yüzden oyunun
// zaten kullandığı altın/lacivert paletiyle (bkz. styles.js'teki #D4AF6A)
// tutarlı, tamamen kod ile çizilmiş bir vektör portre — miğferli, sakallı,
// yara izli bir muhafız kaptanı. CaptainTab.jsx (panosunun başlığı) ve
// TutorialModal.jsx (anlatıcı olarak) ikisinde de kullanılıyor.
export default function CaptainPortrait({ size = 56 }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="capBg" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#2A2E3A" />
          <stop offset="100%" stopColor="#14161C" />
        </radialGradient>
        <linearGradient id="capGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFD8A0" />
          <stop offset="100%" stopColor="#B8863F" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="58" fill="url(#capBg)" stroke="#D4AF6A" strokeWidth="2" />

      {/* pelerin/omuz */}
      <path d="M18 122 Q60 86 102 122 L102 132 L18 132 Z" fill="#3A2E22" />
      <path d="M18 122 Q60 92 102 122 L102 127 Q60 98 18 127 Z" fill="url(#capGold)" />

      {/* boyun */}
      <rect x="48" y="78" width="24" height="18" rx="6" fill="#C79A72" />

      {/* yüz */}
      <ellipse cx="60" cy="66" rx="26" ry="28" fill="#D9AE84" />

      {/* sakal */}
      <path d="M36 64 Q36 98 60 101 Q84 98 84 64 Q85 85 60 89 Q35 85 36 64 Z" fill="#8C8C8C" />
      {/* bıyık */}
      <path d="M46 70 Q60 77 74 70 Q60 75 46 70 Z" fill="#7A7A7A" />

      {/* kaşlar */}
      <path d="M43 53 Q49 49 55 53" stroke="#5A5A5A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M65 53 Q71 49 77 53" stroke="#5A5A5A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* gözler */}
      <ellipse cx="49" cy="60" rx="3.1" ry="3.6" fill="#1A1C22" />
      <ellipse cx="71" cy="60" rx="3.1" ry="3.6" fill="#1A1C22" />

      {/* yara izi */}
      <path d="M71 45 L77 65" stroke="#A85A5A" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />

      {/* miğfer */}
      <path d="M29 50 Q60 15 91 50 Q91 39 84 33 Q60 11 36 33 Q29 39 29 50 Z" fill="#3A3F4C" stroke="url(#capGold)" strokeWidth="2.5" />
      <path d="M60 13 L60 45" stroke="url(#capGold)" strokeWidth="4" strokeLinecap="round" />
      <path d="M29 47 Q13 41 9 24" stroke="url(#capGold)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M91 47 Q107 41 111 24" stroke="url(#capGold)" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
