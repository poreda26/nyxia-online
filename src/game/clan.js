import {isFirstPurchaseWeapon} from '../data/firstPurchaseWeapons';
import { CLAN_DUNGEON_MATERIALS } from "../data/clanDungeon";
import { addItemToInventory, makeClanMaterialStack } from "../utils/inventory";

// Klan bağışları ve klan zindanı ödülleri (Faz 2c). Klan hazinesi ve üyelik sunucudaki kayıtlardır;
// oyuncudan düşen altın/NP/malzeme ile hazineye eklenen miktar aynı işlemde (sunucu kancası) yazılır.
// Elmas bağışı cüzdan üzerinden zaten sunucuda gider (/api/clan/donate, currency: diamonds).
const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });

export const NP_REFUND_RATE = 0.35;

export const clanReducers = {
  "clan/vaultDeposit"(state,{itemId}){
    const item=state.player.inventory.find(i=>i.id===itemId);
    if(!item)return fail(state,"itemNotFound");
    if(!["weapon","armor","accessory","clanMaterial"].includes(item.kind)||isFirstPurchaseWeapon(item)||item.bound||item.soulbound||item.accountBound||item.characterBound||item.tradeable===false||item.tradable===false||item.noTrade)return fail(state,"clanItemBound");
    return done({...state,player:{...state.player,inventory:state.player.inventory.filter(i=>i.id!==itemId)}},{item});
  },
  "clan/vaultWithdraw"(state,{item}){
    if(!item||!item.id)return fail(state,"itemNotFound");
    if(state.player.inventory.some(i=>i.id===item.id)||Object.values(state.player.equipped||{}).some(i=>i?.id===item.id))return fail(state,"duplicateItem");
    const added=addItemToInventory(state.player,item);
    if(!added.added)return fail(state,"clanBagFull");
    return done({...state,player:added.player});
  },
  "clan/donate"(state, { currency, amount }) {
    if (!Number.isSafeInteger(amount) || amount <= 0) return fail(state, "enterValidAmount");
    const { player } = state;
    if (currency === "np") {
      if (player.nationalPoint < amount) return fail(state, "notEnoughNP");
      return done({ ...state, player: { ...player, nationalPoint: player.nationalPoint - amount } });
    }
    if (currency === "gold") {
      if (player.gold < amount) return fail(state, "notEnoughGold");
      return done({ ...state, player: { ...player, gold: player.gold - amount } });
    }
    if (Object.hasOwn(CLAN_DUNGEON_MATERIALS, currency)) {
      const stack = player.inventory.find((it) => it.kind === "clanMaterial" && it.materialKey === currency);
      if (!stack || (stack.count || 0) < amount) return fail(state, "toastDonateFailed");
      const inventory = player.inventory
        .map((it) => (it.id === stack.id ? { ...it, count: it.count - amount } : it))
        .filter((it) => it.id !== stack.id || it.count > 0);
      return done({ ...state, player: { ...player, inventory } });
    }
    return fail(state, "invalidDonation");
  },

  // Üyelik kaydını silen sunucu kancası `donatedNp` değerini (gerçek bağış toplamı) verir.
  "clan/leave"(state, { donatedNp }) {
    const refund = Math.round((Number.isSafeInteger(donatedNp) && donatedNp > 0 ? donatedNp : 0) * NP_REFUND_RATE);
    return done({ ...state, player: { ...state.player, clan: null, nationalPoint: state.player.nationalPoint + refund } }, { refund });
  },

  // Klan zindanında sunucunun düşürdüğü malzemeler (`pending_grants`). Sığmayanlar sırada bekler.
  "clan/claimMaterials"(state, { materials }) {
    if (!Array.isArray(materials)) return fail(state, "invalidPayload");
    let player = state.player;
    let placed = 0;
    for (const key of materials) {
      if (!Object.hasOwn(CLAN_DUNGEON_MATERIALS, key)) break;
      const added = addItemToInventory(player, makeClanMaterialStack(key, 1));
      if (!added.added) break;
      player = added.player;
      placed++;
    }
    return done({ ...state, player }, { placed, keys: materials.slice(0, placed), waiting: materials.length - placed });
  },
};
