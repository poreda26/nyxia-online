export const CLAN_PERMISSIONS = ['deposit','withdraw','invite','kick','upgrade','donate','dungeon'];
export const DEFAULT_CLAN_PERMISSIONS = {
 officer: {deposit:true,withdraw:true,invite:true,kick:true,upgrade:true,donate:true,dungeon:true},
 member: {deposit:true,withdraw:false,invite:false,kick:false,upgrade:false,donate:true,dungeon:true},
};
export function clanAllowed(role,permissions,key){return role==='leader'||!!(permissions?.[role]||DEFAULT_CLAN_PERMISSIONS[role])?.[key];}
export const CLAN_VAULT_CAPACITY=60;
