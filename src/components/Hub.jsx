import { useState, useEffect, useCallback, useRef } from "react";
import { hasCaptainNotice } from "../utils/captainNotices";
import { loadChatSeenId, saveChatSeenId, loadDmSeen, saveDmSeen, hasUnreadChat, latestChatId, unreadFriendIds } from "../utils/readState";
import { LogOut } from "lucide-react";
import { hasClaimedFirstPurchaseBonus } from "../utils/firstPurchaseBonus";
import { useTranslation } from "../i18n/LanguageContext";
import ScreenPanel from './ScreenPanel';
import { CLASSES } from "../data/classes";
import { totalStats, playerDef, playerMaxHp } from "../utils/player";
import { canClaimDailyLogin } from "../utils/dailyLogin";
import { canFightMapBoss } from "../utils/mapBoss";
import { buildMapBoss } from "../data/mapBosses";
import { findMap, highestUnlockedMap } from "../data/maps";
import * as chatService from "../services/chatService";
import * as socialService from "../services/socialService";
import { styles } from "../styles";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import BattleTab from "./BattleTab";
import InventoryTab from "./InventoryTab";
import MarketTab from "./MarketTab";
import UpgradeTab from "./UpgradeTab";
import ChatTab from "./ChatTab";
import FriendsPanel from "./FriendsPanel";
import CharacterTab from "./CharacterTab";
import CaptainTab from "./CaptainTab";
import WarzoneTab from "./WarzoneTab";
import ClanTab from "./ClanTab";
import TutorialModal from "./TutorialModal";
import DailyLoginModal from "./DailyLoginModal";
import DiamondShopModal from "./DiamondShopModal";
import FirstPurchaseOfferModal from "./FirstPurchaseOfferModal";
import EventReadyModal from "./EventReadyModal";
import MonsterPortrait from "./MonsterPortrait";
import RewardChest from './icons/RewardChest';
import ScheduledEventBanner from "./ScheduledEventBanner";
import WarzoneBossBanner from "./WarzoneBossBanner";

export default function Hub({ player, setPlayer, bank, setBank, bankGold, setBankGold, username, tab, setTab, pushToast, onChangeCharacter, onChangeRace, onOpenSettings, unlockedSlots, onUnlockSlot }) {
  const { t, tm } = useTranslation();
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

  // Kullanıcı isteği: "Bir etkinlik açıldığı zaman oyuncu bu etkinliğe
  // katılma şartlarını sağlıyorsa ekrana bir bildirim gibi widget açılıp
  // katılmak isteyip istemediği sorulmalı" — ilk uygulama: Harita Sonu Boss.
  // canFightMapBoss günlük bir bayrak (bkz. utils/mapBoss.js), bu yüzden
  // her Hub mount'unda (oturum başına, tıpkı dailyLoginOpen/tutorialOpen
  // gibi) yeniden true'ya seedleniyor — kapatılırsa o oturumda bir daha
  // çıkmaz, ertesi gün (yeni bir mount'ta) tekrar sorar. EventReadyModal.jsx
  // olay-bağımsız/genel bir bileşen — World Boss açılışı, Klan Dungeon
  // boşalması gibi başka "hazır, katılmak ister misin?" anları da aynı
  // bileşeni kendi state bayraklarıyla kullanabilir.
  const mapBossMap = player.level >= findMap(player.currentMapId).levelMin
    ? findMap(player.currentMapId)
    : highestUnlockedMap(player.level);
  const mapBoss = buildMapBoss(mapBossMap);
  const mapBossCheck = canFightMapBoss(player, mapBossMap.id);
  const [mapBossReadyOpen, setMapBossReadyOpen] = useState(mapBossCheck.ok);

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
  const captainNotice = hasCaptainNotice(player);
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
  // Okundu bilgisi artık mesaj KİMLİĞİNE dayanıyor ve cihazda saklanıyor (bkz.
  // utils/readState.js): önceden bellekte tutulan mesaj SAYISI her oyun
  // açılışında sıfırlandığı için okunmuş mesajlar tekrar bildirim veriyordu,
  // ayrıca 100 mesajlık tavanda yeni mesajı da kaçırıyordu.
  const [chatSeenId, setChatSeenId] = useState(() => loadChatSeenId(username));
  const [chatNotice, setChatNotice] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      let msgs;
      try {
        msgs = await chatService.fetchMessages();
      } catch {
        return; // Oturum/ağ geçici sorunu — bir sonraki periyotta tekrar dener.
      }
      if (cancelled) return;
      const newest = latestChatId(msgs);
      // Sohbet açıkken ya da bu hesapta hiç kayıt yokken (ilk açılış: eski
      // geçmiş için sahte bildirim çıkmasın) mevcut son mesaj görülmüş sayılır.
      if (tab === "chat" || chatSeenId === null) {
        if (chatSeenId === null || newest > chatSeenId) { saveChatSeenId(username, newest); setChatSeenId(newest); }
        setChatNotice(false);
      } else {
        setChatNotice(hasUnreadChat(msgs, chatSeenId));
      }
    };
    check();
    const id = setInterval(check, 4000);
    return () => { cancelled = true; clearInterval(id); };
  }, [tab, chatSeenId, username]);

  // Arkadaşlık isteği bildirimi — kullanıcı isteği: "Arkadaşlar için bir
  // sekme yap." Sohbet'in "görülen sayı" mantığından farklı: bekleyen
  // istek sayısı zaten kendiliğinden bir kuyruk, Arkadaşlar sekmesi
  // açıkken (tab değiştiği an) nokta otomatik söner.
  const [incomingFriendRequestCount, setIncomingFriendRequestCount] = useState(0);

  // Kullanıcı isteği: "arkadaşlarımızla olan konuşmalarımız sohbette ek
  // sekme olarak gözükebilir... sekme gibi sonra kapatabiliriz." Açık DM
  // sekmeleri (Hub'da yaşıyor ki Sohbet'ten başka bir sekmeye geçip
  // dönünce kaybolmasın — bkz. ScreenPanel'in key={tab} ile her geçişte
  // yeniden mount etmesi) + "görüldü" zaman damgaları (bkz. yukarıdaki
  // chatSeenCount ile aynı desen, sayfa yenilenince sıfırlanır — kritik
  // veri değil, sadece bildirim durumu).
  const [openDmTabs, setOpenDmTabs] = useState([]); // [{accountId, name}]
  const [dmSeenAt, setDmSeenAt] = useState(() => loadDmSeen(username)); // { [accountId]: timestamp } | null (ilk açılış)
  const [pendingActiveDm, setPendingActiveDm] = useState(null);
  const [dmUnreadIds, setDmUnreadIds] = useState(new Set());
  const friendLastMessageRef = useRef({}); // { [accountId]: sunucu zamanı }
  useEffect(() => { if (dmSeenAt) saveDmSeen(username, dmSeenAt); }, [dmSeenAt, username]);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      let data;
      try { data = await socialService.fetchFriends(); }
      catch { return; } // Oturum/ağ geçici sorunu — bir sonraki periyotta tekrar dener.
      if (cancelled) return;
      setIncomingFriendRequestCount(data.incoming.length);
      friendLastMessageRef.current = Object.fromEntries(data.friends.map((f) => [f.accountId, f.lastMessageAt || 0]));
      // Bu hesapta hiç okundu kaydı yoksa mevcut mesajlar görülmüş sayılıp
      // tohumlanır (eski geçmiş için sahte bildirim çıkmasın).
      if (dmSeenAt === null) { setDmSeenAt(friendLastMessageRef.current); return; }
      const unread = new Set(unreadFriendIds(data.friends, dmSeenAt));
      setDmUnreadIds(unread);
      // Yeni mesajı olan bir arkadaş henüz açık sekme değilse otomatik
      // eklenir — kullanıcı Arkadaşlar'a hiç girmeden de gelen mesajı
      // Sohbet'te görebilsin diye (bkz. yukarıdaki kullanıcı isteği).
      if (unread.size > 0) {
        setOpenDmTabs((tabs) => {
          const existingIds = new Set(tabs.map((x) => x.accountId));
          const toAdd = data.friends.filter((f) => unread.has(f.accountId) && !existingIds.has(f.accountId));
          return toAdd.length ? [...tabs, ...toAdd.map((f) => ({ accountId: f.accountId, name: f.name }))] : tabs;
        });
      }
    };
    check();
    const id = setInterval(check, 10000);
    return () => { cancelled = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dmSeenAt]);
  const friendsNotice = incomingFriendRequestCount > 0 && tab !== "friends";

  const openDm = (friend) => {
    setOpenDmTabs((tabs) => (tabs.some((x) => x.accountId === friend.accountId) ? tabs : [...tabs, { accountId: friend.accountId, name: friend.name }]));
    setPendingActiveDm(friend.accountId);
    setTab("chat");
  };
  const closeDmTab = (accountId) => {
    setOpenDmTabs((tabs) => tabs.filter((x) => x.accountId !== accountId));
    // Kapatmak "şimdilik gördüm" demek — hemen ardından tekrar "okunmadı"
    // olarak geri gelmesin diye görüldü sayılıyor.
    // Sunucu zamanı kullanılır: cihaz saati ileride olsa bile sonraki gerçek
    // mesaj "görüldü" sayılıp kaybolmaz.
    setDmSeenAt((seen) => ({ ...(seen || {}), [accountId]: friendLastMessageRef.current[accountId] || Date.now() }));
  };
  const markDmSeen = useCallback((accountId, timestamp) => {
    setDmSeenAt(seen => (seen?.[accountId] || 0) >= timestamp ? seen : { ...(seen || {}), [accountId]: timestamp });
  }, []);

  const notifications = { captain: captainNotice, character: characterNotice, inventory: inventoryNotice, chat: chatNotice || dmUnreadIds.size > 0, friends: friendsNotice };

  return (
    <div className="game-hub" style={styles.hubRoot}>
      <TopBar
        player={player} setPlayer={setPlayer} cls={cls} maxHp={maxHp} def={def} atk={atk}
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
          <ClanTab player={player} setPlayer={setPlayer} cls={cls} atk={atk} def={def} pushToast={pushToast} />
        )}
        {tab === "chat" && (
          <ChatTab
            player={player} setPlayer={setPlayer} bank={bank} setBank={setBank} pushToast={pushToast}
            openDmTabs={openDmTabs} dmUnreadIds={dmUnreadIds} pendingActiveDm={pendingActiveDm}
            onConsumePendingActiveDm={() => setPendingActiveDm(null)}
            onCloseDm={closeDmTab} onSeenDm={markDmSeen}
          />
        )}
        {tab === "friends" && (
          <FriendsPanel player={player} pushToast={pushToast} dmUnreadIds={dmUnreadIds} onOpenDm={openDm} />
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

      {mapBossReadyOpen && !tutorialOpen && !dailyLoginOpen && !firstPurchaseOfferOpen && mapBossCheck.ok && (
        <EventReadyModal
          portrait={<div className="monster-mini-portrait"><MonsterPortrait monster={mapBoss} label={tm(mapBoss)} /></div>}
          title={t("battle.mapBossReadyTitle", { name: tm(mapBoss) })}
          description={t("battle.mapBossDesc")}
          confirmLabel={t("battle.goToBoss")}
          onConfirm={() => { setMapBossReadyOpen(false); setTab("battle"); }}
          onDismiss={() => setMapBossReadyOpen(false)}
        />
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
