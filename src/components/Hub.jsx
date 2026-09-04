import { useState, useEffect } from "react";
import { CLASSES } from "../data/classes";
import { totalStats, playerDef, playerMaxHp } from "../utils/player";
import { MONSTER_QUESTS } from "../data/quests";
import { questProgress, isQuestClaimed } from "../utils/quests";
import { dailyQuestProgress } from "../utils/dailyQuests";
import { DAILY_QUEST_SLOTS } from "../data/dailySystems";
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
import ScheduledEventBanner from "./ScheduledEventBanner";

export default function Hub({ player, setPlayer, bank, setBank, tab, setTab, pushToast, onChangeCharacter, onChangeRace }) {
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
    || DAILY_QUEST_SLOTS.some((_, i) => { const p = dailyQuestProgress(player, i); return p.done && !p.claimed; });
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
    <div style={styles.hubRoot}>
      <TopBar
        player={player} cls={cls} maxHp={maxHp} def={def} atk={atk}
        dailyLoginAvailable={dailyLoginAvailable}
        onOpenDailyLogin={() => setDailyLoginOpen(true)}
      />

      <ScheduledEventBanner player={player} setPlayer={setPlayer} pushToast={pushToast} />

      <div style={styles.tabContent}>
        {tab === "battle" && (
          <BattleTab player={player} setPlayer={setPlayer} cls={cls} def={def} atk={atk} pushToast={pushToast} />
        )}
        {tab === "inventory" && (
          <InventoryTab player={player} setPlayer={setPlayer} bank={bank} setBank={setBank} pushToast={pushToast} onChangeRace={onChangeRace} />
        )}
        {tab === "market" && (
          <MarketTab player={player} setPlayer={setPlayer} bank={bank} setBank={setBank} pushToast={pushToast} />
        )}
        {tab === "upgrade" && (
          <UpgradeTab player={player} setPlayer={setPlayer} pushToast={pushToast} />
        )}
        {tab === "captain" && (
          <CaptainTab player={player} setPlayer={setPlayer} pushToast={pushToast} />
        )}
        {tab === "warzone" && (
          <WarzoneTab player={player} setPlayer={setPlayer} pushToast={pushToast} />
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
      </div>

      <BottomNav tab={tab} setTab={setTab} notifications={notifications} />

      {tutorialOpen && <TutorialModal onFinish={closeTutorial} />}

      {dailyLoginOpen && !tutorialOpen && (
        <DailyLoginModal player={player} setPlayer={setPlayer} pushToast={pushToast} onClose={() => setDailyLoginOpen(false)} />
      )}
    </div>
  );
}
