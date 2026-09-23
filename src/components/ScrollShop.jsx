import ScrollArt from './icons/ScrollArt';
import { GEAR_TIERS } from "../data/tiers";
import { itemTierColor, tierName } from "../data/itemRarity";
import { scrollPrice } from "../utils/upgrade";
import { addItemToInventory, makeScrollStack, makeAccessoryScrollStack } from "../utils/inventory";
import { formatGold } from "../utils/player";
import { useTranslation } from "../i18n/LanguageContext";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";

// Kullanıcı isteği: "Takı basmak için Accessory Yükseltme kağıdı ekle.
// Tanesi 50.000 Gold olacak." — tier'a bağlı değil, tek sabit fiyat
// (bkz. utils/accessoryUpgrade.js).
const ACCESSORY_SCROLL_PRICE = 50000;

export default function ScrollShop({ player, setPlayer, pushToast }) {
  const { t, lang } = useTranslation();
  const buyScroll = (tierId) => {
    const price = scrollPrice(tierId);
    if (player.gold < price) { pushToast(t("shop.notEnoughGold"), "warn"); return; }
    const result = addItemToInventory({ ...player, gold: player.gold - price }, makeScrollStack(tierId, 1));
    if (!result.added) { pushToast(t("shop.purchaseFailed", { reason: result.reason }), "warn"); return; }
    setPlayer(result.player);
    pushToast(t("shop.upgradeScrollPurchased", { tier: tierName(lang, tierId) }), "loot");
  };

  const buyAccessoryScroll = () => {
    if (player.gold < ACCESSORY_SCROLL_PRICE) { pushToast(t("shop.notEnoughGold"), "warn"); return; }
    const result = addItemToInventory({ ...player, gold: player.gold - ACCESSORY_SCROLL_PRICE }, makeAccessoryScrollStack(1));
    if (!result.added) { pushToast(t("shop.purchaseFailed", { reason: result.reason }), "warn"); return; }
    setPlayer(result.player);
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
          <div key={tierId} style={{ ...styles.scrollBuyCard, borderColor: `${itemTierColor(tierId)}55` }}>
            <ScrollArt item={{kind:"scroll",tier:tierId}} size={40}/>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: itemTierColor(tierId), marginTop: 3 }}>{tierName(lang, tierId)}</div>
            <button style={{ ...styles.tinyBtn, ...styles.scrollBuyBtn, background: "#D4AF6A", color: "#15171E" }} onClick={() => buyScroll(tierId)}>
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
