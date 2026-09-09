import { Sword, Package, Store, ArrowUpCircle, MessageCircle, User, ShieldCheck, Flag, Shield } from "lucide-react";
import { styles } from "../styles";

// Kullanıcı isteğiyle "Daha Fazla" sayfası kaldırıldı — 9 sekmenin hepsi
// tek bir satırda, sağa sola kaydırarak (swipe) ulaşılabiliyor. Her buton
// sabit bir genişlik taşıyor (styles.navBtn) ki satır gerçekten toplam
// genişliği aşıp kaydırılabilsin — aksi halde flex:1 hepsini sığdırmaya
// çalışıp asla taşmazdı.
const TABS = [
  { key: "battle", label: "Savaş", icon: Sword },
  { key: "inventory", label: "Envanter", icon: Package },
  { key: "market", label: "Pazar", icon: Store },
  { key: "upgrade", label: "Yükselt", icon: ArrowUpCircle },
  { key: "captain", label: "Kaptan", icon: ShieldCheck },
  { key: "clan", label: "Klan", icon: Shield },
  { key: "warzone", label: "Savaş Alanı", icon: Flag },
  { key: "chat", label: "Sohbet", icon: MessageCircle },
  { key: "character", label: "Karakter", icon: User },
];

// notifications: { [tabKey]: boolean } — kullanıcı isteği: "yeni eşya
// düştüğü zaman, görev tamamlandığı zaman, verilmeyen statü puanı
// bulunduğu zaman, yeni bir mesaj geldiği zaman menüde bildirim belli
// olsun." Hub.jsx bu haritayı player state'inden türetip buraya geçiyor —
// hangi sekmelerin bildirim taşıyabileceğini bilmesi gereken tek yer burası.
export default function BottomNav({ tab, setTab, notifications = {} }) {
  return (
    <div style={styles.bottomNav}>
      {TABS.map((it) => {
        const Icon = it.icon;
        const active = tab === it.key;
        const hasNotice = !!notifications[it.key];
        return (
          <button key={it.key} onClick={() => setTab(it.key)} style={styles.navBtn}>
            <Icon size={17} strokeWidth={active ? 2.25 : 1.6} color={active ? "var(--text-primary)" : "var(--text-faint)"} />
            {hasNotice && <span style={styles.navNotifDot} />}
            <span style={{ fontSize: 9, marginTop: 3, color: active ? "var(--text-primary)" : "var(--text-faint)", letterSpacing: 0, whiteSpace: "nowrap" }}>
              {it.label}
            </span>
            {active && <div style={styles.navActiveDot} />}
          </button>
        );
      })}
    </div>
  );
}
