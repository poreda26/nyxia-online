import ScrollArt from './icons/ScrollArt';
import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { itemTierColor } from "../data/itemRarity";
import { ACCESSORY_UPGRADE_MAX_LEVEL, accessoryUpgradeBlocked, buildUpgradedAccessory } from "../utils/accessoryUpgrade";
import { makeAccessoryScrollStack } from "../utils/inventory";
import { displayItemName } from "../utils/player";
import { useTranslation, formatReason } from "../i18n/LanguageContext";
import { styles } from "../styles";
import ItemIcon from "./ItemIcon";
import ForgePressModal from './ForgePressModal';
import BagGrid from "./BagGrid";
import SectionLabel from "./shared/SectionLabel";

const SLOT_COUNT = 3;

// Silah/Zırh forge'uyla aynı etkileşim modeli — kullanıcı isteği: "Takı
// Yükseltme sekmesi Silah/zırh sekmesi gibi olacak. Burada 3 Adet aynı
// takının koyulacağı 3 kutucuk ve Parşömenin konulacağı 1 adet kutucuk
// olacak. Aynı şekilde Deneyip görme ve Sonuç kutucuğu da olacak." Çantadaki
// bir takıya dokunmak onu ilk boş kutuya çeker (forge'daki handleBagTap gibi)
// — üçü de aynı isim+seviyeden olmak zorunda, aksi halde reddedilir. Silah/
// zırhın aksine başarısızlık ihtimali yok (bkz. utils/accessoryUpgrade.js).
export default function AccessoryUpgradeTab({ player, setPlayer, pushToast }) {
  const { t, lang } = useTranslation();
  const [slots, setSlots] = useState(() => Array(SLOT_COUNT).fill(null));
  const [scrollStaged, setScrollStaged] = useState(false);
  const [outputItem, setOutputItem] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingReveal, setPendingReveal] = useState(null); // { item, bumpedItem } | null

  // UpgradeTab'daki aynı desen: Hub sekme değişince bu bileşeni unmount
  // ediyor, kutulardaki takı/parşömeni kaybetmemek için geri çantaya ver.
  const latestRef = useRef({ slots, scrollStaged });
  latestRef.current = { slots, scrollStaged };
  useEffect(() => {
    return () => {
      const { slots: finalSlots, scrollStaged: finalScroll } = latestRef.current;
      if (finalSlots.every((s) => !s) && !finalScroll) return;
      setPlayer((p) => {
        let inv = [...p.inventory];
        finalSlots.forEach((it) => { if (it) inv.push(it); });
        if (finalScroll) {
          const existingIdx = inv.findIndex((it) => it.kind === "accessoryScroll");
          if (existingIdx >= 0) inv[existingIdx] = { ...inv[existingIdx], count: inv[existingIdx].count + 1 };
          else inv.push(makeAccessoryScrollStack(1));
        }
        return { ...p, inventory: inv };
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const returnSlot = (i) => {
    const item = slots[i];
    if (!item) return;
    setPlayer((p) => ({ ...p, inventory: [...p.inventory, item] }));
    setSlots((s) => s.map((v, idx) => (idx === i ? null : v)));
    setShowPreview(false);
  };

  const returnScroll = () => {
    if (!scrollStaged) return;
    setPlayer((p) => {
      const existing = p.inventory.find((it) => it.kind === "accessoryScroll");
      const inventory = existing
        ? p.inventory.map((it) => (it.id === existing.id ? { ...it, count: it.count + 1 } : it))
        : [...p.inventory, makeAccessoryScrollStack(1)];
      return { ...p, inventory };
    });
    setScrollStaged(false);
  };

  const handleBagTap = (item) => {
    if (item.kind === "accessory") {
      const blocked = accessoryUpgradeBlocked(item);
      if (!blocked.ok) { pushToast(formatReason(t, blocked, "upgrade.accessory.cannotUpgrade"), "warn"); return; }
      const firstFilled = slots.find(Boolean);
      if (firstFilled && (firstFilled.name !== item.name || (firstFilled.upgradeLevel || 0) !== (item.upgradeLevel || 0))) {
        pushToast(t("upgrade.accessory.mustMatch"), "warn");
        return;
      }
      const emptyIndex = slots.findIndex((s) => s === null);
      if (emptyIndex === -1) { pushToast(t("upgrade.accessory.slotsFull"), "warn"); return; }
      setPlayer((p) => ({ ...p, inventory: p.inventory.filter((it) => it.id !== item.id) }));
      setSlots((s) => s.map((v, idx) => (idx === emptyIndex ? item : v)));
      setShowPreview(false);
      return;
    }
    if (item.kind === "accessoryScroll") {
      if (scrollStaged) { pushToast(t("upgrade.accessory.scrollSlotFull"), "warn"); return; }
      setPlayer((p) => {
        const stack = p.inventory.find((it) => it.kind === "accessoryScroll");
        if (!stack || stack.count <= 0) return p;
        const inventory = stack.count - 1 <= 0
          ? p.inventory.filter((it) => it.id !== stack.id)
          : p.inventory.map((it) => (it.id === stack.id ? { ...it, count: it.count - 1 } : it));
        return { ...p, inventory };
      });
      setScrollStaged(true);
    }
  };

  const filled = slots.every(Boolean);
  const canPress = filled && scrollStaged && !pendingReveal;
  const previewStats = canPress ? buildUpgradedAccessory(slots[0]) : null;

  const press = () => {
    if (!canPress) return;
    const sample = slots[0];
    const upgraded = buildUpgradedAccessory(sample);
    setSlots(Array(SLOT_COUNT).fill(null));
    setScrollStaged(false);
    setShowPreview(false);
    setPlayer((p) => ({ ...p, inventory: [...p.inventory, upgraded] }));
    pushToast(t("upgrade.accessory.leveledUp", { name: displayItemName({ ...sample, upgradeLevel: 0 }, lang), level: (sample.upgradeLevel || 0) + 1 }), "loot");
    setPendingReveal({ item: sample, bumpedItem: upgraded });
  };

  const closeReveal = () => {
    if (pendingReveal) {
      setOutputItem(pendingReveal.bumpedItem);
      setTimeout(() => setOutputItem(null), 900);
    }
    setPendingReveal(null);
  };

  return (
    <div>
      <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 12, marginBottom: 12 }}>
        {t("upgrade.accessory.instructionsPre")} <b>{t("upgrade.accessory.instructionsMid")}</b>{" "}
        <b>{t("upgrade.accessory.instructionsBold")}</b>{t("upgrade.accessory.instructionsPost", { max: ACCESSORY_UPGRADE_MAX_LEVEL })}
      </p>

      <div className="rpg-forge" style={styles.forgeRow}>
        <div style={styles.forgeCol}>
          <div style={styles.forgeColLabel}>{t("upgrade.accessory.itemsLabel")}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {slots.map((item, i) => (
              <button
                key={i}
                style={{ ...styles.forgeSmallSlot, ...(item ? { borderColor: `${itemTierColor(item.tier)}88`, background: `${itemTierColor(item.tier)}1c` } : styles.bagSlotEmpty) }}
                onClick={() => returnSlot(i)}
              >
                {item ? (
                  <>
                    <ItemIcon item={item} size={32} color={itemTierColor(item.tier)} strokeWidth={1.4} />
                    {item.upgradeLevel > 0 && <span style={styles.bagSlotBadge}>+{item.upgradeLevel}</span>}
                  </>
                ) : (
                  <Plus size={16} color="var(--text-faint)" strokeWidth={1.6} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.forgeCol}>
          <div style={styles.forgeColLabel}>{t("upgrade.accessory.scrollBoxLabel")}</div>
          <button
            style={{ ...styles.forgeSmallSlot, ...(scrollStaged ? { borderColor: "#D4AF6A88", background: "#D4AF6A1c" } : styles.bagSlotEmpty) }}
            onClick={returnScroll}
          >
            {scrollStaged ? <ScrollArt item={{ kind: "accessoryScroll" }} size={32} /> : <Plus size={16} color="var(--text-faint)" strokeWidth={1.6} />}
          </button>
        </div>

        <div style={styles.forgeCol}>
          <div style={styles.forgeColLabel}>{t("upgrade.resultLabel")}</div>
          <div style={{ ...styles.forgeSmallSlot, ...(outputItem ? { borderColor: `${itemTierColor(outputItem.tier)}88`, background: `${itemTierColor(outputItem.tier)}1c` } : {}) }}>
            {outputItem && <ItemIcon item={outputItem} size={32} color={itemTierColor(outputItem.tier)} strokeWidth={1.4} />}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          className="rpg-action" style={{ ...styles.tinyBtn, background: canPress ? "#8B6FC9" : "var(--bg-panel-alt)", color: canPress ? "#fff" : "var(--text-faint)" }}
          disabled={!canPress}
          onClick={() => setShowPreview((v) => !v)}
        >
          {t("upgrade.tryButton")}
        </button>
        <button
          className="rpg-action" style={{ ...styles.primaryBtn, flex: 1, background: canPress ? "#5FA8A0" : "var(--bg-panel-alt)", color: canPress ? "#0B0C10" : "var(--text-faint)" }}
          disabled={!canPress}
          onClick={press}
        >
          {t("upgrade.pressButton")}
        </button>
      </div>

      {showPreview && previewStats && (
        <div className="rpg-card" style={styles.itemDetailCard}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
            {t("upgrade.successPreview", { level: (slots[0].upgradeLevel || 0) + 1 })}
          </div>
          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {[
              slots[0].atk ? `ATK ${slots[0].atk} → ${previewStats.atk}` : null,
              slots[0].def ? `DEF ${slots[0].def} → ${previewStats.def}` : null,
              slots[0].hp ? `HP ${slots[0].hp} → ${previewStats.hp}` : null,
              slots[0].mp ? `MP ${slots[0].mp} → ${previewStats.mp}` : null,
            ].filter(Boolean).join("  ·  ")}
          </div>
        </div>
      )}

      <SectionLabel>{t("upgrade.bagLabel")}</SectionLabel>
      <BagGrid player={player} setPlayer={setPlayer} onItemTap={handleBagTap} />

      {pendingReveal && (
        <ForgePressModal
          item={pendingReveal.item}
          success={true}
          bumpedItem={pendingReveal.bumpedItem}
          onClose={closeReveal}
        />
      )}
    </div>
  );
}
