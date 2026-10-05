import { applyAction } from "./actions";
import { SERVER_OWNED_FIELDS } from "./fields";
import { call, fetchBackup, getActiveCharacterKey } from "../utils/api";

// İstemci tarafı eylem uygulayıcısı. Bileşenler `act("inventory/sell", { itemId })` çağırır;
// kuralların nerede çalışacağı hesabın "sunucu ekonomisi" bayrağına bağlıdır:
//  - bayrak KAPALI: aynı kurallar (src/game/actions.js) burada, istemcide uygulanır;
//  - bayrak AÇIK: eylem sunucuya gider, sunucu uygular, istemci dönen yamayı yansıtır.
// Her iki durumda dönen değer eylemin `result`'ıdır (+ `nextPlayer`: yamalı güncel oyuncu).
//
// Akıcılık: sunucu yolunda, sonucu önceden bilinebilen (rastgelelik ya da sunucu verisi gerektirmeyen)
// eylemler İYİMSER uygulanır: aynı saf kural önce yerelde çalışır, ekran hemen güncellenir, sunucu onayı arkada
// sırayla gider. Sunucu aynı sonucu verirse bir şey değişmez; farklı verirse sunucunun değeri esas alınır;
// reddederse sunucudaki gerçek durum yeniden yüklenir. Rastgele/sunucu verili eylemler (öldürme ödülü, forge basma,
// sandık, çark, pazar...) sonucu beklemeye devam eder. Tüm istekler tek sırada gider, sunucuya hep eylem sırasıyla ulaşır.
export const OPTIMISTIC_ACTIONS = new Set([
  "inventory/equip", "inventory/unequip", "inventory/sell", "inventory/sellBulk", "inventory/repair", "inventory/repairAll",
  "inventory/depositItem", "inventory/withdrawItem", "inventory/depositBulk", "inventory/depositGold", "inventory/withdrawGold",
  "battle/potion", "stat/allocate", "skill/loadout", "title/set",
  "shop/buyPotion", "shop/buyScroll", "shop/buyAccessoryScroll",
  "forge/stageItem", "forge/returnItem", "forge/stageScroll", "forge/returnScroll", "forge/stageBonus", "forge/returnBonus", "forge/clear",
  "accessory/stageItem", "accessory/returnItem", "accessory/stageScroll", "accessory/returnScroll", "accessory/clear",
]);

const changedKeys = (before, after) => {
  const patch = {};
  for (const key of Object.keys(after)) if (before[key] !== after[key]) patch[key] = after[key];
  return patch;
};

// Ekran henüz yeniden çizilmeden art arda gelen iki eylemin ikincisi, birincinin sonucunu görsün diye
// iyimser sonuç kısa süre ayrıca tutulur.
const SHADOW_MS = 120;

export function createActor({ getState, setPlayer, setBank, setBankGold, isServer, onRevision, onRollback }) {
  let queue = Promise.resolve();
  let shadow = null;
  let shadowAt = 0;
  const currentState = () => (shadow && Date.now() - shadowAt < SHADOW_MS ? shadow : getState());

  const applyPatch = (patch, bank, bankGold) => {
    if (patch && Object.keys(patch).length) setPlayer((p) => ({ ...p, ...patch }));
    if (bank) setBank(() => bank);
    if (bankGold !== undefined) setBankGold(() => bankGold);
  };

  // Sunucudaki gerçek durumu yükleyip sunucuya ait alanları yerele yazar (iyimser tahmin tutmadığında).
  const resync = async () => {
    try {
      const backup = await fetchBackup();
      const key = getActiveCharacterKey();
      const characters = backup?.data?.characters || [];
      const index = characters.findIndex((c, i) => c && (c.id || `slot:${i}`) === key);
      if (index < 0) return;
      const server = characters[index];
      shadow = null;
      setPlayer((p) => {
        const next = { ...p };
        for (const field of SERVER_OWNED_FIELDS) { if (server[field] === undefined) delete next[field]; else next[field] = server[field]; }
        return next;
      });
      if (backup.data.bank) setBank(() => backup.data.bank);
      if (Number.isFinite(backup.data.bankGold)) setBankGold(() => backup.data.bankGold);
      if (Number.isFinite(backup.revision)) onRevision?.(backup.revision);
    } catch { /* ağ yok: bir sonraki başarılı eylem ya da yedek turu düzeltir */ }
  };

  const request = (type, payload) => call("game/act", "POST", { characterKey: getActiveCharacterKey(), type, payload });

  const act = async function act(type, payload = {}) {
    const before = currentState();
    if (!isServer()) {
      const { state, result } = applyAction(before, type, payload);
      if (!result.ok) return result;
      const patch = changedKeys(before.player, state.player);
      if (Object.keys(patch).length) setPlayer((p) => ({ ...p, ...patch }));
      if (state.bank !== before.bank) setBank(() => state.bank);
      if (state.bankGold !== before.bankGold) setBankGold(() => state.bankGold);
      return { ...result, nextPlayer: { ...before.player, ...patch } };
    }

    if (OPTIMISTIC_ACTIONS.has(type) && payload && typeof payload === "object") {
      const { state, result } = applyAction(before, type, payload);
      // Yerel kural reddettiyse sunucu da reddeder (aynı kural): hiç gönderme.
      if (!result.ok) return result;
      const patch = changedKeys(before.player, state.player);
      const bank = state.bank !== before.bank ? state.bank : undefined;
      const bankGold = state.bankGold !== before.bankGold ? state.bankGold : undefined;
      applyPatch(patch, bank, bankGold);
      shadow = { player: { ...before.player, ...patch }, bank: bank ?? before.bank, bankGold: bankGold ?? before.bankGold };
      shadowAt = Date.now();
      queue = queue.then(async () => {
        let failed = false;
        try {
          const response = await request(type, payload);
          onRevision?.(response.revision);
          if (!response.result.ok) { failed = true; onRollback?.(type, response.result); }
          else if (JSON.stringify(response.patch || {}) !== JSON.stringify(patch)) {
            // Canlı can/mana arada savaşta değişmiş olabilir: sunucu yamasındaki hp/mp ile geri sarılmaz.
            const { hp, mp, ...serverPatch } = response.patch || {};
            void hp; void mp;
            applyPatch(serverPatch, response.bank, response.bankGold);
          }
        } catch (error) { failed = true; onRollback?.(type, { ok: false, reason: "network", code: error?.code }); }
        if (failed) await resync();
      });
      return { ...result, nextPlayer: shadow.player, optimistic: true };
    }

    // Sonucu beklenen eylem: önceki iyimser istekler bittikten sonra gider.
    shadow = null;
    const run = queue.then(async () => {
      try {
        const response = await request(type, payload);
        onRevision?.(response.revision);
        if (!response.result.ok) return response.result;
        applyPatch(response.patch, response.bank, response.bankGold);
        return { ...response.result, nextPlayer: { ...getState().player, ...(response.patch || {}) } };
      } catch (error) {
        return { ok: false, reason: "network", code: error?.code };
      }
    });
    queue = run.then(() => undefined, () => undefined);
    return run;
  };
  // Bazı eylemlerde (günlük giriş, çark) sunucu yolunda veriyi sunucu kendisi bulur; yerel yolda
  // bileşen eski uçlardan alıp eyleme verir. Hangi yolda olduğunu bu işlev söyler.
  act.isServer = isServer;
  return act;
}
