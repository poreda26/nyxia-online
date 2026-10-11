import { useEffect, useState } from "react";
import { ChevronRight, User, Lock } from "./icons/GameIcons";
import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";
import { isReservedUsername } from "../utils/storage";
import { registerAccount, loginAccount } from "../utils/api";
import { fetchAuthProviders, loginSocial, forgotPassword, resetPassword, startEmailRegister, confirmEmailRegister } from "../services/authService";
import { socialIdToken, socialSignInAvailable, appleSignInAvailable } from "../utils/socialSignIn";
import nyxiaLogo from "../assets/brand/nyxia-logo.png";
import { LEGAL_LINKS } from "../data/legalLinks";
import { birthProblem } from "../utils/birth";
import BirthDateInput from "./BirthDateInput";

const NAME_PATTERN = /^[a-z0-9_]{3,24}$/;

function errorKey(code) {
  if (code === "ACCOUNT_UNAVAILABLE") return "login.accountTakenError";
  if (code === "INVALID_CREDENTIALS") return "login.wrongCredentialsError";
  if (code === "TOO_MANY_ATTEMPTS") return "login.rateLimitedError";
  if (code === "INVALID_CREDENTIAL_FORMAT") return "login.invalidFormatError";
  if (code === "NAME_NOT_ALLOWED") return "login.nameNotAllowedError";
  if (code === "EMAIL_TAKEN") return "login.emailTakenError";
  if (code === "INVALID_EMAIL") return "login.invalidEmailError";
  if (code === "TOO_MANY_REQUESTS") return "login.rateLimitedError";
  if (code === "INVALID_CODE") return "login.invalidCodeError";
  if (code === "CODE_TOO_SOON" || code === "TOO_MANY_CODES") return "login.codeTooSoonError";
  if (code === "MAIL_UNAVAILABLE") return "login.mailUnavailableError";
  if (code === "INVALID_ID_TOKEN" || code === "PROVIDER_UNAVAILABLE") return "login.socialFailedError";
  if (code === "ACCOUNT_BLOCKED") return "login.blockedError";
  if (code === "UNDER_AGE" || code === "ACCOUNT_AGE_LOCKED") return "login.underAgeError";
  if (code === "INVALID_BIRTHDATE") return "login.birthRequiredError";
  return "login.networkError";
}

// Artık gerçek backend'e (server/app.mjs) bağlı: kullanıcı adı + şifre
// sunucuda scrypt ile hash'lenip doğrulanıyor, oturum HttpOnly çerezle
// tutuluyor (bkz. utils/api.js). Kullanıcı adı sunucunun kabul ettiği
// kalıpla (küçük harf/rakam/alt çizgi, 3-24) birebir aynı olmalı çünkü
// App.jsx#handleLogin bu ismi doğrudan yerel karakter kaydını açmak için
// kullanıyor (bkz. utils/storage.js#loadAccount) — sunucu ve yerel kayıt
// aynı anahtar üzerinden eşleşiyor.
// Yeni şifre kuralı (sunucuyla aynı): en az 8 karakter, harf ve rakam içermeli.
const passwordStrong = (value) => value.length >= 8 && value.length <= 128 && /\p{L}/u.test(value) && /\d/.test(value);

export default function LoginScreen({ initialUsername, onLogin, notice }) {
  const { t, lang } = useTranslation();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState(initialUsername || "");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [inUse, setInUse] = useState(false);
  const [providers, setProviders] = useState(null);
  const [pendingSocial, setPendingSocial] = useState(null);
  const [forgot, setForgot] = useState(false);
  const [regStep, setRegStep] = useState("email");
  const [code, setCode] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [birth, setBirth] = useState("");
  const [socialBirth, setSocialBirth] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [showPw, setShowPw] = useState(false);
  useEffect(() => { fetchAuthProviders().then(setProviders).catch(() => {}); }, []);

  const socialLogin = async (provider, force = false, saved = null, birthDate = null, terms = false) => {
    if (busy) return;
    setError(""); setBusy(true); setInUse(false);
    let picked = saved;
    try {
      picked = saved || await socialIdToken(provider, providers[provider]);
      if (picked.cancelled) return;
      const { name } = await loginSocial(provider, picked.idToken, force, birthDate, terms);
      setSocialBirth(null);
      onLogin(name);
    } catch (err) {
      if (err.code === "ACCOUNT_IN_USE") { setInUse(true); setPendingSocial({ provider, idToken: saved?.idToken || picked?.idToken }); }
      else if (err.code === "BIRTHDATE_REQUIRED") setSocialBirth({ provider, idToken: picked.idToken });
      else setError(t(errorKey(err.code || "SOCIAL")));
    } finally { setBusy(false); }
  };

  // E-postayla kayıt: 1) e-posta + şifre → kod gönderilir, 2) kod girilir → hesap açılır.
  const emailRegister = mode === "register" && !!providers?.email;
  const submitEmailRegister = async () => {
    const email = username.trim().toLowerCase();
    if (busy) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError(t("login.invalidEmailError")); return; }
    if (!passwordStrong(password)) { setError(t("login.passwordTooShortError")); return; }
    if (password !== password2) { setError(t("login.passwordMismatchError")); return; }
    const birthIssue = birthProblem(birth);
    if (birthIssue) { setError(t(birthIssue)); return; }
    if (!accepted) { setError(t("extra.acceptTermsRequired")); return; }
    setError(""); setBusy(true);
    try {
      if (regStep === "email") { await startEmailRegister(email, birth); setRegStep("code"); }
      else {
        if (code.length !== 6) { setError(t("login.invalidCodeError")); return; }
        const { name } = await confirmEmailRegister(email, code, password, marketing, birth, accepted);
        onLogin(name);
      }
    } catch (err) { setError(t(errorKey(err.code))); }
    finally { setBusy(false); }
  };

  const submit = async (force = false) => {
    if (emailRegister) { await submitEmailRegister(); return; }
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || !password || busy) return;
    if (isReservedUsername(trimmed)) { setError(t("login.reservedNameError")); return; }
    const looksLikeEmail = mode === "login" && trimmed.includes("@");
    if (!looksLikeEmail && !NAME_PATTERN.test(trimmed)) { setError(t("login.invalidFormatError")); return; }
    if (mode === "register" && !passwordStrong(password)) { setError(t("login.passwordTooShortError")); return; }
    if (mode === "register" && password !== password2) { setError(t("login.passwordMismatchError")); return; }
    if (mode === "register") { const birthIssue = birthProblem(birth); if (birthIssue) { setError(t(birthIssue)); return; } if (!accepted) { setError(t("extra.acceptTermsRequired")); return; } }
    setError(""); setBusy(true); setInUse(false);
    try {
      const { name } = mode === "register" ? await registerAccount(trimmed, password, birth, accepted) : await loginAccount(trimmed, password, force === true);
      onLogin(name);
    } catch (err) {
      if (err.code === "ACCOUNT_IN_USE") setInUse(true);
      else setError(t(errorKey(err.code)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.classSelectRoot}>
      <div style={styles.classSelectHeader}>
        <img src={nyxiaLogo} alt="Nyxia" style={{ width: "100%", maxWidth: 240, margin: "0 auto 10px", display: "block" }} />
        <div style={styles.eyebrow}>{t("login.welcome")}</div>
        <h1 style={styles.h1}>{t(mode === "register" ? "login.registerTitle" : "login.title")}</h1>
        <p style={styles.subtext}>{t(emailRegister ? "login.emailSubtitle" : mode === "login" && providers?.email ? "login.loginEmailSubtitle" : "login.subtitle")}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ ...styles.slotAvatar, width: 40, height: 40 }}>
          <User size={18} color="var(--text-muted)" strokeWidth={1.6} />
        </div>
        <input
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          type={emailRegister ? "email" : "text"}
          autoComplete={emailRegister ? "email" : "username"}
          disabled={emailRegister && regStep === "code"}
          placeholder={t(emailRegister ? "login.emailPlaceholder" : mode === "login" && providers?.email ? "login.loginPlaceholder" : "login.placeholder")}
          maxLength={mode === "login" || emailRegister ? 120 : 24}
          style={{ ...styles.loginInput, flex: 1, textAlign: "left" }}
          autoFocus
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ ...styles.slotAvatar, width: 40, height: 40 }}>
          <Lock size={18} color="var(--text-muted)" strokeWidth={1.6} />
        </div>
        <input
          type={showPw ? "text" : "password"}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          placeholder={t("login.passwordPlaceholder")}
          maxLength={128}
          style={{ ...styles.loginInput, flex: 1, textAlign: "left" }}
        />
        <EyeToggle shown={showPw} onToggle={() => setShowPw((v) => !v)} />
      </div>

      {mode === "register" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: -6, marginBottom: 16 }}>
          <div style={{ ...styles.slotAvatar, width: 40, height: 40 }}>
            <Lock size={18} color="var(--text-muted)" strokeWidth={1.6} />
          </div>
          <input
            type={showPw ? "text" : "password"}
            value={password2}
            onChange={(e) => { setPassword2(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            autoComplete="new-password"
            placeholder={t("login.passwordConfirmPlaceholder")}
            maxLength={128}
            style={{ ...styles.loginInput, flex: 1, textAlign: "left" }}
          />
        </div>
      )}

      {mode === "register" && <BirthDateInput value={birth} onChange={(v) => { setBirth(v); setError(""); }} onEnter={() => submit()} />}

      {emailRegister && regStep === "code" && (
        <div style={{ marginTop: -6, marginBottom: 14 }}>
          <p style={{ ...styles.loginCaveat, marginBottom: 8 }}>{t("login.codeSent", { email: username.trim().toLowerCase() })}</p>
          <input
            inputMode="numeric" maxLength={6} value={code} autoFocus
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="000000"
            style={{ ...styles.loginInput, width: "100%", textAlign: "center", letterSpacing: 8 }}
          />
          <button onClick={() => { setRegStep("email"); setCode(""); setError(""); }} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 11, marginTop: 8, cursor: "pointer", textDecoration: "underline" }}>{t("login.changeEmail")}</button>
        </div>
      )}
      {notice && !error && !inUse && (
        <p style={{ ...styles.loginCaveat, color: "var(--gold-text)", marginTop: -10 }}>{t("login.signedOutElsewhere")}</p>
      )}
      {inUse && (
        <div style={{ ...styles.itemDetailCard, borderColor: "var(--gold-text)", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>{t("login.inUsePrompt")}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...styles.tinyBtn, flex: 1, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={() => setInUse(false)}>{t("login.inUseCancel")}</button>
            <button style={{ ...styles.tinyBtn, flex: 1, background: "#D4AF6A", color: "#15171E" }} disabled={busy} onClick={() => (pendingSocial ? socialLogin(pendingSocial.provider, true, pendingSocial.idToken ? { idToken: pendingSocial.idToken } : null) : submit(true))}>{t("login.inUseConfirm")}</button>
          </div>
        </div>
      )}
      {error && (
        <p style={{ ...styles.loginCaveat, color: "#E8425A", marginTop: -10 }}>
          {error}
        </p>
      )}

      {mode === "register" && <TermsCheckbox checked={accepted} onChange={setAccepted} />}
      {mode !== "register" && <p style={{ ...styles.loginCaveat, marginTop: 0, marginBottom: 12, textAlign: "center" }}>
        {t("login.consentLead")}{" "}
        {LEGAL_LINKS.filter((link) => link.id === "terms" || link.id === "privacy").map((link, index) => (
          <span key={link.id}>{index ? " · " : ""}<a href={(lang === "en" && link.hrefEn) || link.href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-text)" }}>{lang === "en" ? link.en : link.tr}</a></span>
        ))}
      </p>}

      {emailRegister && (
        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 11, color: "var(--text-muted)", marginBottom: 12, textAlign: "left", cursor: "pointer" }}>
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} style={{ marginTop: 2 }} />
          <span>{t("login.marketingOptIn")}</span>
        </label>
      )}

      <button
        style={{ ...styles.primaryBtn, background: "#D4AF6A", alignSelf: "center", opacity: busy ? 0.6 : 1 }}
        disabled={!username.trim() || !password || (mode === "register" && (!password2 || !birth || !accepted)) || busy}
        onClick={() => submit()}
      >
        {t(busy ? "login.submitting" : emailRegister ? (regStep === "code" ? "login.registerFinish" : "login.sendCode") : mode === "register" ? "login.registerSubmit" : "login.submit")} <ChevronRight size={16} />
      </button>

      {socialBirth && (
        <div style={{ alignSelf: "stretch", marginTop: 14 }}>
          <p style={{ ...styles.loginCaveat, marginBottom: 8 }}>{t("login.socialBirthText")}</p>
          <BirthDateInput value={birth} onChange={(v) => { setBirth(v); setError(""); }} />
          <TermsCheckbox checked={accepted} onChange={setAccepted} />
          <button
            style={{ ...styles.primaryBtn, background: "#D4AF6A", opacity: busy ? 0.6 : 1 }}
            disabled={!birth || !accepted || busy}
            onClick={() => { const issue = birthProblem(birth); if (issue) { setError(t(issue)); return; } socialLogin(socialBirth.provider, false, { idToken: socialBirth.idToken }, birth, accepted); }}
          >{t("login.gateSubmit")}</button>
        </div>
      )}

      {socialSignInAvailable() && providers && (providers.google || providers.apple) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignSelf: "stretch", marginTop: 14 }}>
          <div style={{ fontSize: 11, color: "var(--text-faint)", textAlign: "center" }}>{t("login.or")}</div>
          {providers.apple && appleSignInAvailable() && <button style={{ ...styles.tinyBtn, background: "#fff", color: "#0B0C10", padding: "11px 0" }} disabled={busy} onClick={() => socialLogin("apple")}>{t("login.continueApple")}</button>}
          {providers.google && <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-primary)", border: "1px solid var(--border)", padding: "11px 0" }} disabled={busy} onClick={() => socialLogin("google")}>{t("login.continueGoogle")}</button>}
        </div>
      )}

      {mode === "login" && providers?.email && (
        <button onClick={() => setForgot(true)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 11, marginTop: 12, cursor: "pointer", textDecoration: "underline" }}>
          {t("login.forgotLink")}
        </button>
      )}

      <button
        onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); setRegStep("email"); setCode(""); setPassword2(""); setBirth(""); setAccepted(false); }}
        style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 11, marginTop: 12, cursor: "pointer", textDecoration: "underline" }}
      >
        {t(mode === "register" ? "login.switchToLogin" : "login.switchToRegister")}
      </button>

      <p style={styles.loginCaveat}>
        {t("login.caveat")}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 14px", marginTop: 14 }}>
        {LEGAL_LINKS.map((link) => (
          <a key={link.id} href={(lang === "en" && link.hrefEn) || link.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--text-muted)" }}>{lang === "en" ? link.en : link.tr}</a>
        ))}
      </div>
      {forgot && <ForgotPassword onClose={() => setForgot(false)} />}
    </div>
  );
}

// Şifre alanının yanındaki göz düğmesi: şifreyi gösterir/gizler.
function EyeToggle({ shown, onToggle }) {
  const { t } = useTranslation();
  return (
    <button type="button" onClick={onToggle} aria-pressed={shown} aria-label={t(shown ? "extra.hidePassword" : "extra.showPassword")} title={t(shown ? "extra.hidePassword" : "extra.showPassword")}
      style={{ background: "none", border: "none", cursor: "pointer", color: shown ? "var(--gold-text)" : "var(--text-muted)", padding: 6, display: "flex", flexShrink: 0 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
        {shown && <path d="M4 4l16 16" />}
      </svg>
    </button>
  );
}

// Kayıtta zorunlu: Kullanım Koşulları ve Gizlilik Politikası'nın kabulü.
function TermsCheckbox({ checked, onChange }) {
  const { t, lang } = useTranslation();
  const link = (id) => LEGAL_LINKS.find((l) => l.id === id);
  const anchor = (id) => { const l = link(id); return <a key={id} href={(lang === "en" && l.hrefEn) || l.href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-text)" }}>{lang === "en" ? l.en : l.tr}</a>; };
  const parts = t("extra.acceptTerms").split(/(\{terms\}|\{privacy\})/).map((part, i) => (part === "{terms}" ? <span key={i}>{anchor("terms")}</span> : part === "{privacy}" ? <span key={i}>{anchor("privacy")}</span> : part));
  return (
    <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 11, color: "var(--text-muted)", marginBottom: 12, textAlign: "left", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginTop: 2 }} />
      <span>{parts}</span>
    </label>
  );
}

// Şifremi unuttum: e-postaya 6 haneli kod gelir, kodla yeni şifre belirlenir. (Yalnızca doğrulanmış e-postası olan hesaplar.)
function ForgotPassword({ onClose }) {
  const { t } = useTranslation();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showPw, setShowPw] = useState(false);
  const run = async (fn, next) => {
    if (busy) return;
    setBusy(true); setMessage("");
    try { await fn(); if (next) setStep(next); }
    catch (err) { setMessage(t(errorKey(err.code))); }
    finally { setBusy(false); }
  };
  return (
    <div style={{ ...styles.modalOverlay, position: "fixed", zIndex: 90 }} onClick={onClose}>
      <div style={{ ...styles.modalCard, maxWidth: 340, padding: "26px 22px 20px", gap: 10 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, textAlign: "center" }}>{t("login.forgotTitle")}</div>
        {step === "email" && <>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>{t("login.forgotEmailText")}</div>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("login.emailPlaceholder")} style={{ ...styles.loginInput, width: "100%", textAlign: "left" }} />
          <button style={{ ...styles.primaryBtn, background: "#D4AF6A" }} disabled={busy || !email.includes("@")} onClick={() => run(() => forgotPassword(email.trim()), "code")}>{t("login.sendCode")}</button>
        </>}
        {step === "code" && <>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>{t("login.forgotCodeText")}</div>
          <input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" style={{ ...styles.loginInput, width: "100%", textAlign: "center", letterSpacing: 6 }} />
          <input type={showPw ? "text" : "password"} autoComplete="new-password" maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("login.newPasswordPlaceholder")} style={{ ...styles.loginInput, width: "100%", textAlign: "left" }} />
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: "var(--text-muted)", cursor: "pointer" }}><input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} />{t("extra.showPassword")}</label>
          <button style={{ ...styles.primaryBtn, background: "#D4AF6A" }} disabled={busy || code.length !== 6 || !passwordStrong(password)} onClick={() => run(() => resetPassword(email.trim(), code, password), "done")}>{t("login.resetPassword")}</button>
        </>}
        {step === "done" && <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>{t("login.resetDone")}</div>}
        {message && <div style={{ fontSize: 11, color: "#E8425A", textAlign: "center" }}>{message}</div>}
        <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={onClose}>{step === "done" ? t("login.close") : t("confirm.cancel")}</button>
      </div>
    </div>
  );
}
