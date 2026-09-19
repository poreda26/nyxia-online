import { playerMaxHp, playerMaxMp } from '../utils/player';
import CharacterFigure from './CharacterFigure';
import './BattleScene.css';
import './DuelScene.css';
import { useTranslation } from '../i18n/LanguageContext';

// Kullanıcı isteği: "Dülleo'da da zaten oyunu online yapacağımız için
// karşılıklı olarak görüntüler gelecek, bunu da hazırla." — BattleScene.jsx
// ile aynı görsel dil (aynı CSS sınıfları: battle-scene/battle-hud/
// battle-unit/incoming-number/outgoing-number) ama canavar sprite'ı yerine
// İKİ CharacterFigure (oyuncunun kendi karakter modeli) karşı karşıya.
// Hayaletlerin (bkz. utils/warzoneCombat.js#spawnGhost) hiç ekipmanı yok —
// CharacterFigure bunu zaten zarifçe "temel/zırhsız" görünüme düşürüyor
// (bkz. characterAppearance.js/armorRig.js'in equipped?. optional
// chaining'i), o yüzden çökme riski yok, sadece çıplak bir figür görünür.
// ghost.cls -> player.class eşlemesi gerekiyor çünkü Warzone'un kendi
// hayalet nesnesi alan adını "cls" olarak tutuyor (bkz. spawnGhost).
//
// Beceri/potun olmadığı için (artık düellolar tamamen otomatik, bkz.
// WarzoneTab.jsx#runDuelTurn) burada "is-support"/"is-ranged" gibi BattleScene
// sınıflarını hiç kullanmıyoruz — sadece düz vuruş sallanması. Yön-bağımlı
// battle-strike/battle-return animasyonlarını da bilerek kullanmıyoruz;
// hayalet tarafı CSS'te aynalandığı (bkz. DuelScene.css#duel-ghost) için o
// animasyonların yönü tersine dönerdi. Onun yerine iki tarafta da aynı,
// yöne duyarsız GlobalStyle.jsx#.shake sarsıntısı kullanılıyor.
export default function DuelScene({ player, ghost, duel, visual, shake }) {
  const { t } = useTranslation();
  const maxHp = playerMaxHp(player);
  const maxMp = playerMaxMp(player);
  const active = visual.id > 0;
  const finished = !!duel.finished;
  const ghostDead = duel.ghostHp <= 0;
  const incoming = active && !ghostDead ? visual.incoming : null;
  const outgoing = active ? visual.outgoing : null;
  return (
    <section className="battle-scene duel-scene" aria-label={t('battle.sceneTitle')}>
      <div className="battle-scene-title">{t('warzone.title')}<span>{t('warzone.tabArea')}</span></div>
      <div className="battle-hud">
        <div><strong>{player.nickname || t('battle.you')}</strong><meter aria-label={t('battle.yourHp')} min="0" max={maxHp} value={player.hp} /><small>{player.hp} / {maxHp}</small><meter className="mana" aria-label={t('battle.yourMp')} min="0" max={maxMp} value={player.mp} /><small>MP {player.mp} / {maxMp}</small></div>
        <div><strong>{ghost.name}</strong><meter aria-label={t('battle.enemyHp')} min="0" max={ghost.maxHp} value={Math.max(0, duel.ghostHp)} /><small>{Math.max(0, duel.ghostHp)} / {ghost.maxHp}</small></div>
      </div>
      <div key={visual.id} className={`battle-cast ${active ? 'is-active' : ''} ${incoming ? 'has-counter' : ''} ${incoming?.hit ? 'incoming-hit' : ''} ${ghostDead ? 'is-victory' : ''}`}>
        <div className={`battle-unit battle-hero ${shake === 'player' ? 'shake' : ''}`}><div className="battle-motion"><CharacterFigure player={player} /></div><span className="battle-unit-name">{player.nickname || t('battle.you')}</span></div>
        <div className={`battle-unit battle-enemy duel-ghost ${shake === 'ghost' ? 'shake' : ''}`}><div className="battle-motion"><CharacterFigure player={{ ...ghost, class: ghost.cls }} /></div><span className="battle-unit-name">{ghost.name}</span></div>
        {incoming && <span className={`incoming-number ${incoming.hit ? '' : 'incoming-miss'}`}>{incoming.hit ? `−${incoming.damage}` : t('battle.missIncoming')}</span>}
        {outgoing && <span className={`outgoing-number ${outgoing.hit ? (outgoing.crit ? 'outgoing-crit' : '') : 'outgoing-miss'}`}>{outgoing.hit ? `−${outgoing.damage}` : t('battle.missOutgoing')}</span>}
      </div>
      <div className="battle-scene-caption">{finished ? (ghostDead ? t('battle.enemyDefeated') : '') : t('warzone.autoBattling')}</div>
    </section>
  );
}
