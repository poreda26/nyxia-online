import { Gem, X, Star, Sparkles, Castle, Archive, Users, ScrollText } from "lucide-react";
import { DIAMOND_PACKS } from "../data/diamondPacks";
import { EXTRA_DUNGEON_ENTRY_COST_DIAMONDS, EXTRA_DUNGEON_ENTRIES_PER_PURCHASE } from "../data/soloDungeon";
import { buyExtraDungeonEntries, hasBoughtExtraDungeonEntryToday } from "../utils/soloDungeon";
import { buyExtraBankPage, EXTRA_BANK_PAGE_COST_DIAMONDS, MAX_BANK_PAGES } from "../utils/inventory";
import { CHARACTER_SLOTS, THIRD_SLOT_COST_DIAMONDS } from "../utils/storage";
import { BOOST_SCROLLS, BOOST_SCROLL_PACK_SIZE, boostScrollName } from "../data/boostScrolls";
import { buyBoostScrollPack } from "../utils/boosts";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

// Kullanıcı isteği: Apple/Google IAP entegrasyonundan önce satın alma
// menüsünü hazırlayalım — sonra "Zindana giriş hakkı... Ekstra Çanta/banka
// sayfası... Karakter slotu genişletme eklensin" (bkz. memory:
// project_diamond_iap_plan). Üstteki üç "perk" satırı GERÇEK, hemen etkili
// elmas harcamaları (mevcut oyun içi elmas havuzundan) — sadece alttaki para
// paketleri (DIAMOND_PACKS) henüz gerçek ödeme almıyor, RevenueCat bağlanana
// kadar "yakında" toast'ı gösteriyor.
export default function DiamondShopModal({ player, setPlayer, bank, setBank, unlockedSlots, onUnlockSlot, onClose, pushToast }) {
  const { t, lang } = useTranslation();

  const handleBuyPack = () => {
    pushToast(t("diamondShop.comingSoonToast"), "default");
  };

  const handleBuyDungeonEntries = () => {
    const result = buyExtraDungeonEntries(player);
    if (!result.bought) {
      pushToast(t(result.reason === "alreadyBoughtToday" ? "battle.dungeonEntriesAlreadyBoughtToday" : "shop.notEnoughDiamonds"), "warn");
      return;
    }
    setPlayer(result.player);
    pushToast(t("battle.dungeonEntriesBought"), "loot");
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

  const handleUnlockSlot = () => {
    const bought = onUnlockSlot();
    if (!bought) { pushToast(t("shop.notEnoughDiamonds"), "warn"); return; }
    pushToast(t("diamondShop.slotUnlockedToast"), "loot");
  };

  const handleBuyBoostPack = (scrollId) => {
    const result = buyBoostScrollPack(player, scrollId);
    if (!result.bought) {
      pushToast(result.reason === "notEnoughDiamonds" ? t("shop.notEnoughDiamonds") : t("shop.purchaseFailed", { reason: result.reason }), "warn");
      return;
    }
    setPlayer(result.player);
    pushToast(t("boosts.boughtToast", { name: boostScrollName(scrollId, lang), pack: BOOST_SCROLL_PACK_SIZE }), "loot");
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalCard, maxWidth: 360, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 4 }}
        >
          <X size={16} />
        </button>

        <Gem size={32} color="#8B6FC9" strokeWidth={1.4} />
        <div style={{ marginTop: 10, fontFamily: "var(--font-display)", fontSize: 17 }}>{t("diamondShop.title")}</div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4, textAlign: "center", lineHeight: 1.5 }}>
          {t("diamondShop.subtitle")}
        </div>

        <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5, alignSelf: "flex-start", marginTop: 18 }}>
          {t("diamondShop.perksTitle")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, width: "100%" }}>
          <div style={{ ...styles.itemDetailCard, display: "flex", alignItems: "center", gap: 10 }}>
            <Castle size={18} color="#A34FD9" strokeWidth={1.6} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 12 }}>{t("battle.dailyDungeon")}</div>
            {hasBoughtExtraDungeonEntryToday(player) ? (
              <span style={{ fontSize: 9, color: "var(--text-faint)" }}>{t("battle.dungeonEntriesAlreadyBoughtToday")}</span>
            ) : (
              <button style={{ ...styles.tinyBtn, flexShrink: 0, background: "var(--bg-panel-alt)", color: "#8B6FC9", display: "flex", alignItems: "center", gap: 4 }} onClick={handleBuyDungeonEntries}>
                <Gem size={11} /> {EXTRA_DUNGEON_ENTRY_COST_DIAMONDS} (+{EXTRA_DUNGEON_ENTRIES_PER_PURCHASE})
              </button>
            )}
          </div>

          <div style={{ ...styles.itemDetailCard, display: "flex", alignItems: "center", gap: 10 }}>
            <Archive size={18} color="#5FA8A0" strokeWidth={1.6} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 12 }}>{t("inventory.bankTab")}</div>
            {bank.length < MAX_BANK_PAGES ? (
              <button style={{ ...styles.tinyBtn, flexShrink: 0, background: "var(--bg-panel-alt)", color: "#8B6FC9", display: "flex", alignItems: "center", gap: 4 }} onClick={handleBuyBankPage}>
                <Gem size={11} /> {EXTRA_BANK_PAGE_COST_DIAMONDS} (+1)
              </button>
            ) : (
              <span style={{ fontSize: 9, color: "var(--text-faint)" }}>{t("inventory.maxBankPagesReached")}</span>
            )}
          </div>

          {unlockedSlots < CHARACTER_SLOTS && (
            <div style={{ ...styles.itemDetailCard, display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={18} color="var(--gold-text)" strokeWidth={1.6} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12 }}>{t("characterSelect.lockedSlot")}</div>
              <button style={{ ...styles.tinyBtn, flexShrink: 0, background: "var(--bg-panel-alt)", color: "#8B6FC9", display: "flex", alignItems: "center", gap: 4 }} onClick={handleUnlockSlot}>
                <Gem size={11} /> {THIRD_SLOT_COST_DIAMONDS}
              </button>
            </div>
          )}
        </div>

        <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5, alignSelf: "flex-start", marginTop: 18 }}>
          {t("boosts.shopTitle")}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 4, lineHeight: 1.5 }}>
          {t("boosts.shopDesc", { pack: BOOST_SCROLL_PACK_SIZE })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, width: "100%" }}>
          {BOOST_SCROLLS.map((s) => (
            <div key={s.id} style={{ ...styles.itemDetailCard, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ScrollText size={18} color={s.color} strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13 }}>{boostScrollName(s.id, lang)}</div>
                <div style={{ fontSize: 9, color: "var(--text-faint)", marginTop: 2 }}>{t(`boosts.${s.id}.desc`)}</div>
              </div>
              <button
                style={{ ...styles.tinyBtn, flexShrink: 0, background: "var(--bg-panel-alt)", color: s.color, display: "flex", alignItems: "center", gap: 4 }}
                onClick={() => handleBuyBoostPack(s.id)}
              >
                <Gem size={11} /> {s.packCost} <span style={{ opacity: 0.7 }}>({t("boosts.packLabel", { pack: BOOST_SCROLL_PACK_SIZE })})</span>
              </button>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5, alignSelf: "flex-start", marginTop: 18 }}>
          {t("diamondShop.packsTitle")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, width: "100%" }}>
          {DIAMOND_PACKS.map((pack) => (
            <div
              key={pack.id}
              style={{
                ...styles.itemDetailCard, display: "flex", alignItems: "center", gap: 10,
                borderColor: pack.bestValue ? "#D4AF6A" : pack.popular ? "#8B6FC9" : "var(--border)",
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Gem size={18} color="#8B6FC9" strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  {pack.diamonds.toLocaleString()}
                  {pack.bonusPct > 0 && (
                    <span style={{ fontSize: 9, color: "#8B6FC9", border: "1px solid #8B6FC966", borderRadius: 4, padding: "1px 4px" }}>
                      {t("diamondShop.bonusBadge", { pct: pack.bonusPct })}
                    </span>
                  )}
                </div>
                {(pack.popular || pack.bestValue) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: pack.bestValue ? "var(--gold-text)" : "#8B6FC9", marginTop: 2 }}>
                    {pack.bestValue ? <Star size={10} /> : <Sparkles size={10} />}
                    {pack.bestValue ? t("diamondShop.bestValueBadge") : t("diamondShop.popularBadge")}
                  </div>
                )}
              </div>
              <button
                style={{ ...styles.tinyBtn, flexShrink: 0, background: "#8B6FC9", color: "#fff" }}
                onClick={handleBuyPack}
              >
                {pack.priceLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
