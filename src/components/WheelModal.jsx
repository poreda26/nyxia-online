import { useCallback, useEffect, useId, useRef, useState } from "react";
import { X, Crown, Feather, ScrollText, Coins, Swords, Shield, Heart, Sparkles, Gem, Flag } from "./icons/GameIcons";
import "./RewardPanels.css";
import "./WheelModal.css";
import { WHEEL_SLICES, WHEEL_PREMIUM_IDS, wheelAlreadyApplied } from "../utils/wheel";
import { getActiveCharacterKey } from "../utils/api";
import { applyEntitlement } from "../utils/diamondCharge";
import { fetchWheel, spinWheel, claimWheel } from "../services/wheelService";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";

const SLICE_COUNT = WHEEL_SLICES.length;
const SLICE_DEG = 360 / SLICE_COUNT;
const SPIN_MS = 4200;
const REDUCED_SPIN_MS = 1400;
const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 146;

const ICONS = {
  mythic_1d: Crown, apex_3d: Crown, wing: Feather, scroll_upgrade: ScrollText, scroll_accessory: Gem,
  scroll_bonus: Sparkles, boost_exp: Sparkles, boost_gold: Coins, boost_atk: Swords, boost_np: Flag,
  boost_def: Shield, boost_hp: Heart,
};
const SPECIAL = { mythic_1d: "#FF8C42", apex_3d: "#8B6FC9", wing: "#79c5e8" };

const polar = (deg, r) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
};
const slicePath = (i) => {
  const [x1, y1] = polar(i * SLICE_DEG - SLICE_DEG / 2, RADIUS);
  const [x2, y2] = polar(i * SLICE_DEG + SLICE_DEG / 2, RADIUS);
  return `M${CENTER} ${CENTER}L${x1} ${y1}A${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2}Z`;
};

function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60);
  return h > 0 ? `${h}s ${m}dk` : `${m}dk`;
}

// Günde bir kez çevrilen Çark. Ödül ve oranlar sunucuda seçilir; burada yalnızca
// sonuç gösterilip oyuncuya yazılır. Ödül uygulanamazsa (çanta+depo dolu)
// sunucuda "alınmamış" kalır ve yer açılınca tekrar alınabilir.
export default function WheelModal({ player, setPlayer, act, onClose, onStatus, pushToast }) {
  const { t } = useTranslation();
  const artId = useId();
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [now, setNow] = useState(Date.now());
  const discRef = useRef(null);
  const rotationRef = useRef(0);
  // setPlayer / setBank çağrıları animasyon sonrası çalışır; en güncel değeri okusun.
  const playerRef = useRef(player); playerRef.current = player;

  const publish = useCallback((next) => { setState(next); onStatus?.(next.canSpin || !!next.pending); }, [onStatus]);

  const refresh = useCallback(async () => {
    try {
      const status = await fetchWheel();
      if (status.pending && wheelAlreadyApplied(playerRef.current, status.spunAt)) {
        await claimWheel().catch(() => {});
        publish({ ...status, pending: null, canSpin: false });
      } else publish(status);
      setError(null);
    } catch { setError("failed"); }
  }, [publish]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(id); }, []);

  const prizeName = (id) => t(`wheel.prize.${id}`);

  const deliver = async (prizeId, spunAt) => {
    // Premium ödülü: hakkı sunucu yazar (alma ve verme tek işlem), yerel değer sunucudakine eşitlenir.
    if (WHEEL_PREMIUM_IDS.includes(prizeId)) {
      try {
        const res = await claimWheel(getActiveCharacterKey());
        setPlayer((p) => ({ ...applyEntitlement(p, res.entitlement), wheelAppliedAt: spunAt }));
        setResult({ prizeId });
        pushToast?.(t("wheel.applied", { name: prizeName(prizeId) }), "success");
        await refresh();
      } catch {
        setResult(null);
        setError("failed");
        publish({ canSpin: false, pending: prizeId, spunAt, nextSpinAt: state?.nextSpinAt });
      }
      return;
    }
    // Sunucu ekonomisinde ödülü sunucu kendi bekleyen kaydından verir; eski yolda istemcinin bildirdiği kullanılır.
    const out = await act("wheel/claimItem", { prize: prizeId, spunAt });
    if (!out.ok) {
      if (out.reason === "bagFull") {
        setResult({ prizeId, bagFull: true });
        publish({ canSpin: false, pending: prizeId, spunAt, nextSpinAt: state?.nextSpinAt });
      } else {
        setResult(null);
        setError("failed");
        await refresh();
      }
      return;
    }
    setResult({ prizeId, toBank: !!out.toBank });
    pushToast?.(t("wheel.applied", { name: prizeName(prizeId) }), "success");
    if (!act.isServer()) {
      try { await claimWheel(getActiveCharacterKey()); } catch { /* ödül yazıldı; bir sonraki açılışta onay tekrarlanır */ }
    }
    await refresh();
  };

  const handleSpin = async () => {
    if (busy || !state?.canSpin) return;
    setBusy(true); setResult(null); setError(null);
    try {
      const spin = await spinWheel();
      const index = WHEEL_SLICES.indexOf(spin.prize);
      const turns = 5 + Math.floor(Math.random() * 2);
      const jitter = (Math.random() - 0.5) * (SLICE_DEG * 0.6);
      // Dönüş Web Animations ile yapılır: "hareketi azalt" ayarı CSS geçişlerini
      // tamamen kapatıyor (MobileUI.css), bu yüzden çark hiç dönmüyor, sonuca
      // atlıyordu. Bu ayarda dönüş kısa ve az turlu ama yine görünür kalır.
      const reduced = document.documentElement.dataset.motion === "reduced";
      const from = rotationRef.current;
      const target = (Math.floor(from / 360) + (reduced ? 1 : turns)) * 360 - index * SLICE_DEG + jitter;
      const disc = discRef.current;
      const duration = reduced ? REDUCED_SPIN_MS : SPIN_MS;
      const animation = disc?.animate?.(
        [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${target}deg)` }],
        { duration, easing: "cubic-bezier(.12,.67,.1,1)", fill: "forwards" },
      );
      await new Promise((resolve) => { if (animation) animation.onfinish = resolve; setTimeout(resolve, duration + 150); });
      rotationRef.current = target;
      if (disc) disc.style.transform = `rotate(${target}deg)`;
      animation?.cancel();
      setRotation(target);
      await deliver(spin.prize, spin.spunAt);
    } catch (e) {
      setError(e?.code === "WHEEL_ALREADY_SPUN" ? "alreadySpun" : "failed");
      await refresh();
    } finally { setBusy(false); }
  };

  const handleClaim = async () => {
    if (busy || !state?.pending) return;
    setBusy(true);
    try { await deliver(state.pending, state.spunAt); } finally { setBusy(false); }
  };

  const countdown = state && !state.canSpin && !state.pending && state.nextSpinAt > now ? formatCountdown(state.nextSpinAt - now) : null;
  const pendingOnly = !!state?.pending && !busy;
  const disabled = busy || (!state?.canSpin && !pendingOnly);

  return (
    <div className="wheel-overlay" style={styles.modalOverlay} onClick={busy ? undefined : onClose}>
      <div className={`reward-panel wheel-panel ${busy ? "is-spinning" : ""}`} role="dialog" aria-modal="true" aria-label={t("wheel.title")} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} disabled={busy} aria-label={t("wheel.close")}
          style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: 4 }}>
          <X size={16} />
        </button>
        <div className="wheel-heading">{t("wheel.title")}</div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>{t("wheel.subtitle")}</div>

        <div className="wheel-stage">
          <div className="wheel-orbit" aria-hidden="true"/>
          <svg className="wheel-pointer" viewBox="0 0 22 26" aria-hidden="true"><path d="M11 25 1 4a12 12 0 0 1 20 0Z" fill="#e8b94f" stroke="#5c3a10" strokeWidth="1.5" /></svg>
          <div className="wheel-rotor"><svg ref={discRef} className="wheel-disc" viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: `rotate(${rotation}deg)` }} aria-hidden="true">
            <defs><radialGradient id={`${artId}-disc`}><stop stopColor="#685177"/><stop offset="1" stopColor="#161a30"/></radialGradient><linearGradient id={`${artId}-gold`} x2="1" y2="1"><stop stopColor="#fff0ba"/><stop offset=".45" stopColor="#c99a52"/><stop offset="1" stopColor="#795125"/></linearGradient></defs>
            <circle cx={CENTER} cy={CENTER} r={RADIUS + 3} fill="#3b2a14" stroke="#caa566" strokeWidth="3" />
            {WHEEL_SLICES.map((id, i) => {
              const Icon = ICONS[id];
              const [ix, iy] = polar(i * SLICE_DEG, RADIUS * 0.68);
              const fill = SPECIAL[id] || (i % 2 ? "#17273b" : "#332b49");
              return (
                <g key={id}>
                  <path d={slicePath(i)} fill={fill} fillOpacity={SPECIAL[id] ? 0.55 : 1} stroke="#caa566" strokeOpacity=".55" strokeWidth="1.2" />
                  <g transform={`rotate(${i * SLICE_DEG} ${ix} ${iy})`}>
                    <Icon x={ix - 16.5} y={iy - 16.5} size={33} color={SPECIAL[id] ? "#fff3d8" : "#e8d6a8"} strokeWidth={1.8} />
                  </g>
                </g>
              );
            })}
            <circle cx={CENTER} cy={CENTER} r="143" fill="none" stroke={`url(#${artId}-gold)`} strokeWidth="6"/>
            <circle cx={CENTER} cy={CENTER} r="133" fill="none" stroke="#f7d897" strokeOpacity=".4" strokeWidth="1"/>
          </svg></div>
          <div className="wheel-hub" aria-hidden="true"><Gem size={34}/></div>
        </div>

        <div className={`wheel-result ${result && !result.bagFull ? "has-prize" : ""}`} aria-live="polite">
          {result && (()=>{const PrizeIcon=ICONS[result.prizeId];return PrizeIcon ? <PrizeIcon size={46}/> : null;})()}
          {result && !result.bagFull && (<><strong>{t("wheel.won")} {prizeName(result.prizeId)}</strong>{result.toBank ? t("wheel.toBank") : ""}</>)}
          {result?.bagFull && t("wheel.bagFull")}
          {!result && error && t(`wheel.${error}`)}
          {!result && !error && pendingOnly && t("wheel.claimPending")}
          {!result && !error && !pendingOnly && state?.canSpin && t("wheel.ready")}
          {!result && !error && !pendingOnly && countdown && t("wheel.comeBack", { time: countdown })}
          {!result && !error && !state && "…"}
        </div>

        <button
          className="reward-cta"
          disabled={disabled}
          style={{ ...styles.primaryBtn, marginTop: 16, width: "100%", background: "#D4AF6A", color: "#0B0C10", opacity: disabled ? 0.55 : 1 }}
          onClick={pendingOnly ? handleClaim : handleSpin}
        >
          {busy ? t("wheel.spinning") : pendingOnly ? t("wheel.claim") : t("wheel.spin")}
        </button>
        <details className="wheel-prizes"><summary>{t("wheel.rewards")}</summary><div className="wheel-prize-grid">{WHEEL_SLICES.map(id=>{const Icon=ICONS[id];return <div className="wheel-prize-card" key={id}><Icon size={30}/><span>{prizeName(id)}</span></div>;})}</div></details>
      </div>
    </div>
  );
}
