import { Sword, Package, Store, ArrowUpCircle, MessageCircle, User, ShieldCheck, Flag, Shield } from "lucide-react";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

// Kullanıcı isteğiyle "Daha Fazla" sayfası kaldırıldı — 9 sekmenin hepsi
// tek bir satırda, sağa sola kaydırarak (swipe) ulaşılabiliyor. Her buton
// sabit bir genişlik taşıyor (styles.navBtn) ki satır gerçekten toplam
// genişliği aşıp kaydırılabilsin — aksi halde flex:1 hepsini sığdırmaya
// çalışıp asla taşmazdı. Etiketler artık i18n/translations.js'teki
// `nav.<key>`'den geliyor (kullanıcı isteği: İngilizce dil seçeneği).
const TABS = [
  { key: "battle", icon: Sword },
  { key: "inventory", icon: Package },
  { key: "market", icon: Store },
  { key: "upgrade", icon: ArrowUpCircle },
  { key: "captain", icon: ShieldCheck },
  { key: "clan", icon: Shield },
  { key: "warzone", icon: Flag },
  { key: "chat", icon: MessageCircle },
  { key: "character", icon: User },
];

// notifications: { [tabKey]: boolean } — kullanıcı isteği: "yeni eşya
// düştüğü zaman, görev tamamlandığı zaman, verilmeyen statü puanı
// bulunduğu zaman, yeni bir mesaj geldiği zaman menüde bildirim belli
// olsun." Hub.jsx bu haritayı player state'inden türetip buraya geçiyor —
// hangi sekmelerin bildirim taşıyabileceğini bilmesi gereken tek yer burası.
export default function BottomNav({ tab, setTab, notifications = {} }) {
  const { t } = useTranslation();
  return (
    <div className="game-navigation" style={styles.bottomNav}>
      {TABS.map((it) => {
        const Icon = it.icon;
        const active = tab === it.key;
        const hasNotice = !!notifications[it.key];
        return (
          <button className={active?'is-active':''} aria-current={active?'page':undefined} key={it.key} onClick={() => setTab(it.key)} style={styles.navBtn}>
            <Icon size={17} strokeWidth={active ? 2.25 : 1.6} color={active ? "var(--text-primary)" : "var(--text-faint)"} />
            {hasNotice && <span style={styles.navNotifDot} />}
            <span style={{ fontSize: 9, marginTop: 3, color: active ? "var(--text-primary)" : "var(--text-faint)", letterSpacing: 0, whiteSpace: "nowrap" }}>
              {t(`nav.${it.key}`)}
            </span>
            {active && <div style={styles.navActiveDot} />}
          </button>
        );
      })}
    </div>
  );
}
