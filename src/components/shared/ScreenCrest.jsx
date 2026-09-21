import {useTranslation} from '../../i18n/LanguageContext';
import MenuEmblem from '../icons/MenuEmblem';
import '../PanelDesign.css';
export default function ScreenCrest({screen}){
 const {t}=useTranslation();
 return <header className="screen-crest"><span className="screen-crest-art"><MenuEmblem name={screen} size={43}/></span><h1>{t(`nav.${screen}`)}</h1><span className="crest-rule" aria-hidden="true">◆</span></header>;
}
