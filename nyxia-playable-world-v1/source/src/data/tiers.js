// Ekipman tier'ları (T1-T6) — canavar/harita gruplaması artık data/maps.js'te.
// Bu liste sadece "her tier için bir tane" ihtiyacı olan yerlerde kullanılır
// (örn. components/ScrollShop.jsx'in parşömen tezgahı). T6, Warrior/Rogue
// gerçek KO verisiyle eklenen Eşsiz eşyalardan SONRA eklendi — bug testinde
// tezgahın hâlâ 5'te tavanlandığı, T6 eşyaların asla yükseltilemediği
// bulundu (bkz. utils/upgrade.js#SCROLL_PRICES'daki aynı not).
export const GEAR_TIERS = [1, 2, 3, 4, 5, 6];
