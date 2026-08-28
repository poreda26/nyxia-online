const PATHS = {
  sword: (
    <>
      <path d="M12 2v13" />
      <path d="M8.5 15.5h7" />
      <path d="M12 15.5V21" />
    </>
  ),
  axe: (
    <>
      <path d="M7 21 17 5" />
      <path d="M13 3c3-1 7 1 7 5-4 1-7-1-8-3z" />
    </>
  ),
  hammer: (
    <>
      <rect x="7.5" y="3" width="9" height="5" rx="1.2" />
      <path d="M12 8v13" />
    </>
  ),
  spear: (
    <>
      <path d="M12 22V7" />
      <path d="M12 2l4 5h-8z" />
    </>
  ),
  bow: (
    <>
      <path d="M8 3c-4.5 4.5-4.5 13.5 0 18" />
      <path d="M8 3v18" />
      <path d="M3 12h12" />
      <path d="M12 9l3 3-3 3" />
    </>
  ),
  dagger: (
    <>
      <path d="M12 4v8" />
      <path d="M9.5 12h5" />
      <path d="M12 12v8" />
    </>
  ),
  staff: (
    <>
      <path d="M12 6.5V22" />
      <circle cx="12" cy="4" r="2.3" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.5A2 2 0 0 1 6 3h6v17H6a2 2 0 0 0-2 2z" />
      <path d="M20 4.5A2 2 0 0 0 18 3h-6v17h6a2 2 0 0 1 2 2z" />
    </>
  ),
  orb: (
    <>
      <circle cx="12" cy="10" r="6" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </>
  ),
  talisman: (
    <>
      <circle cx="12" cy="4" r="1.5" />
      <path d="M12 5.5v2" />
      <path d="M12 7.5 18 15l-6 7-6-7z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    </>
  ),
};

export default function WeaponIcon({ iconKey, size = 16, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[iconKey] || PATHS.sword}
    </svg>
  );
}
