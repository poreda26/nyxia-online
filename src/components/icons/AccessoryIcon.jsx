const PATHS = {
  ring: (
    <>
      <circle cx="12" cy="15" r="6" />
      <path d="M9.5 9 12 4l2.5 5" />
      <circle cx="12" cy="5.5" r="1.3" />
    </>
  ),
  necklace: (
    <>
      <path d="M4 4c0 7 4 11 8 11s8-4 8-11" />
      <path d="M12 15v3" />
      <circle cx="12" cy="20" r="2" />
    </>
  ),
  belt: (
    <>
      <path d="M2 12h6" /><path d="M16 12h6" />
      <rect x="8" y="7" width="8" height="10" rx="2" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  earring: (
    <>
      <path d="M12 3v4" />
      <circle cx="12" cy="10" r="3" />
      <path d="M12 13v2" />
      <circle cx="12" cy="18" r="2.2" />
    </>
  ),
};

export default function AccessoryIcon({ slot, size = 16, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[slot] || PATHS.ring}
    </svg>
  );
}
