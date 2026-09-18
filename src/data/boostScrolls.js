// Elmasla satılan geçici takviye parşömenleri — kullanıcı isteği: 30
// dakikalık, yüzdesel (ya da HP'de düz) bir bonus veren 6 ayrı parşömen,
// paketler halinde (bkz. BOOST_SCROLL_PACK_SIZE) elmasla satılacak. İleride
// Battle Pass'e "deneme amaçlı 1'er tane" ödül olarak eklenmesi planlanıyor
// (bkz. utils/boosts.js#makeBoostScrollStack — o fonksiyon buna hazır,
// Battle Pass'in kendisi henüz yok).
//
// type: "percent" (multiplier olarak uygulanır, magnitude 0.30 = %30) ya da
// "flat" (aynen eklenir, magnitude 100 = +100). packCost bir REFERANS fiyat
// — App Store Connect/Play Console'a gerçek ürün girilirken bu sayılar
// başlangıç noktası, kesin fiyat değil.
export const BOOST_SCROLL_PACK_SIZE = 20;
export const BOOST_DURATION_MIN = 30;

export const BOOST_SCROLLS = [
  { id: "exp", type: "percent", magnitude: 0.30, packCost: 600, color: "#5FA8A0" },
  { id: "gold", type: "percent", magnitude: 0.25, packCost: 500, color: "#D4AF6A" },
  { id: "atk", type: "percent", magnitude: 0.20, packCost: 500, color: "#C9425A" },
  { id: "np", type: "percent", magnitude: 0.15, packCost: 350, color: "#4FC3D9" },
  { id: "def", type: "percent", magnitude: 0.10, packCost: 300, color: "#8B6FC9" },
  { id: "hp", type: "flat", magnitude: 100, packCost: 300, color: "#E8A5AF" },
];

export function boostScrollDef(id) {
  return BOOST_SCROLLS.find((s) => s.id === id) || null;
}

const BOOST_NAMES = {
  tr: { exp: "Deneyim Parşömeni", gold: "Altın Parşömeni", np: "NP Parşömeni", hp: "Güç Parşömeni", def: "Savunma Parşömeni", atk: "Saldırı Parşömeni" },
  en: { exp: "Exp Scroll", gold: "Gold Scroll", np: "NP Scroll", hp: "Buff Scroll", def: "Def Scroll", atk: "Attack Scroll" },
};

export function boostScrollName(id, lang = "tr") {
  return (BOOST_NAMES[lang] || BOOST_NAMES.tr)[id] || id;
}
