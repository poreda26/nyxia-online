import ScrollArt from './icons/ScrollArt';
import { GEAR_TIERS } from "../data/tiers";
import { itemTierColor, tierName } from "../data/itemRarity";
import { scrollPrice } from "../utils/upgrade";
import { formatGold } from "../utils/player";
import { useTranslation } from "../i18n/LanguageContext";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";

// Kullanıcı isteği: "Takı basmak için Accessory Yükseltme kağıdı ekle.
// Tanesi 50.000 Gold olacak." — tier'a bağlı değil, tek sabit fiyat
// (bkz. utils/accessoryUpgrade.js).
const ACCESSORY_SCROLL_PRICE = 50000;

export default function ScrollShop({ player, act, pushToast }) {
  const { t, lang } = useTranslation();
  const failToast = (result) => pushToast(
    result.reason === "notEnoughGold" ? t("shop.notEnoughGold")
      : result.reason === "network" ? t("battle.actionFailed")
        : t("shop.purchaseFailed", { reason: result.detail || result.reason }), "warn");
  const buyScroll = async (tierId) => {
    const result = await act("shop/buyScroll", { tier: tierId });
    if (!result.ok) { failToast(result); return; }
    pushToast(t("shop.upgradeScrollPurchased", { tier: tierName(lang, tierId) }), "loot");
  };

  const buyAccessoryScroll = async () => {
    const result = await act("shop/buyAccessoryScroll");
    if (!result.ok) { failToast(result); return; }
    pushToast(t("shop.accessoryScrollPurchased"), "loot");
  };

  return (
    <>
      <SectionLabel>{t("shop.scrollShopHeader")}</SectionLabel>
      <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: -4, marginBottom: 12 }}>
        {t("shop.scrollShopDesc")}
      </p>
      <div style={styles.scrollShopGrid}>
        {GEAR_TIERS.map((tierId) => (
          <div key={tierId} data-tut={`scroll-card-${tierId}`} style={{ ...styles.scrollBuyCard, borderColor: `${itemTierColor(tierId)}55` }}>
            <ScrollArt item={{kind:"scroll",tier:tierId}} size={40}/>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: itemTierColor(tierId), marginTop: 3 }}>{tierName(lang, tierId)}</div>
            <button data-tut={`buy-scroll-${tierId}`} style={{ ...styles.tinyBtn, ...styles.scrollBuyBtn, background: "#D4AF6A", color: "#15171E" }} onClick={() => buyScroll(tierId)}>
              {formatGold(scrollPrice(tierId))}g
            </button>
          </div>
        ))}
        <div style={{ ...styles.scrollBuyCard, borderColor: "#5FA8A055" }}>
          <ScrollArt item={{kind:"accessoryScroll"}} size={40}/>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#5FA8A0", marginTop: 3 }}>{t("shop.accessoryLabel")}</div>
          <button style={{ ...styles.tinyBtn, ...styles.scrollBuyBtn, background: "#5FA8A0", color: "#15171E" }} onClick={buyAccessoryScroll}>
            {formatGold(ACCESSORY_SCROLL_PRICE)}g
          </button>
        </div>
      </div>
    </>
  );
}
