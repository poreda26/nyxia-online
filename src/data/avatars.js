// Shared, closed catalog: clients cannot inject image URLs into other players' UI.
export const PLAYER_AVATARS = [
 {id:'human-warrior',name:'Human Warrior',rect:[157,16,132,145],color:'#d9ad68'},
 {id:'karus-warrior',name:'Karus Warrior',rect:[476,5,158,159],color:'#b68550'},
 {id:'human-rogue',name:'Human Rogue',rect:[810,25,154,160],color:'#7ac3a0'},
 {id:'karus-rogue',name:'Karus Rogue',rect:[1167,25,163,165],color:'#99af64'},
 {id:'human-mage',name:'Human Mage',rect:[162,393,141,151],color:'#b59be1'},
 {id:'karus-mage',name:'Karus Mage',rect:[494,393,148,157],color:'#8bacdb'},
 {id:'iron-vanguard',name:'Demir Öncü',en:'Iron Vanguard',portrait:'knight',color:'#9fc7db'},
 {id:'ember-warden',name:'Kor Muhafızı',en:'Ember Warden',portrait:'horns',color:'#e99b66'},
 {id:'moon-ranger',name:'Ay Avcısı',en:'Moon Ranger',portrait:'ranger',color:'#8cd4b5'},
 {id:'dusk-stalker',name:'Alaca İzci',en:'Dusk Scout',portrait:'mask',color:'#b7a0e2'},
 {id:'star-oracle',name:'Yıldız Bilgesi',en:'Star Oracle',portrait:'oracle',color:'#e3ca7e'},
 {id:'frost-seer',name:'Buz Kahini',en:'Frost Seer',portrait:'seer',color:'#82dce8'},
 {id:'obsidian-dragon',name:'Obsidyen Ejder',en:'Obsidian Dragon',fantasy:'dragon',color:'#bc86e7'},
 {id:'silver-wolf',name:'Gümüş Kurt',en:'Silver Wolf',fantasy:'wolf',color:'#afcde5'},
 {id:'sun-phoenix',name:'Güneş Ankası',en:'Sun Phoenix',fantasy:'phoenix',color:'#f4b15e'},
 {id:'grove-spirit',name:'Orman Ruhu',en:'Grove Spirit',fantasy:'treant',color:'#9ece7d'},
 {id:'void-watcher',name:'Hiçlik Gözcüsü',en:'Void Watcher',fantasy:'eye',color:'#ca91ef'},
 {id:'frost-lich',name:'Buz Lichi',en:'Frost Lich',fantasy:'lich',color:'#89e2ef'},
 {id:'ember-demon',name:'Kor İblisi',en:'Ember Demon',fantasy:'demon',color:'#f08a75'},
 {id:'tide-serpent',name:'Gelgit Yılanı',en:'Tide Serpent',fantasy:'serpent',color:'#79d4c2'},
 {id:'moon-owl',name:'Ay Baykuşu',en:'Moon Owl',fantasy:'owl',color:'#b8b0ed'},
 {id:'crystal-golem',name:'Kristal Golem',en:'Crystal Golem',fantasy:'golem',color:'#88bdf5'},
 {id:'star-kitsune',name:'Yıldız Tilkisi',en:'Star Fox',fantasy:'fox',color:'#f0c89a'},
 {id:'dusk-raven',name:'Alaca Kuzgun',en:'Dusk Raven',fantasy:'raven',color:'#a2b2d6'},
];
export const CLAN_AVATARS = [
 {id:'wolf',name:'Ay Kurdu',en:'Moon Wolf',color:'#8bc9e5',path:'M24 23L39 31L50 25L61 31L76 23L70 59L50 77L30 59Z M36 43L45 48L34 49M64 43L55 48L66 49M43 59L50 65L57 59'},
 {id:'phoenix',name:'Anka',en:'Phoenix',color:'#efae67',path:'M50 73L40 53L22 57L34 44L15 32L40 38L50 24L60 38L85 32L66 44L78 57L60 53Z M50 38V60'},
 {id:'crown',name:'Altın Taç',en:'Golden Crown',color:'#e3c87d',path:'M24 35L38 48L50 25L62 48L76 35L69 66H31Z M31 73H69M47 52L50 47L53 52L50 57Z'},
 {id:'dragon',name:'Ejder',en:'Dragon',color:'#d2818e',path:'M27 72L34 48L28 26L47 35L64 25L60 39L78 48L69 58L55 56L62 74L46 64Z M49 44L57 46M65 50L74 50'},
 {id:'sentinel',name:'Muhafız',en:'Sentinel',color:'#9cafda',path:'M50 22L57 33L54 55L68 62L64 68L54 64L54 77H46V64L36 68L32 62L46 55L43 33Z M22 31L35 37V56L24 65M78 31L65 37V56L76 65'},
 {id:'moon',name:'Gece Yıldızı',en:'Night Star',color:'#c1a0e1',path:'M61 24A27 27 0 1 0 73 66A30 30 0 0 1 61 24Z M70 29L73 37L82 40L73 43L70 51L67 43L59 40L67 37Z'},
 {id:'kraken',name:'Derinlik',en:'Kraken',color:'#72c9bc',path:'M35 49Q29 24 50 24Q71 24 65 49L70 62Q80 69 82 55M60 50L62 73L72 78M50 51V80M40 50L38 73L28 78M35 49L30 62Q20 69 18 55M40 40L45 44M60 40L55 44'},
 {id:'lion',name:'Aslan Yürek',en:'Lionheart',color:'#e7ba6c',path:'M50 20L65 27L77 43L72 63L50 81L28 63L23 43L35 27Z M37 35L50 30L63 35L66 52L57 65H43L34 52Z M39 44L46 47M61 44L54 47M44 55L50 60L56 55'},
 {id:'raven',name:'Kuzgun',en:'Raven',color:'#a5a2df',path:'M49 28L61 32L72 42L58 43L62 58L78 68L56 65L50 80L44 65L22 68L38 58L29 42L18 25L42 37Z M53 36H57'},
 {id:'oak',name:'Kadim Meşe',en:'Ancient Oak',color:'#9bca79',path:'M45 61L31 75L45 70L50 81L55 70L69 75L55 61V49Q76 58 78 42Q79 29 63 31Q64 18 50 20Q36 18 37 31Q21 29 22 42Q24 58 45 49Z M50 35V61M35 40L50 49L65 40'},
 {id:'eclipse',name:'Tutulma',en:'Eclipse',color:'#db9acf',path:'M50 18V27M50 73V82M18 50H27M73 50H82M27 27L33 33M67 67L73 73M27 73L33 67M67 33L73 27M69 50A19 19 0 1 0 31 50A19 19 0 1 0 69 50Z M54 32Q38 50 54 68Q72 50 54 32Z'},
 {id:'griffin',name:'Grifon',en:'Griffin',color:'#b2cadc',path:'M50 78L38 59L21 63L28 48L17 28L42 39L49 24L64 29L73 40L58 43L63 53L81 28L74 55L64 64Z M53 32L58 34M38 49L31 37'},
];
export const validPlayerAvatar=id=>PLAYER_AVATARS.some(a=>a.id===id);
export const validClanAvatar=id=>CLAN_AVATARS.some(a=>a.id===id);
export const playerAvatarId=player=>validPlayerAvatar(player?.avatarId)?player.avatarId:validPlayerAvatar(`${player?.race}-${player?.class}`)?`${player.race}-${player.class}`:'human-warrior';
