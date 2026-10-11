import { styles } from "../styles";
import { useTranslation } from "../i18n/LanguageContext";
import { ADULT_AGE, ageFromBirth, todayIso } from "../utils/birth";

// Tarafsız yaş alanı: yalnızca doğum tarihi sorulur, alt sınır belirtilmez. 18 yaşından küçükse kısa bir veli notu gösterilir.
export default function BirthDateInput({ value, onChange, onEnter }) {
  const { t } = useTranslation();
  const age = ageFromBirth(value);
  return (
    <div style={{ marginBottom: 14, textAlign: "left" }}>
      <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{t("login.birthLabel")}</label>
      <input
        type="date"
        value={value}
        min="1900-01-01"
        max={todayIso()}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onEnter?.(); }}
        aria-label={t("login.birthLabel")}
        style={{ ...styles.loginInput, width: "100%", textAlign: "left", colorScheme: "dark" }}
      />
      {age !== null && age < ADULT_AGE && <p style={{ ...styles.loginCaveat, marginTop: 6 }}>{t("login.minorNote")}</p>}
    </div>
  );
}
