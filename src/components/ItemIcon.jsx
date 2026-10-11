import {weaponVisualItem} from '../data/firstPurchaseWeapons';
import JewelArt from './icons/JewelArt';
import ScrollArt from './icons/ScrollArt';
import PremiumVoucherArt from './icons/PremiumVoucherArt';
import RewardChest from './icons/RewardChest';
import WingArt from './WingArt';
import { FlaskConical } from "./icons/GameIcons";
import MaterialArt from './icons/MaterialArt';
import WeaponIcon from "./icons/WeaponIcon";
import ArmorIcon from "./icons/ArmorIcon";
import AccessoryIcon from "./icons/AccessoryIcon";
import { itemImageFor, potionImageFor } from "../data/itemImages";
import { armorIconImage } from "../data/armorIconImages";
import StarterWeaponIcon from './StarterWeaponIcon';
import { useTranslation } from '../i18n/LanguageContext';
import { displayItemName } from '../utils/player';
import {weaponIconArt} from '../data/starterWeaponArt';

export default function ItemIcon({ item, size = 16, color = "currentColor", strokeWidth = 1.6 }) {
  const { lang } = useTranslation();
  const label = item?.kind === 'chest' ? (lang === 'en' ? (item.special ? 'Special chest' : `T${item.tier} chest`) : (item.special ? 'Özel sandık' : `T${item.tier} sandık`)) : (item?.name ? displayItemName(item, lang) : undefined);
  item=weaponVisualItem(item);
  if(item.kind==='accessory')return <JewelArt item={item} size={size} label={label}/>;
  if(['scroll','bonusScroll','boostScroll','accessoryScroll','raceScroll','jobScroll'].includes(item.kind))return <ScrollArt item={item} size={size} label={label}/>;
  if(item.kind==='premiumVoucher')return <PremiumVoucherArt item={item} size={size} label={label}/>;
  if(item.kind==='chest')return <RewardChest size={size} tier={item.tier} special={item.special} label={label}/>;
  if(item.kind==='wings')return <WingArt wingId={item.wingId} size={size} label={label}/>;
  if(item.kind==='weapon' && weaponIconArt(item.name))return <StarterWeaponIcon item={item} size={size} label={label}/>;
  const customImage = item.kind === "potion" ? potionImageFor(item.potionType, item.tier) : itemImageFor(item.name, item.upgradeLevel);
  if (customImage) {
    if(item.kind==='weapon')return <StarterWeaponIcon item={item} size={size} source={customImage} label={label}/>;
    // Elle çizilmiş 16x16 SVG'lerin aksine (bkz. src/assets/items/*.svg),
    // Gemini ile üretilen yüksek çözünürlüklü sanat (bkz. Raptor) küçük
    // ikon boyutuna PÜRÜZSÜZ ölçeklenmeli — "pixelated" burada bloklu/
    // çirkin bir sonuç verir, sadece gerçekten kaba pixel-art dosyalar
    // (.svg) için anlamlı.
    const isRasterArt = typeof customImage === "string" && !customImage.endsWith(".svg");
    return (
      <img
        src={customImage}
        alt={label||item.name}
        style={{ width: size, height: size, objectFit: "contain", imageRendering: isRasterArt ? "auto" : "pixelated" }}
      />
    );
  }
  if (item.kind === "weapon") {
    return <WeaponIcon iconKey={item.icon} size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (item.kind === "armor") {
    const armorImage = armorIconImage(item.class, item.slot, item.tier);
    if (armorImage) {
      return <img src={armorImage} alt={label||item.name} style={{ width: size, height: size, objectFit: "contain" }} />;
    }
    return <ArmorIcon slot={item.slot} cls={item.class} size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (item.kind === "accessory") {
    return <AccessoryIcon slot={item.slot} size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (item.kind === "potion") {
    return <FlaskConical size={size} color={item.potionType === "hp" ? "#C9425A" : "#4FC3D9"} strokeWidth={strokeWidth} />;
  }
  if (item.kind === "clanMaterial") {
    return <MaterialArt item={item} size={size} label={label}/>;
  }
  return null;
}
