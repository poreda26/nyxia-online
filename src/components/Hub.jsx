import { useState } from "react";
import { CLASSES } from "../data/classes";
import { totalStats, playerDef, playerMaxHp } from "../utils/player";
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

  return (
    <div style={styles.hubRoot}>
      <TopBar player={player} cls={cls} maxHp={maxHp} def={def} atk={atk} />

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

      <BottomNav tab={tab} setTab={setTab} />

      {tutorialOpen && <TutorialModal onFinish={closeTutorial} />}
    </div>
  );
}
