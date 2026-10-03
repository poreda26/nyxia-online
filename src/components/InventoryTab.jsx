import { chargeDiamonds, settle, reportChargeFailure } from "../utils/diamondCharge";
import {openChestSafely,openChestsSafely} from '../utils/chests';
import RewardChest from './icons/RewardChest';
import { useState, useRef, useEffect } from "react";
import { Package, Gift, Sparkles, Ban, Wrench, Archive, ArrowUpFromLine, ArrowDownToLine, X, ListChecks, Coins, Gem, Plus } from "lucide-react";
import { itemTierColor, tierName } from "../data/itemRarity";
import { RACES } from "../data/races";
import { CLASSES } from "../data/classes";
import {
  equipItem, unequipItem, sellPrice, displayItemName, clampPlayerHp, discountedRepairCost, repairItem, canChangeJob, changeJob,
  totalEquippedRepairCost, repairAllEquipped, MAX_GOLD, formatGold,
} from "../utils/player";
import { isConsumable } from "../utils/itemDisplay";
import { newlyUnlocked } from "../utils/achievements";
import { BAG_SLOTS, depositToBank, withdrawFromBank, buyExtraBankPage, EXTRA_BANK_PAGE_COST_DIAMONDS, MAX_BANK_PAGES } from "../utils/inventory";
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

export default function InventoryTab({ act, player, setPlayer, bank, setBank, bankGold, setBankGold, pushToast, onChangeRace }) {
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
  const goldFailure = (result) => {
    const key = { invalidAmount: "inventory.enterValidAmount", notEnoughGold: "inventory.notEnoughGold", notEnoughBankGold: "inventory.notEnoughBankGold" }[result.reason];
    if (key) return pushToast(t(key), "warn");
    if (result.reason === "bankGoldCap") return pushToast(t("inventory.bankGoldCapExceeded", { max: formatGold(MAX_GOLD) }), "warn");
    if (result.reason === "carryGoldCap") return pushToast(t("inventory.carryGoldCapExceeded", { max: formatGold(MAX_GOLD) }), "warn");
    pushToast(t("wallet.unavailable"), "warn");
  };
  const depositGold = async () => {
    const amount = parseInt(goldAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) { pushToast(t("inventory.enterValidAmount"), "warn"); return; }
    const result = await act("inventory/depositGold", { amount });
    if (!result.ok) { goldFailure(result); return; }
    pushToast(t("inventory.goldDeposited", { amount: formatGold(amount) }), "default");
    setGoldAmount("");
  };
  const withdrawGold = async () => {
    const amount = parseInt(goldAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) { pushToast(t("inventory.enterValidAmount"), "warn"); return; }
    const result = await act("inventory/withdrawGold", { amount });
    if (!result.ok) { goldFailure(result); return; }
    pushToast(t("inventory.goldWithdrawn", { amount: formatGold(amount) }), "default");
    setGoldAmount("");
  };

  const handleBuyBankPage = async () => {
    const dry = buyExtraBankPage(player, bank);
    if (!dry.bought) {
      pushToast(dry.reason === "maxBankPages" ? t("inventory.maxBankPagesReached") : t("shop.notEnoughDiamonds"), "warn");
      return;
    }
    const charge = await chargeDiamonds("bankPage");
    if (!charge.ok) { reportChargeFailure(t, pushToast, charge); return; }
    const result = buyExtraBankPage(settle(player, charge), bank);
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

  const bulkDeposit = async () => {
    if (bulkItems.length === 0) return;
    const result = await act("inventory/depositBulk", { itemIds: bulkItems.map((i) => i.id), page: bankPage });
    const moved = result.ok ? result.moved : 0;
    pushToast(moved > 0 ? t("inventory.bulkDepositMoved", { count: moved }) : t("inventory.bulkDepositFull"), moved > 0 ? "default" : "warn");
    setBulkSelected(new Set());
    setBulkMode(false);
  };

  const bulkSell = async () => {
    // Pot/parşömen gibi tüketilebilirler ve takas edilemezler toplu satıştan bilerek dışlanır
    // (kural src/game/actions.js'te; sunucu da aynısını uygular).
    const result = await act("inventory/sellBulk", { itemIds: bulkItems.map((i) => i.id) });
    if (!result.ok) { pushToast(result.reason === "noneSellable" ? t("inventory.bulkNoneSellable") : t("wallet.unavailable"), "warn"); return; }
    pushToast(t("inventory.bulkSold", { count: result.count, gold: formatGold(result.gold) }), "loot");
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

  const equip = async (item) => {
    const result = await act("inventory/equip", { itemId: item.id });
    if (!result.ok) { pushToast(result.blocked ? formatBlocked(result.blocked) : t("wallet.unavailable"), "warn"); return; }
    pushToast(t("inventory.equipped", { item: displayItemName(item, lang) }), "default");
    setSelectedId(null);
  };

  const unequip = async (slotKey) => {
    const result = await act("inventory/unequip", { slot: slotKey });
    if (!result.ok) { if (result.reason) pushToast(formatReason(t, result), 'warn'); return; }
    setSelectedEquipSlot(null);
  };

  const sellItem = async (item) => {
    const result = await act("inventory/sell", { itemId: item.id });
    if (!result.ok) { pushToast(t(result.reason === "noTrade" ? "upgrade.itemNoTrade" : "wallet.unavailable"), "warn"); return; }
    pushToast(t("inventory.sold", { gold: formatGold(result.gold) }), "loot");
    setSelectedId(null);
  };

  const repair = async (item) => {
    const result = await act("inventory/repair", { itemId: item.id });
    if (!result.ok) { pushToast(formatReason(t, result, "inventory.repairFailed"), "warn"); return; }
    pushToast(t("inventory.repaired", { gold: formatGold(result.cost) }), "default");
  };

  const depositItem = async (item) => {
    const result = await act("inventory/depositItem", { itemId: item.id, page: bankPage });
    if (!result.ok) { pushToast(formatReason(t, result, "inventory.depositFailed"), "warn"); return; }
    pushToast(t("inventory.itemDeposited", { item: displayItemName(item, lang) }), "default");
    setSelectedId(null);
  };

  const withdrawItem = async (item) => {
    const result = await act("inventory/withdrawItem", { itemId: item.id, page: bankPage });
    if (!result.ok) { pushToast(formatReason(t, result, "inventory.withdrawFailed"), "warn"); return; }
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

  const handleUseBoostScroll = async (item) => {
    const result = await act("inventory/useBoostScroll", { itemId: item.id });
    if (!result.ok) { pushToast(t("boosts.noScrollsLeft"), "warn"); return; }
    pushToast(t("boosts.usedToast", { name: displayItemName(item, lang) }), "loot");
    if ((item.count || 1) <= 1) setSelectedId(null);
  };

  const chestBusy=useRef(false),chestTimer=useRef(null);
  useEffect(()=>()=>clearTimeout(chestTimer.current),[]);
  const chestWarning=reason=>pushToast(reason==='bagFull'?(lang==='en'?'Inventory full. Chest kept.':'Envanter dolu. Sandık açılmadı.'):(lang==='en'?'Cannot collect reward. Chest kept; check carrying capacity.':'Ödül alınamadı. Sandık korundu; taşıma kapasiteni kontrol et.'),'warn');
  const openChest = async chest => {
    if(chestBusy.current)return;
    chestBusy.current=true;
    const result=await act("inventory/openChest",{chestId:chest.id});
    if(!result.ok){chestBusy.current=false;chestWarning(result.reason);return;}
    result.player=result.nextPlayer;
    setOpeningChest({chest,phase:'shaking',result:null});
    chestTimer.current=setTimeout(()=>setOpeningChest({chest,phase:'reveal',result:result.item}),950);
    newlyUnlocked(player,result.player).forEach(a=>pushToast(t('inventory.achievementUnlocked',{name:t(`character.achievements.${a.id}.name`),title:t(`character.achievements.${a.id}.title`)}),'level'));
  };
  const closeChestModal=()=>{clearTimeout(chestTimer.current);chestBusy.current=false;setOpeningChest(null);};
  const openAllChests=async()=>{
    if(chestBusy.current)return;
    chestBusy.current=true;
    const result=await act("inventory/openAllChests");
    if(!result.ok){chestBusy.current=false;if(result.reason&&result.reason!=="noChests")chestWarning(result.reason);return;}
    result.player=result.nextPlayer;
    if(result.reason)chestWarning(result.reason);
    setBulkChestResult({items:result.items,failed:0});
    newlyUnlocked(player,result.player).forEach(a=>pushToast(t('inventory.achievementUnlocked',{name:t(`character.achievements.${a.id}.name`),title:t(`character.achievements.${a.id}.title`)}),'level'));
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
                className="rpg-action" data-tut="unequip-btn" style={{ ...styles.tinyBtn, background: "#C9425A", display: "flex", alignItems: "center", gap: 4 }}
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

          <BankGrid playerClass={player.class}
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
                    <RewardChest size={48} tier={chest.tier} special={chest.special}/>
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
                    <span style={{fontSize: 11, color: "var(--text-muted)"}}>{lang === "tr" ? "İksirler savaş sırasında kullanılır." : "Potions are used during battle."}</span>
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
                  ) : ["armor","weapon"].includes(selectedItem.kind) && !!(selectedItem.class||selectedItem.cls) && (selectedItem.class||selectedItem.cls) !== player.class ? (
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
                    <button className="rpg-action" data-tut="equip-btn" style={styles.tinyBtn} onClick={() => equip(selectedItem)}>{t("inventory.equipBtn")}</button>
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
        <BulkChestModal result={bulkChestResult} onClose={() => {chestBusy.current=false;setBulkChestResult(null);}} />
      )}
    </div>
  );
}
