import { ScrollText } from "lucide-react";
import { GEAR_TIERS } from "../data/tiers";
import { itemTierColor } from "../data/itemRarity";
import { scrollPrice } from "../utils/upgrade";
import { addItemToInventory, makeScrollStack } from "../utils/inventory";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";

export default function ScrollShop({ player, setPlayer, pushToast }) {
  const buyScroll = (tierId) => {
    const price = scrollPrice(tierId);
    if (player.gold < price) { pushToast("Yeterli altının yok.", "warn"); return; }
    const result = addItemToInventory({ ...player, gold: player.gold - price }, makeScrollStack(tierId, 1));
    if (!result.added) { pushToast(`Satın alınamadı — ${result.reason}`, "warn"); return; }
    setPlayer(result.player);
    pushToast(`T${tierId} Yükseltme Parşömeni satın alındı.`, "loot");
  };

  return (
    <>
      <SectionLabel>Yükseltme Ustası · parşömen satın al</SectionLabel>
      <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: -4, marginBottom: 12 }}>
        Her tier'ın kendi parşömeni ayrı satılır — tier yükseldikçe fiyat da artar. Satın aldığın
        parşömenler çantana eklenir, Upgrade sekmesinde kullanılır.
      </p>
      <div style={styles.scrollShopGrid}>
        {GEAR_TIERS.map((tierId) => (
          <div key={tierId} style={{ ...styles.scrollBuyCard, borderColor: `${itemTierColor(tierId)}55` }}>
            <ScrollText size={14} color={itemTierColor(tierId)} strokeWidth={1.6} />
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: itemTierColor(tierId), marginTop: 3 }}>T{tierId}</div>
            <button style={{ ...styles.tinyBtn, ...styles.scrollBuyBtn, background: "#D4AF6A", color: "#15171E" }} onClick={() => buyScroll(tierId)}>
              {scrollPrice(tierId)}g
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
