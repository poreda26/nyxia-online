import { claimQuest, claimAwakening } from "../utils/quests";
import { claimDailyQuest } from "../utils/dailyQuests";
import { claimWeeklyQuest } from "../utils/weeklyQuests";
import { claimCollection } from "../utils/collection";
import { buyNationalPoint } from "../utils/nationalPoint";
import { claimDailyLogin } from "../utils/dailyLogin";
import { applyWheelPrize } from "../utils/wheel";
import { creditScheduledEventTicks, joinScheduledEvent } from "../utils/scheduledEvents";
import { SCHEDULED_EVENTS } from "../data/scheduledEvents";
import { grantTutorialGift, TUTORIAL_SCROLL_PRICE } from "../utils/tutorial";

// Görev, günlük ödül, etkinlik ve rehber ödülleri (Faz 3a). Hepsi oyunun mevcut saf
// fonksiyonlarını çağırır; ödüller artık yalnızca bu eylemlerle verilir.
const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });

// `claimed`/`bought` bayraklı saf sonuçları eylem sonucuna çevirir.
function fromClaim(state, result, flag, extra = {}) {
  if (!result[flag]) return fail(state, result.reason || "failed", result.reasonVars ? { reasonVars: result.reasonVars } : {});
  return done({ ...state, player: result.player }, extra);
}

const findEvent = (eventId) => SCHEDULED_EVENTS.find((e) => e.id === eventId) || null;

export const progressReducers = {
  "captain/quest"(state, { questId }) {
    const r = claimQuest(state.player, questId);
    return fromClaim(state, r, "claimed", { quest: r.quest });
  },
  "captain/awaken"(state) {
    return fromClaim(state, claimAwakening(state.player), "claimed");
  },
  "captain/daily"(state, { slotIndex }) {
    if (!Number.isInteger(slotIndex)) return fail(state, "invalidQuest");
    const r = claimDailyQuest(state.player, slotIndex);
    return fromClaim(state, r, "claimed", { quest: r.quest });
  },
  "captain/weekly"(state, { id }) {
    const r = claimWeeklyQuest(state.player, id);
    return fromClaim(state, r, "claimed", { quest: r.quest });
  },
  "captain/book"(state, { id }) {
    const r = claimCollection(state.player, id);
    return fromClaim(state, r, "claimed", { collection: r.collection });
  },
  "captain/buyNp"(state) {
    return fromClaim(state, buyNationalPoint(state.player), "bought");
  },

  // Sunucu yolunda `server` alanı (seri, elmas bakiyesi) sunucunun kendi günlük kaydından gelir
  // (bkz. server/app.mjs kancası); istemcinin yazdığı yok sayılır.
  "dailyLogin/claim"(state, { server }) {
    if (!server || !Number.isInteger(server.streak) || server.streak < 1) return fail(state, "noServerData");
    const r = claimDailyLogin(state.player, server);
    return fromClaim(state, r, "claimed", { reward: r.reward, streak: r.streak });
  },

  // Çark: ödül (prize/spunAt) sunucuda seçilmiş bekleyen kayıttır; sunucu yolunda kancadan gelir.
  "wheel/claimItem"(state, { prize, spunAt }) {
    const out = applyWheelPrize(state.player, state.bank, prize, spunAt);
    if (!out.delivered) return fail(state, "bagFull");
    return done({ ...state, player: out.player, bank: out.bank }, { prize, toBank: !!out.toBank });
  },

  "event/join"(state, { eventId }) {
    const event = findEvent(eventId);
    if (!event) return fail(state, "unknownEvent");
    const r = joinScheduledEvent(state.player, event);
    return fromClaim(state, r, "joined");
  },
  "event/credit"(state, { eventId }) {
    const event = findEvent(eventId);
    if (!event) return fail(state, "unknownEvent");
    const r = creditScheduledEventTicks(state.player, event);
    if (!r) return done(state, { credited: false });
    return done({ ...state, player: r.player }, { credited: true, xpGain: r.xpGain, newTicks: r.newTicks, levelsGained: r.levelsGained });
  },

  "tutorial/gift"(state) {
    return done({ ...state, player: grantTutorialGift(state.player).player });
  },
  // Rehber, "parşömen al" adımında altın yetmezse takılmasın diye yalnızca rehber sürerken tamamlar.
  "tutorial/topUp"(state) {
    const { player } = state;
    if (player.tutorialSeen || player.gold >= TUTORIAL_SCROLL_PRICE) return done(state);
    return done({ ...state, player: { ...player, gold: TUTORIAL_SCROLL_PRICE } });
  },
};
