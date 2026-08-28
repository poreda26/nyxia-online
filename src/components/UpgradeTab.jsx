import { useState, useRef, useEffect } from "react";
import { Plus, ScrollText, Star, X } from "lucide-react";
import { itemTierColor } from "../data/itemRarity";
import { MAX_UPGRADE_LEVEL, upgradeSuccessChance, bumpedStats, applyLevelData } from "../utils/upgrade";
import { makeScrollStack, makeBonusScrollStack } from "../utils/inventory";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import ItemIcon from "./ItemIcon";
import BagGrid from "./BagGrid";
import ScrollShop from "./ScrollShop";
import ForgePressModal from "./ForgePressModal";

const SCROLL_BOX_COUNT = 9;

// Single-page forge, bag-only: only items sitting in the bag (Çanta) can be
// staged here — an equipped item has to be taken off in Envanter first and
// dropped into the bag before it shows up in this grid. That keeps the
// staging model simple (every staged item always came from — and always
// returns to — player.inventory, never player.equipped).
export default function UpgradeTab({ player, setPlayer, pushToast }) {
  const [stagedItem, setStagedItem] = useState(null); // item | null
  const [scrollBoxes, setScrollBoxes] = useState(() => Array(SCROLL_BOX_COUNT).fill(null)); // { tier } | null
  const [bonusScrollActive, setBonusScrollActive] = useState(false);
  const [outputItem, setOutputItem] = useState(null); // brief post-reveal flash in the "Sonuç" slot
  const [showPreview, setShowPreview] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [pendingReveal, setPendingReveal] = useState(null); // { item, success, bumpedItem } | null

  // Hub unmounts this tab when the player switches to another bottom-nav
  // tab, which would silently wipe stagedItem/scrollBoxes — and with them,
  // the item and scrolls that were pulled out of the bag to sit in the
  // forge. Keep a ref in sync every render so the unmount cleanup can hand
  // everything still staged back to the bag instead of losing it.
  const latestForgeRef = useRef({ stagedItem, scrollBoxes, bonusScrollActive });
  latestForgeRef.current = { stagedItem, scrollBoxes, bonusScrollActive };

  useEffect(() => {
    return () => {
      const { stagedItem: finalStaged, scrollBoxes: finalBoxes, bonusScrollActive: finalBonus } = latestForgeRef.current;
      if (!finalStaged && finalBoxes.every((b) => !b) && !finalBonus) return;
      setPlayer((p) => {
        let inv = [...p.inventory];
        if (finalStaged) inv.push(finalStaged);
        finalBoxes.forEach((box) => {
          if (!box) return;
          const existingIdx = inv.findIndex((it) => it.kind === "scroll" && it.tier === box.tier);
          if (existingIdx >= 0) inv[existingIdx] = { ...inv[existingIdx], count: inv[existingIdx].count + 1 };
          else inv.push(makeScrollStack(box.tier, 1));
        });
        if (finalBonus) inv.push(makeBonusScrollStack());
        return { ...p, inventory: inv };
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const swapStagedItem = (newItem) => {
    setPlayer((p) => {
      let inv = p.inventory.filter((i) => i.id !== newItem.id);
      if (stagedItem) inv = [...inv, stagedItem];
      return { ...p, inventory: inv };
    });
    setStagedItem(newItem);
    setShowPreview(false);
  };

  const returnStagedItem = () => {
    if (!stagedItem) return;
    setPlayer((p) => ({ ...p, inventory: [...p.inventory, stagedItem] }));
    setStagedItem(null);
    setShowPreview(false);
  };

  const handleBagTap = (item) => {
    if (item.kind === "armor" || item.kind === "weapon" || item.kind === "accessory") {
      swapStagedItem(item);
      return;
    }
    if (item.kind === "scroll") {
      const emptyIndex = scrollBoxes.findIndex((b) => b === null);
      if (emptyIndex === -1) { pushToast("Parşömen kutuları dolu (9/9).", "warn"); return; }
      setPlayer((p) => {
        const stack = p.inventory.find((it) => it.kind === "scroll" && it.tier === item.tier);
        if (!stack || stack.count <= 0) return p;
        const inventory = stack.count - 1 <= 0
          ? p.inventory.filter((it) => it.id !== stack.id)
          : p.inventory.map((it) => (it.id === stack.id ? { ...it, count: it.count - 1 } : it));
        return { ...p, inventory };
      });
      setScrollBoxes((boxes) => boxes.map((b, idx) => (idx === emptyIndex ? { tier: item.tier } : b)));
      return;
    }
    if (item.kind === "bonusScroll") {
      if (bonusScrollActive) { pushToast("Bonus parşömen kutusu dolu.", "warn"); return; }
      setPlayer((p) => ({ ...p, inventory: p.inventory.filter((it) => it.id !== item.id) }));
      setBonusScrollActive(true);
      return;
    }
    if (item.kind === "potion") {
      pushToast("Potları Envanter sekmesinden kullanabilirsin.", "default");
    }
  };

  const returnBonusScroll = () => {
    if (!bonusScrollActive) return;
    setPlayer((p) => ({ ...p, inventory: [...p.inventory, makeBonusScrollStack()] }));
    setBonusScrollActive(false);
  };

  const returnScroll = (boxIndex) => {
    const box = scrollBoxes[boxIndex];
    if (!box) return;
    setPlayer((p) => {
      const existing = p.inventory.find((it) => it.kind === "scroll" && it.tier === box.tier);
      const inventory = existing
        ? p.inventory.map((it) => (it.id === existing.id ? { ...it, count: it.count + 1 } : it))
        : [...p.inventory, makeScrollStack(box.tier, 1)];
      return { ...p, inventory };
    });
    setScrollBoxes((boxes) => boxes.map((b, idx) => (idx === boxIndex ? null : b)));
  };

  const maxed = stagedItem ? (stagedItem.upgradeLevel || 0) >= MAX_UPGRADE_LEVEL : false;
  const matchingIndexes = stagedItem
    ? scrollBoxes.map((b, i) => (b && b.tier === stagedItem.tier ? i : -1)).filter((i) => i >= 0)
    : [];
  const matchingCount = matchingIndexes.length;
  const canPress = !!stagedItem && !maxed && matchingCount === 1 && !pendingReveal;
  // Gerçek KO ekran görüntüsünden birebir `levels` dizisi taşıyan eşyalar
  // (bkz. data/warriorWeapons.js, rogueWeapons.js) bir sonraki seviyenin
  // GERÇEK satırını göstermeli — bumpedStats'ın ×1.18 tahmini sadece
  // levels'sız (procedural) eşyalar için.
  const previewStats = canPress
    ? (stagedItem.levels ? applyLevelData(stagedItem, (stagedItem.upgradeLevel || 0) + 1) : bumpedStats(stagedItem))
    : null;

  const press = () => {
    if (!stagedItem || pendingReveal) return;
    if (maxed) { pushToast("Bu eşya zaten maksimum seviyede.", "warn"); return; }
    if (matchingCount === 0) { pushToast(`T${stagedItem.tier} parşömenin yok.`, "warn"); return; }
    if (matchingCount >= 2) { pushToast("Failed — aynı tier'dan sadece 1 parşömen olmalı.", "warn"); return; }

    const consumedBox = matchingIndexes[0];
    const entry = stagedItem;
    const currentLevel = entry.upgradeLevel || 0;
    const success = Math.random() < upgradeSuccessChance(currentLevel, bonusScrollActive);

    setScrollBoxes((boxes) => boxes.map((b, idx) => (idx === consumedBox ? null : b)));
    setBonusScrollActive(false); // spent on this press whether it lands or not, same as the tier scroll
    setShowPreview(false);
    setStagedItem(null);

    if (success) {
      // Aynı ayrım burada da geçerli — gerçek `levels` verisi olan bir eşya
      // forge'da bumpedStats'ın tahminine değil, kendi gerçek bir sonraki
      // satırına yükselmeli (bkz. utils/loot.js#applyUpgradeLevel'daki aynı
      // dallanma, GM panelinin zaten doğru yaptığı şey).
      const bumped = entry.levels
        ? applyLevelData(entry, currentLevel + 1)
        : { ...entry, upgradeLevel: currentLevel + 1, ...bumpedStats(entry) };
      // Commit right away — the reveal modal is a presentational layer on
      // top of state that has already safely landed, so a tab switch or
      // navigation mid-animation can never lose the upgraded item.
      setPlayer((p) => ({ ...p, inventory: [...p.inventory, bumped] }));
      setPendingReveal({ item: entry, success: true, bumpedItem: bumped });
    } else {
      setPendingReveal({ item: entry, success: false, bumpedItem: null });
    }
  };

  const closeReveal = () => {
    if (pendingReveal?.success) {
      setOutputItem(pendingReveal.bumpedItem);
      setTimeout(() => setOutputItem(null), 900);
    }
    setPendingReveal(null);
  };

  return (
    <div style={styles.panelScroll}>
      <SectionLabel>Yükselt</SectionLabel>
      <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: -4, marginBottom: 12 }}>
        Aşağıdaki çantandan eşyana ve aynı tier'dan tam <b>1</b> parşömene dokunarak kutulara
        yerleştir, sonra bas. Basmak ücretsizdir ama <b>başarısız olursa eşya ve parşömen kaybolur</b>.
        Kuşanılı bir eşyayı yükseltmek için önce Envanter'den çıkar, çantana düşsün. Maksimum seviye +{MAX_UPGRADE_LEVEL}.
      </p>

      <div style={styles.forgeRow}>
        <div>
          <div style={styles.forgeColLabel}>Eşya</div>
          <button
            style={{ ...styles.forgeItemSlot, ...(stagedItem ? { borderColor: `${itemTierColor(stagedItem.tier)}88`, background: `${itemTierColor(stagedItem.tier)}1c` } : styles.bagSlotEmpty) }}
            onClick={returnStagedItem}
          >
            {stagedItem ? (
              <>
                <ItemIcon item={stagedItem} size={42} color={itemTierColor(stagedItem.tier)} strokeWidth={1.4} />
                {stagedItem.upgradeLevel > 0 && <span style={styles.bagSlotBadge}>+{stagedItem.upgradeLevel}</span>}
              </>
            ) : (
              <Plus size={18} color="var(--text-faint)" strokeWidth={1.6} />
            )}
          </button>
        </div>

        <div>
          <div style={styles.forgeColLabel}>Parşömenler</div>
          <div style={styles.forgeScrollGrid}>
            {scrollBoxes.map((box, i) => {
              const isMatch = !!stagedItem && !!box && box.tier === stagedItem.tier;
              return (
                <button
                  key={i}
                  style={{
                    ...styles.forgeScrollSlot,
                    ...(box ? { borderColor: `${itemTierColor(box.tier)}88`, background: `${itemTierColor(box.tier)}1c` } : styles.bagSlotEmpty),
                    ...(isMatch ? styles.bagSlotSelected : {}),
                  }}
                  onClick={() => returnScroll(i)}
                >
                  {box && <ScrollText size={15} color={itemTierColor(box.tier)} strokeWidth={1.6} />}
                  {box && <span style={{ fontSize: 7, color: itemTierColor(box.tier), marginTop: 1 }}>T{box.tier}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={styles.forgeColLabel}>Bonus</div>
          <button
            style={{ ...styles.forgeSmallSlot, ...(bonusScrollActive ? { borderColor: "#D4AF6A88", background: "#D4AF6A1c" } : styles.bagSlotEmpty) }}
            onClick={returnBonusScroll}
            title="Yükseltme şansını artırır"
          >
            {bonusScrollActive ? <Star size={16} color="#D4AF6A" strokeWidth={1.6} /> : <Plus size={14} color="var(--text-faint)" strokeWidth={1.6} />}
          </button>
        </div>

        <div>
          <div style={styles.forgeColLabel}>Sonuç</div>
          <div style={{ ...styles.forgeSmallSlot, ...(outputItem ? { borderColor: `${itemTierColor(outputItem.tier)}88`, background: `${itemTierColor(outputItem.tier)}1c` } : {}) }}>
            {outputItem && <ItemIcon item={outputItem} size={36} color={itemTierColor(outputItem.tier)} strokeWidth={1.4} />}
          </div>
        </div>

        <div>
          <div style={styles.forgeColLabel}>Mağaza</div>
          <button style={styles.forgeSmallSlot} onClick={() => setShopOpen((v) => !v)}>
            <ScrollText size={18} color="#D4AF6A" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          style={{ ...styles.tinyBtn, background: canPress ? "#8B6FC9" : "var(--bg-panel-alt)", color: canPress ? "#fff" : "var(--text-faint)" }}
          disabled={!canPress}
          onClick={() => setShowPreview((v) => !v)}
        >
          Dene
        </button>
        <button
          style={{ ...styles.primaryBtn, flex: 1, background: canPress ? "#5FA8A0" : "var(--bg-panel-alt)", color: canPress ? "#0B0C10" : "var(--text-faint)" }}
          disabled={!canPress}
          onClick={press}
        >
          Bas
        </button>
      </div>

      {showPreview && previewStats && stagedItem && (
        <div style={styles.itemDetailCard}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
            Başarılı olursa +{(stagedItem.upgradeLevel || 0) + 1}:
            {bonusScrollActive && <span style={{ color: "#D4AF6A" }}> (Bonus Parşömen aktif)</span>}
          </div>
          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {[
              stagedItem.atk ? `ATK ${stagedItem.atk} → ${previewStats.atk}` : null,
              stagedItem.def ? `DEF ${stagedItem.def} → ${previewStats.def}` : null,
              stagedItem.hp ? `HP ${stagedItem.hp} → ${previewStats.hp}` : null,
              stagedItem.mp ? `MP ${stagedItem.mp} → ${previewStats.mp}` : null,
            ].filter(Boolean).join("  ·  ")}
          </div>
        </div>
      )}

      {shopOpen && (
        <div style={{ ...styles.pickerCard, maxHeight: "none", overflowY: "visible" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setShopOpen(false)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer" }}>
              <X size={14} />
            </button>
          </div>
          <ScrollShop player={player} setPlayer={setPlayer} pushToast={pushToast} />
        </div>
      )}

      <SectionLabel>Çanta</SectionLabel>
      <BagGrid player={player} setPlayer={setPlayer} onItemTap={handleBagTap} selectedId={stagedItem?.id} />

      {pendingReveal && (
        <ForgePressModal
          item={pendingReveal.item}
          success={pendingReveal.success}
          bumpedItem={pendingReveal.bumpedItem}
          onClose={closeReveal}
        />
      )}
    </div>
  );
}
