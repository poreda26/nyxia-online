import MenuEmblem from './icons/MenuEmblem';
import { useState, useEffect, useCallback } from "react";
import { FlaskConical, Store, Tag, Plus, Minus, X, Gem, ScrollText, Crown, Check, Star, Shuffle, Clock, ShoppingBag, AlertTriangle, ChevronDown, ChevronUp, Package2 } from "lucide-react";
import { itemTierColor, tierName } from "../data/itemRarity";
import { displayItemName, formatGold } from "../utils/player";
import { itemStatLabel } from "../utils/itemDisplay";
import { addItemToInventory, addItemToAnyBankPage, makePotionStack, makeRaceScroll, makeJobScroll, makeBonusScrollStack } from "../utils/inventory";
import { HP_POTION_TIERS, MP_POTION_TIERS, potionName, potionPrice } from "../data/potions";
import { PREMIUM_TIERS } from "../data/premium";
import { activePremiumTier, premiumDaysLeft, buyPremium } from "../utils/premium";
import { useTranslation, formatReason } from "../i18n/LanguageContext";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import EmptyState from "./shared/EmptyState";
import ItemIcon from "./ItemIcon";
import ItemTooltip from "./ItemTooltip";
import { possessiveName } from "../utils/turkish";
import * as marketService from "../services/marketService";

const RACE_SCROLL_PRICE = 500;
const JOB_SCROLL_PRICE = 1500;
const BONUS_SCROLL_PRICE = 800;

// Pot satın alma adedi — kullanıcı isteği: tek tek almak yerine +/-
// ikonlarıyla arttırıp azaltabilmek, ayrıca çok almak isteyen için sayıyı
// elle de yazabilmek. `value` her zaman 1-999 arasında (bkz. MarketTab'ın
// setQty clamp'i) — bu bileşen sadece görüntüleme/etkileşim katmanı.
function PotionQtyStepper({ qty, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <button style={styles.qtyBtn} onClick={() => onChange(qty - 1)}><Minus size={11} /></button>
      <input
        type="number" min="1" max="999" value={qty}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 1)}
        style={styles.qtyInput}
      />
      <button style={styles.qtyBtn} onClick={() => onChange(qty + 1)}><Plus size={11} /></button>
    </div>
  );
}

export default function MarketTab({ player, setPlayer, bank, setBank, bankGold, setBankGold, username, pushToast }) {
  const { t, lang } = useTranslation();
  const DURATION_LABEL = t("market.durationLabels");
  const [subtab, setSubtab] = useState("market");
  // Kullanıcı isteği: "Pazarımız bir depo gibi açılacak. Maksimum 10 adet
  // eşya konulabilen bir satış yeri." — myStall tek bir tezgah objesi (ya da
  // hiç açık değilse null), npcStalls sahte satıcıların isim bazlı
  // gruplanmış eşya listesi (bkz. marketService.fetchMarket).
  const [myStall, setMyStall] = useState(null);
  const [npcListings, setNpcListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSeller, setExpandedSeller] = useState(null);
  // Tezgahı açarken seçilen süre — kullanıcı isteği: "1 Saatlik 25 gold dan
  // başlayacak şekilde... 24 saatlik 250 gold olacak şekilde aşamalı fiyatı
  // yükselecek."
  const [openDuration, setOpenDuration] = useState(marketService.MARKET_DURATIONS_HOURS[2]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState("item"); // "item" | "chest" — hangi havuzdan (çanta ya da sandıklar) seçildiğini belirler
  const [pickedItem, setPickedItem] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  // Kullanıcı isteği: "Pazarı kurduktan sonra pazarı bozarsa kullanıcı
  // uyarı çıkacak goldunun iade edilmediğini bilecek."
  const [closeConfirm, setCloseConfirm] = useState(false);
  // 0 = no dialog, 1 = "yükseltmek ister misiniz?", 2 = "Mythic alınsın mı?" —
  // the only path that ever reaches this is Apex -> Mythic (see
  // handlePremiumClick). Every other combination is either a direct
  // purchase or an outright block, no confirmation needed.
  const [upgradeConfirmStep, setUpgradeConfirmStep] = useState(0);
  // Kullanıcı isteği: "Pazardaki eşyaların üstüne bir kere tıklandığı zaman
  // eşyanın özelliğini gösteren bir widget açılsın." — InventoryTab'daki
  // aynı itemSheetOverlay/ItemTooltip düzeni burada da kullanılıyor.
  // `source: "mine" | "npc"` hangi eylem düğmelerinin göründüğünü belirler.
  const [inspectEntry, setInspectEntry] = useState(null);
  // Kullanıcı isteği: "Pazardan eşya alıyorken Almak istediğine emin misin
  // tarzında bir cümle ile onay istensin." — sadece NPC eşyaları için.
  const [buyConfirm, setBuyConfirm] = useState(null);
  // Pot alım adedi — kullanıcı isteği: "+/- ikonları olsun sayıyı arttırıp
  // kaç tane almak istersek ayarlayabilelim... sayıyı elle yazabilsin."
  // Anahtar `${potionType}:${tier}`, her satırın kendi adedi.
  const [potionQty, setPotionQty] = useState({});
  const qtyFor = (key) => potionQty[key] ?? 1;
  const setQty = (key, value) => setPotionQty((q) => ({ ...q, [key]: Math.max(1, Math.min(999, value)) }));

  // fetchMarket/resolveMyStall are async (Promise-returning) even though
  // the "server" is local for now — see services/marketService.js.
  //
  // Kullanıcı isteği: "Pazarlar altın ile kurulsun" + hesap artık birden
  // fazla karakter arasında paylaşılan bir Depo Altını'na sahip (bkz.
  // InventoryTab) — tezgahtan bir eşya satıldığında kazanılan altın, o an
  // hangi karakter oynanıyorsa ona değil, ortak depo altınına ekleniyor.
  const refreshMarket = useCallback(async () => {
    setLoading(true);
    const sold = await marketService.resolveMyStall(username);
    if (sold.length > 0) {
      setBankGold((g) => g + sold.reduce((sum, entry) => sum + entry.price, 0));
      sold.forEach((entry) => pushToast(t("market.soldFromStall", { item: displayItemName(entry.item, lang), gold: formatGold(entry.price) }), "loot"));
    }
    const fresh = await marketService.fetchMarket(username);
    setMyStall(fresh.myStall);
    setNpcListings(fresh.npcListings);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => { refreshMarket(); }, [refreshMarket]);

  const purchasePremium = (tierId) => {
    const result = buyPremium(player, tierId, bank);
    if (!result.bought) { pushToast(formatReason(t, result, "market.purchaseFailed"), "warn"); return; }
    setPlayer(result.player);
    setBank(result.bank);
    pushToast(t("shop.premiumActivated", { tier: PREMIUM_TIERS[tierId].name }), "loot");
  };

  // No active premium -> straight purchase. Same tier already active, or
  // Mythic (top tier) trying to buy anything at all -> hard block, no
  // re-buying/extending. The one exception is Apex -> Mythic, which is an
  // upgrade rather than a fresh unrelated purchase, so it gets a two-step
  // confirmation instead of either extreme.
  const handlePremiumClick = (tierId) => {
    const active = activePremiumTier(player);
    if (!active) { purchasePremium(tierId); return; }
    if (active.id === tierId || active.id === "mythic") {
      pushToast(t("shop.alreadyHavePremium"), "warn");
      return;
    }
    setUpgradeConfirmStep(1);
  };

  const resolveUpgradeStep1 = (yes) => setUpgradeConfirmStep(yes ? 2 : 0);
  const resolveUpgradeStep2 = (yes) => {
    setUpgradeConfirmStep(0);
    if (yes) purchasePremium("mythic");
  };

  const buyBonusScroll = () => {
    if (player.diamonds < BONUS_SCROLL_PRICE) { pushToast(t("shop.notEnoughDiamonds"), "warn"); return; }
    const result = addItemToInventory({ ...player, diamonds: player.diamonds - BONUS_SCROLL_PRICE }, makeBonusScrollStack());
    if (!result.added) { pushToast(t("shop.purchaseFailed", { reason: formatReason(t, result) }), "warn"); return; }
    setPlayer(result.player);
    pushToast(t("shop.bonusScrollPurchased"), "loot");
  };

  const buyRaceScroll = () => {
    if (player.diamonds < RACE_SCROLL_PRICE) { pushToast(t("shop.notEnoughDiamonds"), "warn"); return; }
    const result = addItemToInventory({ ...player, diamonds: player.diamonds - RACE_SCROLL_PRICE }, makeRaceScroll(1));
    if (!result.added) { pushToast(t("shop.purchaseFailed", { reason: formatReason(t, result) }), "warn"); return; }
    setPlayer(result.player);
    pushToast(t("shop.raceScrollPurchased"), "loot");
  };

  const buyJobScroll = () => {
    if (player.diamonds < JOB_SCROLL_PRICE) { pushToast(t("shop.notEnoughDiamonds"), "warn"); return; }
    const result = addItemToInventory({ ...player, diamonds: player.diamonds - JOB_SCROLL_PRICE }, makeJobScroll(1));
    if (!result.added) { pushToast(t("shop.purchaseFailed", { reason: formatReason(t, result) }), "warn"); return; }
    setPlayer(result.player);
    pushToast(t("shop.jobScrollPurchased"), "loot");
  };

  const buyPotion = (potionType, tier, qty) => {
    const amount = Math.max(1, qty || 1);
    const price = potionPrice(potionType, tier) * amount;
    if (player.gold < price) { pushToast(t("shop.notEnoughGold"), "warn"); return; }
    const result = addItemToInventory({ ...player, gold: player.gold - price }, makePotionStack(potionType, tier, amount));
    if (!result.added) { pushToast(t("shop.purchaseFailed", { reason: formatReason(t, result) }), "warn"); return; }
    setPlayer(result.player);
    pushToast(t("shop.potionPurchased", { name: potionName(potionType, tier, lang), qty: amount, gold: formatGold(price) }), "loot");
  };

  // ---- Kendi tezgahım (Pazarım) ----

  const openStall = async (durationHours) => {
    const fee = marketService.MARKET_DURATION_FEE[durationHours];
    if (player.gold < fee) { pushToast(t("market.notEnoughForStallFee", { fee }), "warn"); return; }
    const result = await marketService.openStall(username, player.nickname, durationHours);
    if (!result.ok) { pushToast(formatReason(t, result, "market.stallOpenFailed"), "warn"); refreshMarket(); return; }
    setPlayer((p) => ({ ...p, gold: p.gold - fee }));
    setMyStall(result.stall);
    pushToast(t("market.stallOpened", { duration: DURATION_LABEL[durationHours], fee: formatGold(fee) }), "loot");
  };

  const sellableItems = player.inventory.filter((i) => (i.kind === "armor" || i.kind === "weapon" || i.kind === "accessory") && !i.noTrade);
  // Sandıklar player.chests'te yaşıyor, player.inventory'de değil (bkz.
  // InventoryTab'ın ayrı "Sandıklar" alt sekmesi) — tezgaha eklerken de
  // ayrı bir havuz olarak sunuluyor.
  const sellableChests = player.chests.map((c) => ({
    id: c.id, kind: "chest", tier: c.tier, special: c.special,
    name: c.special ? t("market.specialChestName") : t("market.tierChestName", { tier: tierName(lang, c.tier) }),
  }));

  const openPicker = (mode) => {
    if (!myStall || !myStall.active) { pushToast(t("market.openStallFirst"), "warn"); return; }
    if (myStall.items.length >= marketService.MARKET_STALL_MAX_ITEMS) { pushToast(t("market.stallFull", { count: marketService.MARKET_STALL_MAX_ITEMS, max: marketService.MARKET_STALL_MAX_ITEMS }), "warn"); return; }
    setPickerOpen(true); setPickerMode(mode); setPickedItem(null); setPriceInput("");
  };
  const pickItem = (item) => { setPickedItem(item); setPriceInput(""); };

  const confirmAddToStall = async () => {
    const price = parseInt(priceInput, 10);
    if (!pickedItem) return;
    if (!Number.isFinite(price) || price <= 0) { pushToast(t("market.enterValidPrice"), "warn"); return; }
    const result = await marketService.addItemToStall(username, pickedItem, price);
    if (!result.ok) { pushToast(formatReason(t, result, "market.addFailed"), "warn"); refreshMarket(); return; }
    if (pickerMode === "chest") {
      setPlayer((p) => ({ ...p, chests: p.chests.filter((c) => c.id !== pickedItem.id) }));
    } else {
      setPlayer((p) => ({ ...p, inventory: p.inventory.filter((i) => i.id !== pickedItem.id) }));
    }
    setMyStall(result.stall);
    pushToast(t("market.itemAddedToStall", { item: displayItemName(pickedItem, lang), gold: formatGold(price) }), "loot");
    setPickerOpen(false);
    setPickedItem(null);
    setPriceInput("");
  };

  // Bir eşya grubunu (içindekiler) çantaya/depoya/sandıklara dağıtır —
  // hem "pazarı erken kapat" hem "süresi dolan tezgahı al" tarafından
  // paylaşılıyor. Sığmayanlar hakkında toast basar, hiçbirini kaybetmez.
  const distributeReclaimedItems = (entries) => {
    let nextPlayer = player;
    let nextBank = bank;
    let placedChests = 0, placedItems = 0, lost = 0;
    const placedIds = [];
    for (const entry of entries) {
      if (entry.item.kind === "chest") {
        nextPlayer = { ...nextPlayer, chests: [...nextPlayer.chests, { id: entry.item.id, tier: entry.item.tier, special: entry.item.special }] };
        placedChests++;
        placedIds.push(entry.id);
        continue;
      }
      const bankResult = addItemToAnyBankPage(entry.item, nextBank);
      if (bankResult.added) {
        nextBank = bankResult.bank;
        placedItems++;
        placedIds.push(entry.id);
      } else {
        lost++;
      }
    }
    if (nextPlayer !== player) setPlayer(nextPlayer);
    if (nextBank !== bank) setBank(nextBank);
    return { placedIds, placedChests, placedItems, lost };
  };

  // Kullanıcı isteği: "Pazarı kurduktan sonra pazarı bozarsa kullanıcı
  // uyarı çıkacak goldunun iade edilmediğini bilecek." — uyarı closeConfirm
  // penceresinde gösteriliyor, bu fonksiyon sadece onaylandıktan sonra çalışır.
  const confirmCloseStall = async () => {
    setCloseConfirm(false);
    const result = await marketService.closeStall(username);
    if (!result) { pushToast(t("market.stallAlreadyClosed"), "warn"); refreshMarket(); return; }
    const { placedChests, placedItems, lost } = distributeReclaimedItems(result.items.map((entry) => ({ ...entry })));
    setMyStall(null);
    if (lost > 0) pushToast(t("market.stallClosedSomeLost", { count: lost }), "warn");
    else pushToast(t("market.stallClosedReturned", { count: placedItems + placedChests }), "default");
  };

  // Kullanıcı isteği (bir önceki turdan, aynı ilke): "Deaktif olan
  // pazardaki eşyaları satıcı kendisi alacak... envanterinde ya da
  // deposunda yer yoksa bir bug problem yaşanmayacak." — otomatik iade yok,
  // burada elle tetikleniyor; sığmayanlar tezgahta kalır, hiçbiri kaybolmaz.
  const reclaimStall = async () => {
    const result = await marketService.reclaimStall(username);
    if (!result) { pushToast(t("market.nothingToReclaim"), "warn"); refreshMarket(); return; }
    const { placedIds, placedChests, placedItems, lost } = distributeReclaimedItems(result.items);
    await marketService.removeReclaimedItems(username, placedIds);
    const fresh = await marketService.fetchMarket(username);
    setMyStall(fresh.myStall);
    if (lost > 0) pushToast(t("market.reclaimedSomeLost", { count: placedItems + placedChests, lost }), "warn");
    else pushToast(t("market.reclaimedAll", { count: placedItems + placedChests }), "default");
  };

  // ---- NPC tezgahları (Diğer Pazarlar) ----

  const requestBuy = (listing) => {
    if (player.gold < listing.price) { pushToast(t("market.notEnoughGold"), "warn"); return; }
    setBuyConfirm(listing);
  };

  const confirmBuy = async () => {
    const listing = buyConfirm;
    setBuyConfirm(null);
    if (!listing) return;
    const result = await marketService.buyListing(listing.id);
    if (!result.ok) { pushToast(formatReason(t, result, "market.purchaseFailed"), "warn"); refreshMarket(); return; }
    if (result.listing.item.kind === "chest") {
      setPlayer((p) => ({ ...p, gold: p.gold - listing.price, chests: [...p.chests, { id: result.listing.item.id, tier: result.listing.item.tier, special: result.listing.item.special }] }));
    } else {
      const addResult = addItemToInventory({ ...player, gold: player.gold - listing.price }, result.listing.item);
      if (!addResult.added) { pushToast(t("market.boughtButBagFull", { reason: formatReason(t, addResult) }), "warn"); }
      setPlayer(addResult.player);
    }
    setNpcListings((ls) => ls.filter((l) => l.id !== listing.id));
    pushToast(t("market.itemPurchased", { item: displayItemName(result.listing.item, lang) }), "loot");
  };

  // Kullanıcı isteği: "İtemler tek tek listelenmeyecek." — NPC eşyaları
  // isim bazlı gruplanıp "X'in Pazarı (N eşya)" şeklinde tek satır olarak
  // gösteriliyor, tıklanınca içindekiler açılıyor.
  const npcStalls = [];
  const seenSellers = new Set();
  npcListings.forEach((l) => {
    if (seenSellers.has(l.sellerName)) return;
    seenSellers.add(l.sellerName);
    npcStalls.push({ sellerName: l.sellerName, items: npcListings.filter((x) => x.sellerName === l.sellerName) });
  });

  const stallFee = marketService.MARKET_DURATION_FEE[openDuration];

  return (
    <div style={styles.panelScroll}>
      <div className="rpg-tabs" style={styles.subtabRow}>
        <button onClick={() => setSubtab("market")} style={{ ...styles.subtabBtn, ...(subtab === "market" ? styles.subtabBtnActive : {}) }}>
          {t("market.tabMarket")}
        </button>
        <button onClick={() => setSubtab("shop")} style={{ ...styles.subtabBtn, ...(subtab === "shop" ? styles.subtabBtnActive : {}) }}>
          {t("market.tabShop")}
        </button>
        <button onClick={() => setSubtab("special")} style={{ ...styles.subtabBtn, ...(subtab === "special" ? styles.subtabBtnActive : {}) }}>
          {t("market.tabSpecial")}
        </button>
      </div>

      {subtab === "special" && (
        <>
          <SectionLabel>{t("market.tabSpecial")}</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: -6, marginBottom: 12 }}>
            <Gem size={13} color="#8B6FC9" />
            <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#8B6FC9" }}>{t("shop.diamondsAmount", { n: player.diamonds })}</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: -4, marginBottom: 12 }}>
            {t("shop.diamondsDesc")}
          </p>

          <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>{t("shop.premiumHeader")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {Object.values(PREMIUM_TIERS).map((tier) => {
              const active = activePremiumTier(player);
              const isThisActive = active?.id === tier.id;
              const daysLeft = isThisActive ? premiumDaysLeft(player) : 0;
              return (
                <div key={tier.id} className="rpg-card" style={{ ...styles.itemDetailCard, borderColor: `${tier.color}66`, background: `${tier.color}0d` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Crown size={18} color={tier.color} strokeWidth={1.6} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: tier.color }}>{tier.name}</div>
                      <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{t("shop.tierDurationDays", { n: tier.durationDays })}</div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: tier.color, display: "flex", alignItems: "center", gap: 3 }}>
                      <Gem size={12} /> {tier.price}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                    {tier.perks.map((perk) => (
                      <div key={perk} style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                        <Check size={11} color={tier.color} /> {t(`shop.premiumPerk.${perk}`)}
                      </div>
                    ))}
                  </div>
                  <button
                    className="rpg-action" style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, background: tier.color, color: "#0B0C10" }}
                    onClick={() => handlePremiumClick(tier.id)}
                  >
                    {isThisActive ? t("shop.premiumActive", { days: daysLeft }) : t("shop.buyBtn")}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>{t("shop.scrollsHeader")}</div>
          <div className="rpg-row" style={{ ...styles.itemRow, borderColor: "#8B6FC955" }}>
            <ScrollText size={18} color="#8B6FC9" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>{t("shop.raceScrollTitle")}</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{t("shop.raceScrollDesc")}</div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#8B6FC9", marginRight: 8, display: "flex", alignItems: "center", gap: 3 }}>
              <Gem size={11} /> {RACE_SCROLL_PRICE}
            </div>
            <button className="rpg-action" style={styles.tinyBtn} onClick={buyRaceScroll}>{t("shop.buyShort")}</button>
          </div>
          <div className="rpg-row" style={{ ...styles.itemRow, borderColor: "#5FA8A055", marginTop: 8 }}>
            <Shuffle size={18} color="#5FA8A0" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>{t("shop.jobScrollTitle")}</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                {t("shop.jobScrollDesc")}
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#5FA8A0", marginRight: 8, display: "flex", alignItems: "center", gap: 3 }}>
              <Gem size={11} /> {JOB_SCROLL_PRICE}
            </div>
            <button className="rpg-action" style={styles.tinyBtn} onClick={buyJobScroll}>{t("shop.buyShort")}</button>
          </div>
          <div className="rpg-row" style={{ ...styles.itemRow, borderColor: "#D4AF6A55", marginTop: 8 }}>
            <Star size={18} color="var(--gold-text)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>{t("shop.bonusScrollTitle")}</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                {t("shop.bonusScrollDesc")}
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--gold-text)", marginRight: 8, display: "flex", alignItems: "center", gap: 3 }}>
              <Gem size={11} /> {BONUS_SCROLL_PRICE}
            </div>
            <button className="rpg-action" style={styles.tinyBtn} onClick={buyBonusScroll}>{t("shop.buyShort")}</button>
          </div>
        </>
      )}

      {subtab === "shop" && (
        <>
          <SectionLabel>{t("shop.hpPotionsHeader")}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {HP_POTION_TIERS.map((amount, i) => {
              const tier = i + 1;
              const key = `hp:${tier}`;
              const qty = qtyFor(key);
              return (
                <div key={tier} className="rpg-row" style={{ ...styles.itemRow, borderColor: "#C9425A44", flexWrap: "wrap" }}>
                  <FlaskConical size={18} color="#C9425A" />
                  <div style={{ flex: 1, minWidth: 90 }}>
                    <div style={{ fontSize: 13 }}>{potionName("hp", tier, lang)}</div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{t("shop.hpRestoreDesc", { amount })}</div>
                  </div>
                  <PotionQtyStepper qty={qty} onChange={(v) => setQty(key, v)} />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--gold-text)", marginRight: 8 }}>{formatGold(potionPrice("hp", tier) * qty)}g</div>
                  <button className="rpg-action" style={styles.tinyBtn} onClick={() => buyPotion("hp", tier, qty)}>{t("shop.buyShort")}</button>
                </div>
              );
            })}
          </div>

          <SectionLabel>{t("shop.mpPotionsHeader")}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MP_POTION_TIERS.map((amount, i) => {
              const tier = i + 1;
              const key = `mp:${tier}`;
              const qty = qtyFor(key);
              return (
                <div key={tier} className="rpg-row" style={{ ...styles.itemRow, borderColor: "#4FC3D944", flexWrap: "wrap" }}>
                  <FlaskConical size={18} color="#4FC3D9" />
                  <div style={{ flex: 1, minWidth: 90 }}>
                    <div style={{ fontSize: 13 }}>{potionName("mp", tier, lang)}</div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{t("shop.mpRestoreDesc", { amount })}</div>
                  </div>
                  <PotionQtyStepper qty={qty} onChange={(v) => setQty(key, v)} />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--gold-text)", marginRight: 8 }}>{formatGold(potionPrice("mp", tier) * qty)}g</div>
                  <button className="rpg-action" style={styles.tinyBtn} onClick={() => buyPotion("mp", tier, qty)}>{t("shop.buyShort")}</button>
                </div>
              );
            })}
          </div>
          <div style={styles.dropInfoRow}>
            <span>{t("shop.chestsNoLongerSold")}</span>
          </div>
        </>
      )}

      {subtab === "market" && (
        <>
          <SectionLabel>{t("market.myStallHeader")}</SectionLabel>

          {!myStall && (
            <>
              <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: -4, marginBottom: 12 }}>
                {t("market.stallIntro", { max: marketService.MARKET_STALL_MAX_ITEMS })}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {marketService.MARKET_DURATIONS_HOURS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setOpenDuration(h)}
                    style={{ ...styles.tinyBtn, flex: "1 0 auto", ...(openDuration === h ? {} : { background: "var(--bg-panel-alt)", color: "var(--text-muted)" }) }}
                  >
                    {DURATION_LABEL[h]}
                  </button>
                ))}
              </div>
              <button className="rpg-action" style={{ ...styles.smallBtn, background: "#5FA8A0", width: "100%" }} onClick={() => openStall(openDuration)}>
                <Store size={14} /> {t("market.openStallBtn", { fee: formatGold(stallFee) })}
              </button>
            </>
          )}

          {myStall && myStall.active && (
            <>
              <div className="rpg-card" style={{ ...styles.itemDetailCard, marginBottom: 12, borderColor: "#5FA8A066", background: "#5FA8A00d" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Store size={16} color="#5FA8A0" strokeWidth={1.6} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "#5FA8A0" }}>
                      {t("market.stallTitleFor", { name: lang === "tr" ? possessiveName(player.nickname) : player.nickname })}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{t("market.stallItemCount", { count: myStall.items.length, max: marketService.MARKET_STALL_MAX_ITEMS })}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 2 }}><Clock size={9} /> {DURATION_LABEL[myStall.durationHours]}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button className="rpg-action" style={{ ...styles.tinyBtn, background: "#5FA8A0", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }} onClick={() => openPicker("item")}>
                    <Plus size={12} /> {t("market.addItemBtn")}
                  </button>
                  <button className="rpg-action" style={{ ...styles.tinyBtn, background: "#D4AF6A", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }} onClick={() => openPicker("chest")}>
                    <Plus size={12} /> {t("market.addChestBtn")}
                  </button>
                  <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "#E8A5AF" }} onClick={() => setCloseConfirm(true)}>
                    {t("market.closeStallBtn")}
                  </button>
                </div>
              </div>

              {pickerOpen && (
                <div style={styles.pickerCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
                      {pickedItem ? t("market.pickerSetPrice") : pickerMode === "chest" ? t("market.pickerChooseChest") : t("market.pickerChooseItem")}
                    </span>
                    <button onClick={() => setPickerOpen(false)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer" }}>
                      <X size={14} />
                    </button>
                  </div>
                  {!pickedItem ? (
                    (pickerMode === "chest" ? sellableChests : sellableItems).length === 0 ? (
                      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                        {pickerMode === "chest" ? t("market.noChestsToAdd") : t("market.noItemsToAdd")}
                      </div>
                    ) : (
                      (pickerMode === "chest" ? sellableChests : sellableItems).map((item) => (
                        <button key={item.id} style={styles.pickerRow} onClick={() => pickItem(item)}>
                          <ItemIcon item={item} size={20} color={itemTierColor(item.tier)} strokeWidth={1.6} />
                          <span style={{ flex: 1, fontSize: 12 }}>{displayItemName(item, lang)}</span>
                          <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{tierName(lang, item.tier)} · {itemStatLabel(item)}</span>
                        </button>
                      ))
                    )
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ItemIcon item={pickedItem} size={26} color={itemTierColor(pickedItem.tier)} strokeWidth={1.6} />
                        <span style={{ fontSize: 12 }}>{displayItemName(pickedItem, lang)}</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        placeholder={t("market.pricePlaceholder")}
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        style={styles.numInput}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setPickedItem(null)}>{t("market.backBtn")}</button>
                        <button className="rpg-action" style={styles.tinyBtn} onClick={confirmAddToStall}>{t("market.addToStallBtn")}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {myStall.items.length === 0 ? (
                <EmptyState icon={Package2} title={t("market.stallEmptyTitle")} subtitle={t("market.stallEmptySubtitle")} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {myStall.items.map((entry) => (
                    <div key={entry.id} className="rpg-row" style={{ ...styles.itemRow, borderColor: `${itemTierColor(entry.item.tier)}44` }}>
                      <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }} onClick={() => setInspectEntry({ ...entry, source: "mine" })}>
                        <ItemIcon item={entry.item} size={24} color={itemTierColor(entry.item.tier)} strokeWidth={1.6} />
                      </button>
                      <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setInspectEntry({ ...entry, source: "mine" })}>
                        <div style={{ fontSize: 13 }}>{displayItemName(entry.item, lang)}</div>
                        <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{tierName(lang, entry.item.tier)} · {itemStatLabel(entry.item)}</div>
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--gold-text)" }}>{formatGold(entry.price)}g</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {myStall && !myStall.active && (
            <div className="rpg-card" style={{ ...styles.itemDetailCard, marginBottom: 12, borderColor: "#E8A5AF66", background: "#E8A5AF0d" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={16} color="#E8A5AF" strokeWidth={1.6} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "#E8A5AF" }}>{t("market.stallExpiredTitle")}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{t("market.stallExpiredDesc", { count: myStall.items.length })}</div>
                </div>
              </div>
              <button className="rpg-action" style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, background: "#E8A5AF", color: "#15171E" }} onClick={reclaimStall}>
                {t("market.reclaimBtn")}
              </button>
            </div>
          )}

          <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 14, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>{t("market.otherStallsHeader")}</div>
          {!loading && npcStalls.length === 0 ? (
            <EmptyState icon={Store} title={t("market.marketQuietTitle")} subtitle={t("market.marketQuietSubtitle")} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {npcStalls.map((stall) => {
                const expanded = expandedSeller === stall.sellerName;
                return (
                  <div key={stall.sellerName} className="rpg-card" style={{ ...styles.itemDetailCard, padding: 0, overflow: "hidden" }}>
                    <button
                      style={{ width: "100%", background: "none", border: "none", padding: 12, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text-primary)" }}
                      onClick={() => setExpandedSeller(expanded ? null : stall.sellerName)}
                    >
                      <MenuEmblem name="market" size={32}/>
                      <span style={{ flex: 1, fontSize: 13, textAlign: "left" }}>
                        {t("market.stallTitleFor", { name: lang === "tr" ? possessiveName(stall.sellerName) : stall.sellerName })}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{t("market.itemCountLabel", { count: stall.items.length })}</span>
                      {expanded ? <ChevronUp size={14} color="var(--text-faint)" /> : <ChevronDown size={14} color="var(--text-faint)" />}
                    </button>
                    {expanded && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 10px 10px" }}>
                        {stall.items.map((l) => (
                          <div key={l.id} className="rpg-row" style={{ ...styles.itemRow, borderColor: `${itemTierColor(l.item.tier)}44`, flexWrap: "wrap" }}>
                            <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }} onClick={() => setInspectEntry({ ...l, source: "npc" })}>
                              <ItemIcon item={l.item} size={18} color={itemTierColor(l.item.tier)} strokeWidth={1.6} />
                            </button>
                            <div style={{ flex: 1, minWidth: 110, cursor: "pointer" }} onClick={() => setInspectEntry({ ...l, source: "npc" })}>
                              <div style={{ fontSize: 13 }}>{displayItemName(l.item, lang)}</div>
                              <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{tierName(lang, l.item.tier)} · {itemStatLabel(l.item)}</div>
                            </div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--gold-text)", marginRight: 8 }}>{formatGold(l.price)}g</div>
                            <button className="rpg-action" style={styles.tinyBtn} onClick={() => requestBuy(l)}>{t("market.buyShort")}</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {upgradeConfirmStep > 0 && (
        // position:fixed (not the shared modalOverlay's absolute) so this
        // stays centered in the viewport regardless of how far the Özel
        // Market list is scrolled when the confirmation triggers — Apex's
        // card sits below Mythic's, so this reliably fires mid-scroll.
        <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setUpgradeConfirmStep(0)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <Crown size={32} color={PREMIUM_TIERS.mythic.color} strokeWidth={1.4} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 220 }}>
              {upgradeConfirmStep === 1
                ? t("shop.upgradeConfirmStep1")
                : t("shop.upgradeConfirmStep2")}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }}
                onClick={() => (upgradeConfirmStep === 1 ? resolveUpgradeStep1(false) : resolveUpgradeStep2(false))}
              >
                {t("shop.no")}
              </button>
              <button
                className="rpg-action" style={{ ...styles.tinyBtn, background: PREMIUM_TIERS.mythic.color, color: "#0B0C10" }}
                onClick={() => (upgradeConfirmStep === 1 ? resolveUpgradeStep1(true) : resolveUpgradeStep2(true))}
              >
                {t("shop.yes")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kullanıcı isteği: "Pazardaki eşyaların üstüne bir kere tıklandığı
          zaman eşyanın özelliğini gösteren bir widget açılsın." —
          InventoryTab'daki itemSheetOverlay/ItemTooltip düzeniyle aynı. */}
      {inspectEntry && (
        <div style={styles.itemSheetOverlay} onClick={() => setInspectEntry(null)}>
          <div style={styles.itemSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.itemSheetHandle} />
            <ItemTooltip item={inspectEntry.item} player={player} />
            <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--gold-text)" }}>{formatGold(inspectEntry.price)}g</div>
              <div style={{ flex: 1 }} />
              {inspectEntry.source === "npc" && (
                <button className="rpg-action" style={styles.tinyBtn} onClick={() => { setInspectEntry(null); requestBuy(inspectEntry); }}>
                  {t("market.buyShort")}
                </button>
              )}
              <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)" }} onClick={() => setInspectEntry(null)}>
                <X size={11} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kullanıcı isteği: "Pazardan eşya alıyorken Almak istediğine emin
          misin tarzında bir cümle ile onay istensin." */}
      {buyConfirm && (
        <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setBuyConfirm(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <ShoppingBag size={32} color="var(--gold-text)" strokeWidth={1.4} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 240 }}>
              {t("market.buyConfirmText", { item: displayItemName(buyConfirm.item, lang), gold: formatGold(buyConfirm.price) })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setBuyConfirm(null)}>
                {t("market.cancelBtn")}
              </button>
              <button className="rpg-action" style={{ ...styles.tinyBtn, background: "#D4AF6A", color: "#15171E" }} onClick={confirmBuy}>
                {t("market.confirmBuyBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kullanıcı isteği: "Pazarı kurduktan sonra pazarı bozarsa kullanıcı
          uyarı çıkacak goldunun iade edilmediğini bilecek." */}
      {closeConfirm && (
        <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setCloseConfirm(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <AlertTriangle size={32} color="#E8A5AF" strokeWidth={1.4} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 240 }}>
              {t("market.closeConfirmTitle")}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)", textAlign: "center", maxWidth: 240 }}>
              {t("market.closeConfirmDesc")}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setCloseConfirm(false)}>
                {t("market.cancelBtn")}
              </button>
              <button className="rpg-action" style={{ ...styles.tinyBtn, background: "#E8A5AF", color: "#15171E" }} onClick={confirmCloseStall}>
                {t("market.confirmCloseBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
