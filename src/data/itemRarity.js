// Kullanıcı isteği: "Oyunda Tier sistemini kaldırmak bunun yerine farklı
// isimler vermek istiyorum... renklerine göre isim yazmayı boşver, bunları
// DEĞER SIRASINA göre isimlendir, Legendary tarzında falan." — oyuncuya
// hiçbir yerde "Tier"/"T1"-"T6" yazısı göstermiyoruz, bunun yerine standart
// bir MMO nadirlik skalası kullanıyoruz (rakamlar/`tier` alanı KOD içinde
// aynen kalıyor, sadece EKRANA yazılan isim değişti). Renkler (beyaz→
// kırmızı, zaten değer sırasına göre kademelendirilmiş) aynı kalıyor —
// isim artık renkten değil doğrudan bu nadirlik skalasından geliyor.
export const ITEM_TIER_COLORS = {
  1: "#E7E7E4",
  2: "#3FCB6B",
  3: "#4A90E2",
  4: "#B368F7",
  5: "#F5A623",
  6: "#E8384F", // artık sadece Savaş Alanı Bossları'ndan düşüyor
};

export function itemTierColor(tierId) { return ITEM_TIER_COLORS[tierId] || "#9CA1B0"; }

export const ITEM_TIER_LABEL = {
  tr: { 1: "Sıradan", 2: "Nadide", 3: "Nadir", 4: "Destansı", 5: "Efsanevi", 6: "Mitik" },
  en: { 1: "Common", 2: "Uncommon", 3: "Rare", 4: "Epic", 5: "Legendary", 6: "Mythic" },
};

// Tier numarasını (chest/quest/parşömen gibi eşya-DIŞI yerlerde de) aynı
// nadirlik adına çeviren tek ortak yardımcı — "T{tier}" yazan her yer
// artık bunu çağırıyor, tekrar tekrar ITEM_TIER_LABEL[lang][tier] yazmak yerine.
export function tierName(lang, tierId) { return ITEM_TIER_LABEL[lang]?.[tierId] || String(tierId); }

export const TIER_PREFIX = {
  1: ["Sisli", "Puslu", "Solgun"],
  2: ["Külden", "Kavrulmuş", "Volkanik"],
  3: ["Gölgeli", "Karanlık", "Sessiz"],
  4: ["Kristal", "Arkane", "Parıldayan"],
  5: ["Kaotik", "Kıyamet", "Şeytani"],
};
