// Export approved generated sheet into the 38 previously missing icon slots.
// Existing Rogue and Warrior T3 gloves/boots and T4/T5 artwork is preserved.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.NYXIA_SHARP||'C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source='art-source/inventory-armor-sheet.png';
const rows=[0,185,375,566,750,935,1129,1333,1586],cols=[0,192,392,588,798,992];
const slots=['head','chest','gauntlets','legs','boots'];
let count=0;
for(let row=0;row<8;row++)for(let col=0;col<5;col++){
 const cls=row<3?'warrior':'mage',tier=row<3?row+1:row-2,slot=slots[col];
 if(cls==='warrior'&&tier===3&&['boots','gauntlets'].includes(slot))continue;
 const {data,info}=await sharp(source).extract({left:cols[col],top:rows[row],width:cols[col+1]-cols[col],height:rows[row+1]-rows[row]}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 // Remove only edge-connected near-black background; dark item details stay.
 const seen=new Uint8Array(info.width*info.height),queue=[];
 const visit=(x,y)=>{if(x<0||y<0||x>=info.width||y>=info.height)return;const i=y*info.width+x;if(seen[i])return;seen[i]=1;const p=i*4;if(Math.max(data[p],data[p+1],data[p+2])<24){data[p+3]=0;queue.push([x,y]);}};
 for(let x=0;x<info.width;x++){visit(x,0);visit(x,info.height-1);}for(let y=0;y<info.height;y++){visit(0,y);visit(info.width-1,y);}
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];visit(x-1,y);visit(x+1,y);visit(x,y-1);visit(x,y+1);}
 await sharp(data,{raw:info}).trim({threshold:8}).resize(372,372,{fit:'inside'}).extend({top:24,bottom:24,left:24,right:24,background:'#00000000'}).resize(420,420,{fit:'contain',background:'#00000000'}).png().toFile(`src/assets/items/${cls}-t${tier}-${slot}.png`);count++;
}
console.log(`Exported ${count} standalone armor icons.`);
