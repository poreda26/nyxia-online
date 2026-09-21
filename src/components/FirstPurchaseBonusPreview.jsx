import { useState } from "react";
import { itemTierColor } from "../data/itemRarity";
import { buildBonusGear, buildBonusScrolls } from "../utils/firstPurchaseBonus";
import { styles } from "../styles";
import ItemIcon from "./ItemIcon";
import ItemTooltip from "./ItemTooltip";

// Kullanıcı isteği: "Tier 1 +6 zırh seti ve silah yazmak yerine itemlerin
// görsellerini gösterelim... üzerine tıklandığında itemleri görebilelim" —
// DiamondShopModal'ın İlk Ödeme kartı ve FirstPurchaseOfferModal aynı
// önizlemeyi paylaşıyor, o yüzden tek yerden. Buradaki eşyalar sadece
// GÖRÜNTÜLEME amaçlı — utils/firstPurchaseBonus.js#buildBonusGear/
// buildBonusScrolls her çağrıda taze bir uid ile üretiyor, envantere hiç
// dokunmuyor (gerçek verme hâlâ grantFirstPurchaseBonus'ta, satın alma
// onaylanınca).
function ItemCell({ item, badge, onTap }) {
  const tierColor = itemTierColor(item.tier);
  return (
    <button
      onClick={() => onTap(item)}
      style={{
        ...styles.bagSlot, width: 40, height: 40, flexShrink: 0,
        borderColor: `${tierColor}88`, background: `${tierColor}1c`,
      }}
    >
      <ItemIcon item={item} size={28} color={tierColor} strokeWidth={1.5} />
      {badge && <span style={styles.bagSlotBadge}>{badge}</span>}
    </button>
  );
}

export default function FirstPurchaseBonusPreview({ player }) {
  const [previewItem, setPreviewItem] = useState(null);
  const scrolls = buildBonusScrolls();
  const gear = buildBonusGear(player.class);

  return (
    <>
      <div className="bonus-preview-row" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {scrolls.map((s) => (
          <ItemCell key={s.id} item={s} badge={`×${s.count}`} onTap={setPreviewItem} />
        ))}
      </div>
      <div className="bonus-preview-row" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
        {gear.map((g) => (
          <ItemCell key={g.id} item={g} badge={`+${g.upgradeLevel}`} onTap={setPreviewItem} />
        ))}
      </div>

      {previewItem && (
        <div style={{ ...styles.itemSheetOverlay, zIndex: 70 }} onClick={() => setPreviewItem(null)}>
          <div style={styles.itemSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.itemSheetHandle} />
            <ItemTooltip item={previewItem} player={player} />
          </div>
        </div>
      )}
    </>
  );
}
