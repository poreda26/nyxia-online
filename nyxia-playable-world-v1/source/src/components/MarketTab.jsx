import { useState, useEffect, useCallback } from "react";
import { FlaskConical, Store, Tag, Plus, Minus, X, Gem, ScrollText, Crown, Check, Star, Shuffle } from "lucide-react";
import { itemTierColor } from "../data/itemRarity";
import { displayItemName } from "../utils/player";
import { itemStatLabel } from "../utils/itemDisplay";
import { addItemToInventory, makePotionStack, makeRaceScroll, makeJobScroll, makeBonusScrollStack } from "../utils/inventory";
import { HP_POTION_TIERS, MP_POTION_TIERS, potionName, potionPrice } from "../data/potions";
import { PREMIUM_TIERS } from "../data/premium";
import { activePremiumTier, premiumDaysLeft, buyPremium } from "../utils/premium";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import EmptyState from "./shared/EmptyState";
import ItemIcon from "./ItemIcon";
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

export default function MarketTab({ player, setPlayer, bank, setBank, pushToast }) {
  const [subtab, setSubtab] = useState("market");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState("item"); // "item" | "chest" — hangi havuzdan (çanta ya da sandıklar) seçildiğini belirler
  const [pickedItem, setPickedItem] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  // 0 = no dialog, 1 = "yükseltmek ister misiniz?", 2 = "Mythic alınsın mı?" —
  // the only path that ever reaches this is Apex -> Mythic (see
  // handlePremiumClick). Every other combination is either a direct
  // purchase or an outright block, no confirmation needed.
  const [upgradeConfirmStep, setUpgradeConfirmStep] = useState(0);
  // Pot alım adedi — kullanıcı isteği: "+/- ikonları olsun sayıyı arttırıp
  // kaç tane almak istersek ayarlayabilelim... sayıyı elle yazabilsin."
  // Anahtar `${potionType}:${tier}`, her satırın kendi adedi.
  const [potionQty, setPotionQty] = useState({});
  const qtyFor = (key) => potionQty[key] ?? 1;
  const setQty = (key, value) => setPotionQty((q) => ({ ...q, [key]: Math.max(1, Math.min(999, value)) }));

  // fetchListings/resolveMyListings are async (Promise-returning) even
  // though the "server" is local for now — see services/marketService.js.
  const refreshListings = useCallback(async () => {
    setLoading(true);
    const sold = await marketService.resolveMyListings();
    if (sold.length > 0) {
      setPlayer((p) => ({ ...p, gold: p.gold + sold.reduce((sum, l) => sum + l.price, 0) }));
      sold.forEach((l) => pushToast(`İlanın satıldı: ${l.item.name} → +${l.price} altın`, "loot"));
    }
    const fresh = await marketService.fetchListings();
    setListings(fresh);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { refreshListings(); }, [refreshListings]);

  const purchasePremium = (tierId) => {
    const result = buyPremium(player, tierId, bank);
    if (!result.bought) { pushToast(result.reason || "Satın alınamadı.", "warn"); return; }
    setPlayer(result.player);
    setBank(result.bank);
    pushToast(`${PREMIUM_TIERS[tierId].name} etkinleştirildi!`, "loot");
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
      pushToast("Zaten Premium Mevcut.", "warn");
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
    if (player.diamonds < BONUS_SCROLL_PRICE) { pushToast("Yeterli elmasın yok.", "warn"); return; }
    const result = addItemToInventory({ ...player, diamonds: player.diamonds - BONUS_SCROLL_PRICE }, makeBonusScrollStack());
    if (!result.added) { pushToast(`Satın alınamadı — ${result.reason}`, "warn"); return; }
    setPlayer(result.player);
    pushToast("Bonus Parşömen satın alındı.", "loot");
  };

  const buyRaceScroll = () => {
    if (player.diamonds < RACE_SCROLL_PRICE) { pushToast("Yeterli elmasın yok.", "warn"); return; }
    const result = addItemToInventory({ ...player, diamonds: player.diamonds - RACE_SCROLL_PRICE }, makeRaceScroll(1));
    if (!result.added) { pushToast(`Satın alınamadı — ${result.reason}`, "warn"); return; }
    setPlayer(result.player);
    pushToast("Irk Değiştirme Parşömeni satın alındı.", "loot");
  };

  const buyJobScroll = () => {
    if (player.diamonds < JOB_SCROLL_PRICE) { pushToast("Yeterli elmasın yok.", "warn"); return; }
    const result = addItemToInventory({ ...player, diamonds: player.diamonds - JOB_SCROLL_PRICE }, makeJobScroll(1));
    if (!result.added) { pushToast(`Satın alınamadı — ${result.reason}`, "warn"); return; }
    setPlayer(result.player);
    pushToast("Job Değiştirme Kağıdı satın alındı.", "loot");
  };

  const buyPotion = (potionType, tier, qty) => {
    const amount = Math.max(1, qty || 1);
    const price = potionPrice(potionType, tier) * amount;
    if (player.gold < price) { pushToast("Yeterli altının yok.", "warn"); return; }
    const result = addItemToInventory({ ...player, gold: player.gold - price }, makePotionStack(potionType, tier, amount));
    if (!result.added) { pushToast(`Satın alınamadı — ${result.reason}`, "warn"); return; }
    setPlayer(result.player);
    pushToast(`${potionName(potionType, tier)} x${amount} satın alındı (-${price}g).`, "loot");
  };

  const buyListing = async (listing) => {
    if (player.gold < listing.price) { pushToast("Yeterli altının yok.", "warn"); return; }
    const result = await marketService.buyListing(listing.id);
    if (!result.ok) { pushToast(result.reason || "Satın alınamadı.", "warn"); refreshListings(); return; }
    // Sandık ilanları çantaya değil player.chests'e gider — inventory'deki
    // gerçek eşyalardan yapısal olarak ayrı bir liste (bkz. sellableChests,
    // confirmListing'in "chest" dalı).
    if (result.listing.item.kind === "chest") {
      setPlayer((p) => ({ ...p, gold: p.gold - listing.price, chests: [...p.chests, { id: result.listing.item.id, tier: result.listing.item.tier, special: result.listing.item.special }] }));
    } else {
      const addResult = addItemToInventory({ ...player, gold: player.gold - listing.price }, result.listing.item);
      if (!addResult.added) { pushToast(`Satın alındı ama çantana sığmadı — ${addResult.reason}`, "warn"); }
      setPlayer(addResult.player);
    }
    setListings((ls) => ls.filter((l) => l.id !== listing.id));
    pushToast(`${result.listing.item.name} satın alındı.`, "loot");
  };

  const cancelListing = async (listing) => {
    const cancelled = await marketService.cancelListing(listing.id);
    if (!cancelled) { pushToast("İlan zaten kaldırılmış.", "warn"); refreshListings(); return; }
    if (cancelled.item.kind === "chest") {
      setPlayer((p) => ({ ...p, chests: [...p.chests, { id: cancelled.item.id, tier: cancelled.item.tier, special: cancelled.item.special }] }));
      pushToast("İlan iptal edildi, sandık geri döndü.", "default");
    } else {
      const addResult = addItemToInventory(player, cancelled.item);
      setPlayer(addResult.player);
      if (!addResult.added) pushToast(`İlan iptal edildi ama ${addResult.reason}`, "warn");
      else pushToast("İlan iptal edildi, eşya çantana döndü.", "default");
    }
    setListings((ls) => ls.filter((l) => l.id !== listing.id));
  };

  const sellableItems = player.inventory.filter((i) => i.kind === "armor" || i.kind === "weapon" || i.kind === "accessory");
  // Sandıklar player.chests'te yaşıyor, player.inventory'de değil (bkz.
  // InventoryTab'ın ayrı "Sandıklar" alt sekmesi) — ilan için de ayrı bir
  // havuz olarak sunuluyor, kullanıcı isteği: "Pazar bölümümüzde sandık
  // satışımız yok."
  const sellableChests = player.chests.map((c) => ({
    id: c.id, kind: "chest", tier: c.tier, special: c.special,
    name: c.special ? "Özel Etkinlik Sandığı" : `T${c.tier} Sandık`,
  }));

  const openPicker = (mode) => { setPickerOpen(true); setPickerMode(mode); setPickedItem(null); setPriceInput(""); };
  const pickItem = (item) => { setPickedItem(item); setPriceInput(""); };

  const confirmListing = async () => {
    const price = parseInt(priceInput, 10);
    if (!pickedItem) return;
    if (!Number.isFinite(price) || price <= 0) { pushToast("Geçerli bir fiyat gir.", "warn"); return; }
    const fee = marketService.listingFeeFor(price);
    if (player.gold < fee) { pushToast(`İlan ücretini (${fee}g) karşılayacak altının yok.`, "warn"); return; }
    if (pickerMode === "chest") {
      setPlayer((p) => ({ ...p, gold: p.gold - fee, chests: p.chests.filter((c) => c.id !== pickedItem.id) }));
    } else {
      setPlayer((p) => ({ ...p, gold: p.gold - fee, inventory: p.inventory.filter((i) => i.id !== pickedItem.id) }));
    }
    const listing = await marketService.createListing(pickedItem, price);
    setListings((ls) => [listing, ...ls]);
    pushToast(`İlan yayınlandı: ${pickedItem.name} — ${price}g (-${fee}g ilan ücreti)`, "loot");
    setPickerOpen(false);
    setPickedItem(null);
    setPriceInput("");
  };

  const myListings = listings.filter((l) => l.sellerId === "me");
  const otherListings = listings.filter((l) => l.sellerId !== "me");

  return (
    <div style={styles.panelScroll}>
      <div style={styles.subtabRow}>
        <button onClick={() => setSubtab("market")} style={{ ...styles.subtabBtn, ...(subtab === "market" ? styles.subtabBtnActive : {}) }}>
          Pazar {myListings.length > 0 && `(${myListings.length})`}
        </button>
        <button onClick={() => setSubtab("shop")} style={{ ...styles.subtabBtn, ...(subtab === "shop" ? styles.subtabBtnActive : {}) }}>
          Dükkan
        </button>
        <button onClick={() => setSubtab("special")} style={{ ...styles.subtabBtn, ...(subtab === "special" ? styles.subtabBtnActive : {}) }}>
          Özel Market
        </button>
      </div>

      {subtab === "special" && (
        <>
          <SectionLabel>Özel Market</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: -6, marginBottom: 12 }}>
            <Gem size={13} color="#8B6FC9" />
            <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#8B6FC9" }}>{player.diamonds} Elmas</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: -4, marginBottom: 12 }}>
            Elmas altından ayrı, özel bir para birimi. Şu an için sadece etkinlik/GM ödülü olarak kazanılıyor.
          </p>

          <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Premium</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {Object.values(PREMIUM_TIERS).map((tier) => {
              const active = activePremiumTier(player);
              const isThisActive = active?.id === tier.id;
              const daysLeft = isThisActive ? premiumDaysLeft(player) : 0;
              return (
                <div key={tier.id} style={{ ...styles.itemDetailCard, borderColor: `${tier.color}66`, background: `${tier.color}0d` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Crown size={18} color={tier.color} strokeWidth={1.6} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: tier.color }}>{tier.name}</div>
                      <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{tier.durationDays} gün</div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: tier.color, display: "flex", alignItems: "center", gap: 3 }}>
                      <Gem size={12} /> {tier.price}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                    {tier.perks.map((perk) => (
                      <div key={perk} style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                        <Check size={11} color={tier.color} /> {perk}
                      </div>
                    ))}
                  </div>
                  <button
                    style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, background: tier.color, color: "#0B0C10" }}
                    onClick={() => handlePremiumClick(tier.id)}
                  >
                    {isThisActive ? `Aktif — ${daysLeft} gün kaldı` : "Satın Al"}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Parşömenler</div>
          <div style={{ ...styles.itemRow, borderColor: "#8B6FC955" }}>
            <ScrollText size={18} color="#8B6FC9" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>Irk Değiştirme Parşömeni</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>Kullanınca hesabının ırkını kalıcı olarak değiştirir.</div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#8B6FC9", marginRight: 8, display: "flex", alignItems: "center", gap: 3 }}>
              <Gem size={11} /> {RACE_SCROLL_PRICE}
            </div>
            <button style={styles.tinyBtn} onClick={buyRaceScroll}>Al</button>
          </div>
          <div style={{ ...styles.itemRow, borderColor: "#5FA8A055", marginTop: 8 }}>
            <Shuffle size={18} color="#5FA8A0" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>Job Değiştirme Kağıdı</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                Kullanınca karakterinin sınıfını kalıcı olarak değiştirir. Hiçbir eşya kuşanılmıyorken ve bir klana üye değilken kullanılabilir.
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#5FA8A0", marginRight: 8, display: "flex", alignItems: "center", gap: 3 }}>
              <Gem size={11} /> {JOB_SCROLL_PRICE}
            </div>
            <button style={styles.tinyBtn} onClick={buyJobScroll}>Al</button>
          </div>
          <div style={{ ...styles.itemRow, borderColor: "#D4AF6A55", marginTop: 8 }}>
            <Star size={18} color="#D4AF6A" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>Bonus Parşömen</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                Silah ve zırh yükseltmesinde kullanılan bir eşya. Bu, eşyanın yok olmayacağının garantisi değildir. Sadece yükseltme şansını artırır.
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#D4AF6A", marginRight: 8, display: "flex", alignItems: "center", gap: 3 }}>
              <Gem size={11} /> {BONUS_SCROLL_PRICE}
            </div>
            <button style={styles.tinyBtn} onClick={buyBonusScroll}>Al</button>
          </div>
        </>
      )}

      {subtab === "shop" && (
        <>
          <SectionLabel>Can İksirleri</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {HP_POTION_TIERS.map((amount, i) => {
              const tier = i + 1;
              const key = `hp:${tier}`;
              const qty = qtyFor(key);
              return (
                <div key={tier} style={{ ...styles.itemRow, borderColor: "#C9425A44", flexWrap: "wrap" }}>
                  <FlaskConical size={18} color="#C9425A" />
                  <div style={{ flex: 1, minWidth: 90 }}>
                    <div style={{ fontSize: 13 }}>{potionName("hp", tier)}</div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)" }}>+{amount} can yeniler</div>
                  </div>
                  <PotionQtyStepper qty={qty} onChange={(v) => setQty(key, v)} />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#D4AF6A", marginRight: 8 }}>{potionPrice("hp", tier) * qty}g</div>
                  <button style={styles.tinyBtn} onClick={() => buyPotion("hp", tier, qty)}>Al</button>
                </div>
              );
            })}
          </div>

          <SectionLabel>Mana İksirleri</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MP_POTION_TIERS.map((amount, i) => {
              const tier = i + 1;
              const key = `mp:${tier}`;
              const qty = qtyFor(key);
              return (
                <div key={tier} style={{ ...styles.itemRow, borderColor: "#4FC3D944", flexWrap: "wrap" }}>
                  <FlaskConical size={18} color="#4FC3D9" />
                  <div style={{ flex: 1, minWidth: 90 }}>
                    <div style={{ fontSize: 13 }}>{potionName("mp", tier)}</div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)" }}>+{amount} mana yeniler</div>
                  </div>
                  <PotionQtyStepper qty={qty} onChange={(v) => setQty(key, v)} />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#D4AF6A", marginRight: 8 }}>{potionPrice("mp", tier) * qty}g</div>
                  <button style={styles.tinyBtn} onClick={() => buyPotion("mp", tier, qty)}>Al</button>
                </div>
              );
            })}
          </div>
          <div style={styles.dropInfoRow}>
            <span>Sandıklar artık dükkanda satılmıyor — sadece canavarlardan düşük ihtimalle düşer.</span>
          </div>
        </>
      )}

      {subtab === "market" && (
        <>
          <SectionLabel>Oyuncu Pazarı</SectionLabel>
          <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: -4, marginBottom: 12 }}>
            Çantandaki bir eşyayı istediğin fiyata ilana çıkar, diğer oyuncular incelesin.
            Diğer oyuncuların ilanlarından da istediğini satın alabilirsin.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button style={{ ...styles.smallBtn, background: "#5FA8A0", flex: 1 }} onClick={() => openPicker("item")}>
              <Plus size={14} /> Eşya İlanı Ver
            </button>
            <button style={{ ...styles.smallBtn, background: "#D4AF6A", flex: 1 }} onClick={() => openPicker("chest")}>
              <Plus size={14} /> Sandık İlanı Ver
            </button>
          </div>

          {pickerOpen && (
            <div style={styles.pickerCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
                  {pickedItem ? "Fiyat belirle" : pickerMode === "chest" ? "Satılacak sandığı seç" : "Satılacak eşyayı seç"}
                </span>
                <button onClick={() => setPickerOpen(false)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer" }}>
                  <X size={14} />
                </button>
              </div>
              {!pickedItem ? (
                (pickerMode === "chest" ? sellableChests : sellableItems).length === 0 ? (
                  <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                    {pickerMode === "chest" ? "Satılabilecek sandığın yok." : "Çantanda satılabilecek eşya yok."}
                  </div>
                ) : (
                  (pickerMode === "chest" ? sellableChests : sellableItems).map((item) => (
                    <button key={item.id} style={styles.pickerRow} onClick={() => pickItem(item)}>
                      <ItemIcon item={item} size={20} color={itemTierColor(item.tier)} strokeWidth={1.6} />
                      <span style={{ flex: 1, fontSize: 12 }}>{displayItemName(item)}</span>
                      <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>T{item.tier} · {itemStatLabel(item)}</span>
                    </button>
                  ))
                )
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ItemIcon item={pickedItem} size={26} color={itemTierColor(pickedItem.tier)} strokeWidth={1.6} />
                    <span style={{ fontSize: 12 }}>{displayItemName(pickedItem)}</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Fiyat (altın)"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    style={styles.numInput}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setPickedItem(null)}>Geri</button>
                    <button style={styles.tinyBtn} onClick={confirmListing}>İlanı Yayınla</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {myListings.length > 0 && (
            <>
              <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 14, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Benim ilanlarım</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {myListings.map((l) => (
                  <div key={l.id} style={{ ...styles.itemRow, borderColor: `${itemTierColor(l.item.tier)}44` }}>
                    <ItemIcon item={l.item} size={24} color={itemTierColor(l.item.tier)} strokeWidth={1.6} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13 }}>{displayItemName(l.item)}</div>
                      <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>T{l.item.tier} · {itemStatLabel(l.item)}</div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#D4AF6A", marginRight: 8 }}>{l.price}g</div>
                    <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => cancelListing(l)}>İptal Et</button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 14, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Diğer oyuncular</div>
          {!loading && otherListings.length === 0 ? (
            <EmptyState icon={Store} title="Pazar sessiz" subtitle="Şu anda başka ilan yok. Sonra tekrar bak." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {otherListings.map((l) => (
                <div key={l.id} style={{ ...styles.itemRow, borderColor: `${itemTierColor(l.item.tier)}44`, flexWrap: "wrap" }}>
                  <ItemIcon item={l.item} size={18} color={itemTierColor(l.item.tier)} strokeWidth={1.6} />
                  <div style={{ flex: 1, minWidth: 110 }}>
                    <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                      {displayItemName(l.item)}
                      <span style={{ fontSize: 9, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 2 }}>
                        <Tag size={9} /> {l.sellerName}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>T{l.item.tier} · {itemStatLabel(l.item)}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#D4AF6A", marginRight: 8 }}>{l.price}g</div>
                  <button style={styles.tinyBtn} onClick={() => buyListing(l)}>Al</button>
                </div>
              ))}
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
                ? "Zaten bir premium mevcut. Premiumunuzu yükseltmek ister misiniz?"
                : "Mythic Premium alınsın mı?"}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }}
                onClick={() => (upgradeConfirmStep === 1 ? resolveUpgradeStep1(false) : resolveUpgradeStep2(false))}
              >
                Hayır
              </button>
              <button
                style={{ ...styles.tinyBtn, background: PREMIUM_TIERS.mythic.color, color: "#0B0C10" }}
                onClick={() => (upgradeConfirmStep === 1 ? resolveUpgradeStep1(true) : resolveUpgradeStep2(true))}
              >
                Evet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
