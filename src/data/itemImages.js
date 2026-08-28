import halberdBase from "../assets/items/halberd-base.png";
import halberd7 from "../assets/items/halberd-7.png";
import halberd8 from "../assets/items/halberd-8.png";
import raptor from "../assets/items/raptor.png";
import raptor7 from "../assets/items/raptor-7.png";
import raptor8 from "../assets/items/raptor-8.png";
import glave from "../assets/items/glave.png";
import glave7 from "../assets/items/glave-7.png";
import glave8 from "../assets/items/glave-8.png";
import bladeAxeBase from "../assets/items/blade-axe-base.png";
import bladeAxe7 from "../assets/items/blade-axe-7.png";
import bladeAxe8 from "../assets/items/blade-axe-8.png";
import axeBase from "../assets/items/axe-base.png";
import avedon7 from "../assets/items/avedon-7.png";
import avedon8 from "../assets/items/avedon-8.png";
import gianticAxe7 from "../assets/items/giantic-axe-7.png";
import gianticAxe8 from "../assets/items/giantic-axe-8.png";
import durandalBase from "../assets/items/durandal-base.png";
import durandal7 from "../assets/items/durandal-7.png";
import durandal8 from "../assets/items/durandal-8.png";
import swordBase from "../assets/items/sword-base.png";
import mirage7 from "../assets/items/mirage-7.png";
import mirage8 from "../assets/items/mirage-8.png";
import stormweaver7 from "../assets/items/stormweaver-7.png";
import stormweaver8 from "../assets/items/stormweaver-8.png";
import clubBase from "../assets/items/club-base.png";
import hellBreaker7 from "../assets/items/hell-breaker-7.png";
import hellBreaker8 from "../assets/items/hell-breaker-8.png";
import ironImpact7 from "../assets/items/iron-impact-7.png";
import ironImpact8 from "../assets/items/iron-impact-8.png";
import totamicClub from "../assets/items/totamic-club.svg";
import hammerBase from "../assets/items/hammer-base.png";
import largeHacker7 from "../assets/items/large-hacker-7.png";
import largeHacker8 from "../assets/items/large-hacker-8.png";
import weightHammer7 from "../assets/items/weight-hammer-7.png";
import weightHammer8 from "../assets/items/weight-hammer-8.png";
import bow from "../assets/items/bow.svg";
import bambooBow from "../assets/items/bamboo-bow.svg";
import ironCrossbow from "../assets/items/iron-crossbow.svg";
import scorpionBow from "../assets/items/scorpion-bow.svg";
import ironBow from "../assets/items/iron-bow.svg";
import chitinBow from "../assets/items/chitin-bow.svg";
import enionBow from "../assets/items/enion-bow.svg";
import eaglesEye from "../assets/items/eagles-eye.svg";
import crossbow from "../assets/items/crossbow.svg";
import hornCrossbow from "../assets/items/horn-crossbow.svg";
import helenid from "../assets/items/helenid.svg";
import staffBase from "../assets/items/staff-base.png";
import scorchingStaff7 from "../assets/items/scorching-staff-7.png";
import scorchingStaff8 from "../assets/items/scorching-staff-8.png";
import oasisStaff7 from "../assets/items/oasis-staff-7.png";
import oasisStaff8 from "../assets/items/oasis-staff-8.png";
import chaoticStaff7 from "../assets/items/chaotic-staff-7.png";
import chaoticStaff8 from "../assets/items/chaotic-staff-8.png";
import scytheBase from "../assets/items/scythe-base.png";
import hellBlood7 from "../assets/items/hell-blood-7.png";
import hellBlood8 from "../assets/items/hell-blood-8.png";
import garp7 from "../assets/items/garp-7.png";
import garp8 from "../assets/items/garp-8.png";
import elysium7 from "../assets/items/elysium-7.png";
import elysium8 from "../assets/items/elysium-8.png";
import prismaticTriadStaff from "../assets/items/prismatic-triad-staff.svg";
import ronsStaff from "../assets/items/rons-staff.svg";
import hpPotion1 from "../assets/items/hp-potion-1.png";
import hpPotion2 from "../assets/items/hp-potion-2.png";
import hpPotion3 from "../assets/items/hp-potion-3.png";
import hpPotion4 from "../assets/items/hp-potion-4.png";
import mpPotion1 from "../assets/items/mp-potion-1.png";
import mpPotion2 from "../assets/items/mp-potion-2.png";
import mpPotion3 from "../assets/items/mp-potion-3.png";
import mpPotion4 from "../assets/items/mp-potion-4.png";

// Hand-supplied art, keyed by the item's exact display name (prefix +
// base name). Only exact matches use the image; every other prefix of the
// same weapon still falls back to the procedural line-art icon in
// ItemIcon. Add more entries here as more art comes in.
export const ITEM_IMAGE_BY_NAME = {
  "Totamic Club": totamicClub,
  "Bow": bow,
  "Bamboo Bow": bambooBow,
  "Iron Crossbow": ironCrossbow,
  "Scorpion Bow": scorpionBow,
  "Iron Bow": ironBow,
  "Chitin Bow": chitinBow,
  "Enion Bow": enionBow,
  "Eagle's Eye": eaglesEye,
  "Crossbow": crossbow,
  "Horn Crossbow": hornCrossbow,
  "Helenid": helenid,
  "Prismatic Triad Staff": prismaticTriadStaff,
  "Ron's Staff": ronsStaff,
};

// Kullanıcının Gemini ile ürettiği yüksek kaliteli sanat — seviyeye göre
// görünümü değişen eşyalar (bkz. "Görseller/<Eşya>/+1, +7, +8" klasörleri).
// +1'den +6'ya kadar aynı (daha sakin) görsel, +7/+8'den itibaren element
// parıltısı devreye giriyor — kullanıcının "+7 ve +8'de eşyamız daha farklı
// parlayacak" notu. `maxLevel` artan sırada, ilk eşleşen (upgradeLevel <=
// maxLevel) kazanır.
//
// İki farklı işleme yöntemi kullanılıyor: +1 görselleri (Raptor/Glave/
// staffBase/clubBase) düz koyu bir zemin üzerinde olduğu için o zemin
// temizlenip SEFFAF bir kesim (silah tek başına, arka plansız) yapılıyor.
// +7/+8 görselleri ise (Scorching/Oasis/Chaotic/Hell Breaker/Iron Impact)
// tüm kareyi kaplayan bir alev/yıldırım/parıltı efekti taşıyor — arka planı
// "temizlemeye" çalışmak (Raptor/Glave'deki gibi) bu parıltıyı da silip
// sonucu soluk/görünmez hale getiriyordu (kullanıcı: "effectler glowlar
// hiç belli olmamış"). Bunun yerine +7/+8'ler yuvarlak köşeli, hafif
// tüylenmiş kenarlı bir "kart" olarak bırakılıyor — hiçbir piksel silinmiyor,
// sadece dış çerçeve (beyaz kenar+gri bevel) kırpılıyor. Sonuç: küçük ikon
// boyutunda bile parıltı tüm kareyi doldurduğu için kusursuz okunuyor.
const LEVEL_IMAGE_VARIANTS = {
  // Halberd — kendine özel görsel (aile paylaşımı yok), Zehir element.
  Halberd: [
    { maxLevel: 6, src: halberdBase },
    { maxLevel: 7, src: halberd7 },
    { maxLevel: 10, src: halberd8 },
  ],
  // Blade Axe — kendine özel görsel (aile paylaşımı yok), Buz element.
  "Blade Axe": [
    { maxLevel: 6, src: bladeAxeBase },
    { maxLevel: 7, src: bladeAxe7 },
    { maxLevel: 10, src: bladeAxe8 },
  ],
  Raptor: [
    { maxLevel: 6, src: raptor },
    { maxLevel: 7, src: raptor7 },
    { maxLevel: 10, src: raptor8 },
  ],
  Glave: [
    { maxLevel: 6, src: glave },
    { maxLevel: 7, src: glave7 },
    { maxLevel: 10, src: glave8 },
  ],
  // Scorching/Oasis/Chaotic Staff — kullanıcının notu: "+1 görseli üçünde
  // de aynı" (element parıltısı henüz yok), bu yüzden +1..+6 için TEK bir
  // paylaşımlı dosya (staffBase) üçünde de kullanılıyor, +7/+8'den itibaren
  // her biri kendi element rengiyle ayrışıyor.
  "Scorching Staff": [
    { maxLevel: 6, src: staffBase },
    { maxLevel: 7, src: scorchingStaff7 },
    { maxLevel: 10, src: scorchingStaff8 },
  ],
  "Oasis Staff": [
    { maxLevel: 6, src: staffBase },
    { maxLevel: 7, src: oasisStaff7 },
    { maxLevel: 10, src: oasisStaff8 },
  ],
  "Chaotic Staff": [
    { maxLevel: 6, src: staffBase },
    { maxLevel: 7, src: chaoticStaff7 },
    { maxLevel: 10, src: chaoticStaff8 },
  ],
  // Hell Breaker / Iron Impact — aynı desen: +1 paylaşımlı (clubBase),
  // +7/+8 kendi elementiyle (Alev / Yıldırım) ayrışıyor.
  "Hell Breaker": [
    { maxLevel: 6, src: clubBase },
    { maxLevel: 7, src: hellBreaker7 },
    { maxLevel: 10, src: hellBreaker8 },
  ],
  "Iron Impact": [
    { maxLevel: 6, src: clubBase },
    { maxLevel: 7, src: ironImpact7 },
    { maxLevel: 10, src: ironImpact8 },
  ],
  // Avedon / Giantic Axe — aynı desen: +1 paylaşımlı (axeBase), +7/+8 kendi
  // elementiyle (Buz / Yıldırım) ayrışıyor.
  "Avedon": [
    { maxLevel: 6, src: axeBase },
    { maxLevel: 7, src: avedon7 },
    { maxLevel: 10, src: avedon8 },
  ],
  "Giantic Axe": [
    { maxLevel: 6, src: axeBase },
    { maxLevel: 7, src: gianticAxe7 },
    { maxLevel: 10, src: gianticAxe8 },
  ],
  // Durandal — kendine özel görsel (aile paylaşımı yok), Flame element.
  "Durandal": [
    { maxLevel: 6, src: durandalBase },
    { maxLevel: 7, src: durandal7 },
    { maxLevel: 10, src: durandal8 },
  ],
  // Mirage / Stormweaver — aynı ejder-kabzalı kılıç ailesi (+1 paylaşımlı:
  // swordBase), Mirage Alev, Stormweaver Yıldırım elementiyle ayrışıyor.
  "Mirage": [
    { maxLevel: 6, src: swordBase },
    { maxLevel: 7, src: mirage7 },
    { maxLevel: 10, src: mirage8 },
  ],
  "Stormweaver": [
    { maxLevel: 6, src: swordBase },
    { maxLevel: 7, src: stormweaver7 },
    { maxLevel: 10, src: stormweaver8 },
  ],
  // Hell Blood / Garp / Elysium — aynı kemik-tırpan ailesi (+1 paylaşımlı:
  // scytheBase), sırasıyla Alev / Buz / Yıldırım elementiyle ayrışıyor.
  "Hell Blood": [
    { maxLevel: 6, src: scytheBase },
    { maxLevel: 7, src: hellBlood7 },
    { maxLevel: 10, src: hellBlood8 },
  ],
  "Garp": [
    { maxLevel: 6, src: scytheBase },
    { maxLevel: 7, src: garp7 },
    { maxLevel: 10, src: garp8 },
  ],
  "Elysium": [
    { maxLevel: 6, src: scytheBase },
    { maxLevel: 7, src: elysium7 },
    { maxLevel: 10, src: elysium8 },
  ],
  // Large Hacker / Weight Hammer — aynı balyoz ailesi (+1 paylaşımlı:
  // hammerBase), ikisi de Yıldırım elementiyle ama ayrışan renk varyantıyla
  // (Large Hacker mavi-camgöbeği, Weight Hammer mor) ayrışıyor.
  "Large Hacker": [
    { maxLevel: 6, src: hammerBase },
    { maxLevel: 7, src: largeHacker7 },
    { maxLevel: 10, src: largeHacker8 },
  ],
  "Weight Hammer": [
    { maxLevel: 6, src: hammerBase },
    { maxLevel: 7, src: weightHammer7 },
    { maxLevel: 10, src: weightHammer8 },
  ],
};

export function itemImageFor(name, upgradeLevel = 0) {
  const variants = LEVEL_IMAGE_VARIANTS[name];
  if (variants) {
    const match = variants.find((v) => upgradeLevel <= v.maxLevel);
    return (match || variants[variants.length - 1]).src;
  }
  return ITEM_IMAGE_BY_NAME[name] || null;
}

// Kullanıcının hazırladığı yeni pot görselleri — kademeye göre değişiyor
// (bkz. data/potions.js#HP_POTION_TIERS/MP_POTION_TIERS, ikisi de artık 4
// kademe). ItemIcon bu haritayı FlaskConical placeholder'ının yerine
// kullanıyor.
const POTION_IMAGES = {
  hp: [hpPotion1, hpPotion2, hpPotion3, hpPotion4],
  mp: [mpPotion1, mpPotion2, mpPotion3, mpPotion4],
};

export function potionImageFor(potionType, tier) {
  return POTION_IMAGES[potionType]?.[tier - 1] || null;
}
