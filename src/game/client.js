import { applyAction } from "./actions";
import { call, getActiveCharacterKey } from "../utils/api";

// İstemci tarafı eylem uygulayıcısı. Bileşenler `act("inventory/sell", { itemId })` çağırır;
// kuralların nerede çalışacağı hesabın "sunucu ekonomisi" bayrağına bağlıdır:
//  - bayrak KAPALI: aynı kurallar (src/game/actions.js) burada, istemcide uygulanır;
//  - bayrak AÇIK: eylem sunucuya gider, sunucu uygular, istemci dönen yamayı yansıtır.
// Her iki durumda dönen değer eylemin `result`'ıdır (+ `nextPlayer`: yamalı güncel oyuncu).
const changedKeys = (before, after) => {
  const patch = {};
  for (const key of Object.keys(after)) if (before[key] !== after[key]) patch[key] = after[key];
  return patch;
};

export function createActor({ getState, setPlayer, setBank, setBankGold, isServer, onRevision }) {
  return async function act(type, payload = {}) {
    const before = getState();
    if (!isServer()) {
      const { state, result } = applyAction(before, type, payload);
      if (!result.ok) return result;
      const patch = changedKeys(before.player, state.player);
      if (Object.keys(patch).length) setPlayer((p) => ({ ...p, ...patch }));
      if (state.bank !== before.bank) setBank(() => state.bank);
      if (state.bankGold !== before.bankGold) setBankGold(() => state.bankGold);
      return { ...result, nextPlayer: { ...before.player, ...patch } };
    }
    try {
      const response = await call("game/act", "POST", { characterKey: getActiveCharacterKey(), type, payload });
      onRevision?.(response.revision);
      if (!response.result.ok) return response.result;
      const patch = response.patch || {};
      if (Object.keys(patch).length) setPlayer((p) => ({ ...p, ...patch }));
      if (response.bank) setBank(() => response.bank);
      if (response.bankGold !== undefined) setBankGold(() => response.bankGold);
      return { ...response.result, nextPlayer: { ...before.player, ...patch } };
    } catch (error) {
      return { ok: false, reason: "network", code: error?.code };
    }
  };
}
