// Reference diamond-pack catalog for the "Buy Diamonds" menu — built ahead
// of the real App Store Connect / Google Play Console product setup (see
// memory: project_diamond_iap_plan). `priceLabel` here is a placeholder
// reference price only, meant to guide what gets configured as matching
// products in both consoles later; once RevenueCat is wired in, the shop
// should show its live, localized price string per pack instead of this.
// `id` doubles as the future store product ID, so pick it once and don't
// rename casually after products exist in the consoles.
export const DIAMOND_PACKS = [
  { id: "diamonds_100", diamonds: 100, bonusPct: 0, priceLabel: "₺19,99" },
  { id: "diamonds_550", diamonds: 550, bonusPct: 10, priceLabel: "₺99,99" },
  { id: "diamonds_1200", diamonds: 1200, bonusPct: 20, priceLabel: "₺199,99", popular: true },
  { id: "diamonds_2500", diamonds: 2500, bonusPct: 25, priceLabel: "₺399,99" },
  { id: "diamonds_5500", diamonds: 5500, bonusPct: 35, priceLabel: "₺799,99", bestValue: true },
  { id: "diamonds_12000", diamonds: 12000, bonusPct: 50, priceLabel: "₺1.599,99" },
];
