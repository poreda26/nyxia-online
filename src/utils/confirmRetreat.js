import { askConfirm } from './gameConfirm';
import { translateWith as translate } from '../i18n/LanguageContext';
// Oyun içi onay penceresi; onaylanırsa true dönen bir söz.
export const confirmRetreat = (lang = 'tr') => askConfirm({
  title: translate(lang, 'battle.retreatTitle'), text: translate(lang, 'battle.retreatText'),
  confirmLabel: translate(lang, 'battle.retreatYes'), cancelLabel: translate(lang, 'battle.retreatStay'), tone: 'danger',
});
