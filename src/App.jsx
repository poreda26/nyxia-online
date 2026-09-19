import { useState, useRef, useCallback, useEffect } from "react";
import { Settings } from "lucide-react";
import { initialPlayer, migratePlayer, BANK_PAGES, MAX_GOLD, formatGold } from "./utils/player";
import { applyWeeklyRollover } from "./utils/nationalPoint";
import { uid } from "./utils/random";
import { createBgMusicEngine } from "./audio/bgMusic";
import { setSfxVolume, setSfxMuted } from "./audio/sfx";
import { loadSettings, saveSetting } from "./utils/settings";
import {
  loadAccount, saveCharacterSlot, deleteCharacterSlot, saveAccountRace, changeAccountRace,
  saveAccountBank, saveAccountUnlockedSlots, saveAccountDiamonds, saveAccountBankGold, saveLastUsername, loadLastUsername,
  CHARACTER_SLOTS, DEFAULT_UNLOCKED_SLOTS, THIRD_SLOT_COST_DIAMONDS, CHARACTER_DELETE_COST_DIAMONDS,
} from "./utils/storage";
import { styles } from "./styles";
import GlobalStyle from "./components/GlobalStyle";
import LoginScreen from "./components/LoginScreen";
import CharacterSelectScreen from "./components/CharacterSelectScreen";
import RaceSelect from "./components/RaceSelect";
import ClassSelect from "./components/ClassSelect";
import Hub from "./components/Hub";
import SettingsModal from "./components/SettingsModal";
import { LanguageProvider, useTranslation, translateWith } from "./i18n/LanguageContext";

// Ayrı bir bileşen olarak tanımlanmasının tek sebebi useTranslation() —
// App'in kendisi LanguageProvider'ı SARDIĞI için (bir alt bileşeni değil)
// hook'u doğrudan çağıramaz; bu küçük bileşen Provider'ın altında render
// edildiği için sorunsuz çalışıyor.
function FloatingSettingsButton({ onClick }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      title={t("settings.title")}
      style={{
        position: "absolute", top: 10, right: 10, zIndex: 40,
        width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(11,12,16,0.55)", border: "1px solid var(--border)",
        color: "#D4AF6A", cursor: "pointer", padding: 0,
      }}
    >
      <Settings size={14} />
    </button>
  );
}

export default function App() {
  const [screen, setScreen] = useState("login");
  const [username, setUsername] = useState("");
  const [account, setAccount] = useState({ race: null, characters: [null, null, null], bank: Array.from({ length: BANK_PAGES }, () => []), unlockedSlots: DEFAULT_UNLOCKED_SLOTS, diamonds: 0, bankGold: 0 });
  const [activeSlot, setActiveSlot] = useState(null);
  const [player, setPlayer] = useState(null);
  const [tab, setTab] = useState("battle");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Arka plan müziği + savaş efektleri — kullanıcı isteği: "knight online
  // fon müziğine benzeyen efsane bir arka plan müziği" ve ardından "ses
  // kısıp yükseltme seçeneğimiz olsun... savaştayken vuruş animasyon sesi
  // istiyorum". Müzik Web Audio API ile canlı sentezleniyor (bkz.
  // audio/bgMusic.js), efektler de aynı şekilde (bkz. audio/sfx.js) — hiçbir
  // ses dosyası yok. Ses seviyesi/mute tercihleri hesaba değil cihaza bağlı
  // (localStorage, bkz. utils/settings.js). Tarayıcılar sesi ancak bir
  // kullanıcı jestinden sonra başlatmaya izin verdiği için motor ilk
  // pointerdown'da başlatılıyor; müzik login'den Hub'a kadar aralıksız
  // çalıyor, efektler BattleTab.jsx'ten doğrudan audio/sfx.js'i çağırıyor.
  const musicRef = useRef(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [audioSettings, setAudioSettings] = useState(loadSettings);
  useEffect(() => {
    musicRef.current = createBgMusicEngine();
    musicRef.current.setVolume(audioSettings.musicVolume / 100);
    musicRef.current.setMuted(audioSettings.musicMuted);
    setSfxVolume(audioSettings.sfxVolume / 100);
    setSfxMuted(audioSettings.sfxMuted);
    const startOnGesture = () => {
      musicRef.current.start();
      window.removeEventListener("pointerdown", startOnGesture);
    };
    window.addEventListener("pointerdown", startOnGesture);
    return () => {
      window.removeEventListener("pointerdown", startOnGesture);
      musicRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateAudioSetting = (key, value) => {
    setAudioSettings((prev) => ({ ...prev, [key]: value }));
    saveSetting(key, value);
    if (key === "musicVolume") musicRef.current?.setVolume(value / 100);
    else if (key === "musicMuted") musicRef.current?.setMuted(value);
    else if (key === "sfxVolume") setSfxVolume(value / 100);
    else if (key === "sfxMuted") setSfxMuted(value);
  };

  // Kullanıcı isteği: "Oyunumuz çok Dark temada... daha light bir tema
  // yapabiliriz" — GlobalStyle.jsx'in `:root[data-theme="light"]` CSS
  // bloğu bu attribute'u dinliyor (bkz. o dosyadaki renk değişkenleri).
  // <html> üzerine yazıyoruz ki :root seçicisiyle eşleşsin.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", audioSettings.theme);
  }, [audioSettings.theme]);

  // Kullanıcı: loot bildirimini "yakalamakta zorlanıyorum" — 2.6s özellikle
  // öldürme bildirimi gibi çok parçalı (altın+XP+drop+görev) mesajlar için
  // yetersizdi, 3.6s'ye çıkarıldı (bkz. GlobalStyle.jsx'teki görsel
  // güçlendirmeyle birlikte).
  const pushToast = useCallback((msg, tone = "default") => {
    setToast({ msg, tone, id: uid() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3600);
  }, []);

  const initialUsername = loadLastUsername();

  // Every change to the active character is written straight back to its
  // slot — this is the game's only save mechanism (see utils/storage.js),
  // so skipping it would silently lose progress on refresh/close.
  //
  // Kullanıcı isteği: "Elmaslar hesaba bağlı olacak. Karakter bazında
  // değişmeyecek." — player.diamonds hâlâ var (her yerde okunan/yazılan
  // alan değişmedi, blast radius küçük kalsın diye), ama artık sadece
  // AKTİF karakterin geçici bir yansıması: her değiştiğinde buradan
  // account.diamonds'a (gerçek, paylaşılan kaynak) geri yazılıyor. Bir
  // karakter oynanmaya başladığında (handlePlay/handleChooseClass) de aynı
  // account.diamonds'tan senkronize ediliyor, yani hangi karakteri
  // açarsan aç hep aynı havuzu görürsün.
  // Kullanıcı isteği: "Karakterin üstünde en fazla 2.000.000.000 gold
  // bulunabilir... bu paranın üstüne çıkmaya çalışıldığında sistem buna
  // izin vermesin." — asıl bloklama InventoryTab'ın Yatır/Çek'inde ve GM
  // /altın komutunda anında olur (bkz. o dosyalar), ama gold'un ARTABİLECEĞİ
  // her yol (canavar öldürme, sandık, Pazar satışı, GM komutları...) buraya
  // kadar sonunda player state'i değiştirdiği için, burası son bir güvenlik
  // ağı: tavanı aşan HERHANGİ bir yoldan gelen artış burada yakalanıp
  // kırpılıyor ve kullanıcıya haber veriliyor.
  useEffect(() => {
    if (screen === "hub" && player && activeSlot !== null) {
      if (player.gold > MAX_GOLD) {
        setPlayer((p) => ({ ...p, gold: MAX_GOLD }));
        pushToast(translateWith(audioSettings.language, "app.goldCapTrimmedCharacter", { max: formatGold(MAX_GOLD) }), "warn");
        return;
      }
      saveCharacterSlot(username, activeSlot, player);
      if (player.diamonds !== account.diamonds) {
        setAccount((a) => ({ ...a, diamonds: player.diamonds }));
        saveAccountDiamonds(username, player.diamonds);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, screen, activeSlot, username]);

  // Depo is account-wide (shared across all 3 character slots), so it saves
  // independently of the active character — see utils/storage.js#loadAccount.
  useEffect(() => {
    if (screen === "hub" && account.bank) {
      saveAccountBank(username, account.bank);
    }
  }, [account.bank, screen, username]);

  // Depodaki paylaşılan altın — kullanıcı isteği: "Altın depoya atılabilsin.
  // Yan karakterden altın alınabilir bu şekilde." bank ile aynı desen. Aynı
  // tavan güvenlik ağı player.gold ile aynı mantıkla burada da var (bkz.
  // yukarıdaki not).
  useEffect(() => {
    if (screen === "hub" && typeof account.bankGold === "number") {
      if (account.bankGold > MAX_GOLD) {
        setAccount((a) => ({ ...a, bankGold: MAX_GOLD }));
        pushToast(translateWith(audioSettings.language, "app.goldCapTrimmedBank", { max: formatGold(MAX_GOLD) }), "warn");
        return;
      }
      saveAccountBankGold(username, account.bankGold);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.bankGold, screen, username]);

  const setBank = useCallback((updater) => {
    setAccount((a) => ({ ...a, bank: typeof updater === "function" ? updater(a.bank) : updater }));
  }, []);

  const setBankGold = useCallback((updater) => {
    setAccount((a) => ({ ...a, bankGold: typeof updater === "function" ? updater(a.bankGold) : updater }));
  }, []);

  const handleLogin = (name) => {
    setUsername(name);
    saveLastUsername(name);
    const acc = loadAccount(name);
    // CharacterSelectScreen render's straight from account.characters (bkz.
    // CLASSES[p.class] look-up'ı) — handlePlay'e kadar migratePlayer hiç
    // çalışmadığından, kaldırılmış bir sınıfta (ör. Priest) kalmış eski bir
    // karakter seçim ekranını hiç açılmadan çökertirdi. Bu yüzden tüm
    // slotlar HEMEN burada, listeye girmeden önce migrate ediliyor.
    setAccount({ ...acc, characters: acc.characters.map((p) => (p ? migratePlayer(p) : p)) });
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
    // Hangi karakteri oynarsak oynayalım, elmas her zaman hesabın paylaşılan
    // havuzundan gelir — applyWeeklyRollover'dan ÖNCE senkronize ediliyor ki
    // Savaş Alanı haftalık ödülü (varsa) doğru (güncel, paylaşılan) taban
    // üzerine eklensin, karakterin üstünde kalmış eski/bayat değere değil.
    const migrated = { ...migratePlayer(account.characters[slotIndex]), diamonds: account.diamonds };
    const { player: rolled, diamondsAwarded, rank } = applyWeeklyRollover(migrated);
    setPlayer(rolled);
    setActiveSlot(slotIndex);
    setTab("battle");
    setScreen("hub");
    if (diamondsAwarded > 0) {
      pushToast(translateWith(audioSettings.language, "app.warzoneRankReward", { rank, diamonds: diamondsAwarded }), "loot");
    }
  };

  const handleCreate = (slotIndex) => {
    setActiveSlot(slotIndex);
    setScreen("classSelect");
  };

  const handleChooseClass = (cls, nickname) => {
    // Yeni karakter de hesabın paylaşılan elmas havuzunu miras alır — 0'dan
    // başlamaz, aynı account.diamonds'ı görür (bkz. handlePlay'deki aynı not).
    const p = { ...initialPlayer(cls, account.race, nickname), diamonds: account.diamonds };
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

  // Silme bedeli artık hesabın paylaşılan elmas havuzundan düşüyor — eskiden
  // "bedel, silinen karakterin üstündeki elmasla birlikte yok oluyor"
  // örtük mantığı vardı (elmas karakter alanıydı), o mantık artık geçersiz
  // (bkz. CharacterSelectScreen'in canAfford kontrolü, artık account.diamonds
  // kullanıyor) — o yüzden burada AÇIKÇA düşülmesi gerekiyor, yoksa silme
  // bedavaya gelirdi.
  const handleDelete = (slotIndex) => {
    if (account.diamonds < CHARACTER_DELETE_COST_DIAMONDS) return;
    const nextDiamonds = account.diamonds - CHARACTER_DELETE_COST_DIAMONDS;
    deleteCharacterSlot(username, slotIndex);
    saveAccountDiamonds(username, nextDiamonds);
    setAccount((a) => {
      const characters = [...a.characters];
      characters[slotIndex] = null;
      return { ...a, characters, diamonds: nextDiamonds };
    });
  };

  // 3. karakter slotu artık hesabın paylaşılan elmas havuzundan açılıyor —
  // eskiden "hangi karakter ödesin" seçimi gerekiyordu (elmas karakter
  // alanıydı), artık tek bir ortak bakiye olduğu için gerek kalmadı.
  const handleUnlockSlot = () => {
    if (account.diamonds < THIRD_SLOT_COST_DIAMONDS) return;
    const nextDiamonds = account.diamonds - THIRD_SLOT_COST_DIAMONDS;
    saveAccountDiamonds(username, nextDiamonds);
    saveAccountUnlockedSlots(username, CHARACTER_SLOTS);
    setAccount((a) => ({ ...a, diamonds: nextDiamonds, unlockedSlots: CHARACTER_SLOTS }));
  };

  // handleUnlockSlot'un Hub-içi (oyun oynanırken) versiyonu — o, account.diamonds'a
  // doğrudan yazıyor, ama Hub açıkken account.diamonds sadece player.diamonds'tan
  // TEK YÖNLÜ senkronize oluyor (bkz. yukarıdaki useEffect, satır ~128). Burada
  // account'u da yazarsak, player birazdan başka bir sebeple değişince o effect
  // account.diamonds'ı eski (daha yüksek) player.diamonds değerine geri döndürüp
  // bu düşüşü sessizce iptal eder — o yüzden elmas kesintisi player.diamonds
  // üzerinden yapılıyor, unlockedSlots ise (o effect'in dokunmadığı ayrı bir alan
  // olduğu için) doğrudan account'a yazılabiliyor.
  const handleUnlockSlotFromHub = () => {
    if (player.diamonds < THIRD_SLOT_COST_DIAMONDS) return false;
    setPlayer((p) => ({ ...p, diamonds: p.diamonds - THIRD_SLOT_COST_DIAMONDS }));
    saveAccountUnlockedSlots(username, CHARACTER_SLOTS);
    setAccount((a) => ({ ...a, unlockedSlots: CHARACTER_SLOTS }));
    return true;
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
    <LanguageProvider lang={audioSettings.language} setLang={(l) => updateAudioSetting("language", l)}>
    <div style={styles.appRoot}>
      <GlobalStyle />
      {screen === "login" && <LoginScreen initialUsername={initialUsername} onLogin={handleLogin} />}
      {screen === "raceSelect" && <RaceSelect onChoose={handleChooseAccountRace} />}
      {screen === "characterSelect" && (
        <CharacterSelectScreen
          username={username}
          characters={account.characters}
          unlockedSlots={account.unlockedSlots}
          diamonds={account.diamonds}
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
          bankGold={account.bankGold}
          setBankGold={setBankGold}
          username={username}
          tab={tab}
          setTab={setTab}
          pushToast={pushToast}
          onChangeCharacter={handleChangeCharacter}
          onChangeRace={handleChangeRace}
          onOpenSettings={() => setSettingsOpen(true)}
          unlockedSlots={account.unlockedSlots}
          onUnlockSlot={handleUnlockSlotFromHub}
        />
      )}
      {toast && (
        <div className={`toast toast-${toast.tone}`} key={toast.id}>
          {toast.msg}
        </div>
      )}

      {/* Hub ekranında Ayarlar artık TopBar'ın kendi satırında (bkz.
          TopBar.jsx) — burada da gösterirsek Hediye ikonunun tam üstüne
          biniyordu (kullanıcının bildirdiği çakışma bug'ı). Diğer ekranlarda
          (login/karakter seçimi/sınıf seçimi) TopBar yok, o yüzden bu yüzen
          buton hâlâ gerekli. */}
      {screen !== "hub" && <FloatingSettingsButton onClick={() => setSettingsOpen(true)} />}

      {settingsOpen && (
        <SettingsModal
          musicVolume={audioSettings.musicVolume}
          musicMuted={audioSettings.musicMuted}
          onMusicVolumeChange={(v) => updateAudioSetting("musicVolume", v)}
          onToggleMusicMute={() => updateAudioSetting("musicMuted", !audioSettings.musicMuted)}
          sfxVolume={audioSettings.sfxVolume}
          sfxMuted={audioSettings.sfxMuted}
          onSfxVolumeChange={(v) => updateAudioSetting("sfxVolume", v)}
          onToggleSfxMute={() => updateAudioSetting("sfxMuted", !audioSettings.sfxMuted)}
          lang={audioSettings.language}
          onLangChange={(l) => updateAudioSetting("language", l)}
          theme={audioSettings.theme}
          onThemeChange={(v) => updateAudioSetting("theme", v)}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
    </LanguageProvider>
  );
}
