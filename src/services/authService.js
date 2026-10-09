// Giriş seçenekleri: Google/Apple ile giriş, e-posta doğrulama ve şifre sıfırlama (sunucu: server/identity.mjs).
import { call } from "../utils/api";

export const fetchAuthProviders = () => call("auth/providers", "GET");
export const loginSocial = (provider, idToken, force = false) => call("login/social", "POST", { provider, idToken, ...(force ? { force: true } : {}) });
export const forgotPassword = (email) => call("password/forgot", "POST", { email });
export const resetPassword = (email, code, password) => call("password/reset", "POST", { email, code, password });
export const fetchSecurity = () => call("account/security", "GET");
export const linkIdentity = (provider, idToken) => call("account/identity", "POST", { provider, idToken });
export const startEmail = (email) => call("account/email", "POST", { email });
export const verifyEmail = (email, code) => call("account/email/verify", "POST", { email, code });
