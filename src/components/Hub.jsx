import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { hasClaimedFirstPurchaseBonus } from "../utils/firstPurchaseBonus";
import { useTranslation } from "../i18n/LanguageContext";
import ScreenPanel from './ScreenPanel';
import { CLASSES } from "../data/classes";
import { totalStats, playerDef, playerMaxHp } from "../utils/player";
import { MONSTER_QUESTS } from "../data/quests";
import { questProgress, isQuestClaimed } from "../utils/quests";
import { dailyQuestProgress } from "../utils/dailyQuests";
import { DAILY_QUEST_SLOTS } from "../data/dailySystems";
import { WEEKLY_QUESTS } from "../data/weeklyQuests";
import { weeklyQuestProgress } from "../utils/weeklyQuests";
import { MAP_COLLECTIONS, collectionProgress } from "../utils/collection";
import { canClaimDailyLogin } from "../utils/dailyLogin";
import * as chatService from "../services/chatService";
import { styles } from "../styles";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import BattleTab from "./BattleTab";
import InventoryTab from "./InventoryTab";
import MarketTab from "./MarketTab";
import UpgradeTab from "./UpgradeTab";
import ChatTab from "./ChatTab";
import CharacterTab from "./CharacterTab";
import CaptainTab from "./CaptainTab";
import WarzoneTab from "./WarzoneTab";
import ClanTab from "./ClanTab";
import TutorialModal from "./TutorialModal";
import DailyLoginModal from "./DailyLoginModal";
import DiamondShopModal from "./DiamondShopModal";
import FirstPurchaseOfferModal from "./FirstPurchaseOfferModal";
import RewardChest from './icons/RewardChest';
import ScheduledEventBanner from "./ScheduledEventBanner";
import WarzoneBossBanner from "./WarzoneBossBanner";

export default function Hub({ player, setPlayer, bank, setBank, bankGold, setBankGold, username, tab, setTab, pushToast, onChangeCharacter, onChangeRace, onOpenSettings, unlockedSlots, onUnlockSlot }) {
  const { t } = useTranslation();
  const cls = CLASSES[player.class];
  const { atk } = totalStats(player);
  const def = playerDef(player);
  // Kullanıcı isteği: üst şeritteki ve Karakter sekmesindeki "HP" artık
  // sadece eşya/STA bileşenini (totalStats().hp) değil, gerçek toplam canı
  // (taban + seviye + eşya + set bonusu) gösteriyor — "Can Bonusu" değil,
  // doğrudan "Can".
  const maxHp = playerMaxHp(player);

  // Sadece player.tutorialSeen henüz false olan (yeni oluşturulmuş) bir
  // karakter için ilk render'da açılır (bkz. utils/player.js#initialPlayer/
  // migratePlayer) — Karakter sekmesindeki "Tutorial'ı Tekrar Göster"
  // butonu da aynı state'i tekrar true'ya çekiyor.
  const [tutorialOpen, setTutorialOpen] = useState(!player.tutorialSeen);
  const closeTutorial = () => {
    setTutorialOpen(false);
    setPlayer((p) => (p.tutorialSeen ? p : { ...p, tutorialSeen: true }));
  };
  const reopenTutorial = () => setTutorialOpen(true);

  // Günlük giriş ödülü — Hub her açıldığında (uygulama yeniden yüklendiğinde
  // dahil) bugün henüz alınmadıysa otomatik açılır; kullanıcı kapatırsa
  // (X ya da dışarı tıklama) TopBar'daki hediye ikonundan istediği an tekrar
  // açabilir (bkz. utils/dailyLogin.js). Tutorial açıkken bastırılıyor ki
  // yepyeni bir karakter iki modalı üst üste görmesin — tutorial kapanınca
  // (dailyLoginOpen zaten true kaldığı için) hemen ardından kendiliğinden çıkar.
  const [dailyLoginOpen, setDailyLoginOpen] = useState(canClaimDailyLogin(player));
  const dailyLoginAvailable = canClaimDailyLogin(player);
  const [diamondShopOpen, setDiamondShopOpen] = useState(false);

  // Kullanıcı isteği: "İlk ödeme ödülü almayan kişilere oyuna ilk girişte
  // güzel bir widget açılsın... Fırsat Kaçmaz tarzında" — dailyLoginOpen ile
  // aynı desen: Hub her mount olduğunda (oturum başına) bonus henüz
  // alınmadıysa otomatik açılır, tutorial/günlük giriş modalının ardından
  // sıraya girer ki üç modal üst üste binmesin. Kapatılırsa sol üstteki
  // yüzen ikondan (aşağıda) istediği an tekrar açılabilir.
  const firstPurchaseClaimed = hasClaimedFirstPurchaseBonus(player);
  const [firstPurchaseOfferOpen, setFirstPurchaseOfferOpen] = useState(!firstPurchaseClaimed);
  const handleBuyFirstPurchaseOffer = () => {
    pushToast(t("diamondShop.comingSoonToast"), "default");
  };

  // Kullanıcı isteği: "Savaş Alanından çıkmak istediğinde emin misin? diye
  // sor." — WarzoneTab, ışınlandıktan sonra (entered=true) bu bayrağı
  // onEnteredChange ile yukarı bildiriyor. Alandayken başka bir sekmeye
  // geçiş isteği direkt uygulanmıyor, önce bir onay modalı açılıyor —
  // BottomNav'a ham setTab yerine requestTabChange veriliyor.
  const [warzoneEntered, setWarzoneEntered] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const requestTabChange = (nextTab) => {
    if (nextTab === tab) return;
    if (tab === "warzone" && warzoneEntered) { setPendingTab(nextTab); return; }
    setTab(nextTab);
  };
  const confirmLeaveWarzone = () => { setTab(pendingTab); setPendingTab(null); };

  // Alt menü bildirim noktaları (kullanıcı isteği: "yeni bir mesaj geldiği
  // zaman... yeni eşya düştüğü zaman... görev tamamlandığı zaman... verilmeyen
  // statü puanı bulunduğu zaman... menüde bildirim belli olsun"). Kaptan ve
  // Karakter tamamen player state'inden türüyor, hiç ek state gerekmiyor —
  // görev bitince ya da puan biriktikçe otomatik yanar. Envanter ise bir
  // "drop oldu" olayına bağlı (bkz. BattleTab#applyLoot, InventoryTab
  // #openChest), o yüzden player.hasNewItemNotice adında kalıcı bir bayrak.
  const captainNotice = MONSTER_QUESTS
    .filter((q) => player.level >= q.requiredLevel)
    .some((q) => questProgress(player, q).done && !isQuestClaimed(player, q.id))
    || DAILY_QUEST_SLOTS.some((_, i) => { const p = dailyQuestProgress(player, i); return p.done && !p.claimed; })
    || WEEKLY_QUESTS.some((q) => { const p = weeklyQuestProgress(player, q); return p.done && !p.claimed; })
    || MAP_COLLECTIONS.some((c) => { const p = collectionProgress(player, c); return p.done && !p.claimed; });
  const characterNotice = player.statPoints > 0;
  const inventoryNotice = !!player.hasNewItemNotice;

  // Envanter sekmesi açılınca bildirim temizlenir — kalıcı bayrak olduğu
  // için (bir sonraki oturuma da taşınsın diye) burada, tab değiştiğinde
  // temizlemek en doğal yer.
  useEffect(() => {
    if (tab === "inventory" && player.hasNewItemNotice) {
      setPlayer((p) => (p.hasNewItemNotice ? { ...p, hasNewItemNotice: false } : p));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Sohbet bildirimi — chatService'in kendi mesaj sayısı hiçbir yerde kalıcı
  // değil (sayfa yenilenince sıfırlanıyor, bkz. services/chatService.js),
  // o yüzden "görülen sayı" da sadece bu oturumluk bir state. Sohbet sekmesi
  // açıkken her tur otomatik "görüldü" sayılır, kapalıyken sayı arttıkça
  // bildirim yanar.
  const [chatSeenCount, setChatSeenCount] = useState(0);
  const [chatNotice, setChatNotice] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const msgs = await chatService.fetchMessages();
      if (cancelled) return;
      if (tab === "chat") {
        setChatSeenCount(msgs.length);
        setChatNotice(false);
      } else {
        setChatNotice(msgs.length > chatSeenCount);
      }
    };
    check();
    const id = setInterval(check, 4000);
    return () => { cancelled = true; clearInterval(id); };
  }, [tab, chatSeenCount]);

  const notifications = { captain: captainNotice, character: characterNotice, inventory: inventoryNotice, chat: chatNotice };

  return (
    <div className="game-hub" style={styles.hubRoot}>
      <TopBar
        player={player} cls={cls} maxHp={maxHp} def={def} atk={atk}
        dailyLoginAvailable={dailyLoginAvailable}
        onOpenDailyLogin={() => setDailyLoginOpen(true)}
        onOpenSettings={onOpenSettings}
        onOpenDiamondShop={() => setDiamondShopOpen(true)}
      />

      <ScheduledEventBanner player={player} setPlayer={setPlayer} pushToast={pushToast} />
      <WarzoneBossBanner onOpenWarzone={() => setTab("warzone")} />

      {!firstPurchaseClaimed && (
        <button
          className="offer-launcher"
          onClick={() => setFirstPurchaseOfferOpen(true)}
          title={t("diamondShop.firstPurchaseIconTitle")}
          style={{
            position: "absolute", top: 84, left: 8, zIndex: 45,
            width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(11,12,16,0.7)", border: "1px solid var(--gold-text)",
            color: "var(--gold-text)", cursor: "pointer", padding: 0,
          }}
        >
          <RewardChest size={36}/>
        </button>
      )}

      <ScreenPanel key={tab} screen={tab}>
        {tab === "battle" && (
          <BattleTab player={player} setPlayer={setPlayer} cls={cls} def={def} atk={atk} pushToast={pushToast} />
        )}
        {tab === "inventory" && (
          <InventoryTab player={player} setPlayer={setPlayer} bank={bank} setBank={setBank} bankGold={bankGold} setBankGold={setBankGold} pushToast={pushToast} onChangeRace={onChangeRace} />
        )}
        {tab === "market" && (
          <MarketTab onOpenDiamondShop={() => setDiamondShopOpen(true)} player={player} setPlayer={setPlayer} bank={bank} setBank={setBank} bankGold={bankGold} setBankGold={setBankGold} username={username} pushToast={pushToast} />
        )}
        {tab === "upgrade" && (
          <UpgradeTab player={player} setPlayer={setPlayer} pushToast={pushToast} />
        )}
        {tab === "captain" && (
          <CaptainTab player={player} setPlayer={setPlayer} pushToast={pushToast} />
        )}
        {tab === "warzone" && (
          <WarzoneTab player={player} setPlayer={setPlayer} pushToast={pushToast} onEnteredChange={setWarzoneEntered} />
        )}
        {tab === "clan" && (
          <ClanTab player={player} setPlayer={setPlayer} pushToast={pushToast} />
        )}
        {tab === "chat" && (
          <ChatTab player={player} setPlayer={setPlayer} bank={bank} setBank={setBank} pushToast={pushToast} />
        )}
        {tab === "character" && (
          <CharacterTab player={player} setPlayer={setPlayer} cls={cls} maxHp={maxHp} def={def} atk={atk} pushToast={pushToast} onChangeCharacter={onChangeCharacter} onReplayTutorial={reopenTutorial} />
        )}
      </ScreenPanel>

      <BottomNav tab={tab} setTab={requestTabChange} notifications={notifications} />

      {pendingTab && (
        <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={() => setPendingTab(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <LogOut size={28} color="#C9425A" strokeWidth={1.4} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", maxWidth: 240 }}>
              {t("warzone.exitConfirm")}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setPendingTab(null)}>{t("warzone.no")}</button>
              <button style={{ ...styles.tinyBtn, background: "#C9425A" }} onClick={confirmLeaveWarzone}>{t("warzone.yes")}</button>
            </div>
          </div>
        </div>
      )}

      {tutorialOpen && <TutorialModal onFinish={closeTutorial} />}

      {dailyLoginOpen && !tutorialOpen && (
        <DailyLoginModal player={player} setPlayer={setPlayer} pushToast={pushToast} onClose={() => setDailyLoginOpen(false)} />
      )}

      {firstPurchaseOfferOpen && !tutorialOpen && !dailyLoginOpen && !firstPurchaseClaimed && (
        <FirstPurchaseOfferModal player={player} onBuy={handleBuyFirstPurchaseOffer} onClose={() => setFirstPurchaseOfferOpen(false)} />
      )}

      {diamondShopOpen && (
        <DiamondShopModal
          player={player} setPlayer={setPlayer}
          bank={bank} setBank={setBank}
          unlockedSlots={unlockedSlots} onUnlockSlot={onUnlockSlot}
          pushToast={pushToast} onClose={() => setDiamondShopOpen(false)}
        />
      )}
    </div>
  );
}
