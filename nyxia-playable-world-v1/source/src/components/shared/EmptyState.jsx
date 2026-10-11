import { styles } from "../../styles";

export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={styles.emptyState}>
      <Icon size={28} color="var(--text-faint)" strokeWidth={1.4} />
      <div style={{ fontFamily: "var(--font-display)", fontSize: 14, marginTop: 10, color: "var(--text-muted)" }}>{title}</div>
      <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4, textAlign: "center", maxWidth: 220 }}>{subtitle}</div>
    </div>
  );
}
