import { Capacitor } from "@capacitor/core";

// Google/Apple penceresini açıp kimlik belgesini (idToken) döner. Belge sunucuda doğrulanır; burada hiçbir güven yok.
// Yalnızca mağaza uygulamasında (Capacitor) çalışır. Kullanıcı vazgeçerse { cancelled: true } döner.
export const socialSignInAvailable = () => Capacitor.isNativePlatform();

export async function socialIdToken(provider, config) {
  if (!Capacitor.isNativePlatform()) throw Object.assign(new Error("SOCIAL_UNSUPPORTED"), { code: "SOCIAL_UNSUPPORTED" });
  const { SocialLogin } = await import("@capgo/capacitor-social-login");
  try {
    if (provider === "google") {
      await SocialLogin.initialize({ google: { webClientId: config.clientId } });
      const { result } = await SocialLogin.login({ provider: "google", options: { scopes: ["email", "profile"] } });
      if (!result.idToken) throw new Error("NO_ID_TOKEN");
      return { idToken: result.idToken };
    }
    if (provider === "apple") {
      await SocialLogin.initialize({ apple: {} });
      const { result } = await SocialLogin.login({ provider: "apple", options: { scopes: ["email", "name"] } });
      if (!result.idToken) throw new Error("NO_ID_TOKEN");
      return { idToken: result.idToken };
    }
  } catch (error) {
    if (error?.code === "USER_CANCELLED") return { cancelled: true };
    throw error;
  }
  throw new Error("UNKNOWN_PROVIDER");
}
