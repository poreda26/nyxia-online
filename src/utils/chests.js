import {BAG_SLOTS,addItemToInventory} from './inventory';
import {rollChestLoot,rollSpecialChestLoot} from './loot';

// Commit the reward and remove its chest together. Failure preserves both.
export function openChestSafely(player,chestId,roll){
 const chest=player.chests.find(c=>c.id===chestId);
 if(!chest)return {player,opened:false,reason:'chestMissing'};
 if(player.inventory.length>=BAG_SLOTS)return {player,opened:false,reason:'bagFull'};
 const item=roll?roll(chest,player):chest.special?rollSpecialChestLoot(player.class):rollChestLoot(chest.tier);
 if(!item)return {player,opened:false,reason:'emptyChestPool'};
 const result=addItemToInventory(player,item);
 if(!result.added)return {...result,opened:false,item:null};
 return {opened:true,item,player:{...result.player,chests:player.chests.filter(c=>c.id!==chestId),hasNewItemNotice:true,milestones:{...player.milestones,chestsOpened:(player.milestones?.chestsOpened||0)+1}}};
}
export function openChestsSafely(player,roll){
 let next=player,reason=null;const items=[];
 for(const chest of player.chests){const result=openChestSafely(next,chest.id,roll);if(!result.opened){reason=result.reason;break;}next=result.player;items.push(result.item);}
 return {player:next,items,reason,remaining:next.chests.length};
}
