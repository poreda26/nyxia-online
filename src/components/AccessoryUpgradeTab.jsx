import ScrollArt from './icons/ScrollArt';
import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { itemTierColor } from "../data/itemRarity";
import { ACCESSORY_UPGRADE_MAX_LEVEL, accessoryUpgradeBlocked, buildUpgradedAccessory } from "../utils/accessoryUpgrade";
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
export default function AccessoryUpgradeTab({ player, setPlayer, act, pushToast }) {
  const { t, lang } = useTranslation();
  const [outputItem, setOutputItem] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingReveal, setPendingReveal] = useState(null); // { item, bumpedItem } | null
  const [busy, setBusy] = useState(false);

  // Kutulardaki takı/parşömen oyuncunun `accForge` alanında durur (bkz. game/upgrade.js).
  const forge = player.accForge || {};
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => forge.slots?.[i] || null);
  const scrollStaged = !!forge.scroll;

  // UpgradeTab'daki aynı desen: sekme değişince kutularda kalanı çantaya geri ver.
  const actRef = useRef(act);
  actRef.current = act;
  useEffect(() => () => { actRef.current("accessory/clear"); }, []);

  const run = async (type, payload, failKey) => {
    const result = await act(type, payload);
    if (!result.ok) {
      if (result.reason === "network") pushToast(t("battle.actionFailed"), "warn");
      else if (failKey?.[result.reason]) pushToast(t(failKey[result.reason]), "warn");
      else pushToast(formatReason(t, result, "upgrade.accessory.cannotUpgrade"), "warn");
    }
    return result;
  };

  const returnSlot = (i) => {
    if (!slots[i]) return;
    setShowPreview(false);
    run("accessory/returnItem", { slot: i });
  };

  const returnScroll = () => {
    if (!scrollStaged) return;
    run("accessory/returnScroll");
  };

  const handleBagTap = (item) => {
    if (item.kind === "accessory") {
      const blocked = accessoryUpgradeBlocked(item);
      if (!blocked.ok) { pushToast(formatReason(t, blocked, "upgrade.accessory.cannotUpgrade"), "warn"); return; }
      setShowPreview(false);
      run("accessory/stageItem", { itemId: item.id }, { mustMatch: "upgrade.accessory.mustMatch", slotsFull: "upgrade.accessory.slotsFull" });
      return;
    }
    if (item.kind === "accessoryScroll") {
      if (scrollStaged) { pushToast(t("upgrade.accessory.scrollSlotFull"), "warn"); return; }
      run("accessory/stageScroll", {}, { scrollSlotFull: "upgrade.accessory.scrollSlotFull" });
    }
  };

  const filled = slots.every(Boolean);
  const canPress = filled && scrollStaged && !pendingReveal;
  const previewStats = canPress ? buildUpgradedAccessory(slots[0]) : null;

  const press = async () => {
    if (!canPress || busy) return;
    setBusy(true);
    setShowPreview(false);
    const result = await act("accessory/press");
    setBusy(false);
    if (!result.ok) { pushToast(t(result.reason === "network" ? "battle.actionFailed" : "upgrade.actionFailed"), "warn"); return; }
    const sample = result.item;
    pushToast(t("upgrade.accessory.leveledUp", { name: displayItemName({ ...sample, upgradeLevel: 0 }, lang), level: (sample.upgradeLevel || 0) + 1 }), "loot");
    setPendingReveal({ item: sample, bumpedItem: result.bumpedItem });
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
