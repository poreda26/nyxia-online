// Giriş seçenekleri: Google/Apple ile giriş, e-posta doğrulama ve şifre sıfırlama (sunucu: server/identity.mjs).
import { call } from "../utils/api";

export const fetchAuthProviders = () => call("auth/providers", "GET");
export const loginSocial = (provider, idToken, force = false, birthDate = null, termsAccepted = false) => call("login/social", "POST", { provider, idToken, ...(force ? { force: true } : {}), ...(birthDate ? { birthDate } : {}), ...(termsAccepted ? { termsAccepted: true } : {}) });
export const forgotPassword = (email) => call("password/forgot", "POST", { email });
export const resetPassword = (email, code, password) => call("password/reset", "POST", { email, code, password });
export const fetchSecurity = () => call("account/security", "GET");
export const linkIdentity = (provider, idToken) => call("account/identity", "POST", { provider, idToken });
export const startEmail = (email) => call("account/email", "POST", { email });
export const verifyEmail = (email, code) => call("account/email/verify", "POST", { email, code });
export const startEmailRegister = (email, birthDate) => call("register/email/start", "POST", { email, birthDate });
export const confirmEmailRegister = (email, code, password, marketing = false, birthDate, termsAccepted = false) => call("register/email/confirm", "POST", { email, code, password, marketing, birthDate, termsAccepted });
export const setMarketingOptIn = (optin) => call("account/marketing", "POST", { optin });
