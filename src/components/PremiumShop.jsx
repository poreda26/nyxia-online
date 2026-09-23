import ScrollArt from './icons/ScrollArt';
import {useState} from 'react';
import {Crown,Check,Gem,Shuffle,ScrollText,Star} from 'lucide-react';
import {PREMIUM_TIERS} from '../data/premium';
import {activePremiumTier,premiumDaysLeft,buyPremium} from '../utils/premium';
import {addItemToInventory,makeRaceScroll,makeJobScroll,makeBonusScrollStack} from '../utils/inventory';
import {useTranslation,formatReason} from '../i18n/LanguageContext';
import {styles} from '../styles';
const RACE_SCROLL_PRICE=500,JOB_SCROLL_PRICE=1500,BONUS_SCROLL_PRICE=800;
export default function PremiumShop({player,setPlayer,bank,setBank,pushToast}){
 const {t}=useTranslation();
 const [upgradeConfirmStep,setUpgradeConfirmStep]=useState(0);
  const purchasePremium = (tierId) => {
    const result = buyPremium(player, tierId, bank);
    if (!result.bought) { pushToast(formatReason(t, result, "market.purchaseFailed"), "warn"); return; }
    setPlayer(result.player);
    setBank(result.bank);
    pushToast(t("shop.premiumActivated", { tier: PREMIUM_TIERS[tierId].name }), "loot");
  };

  // No active premium -> straight purchase. Same tier already active, or
  // Mythic (top tier) trying to buy anything at all -> hard block, no
  // re-buying/extending. The one exception is Apex -> Mythic, which is an
  // upgrade rather than a fresh unrelated purchase, so it gets a two-step
  // confirmation instead of either extreme.
  const handlePremiumClick = (tierId) => {
    const active = activePremiumTier(player);
    if (!active) { purchasePremium(tierId); return; }
    if (active.id === tierId || active.id === "mythic") {
      pushToast(t("shop.alreadyHavePremium"), "warn");
      return;
    }
    setUpgradeConfirmStep(1);
  };

  const resolveUpgradeStep1 = (yes) => setUpgradeConfirmStep(yes ? 2 : 0);
  const resolveUpgradeStep2 = (yes) => {
    setUpgradeConfirmStep(0);
    if (yes) purchasePremium("mythic");
  };

  const buyBonusScroll = () => {
    if (player.diamonds < BONUS_SCROLL_PRICE) { pushToast(t("shop.notEnoughDiamonds"), "warn"); return; }
    const result = addItemToInventory({ ...player, diamonds: player.diamonds - BONUS_SCROLL_PRICE }, makeBonusScrollStack());
    if (!result.added) { pushToast(t("shop.purchaseFailed", { reason: formatReason(t, result) }), "warn"); return; }
    setPlayer(result.player);
    pushToast(t("shop.bonusScrollPurchased"), "loot");
  };

  const buyRaceScroll = () => {
    if (player.diamonds < RACE_SCROLL_PRICE) { pushToast(t("shop.notEnoughDiamonds"), "warn"); return; }
    const result = addItemToInventory({ ...player, diamonds: player.diamonds - RACE_SCROLL_PRICE }, makeRaceScroll(1));
    if (!result.added) { pushToast(t("shop.purchaseFailed", { reason: formatReason(t, result) }), "warn"); return; }
    setPlayer(result.player);
    pushToast(t("shop.raceScrollPurchased"), "loot");
  };

  const buyJobScroll = () => {
    if (player.diamonds < JOB_SCROLL_PRICE) { pushToast(t("shop.notEnoughDiamonds"), "warn"); return; }
    const result = addItemToInventory({ ...player, diamonds: player.diamonds - JOB_SCROLL_PRICE }, makeJobScroll(1));
    if (!result.added) { pushToast(t("shop.purchaseFailed", { reason: formatReason(t, result) }), "warn"); return; }
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
            <ScrollText size={18} color="#8B6FC9" />
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
            <Shuffle size={18} color="#5FA8A0" />
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
      {upgradeConfirmStep > 0 && (
        // position:fixed (not the shared modalOverlay's absolute) so this
        // stays centered in the viewport regardless of how far the Özel
        // Market list is scrolled when the confirmation triggers — Apex's
        // card sits below Mythic's, so this reliably fires mid-scroll.
        <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setUpgradeConfirmStep(0)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <Crown size={32} color={PREMIUM_TIERS.mythic.color} strokeWidth={1.4} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 220 }}>
              {upgradeConfirmStep === 1
                ? t("shop.upgradeConfirmStep1")
                : t("shop.upgradeConfirmStep2")}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }}
                onClick={() => (upgradeConfirmStep === 1 ? resolveUpgradeStep1(false) : resolveUpgradeStep2(false))}
              >
                {t("shop.no")}
              </button>
              <button
                className="rpg-action" style={{ ...styles.tinyBtn, background: PREMIUM_TIERS.mythic.color, color: "#0B0C10" }}
                onClick={() => (upgradeConfirmStep === 1 ? resolveUpgradeStep1(true) : resolveUpgradeStep2(true))}
              >
                {t("shop.yes")}
              </button>
            </div>
          </div>
        </div>
      )}

</div>;
}
