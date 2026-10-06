import {useEffect} from 'react';
import {confirmRetreat} from './confirmRetreat';
// Navigation away unmounts the fight, so it must follow the same retreat rule.
export function useRetreatGuard(active,lang){
 useEffect(()=>{if(!active)return;
 const leave=e=>{if(!e.defaultPrevented&&!confirmRetreat(lang))e.preventDefault();};
 const unload=e=>{e.preventDefault();e.returnValue='';};
 window.addEventListener('nyxia:leave-battle',leave);window.addEventListener('beforeunload',unload);
 return()=>{window.removeEventListener('nyxia:leave-battle',leave);window.removeEventListener('beforeunload',unload);};
 },[active,lang]);
}
