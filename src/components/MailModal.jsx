import { useEffect, useState } from "react";
import { useTranslation } from "../i18n/LanguageContext";
import { displayItemName, formatGold } from "../utils/player";
import { makePremiumVoucher } from "../utils/premium";
import { makeScrollStack } from "../utils/inventory";
import { fetchMail, markMailRead } from "../services/mailService";
import { styles } from "../styles";

const hasItems = (items) => !!(items?.diamonds || items?.gold || items?.vouchers?.length || items?.scrolls?.length);

// Posta kutusu: yönetici hediyeleri ve duyurular. Ödüller 'mail/claim' eylemiyle (sunucuda) teslim edilir.
export default function MailModal({ act, pushToast, onClose, onChanged }) {
  const { t, lang } = useTranslation();
  const [mail, setMail] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => { try { const data = await fetchMail(); setMail(data); onChanged?.(data.unread); } catch { setMail({ unread: 0, items: [] }); } };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rewardLines = (items) => [
    items.diamonds ? t("extra.mailRewardDiamonds", { n: items.diamonds.toLocaleString() }) : null,
    items.gold ? t("extra.mailRewardGold", { n: formatGold(items.gold) }) : null,
    ...(items.vouchers || []).map((v) => `${(v.count || 1) > 1 ? `${v.count}× ` : ""}${displayItemName(makePremiumVoucher(v.tier, v.hours * 3600000, { track: "boost", noTrade: true }), lang)}`),
    ...(items.scrolls || []).map((s) => `${s.count}× ${displayItemName(makeScrollStack(s.tier, 1), lang)}`),
  ].filter(Boolean);

  const claimOne = async (entry, quiet = false) => {
    if (!hasItems(entry.items)) { await markMailRead(entry.id).catch(() => {}); return true; }
    const result = await act("mail/claim", { mailId: entry.id });
    if (!result.ok) {
      if (!quiet) pushToast(t(result.reason === "bagFull" ? "extra.mailBagFull" : result.reason === "alreadyClaimed" ? "extra.mailAlready" : result.reason === "network" ? "battle.actionFailed" : "extra.mailFailed"), "warn");
      return false;
    }
    return true;
  };
  const claim = async (entry) => {
    if (busy) return;
    setBusy(true);
    try { if (await claimOne(entry)) pushToast(t("extra.mailClaimed"), "loot"); await load(); } finally { setBusy(false); }
  };
  const claimAll = async () => {
    if (busy || !mail) return;
    setBusy(true);
    try {
      let stopped = false;
      for (const entry of mail.items.filter((e) => !e.claimed_at)) { if (!(await claimOne(entry, true))) { stopped = true; break; } }
      pushToast(t(stopped ? "extra.mailBagFull" : "extra.mailClaimed"), stopped ? "warn" : "loot");
      await load();
    } finally { setBusy(false); }
  };

  const unread = mail?.items.filter((e) => !e.claimed_at) || [];
  return (
    <div style={{ ...styles.modalOverlay, position: "fixed" }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t("extra.mailTitle")} style={{ ...styles.modalCard, maxWidth: 420, width: "calc(100% - 24px)", maxHeight: "82vh", overflowY: "auto", alignItems: "stretch", textAlign: "left", padding: "20px 16px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1, fontFamily: "var(--font-display)", fontSize: 16 }}>{t("extra.mailTitle")}</div>
          {unread.length > 1 && <button className="rpg-action" style={styles.tinyBtn} disabled={busy} onClick={claimAll}>{t("extra.mailClaimAll")}</button>}
          <button className="rpg-action" style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={onClose}>{t("login.close")}</button>
        </div>
        {!mail && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>…</p>}
        {mail && mail.items.length === 0 && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{t("extra.mailEmpty")}</p>}
        {mail?.items.map((entry) => {
          const lines = rewardLines(entry.items || {});
          return (
            <div key={entry.id} style={{ ...styles.itemDetailCard, marginTop: 8, opacity: entry.claimed_at ? 0.6 : 1, borderColor: entry.claimed_at ? "var(--border)" : "var(--gold-text)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <strong style={{ flex: 1, fontSize: 13 }}>{entry.title}</strong>
                <small style={{ color: "var(--text-faint)", fontSize: 10 }}>{new Date(entry.created_at).toLocaleDateString(lang === "en" ? "en-GB" : "tr-TR")}</small>
              </div>
              {entry.body && <p style={{ margin: "6px 0", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{entry.body}</p>}
              {lines.length > 0 && <ul style={{ margin: "6px 0 8px 16px", padding: 0, fontSize: 12 }}>{lines.map((line) => <li key={line}>{line}</li>)}</ul>}
              {!entry.claimed_at
                ? <button className="rpg-action" style={styles.tinyBtn} disabled={busy} onClick={() => claim(entry)}>{t(lines.length ? "extra.mailClaim" : "extra.mailRead")}</button>
                : <small style={{ color: "var(--text-faint)" }}>{t("extra.mailDone")}</small>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
