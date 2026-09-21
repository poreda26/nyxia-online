# Inventory and reward presentation — September 2026

## Follow-up: stylized Captain and game navigation

The Captain was replaced at the user's request with an intentionally stylized, hand-painted NPC (`src/assets/npc/captain-stylized.webp`). New filled SVG menu emblems sit in a horizontally scrollable metal dock, with active medallions and notification gems. All nine destinations remain available. The HUD places identity/actions above stats/currencies. Section headings and the Captain greeting have matching decorative framing.

Boss/event announcements use `NoticeTicker`: actual measured overflow, endpoint reading pauses, hover/focus/press pause, stable animation during same-width countdown changes, ResizeObserver cleanup, and fully wrapped text when reduced motion is requested. `node scripts/check-game-chrome.mjs` checks the real Hub, navigation reachability and ticker behavior in an isolated browser.

Tool: built-in `image_gen.imagegen`; generated source remains in the Codex generated-images folder; runtime copy is optimized to 512px WebP. Exact new Captain prompt:

Square NPC portrait asset for a stylized dark fantasy mobile RPG, Nyxia Online. A clearly fictional video game character, NOT realistic human photography: heroic stout veteran captain with exaggerated broad shoulders, angular expressive face, large stylized eyebrows, short silver beard, confident friendly smirk, oversized navy steel shoulder armor with chunky gold edges, burgundy cape, blue feather helmet. Hand-painted 3D cartoon game art like a premium fantasy strategy RPG, simplified sculpted facial planes, saturated rich colors, clean bold silhouette, painted gradients, no skin pores, no photographic textures. Chest-up centered close portrait with full helmet and shoulders, warm gold rim light, dark teal fortress shapes softly painted behind. Readable at 56px icon size, strong personality, original design. No text, no UI, no frame, no watermark.

- All 75 T1–T5 class/slot combinations have inventory artwork. 38 missing icons added: Warrior 13, Mage 25. Existing Rogue, Warrior T3 gloves/boots, and Warrior T4/T5 artwork retained.
- New images follow the materials, colors and progression of worn armor. They are standalone items, without character faces or weapon fragments. Equipment rendering and statistics are unchanged.
- Class emblems are original SVGs (sword/shield, bow, crystal staff). Captain uses a generated portrait, optimized to 512px WebP.
- Daily login shows a seven-day reward track and claimed state. First purchase keeps its existing rewards, price and purchase handler; item tooltips still work. No countdown or changed reward rules.
- Bottom navigation and top bar share subtle gold edging and active-state treatments. Scrolling stays enabled.

## Assets and reproduction

Tool: built-in `image_gen.imagegen` (no external model or preset).
Captain runtime asset: `src/assets/npc/captain.webp`.
Armor source sheet: `art-source/inventory-armor-sheet.png`.
Individual icons: `src/assets/items/{class}-t{tier}-{slot}.png`.
`node scripts/build-armor-icons.mjs` exports only the 38 new icons. Set `NYXIA_SHARP` to a Sharp installation outside the configured workstation.
`node scripts/check-visual-polish.mjs` verifies the views against Vite on port 5177; set `NYXIA_PLAYWRIGHT` for a different Playwright installation.

### Captain generation prompt

Create a single finished game asset: portrait of the Captain NPC for Nyxia Online, a dark fantasy mobile MMORPG with nostalgic hand-painted early 2000s PC MMORPG aesthetics. A seasoned human male military captain, age 45, short dark hair with grey temples, neatly trimmed beard, weathered calm face, worn steel plate armor with restrained antique gold trim, deep burgundy cloak, friendly but authoritative. Chest-up portrait, centered, head fully visible, shoulders comfortably within frame, looking slightly toward viewer. Painterly realistic game illustration, richly textured metal, cinematic warm torch light on face, cool teal shadows. Dark softly blurred medieval stone fortress background. Square composition, excellent legibility as a small game NPC portrait, no text, no lettering, no logos, no UI frame. Original character design.

### Armor generation prompt

Create a production game inventory sprite sheet for Nyxia Online, based closely on the armor styles and colors of the reference. EXACT layout: 5 columns by 8 rows, 40 equal square cells, absolutely NO gaps or borders, no text or labels. Overall portrait aspect ratio 5:8. Each cell contains one isolated standalone equipment item (or pair for gloves and boots), centered with generous 15% safe padding on all sides, on perfectly solid black #000000 background. No bodies, no faces, no skin, no arms, no weapons, no necks. Empty helmets with dark empty openings. High quality richly textured hand-painted dark fantasy MMORPG inventory art, clearly lit, strong silhouette. Columns in EVERY ROW left-to-right: helmet, chest armor, pair of gauntlets/gloves, leg armor/pants/skirt, pair of boots. Row 1: Warrior tier1 brown weathered stitched leather and chainmail, simple brown leather helmet. Row2: Warrior tier2 plain silver steel and dark leather, rounded riveted iron helmet. Row3: Warrior tier3 ornate bronze steel heavy knight armor, closed pointed knight helmet. Row4: Mage tier1 ivory ragged cloth cap, simple ivory cloth robe chest, brown fingerless leather gloves, ivory robe skirt, simple brown cloth boots. Row5: Mage tier2 green embroidered cap, green brass-trimmed robe chest, green leather gloves, green gold-trimmed robe skirt, green brown boots. Row6: Mage tier3 deep royal blue pointed hood/cap, blue silver celestial embroidered robe chest, blue silver gloves, blue silver embroidered robe skirt, blue silver boots. Row7: Mage tier4 crimson crown hood, crimson gold ornate robe chest, crimson gold gloves, crimson gold robe skirt, crimson gold boots. Row8: Mage tier5 ivory gold majestic crown/hood, ivory gold purple-gem robe chest, ivory gold gloves, ivory gold majestic robe skirt, ivory gold boots. Each equipment piece must fill its own cell well, all forty icons complete and distinct with no overlaps. Keep tiers visually faithful to reference but remove all character anatomy and weapon fragments. These are wearable item icons, NOT portraits or cut-up characters.

Reference: contact sheet of existing standalone icons and equipped armor layers, reviewed before generation. Original generator output files remain in the local Codex generated-images directory.
