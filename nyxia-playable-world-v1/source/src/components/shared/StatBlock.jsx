import { styles } from "../../styles";

export default function StatBlock({ label, value, color }) {
  return (
    <div style={styles.statBlock}>
      <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
