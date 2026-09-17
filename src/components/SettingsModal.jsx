import { Settings, X, Volume2, VolumeX, Languages } from "lucide-react";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

// Ses ayarları — App.jsx'teki müzik/efekt motorlarına doğrudan bağlı (bkz.
// audio/bgMusic.js, audio/sfx.js). Hesaba değil cihaza bağlı bir tercih
// olduğu için App.jsx localStorage'da tutuyor, burası sadece görüntülüyor.
function VolumeRow({ label, volume, muted, onVolumeChange, onToggleMute, t }) {
  const effectivelyOff = muted || volume === 0;
  return (
    <div style={styles.sliderRow}>
      <div style={styles.sliderLabelRow}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={onToggleMute}
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
        type="range" min={0} max={100} step={5}
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
    <div style={styles.sliderRow}>
      <div style={styles.sliderLabelRow}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Languages size={14} color="#8B6FC9" /> {t("settings.language")}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[["tr", "Türkçe"], ["en", "English"]].map(([code, label]) => (
          <button
            key={code}
            onClick={() => onLangChange(code)}
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

export default function SettingsModal({
  musicVolume, musicMuted, onMusicVolumeChange, onToggleMusicMute,
  sfxVolume, sfxMuted, onSfxVolumeChange, onToggleSfxMute,
  lang, onLangChange,
  onClose,
}) {
  const { t } = useTranslation();
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalCard, width: "100%", maxWidth: 300 }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 4 }}
        >
          <X size={16} />
        </button>

        <Settings size={28} color="#5FA8A0" strokeWidth={1.4} />
        <div style={{ marginTop: 10, fontFamily: "var(--font-display)", fontSize: 17 }}>{t("settings.title")}</div>

        <div style={{ ...styles.autoBattleCard, width: "100%", marginTop: 18 }}>
          <VolumeRow
            label={t("settings.musicVolume")} volume={musicVolume} muted={musicMuted}
            onVolumeChange={onMusicVolumeChange} onToggleMute={onToggleMusicMute} t={t}
          />
          <VolumeRow
            label={t("settings.sfxVolume")} volume={sfxVolume} muted={sfxMuted}
            onVolumeChange={onSfxVolumeChange} onToggleMute={onToggleSfxMute} t={t}
          />
          <LanguageRow lang={lang} onLangChange={onLangChange} t={t} />
        </div>
      </div>
    </div>
  );
}
