import { executeGmCommand } from "../utils/gmCommands";
import { gmBuildWeaponById, gmBuildArmor, gmBuildAccessory } from "../utils/loot";
import { addItemToInventory } from "../utils/inventory";
import { uid } from "../utils/random";

// GM/sahip araçları (sohbet komutları ve GM eşya paneli). Yetki sunucuda denetlenir
// (server/app.mjs kancaları: yalnızca hesaba bağlı GM'ler); bu eylemler sunucu ekonomisi açıkken
// GM'in değişiklikleri yedekten geri çevrilmesin diye sunucuda uygulanır.
// Elmas ve premium komutları kendi sunucu uçlarından gider (cüzdan / hak), burada yoktur.
const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });

export const GM_ACTION_TYPES = ["gm/exec", "gm/give", "gm/clearInventory", "gm/giveAllChests"];

export const gmReducers = {
  "gm/exec"(state, { cmd, args }) {
    if (typeof cmd !== "string" || !Array.isArray(args) || args.some((a) => typeof a !== "string")) return fail(state, "invalidPayload");
    if (cmd === "elmas" || cmd === "premium") return fail(state, "dedicatedRoute");
    const out = executeGmCommand(state.player, cmd, args.slice(0, 6), state.bank);
    return done({ ...state, player: out.player, bank: out.bank ?? state.bank }, { resultText: out.resultText });
  },

  "gm/give"(state, { spec }) {
    if (!spec || typeof spec !== "object") return fail(state, "invalidPayload");
    const level = Number.isInteger(spec.level) ? spec.level : 0;
    let item = null;
    if (spec.kind === "weapon") item = gmBuildWeaponById(spec.cls, spec.weaponId, level);
    else if (spec.kind === "armor") item = gmBuildArmor(spec.cls, spec.slot, spec.tier, level);
    else if (spec.kind === "accessory") item = gmBuildAccessory(spec.accSlot, spec.tier, level, spec.name ?? null);
    if (!item) return fail(state, "noCombo");
    const added = addItemToInventory(state.player, item);
    return done({ ...state, player: added.player }, { added: added.added, item, level, detail: added.reason });
  },

  "gm/clearInventory"(state) {
    return done({ ...state, player: { ...state.player, inventory: [] } });
  },

  "gm/giveAllChests"(state, { perTier = 5 }) {
    const per = Math.max(1, Math.min(50, Number.isInteger(perTier) ? perTier : 5));
    const chests = [];
    for (let tier = 1; tier <= 6; tier++) for (let i = 0; i < per; i++) chests.push({ id: uid(), tier });
    chests.push({ id: uid(), tier: 5, special: true });
    return done({ ...state, player: { ...state.player, chests: [...state.player.chests, ...chests] } }, { perTier: per });
  },
};
