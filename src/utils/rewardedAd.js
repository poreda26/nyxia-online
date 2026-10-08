import { Capacitor } from "@capacitor/core";
import { ADMOB_REWARDED_UNIT_ANDROID, ADMOB_USE_TEST_ADS } from "../config/ads";

const SIMULATED_WATCH_MS = 5000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Reklamı oynatır ve izlenip izlenmediğini döner: { completed }. Elmas buradan verilmez; sunucu kendi doğrulamasıyla öder.
//  - mode "admob": gerçek reklam (yalnızca mağaza uygulamasında); ödül bildirimi AdMob'dan sunucuya imzalı gider.
//  - mode "test": sunucunun izin verdiği hesaplarda kısa bir sahte reklam (geliştirme/önizleme).
export async function playRewardedAd({ mode, userId, customData }) {
  if (mode === "test") { await wait(SIMULATED_WATCH_MS); return { completed: true }; }
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") throw Object.assign(new Error("ADS_UNSUPPORTED"), { code: "ADS_UNSUPPORTED" });
  const { AdMob, RewardAdPluginEvents } = await import("@capacitor-community/admob");
  await AdMob.initialize();
  const handles = [];
  try {
    const outcome = new Promise((resolve, reject) => {
      let rewarded = false;
      const on = async (event, fn) => handles.push(await AdMob.addListener(event, fn));
      on(RewardAdPluginEvents.Rewarded, () => { rewarded = true; });
      on(RewardAdPluginEvents.Dismissed, () => resolve({ completed: rewarded }));
      on(RewardAdPluginEvents.FailedToLoad, () => reject(Object.assign(new Error("AD_NOT_AVAILABLE"), { code: "AD_NOT_AVAILABLE" })));
      on(RewardAdPluginEvents.FailedToShow, () => reject(Object.assign(new Error("AD_NOT_AVAILABLE"), { code: "AD_NOT_AVAILABLE" })));
    });
    await AdMob.prepareRewardVideoAd({ adId: ADMOB_REWARDED_UNIT_ANDROID, isTesting: ADMOB_USE_TEST_ADS, ssv: { userId, customData } });
    await AdMob.showRewardVideoAd();
    return await outcome;
  } finally {
    for (const handle of handles) { try { await handle.remove(); } catch { /* sorun değil */ } }
  }
}
