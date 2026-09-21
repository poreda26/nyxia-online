import RewardChest from './icons/RewardChest';
import { useState } from "react";
import { Package, Gift, Sparkles, Ban, Wrench, Archive, ArrowUpFromLine, ArrowDownToLine, X, ListChecks, Coins, Gem, Plus } from "lucide-react";
import { itemTierColor, tierName } from "../data/itemRarity";
import { RACES } from "../data/races";
import { CLASSES } from "../data/classes";
import { rollLoot, rollSpecialChestLoot } from "../utils/loot";
import {
  equipItem, sellPrice, displayItemName, clampPlayerHp, discountedRepairCost, repairItem, canChangeJob, changeJob,
  totalEquippedRepairCost, repairAllEquipped, MAX_GOLD, formatGold,
} from "../utils/player";
import { isConsumable } from "../utils/itemDisplay";
import { newlyUnlocked } from "../utils/achievements";
import { BAG_SLOTS, addItemToInventory, depositToBank, withdrawFromBank, buyExtraBankPage, EXTRA_BANK_PAGE_COST_DIAMONDS, MAX_BANK_PAGES } from "../utils/inventory";
import { usePotion } from "../utils/potions";
import { useBoostScroll } from "../utils/boosts";
import { boostScrollDef } from "../data/boostScrolls";
import { learnFreeSkills } from "../utils/skills";
import { premiumSellMultiplier, premiumRepairDiscount } from "../utils/premium";
import { useTranslation, formatReason } from "../i18n/LanguageContext";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import EmptyState from "./shared/EmptyState";
import ItemTooltip from "./ItemTooltip";
import ChestModal from "./ChestModal";
import BulkChestModal from "./BulkChestModal";
import Paperdoll from "./Paperdoll";
import BagGrid from "./BagGrid";
import BankGrid from "./BankGrid";

export default function InventoryTab({ player, setPlayer, bank, setBank, bankGold, setBankGold, pushToast, onChangeRace }) {
  const { t, lang } = useTranslation();
  const [openingChest, setOpeningChest] = useState(null); // {chest, phase, result}
  const [bulkChestResult, setBulkChestResult] = useState(null); // {items, failed} | null
  const [subtab, setSubtab] = useState("armor");
  // Depodaki paylaşılan altın — kullanıcı isteği: "Altın depoya atılabilsin.
  // Yan karakterden altın alınabilir bu şekilde." Depo (bank) zaten hesap
  // genelinde paylaşılıyordu (eşyalar için), bu aynı deponun içine bir
  // altın yığını ekliyor — herhangi bir karakter yatırabilir, herhangi bir
  // karakter çekebilir.
  const [goldAmount, setGoldAmount] = useState("");
  // Kullanıcı isteği: "Depo'da en fazla 2.000.000.000 gold bulunabilir...
  // bu paranın üstüne çıkmaya çalışıldığında sistem buna izin vermesin.
  // Hata versin." — App.jsx'teki güvenlik ağı tavanı her koşulda kırpar,
  // ama burası doğrudan kullanıcı eylemi olduğu için ÖNCEDEN net bir
  // hatayla engelliyor, sessizce kırpılıp yatırdığı miktarın bir kısmını
  // kaybetmiş gibi hissetmesin.
  const depositGold = () => {
    const amount = parseInt(goldAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) { pushToast(t("inventory.enterValidAmount"), "warn"); return; }
    if (player.gold < amount) { pushToast(t("inventory.notEnoughGold"), "warn"); return; }
    if (bankGold + amount > MAX_GOLD) { pushToast(t("inventory.bankGoldCapExceeded", { max: formatGold(MAX_GOLD) }), "warn"); return; }
    setPlayer((p) => ({ ...p, gold: p.gold - amount }));
    setBankGold((g) => g + amount);
    pushToast(t("inventory.goldDeposited", { amount: formatGold(amount) }), "default");
    setGoldAmount("");
  };
  const withdrawGold = () => {
    const amount = parseInt(goldAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) { pushToast(t("inventory.enterValidAmount"), "warn"); return; }
    if (bankGold < amount) { pushToast(t("inventory.notEnoughBankGold"), "warn"); return; }
    if (player.gold + amount > MAX_GOLD) { pushToast(t("inventory.carryGoldCapExceeded", { max: formatGold(MAX_GOLD) }), "warn"); return; }
    setBankGold((g) => g - amount);
    setPlayer((p) => ({ ...p, gold: p.gold + amount }));
    pushToast(t("inventory.goldWithdrawn", { amount: formatGold(amount) }), "default");
    setGoldAmount("");
  };

  const handleBuyBankPage = () => {
    const result = buyExtraBankPage(player, bank);
    if (!result.bought) {
      pushToast(result.reason === "maxBankPages" ? t("inventory.maxBankPagesReached") : t("shop.notEnoughDiamonds"), "warn");
      return;
    }
    setPlayer(result.player);
    setBank(result.bank);
    pushToast(t("inventory.bankPageBought"), "loot");
  };

  const [selectedId, setSelectedId] = useState(null);
  const [bankPage, setBankPage] = useState(0);
  // Kuşanılmış bir slota dokununca artık direkt çıkarmıyor — kullanıcı
  // isteği: önce eşyanın özelliklerini göster, çıkarmak istersek oradan
  // ayrı bir düğmeyle çıkaralım. Bag/bank seçimiyle aynı anda açık kalmasın
  // diye ikisi birbirini kapatıyor (aşağıdaki handleBagTap/bank onItemTap'te).
  const [selectedEquipSlot, setSelectedEquipSlot] = useState(null);
  // Toplu seçim — sadece çantayı depoya taşımak ya da toplu satmak için
  // (kullanıcı isteği), bank sekmesine sızmıyor. Açılınca tekli seçim
  // (selectedId, dolayısıyla alttaki detay sayfası) devre dışı kalır.
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState(new Set());

  const toggleBulkMode = () => {
    setBulkMode((v) => !v);
    setBulkSelected(new Set());
    setSelectedId(null);
  };

  const toggleBulkItem = (item) => {
    setBulkSelected((s) => {
      const next = new Set(s);
      if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
      return next;
    });
  };

  const handleBagTap = (item) => {
    if (bulkMode) { toggleBulkItem(item); return; }
    setSelectedEquipSlot(null);
    setSelectedId((cur) => (cur === item.id ? null : item.id));
  };

  const bulkItems = player.inventory.filter((i) => bulkSelected.has(i.id));

  const bulkDeposit = () => {
    if (bulkItems.length === 0) return;
    let p = player, b = bank, moved = 0;
    for (const item of bulkItems) {
      const result = depositToBank(p, item, b, bankPage);
      if (result.moved) { p = result.player; b = result.bank; moved++; }
    }
    setPlayer(p);
    setBank(b);
    pushToast(moved > 0 ? t("inventory.bulkDepositMoved", { count: moved }) : t("inventory.bulkDepositFull"), moved > 0 ? "default" : "warn");
    setBulkSelected(new Set());
    setBulkMode(false);
  };

  const bulkSell = () => {
    // Pot/parşömen gibi tüketilebilirlerin satış değeri zaten 0 (bkz.
    // sellPrice) — yanlışlıkla değerli bir parşömeni "0 altına" satıp
    // kaybetmesin diye toplu satıştan bilerek dışlanıyorlar, tıpkı tekli
    // "Sat" düğmesinin zaten yaptığı gibi.
    const sellable = bulkItems.filter((i) => !isConsumable(i) && !i.noTrade);
    if (sellable.length === 0) { pushToast(t("inventory.bulkNoneSellable"), "warn"); return; }
    const total = sellable.reduce((sum, i) => sum + Math.round(sellPrice(i) * premiumSellMultiplier(player)), 0);
    const soldIds = new Set(sellable.map((i) => i.id));
    setPlayer((p) => ({ ...p, gold: p.gold + total, inventory: p.inventory.filter((i) => !soldIds.has(i.id)) }));
    pushToast(t("inventory.bulkSold", { count: sellable.length, gold: formatGold(total) }), "loot");
    setBulkSelected(new Set());
    setBulkMode(false);
  };

  const formatBlocked = (blocked) => {
    switch (blocked.type) {
      case "rogueBowOnly": return t("inventory.equipBlockedRogueBow");
      case "wrongClass": return t(`inventory.equipBlockedClass.${blocked.itemKind}`, { cls: blocked.cls });
      case "needsAwakening": return t("inventory.equipBlockedAwakening");
      case "unmetStats": {
        const need = blocked.need.map((r) => t("inventory.equipReqStat", r)).join(t("inventory.equipReqJoin"));
        return t("inventory.equipBlockedStats", { need });
      }
      default: return t("inventory.equipBlockedGeneric");
    }
  };

  const equip = (item) => {
    const result = equipItem(player, item);
    if (result.blocked) { pushToast(formatBlocked(result.blocked), "warn"); return; }
    setPlayer(result.player);
    pushToast(t("inventory.equipped", { item: displayItemName(item, lang) }), "default");
    setSelectedId(null);
  };

  const unequip = (slotKey) => {
    setPlayer((p) => {
      const item = p.equipped[slotKey];
      if (!item) return p;
      const next = { ...p, equipped: { ...p.equipped, [slotKey]: null }, inventory: [...p.inventory, item] };
      return clampPlayerHp(next);
    });
    setSelectedEquipSlot(null);
  };

  const sellItem = (item) => {
    const price = Math.round(sellPrice(item) * premiumSellMultiplier(player));
    setPlayer((p) => ({ ...p, gold: p.gold + price, inventory: p.inventory.filter((i) => i.id !== item.id) }));
    pushToast(t("inventory.sold", { gold: formatGold(price) }), "loot");
    setSelectedId(null);
  };

  const repair = (item) => {
    const result = repairItem(player, item, premiumRepairDiscount(player), bank);
    if (!result.repaired) { pushToast(formatReason(t, result, "inventory.repairFailed"), "warn"); return; }
    setPlayer(result.player);
    if (result.bank) setBank(result.bank);
    pushToast(t("inventory.repaired", { gold: formatGold(result.cost) }), "default");
  };

  const depositItem = (item) => {
    const result = depositToBank(player, item, bank, bankPage);
    if (!result.moved) { pushToast(formatReason(t, result, "inventory.depositFailed"), "warn"); return; }
    setPlayer(result.player);
    setBank(result.bank);
    pushToast(t("inventory.itemDeposited", { item: displayItemName(item, lang) }), "default");
    setSelectedId(null);
  };

  const withdrawItem = (item) => {
    const result = withdrawFromBank(player, item, bank, bankPage);
    if (!result.moved) { pushToast(formatReason(t, result, "inventory.withdrawFailed"), "warn"); return; }
    setPlayer(result.player);
    setBank(result.bank);
    pushToast(t("inventory.itemWithdrawn", { item: displayItemName(item, lang) }), "default");
    setSelectedId(null);
  };

  const useRaceScroll = (item, newRace) => {
    if (!onChangeRace) return;
    if (player.clan) { pushToast(t("inventory.clanBlocksRaceChange"), "warn"); return; }
    const inventory = (item.count || 1) <= 1
      ? player.inventory.filter((i) => i.id !== item.id)
      : player.inventory.map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i));
    setPlayer((p) => ({ ...p, inventory }));
    onChangeRace(newRace);
    pushToast(t("inventory.raceChanged", { race: t(`races.${newRace}.name`) }), "default");
    setSelectedId(null);
  };

  const useJobScroll = (item, newClass) => {
    const check = canChangeJob(player);
    if (!check.ok) { pushToast(formatReason(t, check), "warn"); return; }
    const inventory = (item.count || 1) <= 1
      ? player.inventory.filter((i) => i.id !== item.id)
      : player.inventory.map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i));
    setPlayer((p) => learnFreeSkills(changeJob({ ...p, inventory }, newClass)));
    pushToast(t("inventory.classChanged", { cls: CLASSES[newClass].name }), "default");
    setSelectedId(null);
  };

  const handleUsePotion = (item) => {
    const result = usePotion(player, item.potionType, item.tier);
    if (result.reason) { pushToast(formatReason(t, result), "warn"); return; }
    pushToast(item.potionType === "hp" ? t("inventory.healedHp", { amount: result.healed }) : t("inventory.healedMp", { amount: result.healed }), "heal");
    setPlayer(result.player);
    if ((item.count || 1) <= 1) setSelectedId(null);
  };

  const handleUseBoostScroll = (item) => {
    const result = useBoostScroll(player, item.boostId);
    if (!result.used) { pushToast(t("boosts.noScrollsLeft"), "warn"); return; }
    pushToast(t("boosts.usedToast", { name: displayItemName(item, lang) }), "loot");
    setPlayer(result.player);
    if ((item.count || 1) <= 1) setSelectedId(null);
  };

  const openChest = (chest) => {
    setOpeningChest({ chest, phase: "shaking", result: null });
    setTimeout(() => {
      const item = chest.special ? rollSpecialChestLoot(player.class) : rollLoot(chest.tier);
      const afterChestRemoved = {
        ...player,
        chests: player.chests.filter((c) => c.id !== chest.id),
        milestones: { ...player.milestones, chestsOpened: (player.milestones?.chestsOpened || 0) + 1 },
      };
      const reportUnlocks = (finalPlayer) => newlyUnlocked(player, finalPlayer).forEach((a) => pushToast(t("inventory.achievementUnlocked", { name: t(`character.achievements.${a.id}.name`), title: t(`character.achievements.${a.id}.title`) }), "level"));
      // Katalog eşya-eşya yeniden dolduruluyor — bu tier/sınıf için henüz
      // hiçbir eşya yoksa item null gelir, sandığı yine de boşalt ama
      // hiçbir şey eklemeye çalışma.
      if (!item) {
        setPlayer(afterChestRemoved);
        setOpeningChest({ chest, phase: "reveal", result: null });
        reportUnlocks(afterChestRemoved);
        return;
      }
      const addResult = addItemToInventory(afterChestRemoved, item);
      const finalPlayer = addResult.added ? { ...addResult.player, hasNewItemNotice: true } : addResult.player;
      setPlayer(finalPlayer);
      setOpeningChest({ chest, phase: "reveal", result: item });
      if (!addResult.added) pushToast(t("inventory.itemWonButReason", { item: displayItemName(item, lang), reason: formatReason(t, addResult) }), "warn");
      reportUnlocks(finalPlayer);
    }, 950);
  };

  const closeChestModal = () => setOpeningChest(null);

  // Toplu kutu açma — kullanıcı isteği: "elimizde fazla kutu olduğu zaman
  // açmak problem olabiliyor." Tek tek açmanın shake/reveal animasyonunu
  // (bkz. openChest) onlarca kutu için tekrarlamak pratik değil, o yüzden
  // hepsi anında (animasyonsuz) çözülüp tek bir özet listesi gösteriliyor.
  const openAllChests = () => {
    if (player.chests.length === 0) return;
    const openedCount = player.chests.length;
    let p = player;
    const gained = [];
    let failed = 0;
    for (const chest of p.chests) {
      const item = chest.special ? rollSpecialChestLoot(p.class) : rollLoot(chest.tier);
      if (!item) continue;
      const addResult = addItemToInventory(p, item);
      p = addResult.player;
      if (addResult.added) gained.push(item); else failed++;
    }
    p = { ...p, chests: [], milestones: { ...p.milestones, chestsOpened: (p.milestones?.chestsOpened || 0) + openedCount } };
    if (gained.length > 0) p.hasNewItemNotice = true;
    setPlayer(p);
    setBulkChestResult({ items: gained, failed });
    newlyUnlocked(player, p).forEach((a) => pushToast(t("inventory.achievementUnlocked", { name: t(`character.achievements.${a.id}.name`), title: t(`character.achievements.${a.id}.title`) }), "level"));
  };

  const selectedItem = subtab === "bank"
    ? bank[bankPage].find((i) => i.id === selectedId) || null
    : player.inventory.find((i) => i.id === selectedId) || null;
  const bagSlotsFilled = player.inventory.length;
  const unmetReqs = selectedItem
    ? (selectedItem.reqStats || []).filter((r) => player.stats[r.key] < r.value)
    : [];
  const statReqMet = unmetReqs.length === 0;
  const repairAmount = selectedItem ? discountedRepairCost(selectedItem, premiumRepairDiscount(player)) : 0;
  const totalRepairAll = totalEquippedRepairCost(player, premiumRepairDiscount(player));

  const repairAll = () => {
    const result = repairAllEquipped(player, premiumRepairDiscount(player));
    if (!result.repaired) { pushToast(formatReason(t, result, "inventory.repairAllNothing"), "warn"); return; }
    setPlayer(result.player);
    pushToast(t("inventory.repairAllDone", { gold: formatGold(result.cost) }), "default");
  };

  const cls = CLASSES[player.class];
  const equippedSelectedItem = selectedEquipSlot ? player.equipped[selectedEquipSlot] : null;

  return (
    <div style={styles.panelScroll}>
      <SectionLabel>{t("inventory.equippedHeader")}</SectionLabel>
      <Paperdoll
        player={player}
        cls={cls}
        onSlotClick={(slotKey, item) => {
          if (!item) return;
          setSelectedId(null);
          setSelectedEquipSlot((cur) => (cur === slotKey ? null : slotKey));
        }}
      />

      {equippedSelectedItem && (
        <div style={styles.itemSheetOverlay} onClick={() => setSelectedEquipSlot(null)}>
          <div style={styles.itemSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.itemSheetHandle} />
            <ItemTooltip item={equippedSelectedItem} player={player} />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button
                className="rpg-action" style={{ ...styles.tinyBtn, background: "#C9425A", display: "flex", alignItems: "center", gap: 4 }}
                onClick={() => unequip(selectedEquipSlot)}
              >
                <ArrowUpFromLine size={11} style={{ transform: "rotate(180deg)" }} /> {t("inventory.unequipBtn")}
              </button>
              <button
                className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)", marginLeft: "auto" }}
                onClick={() => setSelectedEquipSlot(null)}
              >
                <X size={11} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kullanıcı isteği: "Eşyaları çıkarmadan rot tamir yapılamıyor" —
          repairItem zaten kuşanılı eşyayı yerinde yamıyordu, eksik olan
          sadece çıkarmadan ulaşan bir yoldu. */}
      <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 10, textAlign: "center" }}>
        {t("inventory.totalRepairCost", { cost: formatGold(totalRepairAll) })}
      </div>
      <button
        className="rpg-action" style={{
          ...styles.tinyBtn, width: "100%", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          ...(totalRepairAll > 0 ? { background: "#D4AF6A", color: "#15171E" } : { background: "var(--bg-panel-alt)", color: "var(--text-faint)" }),
        }}
        disabled={totalRepairAll <= 0}
        onClick={repairAll}
      >
        <Wrench size={12} /> {t("inventory.repairAllBtn")}
      </button>

      <div className="rpg-tabs" style={styles.subtabRow}>
        <button onClick={() => { setSubtab("armor"); setSelectedId(null); }} style={{ ...styles.subtabBtn, ...(subtab === "armor" ? styles.subtabBtnActive : {}) }}>
          {t("inventory.bagTab", { filled: bagSlotsFilled, max: BAG_SLOTS })}
        </button>
        <button onClick={() => { setSubtab("bank"); setSelectedId(null); }} style={{ ...styles.subtabBtn, ...(subtab === "bank" ? styles.subtabBtnActive : {}) }}>
          {t("inventory.bankTab")}
        </button>
        <button onClick={() => { setSubtab("chests"); setSelectedId(null); }} style={{ ...styles.subtabBtn, ...(subtab === "chests" ? styles.subtabBtnActive : {}) }}>
          {t("inventory.chestsTab", { count: player.chests.length })}
        </button>
      </div>

      {subtab === "armor" && (
        <>
          {/* Toplu seçim — sadece depoya taşımak ya da toplu satmak için
              (kullanıcı isteği), tekli detay sayfasının yerini alıyor. */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              className="rpg-action" style={{ ...styles.tinyBtn, background: bulkMode ? "#5FA8A0" : "var(--bg-panel-alt)", color: bulkMode ? "#0B0C10" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}
              onClick={toggleBulkMode}
            >
              <ListChecks size={12} /> {bulkMode ? t("inventory.bulkSelectOff") : t("inventory.bulkSelectOn")}
            </button>
          </div>

          {bulkMode && (
            <div className="rpg-card" style={{ ...styles.itemDetailCard, marginTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{t("inventory.bulkSelectedCount", { count: bulkSelected.size })}</span>
              <button
                className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", opacity: bulkSelected.size ? 1 : 0.5, display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}
                disabled={bulkSelected.size === 0}
                onClick={bulkDeposit}
              >
                <Archive size={11} /> {t("inventory.moveToBank")}
              </button>
              <button
                className="rpg-action" style={{ ...styles.tinyBtn, opacity: bulkSelected.size ? 1 : 0.5, display: "flex", alignItems: "center", gap: 4 }}
                disabled={bulkSelected.size === 0}
                onClick={bulkSell}
              >
                <Coins size={11} /> {t("inventory.bulkSellBtn")}
              </button>
            </div>
          )}

          <BagGrid
            player={player}
            setPlayer={setPlayer}
            selectedId={selectedId}
            bulkSelectedIds={bulkMode ? bulkSelected : null}
            onItemTap={handleBagTap}
          />

          {bagSlotsFilled === 0 && (
            <EmptyState icon={Package} title={t("inventory.bagEmptyTitle")} subtitle={t("inventory.bagEmptySubtitle")} />
          )}
        </>
      )}

      {subtab === "bank" && (
        <>
          <div className="rpg-card" style={{ ...styles.itemDetailCard, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Coins size={16} color="var(--gold-text)" strokeWidth={1.6} />
            <div style={{ fontSize: 12 }}>
              {t("inventory.bankGoldLabel")} <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold-text)" }}>{formatGold(bankGold)}g</span>
            </div>
            <div style={{ fontSize: 9, color: "var(--text-faint)", width: "100%" }}>
              {t("inventory.bankGoldShared")}
            </div>
            <input
              type="number" min="1" placeholder={t("inventory.amountPlaceholder")}
              value={goldAmount}
              onChange={(e) => setGoldAmount(e.target.value)}
              style={{ ...styles.numInput, flex: 1, minWidth: 80 }}
            />
            <button className="rpg-action" style={{ ...styles.tinyBtn, display: "flex", alignItems: "center", gap: 4 }} onClick={depositGold}>
              <ArrowDownToLine size={11} /> {t("inventory.depositBtn")}
            </button>
            <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }} onClick={withdrawGold}>
              <ArrowUpFromLine size={11} /> {t("inventory.withdrawBtn")}
            </button>
          </div>

          <div className="rpg-tabs" style={styles.subtabRow}>
            {Array.from({ length: bank.length }, (_, i) => (
              <button
                key={i}
                onClick={() => { setBankPage(i); setSelectedId(null); }}
                style={{ ...styles.subtabBtn, flex: "0 0 auto", padding: "6px 12px", ...(bankPage === i ? styles.subtabBtnActive : {}) }}
              >
                {i + 1}
              </button>
            ))}
            {bank.length < MAX_BANK_PAGES && (
              <button
                onClick={handleBuyBankPage}
                title={t("inventory.buyBankPage", { n: EXTRA_BANK_PAGE_COST_DIAMONDS })}
                style={{ ...styles.subtabBtn, flex: "0 0 auto", padding: "6px 10px", display: "flex", alignItems: "center", gap: 3, color: "#8B6FC9" }}
              >
                <Plus size={11} /> <Gem size={11} />
              </button>
            )}
          </div>

          <BankGrid
            items={bank[bankPage]}
            selectedId={selectedId}
            onItemTap={(item) => { setSelectedEquipSlot(null); setSelectedId((cur) => (cur === item.id ? null : item.id)); }}
          />

          {bank[bankPage].length === 0 && (
            <EmptyState icon={Archive} title={t("inventory.bankPageEmptyTitle")} subtitle={t("inventory.bankPageEmptySubtitle")} />
          )}
        </>
      )}

      {subtab === "chests" && (
        player.chests.length === 0 ? (
          <EmptyState icon={Gift} title={t("inventory.noChestsTitle")} subtitle={t("inventory.noChestsSubtitle")} />
        ) : (
          <>
            {player.chests.length > 1 && (
              <button
                className="rpg-action" style={{ ...styles.tinyBtn, width: "100%", marginBottom: 10, background: "#D4AF6A", color: "#15171E", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                onClick={openAllChests}
              >
                <Gift size={12} /> {t("inventory.openAllChests", { count: player.chests.length })}
              </button>
            )}
            <div style={styles.chestGrid}>
              {player.chests.map((chest) => {
                const color = chest.special ? "#D4AF6A" : itemTierColor(chest.tier);

                return (
                  <button className="rpg-card" key={chest.id} onClick={() => openChest(chest)} style={{ ...styles.chestCard, borderColor: `${color}55` }}>
                    <RewardChest size={48}/>
                    <div style={{ fontSize: 11, marginTop: 6, fontFamily: "var(--font-mono)", color, textAlign: "center" }}>
                      {chest.special ? t("inventory.specialChestName") : t("inventory.tierChest", { tier: tierName(lang, chest.tier) })}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-faint)", marginTop: 2 }}>{t("inventory.tapToOpen")}</div>
                  </button>
                );
              })}
            </div>
          </>
        )
      )}

      {selectedItem && (subtab === "armor" || subtab === "bank") && (
        <div style={styles.itemSheetOverlay} onClick={() => setSelectedId(null)}>
          <div style={styles.itemSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.itemSheetHandle} />
            <ItemTooltip item={selectedItem} player={player} unmetReqs={unmetReqs} />
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {subtab === "bank" ? (
                <>
                  <button className="rpg-action" style={{ ...styles.tinyBtn, display: "flex", alignItems: "center", gap: 4 }} onClick={() => withdrawItem(selectedItem)}>
                    <ArrowUpFromLine size={11} /> {t("inventory.takeToBag")}
                  </button>
                  {repairAmount > 0 && (
                    <button className="rpg-action" style={{ ...styles.tinyBtn, background: "#D4AF6A", color: "#15171E", display: "flex", alignItems: "center", gap: 4 }} onClick={() => repair(selectedItem)}>
                      <Wrench size={11} /> {t("inventory.repairFor", { gold: formatGold(repairAmount) })}
                    </button>
                  )}
                </>
              ) : (
                <>
                  {selectedItem.kind === "potion" ? (
                    <button className="rpg-action" style={styles.tinyBtn} onClick={() => handleUsePotion(selectedItem)}>{t("inventory.useBtn")}</button>
                  ) : selectedItem.kind === "boostScroll" ? (
                    <button className="rpg-action" style={{ ...styles.tinyBtn, background: boostScrollDef(selectedItem.boostId)?.color }} onClick={() => handleUseBoostScroll(selectedItem)}>{t("boosts.useBtn")}</button>
                  ) : selectedItem.kind === "scroll" || selectedItem.kind === "bonusScroll" || selectedItem.kind === "accessoryScroll" ? (
                    // Bonus Parşömen'in de tıpkı normal parşömen gibi buradan
                    // hiçbir işlevi yok — sadece Yükselt sekmesindeki forge'a
                    // sürüklenip kullanılıyor. Önceden burada hiç eşleşmiyordu
                    // ve akış son "else" dalına (Kuşan butonu) düşüyordu —
                    // `item.slot` tanımsız olduğu için equipItem onu
                    // `equipped.undefined`'a yazıp envanterden siliyordu
                    // (kullanıcının bildirdiği "kullanılabiliyor" hatası).
                    <span style={{ fontSize: 10, color: "var(--text-faint)" }}>{t("inventory.usedFromUpgradeTab")}</span>
                  ) : selectedItem.kind === "raceScroll" ? (
                    player.clan ? (
                      <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)" }} disabled>
                        <Ban size={11} /> {t("inventory.clanBlocksRaceChange")}
                      </button>
                    ) : (
                      Object.entries(RACES).map(([key, r]) => (
                        <button
                          key={key}
                          className="rpg-action" style={{ ...styles.tinyBtn, background: r.color, opacity: player.race === key ? 0.4 : 1 }}
                          disabled={player.race === key}
                          onClick={() => useRaceScroll(selectedItem, key)}
                        >
                          {t("inventory.becomeRace", { race: r.name })}
                        </button>
                      ))
                    )
                  ) : selectedItem.kind === "jobScroll" ? (
                    !canChangeJob(player).ok ? (
                      <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)" }} disabled>
                        <Ban size={11} /> {canChangeJob(player).reason}
                      </button>
                    ) : (
                      Object.entries(CLASSES).filter(([key]) => key !== player.class).map(([key, c]) => (
                        <button key={key} className="rpg-action" style={{ ...styles.tinyBtn, background: c.color }} onClick={() => useJobScroll(selectedItem, key)}>
                          {t("inventory.becomeClass", { cls: c.name })}
                        </button>
                      ))
                    )
                  ) : selectedItem.kind === "armor" && selectedItem.class !== player.class ? (
                    <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)" }} disabled>
                      <Ban size={11} /> {t("inventory.locked")}
                    </button>
                  ) : selectedItem.kind === "armor" && selectedItem.tier === 5 && !player.awakened ? (
                    <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)" }} disabled>
                      <Ban size={11} /> {t("inventory.masterRequired")}
                    </button>
                  ) : !statReqMet ? (
                    <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)" }} disabled>
                      <Ban size={11} /> {t("inventory.insufficientStats")}
                    </button>
                  ) : (
                    <button className="rpg-action" style={styles.tinyBtn} onClick={() => equip(selectedItem)}>{t("inventory.equipBtn")}</button>
                  )}
                  {repairAmount > 0 && (
                    <button className="rpg-action" style={{ ...styles.tinyBtn, background: "#D4AF6A", color: "#15171E", display: "flex", alignItems: "center", gap: 4 }} onClick={() => repair(selectedItem)}>
                      <Wrench size={11} /> {t("inventory.repairFor", { gold: formatGold(repairAmount) })}
                    </button>
                  )}
                  {/* Kullanıcının bildirdiği bug: bu buton eskiden
                      !isConsumable() ile gizleniyordu, yani parşömen/pot
                      gibi her "tüketilebilir" eşya (Yükselt'te kullanılan
                      parşömenler dahil) depoya hiç kaldırılamıyordu —
                      depositToBank'ın kendisinde böyle bir kısıtlama hiç
                      yoktu, sorun sadece bu düğmenin görünürlüğündeydi.
                      Depoya koymanın herhangi bir eşya türünü engellemesi
                      için bir sebep yok, o yüzden koşul tamamen kaldırıldı. */}
                  <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }} onClick={() => depositItem(selectedItem)}>
                    <Archive size={11} /> {t("inventory.depositToBankBtn")}
                  </button>
                  {!isConsumable(selectedItem) && !selectedItem.noTrade && (
                    <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => sellItem(selectedItem)}>
                      {t("inventory.sellFor", { gold: formatGold(Math.round(sellPrice(selectedItem) * premiumSellMultiplier(player))) })}
                    </button>
                  )}
                </>
              )}
              <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)", marginLeft: "auto" }} onClick={() => setSelectedId(null)}>
                <X size={11} />
              </button>
            </div>
          </div>
        </div>
      )}

      {openingChest && (
        <ChestModal state={openingChest} onClose={closeChestModal} playerClass={player.class} />
      )}

      {bulkChestResult && (
        <BulkChestModal result={bulkChestResult} onClose={() => setBulkChestResult(null)} />
      )}
    </div>
  );
}
