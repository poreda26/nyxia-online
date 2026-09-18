import { Gift, CheckCircle2 } from "lucide-react";
import { CLASSES } from "../data/classes";
import { itemTierColor, ITEM_TIER_LABEL } from "../data/itemRarity";
import { pick } from "../utils/random";
import { useTranslation } from "../i18n/LanguageContext";
import { styles } from "../styles";
import RewardReveal from './RewardReveal';

export default function ChestModal({ state, onClose, playerClass }) {
  const { t, lang } = useTranslation();
  const { chest, phase, result } = state;
  const color = itemTierColor(chest.tier);
  const isLocked = result && result.kind === "armor" && result.class !== playerClass;
  return (
    <div style={styles.modalOverlay} onClick={phase === "reveal" ? onClose : undefined}>
      <div className="reward-modal" style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {phase === "shaking" && (
          <>
            <div className="chest-opening" aria-hidden="true">
              <div className="chest-box"/>
            </div>
            <div style={{ marginTop: 18, fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-muted)" }}>
              {t("inventory.chestOpening")}
            </div>
          </>
        )}
        {phase === "reveal" && result && (
          <div className="chest-reveal">
            <div className="confetti-wrap">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="confetti-bit" style={{ background: pick([color, "#D4AF6A", "#EDE8DC"]), left: `${(i * 7) % 100}%`, animationDelay: `${(i % 5) * 0.06}s` }} />
              ))}
            </div>
            <RewardReveal item={result}/>
            {result.kind === "armor" && (
              <span style={{ ...styles.classTag, color: CLASSES[result.class].color, borderColor: `${CLASSES[result.class].color}55`, marginTop: 6 }}>
                {t("inventory.classItemTag", { cls: CLASSES[result.class].name })}
              </span>
            )}
            <div style={{ fontSize: 10, color, fontFamily: "var(--font-mono)", marginTop: 6, letterSpacing: 1, textTransform: "uppercase" }}>
              {ITEM_TIER_LABEL[lang][result.tier]}
            </div>
            {isLocked && (
              <div style={{ fontSize: 10, color: "#E8A5AF", marginTop: 8, maxWidth: 200, textAlign: "center" }}>
                {t("inventory.chestItemLockedHint")}
              </div>
            )}
            <button style={{ ...styles.primaryBtn, marginTop: 22, background: color }} onClick={onClose}>
              {t("inventory.okBtn")} <CheckCircle2 size={15} />
            </button>
          </div>
        )}
        {/* Kullanıcının bildirdiği "bazı sandıklarda siyah bir kutucuk
            kalıyor" bug'ının asıl nedeni: openChest bir katalog boşluğu
            yüzünden null eşya döndürünce (bkz. data/casterWeapons.js,
            priestWeapons.js, accessories.js — üçü de T2-T5'te tamamen
            boştu, şimdi dolduruldu) bu koşul hiç eşleşmiyordu, kart içi
            tamamen boş kalıyor ve kapatacak hiçbir düğme görünmüyordu
            (overlay'e tıklayınca kapanırdı ama kullanıcı bunu bilemezdi).
            Kök nedeni düzelttik ama bu dal, ileride benzer bir boşluk
            olursa yine sessizce boş bir kutu bırakmasın diye kalıyor. */}
        {phase === "reveal" && !result && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Gift size={40} color="var(--text-faint)" strokeWidth={1.3} />
            <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 15, textAlign: "center", color: "var(--text-muted)" }}>
              {t("inventory.chestEmptyResult")}
            </div>
            <button style={{ ...styles.primaryBtn, marginTop: 18, background: "var(--bg-panel-alt)", color: "var(--text-primary)" }} onClick={onClose}>
              {t("inventory.okBtn")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
