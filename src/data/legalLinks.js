// Mağaza gereği herkese açık, girişsiz erişilebilen yasal sayfalar (public/*.html).
// Mutlak adres: yerel mobil uygulamada göreli yol uygulamanın kendi dosyalarına gider.
const SITE = "https://nyxiaonline.com";
export const LEGAL_LINKS = [
  { id: "privacy", href: `${SITE}/privacy.html`, tr: "Gizlilik Politikası", en: "Privacy Policy" },
  { id: "terms", href: `${SITE}/terms.html`, tr: "Kullanım Koşulları", en: "Terms of Use" },
  { id: "delete", href: `${SITE}/delete-account.html`, tr: "Hesap Silme", en: "Delete Account" },
];

// Topluluk ve destek bağlantıları (Ayarlar → Oyun rehberi).
export const COMMUNITY_LINKS = [
  { id: "discord", href: "https://discord.gg/K7aUAPhVFz", tr: "Discord'a katıl", en: "Join Discord" },
  { id: "instagram", href: "https://www.instagram.com/nyxiaonline/", tr: "Instagram'da takip et", en: "Follow on Instagram" },
  { id: "wiki", href: `${SITE}/wiki/`, tr: "Oyun wikisi", en: "Game wiki" },
  { id: "support", href: `${SITE}/support.html`, tr: "Destek talebi aç", en: "Open a support ticket" },
];
