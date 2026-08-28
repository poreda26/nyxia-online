// One distinct silhouette per class × slot (20 total) so a Warrior's plate
// helm reads differently from a Priest's circlet or a Mage's pointed hat,
// instead of every class sharing one generic "helmet" outline.
const PATHS = {
  // WARRIOR — plate armor: boxy, thick, riveted
  "warrior-head": (
    <>
      <path d="M4.5 14.5a7.5 7.5 0 0 1 15 0V17H4.5z" />
      <path d="M12 7v6" />
      <path d="M8 17v3" /><path d="M16 17v3" />
    </>
  ),
  "warrior-chest": (
    <>
      <path d="M8 4h8l1 4-1 3H8l-1-3z" />
      <path d="M12 11v9" />
      <path d="M6.5 11 5 20h14l-1.5-9" />
    </>
  ),
  "warrior-legs": (
    <>
      <path d="M8 3h8l1 8-3 10-2-7-2 7-3-10z" />
      <path d="M9 9h6" />
    </>
  ),
  "warrior-gauntlets": (
    <>
      <path d="M7 21v-8a5 5 0 0 1 10 0v8z" />
      <path d="M7 15h10" /><path d="M7 18h10" />
    </>
  ),
  "warrior-boots": (
    <>
      <path d="M9.5 3v9l-5 4.5V20a1 1 0 0 0 1 1h13l-1.5-5.5-3.5-2V3z" />
      <path d="M9.5 8h4" />
    </>
  ),

  // ROGUE — leather & shadow: pointed hood, slim straps
  "rogue-head": (
    <>
      <path d="M12 3c-4 0-6.5 3-6.5 7 0 4 2 6 2 9h9c0-3 2-5 2-9 0-4-2.5-7-6.5-7z" />
      <path d="M9.5 11h.01" /><path d="M14.5 11h.01" />
    </>
  ),
  "rogue-chest": (
    <>
      <path d="M9 4 12 2l3 2v3l-3 1-3-1z" />
      <path d="M7 8l5-2 5 2-1 12H8z" />
      <path d="M9 11l3 1 3-1" />
    </>
  ),
  "rogue-legs": (
    <>
      <path d="M9 3h6l1 9-2.5 9-1.5-6-1.5 6-2.5-9z" />
      <path d="M9.5 14h5" />
    </>
  ),
  "rogue-gauntlets": (
    <>
      <path d="M8 21v-6a4 4 0 0 1 8 0v6z" />
      <path d="M9.5 11V6.5a1.2 1.2 0 0 1 2.4 0v3" />
    </>
  ),
  "rogue-boots": (
    <>
      <path d="M10 3v10l-4 4v3a1 1 0 0 0 1 1h11l-1-4-3-2V3z" />
      <path d="M9 15l2 1 2-1" />
    </>
  ),

  // MAGE — robe & arcane: pointed hat, flowing hem, gem accents
  "mage-head": (
    <>
      <path d="M12 2 6 16h12z" />
      <path d="M8.5 16a3.5 3.5 0 0 0 7 0" />
      <circle cx="12" cy="8" r="1" />
    </>
  ),
  "mage-chest": (
    <>
      <path d="M12 3l3 2v3l-3 1-3-1V5z" />
      <path d="M8 8l-2 12h12L16 8" />
      <path d="M12 12v6" />
    </>
  ),
  "mage-legs": (
    <>
      <path d="M8 4h8l2 16H6z" />
      <path d="M9 4l-1.5 16" /><path d="M15 4l1.5 16" />
    </>
  ),
  "mage-gauntlets": (
    <>
      <path d="M8 21v-7a4 4 0 0 1 8 0v7z" />
      <circle cx="12" cy="12" r="1.4" />
    </>
  ),
  "mage-boots": (
    <>
      <path d="M9 3v10c0 2-3 3-3 6v2a1 1 0 0 0 1 1h5c3 0 5-1 5-3l-1-6h-3V3z" />
    </>
  ),

  // PRIEST — holy: rounded circlet, cross accents
  "priest-head": (
    <>
      <path d="M4.5 15a7.5 7.5 0 0 1 15 0V17H4.5z" />
      <circle cx="12" cy="4.5" r="2" />
      <path d="M8 17v3" /><path d="M16 17v3" />
    </>
  ),
  "priest-chest": (
    <>
      <path d="M9 4 12 2l3 2v3l-3 1-3-1z" />
      <path d="M6.5 9h11l-1 12h-9z" />
      <path d="M12 12v5" /><path d="M9.5 14.5h5" />
    </>
  ),
  "priest-legs": (
    <>
      <path d="M8 4h8l1.5 16H6.5z" />
      <path d="M9.5 4l-1 16" /><path d="M14.5 4l1 16" />
    </>
  ),
  "priest-gauntlets": (
    <>
      <path d="M8 21v-7a4 4 0 0 1 8 0v7z" />
      <path d="M12 12v3" /><path d="M10.5 13.5h3" />
    </>
  ),
  "priest-boots": (
    <>
      <path d="M9.5 3v11l-3 3v3a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1l-1-4-3.5-1.5V3z" />
    </>
  ),
};

const FALLBACK = (
  <>
    <path d="M9 3.5 12 2l3 1.5V6H9z" />
    <path d="M6.5 6h11v9.5A5.5 5.5 0 0 1 12 21a5.5 5.5 0 0 1-5.5-5.5z" />
  </>
);

export default function ArmorIcon({ slot, cls, size = 16, color = "currentColor", strokeWidth = 1.6 }) {
  const key = `${cls}-${slot}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[key] || FALLBACK}
    </svg>
  );
}
