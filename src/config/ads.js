// Google AdMob ödüllü reklam birimi. Aşağıdaki değer Google'ın herkese açık TEST reklam birimidir;
// yayın öncesi AdMob panelindeki gerçek "Ödüllü" reklam birimi kimliğiyle değiştirilir
// (ve AndroidManifest.xml içindeki APPLICATION_ID de gerçek uygulama kimliğiyle).
export const ADMOB_REWARDED_UNIT_ANDROID = "ca-app-pub-3940256099942544/5224354917";
export const ADMOB_USE_TEST_ADS = ADMOB_REWARDED_UNIT_ANDROID.startsWith("ca-app-pub-3940256099942544");
