import { useState, useRef, useEffect } from "react";
import { Ban, Check } from "lucide-react";
import { itemTierColor } from "../data/itemRarity";
import { BAG_SLOTS, bagWeightCapacity, bagWeightUsed, reconcileBagLayout } from "../utils/inventory";
import { styles } from "../styles";
import BarTrack from "./shared/BarTrack";
import ItemIcon from "./ItemIcon";

// Shared between InventoryTab (tap = select for the detail panel, or toggle
// membership in bulkSelectedIds when in toplu-seçim mode) and UpgradeTab
// (tap = stage into the forge) — onItemTap(item, index) lets each caller
// decide what a tap means. Reordering (pointer-based drag, works for mouse
// and touch) always lives here since it's pure UI state (player.bagLayout,
// see reconcileBagLayout) and has no gameplay effect either way. Moves are a
// straight position swap — dragging an item onto an empty box moves it
// there and leaves its old box empty, dragging it onto another item swaps
// the two — so a player can freely arrange items into whichever specific
// boxes they want, gaps included.
export default function BagGrid({ player, setPlayer, onItemTap, selectedId, bulkSelectedIds }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragMovedRef = useRef(false);

  const moveItem = (fromIndex, toIndex) => {
    setPlayer((p) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= BAG_SLOTS || toIndex >= BAG_SLOTS) return p;
      const layout = reconcileBagLayout(p);
      const movedId = layout[fromIndex];
      if (!movedId) return p;
      const next = [...layout];
      next[fromIndex] = next[toIndex];
      next[toIndex] = movedId;
      return { ...p, bagLayout: next };
    });
  };

  // Safety net: if the pointer is released outside any slot, the per-slot
  // onPointerUp never fires — this clears the stuck drag state.
  useEffect(() => {
    if (dragIndex === null) return;
    const clear = () => { setDragIndex(null); setDragOverIndex(null); };
    window.addEventListener("pointerup", clear);
    return () => window.removeEventListener("pointerup", clear);
  }, [dragIndex]);

  const weightCap = bagWeightCapacity(player);
  const usedWeight = bagWeightUsed(player);
  const layout = reconcileBagLayout(player);
  const slots = layout.map((id) => (id ? player.inventory.find((it) => it.id === id) : null));

  return (
    <>
      <div style={styles.bagMetaRow}>
        <span>Çanta {player.inventory.length}/{BAG_SLOTS}</span>
        <span>Ağırlık {usedWeight}/{weightCap}</span>
      </div>
      <BarTrack pct={(usedWeight / weightCap) * 100} color={usedWeight / weightCap > 0.85 ? "#C9425A" : "#D4AF6A"} thin />

      <div style={styles.bagGrid}>
        {slots.map((item, i) => {
          const isBulkSelected = !!item && !!bulkSelectedIds && bulkSelectedIds.has(item.id);
          const isSelected = isBulkSelected || (!!item && item.id === selectedId);
          const locked = !!item && item.kind === "armor" && item.class !== player.class;
          const isDragSource = dragIndex === i;
          const isDragTarget = dragOverIndex === i && dragIndex !== null && dragIndex !== i;
          return (
            <button
              key={item ? item.id : `empty-${i}`}
              onPointerDown={() => { if (item) { setDragIndex(i); dragMovedRef.current = false; } }}
              onPointerEnter={() => {
                if (dragIndex !== null && dragIndex !== i) {
                  dragMovedRef.current = true;
                  setDragOverIndex(i);
                }
              }}
              onPointerUp={() => {
                if (dragIndex !== null) {
                  if (dragMovedRef.current && dragOverIndex !== null && dragOverIndex !== dragIndex) {
                    moveItem(dragIndex, dragOverIndex);
                  }
                  setDragIndex(null);
                  setDragOverIndex(null);
                }
              }}
              onClick={() => {
                if (dragMovedRef.current) { dragMovedRef.current = false; return; }
                if (item) onItemTap(item, i);
              }}
              style={{
                ...styles.bagSlot,
                touchAction: "none",
                ...(item ? { borderColor: `${itemTierColor(item.tier)}88`, background: `${itemTierColor(item.tier)}1c` } : styles.bagSlotEmpty),
                ...(isSelected ? styles.bagSlotSelected : {}),
                ...(isDragTarget ? styles.bagSlotDragOver : {}),
                opacity: isDragSource ? 0.35 : (locked ? 0.6 : 1),
              }}
            >
              {item && <ItemIcon item={item} size={30} color={itemTierColor(item.tier)} strokeWidth={1.5} />}
              {item && item.stackable && (item.count || 1) > 1 && (
                <span style={styles.bagSlotBadge}>{item.count}</span>
              )}
              {item && !item.stackable && item.upgradeLevel > 0 && (
                <span style={styles.bagSlotBadge}>+{item.upgradeLevel}</span>
              )}
              {locked && <Ban size={10} color="#E8A5AF" style={{ position: "absolute", top: 3, left: 3 }} />}
              {isBulkSelected && (
                <span style={{ position: "absolute", top: 3, right: 3, width: 14, height: 14, borderRadius: 7, background: "#5FA8A0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={9} color="#0B0C10" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
