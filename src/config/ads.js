// Google AdMob ödüllü reklam birimi (Nyxia Online, Android). Kimlikler herkese açıktır, gizli değildir.
// Test reklamı varsayılandır: yayın (mağaza) sürümü `VITE_ADMOB_RELEASE=1` ile derlenir ve gerçek reklam gösterir.
// Böylece geliştirme/deneme APK'larında kendi reklamına basıp hesabı riske atmazsın.
export const ADMOB_REWARDED_UNIT_ANDROID = "ca-app-pub-8478423224976347/8771500281";
export const ADMOB_USE_TEST_ADS = import.meta.env.VITE_ADMOB_RELEASE !== "1";
