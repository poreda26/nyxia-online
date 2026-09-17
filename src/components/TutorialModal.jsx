import { useState } from "react";
import { Compass, Sword, Package, Store, ShieldCheck, ArrowUpCircle, Shield, X, ChevronLeft, ChevronRight } from "lucide-react";
import { styles } from "../styles";
import CaptainPortrait from "./CaptainPortrait";

// Yeni karakterler Hub'a ilk girişte bunu görür (bkz. Hub.jsx — sadece
// player.tutorialSeen false iken açılır). Sabit bir adım listesi üzerinde
// ileri/geri gezinilen bir modal — belirli bir UI öğesini işaret eden bir
// "tur" değil, kısa ve her ekran boyutunda bozulmadan çalışan basit bir
// tanıtım. "Atla" (ve X) her adımda görünür, kullanıcı isteği: "isteyen
// kişiler tutorial'ı atlayabilsin."
//
// Kullanıcı isteği: "Oyun tutorial'ini kaptan bize kendisi anlatsın" — metin
// artık Kaptan'ın ağzından, birinci şahıs bir anlatım (CaptainTab.jsx'teki
// karakteriyle tutarlı: sert ama öğretici bir "evlat" üslubu). Her adımın
// kendi konu ikonu/rengi kalıyor (hangi bölümden bahsettiğini belli etsin),
// ama üstte SABİT olarak Kaptan'ın portresi duruyor — konuşan hep o.
const STEPS = [
  {
    icon: Compass, color: "#D4AF6A",
    title: "Nyxia Online'a Hoş Geldin",
    text: "Selam, evlat. Ben Kaptan — bu toprakların nöbetçisiyim. Sana birkaç şey göstereceğim, uzun sürmez. Canın sıkılırsa sağ üstteki çarpıya bas, beni susturursun.",
  },
  {
    icon: Sword, color: "#C9425A",
    title: "Dünyayı Keşfet",
    text: "Savaş sekmesinde bir bölge seç, bir yaratığa dokun, yaklaş ve Saldır'a bas. Altın, tecrübe, bazen de ekipman ya da sandık düşer. Başka bölgelere yine Savaş menüsündeki Kapı'dan geçersin.",
  },
  {
    icon: Package, color: "#5FA8A0",
    title: "Envanter",
    text: "Düşen eşyaları çantandan kuşan. 12 slotluk bir kuşanma panelin var — sınıfına uymayan zırhlar kilitli görünür, onları takamazsın, boşuna zorlama.",
  },
  {
    icon: Store, color: "#8B6FC9",
    title: "Pazar",
    text: "Oyuncu Pazarı'nda çantandaki eşyaları (sınıfına uymasa bile) satışa çıkarabilir ya da başkalarının tezgahından alışveriş yapabilirsin. Dükkan'da iksir, Özel Market'te elmas karşılığı özel parşömenler bulursun.",
  },
  {
    icon: ShieldCheck, color: "#D4AF6A",
    title: "Kaptan",
    text: "Beni sık sık ziyaret et. Her canavar için ayrı bir avcılık görevim var — hedefi tamamla, panomdan altın, tecrübe ve sandık al. Tamamladığında sana haber veririm, merak etme.",
  },
  {
    icon: ArrowUpCircle, color: "#4FC3D9",
    title: "Yükselt",
    text: "Parşömen ve altın getir, ekipmanını +8'e kadar güçlendireyim. Yükseltme Ustası'nı alt menüyü kaydırarak bulursun — ama uyarayım, başarısız olursan eşya da parşömen de gider.",
  },
  {
    icon: Shield, color: "#A34FD9",
    title: "Klan & Savaş Alanı",
    text: "Bir klana katıl, Savaş Alanı'nda diğer maceracılara karşı sınan, haftalık National Point sıralamasında yüksel. Klanına bağışta bulunursan Klan Binası güçlenir, Klan Boss'u açılır. Artık hazırsın — iyi avlar, evlat.",
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

        <div style={{ borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 0 2px #D4AF6A66" }}>
          <CaptainPortrait size={56} />
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: "#D4AF6A", fontFamily: "var(--font-mono)", letterSpacing: 1, textTransform: "uppercase" }}>
          Kaptan anlatıyor
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, color: current.color }}>
          <Icon size={16} strokeWidth={1.6} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>{current.title}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, textAlign: "center", lineHeight: 1.6 }}>
          "{current.text}"
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
