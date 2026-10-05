import ScrollArt from './icons/ScrollArt';
import { useState, useRef, useEffect } from "react";
import { Plus, ScrollText, Star, X } from "lucide-react";
import { itemTierColor, tierName } from "../data/itemRarity";
import { MAX_UPGRADE_LEVEL, bumpedStats, applyLevelData } from "../utils/upgrade";
import { useTranslation } from "../i18n/LanguageContext";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import ItemIcon from "./ItemIcon";
import BagGrid from "./BagGrid";
import ScrollShop from "./ScrollShop";
import ForgePressModal from "./ForgePressModal";
import AccessoryUpgradeTab from "./AccessoryUpgradeTab";

const SCROLL_BOX_COUNT = 9;

// Single-page forge, bag-only: only items sitting in the bag (Çanta) can be
// staged here — an equipped item has to be taken off in Envanter first and
// dropped into the bag before it shows up in this grid. That keeps the
// staging model simple (every staged item always came from — and always
// returns to — player.inventory, never player.equipped).
export default function UpgradeTab({ player, setPlayer, act, pushToast }) {
  const { t, lang } = useTranslation();
  const [subtab, setSubtab] = useState("forge"); // "forge" | "accessory"
  const [outputItem, setOutputItem] = useState(null); // brief post-reveal flash in the "Sonuç" slot
  const [showPreview, setShowPreview] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [pendingReveal, setPendingReveal] = useState(null); // { item, success, bumpedItem } | null
  const [busy, setBusy] = useState(false);

  // Forge'daki eşya/parşömenler oyuncunun `forge` alanında durur (bkz. game/upgrade.js): çantadan
  // gerçekten çıkmışlardır, hepsini sunucu kuralları yönetir. Ekran yalnızca bunu gösterir.
  const forge = player.forge || {};
  const stagedItem = forge.item || null;
  const scrollBoxes = Array.from({ length: SCROLL_BOX_COUNT }, (_, i) => forge.boxes?.[i] || null);
  const bonusScrollActive = !!forge.bonus;

  // Hub başka sekmeye geçince bu bileşeni kaldırır: forge'da kalan her şeyi çantaya geri ver.
  const actRef = useRef(act);
  actRef.current = act;
  useEffect(() => () => { actRef.current("forge/clear"); }, []);

  const run = async (type, payload, failKey) => {
    const result = await act(type, payload);
    if (!result.ok) pushToast(t(failKey?.[result.reason] || (result.reason === "network" ? "battle.actionFailed" : "upgrade.actionFailed")), "warn");
    return result;
  };

  const swapStagedItem = async (newItem) => {
    setShowPreview(false);
    await run("forge/stageItem", { itemId: newItem.id }, { itemNoTrade: "upgrade.itemNoTrade" });
  };

  const returnStagedItem = async () => {
    if (!stagedItem) return;
    setShowPreview(false);
    await run("forge/returnItem");
  };

  const handleBagTap = (item) => {
    // Kullanıcı isteği: Takı artık burada basılmıyor, kendi "Takı Yükseltme"
    // sekmesi var (bkz. AccessoryUpgradeTab.jsx).
    if (item.kind === "armor" || item.kind === "weapon") {
      if (item.noTrade) { pushToast(t("upgrade.itemNoTrade"), "warn"); return; }
      swapStagedItem(item);
      return;
    }
    if (item.kind === "scroll") {
      if (scrollBoxes.every((b) => b !== null)) { pushToast(t("upgrade.scrollBoxesFull"), "warn"); return; }
      run("forge/stageScroll", { tier: item.tier }, { boxesFull: "upgrade.scrollBoxesFull" });
      return;
    }
    if (item.kind === "bonusScroll") {
      if (bonusScrollActive) { pushToast(t("upgrade.bonusScrollFull"), "warn"); return; }
      run("forge/stageBonus", { itemId: item.id }, { bonusFull: "upgrade.bonusScrollFull" });
      return;
    }
    if (item.kind === "potion") {
      pushToast(t("upgrade.usePotionsInInventory"), "default");
    }
  };

  const returnBonusScroll = () => {
    if (!bonusScrollActive) return;
    run("forge/returnBonus");
  };

  const returnScroll = (boxIndex) => {
    if (!scrollBoxes[boxIndex]) return;
    run("forge/returnScroll", { box: boxIndex });
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

  const press = async () => {
    if (!stagedItem || pendingReveal || busy) return;
    if (maxed) { pushToast(t("upgrade.alreadyMaxLevel"), "warn"); return; }
    if (matchingCount === 0) { pushToast(t("upgrade.noScrollForTier", { tier: tierName(lang, stagedItem.tier) }), "warn"); return; }
    if (matchingCount >= 2) { pushToast(t("upgrade.onlyOneScrollAllowed"), "warn"); return; }

    // Zar ve parşömen tüketimi sunucuda; sonuç (başarı + yeni eşya) hemen çantaya yazılmış gelir,
    // açılış penceresi yalnızca üstteki sunum katmanıdır (animasyon sırasında sekme değişse de eşya kaybolmaz).
    setBusy(true);
    setShowPreview(false);
    const result = await act("forge/press");
    setBusy(false);
    if (!result.ok) { pushToast(t(result.reason === "network" ? "battle.actionFailed" : "upgrade.actionFailed"), "warn"); return; }
    if (result.success) {
      (result.unlocked || []).forEach((id) => pushToast(t("upgrade.achievementUnlocked", { name: t(`character.achievements.${id}.name`), title: t(`character.achievements.${id}.title`) }), "level"));
      setPendingReveal({ item: result.item, success: true, bumpedItem: result.bumpedItem });
    } else {
      setPendingReveal({ item: result.item, success: false, bumpedItem: null });
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


      <div className="rpg-tabs" style={styles.subtabRow}>
        <button onClick={() => setSubtab("forge")} style={{ ...styles.subtabBtn, ...(subtab === "forge" ? styles.subtabBtnActive : {}) }}>
          {t("upgrade.subtabWeaponArmor")}
        </button>
        <button onClick={() => setSubtab("accessory")} style={{ ...styles.subtabBtn, ...(subtab === "accessory" ? styles.subtabBtnActive : {}) }}>
          {t("upgrade.subtabAccessory")}
        </button>
      </div>

      {subtab === "accessory" ? (
        <AccessoryUpgradeTab player={player} setPlayer={setPlayer} act={act} pushToast={pushToast} />
      ) : (
        <>
      <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 12, marginBottom: 12 }}>
        {t("upgrade.instructionsPre")} <b>1</b> {t("upgrade.instructionsMid")} <b>{t("upgrade.instructionsBold")}</b>
        {t("upgrade.instructionsPost", { max: MAX_UPGRADE_LEVEL })}
      </p>

      {/* Sıra: Eşya (basacağımız eşya) → 9 kutuluk parşömen ızgarası → Sonuç,
          soldan sağa okunacak şekilde. Izgara flex:1 ile satırın kalan tüm
          genişliğini dolduruyor (bkz. forgeScrollGrid, artık sabit 142px
          değil) — bu sayede sağda boş alan kalmıyor ve dar telefon
          ekranlarında da kutular otomatik küçülüyor. Bonus, Eşya'nın altına
          (ikisi de forge'a "girdi" olarak konan şeyler); Mağaza da Sonuç'un
          altına (yardımcı eylemler) yerleştirildi — satır artık dört ayrı
          sütun yerine üç dengeli sütun. */}
      <div className="rpg-forge" style={styles.forgeRow}>
        <div style={styles.forgeCol}>
          <div>
            <div style={styles.forgeColLabel}>{t("upgrade.itemLabel")}</div>
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
            <div style={styles.forgeColLabel}>{t("upgrade.bonusLabel")}</div>
            <button
              style={{ ...styles.forgeSmallSlot, ...(bonusScrollActive ? { borderColor: "#D4AF6A88", background: "#D4AF6A1c" } : styles.bagSlotEmpty) }}
              onClick={returnBonusScroll}
              title={t("upgrade.bonusTitle")}
            >
              {bonusScrollActive ? <ScrollArt item={{kind:"bonusScroll"}} size={32}/> : <Plus size={14} color="var(--text-faint)" strokeWidth={1.6} />}
            </button>
          </div>
        </div>

        <div style={{ ...styles.forgeCol, flex: 1, minWidth: 0 }}>
          <div style={styles.forgeColLabel}>{t("upgrade.scrollsLabel")}</div>
          <div style={styles.forgeScrollGrid}>
            {scrollBoxes.map((box, i) => {
              const isMatch = !!stagedItem && !!box && box.tier === stagedItem.tier;
              return (
                <button
                  key={i} data-tut="scroll-box" data-filled={box ? "1" : "0"}
                  style={{
                    ...styles.forgeScrollSlot,
                    ...(box ? { borderColor: `${itemTierColor(box.tier)}88`, background: `${itemTierColor(box.tier)}1c` } : styles.bagSlotEmpty),
                    ...(isMatch ? styles.bagSlotSelected : {}),
                  }}
                  onClick={() => returnScroll(i)}
                >
                  {box && <ScrollArt item={box} size={32}/>}
                  {box && <span style={{ fontSize: 7, color: itemTierColor(box.tier), marginTop: 1 }}>{tierName(lang, box.tier)}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div style={styles.forgeCol}>
          <div>
            <div style={styles.forgeColLabel}>{t("upgrade.resultLabel")}</div>
            <div style={{ ...styles.forgeSmallSlot, ...(outputItem ? { borderColor: `${itemTierColor(outputItem.tier)}88`, background: `${itemTierColor(outputItem.tier)}1c` } : {}) }}>
              {outputItem && <ItemIcon item={outputItem} size={36} color={itemTierColor(outputItem.tier)} strokeWidth={1.4} />}
            </div>
          </div>

          <div>
            <div style={styles.forgeColLabel}>{t("upgrade.shopLabel")}</div>
            <button data-tut="forge-shop" style={styles.forgeSmallSlot} onClick={() => setShopOpen((v) => !v)}>
              <ScrollArt item={{kind:"scroll",tier:1}} size={32}/>
            </button>
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
          className="rpg-action" data-tut="forge-press" style={{ ...styles.primaryBtn, flex: 1, background: canPress ? "#5FA8A0" : "var(--bg-panel-alt)", color: canPress ? "#0B0C10" : "var(--text-faint)" }}
          disabled={!canPress}
          onClick={press}
        >
          {t("upgrade.pressButton")}
        </button>
      </div>

      {showPreview && previewStats && stagedItem && (
        <div className="rpg-card" style={styles.itemDetailCard}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
            {t("upgrade.successPreview", { level: (stagedItem.upgradeLevel || 0) + 1 })}
            {bonusScrollActive && <span style={{ color: "var(--gold-text)" }}> {t("upgrade.bonusScrollActiveTag")}</span>}
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
          <ScrollShop player={player} act={act} pushToast={pushToast} />
        </div>
      )}

      <SectionLabel>{t("upgrade.bagLabel")}</SectionLabel>
      <BagGrid player={player} setPlayer={setPlayer} onItemTap={handleBagTap} selectedId={stagedItem?.id} />

      {pendingReveal && (
        <ForgePressModal
          item={pendingReveal.item}
          success={pendingReveal.success}
          bumpedItem={pendingReveal.bumpedItem}
          onClose={closeReveal}
        />
      )}
        </>
      )}
    </div>
  );
}
