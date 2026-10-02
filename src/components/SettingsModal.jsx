import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Capacitor} from '@capacitor/core';
import TutorialModal from './TutorialModal';
import './SettingsPanel.css';
import { Settings, X, Volume2, VolumeX, Languages, SunMedium, Bell, BellOff } from "lucide-react";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";
import { LEGAL_LINKS } from "../data/legalLinks";
import { isPushSupported, notificationPermission, getCurrentPushSubscription, enablePushNotifications, disablePushNotifications } from "../utils/pushNotifications";
import { fetchPushPrefs, updatePushPrefs } from "../services/pushService";

// Ses ayarları — App.jsx'teki müzik/efekt motorlarına doğrudan bağlı (bkz.
// audio/bgMusic.js, audio/sfx.js). Hesaba değil cihaza bağlı bir tercih
// olduğu için App.jsx localStorage'da tutuyor, burası sadece görüntülüyor.
function VolumeRow({ label, volume, muted, onVolumeChange, onToggleMute, t }) {
  const effectivelyOff = muted || volume === 0;
  return (
    <div className="settings-slider-row" style={styles.sliderRow}>
      <div style={styles.sliderLabelRow}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            aria-label={label} aria-pressed={!effectivelyOff} onClick={onToggleMute}
            title={muted ? t("settings.muteOff") : t("settings.muteOn")}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", color: effectivelyOff ? "var(--text-faint)" : "#5FA8A0" }}
          >
            {effectivelyOff ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-mono)" }}>{muted ? t("settings.off") : `%${volume}`}</span>
      </div>
      <input
        aria-label={label} type="range" min={0} max={100} step={5}
        value={muted ? 0 : volume}
        onChange={(e) => onVolumeChange(parseInt(e.target.value, 10))}
        disabled={muted}
        style={{ ...styles.sliderInput, opacity: muted ? 0.5 : 1 }}
      />
    </div>
  );
}

// Kullanıcı isteği: "İngilizce dil seçeneği ekle." — bu ilk turda sadece
// oyunun menü/buton iskeleti çevrildi (bkz. i18n/translations.js'in
// üstündeki not), o yüzden dil değişimi anında ama kapsam kısmi.
function LanguageRow({ lang, onLangChange, t }) {
  return (
    <div className="settings-slider-row" style={styles.sliderRow}>
      <div style={styles.sliderLabelRow}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Languages size={14} color="#8B6FC9" /> {t("settings.language")}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[["tr", "Türkçe"], ["en", "English"]].map(([code, label]) => (
          <button
            key={code}
            aria-pressed={lang===code} onClick={() => onLangChange(code)}
            style={{
              ...styles.tinyBtn, flex: 1,
              background: lang === code ? "#8B6FC9" : "var(--bg-panel-alt)",
              color: lang === code ? "#fff" : "var(--text-muted)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Kullanıcı isteği: "Oyunumuz çok Dark temada, daha light bir tema
// yapabiliriz" — LanguageRow ile birebir aynı iki-seçenekli desen.
function ThemeRow({ theme, onThemeChange, t }) {
  return (
    <div className="settings-slider-row" style={styles.sliderRow}>
      <div style={styles.sliderLabelRow}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <SunMedium size={14} color="var(--gold-text)" /> {t("settings.theme")}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[["dark", t("settings.themeDark")], ["light", t("settings.themeLight")]].map(([code, label]) => (
          <button
            key={code}
            aria-pressed={theme===code} onClick={() => onThemeChange(code)}
            style={{
              ...styles.tinyBtn, flex: 1,
              background: theme === code ? "#D4AF6A" : "var(--bg-panel-alt)",
              color: theme === code ? "#15171E" : "var(--text-muted)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}


function Toggle({label,description,value,onChange}){
 return <label className="preference-toggle"><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" role="switch" checked={!!value} onChange={e=>onChange(e.target.checked)}/><i aria-hidden="true"/></label>;
}

// Kullanıcı isteği: "telefona bildirim gönderme sistemini kurmanı
// istiyorum... Ayarlar kısmında bu bildirimleri istediği gibi açıp
// kapatabilir." Bu bölüm kendi durumunu kendi yönetiyor (App.jsx'ten hiçbir
// prop almıyor) — abonelik/izin durumu hesaba değil TARAYICIYA bağlı, bu
// yüzden audio/haptics gibi App.jsx'in localStorage tercih torbasına
// (preferences/onPreferenceChange) girmiyor; kategori tercihleri de
// (inactivity/events/social) sunucuda hesap başına tutuluyor (bkz.
// services/pushService.js), cihaza değil.
function NotificationsSection({ tr, t }) {
  const [status, setStatus] = useState("checking"); // checking | unsupported | off | denied | on
  const [prefs, setPrefs] = useState({ inactivity: true, events: true, social: true });
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (!isPushSupported()) { setStatus("unsupported"); return; }
    const permission = notificationPermission();
    if (permission === "denied") { setStatus("denied"); return; }
    const subscription = await getCurrentPushSubscription();
    if (!subscription) { setStatus("off"); return; }
    setStatus("on");
    try { setPrefs(await fetchPushPrefs()); } catch { /* geçici ağ hatası — mevcut varsayılanlar kalır */ }
  };

  useEffect(() => { refresh(); }, []);

  const handleEnable = async () => {
    if (busy) return;
    setBusy(true);
    const result = await enablePushNotifications();
    setBusy(false);
    if (!result.ok) { setStatus(result.reason === "denied" ? "denied" : "off"); return; }
    await refresh();
  };
  const handleDisable = async () => {
    if (busy) return;
    setBusy(true);
    await disablePushNotifications();
    setBusy(false);
    setStatus("off");
  };
  const handlePrefChange = async (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try { await updatePushPrefs(next); } catch { /* geçici ağ hatası — bir sonraki açılışta sunucudaki eski değer geri yüklenir */ }
  };

  return (
    <>
      <div className="settings-group">
        <h3>{tr ? "Bildirimler" : "Notifications"}</h3>
        {status === "checking" && <p>{tr ? "Kontrol ediliyor…" : "Checking…"}</p>}
        {status === "unsupported" && (
          <p>{tr ? "Bu tarayıcı push bildirimini desteklemiyor. iPhone'da Safari'de çalışması için siteyi \"Ana Ekrana Ekle\" ile eklemen gerekir (iOS 16.4+) — bu, kodla aşılamayan bir Apple kısıtı." : "This browser doesn't support push notifications. On iPhone Safari, add the site to your Home Screen first (iOS 16.4+) — that's an Apple platform limit, not something we can code around."}</p>
        )}
        {status === "denied" && (
          <p>{tr ? "Bildirim izni tarayıcı ayarlarından reddedilmiş. Açmak için tarayıcının site ayarlarından izni değiştirmen gerekiyor." : "Notification permission was denied in the browser. Re-enable it from the browser's site settings to turn this back on."}</p>
        )}
        {status === "off" && (
          <button className="rpg-action" style={{ ...styles.tinyBtn, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} disabled={busy} onClick={handleEnable}>
            <Bell size={13} /> {busy ? (tr ? "Açılıyor…" : "Enabling…") : (tr ? "Bildirimleri Aç" : "Enable Notifications")}
          </button>
        )}
        {status === "on" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5FA8A0", marginBottom: 10 }}>
              <Bell size={13} /> {tr ? "Bildirimler açık" : "Notifications are on"}
            </div>
            <Toggle
              label={tr ? "İnaktiflik hatırlatması" : "Inactivity reminders"}
              description={tr ? "Bir süredir oyuna girmediysen hatırlatma alırsın." : "Get a nudge if you haven't played in a while."}
              value={prefs.inactivity} onChange={(v) => handlePrefChange("inactivity", v)}
            />
            <Toggle
              label={tr ? "Etkinlik hatırlatmaları" : "Event reminders"}
              description={tr ? "Zamanlı etkinlikler başlamadan birkaç dakika önce bildirim alırsın." : "Get notified a few minutes before scheduled events start."}
              value={prefs.events} onChange={(v) => handlePrefChange("events", v)}
            />
            <Toggle
              label={tr ? "Arkadaş ve mesaj bildirimleri" : "Friend & message notifications"}
              description={tr ? "Yeni bir özel mesaj ya da arkadaşlık isteği geldiğinde bildirim alırsın." : "Get notified about new DMs and friend requests."}
              value={prefs.social} onChange={(v) => handlePrefChange("social", v)}
            />
            <button className="rpg-action" style={{ ...styles.tinyBtn, width: "100%", marginTop: 10, background: "var(--bg-panel-alt)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} disabled={busy} onClick={handleDisable}>
              <BellOff size={13} /> {busy ? (tr ? "Kapatılıyor…" : "Disabling…") : (tr ? "Bildirimleri Kapat" : "Disable Notifications")}
            </button>
          </>
        )}
      </div>
    </>
  );
}
// Mağaza politikaları (Apple 5.1.1(v), Google Play) uygulama içinden hesap
// silmeyi zorunlu kılıyor. Şifre yeniden isteniyor: açık bir cihazdan tek
// dokunuşla geri döndürülemez silme yapılamasın.
const DELETE_ERRORS = {
  WRONG_PASSWORD: ['Şifre yanlış.', 'Wrong password.'],
  OWNER_CANNOT_DELETE: ['Panel sahibi hesabı silinemez.', 'The panel owner account cannot be deleted.'],
  TOO_MANY_ATTEMPTS: ['Çok fazla deneme. Biraz bekleyip tekrar dene.', 'Too many attempts. Wait a bit and try again.'],
};
const accountButton = { padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-panel-alt)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 13 };
const accountDangerButton = { ...accountButton, color: '#E8A5AF', borderColor: '#71404d', background: 'rgba(232,66,90,0.12)' };
function AccountSection({ tr, onDeleteAccount }) {
  const [step, setStep] = useState('idle'), [password, setPassword] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const submit = async () => {
    if (busy || !password) return;
    setBusy(true); setError('');
    try { await onDeleteAccount(password); }
    catch (err) {
      const message = DELETE_ERRORS[err.code];
      setError(message ? message[tr ? 0 : 1] : (tr ? 'Hesap silinemedi. Bağlantını kontrol edip tekrar dene.' : 'Could not delete the account. Check your connection and try again.'));
      setBusy(false);
    }
  };
  return (
    <div className="settings-group">
      <h3>{tr ? 'Hesabı sil' : 'Delete account'}</h3>
      <p>{tr ? 'Hesabın; karakterlerin, envanterin, elmasların, arkadaşlıkların ve mesajların dahil sunucudan kalıcı olarak silinir. Bu işlem geri alınamaz. Klan lideriysen liderlik sıradaki üyeye geçer.' : 'Your account is permanently deleted from the server, including characters, inventory, diamonds, friendships and messages. This cannot be undone. If you lead a clan, leadership passes to the next member.'}</p>
      {step === 'idle' && <button onClick={() => setStep('confirm')} style={accountDangerButton}>{tr ? 'Hesabımı sil' : 'Delete my account'}</button>}
      {step === 'confirm' && <>
        <input type="password" autoComplete="current-password" aria-label={tr ? 'Şifre' : 'Password'} placeholder={tr ? 'Onay için şifreni gir' : 'Enter your password to confirm'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} onKeyDown={e => { if (e.key === 'Enter') submit(); }} maxLength={128} style={{ ...styles.loginInput, width: '100%', boxSizing: 'border-box', margin: '8px 0', textAlign: 'left' }} />
        {error && <p role="alert" style={{ color: '#E8425A' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button disabled={busy || !password} onClick={submit} style={{ ...accountDangerButton, opacity: busy || !password ? 0.5 : 1 }}>{busy ? (tr ? 'Siliniyor…' : 'Deleting…') : (tr ? 'Kalıcı olarak sil' : 'Delete permanently')}</button>
          <button disabled={busy} onClick={() => { setStep('idle'); setPassword(''); setError(''); }} style={accountButton}>{tr ? 'Vazgeç' : 'Cancel'}</button>
        </div>
      </>}
    </div>
  );
}
export default function SettingsModal({
 musicVolume,musicMuted,onMusicVolumeChange,onToggleMusicMute,
 sfxVolume,sfxMuted,onSfxVolumeChange,onToggleSfxMute,
 lang,onLangChange,theme,onThemeChange,onClose,preferences={},onPreferenceChange=()=>{},onDeleteAccount,
}) {
 const {t}=useTranslation(),tr=lang==='tr';
 const [section,setSection]=useState('sound'),[tutorial,setTutorial]=useState(false);
 const panel=useRef(null);
 useEffect(()=>{
  if(tutorial)return;
  const previous=document.activeElement;
  panel.current?.querySelector('button')?.focus();
  const keyboard=e=>{
   if(e.key==='Escape'){e.preventDefault();onClose();}
   if(e.key==='Tab'){
    const items=[...panel.current.querySelectorAll('button:not(:disabled),input:not(:disabled),a[href]')].filter(x=>x.getClientRects().length);
    const first=items[0],last=items.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
   }
  };
  document.addEventListener('keydown',keyboard);
  return ()=>{document.removeEventListener('keydown',keyboard);if(previous?.isConnected)previous.focus();};
 },[tutorial]);
 if(tutorial)return createPortal(<TutorialModal onFinish={()=>setTutorial(false)}/>,document.body);
 return createPortal(<div className="settings-overlay" style={styles.modalOverlay} onClick={onClose}>
  <section ref={panel} className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-heading" onClick={e=>e.stopPropagation()}>
   <header><div className="settings-seal"><Settings size={26}/></div><div><small>NYXIA ONLINE</small><h2 id="settings-heading">{t('settings.title')}</h2></div><button className="settings-close" aria-label={tr?'Kapat':'Close'} onClick={onClose}><X size={20}/></button></header>
   <nav className="settings-tabs">{[['sound','Ses ve titreşim','Sound & touch'],['display','Görünüm','Display'],...(Capacitor.isNativePlatform()?[]:[['notifications','Bildirimler','Notifications']]),['help','Oyun rehberi','Game guide'],...(onDeleteAccount?[['account','Hesap','Account']]:[])].map(([id,local,en])=><button key={id} aria-pressed={section===id} onClick={()=>setSection(id)}>{tr?local:en}</button>)}</nav>
   <div className="settings-content">
    {section==='sound'&&<>
     <div className="settings-group"><h3>{tr?'Ses seviyeleri':'Audio levels'}</h3><VolumeRow label={t('settings.musicVolume')} volume={musicVolume} muted={musicMuted} onVolumeChange={onMusicVolumeChange} onToggleMute={onToggleMusicMute} t={t}/><VolumeRow label={t('settings.sfxVolume')} volume={sfxVolume} muted={sfxMuted} onVolumeChange={onSfxVolumeChange} onToggleMute={onToggleSfxMute} t={t}/></div>
     <div className="settings-group"><Toggle label={tr?'Titreşim':'Haptic feedback'} description={tr?'Destekleyen cihazlarda vuruş ve ödül titreşimi.':'Hit and reward feedback on supported devices.'} value={preferences.haptics!==false} onChange={v=>onPreferenceChange('haptics',v)}/></div>
     <p className="settings-hint">{tr?'Oyun arka plana geçince sesler duraklatılır.':'Audio pauses while the game is in the background.'}</p>
    </>}
    {section==='display'&&<>
     <div className="settings-group"><LanguageRow lang={lang} onLangChange={onLangChange} t={t}/><ThemeRow theme={theme} onThemeChange={onThemeChange} t={t}/></div>
     <div className="settings-group"><Toggle label={tr?'Hareketi azalt':'Reduce motion'} description={tr?'Kanat hareketleri, ekran sarsıntısı ve dekoratif animasyonları durdurur.':'Stops wing motion, screen shake and decorative animations.'} value={preferences.reducedMotion} onChange={v=>onPreferenceChange('reducedMotion',v)}/><Toggle label={tr?'Yüksek kontrast':'High contrast'} description={tr?'Küçük yazılar ve panel kenarlarını belirginleştirir.':'Makes muted text and panel borders clearer.'} value={preferences.highContrast} onChange={v=>onPreferenceChange('highContrast',v)}/></div>
     <div className="settings-group"><h3>{tr?'Efekt yoğunluğu':'Visual effects'}</h3><p>{tr?'Düşük mod, parıltı ve parçacıkları azaltır.':'Low mode reduces glow and particles.'}</p><div className="settings-options">{[['full','Tam','Full'],['low','Düşük','Low']].map(([id,local,en])=><button key={id} aria-pressed={(preferences.effects||'full')===id} onClick={()=>onPreferenceChange('effects',id)}>{tr?local:en}</button>)}</div></div>
    </>}
    {section==='notifications'&&<NotificationsSection tr={tr} t={t}/>}
    {section==='account'&&onDeleteAccount&&<AccountSection tr={tr} onDeleteAccount={onDeleteAccount}/>}
    {section==='help'&&<>
     <div className="settings-group"><h3>{tr?'Maceraya başlarken':'Getting started'}</h3><p>{tr?'Savaş, envanter, pazar ve yükseltme ekranlarını Kaptan ile tekrar keşfet.':'Explore battle, inventory, market and upgrades with the Captain.'}</p><button className="settings-guide" onClick={()=>setTutorial(true)}>{tr?'Oyun rehberini aç':'Open game guide'}</button></div>
     <div className="settings-group"><h3>{tr?'Kayıt ve gizlilik':'Saves & privacy'}</h3><p>{tr?'Oyun ilerlemen hesabına bağlı olarak sunucuda yedeklenir, cihazında da yerel bir kopya tutulur. Hesabını istediğin zaman Ayarlar > Hesap bölümünden kalıcı olarak silebilirsin.':'Your progress is backed up to the server under your account, with a local copy kept on this device. You can permanently delete your account any time from Settings > Account.'}</p><p>{tr?'Dil, ses ve görünüm tercihlerin de cihaza özeldir.':'Language, audio and display preferences are device-specific.'}</p></div>
     <div className="settings-group"><h3>{tr?'Yasal':'Legal'}</h3><p style={{display:'flex',flexWrap:'wrap',gap:'6px 16px'}}>{LEGAL_LINKS.map(link=><a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer" style={{color:'var(--gold-text)'}}>{tr?link.tr:link.en}</a>)}</p><p>{tr?'Şikayet ve destek: onlinenyxia@gmail.com':'Reports and support: onlinenyxia@gmail.com'}</p></div>
     <div className="settings-build">NYXIA ONLINE <span>{tr?'Beta sürümü':'Beta version'}</span></div>
    </>}
   </div>
   <footer>{tr?'Tercihlerin otomatik kaydedilir':'Preferences save automatically'}</footer>
  </section>
 </div>,document.body);
}
