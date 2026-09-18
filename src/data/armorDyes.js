// Kozmetik zırh boyaları — sadece görsel, hiçbir istatistik etkisi yok.
// Yeni sprite/PNG üretmiyor: CharacterFigure.jsx her zırh katmanına (ten/kıyafet
// tabanı hariç — bkz. o dosyadaki "cloth" ayrımı) bir SVG hue-rotate + saturate
// filtresi uygulayarak mevcut zırh görselini kod tarafında yeniden renklendiriyor.
// hue: derece cinsinden renk çarkı döndürmesi (mutlak bir hedef renk değil —
// sonuç, zırhın taban rengine göre değişir, bu yüzden isimler kesin ton yerine
// genel yöne göre seçildi). sat: doygunluk çarpanı (1 = değişmez).
export const ARMOR_DYES = [
  { id: "crimson", name: "Kızıl Boya", hue: 320, sat: 1.35, cost: 250, swatch: "#C9425A" },
  { id: "azure", name: "Gökyüzü Mavisi", hue: 190, sat: 1.3, cost: 250, swatch: "#4FC3D9" },
  { id: "emerald", name: "Zümrüt Yeşili", hue: 100, sat: 1.3, cost: 250, swatch: "#4FC97A" },
  { id: "violet", name: "Mor Alacası", hue: 260, sat: 1.25, cost: 300, swatch: "#8B6FC9" },
  { id: "gold", name: "Altın Varak", hue: 25, sat: 1.5, cost: 400, swatch: "#D4AF6A" },
  { id: "obsidian", name: "Obsidyen Karası", hue: 220, sat: 0.1, cost: 400, swatch: "#3A3F4A" },
];
