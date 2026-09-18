import { ARMOR_DYES } from "../data/armorDyes";

// Bir boyayı satın al (ilk kez) ya da zaten sahipse sadece giy — ikinci
// durumda tekrar elmas harcamaz, bkz. components/CharacterTab.jsx'in
// Kozmetik alt sekmesi. dyeId null verilirse orijinal renklere döner
// (her zaman ücretsiz, satın alma gerektirmez).
export function selectArmorDye(player, dyeId) {
  if (dyeId === null) return { player: { ...player, armorDye: null }, bought: true };
  const owned = player.ownedDyes?.includes(dyeId);
  if (owned) return { player: { ...player, armorDye: dyeId }, bought: true };

  const dye = ARMOR_DYES.find((d) => d.id === dyeId);
  if (!dye) return { player, bought: false, reason: "invalidDye" };
  if (player.diamonds < dye.cost) return { player, bought: false, reason: "notEnoughDiamonds" };

  return {
    player: {
      ...player,
      diamonds: player.diamonds - dye.cost,
      ownedDyes: [...(player.ownedDyes || []), dyeId],
      armorDye: dyeId,
    },
    bought: true,
    purchased: true,
  };
}
