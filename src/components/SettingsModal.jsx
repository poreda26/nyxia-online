import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import TutorialModal from './TutorialModal';
import './SettingsPanel.css';
import { Settings, X, Volume2, VolumeX, Languages, SunMedium } from "lucide-react";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

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
export default function SettingsModal({
 musicVolume,musicMuted,onMusicVolumeChange,onToggleMusicMute,
 sfxVolume,sfxMuted,onSfxVolumeChange,onToggleSfxMute,
 lang,onLangChange,theme,onThemeChange,onClose,preferences={},onPreferenceChange=()=>{},
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
   <nav className="settings-tabs">{[['sound','Ses ve titreşim','Sound & touch'],['display','Görünüm','Display'],['help','Oyun rehberi','Game guide']].map(([id,local,en])=><button key={id} aria-pressed={section===id} onClick={()=>setSection(id)}>{tr?local:en}</button>)}</nav>
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
    {section==='help'&&<>
     <div className="settings-group"><h3>{tr?'Maceraya başlarken':'Getting started'}</h3><p>{tr?'Savaş, envanter, pazar ve yükseltme ekranlarını Kaptan ile tekrar keşfet.':'Explore battle, inventory, market and upgrades with the Captain.'}</p><button className="settings-guide" onClick={()=>setTutorial(true)}>{tr?'Oyun rehberini aç':'Open game guide'}</button></div>
     <div className="settings-group"><h3>{tr?'Kayıt ve gizlilik':'Saves & privacy'}</h3><p>{tr?'Bu beta sürümünde oyun ilerlemen bu cihazın yerel depolamasında tutulur. Tarayıcı verilerini silmek veya uygulamayı kaldırmak kaydını silebilir. Henüz bulut kayıt yoktur.':'This beta stores progress locally on this device. Clearing browser data or uninstalling the app may delete your save. Cloud saves are not available yet.'}</p><p>{tr?'Dil, ses ve görünüm tercihlerin de cihaza özeldir.':'Language, audio and display preferences are device-specific.'}</p></div>
     <div className="settings-build">NYXIA ONLINE <span>{tr?'Beta sürümü':'Beta version'}</span></div>
    </>}
   </div>
   <footer>{tr?'Tercihlerin otomatik kaydedilir':'Preferences save automatically'}</footer>
  </section>
 </div>,document.body);
}
