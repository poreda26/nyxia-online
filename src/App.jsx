import { createActor } from "./game/client";
import { chargeDiamonds } from "./utils/diamondCharge";
import { startPolling } from "./utils/polling";
import {mergeClanResponse} from './utils/clanResponse';
import {fetchMyClan} from './services/clanService';
import {setActiveCharacterKey} from './utils/api';
import {applyLiveDropConfig} from './utils/dropConfig';
import {call as callGameApi} from './utils/api';
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Settings } from "lucide-react";
import { initialPlayer, migratePlayer, BANK_PAGES, MAX_GOLD, formatGold } from "./utils/player";
import { applyWeeklyRollover } from "./utils/nationalPoint";
import { uid } from "./utils/random";
import { createBgMusicEngine } from "./audio/bgMusic";
import { setSfxVolume, setSfxMuted } from "./audio/sfx";
import { loadSettings, saveSetting, applyDisplaySettings } from "./utils/settings";
import {
  loadAccount, saveCharacterSlot, deleteCharacterSlot, saveAccountRace, changeAccountRace,
  saveAccountBank, saveAccountUnlockedSlots, saveAccountDiamonds, saveAccountBankGold, saveLastUsername, loadLastUsername,
  CHARACTER_SLOTS, DEFAULT_UNLOCKED_SLOTS, THIRD_SLOT_COST_DIAMONDS, CHARACTER_DELETE_COST_DIAMONDS,
  emptyAccount, deleteLocalAccount,
} from "./utils/storage";
import { fetchMe, fetchBackup, pushBackup, logoutAccount, deleteAccountApi } from "./utils/api";
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
  // Açılışta oturum çerezi kontrol edilirken giriş ekranı yanıp sönmesin.
  const [sessionChecked, setSessionChecked] = useState(false);
  // GM yetkisi sunucudan gelir (hesaba bağlı); yerel kayıttaki hiçbir değer yetki vermez.
  const [isGm, setIsGm] = useState(false);
  const [username, setUsername] = useState("");
  const [account, setAccount] = useState({ race: null, characters: [null, null, null], bank: Array.from({ length: BANK_PAGES }, () => []), unlockedSlots: DEFAULT_UNLOCKED_SLOTS, diamonds: 0, bankGold: 0 });
  const [activeSlot, setActiveSlot] = useState(null);
  const [player, setPlayer] = useState(null);
  const [tab, setTab] = useState("battle");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Original streamed music and procedural SFX; independent device settings.
  // Keep gesture retries for autoplay/interruption recovery on mobile browsers.
  useEffect(()=>{
    let disposed=false;
    const refresh=async()=>{try{const rules=await callGameApi('drop-settings','GET');if(!disposed)applyLiveDropConfig(rules.data);}catch{/* offline: keep last successful rules */return false;}};
    // Drop kuralları nadiren değişir: 2 dakikada bir (ve uygulama öne gelince) yeter.
    const stop=startPolling(refresh,120000);
    return()=>{disposed=true;stop();};
  },[username]);
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
    };
    window.addEventListener("pointerdown", startOnGesture);
    window.addEventListener("keydown", startOnGesture);
    return () => {
      window.removeEventListener("pointerdown", startOnGesture);
      window.removeEventListener("keydown", startOnGesture);
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
    applyDisplaySettings(audioSettings);
  }, [audioSettings.theme,audioSettings.reducedMotion,audioSettings.effects,audioSettings.highContrast]);

  useEffect(()=>{
    const sync=()=>{musicRef.current?.setMuted(audioSettings.musicMuted||document.hidden);setSfxMuted(audioSettings.sfxMuted||document.hidden);};
    document.addEventListener('visibilitychange',sync);sync();
    return ()=>document.removeEventListener('visibilitychange',sync);
  },[audioSettings.musicMuted,audioSettings.sfxMuted]);

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

  // Ekonomi eylemleri (bkz. src/game): bayrak kapalıysa kurallar burada, açıksa sunucuda çalışır.
  const gameStateRef = useRef(null);
  gameStateRef.current = { player, bank: account.bank, bankGold: account.bankGold };
  const economyRef = useRef(false);
  const act = useMemo(() => createActor({
    getState: () => gameStateRef.current,
    setPlayer, setBank, setBankGold,
    isServer: () => economyRef.current,
    onRevision: (revision) => { backupRevisionRef.current = revision; },
  }), [setBank, setBankGold]);

  // Faz 2 — hesap artık sadece bu tarayıcıda değil, sunucudaki backup'a da
  // senkronlanıyor (bkz. utils/api.js#fetchBackup/pushBackup). backupRevisionRef
  // sunucunun beklediği bir sonraki sürüm numarasını tutar (iyimser
  // eşzamanlılık — bkz. server/app.mjs#/api/backup). skipNextSyncRef, login
  // sırasında (ya da bir çakışma sonrası) setAccount çağrıldığında hemen
  // arkasından gelen "account değişti, sunucuya gönder" effect'inin bu
  // özel değişikliği tekrar geri göndermesini engeller — sonsuz döngü değil
  // ama gereksiz bir tur olurdu.
  const backupRevisionRef = useRef(0);
  const skipNextSyncRef = useRef(false);

  const migrateAccount = (acc) => ({ ...acc, characters: acc.characters.map((p) => (p ? migratePlayer(p) : p)) });

  const handleLogin = async (name) => {
    setUsername(name);
    fetchMe().then((me) => { setIsGm(!!me.gm); economyRef.current = !!me.economy; }).catch(() => { setIsGm(false); economyRef.current = false; });
    saveLastUsername(name);
    // CharacterSelectScreen render's straight from account.characters (bkz.
    // CLASSES[p.class] look-up'ı) — handlePlay'e kadar migratePlayer hiç
    // çalışmadığından, kaldırılmış bir sınıfta (ör. Priest) kalmış eski bir
    // karakter seçim ekranını hiç açılmadan çökertirdi. Bu yüzden tüm
    // slotlar HEMEN burada, listeye girmeden önce migrate ediliyor.
    const localAcc = migrateAccount(loadAccount(name));
    let finalAccount = localAcc;
    try {
      const backup = await fetchBackup();
      if (backup.revision > 0 && backup.data) {
        // Sunucuda bu hesap için zaten bir yedek var — o, kalıcı/paylaşılan
        // kaynak sayılır (ör. başka bir cihazda oynanmış olabilir).
        finalAccount = migrateAccount(backup.data);
        backupRevisionRef.current = backup.revision;
      } else {
        // İlk senkron — yerel veriyi hiç kaybetmeden sunucuya taşı.
        const pushed = await pushBackup(0, localAcc);
        backupRevisionRef.current = pushed.revision;
      }
    } catch {
      // Backend'e ulaşılamadı (ağ/oturum sorunu) — yerel veriyle devam,
      // bir sonraki hesap değişikliğinde tekrar senkron denenir.
    }
    skipNextSyncRef.current = true;
    setAccount(finalAccount);
    // Race is chosen once per account, before ever seeing character slots —
    // every character created afterward shares it (see RACES caveat).
    setScreen(finalAccount.race ? "characterSelect" : "raceSelect");
  };

  // Sunucudaki oturum çerezi hâlâ geçerliyse (7 gün) her sayfa açılışında
  // yeniden şifre girmeye gerek kalmasın diye — backend yoksa/çerez yoksa
  // fetchMe sessizce reddeder, login ekranı normal şekilde açılır.
  //
  // `cancelled` bayrağı olmadan StrictMode'un dev'de bu effect'i iki kez
  // çalıştırması handleLogin'i (dolayısıyla sunucu senkronunu) art arda iki
  // kez tetikleyip sahte bir 409 çakışmasına yol açıyordu (bkz.
  // WarzoneTab.jsx'in aynı sorunu aynı desenle çözdüğü not) — StrictMode'un
  // mount→cleanup→mount döngüsünde ilk çağrının sonucu artık yok sayılıyor.
  useEffect(() => {
    let cancelled = false;
    fetchMe().then(({ name }) => { if (!cancelled) return handleLogin(name); }).catch(() => {}).finally(() => { if (!cancelled) setSessionChecked(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hesapta gerçek bir değişiklik oldukça (karakter kaydı, depo, elmas,
  // slot açma...) sunucudaki yedeği de güncel tutar — kullanıcı "Faz 2" dedi:
  // karakter artık sadece bu tarayıcıda yaşamıyor. 1.5s'lik gecikme, savaş
  // gibi art arda hızlı değişikliklerde her tık için ayrı istek atmamak için.
  //
  // ÖNEMLİ: `account.characters[activeSlot]` oyun oynanırken React state'inde
  // GÜNCELLENMİYOR — yukarıdaki eski efekt (satır ~136) sadece localStorage'a
  // yazıyor (saveCharacterSlot), account'u değil (diamonds hariç). Asıl
  // güncel karakter oyun sırasında `player`. Bu yüzden gönderilecek veri
  // account'un DEĞİL, player'ın activeSlot'a birleştirilmiş hâli — yoksa
  // sunucuya hep bir tur GERİDE kalmış bir karakter giderdi (bu yüzden
  // canlı testte altın artışı hiç sunucuya ulaşmıyordu).
  useEffect(() => {
    if (!username) return;
    if (skipNextSyncRef.current) { skipNextSyncRef.current = false; return; }
    const payload = activeSlot !== null && player
      ? { ...account, characters: account.characters.map((c, i) => (i === activeSlot ? player : c)) }
      : account;
    const timer = setTimeout(async () => {
      try {
        const result = await pushBackup(backupRevisionRef.current, payload);
        backupRevisionRef.current = result.revision;
      } catch (err) {
        if (err.code !== "BACKUP_CONFLICT") return; // ağ/oturum sorunu — bir sonraki değişiklikte tekrar dener
        try {
          const fresh = await fetchBackup();
          backupRevisionRef.current = fresh.revision;
          if (fresh.data) {
            skipNextSyncRef.current = true;
            setAccount(migrateAccount(fresh.data));
            pushToast(translateWith(audioSettings.language, "app.backupSyncedFromOtherDevice"), "warn");
          }
        } catch { /* sunucuya şu an hiç ulaşılamıyor — sessizce vazgeç */ }
      }
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, player, activeSlot, username]);

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
    setActiveCharacterKey(rolled.id||`slot:${slotIndex}`);
    setPlayer({...rolled,clan:null,clanBossArchive:{...rolled.clanBossArchive,...(rolled.clan?.boss?{[rolled.clan.id]:rolled.clan.boss}:{})}});
    setActiveSlot(slotIndex);
    setTab("battle");
    setScreen("hub");
    // Haftalık sıralama elmasını artık sunucu öder; bekleyen talep Hub'da tahsil edilir
    // ve oradaki bildirim gösterilir (bkz. Hub.jsx, pendingWeeklyClaim).
    void diamondsAwarded; void rank;
  };

  useEffect(()=>{
    if(screen!=='hub'||activeSlot===null)return;
    let alive=true;
    const refresh=()=>fetchMyClan().then(({clan})=>{if(alive)setPlayer(p=>mergeClanResponse(p,clan));}).catch(()=>false);
    // Klan sekmesi açıkken ClanTab kendi 8 sn'lik yoklamasını yapar; arka planda 30 sn yeter.
    const stop=startPolling(refresh,30000);
    return ()=>{alive=false;stop();};
  },[screen,activeSlot]);

  const handleCreate = (slotIndex) => {
    setActiveSlot(slotIndex);
    setScreen("classSelect");
  };

  const handleChooseClass = (cls, nickname) => {
    // Yeni karakter de hesabın paylaşılan elmas havuzunu miras alır — 0'dan
    // başlamaz, aynı account.diamonds'ı görür (bkz. handlePlay'deki aynı not).
    const p = { ...initialPlayer(cls, account.race, nickname), id:uid(), diamonds: account.diamonds };
    saveCharacterSlot(username, activeSlot, p);
    setAccount((a) => {
      const characters = [...a.characters];
      characters[activeSlot] = p;
      return { ...a, characters };
    });
    setActiveCharacterKey(p.id);
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
  const deletingRef=useRef(false);
  const handleDelete = async (slotIndex) => {
    if(deletingRef.current)return;
    deletingRef.current=true;
    try{
    const character=account.characters[slotIndex];
    if(!character)return;
    try{
      const {clan}=await fetchMyClan(character.id||`slot:${slotIndex}`);
      if(clan){pushToast('Karakteri silmeden önce klanından ayrılmalısın.','warn');return;}
    }catch{pushToast('Klan bilgisi doğrulanamadı. Lütfen tekrar dene.','warn');return;}

    if (account.diamonds < CHARACTER_DELETE_COST_DIAMONDS) return;
    const charge = await chargeDiamonds("characterDelete");
    if (!charge.ok) { if (charge.code !== "BUSY") pushToast(translateWith(audioSettings.language, charge.code === "NOT_ENOUGH_DIAMONDS" ? "shop.notEnoughDiamonds" : "wallet.unavailable"), "warn"); return; }
    const nextDiamonds = charge.diamonds;
    deleteCharacterSlot(username, slotIndex);
    saveAccountDiamonds(username, nextDiamonds);
    setAccount((a) => {
      const characters = [...a.characters];
      characters[slotIndex] = null;
      return { ...a, characters, diamonds: nextDiamonds };
    });
    }finally{deletingRef.current=false;}
  };

  // 3. karakter slotu artık hesabın paylaşılan elmas havuzundan açılıyor —
  // eskiden "hangi karakter ödesin" seçimi gerekiyordu (elmas karakter
  // alanıydı), artık tek bir ortak bakiye olduğu için gerek kalmadı.
  const handleUnlockSlot = async () => {
    if (account.diamonds < THIRD_SLOT_COST_DIAMONDS) return;
    const charge = await chargeDiamonds("slotUnlock");
    if (!charge.ok) { if (charge.code !== "BUSY") pushToast(translateWith(audioSettings.language, charge.code === "NOT_ENOUGH_DIAMONDS" ? "shop.notEnoughDiamonds" : "wallet.unavailable"), "warn"); return; }
    const nextDiamonds = charge.diamonds;
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
  const handleUnlockSlotFromHub = async () => {
    if (player.diamonds < THIRD_SLOT_COST_DIAMONDS) return false;
    const charge = await chargeDiamonds("slotUnlock");
    if (!charge.ok) return false;
    setPlayer((p) => ({ ...p, diamonds: charge.diamonds }));
    saveAccountUnlockedSlots(username, CHARACTER_SLOTS);
    setAccount((a) => ({ ...a, unlockedSlots: CHARACTER_SLOTS }));
    return true;
  };

  // Oturum bittiğinde ekranı ve hesap durumunu sıfırlar. Hesap state'i de
  // boşaltılıyor: bir sonraki giriş tamamlanana kadar eski hesabın verisi
  // başka bir oturumun yedeğine gitmesin.
  const resetSession = () => {
    setIsGm(false);
    economyRef.current = false;
    setPlayer(null);
    setActiveSlot(null);
    setUsername("");
    setAccount(emptyAccount());
    skipNextSyncRef.current = false;
    setScreen("login");
  };

  // Çıkış artık sunucu oturumunu da kapatıyor (önceden sadece ekran
  // değişiyordu, sayfa yenilenince fetchMe kullanıcıyı geri alıyordu; yerel
  // uygulamada ise token cihazda kalıyordu). Son değişiklikler 1.5 sn'lik
  // gecikmeli senkron beklerken oturum kapanıp kaybolmasın diye önce bir
  // son yedek gönderilir.
  const handleLogout = async () => {
    if (username) {
      try {
        const payload = activeSlot !== null && player
          ? { ...account, characters: account.characters.map((c, i) => (i === activeSlot ? player : c)) }
          : account;
        const result = await pushBackup(backupRevisionRef.current, payload);
        backupRevisionRef.current = result.revision;
      } catch { /* ağ/çakışma — çıkışı engelleme */ }
    }
    try { await logoutAccount(); } catch { /* sunucuya ulaşılamıyorsa yerel çıkış yine de yapılır */ }
    resetSession();
  };

  const handleDeleteAccount = async (password) => {
    await deleteAccountApi(password);
    deleteLocalAccount(username);
    setSettingsOpen(false);
    resetSession();
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
      {screen === "login" && sessionChecked && <LoginScreen initialUsername={initialUsername} onLogin={handleLogin} />}
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
          act={act}
          isGm={isGm}
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
          preferences={audioSettings} onPreferenceChange={updateAudioSetting}
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
          onDeleteAccount={screen !== "login" ? handleDeleteAccount : undefined}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
    </LanguageProvider>
  );
}
