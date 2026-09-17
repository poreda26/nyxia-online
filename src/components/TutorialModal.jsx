import { useState } from "react";
import { Compass, Sword, Package, Store, ShieldCheck, ArrowUpCircle, Shield, X, ChevronLeft, ChevronRight } from "lucide-react";
import { styles } from "../styles";
import CaptainPortrait from "./CaptainPortrait";
import { useTranslation } from "../i18n/LanguageContext";

// Yeni karakterler Hub'a ilk girişte bunu görür (bkz. Hub.jsx — sadece
// player.tutorialSeen false iken açılır). Sabit bir adım listesi üzerinde
// ileri/geri gezinilen bir modal — belirli bir UI öğesini işaret eden bir
// "tur" değil, kısa ve her ekran boyutunda bozulmadan çalışan basit bir
// tanıtım. "Atla" (ve X) her adımda görünür, kullanıcı isteği: "isteyen
// kişiler tutorial'ı atlayabilsin."
//
// Kullanıcı isteği: "Oyun tutorial'ini kaptan bize kendisi anlatsın" — metin
// Kaptan'ın ağzından, birinci şahıs bir anlatım (CaptainTab.jsx'teki
// karakteriyle tutarlı: sert ama öğretici bir "evlat" üslubu). Her adımın
// kendi konu ikonu/rengi burada kalıyor (i18n/translations.js#tutorial.steps
// sadece title/text taşıyor, ikon/renk çeviriye bağlı değil), üstte SABİT
// olarak Kaptan'ın portresi duruyor — konuşan hep o.
const STEP_META = [
  { icon: Compass, color: "#D4AF6A" },
  { icon: Sword, color: "#C9425A" },
  { icon: Package, color: "#5FA8A0" },
  { icon: Store, color: "#8B6FC9" },
  { icon: ShieldCheck, color: "#D4AF6A" },
  { icon: ArrowUpCircle, color: "#4FC3D9" },
  { icon: Shield, color: "#A34FD9" },
];

export default function TutorialModal({ onFinish }) {
  const { t } = useTranslation();
  const steps = t("tutorial.steps");
  const [step, setStep] = useState(0);
  const isLast = step === STEP_META.length - 1;
  const current = { ...STEP_META[step], ...steps[step] };
  const Icon = current.icon;

  return (
    <div style={styles.modalOverlay} onClick={onFinish}>
      <div style={{ ...styles.modalCard, maxWidth: 300 }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onFinish}
          style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 4 }}
          title={t("tutorial.skip")}
        >
          <X size={16} />
        </button>

        <div style={{ borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 0 2px #D4AF6A66" }}>
          <CaptainPortrait size={56} />
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: "#D4AF6A", fontFamily: "var(--font-mono)", letterSpacing: 1, textTransform: "uppercase" }}>
          {t("tutorial.badge")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, color: current.color }}>
          <Icon size={16} strokeWidth={1.6} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>{current.title}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, textAlign: "center", lineHeight: 1.6 }}>
          "{current.text}"
        </div>

        <div style={{ display: "flex", gap: 5, marginTop: 18 }}>
          {STEP_META.map((_, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i === step ? current.color : "var(--border)" }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20, width: "100%" }}>
          <button
            style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", flex: 1 }}
            onClick={onFinish}
          >
            {t("tutorial.skip")}
          </button>
          {step > 0 && (
            <button
              style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}
              onClick={() => setStep((s) => s - 1)}
            >
              <ChevronLeft size={13} />
            </button>
          )}
          <button
            style={{ ...styles.tinyBtn, background: current.color, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}
            onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
          >
            {isLast ? t("tutorial.start") : <>{t("tutorial.next")} <ChevronRight size={13} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
