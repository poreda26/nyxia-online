import { CLASSES } from "../data/classes";
import { rollArmor, rollWeapon, rollAccessory, maxWeaponTier } from "./loot";
import { addItemToInventory, makeScrollStack, makePotionStack, makeBonusScrollStack } from "./inventory";
import { potionTiersFor } from "../data/potions";
import { buyPremium } from "./premium";
import { PREMIUM_TIERS } from "../data/premium";
import { classSkills, isKnown, learnFreeSkills } from "./skills";
import { claimAwakening } from "./quests";
import { AWAKENING_QUEST } from "../data/quests";
import { MAX_LEVEL, xpToNext, playerMaxHp, playerMaxMp } from "./player";
import { uid } from "./random";

// Only messages starting with "/" are candidate GM codes — everything else
// is a normal chat line. Returns null for plain text.
export function parseGmCommand(raw) {
  const text = raw.trim();
  if (!text.startsWith("/")) return null;
  const [cmd, ...args] = text.slice(1).split(/\s+/);
  if (!cmd) return null;
  return { cmd: cmd.toLowerCase(), args };
}

function clampTier(value, max = 5) {
  const t = parseInt(value, 10);
  if (!Number.isFinite(t)) return 1;
  return Math.min(max, Math.max(1, t));
}

function grant(player, item, bank) {
  // Katalog eşya-eşya yeniden dolduruluyor — /zırh, /silah, /aksesuar gibi
  // komutlar boş bir havuza denk gelirse roll* fonksiyonları null döner.
  if (!item) return { player, bank, resultText: "Bu kombinasyon için henüz eşya yok." };
  const result = addItemToInventory(player, item);
  return {
    player: result.player,
    bank,
    resultText: result.added ? `${item.name} verildi.` : `${item.name} verilemedi — ${result.reason}`,
  };
}

const HELP_TEXT = "Komutlar: /altın [miktar], /elmas [miktar], /zırh [tier] [sınıf], /silah [tier], "
  + "/aksesuar [tier], /parşömen [tier], /bonus [adet], /premium [mythic|apex], /iksir [hp|mp] [adet] [tier], /sandık [tier|özel], "
  + "/skill [id], /uyan, /seviye [1-65], /np [miktar], /expevent [saat] [yüzde], /yardım";

// Executes a recognized GM command against the current player and returns
// the next player state plus a human-readable result to post back into
// chat. Caller (ChatTab) is responsible for checking player.isGM first —
// this function assumes the caller already has authority. `bank` is the
// account's shared depot — only the /premium case touches it, but every
// branch passes it straight through so the return shape stays uniform.
export function executeGmCommand(player, cmd, args, bank) {
  switch (cmd) {
    case "altin":
    case "altın": {
      const amount = Math.max(1, parseInt(args[0], 10) || 100);
      return { player: { ...player, gold: player.gold + amount }, bank, resultText: `+${amount} altın verildi.` };
    }
    case "elmas": {
      const amount = Math.max(1, parseInt(args[0], 10) || 100);
      return { player: { ...player, diamonds: player.diamonds + amount }, bank, resultText: `+${amount} elmas verildi.` };
    }
    case "zirh":
    case "zırh": {
      const tier = clampTier(args[0]);
      const forceClass = args[1] && CLASSES[args[1].toLowerCase()] ? args[1].toLowerCase() : undefined;
      return grant(player, rollArmor(tier, forceClass), bank);
    }
    case "silah": {
      const tier = clampTier(args[0], maxWeaponTier(player.class));
      return grant(player, rollWeapon(tier, player.class), bank);
    }
    case "aksesuar": {
      const tier = clampTier(args[0]);
      return grant(player, rollAccessory(tier), bank);
    }
    case "parsomen":
    case "parşömen": {
      const tier = clampTier(args[0]);
      return grant(player, makeScrollStack(tier, 1), bank);
    }
    case "bonus": {
      // Artık üst üste yığılmıyor (bkz. utils/inventory.js#makeBonusScrollStack)
      // — her biri kendi çanta kutusunu tuttuğu için `count` kadar AYRI
      // eşya veriliyor, tek bir stack yerine.
      const count = Math.max(1, parseInt(args[0], 10) || 1);
      let cur = player;
      let lastText = "";
      for (let i = 0; i < count; i++) {
        const result = grant(cur, makeBonusScrollStack(), bank);
        cur = result.player;
        lastText = result.resultText;
      }
      return { player: cur, bank, resultText: count > 1 ? `Bonus Parşömen x${count} verildi.` : lastText };
    }
    case "premium": {
      const tierId = (args[0] || "").toLowerCase();
      if (!PREMIUM_TIERS[tierId]) return { player, bank, resultText: `Geçersiz paket. /premium mythic ya da /premium apex.` };
      const result = buyPremium({ ...player, diamonds: 999999 }, tierId, bank);
      if (!result.bought) return { player, bank, resultText: result.reason };
      return { player: { ...result.player, diamonds: player.diamonds }, bank: result.bank, resultText: `${PREMIUM_TIERS[tierId].name} GM tarafından verildi.` };
    }
    case "iksir": {
      const type = (args[0] || "hp").toLowerCase() === "mp" ? "mp" : "hp";
      const count = Math.max(1, parseInt(args[1], 10) || 1);
      const tier = clampTier(args[2], potionTiersFor(type).length);
      return grant(player, makePotionStack(type, tier, count), bank);
    }
    case "sandik":
    case "sandık": {
      const arg = (args[0] || "").toLowerCase();
      if (arg === "ozel" || arg === "özel") {
        return {
          player: { ...player, chests: [...player.chests, { id: uid(), tier: 5, special: true }] },
          bank,
          resultText: "Özel Etkinlik Sandığı verildi.",
        };
      }
      const tier = clampTier(args[0]);
      return { player: { ...player, chests: [...player.chests, { id: uid(), tier }] }, bank, resultText: `T${tier} Sandık verildi.` };
    }
    case "skill": {
      const skillId = (args[0] || "").toLowerCase();
      const skill = classSkills(player.class).find((s) => s.id === skillId);
      if (!skill) return { player, bank, resultText: `Geçersiz beceri id. Bu sınıfın id'leri: ${classSkills(player.class).map((s) => s.id).join(", ")}` };
      if (isKnown(player, skillId)) return { player, bank, resultText: "Zaten öğrenilmiş." };
      return {
        player: { ...player, skills: { ...player.skills, known: [...player.skills.known, skillId] } },
        bank,
        resultText: `${skill.name} GM tarafından öğretildi.`,
      };
    }
    case "uyan": {
      // claimAwakening'i geçici olarak seviye/monsterKills'i şişirilmiş bir
      // kopya üzerinde çalıştırıyoruz (gerçek görev ilerlemesini etkilemeden
      // sınavı "geçmiş" saydırmak için) — bu yüzden sonucu gerçek player'a
      // sadece `awakened` alanını taşıyarak uyguluyoruz, level VE
      // monsterKills'i her ikisini de orijinaline geri döndürüyoruz. Daha
      // önce sadece level geri alınıyordu, monsterKills'teki 999'luk sahte
      // değerler kalıcı olarak player'a sızıp kaos_iblisi/kiyamet_ejderha
      // Kaptan görevlerini de gerçekte tamamlanmamışken "bitti" gösteriyordu.
      const maxedKills = Object.fromEntries(Object.keys(AWAKENING_QUEST.targets).map((id) => [id, 999]));
      const result = claimAwakening({ ...player, level: Math.max(player.level, AWAKENING_QUEST.requiredLevel), monsterKills: { ...player.monsterKills, ...maxedKills } });
      if (!result.claimed) return { player, bank, resultText: result.reason };
      return { player: { ...player, awakened: result.player.awakened }, bank, resultText: "2. Uyanış GM tarafından verildi." };
    }
    case "seviye": {
      const target = Math.min(MAX_LEVEL, Math.max(1, parseInt(args[0], 10) || 1));
      // Normal levellemede her seviye 3 statü puanı verir (bkz.
      // BattleTab.jsx#applyLoot'taki level-up döngüsü) — GM ile seviye
      // atlarken de atlanan her seviye için aynısı verilmezse Karakter
      // bölümünde dağıtılacak puan hiç artmıyordu.
      const levelsGained = Math.max(0, target - player.level);
      let next = learnFreeSkills({ ...player, level: target, xp: 0, statPoints: player.statPoints + levelsGained * 3 });
      next.hp = playerMaxHp(next);
      next.mp = playerMaxMp(next);
      return { player: next, bank, resultText: `Seviye ${target} olarak ayarlandı. (+${levelsGained * 3} statü puanı, sonraki seviyeye ${xpToNext(target)} XP gerekiyor.)` };
    }
    case "expevent": {
      // Kullanıcı isteği: "1 saatliğine %100 exp bonus açma yetkisi olsun" —
      // varsayılan tam da bu (1 saat, %100 = 2x çarpan), ama GM isterse
      // saat/yüzdeyi de değiştirebilir.
      const hours = Math.max(0.1, parseFloat(args[0]) || 1);
      const pct = Math.max(1, parseFloat(args[1]) || 100);
      const mult = 1 + pct / 100;
      const expiresAt = Date.now() + hours * 60 * 60 * 1000;
      return {
        player: { ...player, eventExpBonus: { mult, expiresAt } },
        bank,
        resultText: `%${pct} EXP bonusu ${hours} saatliğine açıldı.`,
      };
    }
    case "np": {
      const amount = Math.max(1, parseInt(args[0], 10) || 50);
      return {
        player: { ...player, nationalPoint: player.nationalPoint + amount, weeklyPoint: player.weeklyPoint + amount },
        bank,
        resultText: `+${amount} National Point (ve Weekly Point) verildi.`,
      };
    }
    case "yardim":
    case "yardım":
      return { player, bank, resultText: HELP_TEXT };
    default:
      return { player, bank, resultText: `Bilinmeyen komut: /${cmd}. /yardım yaz.` };
  }
}
