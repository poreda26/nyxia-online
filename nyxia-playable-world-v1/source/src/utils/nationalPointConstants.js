// Bağımsız sabitler — bağımlılığı olmayan bir dosyada duruyorlar ki hem
// utils/player.js (başlangıç değeri) hem utils/nationalPoint.js (kazanım/
// kayıp/satın alma mantığı) bunlara ihtiyaç duyabilsin, döngüsel import
// olmadan (nationalPoint.js zaten utils/premium.js üzerinden player.js'e
// bağımlı — bkz. utils/week.js'teki aynı gerekçe).
export const STARTING_NATIONAL_POINT = 500;
export const NP_LOSS_PENALTY = 50;
export const NP_RECOVERY_GOLD_COST = 1500;
export const NP_RECOVERY_NP_AMOUNT = 250;
