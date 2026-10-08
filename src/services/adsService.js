// Ödüllü reklam ("Reklam izle, elmas kazan"). Ödül miktarı, bekleme süresi ve ödemenin kendisi sunucuda — bkz. server/ads.mjs.
import { call } from "../utils/api";

export const fetchAds = () => call("ads", "GET");
export const startAd = () => call("ads/start", "POST");
export const claimAd = (ticket) => call("ads/claim", "POST", { ticket });
