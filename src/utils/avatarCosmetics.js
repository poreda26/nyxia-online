import {PLAYER_AVATARS} from '../data/avatars.js';
import {AVATAR_FRAMES} from '../data/avatarFrames.js';
export const avatarPrice=a=>a?.image?250:0;
export function ownsCosmetic(player,kind,id){
 if(kind==='frame'&&id===null)return true;
 const item=(kind==='frame'?AVATAR_FRAMES:PLAYER_AVATARS).find(a=>a.id===id);
 return !!item&&((kind==='avatar'&&!avatarPrice(item))||(player[kind==='frame'?'ownedAvatarFrames':'ownedAvatars']||[]).includes(id));
}
// One functional state update: double taps cannot charge twice. Cosmetic only.
export function selectCosmetic(player,kind,id){
 if(!['avatar','frame'].includes(kind))return player;
 const field=kind==='frame'?'avatarFrameId':'avatarId',owned=kind==='frame'?'ownedAvatarFrames':'ownedAvatars';
 if(kind==='frame'&&id===null)return {...player,[field]:null};
 const item=(kind==='frame'?AVATAR_FRAMES:PLAYER_AVATARS).find(a=>a.id===id);
 if(!item)return player;
 if(ownsCosmetic(player,kind,id))return {...player,[field]:id};
 const price=kind==='frame'?item.price:avatarPrice(item);
 if(!Number.isFinite(player.diamonds)||player.diamonds<price)return player;
 return {...player,diamonds:player.diamonds-price,[owned]:[...new Set([...(player[owned]||[]),id])],[field]:id};
}
