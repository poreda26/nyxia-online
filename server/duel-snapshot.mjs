// Düello için gereken karakter alanları. Rakibe giden veri yalnızca bunlardan
// oluşur: envanter, altın, banka, görev ilerlemesi gibi özel veriler çıkarılır.
// (Savaş hesabı ve karakter çizimi bu alanlarla çalışır; bkz.
// src/utils/pvpBalance.js#pvpSnapshot, src/utils/duelEngine.js, CharacterFigure.)
const KEEP = ['id', 'class', 'race', 'nickname', 'level', 'stats', 'equipped', 'skills', 'awakened', 'armorDye', 'activeBoosts', 'avatarId', 'avatarFrameId'];

export function duelSnapshot(character) {
  const out = {};
  for (const key of KEEP) if (character?.[key] !== undefined) out[key] = character[key];
  return out;
}
