// Mağaza gereği herkese açık, girişsiz erişilebilen yasal sayfalar (public/*.html).
// Mutlak adres: yerel mobil uygulamada göreli yol uygulamanın kendi dosyalarına gider.
const SITE = "https://nyxiaonline.com";
export const LEGAL_LINKS = [
  { id: "privacy", href: `${SITE}/privacy.html`, tr: "Gizlilik Politikası", en: "Privacy Policy" },
  { id: "terms", href: `${SITE}/terms.html`, tr: "Kullanım Koşulları", en: "Terms of Use" },
  { id: "delete", href: `${SITE}/delete-account.html`, tr: "Hesap Silme", en: "Delete Account" },
];
