import { Gift, X } from "lucide-react";
import { itemTierColor } from "../data/itemRarity";
import { displayItemName } from "../utils/player";
import { styles } from "../styles";
import ItemIcon from "./ItemIcon";

// Tek tek sandık açma animasyonu (bkz. ChestModal.jsx) çok kutu birden
// açılınca pratik değil — kullanıcı: "elimizde fazla kutu olduğu zaman
// açmak problem olabiliyor, toplu kutu açabileceğimiz bir çözüm yap." Bu
// modal hepsini anında çözüp tek bir özet listesi gösteriyor, animasyonsuz.
export default function BulkChestModal({ result, onClose }) {
  const { items, failed } = result;
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalCard, maxWidth: 300 }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 4 }}
        >
          <X size={16} />
        </button>

        <Gift size={32} color="#D4AF6A" strokeWidth={1.4} />
        <div style={{ marginTop: 10, fontFamily: "var(--font-display)", fontSize: 16, textAlign: "center" }}>
          {items.length} eşya kazanıldı!
        </div>
        {failed > 0 && (
          <div style={{ fontSize: 10, color: "#E8A5AF", marginTop: 4, textAlign: "center" }}>
            {failed} eşya çantana sığmadı, kayboldu.
          </div>
        )}

        <div style={{ width: "100%", maxHeight: 260, overflowY: "auto", marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((item, i) => (
            <div key={item.id || i} style={{ ...styles.itemRow, borderColor: `${itemTierColor(item.tier)}44` }}>
              <ItemIcon item={item} size={20} color={itemTierColor(item.tier)} strokeWidth={1.6} />
              <span style={{ flex: 1, fontSize: 12 }}>{displayItemName(item)}</span>
              <span style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>T{item.tier}</span>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ fontSize: 11, color: "var(--text-faint)", textAlign: "center", padding: 10 }}>Hiçbir eşya kazanılmadı.</div>
          )}
        </div>

        <button style={{ ...styles.primaryBtn, marginTop: 16, width: "100%" }} onClick={onClose}>Tamam</button>
      </div>
    </div>
  );
}
