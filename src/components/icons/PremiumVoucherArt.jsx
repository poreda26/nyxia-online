import { useId } from "react";

// Premium kuponu: katman renginde, ortasında taç olan altın kenarlı bilet.
export default function PremiumVoucherArt({ item = {}, size = 48, label }) {
  const id = useId();
  const color = item.color || "#D4AF6A";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label || item.name || "Premium"}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#2b2438" /><stop offset="1" stopColor="#14111c" /></linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0b8" /><stop offset=".5" stopColor="#d4af6a" /><stop offset="1" stopColor="#8a6a2f" /></linearGradient>
      </defs>
      <path d="M12 28h76a4 4 0 0 1 4 4v10a8 8 0 0 0 0 16v10a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V58a8 8 0 0 0 0-16V32a4 4 0 0 1 4-4z" fill={`url(#${id}-bg)`} stroke={`url(#${id}-gold)`} strokeWidth="3" />
      <path d="M30 62l-3-18 11 8 12-14 12 14 11-8-3 18z" fill={color} stroke="#0b0c10" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="50" cy="37" r="3" fill="#fff0b8" />
      <path d="M26 68h48" stroke={`url(#${id}-gold)`} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
