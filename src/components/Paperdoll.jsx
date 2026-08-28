import { User } from "lucide-react";
import { itemTierColor } from "../data/itemRarity";
import { PAPERDOLL_LAYOUT } from "../data/paperdoll";
import { displayItemName, ARMOR_SLOTS } from "../utils/player";
import { styles } from "../styles";
import ItemIcon from "./ItemIcon";

// Knight Online'ın kendi kuşanma ekranı gibi: portre bir yanda, sabit bir
// ızgara öbür yanda, ikon üstünde ayrı bir isim etiketi yok — slot adı sadece
// dokununca/hover'da title tooltip'i olarak görünüyor (kullanıcının
// gönderdiği referans görüntülerdeki gibi sade, kalabalık olmayan bir
// görünüm). Shared between InventoryTab (tap = unequip) and UpgradeTab
// (tap = stage for upgrading) — onSlotClick(slotKey, item) lets each caller
// decide.
export default function Paperdoll({ player, cls, onSlotClick }) {
  return (
    <div style={styles.paperdollRoot}>
      <div
        style={{ ...styles.paperdollPortrait, borderColor: cls ? `${cls.color}55` : "var(--border)", background: cls ? `linear-gradient(180deg, ${cls.color}22, var(--bg-panel))` : "var(--bg-panel)" }}
        title="Karakter portresi — yakında"
      >
        {cls ? <cls.icon size={40} color={cls.color} strokeWidth={1.2} /> : <User size={40} color="var(--text-faint)" strokeWidth={1.2} />}
      </div>

      <div style={styles.paperdollGrid}>
        {PAPERDOLL_LAYOUT.map((slot) => {
          const item = player.equipped[slot.key];
          const color = item ? itemTierColor(item.tier) : null;
          return (
            <div
              key={slot.key}
              style={{ ...styles.equipSlotCard, ...(item ? { background: `${color}1c`, borderColor: `${color}66` } : {}) }}
              onClick={() => onSlotClick(slot.key, item)}
              title={item ? `${slot.label}: ${displayItemName(item)}` : slot.label}
            >
              {item ? (
                <ItemIcon item={item} size={ARMOR_SLOTS.includes(slot.key) ? 36 : 30} color={color} strokeWidth={1.5} />
              ) : (
                // Koyu metal ikonlar (Silah/Kask/Göğüslük/Donluk/Kolluk/
                // Ayaklık) düz opaklıkla koyu panel zemininde neredeyse
                // görünmez kalıyordu (kullanıcı geri bildirimi) — brightness
                // filtresi hepsini eşit şekilde aydınlatıp fark edilir hale
                // getiriyor, mücevherli olanlar (Kolye/Küpe/Yüzük/Kemer) da
                // zaten parlak taşları sayesinde bundan zarar görmüyor. Zırh
                // slotları (Kask/Göğüslük/Donluk/Kolluk/Ayaklık) ayrıca daha
                // büyük render ediliyor — kullanıcı: "zırhların görselleri
                // çok küçük kalmış".
                <img
                  src={slot.icon}
                  alt={slot.label}
                  style={{
                    width: ARMOR_SLOTS.includes(slot.key) ? 34 : 26,
                    height: ARMOR_SLOTS.includes(slot.key) ? 34 : 26,
                    objectFit: "contain", opacity: 0.95,
                    filter: "brightness(2.6) drop-shadow(0 0 2px rgba(255,255,255,0.85)) drop-shadow(0 0 2px rgba(255,255,255,0.85))",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
