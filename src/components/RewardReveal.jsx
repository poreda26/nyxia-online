import ItemIcon from './ItemIcon';
import ItemTooltip from './ItemTooltip';
import {itemTierColor} from '../data/itemRarity';
import { useTranslation } from '../i18n/LanguageContext';
import './RewardReveal.css';

export default function RewardReveal({item}) {
 const { t } = useTranslation();
 const color=itemTierColor(item.tier);
 return <div className="reward-reveal" style={{'--reward-color':color}}>
  <div className="reward-art" aria-label={t("inventory.rewardArtLabel")}>
   <span className="reward-ring" aria-hidden="true"/>
   <ItemIcon item={item} size={132} color={color}/>
   <span className="reward-plus">+{item.upgradeLevel||0}</span>
  </div>
  <div className="reward-stats"><ItemTooltip item={item}/></div>
 </div>;
}
