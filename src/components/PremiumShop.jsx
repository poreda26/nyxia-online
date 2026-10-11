import { DIAMOND_PRICES } from "../data/diamondPrices";
import { chargeDiamonds, settle, reportChargeFailure, applyEntitlement } from "../utils/diamondCharge";
import ScrollArt from './icons/ScrollArt';
import {useState} from 'react';
import {Crown,Check,Gem,Star} from './icons/GameIcons';
import {PREMIUM_TIERS} from '../data/premium';
import {activePremiumTier,premiumDaysLeft,buyPremium} from '../utils/premium';
import {addItemToInventory,makeRaceScroll,makeJobScroll,makeBonusScrollStack} from '../utils/inventory';
import {useTranslation,formatReason} from '../i18n/LanguageContext';
import {buyWithDiamonds,purchaseFailureText} from '../utils/diamondBuy';
import {styles} from '../styles';
const RACE_SCROLL_PRICE=DIAMOND_PRICES.raceScroll,JOB_SCROLL_PRICE=DIAMOND_PRICES.jobScroll,BONUS_SCROLL_PRICE=DIAMOND_PRICES.bonusScroll;
export default function PremiumShop({player,setPlayer,bank,setBank,act,pushToast}){
 const {t}=useTranslation();
  // Sunucu ekonomisinde alım tek eylemdir (tahsilat + teslim aynı işlemde); eski yolda önce tahsil edilip sonra uygulanır.
  const serverBuy = async (kind, key, successToast) => {
    const result = await buyWithDiamonds(act, kind, key);
    if (!result.ok) { pushToast(purchaseFailureText(t, result), "warn"); return false; }
    pushToast(successToast, "loot");
    return true;
  };

  const purchasePremium = async (tierId) => {
    if (act.isServer()) { await serverBuy("premium", tierId, t("shop.premiumVoucherAdded", { tier: PREMIUM_TIERS[tierId].name })); return; }
    const dry = buyPremium(player, tierId, bank);
    if (!dry.bought) { pushToast(formatReason(t, dry, "market.purchaseFailed"), "warn"); return; }
    const charge = await chargeDiamonds("premium", tierId);
    if (!charge.ok) { reportChargeFailure(t, pushToast, charge); return; }
    const result = buyPremium(settle(player, charge), tierId, bank);
    setPlayer(applyEntitlement(result.player, charge.entitlement));
    setBank(result.bank);
    pushToast(t("shop.premiumVoucherAdded", { tier: PREMIUM_TIERS[tierId].name }), "loot");
  };

  // Satın alınan premium bir kupondur (çantaya gelir); aktif bir premium varken de alınabilir.
  const handlePremiumClick = (tierId) => { purchasePremium(tierId); };

  const buyBonusScroll = async () => {
    if (act.isServer()) { await serverBuy("bonusScroll", null, t("shop.bonusScrollPurchased")); return; }
    if (player.diamonds < BONUS_SCROLL_PRICE) { pushToast(t("shop.notEnoughDiamonds"), "warn"); return; }
    const dry = addItemToInventory(player, makeBonusScrollStack());
    if (!dry.added) { pushToast(t("shop.purchaseFailed", { reason: formatReason(t, dry) }), "warn"); return; }
    const charge = await chargeDiamonds("bonusScroll");
    if (!charge.ok) { reportChargeFailure(t, pushToast, charge); return; }
    const result = addItemToInventory({ ...player, diamonds: charge.diamonds }, makeBonusScrollStack());
    setPlayer(result.player);
    pushToast(t("shop.bonusScrollPurchased"), "loot");
  };

  const buyRaceScroll = async () => {
    if (act.isServer()) { await serverBuy("raceScroll", null, t("shop.raceScrollPurchased")); return; }
    if (player.diamonds < RACE_SCROLL_PRICE) { pushToast(t("shop.notEnoughDiamonds"), "warn"); return; }
    const dry = addItemToInventory(player, makeRaceScroll(1));
    if (!dry.added) { pushToast(t("shop.purchaseFailed", { reason: formatReason(t, dry) }), "warn"); return; }
    const charge = await chargeDiamonds("raceScroll");
    if (!charge.ok) { reportChargeFailure(t, pushToast, charge); return; }
    const result = addItemToInventory({ ...player, diamonds: charge.diamonds }, makeRaceScroll(1));
    setPlayer(result.player);
    pushToast(t("shop.raceScrollPurchased"), "loot");
  };

  const buyJobScroll = async () => {
    if (act.isServer()) { await serverBuy("jobScroll", null, t("shop.jobScrollPurchased")); return; }
    if (player.diamonds < JOB_SCROLL_PRICE) { pushToast(t("shop.notEnoughDiamonds"), "warn"); return; }
    const dry = addItemToInventory(player, makeJobScroll(1));
    if (!dry.added) { pushToast(t("shop.purchaseFailed", { reason: formatReason(t, dry) }), "warn"); return; }
    const charge = await chargeDiamonds("jobScroll");
    if (!charge.ok) { reportChargeFailure(t, pushToast, charge); return; }
    const result = addItemToInventory({ ...player, diamonds: charge.diamonds }, makeJobScroll(1));
    setPlayer(result.player);
    pushToast(t("shop.jobScrollPurchased"), "loot");
  };

return <div className="premium-shop">          <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>{t("shop.premiumHeader")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {Object.values(PREMIUM_TIERS).map((tier) => {
              const active = activePremiumTier(player);
              const isThisActive = active?.id === tier.id;
              const daysLeft = isThisActive ? premiumDaysLeft(player) : 0;
              return (
                <div key={tier.id} className="rpg-card" style={{ ...styles.itemDetailCard, borderColor: `${tier.color}66`, background: `${tier.color}0d` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Crown size={18} color={tier.color} strokeWidth={1.6} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: tier.color }}>{tier.name}</div>
                      <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{t("shop.tierDurationDays", { n: tier.durationDays })}</div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: tier.color, display: "flex", alignItems: "center", gap: 3 }}>
                      <Gem size={12} /> {tier.price}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                    {tier.perks.map((perk) => (
                      <div key={perk} style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                        <Check size={11} color={tier.color} /> {t(`shop.premiumPerk.${perk}`)}
                      </div>
                    ))}
                  </div>
                  <button
                    className="rpg-action" style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, background: tier.color, color: "#0B0C10" }}
                    onClick={() => handlePremiumClick(tier.id)}
                  >
                    {isThisActive ? t("shop.premiumActive", { days: daysLeft }) : t("shop.buyBtn")}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>{t("shop.scrollsHeader")}</div>
          <div className="rpg-row" style={{ ...styles.itemRow, borderColor: "#8B6FC955" }}>
            <ScrollArt item={{kind:'raceScroll',name:t('shop.raceScrollTitle')}} size={36}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>{t("shop.raceScrollTitle")}</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{t("shop.raceScrollDesc")}</div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#8B6FC9", marginRight: 8, display: "flex", alignItems: "center", gap: 3 }}>
              <Gem size={11} /> {RACE_SCROLL_PRICE}
            </div>
            <button className="rpg-action" style={styles.tinyBtn} onClick={buyRaceScroll}>{t("shop.buyShort")}</button>
          </div>
          <div className="rpg-row" style={{ ...styles.itemRow, borderColor: "#5FA8A055", marginTop: 8 }}>
            <ScrollArt item={{kind:'jobScroll',name:t('shop.jobScrollTitle')}} size={36}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>{t("shop.jobScrollTitle")}</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                {t("shop.jobScrollDesc")}
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#5FA8A0", marginRight: 8, display: "flex", alignItems: "center", gap: 3 }}>
              <Gem size={11} /> {JOB_SCROLL_PRICE}
            </div>
            <button className="rpg-action" style={styles.tinyBtn} onClick={buyJobScroll}>{t("shop.buyShort")}</button>
          </div>
          <div className="rpg-row" style={{ ...styles.itemRow, borderColor: "#D4AF6A55", marginTop: 8 }}>
            <ScrollArt item={{kind:"bonusScroll"}} size={32}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>{t("shop.bonusScrollTitle")}</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                {t("shop.bonusScrollDesc")}
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--gold-text)", marginRight: 8, display: "flex", alignItems: "center", gap: 3 }}>
              <Gem size={11} /> {BONUS_SCROLL_PRICE}
            </div>
            <button className="rpg-action" style={styles.tinyBtn} onClick={buyBonusScroll}>{t("shop.buyShort")}</button>
          </div>

</div>;
}
