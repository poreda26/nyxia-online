// Row-major cells in the generated atlas. Names and combat data are unchanged.
export const STARTER_WEAPON_ART = Object.freeze({
 'Rusty Sword':0,'Short Blade':0,'Iron Axe':1,'Wooden Staff':2,'Wood Staff':2,
 'Apprentice Staff':3,'Iron-Tipped Staff':4,'Silk-Bound Staff':5,
 'Crimson-Runed Staff':6,'Chitin-Woven Staff':7,'Bow':8,
});
const classicSheets={
 'classic-a':['Giantic Axe','Glave','Halberd','Raptor','Blade Axe','Avedon','Durandal','Mirage','Stormweaver'],
 'classic-b':['Hell Breaker','Iron Impact','Totamic Club','Large Hacker','Weight Hammer','Bamboo Bow','Iron Crossbow','Scorpion Bow','Iron Bow'],
 'classic-c':['Chitin Bow','Enion Bow',"Eagle's Eye",'Crossbow','Horn Crossbow','Helenid','Scorching Staff','Oasis Staff','Chaotic Staff'],
 'classic-d':['Hell Blood','Elysium','Garp','Prismatic Triad Staff',"Ron's Staff"],
};
const classicArt=Object.fromEntries(Object.entries(classicSheets).flatMap(([sheet,names])=>names.map((name,index)=>[name,{sheet:`${sheet}-weapons-v1`,index}])));
export function weaponIconArt(name){return STARTER_WEAPON_ART[name]!==undefined?{sheet:'starter-weapons-v1',index:STARTER_WEAPON_ART[name]}:classicArt[name]||null;}
