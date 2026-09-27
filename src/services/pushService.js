// Push bildirimi — sunucuyla konuşan ince katman (bkz. server/app.mjs'in
// push bölümü). Tarayıcı API'lerine (Notification/ServiceWorker/PushManager)
// dokunan gerçek abonelik akışı burada değil, utils/pushNotifications.js'te.
import { call } from "../utils/api";

export const fetchVapidKey = () => call("push/vapid-key", "GET");
export const subscribeToPush = (subscription) => call("push/subscribe", "POST", subscription);
export const unsubscribeFromPush = (endpoint) => call("push/unsubscribe", "POST", { endpoint });
export const fetchPushPrefs = () => call("push/prefs", "GET");
export const updatePushPrefs = (prefs) => call("push/prefs", "PUT", prefs);
