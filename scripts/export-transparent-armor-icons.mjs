// Export the reviewed transparent inventory atlases; worn character art is separate.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.NYXIA_SHARP||'C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const slots=['head','chest','legs','gauntlets','boots'];
const grids={
 warrior:{x:[0,240,505,755,1007,1254],y:[0,257,501,748,1002,1254]},
 rogue:{x:[0,240,517,754,1006,1254],y:[0,245,490,751,999,1254]},
};
for(const [cls,{x,y}] of Object.entries(grids)){
 const source=`art-source/${cls}-inventory-transparent.png`;
 const metadata=await sharp(source).metadata();
 if(!metadata.hasAlpha||metadata.width!==1254||metadata.height!==1254)throw Error(`Unexpected atlas: ${source}`);
 for(let row=0;row<5;row++)for(let col=0;col<5;col++){
  // These two atlas cells have narrower gutters; exclude the adjacent item tips.
  const cellTop=cls==='rogue'&&row===2&&col===3?502:y[row];
  const cellRight=cls==='rogue'&&row===4&&col===1?508:x[col+1];
  const {data,info}=await sharp(source).extract({left:x[col],top:cellTop,width:cellRight-x[col],height:y[row+1]-cellTop}).raw().toBuffer({resolveWithObject:true});
  let left=info.width,top=info.height,right=0,bottom=0;
  for(let py=0;py<info.height;py++)for(let px=0;px<info.width;px++)if(data[(py*info.width+px)*4+3]>16){left=Math.min(left,px);top=Math.min(top,py);right=Math.max(right,px);bottom=Math.max(bottom,py);}
  if(left>right)throw Error(`Empty icon: ${cls} ${row} ${col}`);
  await sharp(data,{raw:info}).extract({left,top,width:right-left+1,height:bottom-top+1}).resize(360,360,{fit:'contain',background:'#00000000'}).extend({top:30,bottom:30,left:30,right:30,background:'#00000000'}).png().toFile(`src/assets/items/${cls}-t${row+1}-${slots[col]}.png`);
 }
}
// Reviewed replacement: a connected garment instead of detached shin pieces.
await sharp('art-source/warrior-t5-legs-transparent.png').trim({threshold:8})
 .resize(360,360,{fit:'contain',background:'#00000000'})
 .extend({top:30,bottom:30,left:30,right:30,background:'#00000000'})
 .png().toFile('src/assets/items/warrior-t5-legs.png');
console.log('Exported 50 centered transparent Warrior/Rogue inventory icons.');
