import {monsterPortraitFor} from '../data/monsterPortraits';
import './MonsterCards.css';
export default function MonsterPortrait({monster,label=''}){
 const art=monsterPortraitFor(monster);
 if(!art)return null;
 return <svg className="monster-portrait" viewBox={art.face.join(' ')} role="img" aria-label={label||monster.name} data-monster-portrait={monster.visualSourceId||monster.id}>
  <image href={art.source} width={art.size[0]} height={art.size[1]}/>
 </svg>;
}
