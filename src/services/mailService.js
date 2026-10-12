// Posta kutusu (yönetici hediyeleri) ve herkese açık durum (duyuru + bakım). Sunucu: server/ops.mjs.
import { call } from "../utils/api";

export const fetchMail = () => call("mail", "GET");
export const markMailRead = (id) => call("mail/read", "POST", { id });
export const fetchStatus = () => call("status", "GET");
