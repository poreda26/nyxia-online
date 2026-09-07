// Takıların kendi yükseltme mantığı — silah/zırhın forge+parşömen sistemiyle
// hiçbir ilgisi yok (bkz. utils/upgrade.js). Kullanıcı isteği: "3 adet Aynı
// takıdan ve Aynı +'dan olması şartıyla %100 oranda bir sonraki seviyeye
// geçecek" — 3 aynı takı + 1 Aksesuar Yükseltme Kağıdı (bkz.
// utils/inventory.js#makeAccessoryScrollStack) tüketilip TEK bir takı,
// bir sonraki seviyenin gerçek verisiyle (bkz. data/accessories.js#levels)
// üretiliyor. Silah/zırhın aksine başarısızlık ihtimali yok.
import { applyLevelData } from "./upgrade";
import { uid } from "./random";

// Kullanıcı: "ama +4 ve +5 yükseltmeler daha sonrasında açılacak." — bu
// sabiti değiştirmek yeterli, başka hiçbir yer dokunulmaz.
export const ACCESSORY_UPGRADE_MAX_LEVEL = 3;

// Çantadaki takıları isim+seviyeye göre gruplar, en az 3 tane olanları
// döner — Takı Yükseltme sekmesinin listelediği şey bu.
export function upgradableAccessoryGroups(player) {
  const groups = new Map();
  for (const it of player.inventory) {
    if (it.kind !== "accessory") continue;
    const key = `${it.name}:::${it.upgradeLevel || 0}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(it);
  }
  return [...groups.values()]
    .filter((items) => items.length >= 3)
    .map((items) => ({ sample: items[0], count: items.length }));
}

export function canUpgradeAccessory(player, sample) {
  const level = sample.upgradeLevel || 0;
  if (level >= ACCESSORY_UPGRADE_MAX_LEVEL) {
    return { ok: false, reason: `+${ACCESSORY_UPGRADE_MAX_LEVEL}'ten sonrası henüz açılmadı.` };
  }
  const matching = player.inventory.filter(
    (it) => it.kind === "accessory" && it.name === sample.name && (it.upgradeLevel || 0) === level
  );
  if (matching.length < 3) return { ok: false, reason: "Aynı takıdan ve aynı +'dan en az 3 tane gerekiyor." };
  if (!player.inventory.some((it) => it.kind === "accessoryScroll" && it.count > 0)) {
    return { ok: false, reason: "Aksesuar Yükseltme Kağıdın yok." };
  }
  return { ok: true };
}

// 3 takı + 1 kağıt tüketip %100 oranda bir sonraki seviyede TEK bir takı
// üretir. `sampleId` gruptaki HERHANGİ bir öğenin id'si olabilir — hangi 3
// tanesinin tüketildiği önemli değil, hepsi zaten aynı isim+seviye.
export function upgradeAccessory(player, sampleId) {
  const sample = player.inventory.find((it) => it.id === sampleId);
  if (!sample) return { player, upgraded: false, reason: "Eşya bulunamadı." };
  const check = canUpgradeAccessory(player, sample);
  if (!check.ok) return { player, upgraded: false, reason: check.reason };

  const level = sample.upgradeLevel || 0;
  const matching = player.inventory.filter(
    (it) => it.kind === "accessory" && it.name === sample.name && (it.upgradeLevel || 0) === level
  );
  const consumeIds = new Set(matching.slice(0, 3).map((it) => it.id));
  const scroll = player.inventory.find((it) => it.kind === "accessoryScroll" && it.count > 0);

  let inventory = player.inventory.filter((it) => !consumeIds.has(it.id));
  inventory = inventory
    .map((it) => (it.id === scroll.id ? { ...it, count: it.count - 1 } : it))
    .filter((it) => !(it.id === scroll.id && it.count <= 0));

  const upgraded = { ...applyLevelData(sample, level + 1), id: uid() };
  inventory.push(upgraded);

  return { player: { ...player, inventory }, upgraded: true, item: upgraded };
}
