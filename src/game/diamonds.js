import { buyPremium } from "../utils/premium";
import { buyWings } from "../utils/wings";
import { addItemToInventory, makeRaceScroll, makeJobScroll, makeBonusScrollStack, buyExtraBankPage } from "../utils/inventory";
import { buyExtraDungeonEntries } from "../utils/soloDungeon";
import { buyBoostScrollPack } from "../utils/boosts";

// Elmasla alınan eşya/paketlerin teslimi (Faz 2c). Tahsilat (elmas düşme, fiyat, premium hakkı) sunucu
// kancasında (server/app.mjs 'diamond/buy') cüzdan işlemiyle yapılır; bu eylem aynı işlemde teslimi yapar.
// Teslim başarısız olursa (çanta dolu vb.) bütün işlem geri alınır: elmas düşmez.
// `diamonds` (tahsilattan sonraki bakiye) ve `price` kancadan gelir; saf alım işlevleri bedeli kendileri
// düştüğü için oyuncu "tahsilattan önceki" bakiyeye çekilir ve sonuçta bakiye sunucudakine eşit olur.
const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });

const DELIVERED_KINDS = ["premium", "wings", "bonusScroll", "raceScroll", "jobScroll", "dungeonEntry", "bankPage", "boostPack"];
export const isDeliveredDiamondKind = (kind) => DELIVERED_KINDS.includes(kind);

export const diamondReducers = {
  "diamond/buy"(state, { kind, key, diamonds, price }) {
    if (!Number.isSafeInteger(diamonds) || !Number.isSafeInteger(price)) return fail(state, "noServerData");
    if (!isDeliveredDiamondKind(kind)) return fail(state, "invalidPurchase");
    const player = { ...state.player, diamonds: diamonds + price };
    const grantScroll = (stack) => {
      const added = addItemToInventory({ ...player, diamonds }, stack);
      return added.added ? done({ ...state, player: added.player }) : fail(state, "purchaseFailed", { detail: added.reason });
    };
    switch (kind) {
      case "premium": {
        const r = buyPremium(player, key, state.bank);
        return r.bought ? done({ ...state, player: r.player, bank: r.bank }) : fail(state, r.reason || "purchaseFailed");
      }
      case "wings": {
        const r = buyWings(player, key);
        return r.bought ? done({ ...state, player: r.player }) : fail(state, r.reason || "purchaseFailed");
      }
      case "bonusScroll": return grantScroll(makeBonusScrollStack());
      case "raceScroll": return grantScroll(makeRaceScroll(1));
      case "jobScroll": return grantScroll(makeJobScroll(1));
      case "dungeonEntry": {
        const r = buyExtraDungeonEntries(player);
        return r.bought ? done({ ...state, player: r.player }) : fail(state, r.reason || "purchaseFailed");
      }
      case "bankPage": {
        const r = buyExtraBankPage(player, state.bank);
        return r.bought ? done({ ...state, player: r.player, bank: r.bank }) : fail(state, r.reason || "purchaseFailed");
      }
      case "boostPack": {
        const r = buyBoostScrollPack(player, key);
        return r.bought ? done({ ...state, player: r.player }) : fail(state, r.reason || "purchaseFailed");
      }
      default: return fail(state, "invalidPurchase");
    }
  },
};
