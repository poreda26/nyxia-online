# Transparent inventory armor icons

Warrior and Rogue T1–T5: 50 inventory PNGs replaced with transparent, centered artwork. Item identities, stats, saves and worn character atlases are unchanged. Existing name mappings and class/tier/slot fallback both resolve the updated files.

## Assets and reproduction

- Built-in Imagegen edit mode, using contact sheets of the existing inventory artwork as references.
- Sources: `art-source/warrior-inventory-transparent.png`, `art-source/rogue-inventory-transparent.png`.
- Runtime assets: `src/assets/items/{warrior,rogue}-t{1..5}-{head,chest,legs,gauntlets,boots}.png`.
- Export: `node scripts/export-transparent-armor-icons.mjs`. Alpha preserved, 420px output with 30px transparent padding. Reviewed cell boundaries exclude neighboring item tips.

## Prompt set

Warrior: Edit the reference into a transparent 5×5 inventory armor atlas. Preserve the 25 item identities and positions. Columns: helmet, chest, legs, gloves, boots. Rows: brown leather, iron/bronze, engraved steel/gold, blue steel/gold griffin, ivory/gold. Remove tile backgrounds, scenery, platforms, particles, glow, props and constellation lines. Keep each complete item centered in its cell, readable at small size, with consistent top-left lighting. No people, labels, UI or external shadows. True transparent alpha.

Rogue: Same transparent atlas requirements and column order, retaining the existing leather, dark iron/bronze, engraved steel/gold, blue steel/beast crest and ivory/gold tier identities. Remove scenery, galaxy backgrounds, display supports and particles. Keep the T5 chest separate from gloved hands; retain the original armor motifs. True transparent alpha.

## Verification

All 50 icons rendered through the actual ItemIcon component at 320, 390 and 768px; no image failures, browser errors or horizontal overflow. Inspected the contact sheets and mobile preview. Production build passed.
