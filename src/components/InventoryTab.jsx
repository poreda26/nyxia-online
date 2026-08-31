import { useState } from "react";
import { Package, Gift, Sparkles, Ban, Wrench, Archive, ArrowUpFromLine, X, ListChecks, Coins } from "lucide-react";
import { itemTierColor } from "../data/itemRarity";
import { RACES } from "../data/races";
import { CLASSES } from "../data/classes";
import { rollLoot, rollSpecialChestLoot } from "../utils/loot";
import {
  equipItem, sellPrice, displayItemName, clampPlayerHp, discountedRepairCost, repairItem, canChangeJob, changeJob,
  totalEquippedRepairCost, repairAllEquipped,
} from "../utils/player";
import { isConsumable } from "../utils/itemDisplay";
import { BAG_SLOTS, addItemToInventory, depositToBank, withdrawFromBank } from "../utils/inventory";
import { usePotion } from "../utils/potions";
import { learnFreeSkills } from "../utils/skills";
import { premiumSellMultiplier, premiumRepairDiscount } from "../utils/premium";
import { styles } from "../styles";
import SectionLabel from "./shared/SectionLabel";
import EmptyState from "./shared/EmptyState";
import ItemTooltip from "./ItemTooltip";
import ChestModal from "./ChestModal";
import BulkChestModal from "./BulkChestModal";
import Paperdoll from "./Paperdoll";
import BagGrid from "./BagGrid";
import BankGrid from "./BankGrid";

export default function InventoryTab({ player, setPlayer, bank, setBank, pushToast, onChangeRace }) {
  const [openingChest, setOpeningChest] = useState(null); // {chest, phase, result}
  const [bulkChestResult, setBulkChestResult] = useState(null); // {items, failed} | null
  const [subtab, setSubtab] = useState("armor");
  const [selectedId, setSelectedId] = useState(null);
  const [bankPage, setBankPage] = useState(0);
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
    pushToast(moved > 0 ? `${moved} eşya depoya taşındı.` : "Depo sayfası dolu, hiçbiri taşınamadı.", moved > 0 ? "default" : "warn");
    setBulkSelected(new Set());
    setBulkMode(false);
  };

  const bulkSell = () => {
    // Pot/parşömen gibi tüketilebilirlerin satış değeri zaten 0 (bkz.
    // sellPrice) — yanlışlıkla değerli bir parşömeni "0 altına" satıp
    // kaybetmesin diye toplu satıştan bilerek dışlanıyorlar, tıpkı tekli
    // "Sat" düğmesinin zaten yaptığı gibi.
    const sellable = bulkItems.filter((i) => !isConsumable(i) && !i.noTrade);
    if (sellable.length === 0) { pushToast("Seçilenler arasında satılabilir eşya yok.", "warn"); return; }
    const total = sellable.reduce((sum, i) => sum + Math.round(sellPrice(i) * premiumSellMultiplier(player)), 0);
    const soldIds = new Set(sellable.map((i) => i.id));
    setPlayer((p) => ({ ...p, gold: p.gold + total, inventory: p.inventory.filter((i) => !soldIds.has(i.id)) }));
    pushToast(`${sellable.length} eşya satıldı: +${total} altın`, "loot");
    setBulkSelected(new Set());
    setBulkMode(false);
  };

  const equip = (item) => {
    const result = equipItem(player, item);
    if (result.blocked) { pushToast(result.blocked, "warn"); return; }
    setPlayer(result.player);
    pushToast(`${displayItemName(item)} kuşanıldı.`, "default");
    setSelectedId(null);
  };

  const unequip = (slotKey) => {
    setPlayer((p) => {
      const item = p.equipped[slotKey];
      if (!item) return p;
      const next = { ...p, equipped: { ...p.equipped, [slotKey]: null }, inventory: [...p.inventory, item] };
      return clampPlayerHp(next);
    });
  };

  const sellItem = (item) => {
    const price = Math.round(sellPrice(item) * premiumSellMultiplier(player));
    setPlayer((p) => ({ ...p, gold: p.gold + price, inventory: p.inventory.filter((i) => i.id !== item.id) }));
    pushToast(`Satıldı: +${price} altın`, "loot");
    setSelectedId(null);
  };

  const repair = (item) => {
    const result = repairItem(player, item, premiumRepairDiscount(player), bank);
    if (!result.repaired) { pushToast(result.reason || "Tamir edilemedi.", "warn"); return; }
    setPlayer(result.player);
    if (result.bank) setBank(result.bank);
    pushToast(`Tamir edildi: -${result.cost} altın`, "default");
  };

  const depositItem = (item) => {
    const result = depositToBank(player, item, bank, bankPage);
    if (!result.moved) { pushToast(result.reason || "Depoya taşınamadı.", "warn"); return; }
    setPlayer(result.player);
    setBank(result.bank);
    pushToast(`${displayItemName(item)} depoya kondu.`, "default");
    setSelectedId(null);
  };

  const withdrawItem = (item) => {
    const result = withdrawFromBank(player, item, bank, bankPage);
    if (!result.moved) { pushToast(result.reason || "Çantaya alınamadı.", "warn"); return; }
    setPlayer(result.player);
    setBank(result.bank);
    pushToast(`${displayItemName(item)} çantaya alındı.`, "default");
    setSelectedId(null);
  };

  const useRaceScroll = (item, newRace) => {
    if (!onChangeRace) return;
    if (player.clan) { pushToast("Bir klana üyeyken ırk değiştiremezsin.", "warn"); return; }
    const inventory = (item.count || 1) <= 1
      ? player.inventory.filter((i) => i.id !== item.id)
      : player.inventory.map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i));
    setPlayer((p) => ({ ...p, inventory }));
    onChangeRace(newRace);
    pushToast(`Irkın değişti: ${RACES[newRace].name}`, "default");
    setSelectedId(null);
  };

  const useJobScroll = (item, newClass) => {
    const check = canChangeJob(player);
    if (!check.ok) { pushToast(check.reason, "warn"); return; }
    const inventory = (item.count || 1) <= 1
      ? player.inventory.filter((i) => i.id !== item.id)
      : player.inventory.map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i));
    setPlayer((p) => learnFreeSkills(changeJob({ ...p, inventory }, newClass)));
    pushToast(`Sınıfın değişti: ${CLASSES[newClass].name}`, "default");
    setSelectedId(null);
  };

  const handleUsePotion = (item) => {
    const result = usePotion(player, item.potionType, item.tier);
    if (result.reason) { pushToast(result.reason, "warn"); return; }
    pushToast(item.potionType === "hp" ? `+${result.healed} can` : `+${result.healed} mana`, "heal");
    setPlayer(result.player);
    if ((item.count || 1) <= 1) setSelectedId(null);
  };

  const openChest = (chest) => {
    setOpeningChest({ chest, phase: "shaking", result: null });
    setTimeout(() => {
      const item = chest.special ? rollSpecialChestLoot(player.class) : rollLoot(chest.tier, player.class);
      const afterChestRemoved = { ...player, chests: player.chests.filter((c) => c.id !== chest.id) };
      // Katalog eşya-eşya yeniden dolduruluyor — bu tier/sınıf için henüz
      // hiçbir eşya yoksa item null gelir, sandığı yine de boşalt ama
      // hiçbir şey eklemeye çalışma.
      if (!item) {
        setPlayer(afterChestRemoved);
        setOpeningChest({ chest, phase: "reveal", result: null });
        return;
      }
      const addResult = addItemToInventory(afterChestRemoved, item);
      setPlayer(addResult.added ? { ...addResult.player, hasNewItemNotice: true } : addResult.player);
      setOpeningChest({ chest, phase: "reveal", result: item });
      if (!addResult.added) pushToast(`${item.name} kazanıldı ama ${addResult.reason}`, "warn");
    }, 950);
  };

  const closeChestModal = () => setOpeningChest(null);

  // Toplu kutu açma — kullanıcı isteği: "elimizde fazla kutu olduğu zaman
  // açmak problem olabiliyor." Tek tek açmanın shake/reveal animasyonunu
  // (bkz. openChest) onlarca kutu için tekrarlamak pratik değil, o yüzden
  // hepsi anında (animasyonsuz) çözülüp tek bir özet listesi gösteriliyor.
  const openAllChests = () => {
    if (player.chests.length === 0) return;
    let p = player;
    const gained = [];
    let failed = 0;
    for (const chest of p.chests) {
      const item = chest.special ? rollSpecialChestLoot(p.class) : rollLoot(chest.tier, p.class);
      if (!item) continue;
      const addResult = addItemToInventory(p, item);
      p = addResult.player;
      if (addResult.added) gained.push(item); else failed++;
    }
    p = { ...p, chests: [] };
    if (gained.length > 0) p.hasNewItemNotice = true;
    setPlayer(p);
    setBulkChestResult({ items: gained, failed });
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
    if (!result.repaired) { pushToast(result.reason || "Tamir edilecek bir şey yok.", "warn"); return; }
    setPlayer(result.player);
    pushToast(`Tüm kuşanılmış eşyalar tamir edildi: -${result.cost} altın`, "default");
  };

  const cls = CLASSES[player.class];

  return (
    <div style={styles.panelScroll}>
      <SectionLabel>Kuşanılmış</SectionLabel>
      <Paperdoll player={player} cls={cls} onSlotClick={(slotKey, item) => item && unequip(slotKey)} />

      {/* Kullanıcı isteği: "Eşyaları çıkarmadan rot tamir yapılamıyor" —
          repairItem zaten kuşanılı eşyayı yerinde yamıyordu, eksik olan
          sadece çıkarmadan ulaşan bir yoldu. */}
      <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 10, textAlign: "center" }}>
        Kuşanılı eşyaların toplam tamir ücreti: {totalRepairAll}g
      </div>
      <button
        style={{
          ...styles.tinyBtn, width: "100%", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          ...(totalRepairAll > 0 ? { background: "#D4AF6A", color: "#15171E" } : { background: "var(--bg-panel-alt)", color: "var(--text-faint)" }),
        }}
        disabled={totalRepairAll <= 0}
        onClick={repairAll}
      >
        <Wrench size={12} /> Kuşanılmışları Tamir Et
      </button>

      <div style={styles.subtabRow}>
        <button onClick={() => { setSubtab("armor"); setSelectedId(null); }} style={{ ...styles.subtabBtn, ...(subtab === "armor" ? styles.subtabBtnActive : {}) }}>
          Çanta ({bagSlotsFilled}/{BAG_SLOTS})
        </button>
        <button onClick={() => { setSubtab("bank"); setSelectedId(null); }} style={{ ...styles.subtabBtn, ...(subtab === "bank" ? styles.subtabBtnActive : {}) }}>
          Depo
        </button>
        <button onClick={() => { setSubtab("chests"); setSelectedId(null); }} style={{ ...styles.subtabBtn, ...(subtab === "chests" ? styles.subtabBtnActive : {}) }}>
          Sandıklar ({player.chests.length})
        </button>
      </div>

      {subtab === "armor" && (
        <>
          {/* Toplu seçim — sadece depoya taşımak ya da toplu satmak için
              (kullanıcı isteği), tekli detay sayfasının yerini alıyor. */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              style={{ ...styles.tinyBtn, background: bulkMode ? "#5FA8A0" : "var(--bg-panel-alt)", color: bulkMode ? "#0B0C10" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}
              onClick={toggleBulkMode}
            >
              <ListChecks size={12} /> {bulkMode ? "Toplu Seçimi Kapat" : "Toplu Seç"}
            </button>
          </div>

          {bulkMode && (
            <div style={{ ...styles.itemDetailCard, marginTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{bulkSelected.size} eşya seçili</span>
              <button
                style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", opacity: bulkSelected.size ? 1 : 0.5, display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}
                disabled={bulkSelected.size === 0}
                onClick={bulkDeposit}
              >
                <Archive size={11} /> Depoya Taşı
              </button>
              <button
                style={{ ...styles.tinyBtn, opacity: bulkSelected.size ? 1 : 0.5, display: "flex", alignItems: "center", gap: 4 }}
                disabled={bulkSelected.size === 0}
                onClick={bulkSell}
              >
                <Coins size={11} /> Toplu Sat
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
            <EmptyState icon={Package} title="Çanta boş" subtitle="Canavar avlayarak zırh, silah ve aksesuar toplayabilirsin." />
          )}
        </>
      )}

      {subtab === "bank" && (
        <>
          <div style={styles.subtabRow}>
            {Array.from({ length: bank.length }, (_, i) => (
              <button
                key={i}
                onClick={() => { setBankPage(i); setSelectedId(null); }}
                style={{ ...styles.subtabBtn, flex: "0 0 auto", padding: "6px 12px", ...(bankPage === i ? styles.subtabBtnActive : {}) }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <BankGrid
            items={bank[bankPage]}
            selectedId={selectedId}
            onItemTap={(item) => setSelectedId((cur) => (cur === item.id ? null : item.id))}
          />

          {bank[bankPage].length === 0 && (
            <EmptyState icon={Archive} title="Bu sayfa boş" subtitle="Çantandan bir eşya seçip depoya koyabilirsin." />
          )}
        </>
      )}

      {subtab === "chests" && (
        player.chests.length === 0 ? (
          <EmptyState icon={Gift} title="Sandık yok" subtitle="Canavarlardan %5 ihtimalle sandık düşer." />
        ) : (
          <>
            {player.chests.length > 1 && (
              <button
                style={{ ...styles.tinyBtn, width: "100%", marginBottom: 10, background: "#D4AF6A", color: "#15171E", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                onClick={openAllChests}
              >
                <Gift size={12} /> Tümünü Aç ({player.chests.length})
              </button>
            )}
            <div style={styles.chestGrid}>
              {player.chests.map((chest) => {
                const color = chest.special ? "#D4AF6A" : itemTierColor(chest.tier);
                const Icon = chest.special ? Sparkles : Gift;
                return (
                  <button key={chest.id} onClick={() => openChest(chest)} style={{ ...styles.chestCard, borderColor: `${color}55` }}>
                    <Icon size={22} color={color} strokeWidth={1.6} />
                    <div style={{ fontSize: 11, marginTop: 6, fontFamily: "var(--font-mono)", color, textAlign: "center" }}>
                      {chest.special ? "Özel Etkinlik Sandığı" : `T${chest.tier} Sandık`}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-faint)", marginTop: 2 }}>Kırmak için dokun</div>
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
                  <button style={{ ...styles.tinyBtn, display: "flex", alignItems: "center", gap: 4 }} onClick={() => withdrawItem(selectedItem)}>
                    <ArrowUpFromLine size={11} /> Çantaya Al
                  </button>
                  {repairAmount > 0 && (
                    <button style={{ ...styles.tinyBtn, background: "#D4AF6A", color: "#15171E", display: "flex", alignItems: "center", gap: 4 }} onClick={() => repair(selectedItem)}>
                      <Wrench size={11} /> Tamir ({repairAmount}g)
                    </button>
                  )}
                </>
              ) : (
                <>
                  {selectedItem.kind === "potion" ? (
                    <button style={styles.tinyBtn} onClick={() => handleUsePotion(selectedItem)}>Kullan</button>
                  ) : selectedItem.kind === "scroll" || selectedItem.kind === "bonusScroll" ? (
                    // Bonus Parşömen'in de tıpkı normal parşömen gibi buradan
                    // hiçbir işlevi yok — sadece Yükselt sekmesindeki forge'a
                    // sürüklenip kullanılıyor. Önceden burada hiç eşleşmiyordu
                    // ve akış son "else" dalına (Kuşan butonu) düşüyordu —
                    // `item.slot` tanımsız olduğu için equipItem onu
                    // `equipped.undefined`'a yazıp envanterden siliyordu
                    // (kullanıcının bildirdiği "kullanılabiliyor" hatası).
                    <span style={{ fontSize: 10, color: "var(--text-faint)" }}>Yükselt sekmesinden kullanılır.</span>
                  ) : selectedItem.kind === "raceScroll" ? (
                    player.clan ? (
                      <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)" }} disabled>
                        <Ban size={11} /> Bir klana üyeyken ırk değiştiremezsin.
                      </button>
                    ) : (
                      Object.entries(RACES).map(([key, r]) => (
                        <button
                          key={key}
                          style={{ ...styles.tinyBtn, background: r.color, opacity: player.race === key ? 0.4 : 1 }}
                          disabled={player.race === key}
                          onClick={() => useRaceScroll(selectedItem, key)}
                        >
                          {r.name} Ol
                        </button>
                      ))
                    )
                  ) : selectedItem.kind === "jobScroll" ? (
                    !canChangeJob(player).ok ? (
                      <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)" }} disabled>
                        <Ban size={11} /> {canChangeJob(player).reason}
                      </button>
                    ) : (
                      Object.entries(CLASSES).filter(([key]) => key !== player.class).map(([key, c]) => (
                        <button key={key} style={{ ...styles.tinyBtn, background: c.color }} onClick={() => useJobScroll(selectedItem, key)}>
                          {c.name} Ol
                        </button>
                      ))
                    )
                  ) : selectedItem.kind === "armor" && selectedItem.class !== player.class ? (
                    <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)" }} disabled>
                      <Ban size={11} /> Kilitli
                    </button>
                  ) : selectedItem.kind === "armor" && selectedItem.tier === 5 && !player.awakened ? (
                    <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)" }} disabled>
                      <Ban size={11} /> Master gerekiyor
                    </button>
                  ) : !statReqMet ? (
                    <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)" }} disabled>
                      <Ban size={11} /> Yetersiz Statü
                    </button>
                  ) : (
                    <button style={styles.tinyBtn} onClick={() => equip(selectedItem)}>Kuşan</button>
                  )}
                  {repairAmount > 0 && (
                    <button style={{ ...styles.tinyBtn, background: "#D4AF6A", color: "#15171E", display: "flex", alignItems: "center", gap: 4 }} onClick={() => repair(selectedItem)}>
                      <Wrench size={11} /> Tamir ({repairAmount}g)
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
                  <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }} onClick={() => depositItem(selectedItem)}>
                    <Archive size={11} /> Depoya Koy
                  </button>
                  {!isConsumable(selectedItem) && !selectedItem.noTrade && (
                    <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => sellItem(selectedItem)}>
                      Sat ({Math.round(sellPrice(selectedItem) * premiumSellMultiplier(player))}g)
                    </button>
                  )}
                </>
              )}
              <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-faint)", marginLeft: "auto" }} onClick={() => setSelectedId(null)}>
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
