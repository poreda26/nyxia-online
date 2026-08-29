import { useState, useRef, useCallback, useEffect } from "react";
import { initialPlayer, migratePlayer, BANK_PAGES } from "./utils/player";
import { applyWeeklyRollover } from "./utils/nationalPoint";
import { uid } from "./utils/random";
import {
  loadAccount, saveCharacterSlot, deleteCharacterSlot, saveAccountRace, changeAccountRace,
  saveAccountBank, saveAccountUnlockedSlots, saveLastUsername, loadLastUsername,
  CHARACTER_SLOTS, DEFAULT_UNLOCKED_SLOTS, THIRD_SLOT_COST_DIAMONDS,
} from "./utils/storage";
import { styles } from "./styles";
import GlobalStyle from "./components/GlobalStyle";
import LoginScreen from "./components/LoginScreen";
import CharacterSelectScreen from "./components/CharacterSelectScreen";
import RaceSelect from "./components/RaceSelect";
import ClassSelect from "./components/ClassSelect";
import Hub from "./components/Hub";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [username, setUsername] = useState("");
  const [account, setAccount] = useState({ race: null, characters: [null, null, null], bank: Array.from({ length: BANK_PAGES }, () => []), unlockedSlots: DEFAULT_UNLOCKED_SLOTS });
  const [activeSlot, setActiveSlot] = useState(null);
  const [player, setPlayer] = useState(null);
  const [tab, setTab] = useState("battle");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const pushToast = useCallback((msg, tone = "default") => {
    setToast({ msg, tone, id: uid() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const initialUsername = loadLastUsername();

  // Every change to the active character is written straight back to its
  // slot — this is the game's only save mechanism (see utils/storage.js),
  // so skipping it would silently lose progress on refresh/close.
  useEffect(() => {
    if (screen === "hub" && player && activeSlot !== null) {
      saveCharacterSlot(username, activeSlot, player);
    }
  }, [player, screen, activeSlot, username]);

  // Depo is account-wide (shared across all 3 character slots), so it saves
  // independently of the active character — see utils/storage.js#loadAccount.
  useEffect(() => {
    if (screen === "hub" && account.bank) {
      saveAccountBank(username, account.bank);
    }
  }, [account.bank, screen, username]);

  const setBank = useCallback((updater) => {
    setAccount((a) => ({ ...a, bank: typeof updater === "function" ? updater(a.bank) : updater }));
  }, []);

  const handleLogin = (name) => {
    setUsername(name);
    saveLastUsername(name);
    const acc = loadAccount(name);
    setAccount(acc);
    // Race is chosen once per account, before ever seeing character slots —
    // every character created afterward shares it (see RACES caveat).
    setScreen(acc.race ? "characterSelect" : "raceSelect");
  };

  const handleChooseAccountRace = (race) => {
    saveAccountRace(username, race);
    setAccount((a) => ({ ...a, race }));
    setScreen("characterSelect");
  };

  const handlePlay = (slotIndex) => {
    const migrated = migratePlayer(account.characters[slotIndex]);
    const { player: rolled, diamondsAwarded, rank } = applyWeeklyRollover(migrated);
    setPlayer(rolled);
    setActiveSlot(slotIndex);
    setTab("battle");
    setScreen("hub");
    if (diamondsAwarded > 0) {
      pushToast(`Geçen haftaki Savaş Alanı sıralamasında ${rank}. oldun! +${diamondsAwarded} Elmas`, "loot");
    }
  };

  const handleCreate = (slotIndex) => {
    setActiveSlot(slotIndex);
    setScreen("classSelect");
  };

  const handleChooseClass = (cls, nickname) => {
    const p = initialPlayer(cls, account.race, nickname);
    saveCharacterSlot(username, activeSlot, p);
    setAccount((a) => {
      const characters = [...a.characters];
      characters[activeSlot] = p;
      return { ...a, characters };
    });
    setPlayer(p);
    setTab("battle");
    setScreen("hub");
  };

  const handleDelete = (slotIndex) => {
    deleteCharacterSlot(username, slotIndex);
    setAccount((a) => {
      const characters = [...a.characters];
      characters[slotIndex] = null;
      return { ...a, characters };
    });
  };

  // 3. karakter slotu — mevcut karakterlerden birinin ELMASIYLA açılıyor,
  // hesap genelinde ayrı bir elmas havuzu olmadığı için (bkz. utils/storage.js
  // #THIRD_SLOT_COST_DIAMONDS). payerSlotIndex CharacterSelectScreen'de
  // seçilen, yeterli elması olan bir karakterin slotu.
  const handleUnlockSlot = (payerSlotIndex) => {
    const payer = account.characters[payerSlotIndex];
    if (!payer || payer.diamonds < THIRD_SLOT_COST_DIAMONDS) return;
    const paidPlayer = { ...payer, diamonds: payer.diamonds - THIRD_SLOT_COST_DIAMONDS };
    saveCharacterSlot(username, payerSlotIndex, paidPlayer);
    saveAccountUnlockedSlots(username, CHARACTER_SLOTS);
    setAccount((a) => {
      const characters = [...a.characters];
      characters[payerSlotIndex] = paidPlayer;
      return { ...a, characters, unlockedSlots: CHARACTER_SLOTS };
    });
  };

  const handleLogout = () => {
    setPlayer(null);
    setActiveSlot(null);
    setScreen("login");
  };

  const handleChangeCharacter = () => {
    setAccount(loadAccount(username));
    setPlayer(null);
    setActiveSlot(null);
    setScreen("characterSelect");
  };

  // Special Market's race-change scroll — race is account-wide, so this
  // patches every saved character slot too, not just the one in play.
  const handleChangeRace = (newRace) => {
    const nextAccount = changeAccountRace(username, newRace);
    setAccount(nextAccount);
    setPlayer((p) => (p ? { ...p, race: newRace } : p));
  };

  return (
    <div style={styles.appRoot}>
      <GlobalStyle />
      {screen === "login" && <LoginScreen initialUsername={initialUsername} onLogin={handleLogin} />}
      {screen === "raceSelect" && <RaceSelect onChoose={handleChooseAccountRace} />}
      {screen === "characterSelect" && (
        <CharacterSelectScreen
          username={username}
          characters={account.characters}
          unlockedSlots={account.unlockedSlots}
          onPlay={handlePlay}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onUnlockSlot={handleUnlockSlot}
          onLogout={handleLogout}
        />
      )}
      {screen === "classSelect" && <ClassSelect onChoose={handleChooseClass} />}
      {screen === "hub" && player && (
        <Hub
          player={player}
          setPlayer={setPlayer}
          bank={account.bank}
          setBank={setBank}
          tab={tab}
          setTab={setTab}
          pushToast={pushToast}
          onChangeCharacter={handleChangeCharacter}
          onChangeRace={handleChangeRace}
        />
      )}
      {toast && (
        <div className={`toast toast-${toast.tone}`} key={toast.id}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
