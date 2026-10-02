// Günlük Çark. Ödül ve oranlar sunucuda; istemci yalnızca sonucu uygular.
import { call } from "../utils/api";

export const fetchWheel = () => call("wheel", "GET");
export const spinWheel = () => call("wheel/spin", "POST");
export const claimWheel = () => call("wheel/claim", "POST");
