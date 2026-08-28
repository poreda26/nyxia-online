// Two Elmas-only VIP subscriptions — a straight power/convenience boost on
// top of the free game, never a pay-to-skip mechanic (no bonus is a flat
// item grant beyond the one gift scroll). All bonuses are multiplicative on
// top of the player's own numbers so they stay meaningful at every level.
// See utils/premium.js for how these get applied and utils/upgrade.js for
// what the gift Bonus Scroll actually does.
export const PREMIUM_TIERS = {
  mythic: {
    id: "mythic",
    name: "Mythic Premium",
    price: 3000,
    durationDays: 15,
    color: "#FF8C42",
    expMult: 2.0,
    dropMult: 1.10,
    sellMult: 1.10,
    repairDiscount: 0.50,
    bankBonusPages: 2,
    giftScrolls: 1,
    nationalPointBonus: 25,
    nationalPointLossReduction: 0.10,
    perks: [
      "+%100 EXP Bonusu (2x Kazanım)",
      "+%10 Eşya/Kutu Düşme Bonusu",
      "+%10 NPC Satış Fiyatı Bonusu",
      "%50 Tamir İndirimi",
      "Hediye: 1x Bonus Parşömen",
      "Depoda +2 sayfa",
      "Kaybedilen National Point %10 azalır",
      "Otomatik Saldırı özelliği",
    ],
  },
  apex: {
    id: "apex",
    name: "Apex Premium",
    price: 1500,
    durationDays: 15,
    color: "#8B6FC9",
    expMult: 1.5,
    dropMult: 1.03,
    sellMult: 1.05,
    repairDiscount: 0.25,
    bankBonusPages: 0,
    giftScrolls: 1,
    nationalPointBonus: 10,
    nationalPointLossReduction: 0.05,
    perks: [
      "+%50 EXP Bonusu",
      "+%3 Eşya/Kutu Düşme Bonusu",
      "+%5 NPC Satış Fiyatı Bonusu",
      "%25 Tamir İndirimi",
      "Hediye: 1x Bonus Parşömen",
      "Kaybedilen National Point %5 azalır",
      "Otomatik Saldırı özelliği",
    ],
  },
};
