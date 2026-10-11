import { styles } from "../../styles";

export default function BarTrack({ pct, color, thin }) {
  return (
    <div style={{ ...styles.barTrack, height: thin ? 5 : 9 }}>
      <div style={{ ...styles.barFill, width: `${Math.max(0, pct)}%`, background: color }} />
    </div>
  );
}
