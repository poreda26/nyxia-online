// Shared, closed catalog: clients cannot inject image URLs into other players' UI.
export const PLAYER_AVATARS = [
 {id:'human-warrior',name:'Human Warrior',rect:[157,16,132,145],color:'#d9ad68'},
 {id:'karus-warrior',name:'Karus Warrior',rect:[476,5,158,159],color:'#b68550'},
 {id:'human-rogue',name:'Human Rogue',rect:[810,25,154,160],color:'#7ac3a0'},
 {id:'karus-rogue',name:'Karus Rogue',rect:[1167,25,163,165],color:'#99af64'},
 {id:'human-mage',name:'Human Mage',rect:[162,393,141,151],color:'#b59be1'},
 {id:'karus-mage',name:'Karus Mage',rect:[494,393,148,157],color:'#8bacdb'},
];
export const CLAN_AVATARS = [
 {id:'wolf',name:'Ay Kurdu',en:'Moon Wolf',color:'#8bc9e5',path:'M24 23L39 31L50 25L61 31L76 23L70 59L50 77L30 59Z M36 43L45 48L34 49M64 43L55 48L66 49M43 59L50 65L57 59'},
 {id:'phoenix',name:'Anka',en:'Phoenix',color:'#efae67',path:'M50 73L40 53L22 57L34 44L15 32L40 38L50 24L60 38L85 32L66 44L78 57L60 53Z M50 38V60'},
 {id:'crown',name:'Altın Taç',en:'Golden Crown',color:'#e3c87d',path:'M24 35L38 48L50 25L62 48L76 35L69 66H31Z M31 73H69M47 52L50 47L53 52L50 57Z'},
 {id:'dragon',name:'Ejder',en:'Dragon',color:'#d2818e',path:'M27 72L34 48L28 26L47 35L64 25L60 39L78 48L69 58L55 56L62 74L46 64Z M49 44L57 46M65 50L74 50'},
 {id:'sentinel',name:'Muhafız',en:'Sentinel',color:'#9cafda',path:'M50 22L57 33L54 55L68 62L64 68L54 64L54 77H46V64L36 68L32 62L46 55L43 33Z M22 31L35 37V56L24 65M78 31L65 37V56L76 65'},
 {id:'moon',name:'Gece Yıldızı',en:'Night Star',color:'#c1a0e1',path:'M61 24A27 27 0 1 0 73 66A30 30 0 0 1 61 24Z M70 29L73 37L82 40L73 43L70 51L67 43L59 40L67 37Z'},
];
export const validPlayerAvatar=id=>PLAYER_AVATARS.some(a=>a.id===id);
export const validClanAvatar=id=>CLAN_AVATARS.some(a=>a.id===id);
export const playerAvatarId=player=>validPlayerAvatar(player?.avatarId)?player.avatarId:validPlayerAvatar(`${player?.race}-${player?.class}`)?`${player.race}-${player.class}`:'human-warrior';
