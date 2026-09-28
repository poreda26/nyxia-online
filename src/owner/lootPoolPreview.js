// Exact default selection weights for the current catalog. No random sampling.
export function defaultLootPool(catalog,tier,rules,{mapTier,specialClass}={}){
 const merge=rows=>{const out=new Map();for(const r of rows){if(r.weight<=0)continue;const id=r.key+':'+r.level;const old=out.get(id);out.set(id,{...r,weight:r.weight+(old?.weight||0)});}return [...out.values()];};
 const scale=(rows,p)=>rows.map(r=>({...r,weight:r.weight*p}));
 const flat=items=>items.map(i=>({key:i.key,level:i.kind==='accessory'?0:1,weight:1/items.length}));
 const weapon=(t,cls)=>{const weapons=flat(catalog.filter(i=>i.kind==='weapon'&&i.tier===t&&i.class===cls));const shields=cls==='warrior'?flat(catalog.filter(i=>i.kind==='shield'&&i.tier===t)):[];return merge([...scale(weapons,shields.length?.8:1),...scale(shields,.2)]);};
 const base=t=>{
  const w=merge(['warrior','rogue','mage'].flatMap(cls=>scale(weapon(t,cls),1/3)));
  const a=flat(catalog.filter(i=>i.kind==='armor'&&i.tier===t));
  const j=flat(catalog.filter(i=>i.kind==='accessory'&&i.tier===t&&!i.mapTier));
  return merge([...scale(w,rules.chests.weaponPct),...scale(a.length?a:w,rules.chests.armorPct),...scale(j.length?j:w,1-rules.chests.weaponPct-rules.chests.armorPct)]);
 };
 if(specialClass){const a=flat(catalog.filter(i=>i.kind==='accessory'&&i.tier===6&&!i.mapTier)),ap=rules.chests.specialAccessoryChance??.01,wp=rules.chests.specialUniqueChance;return merge([...scale(a,ap),...scale(weapon(6,specialClass),(1-ap)*wp),...scale(base(5),(1-ap)*(1-wp))]);}
 if(mapTier){const regular=merge([...scale(base(tier),.5),...scale(base(Math.max(1,tier-1)),.5)]);const a=flat(catalog.filter(i=>i.mapTier===mapTier));return a.length?merge([...scale(a,.06),...scale(regular,.94)]):regular;}
 return base(tier);
}
