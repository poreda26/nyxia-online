import { useState } from "react";
import { Compass, Sword, Package, Store, ShieldCheck, ArrowUpCircle, Shield, X, ChevronLeft, ChevronRight } from "lucide-react";
import { styles } from "../styles";

// Yeni karakterler Hub'a ilk girişte bunu görür (bkz. Hub.jsx — sadece
// player.tutorialSeen false iken açılır). Sabit bir adım listesi üzerinde
// ileri/geri gezinilen bir modal — belirli bir UI öğesini işaret eden bir
// "tur" değil, kısa ve her ekran boyutunda bozulmadan çalışan basit bir
// tanıtım. "Atla" (ve X) her adımda görünür, kullanıcı isteği: "isteyen
// kişiler tutorial'ı atlayabilsin."
const STEPS = [
  {
    icon: Compass, color: "#D4AF6A",
    title: "Nyxia Online'a Hoş Geldin",
    text: "Kısa bir tur atalım — nasıl oynanacağını birkaç ekranda anlatalım. İstersen sağ üstteki çarpıya basıp her an atlayabilirsin.",
  },
  {
    icon: Sword, color: "#C9425A",
    title: "Savaş",
    text: "Kapı'dan bir bölge seç, canavarlarla savaş. Her öldürmede altın ve XP kazanırsın; ekipman, sandık ve yükseltme parşömeni de düşebilir.",
  },
  {
    icon: Package, color: "#5FA8A0",
    title: "Envanter",
    text: "Düşen eşyaları buradan kuşan. 12 slotluk bir kuşanma paneli var — sınıfına uymayan zırhlar kilitli görünür, kuşanamazsın.",
  },
  {
    icon: Store, color: "#8B6FC9",
    title: "Pazar",
    text: "Oyuncu Pazarı'nda çantandaki eşyaları (sınıfına uymayan zırhlar dahil) ilana çıkar ya da başkalarının ilanlarından satın al. Dükkan'dan iksir, Özel Market'ten elmas karşılığı premium ve özel parşömenler alabilirsin.",
  },
  {
    icon: ShieldCheck, color: "#D4AF6A",
    title: "Kaptan",
    text: "Her canavar için ayrı bir avcılık görevi var. Hedefi tamamlayınca panodan altın, XP ve Sandık ödülünü al — tamamladığında sana haber vereceğiz.",
  },
  {
    icon: ArrowUpCircle, color: "#4FC3D9",
    title: "Yükselt",
    text: "Parşömen ve altın karşılığında ekipmanını +8'e kadar güçlendirebilirsin — Yükseltme Ustası'nı alt menüyü kaydırarak bulursun.",
  },
  {
    icon: Shield, color: "#A34FD9",
    title: "Klan & Savaş Alanı",
    text: "Bir klana katıl, Savaş Alanı'nda diğer oyunculara karşı savaş ve haftalık National Point sıralamasında yüksel. Klanına NP/altın/elmas bağışlayarak Klan Binası'nı geliştirebilir, Klan Boss'unu açabilirsin.",
  },
];

export default function TutorialModal({ onFinish }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div style={styles.modalOverlay} onClick={onFinish}>
      <div style={{ ...styles.modalCard, maxWidth: 300 }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onFinish}
          style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 4 }}
          title="Tutorial'ı atla"
        >
          <X size={16} />
        </button>

        <div style={{ color: current.color, filter: `drop-shadow(0 0 16px ${current.color}66)` }}>
          <Icon size={40} strokeWidth={1.3} />
        </div>
        <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 17, textAlign: "center" }}>{current.title}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, textAlign: "center", lineHeight: 1.6 }}>
          {current.text}
        </div>

        <div style={{ display: "flex", gap: 5, marginTop: 18 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i === step ? current.color : "var(--border)" }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20, width: "100%" }}>
          <button
            style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)", flex: 1 }}
            onClick={onFinish}
          >
            Atla
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
            {isLast ? "Başla!" : <>İleri <ChevronRight size={13} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
