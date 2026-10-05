import {Ban} from './icons/GameIcons';
import { itemTierColor } from "../data/itemRarity";
import { BANK_PAGE_SLOTS } from "../utils/inventory";
import { styles } from "../styles";
import ItemIcon from "./ItemIcon";

// Bank pages are simpler than BagGrid on purpose — no drag-to-reorder, just
// a dense grid. Reordering a page of stashed items wasn't asked for and the
// bag's positional-layout machinery isn't worth duplicating for it.
export default function BankGrid({ playerClass, items, selectedId, onItemTap }) {
  const slots = Array.from({ length: BANK_PAGE_SLOTS }, (_, i) => items[i] || null);

  return (
    <div style={styles.bagGrid}>
      {slots.map((item, i) => {
        const locked=playerClass&&item&&["armor","weapon"].includes(item.kind)&&(item.class||item.cls)&&(item.class||item.cls)!==playerClass;
        const isSelected = !!item && item.id === selectedId;
        return (
          <button
            key={item ? item.id : `empty-${i}`}
            onClick={() => item && onItemTap(item)}
            style={{
              ...styles.bagSlot,
              ...(item ? { borderColor: `${itemTierColor(item.tier)}88`, background: `${itemTierColor(item.tier)}1c` } : styles.bagSlotEmpty),
              ...(isSelected ? styles.bagSlotSelected : {}),
            }}
          >
            {item && <span data-bag-art style={{position:'absolute',inset:'7%',display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}><ItemIcon item={item} size="100%" color={itemTierColor(item.tier)} strokeWidth={1.5} /></span>}
            {locked&&<Ban aria-label="Başka sınıfa ait" size={14} color="#E8A5AF" style={{position:"absolute",top:3,left:3}}/>}
            {item && item.stackable && (item.count || 1) > 1 && (
              <span style={styles.bagSlotBadge}>{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
