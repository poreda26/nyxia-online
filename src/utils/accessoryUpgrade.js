// Takıların kendi yükseltme mantığı — silah/zırhın forge+parşömen sistemiyle
// hiçbir ilgisi yok (bkz. utils/upgrade.js). Kullanıcı isteği: "3 adet Aynı
// takıdan ve Aynı +'dan olması şartıyla %100 oranda bir sonraki seviyeye
// geçecek" — 3 aynı takı + 1 Aksesuar Yükseltme Kağıdı (bkz.
// utils/inventory.js#makeAccessoryScrollStack) tüketilip TEK bir takı,
// bir sonraki seviyenin gerçek verisiyle (bkz. data/accessories.js#levels)
// üretiliyor. Silah/zırhın aksine başarısızlık ihtimali yok.
//
// UI artık Silah/Zırh forge'u ile aynı etkileşim modelini kullanıyor
// (kullanıcı isteği: "Takı Yükseltme sekmesi Silah/zırh sekmesi gibi
// olacak") — takılar isim/seviyeye göre otomatik gruplanıp tek bir butona
// basmak yerine, forge'daki gibi 3 ayrı kutucuğa TEK TEK dokunularak
// çantadan çekiliyor. Bu yüzden aşağıdaki fonksiyonlar artık envanteri
// isim/seviyeyle yeniden taramıyor — bileşen (AccessoryUpgradeTab) hangi 3
// öğenin ve hangi parşömenin çantadan çekilip kutuya konduğunu zaten bildiği
// için doğrudan o öğeleri alıyor.
import { applyLevelData } from "./upgrade";
import { uid } from "./random";

// Kullanıcı: "ama +4 ve +5 yükseltmeler daha sonrasında açılacak." — bu
// sabiti değiştirmek yeterli, başka hiçbir yer dokunulmaz.
export const ACCESSORY_UPGRADE_MAX_LEVEL = 3;

// Bir takının forge'a (kutucuklara) hiç konulup konulamayacağını kontrol
// eder — kilitli mi, zaten maksimum seviyede mi.
export function accessoryUpgradeBlocked(sample) {
  if (sample.upgradeLocked) return { ok: false, reason: "accessoryUpgradeLocked" };
  if ((sample.upgradeLevel || 0) >= ACCESSORY_UPGRADE_MAX_LEVEL) {
    return { ok: false, reason: "accessoryMaxLevelLocked", reasonVars: { max: ACCESSORY_UPGRADE_MAX_LEVEL } };
  }
  return { ok: true };
}

// 3 kutucuktaki (zaten aynı isim+seviyeden olduğu doğrulanmış) takılardan
// birinin örneğini alıp %100 oranda bir sonraki seviyede TEK bir takı
// üretir — üçü de aynı olduğundan hangisinin "örnek" alındığı önemsiz.
export function buildUpgradedAccessory(sample) {
  const level = sample.upgradeLevel || 0;
  return { ...applyLevelData(sample, level + 1), id: uid() };
}
