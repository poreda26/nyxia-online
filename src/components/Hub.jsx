import { CLASSES } from "../data/classes";
import { totalStats, playerDef } from "../utils/player";
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

export default function Hub({ player, setPlayer, bank, setBank, tab, setTab, pushToast, onChangeCharacter, onChangeRace }) {
  const cls = CLASSES[player.class];
  const { hp: gearHp, atk } = totalStats(player);
  const def = playerDef(player);

  return (
    <div style={styles.hubRoot}>
      <TopBar player={player} cls={cls} gearHp={gearHp} def={def} atk={atk} />

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
          <CharacterTab player={player} setPlayer={setPlayer} cls={cls} gearHp={gearHp} def={def} atk={atk} pushToast={pushToast} onChangeCharacter={onChangeCharacter} />
        )}
      </div>

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
