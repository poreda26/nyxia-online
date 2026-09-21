import {useId} from 'react';

// Small, individually drawn game emblems; filled silhouettes stay legible
// on mobile instead of relying on thin generic outline icons.
export default function MenuEmblem({name,size=40}){
 const id=useId();
 const gold=`url(#${id}-gold)`,steel=`url(#${id}-steel)`;
 const art={
  dungeon:<><path d="M7 54V16L15 10L23 16V24H40V16L48 10L56 16V54Z" fill={steel} stroke={gold} strokeWidth="2"/><path d="M22 54V37Q31 23 41 37V54" fill="#211c3a" stroke={gold} strokeWidth="2"/><path d="M31 34L37 43L31 51L26 43Z" fill="#b898ff"/><path d="M12 23H19M45 23H52M12 32H18M46 32H52" stroke="#293143" strokeWidth="3"/></>,
  ranking:<><path d="M20 10H44V27Q44 39 32 42Q20 39 20 27Z" fill={gold}/><path d="M20 14H9V22Q9 32 23 33M44 14H55V22Q55 32 41 33" stroke={gold} strokeWidth="4"/><path d="M32 39V51M22 54H42" stroke={gold} strokeWidth="6"/><path d="M32 16L35 23L42 24L37 29L38 36L32 32L26 36L27 29L22 24L29 23Z" fill="#fff2be"/></>,
  battle:<><path d="M13 7L20 9L45 43L40 47L14 15Z" fill={steel}/><path d="M49 7L42 9L17 43L22 47L48 15Z" fill={steel}/><path d="M12 36L27 48M35 48L50 36" stroke={gold} strokeWidth="5"/><path d="M17 43L9 53M45 43L53 53" stroke="#ae7148" strokeWidth="6"/><path d="M16 12L40 42M46 12L23 42" stroke="#f2f9fa" strokeWidth="1.5"/></>,
  inventory:<><path d="M20 18V13Q31 4 42 13V18" stroke={gold} strokeWidth="4"/><path d="M12 22Q31 13 50 22L53 51Q31 60 9 51Z" fill="#815534" stroke={gold} strokeWidth="2"/><path d="M12 23L17 36Q31 43 46 36L50 23" fill="#b27c42" stroke={gold} strokeWidth="2"/><path d="M29 28H35V45H29Z" fill={gold}/><path d="M16 47H23M40 47H47" stroke="#d1a46f" strokeWidth="2"/></>,
  market:<><path d="M12 30H51V53H12Z" fill="#774b36" stroke={gold} strokeWidth="2"/><path d="M16 10H47L56 29H7Z" fill="#6e8999" stroke={gold} strokeWidth="2"/><path d="M23 11L19 29M39 11L44 29" stroke="#d9c7a0" strokeWidth="7"/><path d="M20 39H30V53H20Z" fill="#20252c"/><circle cx="43" cy="43" r="8" fill={gold}/><path d="M43 38V48M40 41H46M40 45H46" stroke="#875925" strokeWidth="1.5"/></>,
  upgrade:<><path d="M10 33H53L44 42H35V49H43V54H18V49H26V41H17Z" fill={steel} stroke="#9ba8b7" strokeWidth="2"/><path d="M36 9L18 31" stroke="#966239" strokeWidth="6"/><path d="M28 8L35 3L48 17L41 24Z" fill={gold} stroke="#f8e4a7" strokeWidth="2"/><path d="M49 28L53 24M44 32L49 34M13 17L10 13" stroke="#ffc465" strokeWidth="2"/></>,
  captain:<><path d="M16 25Q15 7 31 7Q48 7 48 25V46L40 54H22L15 46Z" fill={steel} stroke={gold} strokeWidth="2"/><path d="M31 7V53" stroke={gold} strokeWidth="5"/><path d="M20 27L28 30V35L19 31M43 27L35 30V35L44 31" fill="#111d29"/><path d="M23 40V47M40 40V47" stroke="#26313b" strokeWidth="3"/><path d="M26 7L31 1L37 7" fill="#a64545"/></>,
  clan:<><path d="M31 7L51 15V34Q48 49 31 57Q14 49 11 34V15Z" fill="#496c72" stroke={gold} strokeWidth="3"/><path d="M31 16L35 26L46 28L38 36L40 47L31 42L22 47L24 36L16 28L27 26Z" fill={gold}/><path d="M31 20V40" stroke="#ffe8a4"/></>,
  warzone:<><path d="M15 6V56" stroke={gold} strokeWidth="4"/><path d="M18 9Q29 4 38 12Q47 15 54 10L49 35Q40 41 31 32Q25 28 18 32Z" fill="#a84b47" stroke="#e7b573" strokeWidth="2"/><path d="M30 17L41 29M40 17L29 29" stroke="#f5d9a5" strokeWidth="3"/><path d="M8 55H23" stroke={gold} strokeWidth="3"/></>,
  chat:<><path d="M9 14Q31 5 53 14V41Q43 47 27 44L16 54L17 44L9 40Z" fill="#d0b47c" stroke={gold} strokeWidth="2"/><path d="M18 21H44M18 29H41M18 37H33" stroke="#79573d" strokeWidth="3"/><path d="M45 12L55 6L50 26L37 37L40 25Z" fill={steel}/></>,
  character:<><path d="M8 54Q10 39 24 37H39Q52 39 55 54Z" fill="#668095" stroke={gold} strokeWidth="2"/><path d="M21 21Q19 9 31 8Q46 9 43 25L38 36H26Z" fill="#d5ac7b"/><path d="M21 22L18 19L22 8L33 5L43 11L46 24L38 16L27 18Z" fill="#604737"/><path d="M23 39L31 49L40 39" stroke={gold} strokeWidth="4"/><path d="M31 49V55" stroke={gold} strokeWidth="3"/></>,
 };
 return <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" fill="none" strokeLinejoin="round" strokeLinecap="round"><defs><linearGradient id={`${id}-gold`} x2=".7" y2="1"><stop stopColor="#fff0bb"/><stop offset=".5" stopColor="#d4aa60"/><stop offset="1" stopColor="#80502d"/></linearGradient><linearGradient id={`${id}-steel`} x2="1" y2="1"><stop stopColor="#e4f2f4"/><stop offset=".5" stopColor="#8da5b4"/><stop offset="1" stopColor="#45576e"/></linearGradient></defs>{art[name]}</svg>;
}
