// Sunucu otoritesi için paylaşılan oyun mantığı: bu dosya hem istemcide hem de
// server/game-logic.generated.mjs paketinde (bkz. scripts/build-game-logic.mjs) kullanılır.
import { initialPlayer } from "../utils/player";

export { applyAction, ACTION_TYPES, reducers } from "./actions";

const CLASS_IDS = ["warrior", "rogue", "mage"];
const RACE_IDS = ["human", "karus", "elmorad"];

// Yeni bir karakterin başlangıç ekonomisi (altın, çanta, kuşanılanlar, sandıklar). Sunucu,
// istemcinin yeni karakter için söylediği değerlere değil bunlara güvenir.
export function createCharacter(cls, race, nickname) {
  return initialPlayer(CLASS_IDS.includes(cls) ? cls : "warrior", RACE_IDS.includes(race) ? race : "human", typeof nickname === "string" ? nickname : "Hero");
}

export function newCharacterEconomy(cls, race, nickname) {
  const player = createCharacter(cls, race, nickname);
  return { gold: player.gold, inventory: player.inventory, equipped: player.equipped, chests: player.chests };
}
