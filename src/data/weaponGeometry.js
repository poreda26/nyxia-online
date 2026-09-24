// Coordinates are measured in a 418 x 627 atlas cell. Each bow/crossbow has
// its own limb profile; the string, hands and legs are deliberately excluded.
const bows={
 '0:0':[[[322,76],[345,123],[371,164],[377,204]],[[377,252],[373,291],[347,331],[322,370]],[6,20,24,16],[16,22,19,5]],
 '0:1':[[[290,8],[325,65],[358,124],[378,202]],[[377,250],[370,313],[345,368],[316,425]],[5,15,20,14],[15,20,16,5]],
 '1:0':[[[345,12],[382,40],[370,97],[406,155],[403,202]],[[404,250],[403,292],[371,343],[334,389],[365,414],[397,382]],[42,40,42,47,18],[18,45,40,20,22,6]],
 '1:1':[[[312,12],[349,62],[382,119],[399,176],[395,201]],[[396,250],[401,299],[367,358],[310,441]],[6,40,55,36,17],[18,45,48,7]],
 '1:2':[[[308,6],[357,64],[386,123],[398,178],[375,202]],[[375,252],[390,294],[370,353],[321,413]],[8,48,48,36,18],[18,48,46,6]],
 '2:0':[[[309,6],[355,55],[390,112],[398,174],[397,202]],[[397,250],[397,286],[372,336],[338,382],[309,435]],[5,55,55,39,19],[19,44,56,33,5]],
 '2:1':[[[312,5],[351,55],[389,112],[397,171],[397,202]],[[397,251],[398,293],[367,338],[339,375],[307,427]],[5,55,51,37,18],[19,43,61,37,5]],
 '3:1':[[[310,11],[348,61],[393,119],[402,199],[392,252]],[[392,307],[388,349],[393,399],[348,440],[319,491],[307,533]],[5,21,39,35,18],[19,44,50,28,19,5]],
 '3:2':[[[292,62],[309,101],[365,134],[371,204],[358,251]],[[357,304],[368,344],[356,394],[322,420]],[5,25,37,30,18],[18,37,35,6]],
 '4:0':[[[320,9],[344,63],[379,125],[389,181],[389,214]],[[389,256],[386,312],[358,374],[327,442]],[5,14,21,26,18],[18,22,20,5]],
 '4:2':[[[287,7],[318,68],[360,121],[364,183],[363,214]],[[363,254],[370,305],[337,370],[303,438]],[5,27,34,26,18],[18,33,35,5]],
 '5:0':[[[317,10],[356,50],[380,104],[399,156],[396,202]],[[396,250],[402,300],[369,362],[323,436]],[6,39,54,47,18],[19,50,59,6]],
 '5:2':[[[282,12],[329,46],[362,93],[380,150],[365,204]],[[365,253],[378,298],[350,356],[296,426]],[5,39,53,45,17],[18,50,58,5]],
};
const crossbows={
 '0:2':[[[208,205],[310,204],[400,204]],[[302,176],[350,181],[381,193]]],
 '2:2':[[[199,209],[297,214],[400,210]],[[305,165],[357,181],[368,230],[338,290]]],
 '3:0':[[[194,263],[293,271],[441,279]],[[330,202],[350,247],[394,276],[350,312],[322,310]]],
 '4:1':[[[226,229],[304,229],[410,231]],[[315,192],[365,203],[392,234],[365,266],[342,277]]],
 '5:1':[[[219,230],[300,229],[429,223]],[[276,190],[337,204],[394,225],[343,258],[319,268]]],
 '6:0':[[[230,246],[316,265],[444,296]],[[294,210],[356,236],[396,277]],[[371,206],[364,250]],[[445,270],[438,309]]],
};
const mageHeads=[
 [[290,0,423,210],[310,0,383,181],[298,0,407,178]],
 [[312,0,443,174],[303,0,454,187],[294,0,413,211]],
 [[307,0,437,196],[303,0,428,207],[283,0,425,205]],
 [[273,0,470,222],[278,0,444,216],[270,0,422,234]],
 [[299,0,427,226],[304,0,419,210],[279,0,420,235]],
 [[297,0,438,201],[279,0,412,198],[266,0,428,206]],
 [[302,0,434,204],[298,0,428,207],[282,0,429,208]],
 [[299,0,460,210],[264,0,447,213],null],
];
const mageShafts=[[[64,537],[277,226]],[[40,557],[283,240]],[[60,534],[282,244]],[[61,517],[277,253]],[[88,544],[292,256]],[[95,517],[283,221]],[[111,496],[293,238]],[[105,497],[298,242]]];
// Actual staff axes, measured per weapon rather than bent through generic hands.
const mageStems=[
 [[[59,549],[300,190]],[[61,549],[330,120]],[[62,550],[338,137]]],
 [[[28,574],[338,137]],[[29,577],[333,161]],[[24,580],[334,168]]],
 [[[44,550],[322,186]],[[43,547],[322,186]],[[35,553],[312,190]]],
 [[[45,535],[342,160]],[[58,528],[307,214]],[[42,532],[320,197]]],
 [[[113,521],[331,171]],[[93,538],[328,168]],[[73,550],[296,218]]],
 [[[86,531],[316,173]],[[99,531],[299,168]],[[100,538],[310,178]]],
 [[[114,497],[332,161]],[[107,503],[311,169]],[[146,503],[323,168]]],
 [[[111,510],[337,166]],[[128,510],[321,169]],null],
];
const warriorButts=[[[78,453],[68,467],[70,466]],[[36,490],[35,479],[51,460]],[[181,365],[183,362],[181,373]],[[86,425],[92,437],[90,430]],[[87,438],[159,371],[180,352]],[[158,382],[174,369],[61,460]],[[78,440],null,null]];
const polygon = points => 'M'+points.map(p=>p.join(',')).join('L')+'Z';
export function bowEndpoints(appearance){
 if(!appearance.atlasKey.startsWith('rogue'))return null;
 const index=Number(appearance.atlasKey.split('-')[1]),col=appearance.frameIndex%3,row=Math.floor(appearance.frameIndex/3),bow=bows[`${index}:${col}`];
 if(!bow)return null;
 const dy=row&&(index===0||index===2||index===4)?-10:0;
 return [bow[0][0],bow[1].at(-1)].map(([x,y])=>[x,y+dy]);
}
// Variable-width ribbons prevent broad rectangular selections from catching knees.
function ribbon(points,widths){
 const left=[],right=[];
 points.forEach(([x,y],i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,r=(Array.isArray(widths)?widths[i]:widths)/2;left.push([x-dy/len*r,y+dx/len*r]);right.push([x+dy/len*r,y-dx/len*r]);});
 return polygon([...left,...right.reverse()]);
}
export function weaponGeometry(appearance){
 const {atlasKey,frameIndex,size,weaponName}=appearance;
 const col=frameIndex%3,row=Math.floor(frameIndex/3),sx=size[0]/1254,sy=size[1]/1254;
 const transform=`translate(${col*418*sx} ${row*627*sy}) scale(${sx} ${sy})`;
 let head='',shaft='',hands=[],spread=.75,stem='',butt='';
 if(!weaponName)return {head,shaft,hands,transform,spread};
 if(atlasKey.startsWith('rogue')){
  const index=Number(atlasKey.split('-')[1]),key=`${index}:${col}`,bow=bows[key],cross=crossbows[key];
  if(bow){
   const [upper,lower,uw,lw]=bow;
   // Most lower rows start slightly higher; sheet 1 has exact row alignment.
   const dy=row&&(index===0||index===2||index===4)?-10:0;
   const shift=pts=>pts.map(([x,y])=>[x,y+dy]);
   head=ribbon(shift(upper),uw)+ribbon(shift(lower),lw);
   const a=upper.at(-1),b=lower[0];hands=[[a[0],(a[1]+b[1])/2+dy,23,27]];
   spread=.48;
  }else if(cross){
   const dy=row&&(index===0||index===2)?-12:row&&index===6?-33:0;
   head=cross.map((pts,i)=>ribbon(pts.map(([x,y])=>[x,y+dy]),i===0?24:18)).join('');
   const front=index===6?[304,294]:index===3?[281,304]:index===4?[313,257]:index===5?[285,254]:[286,234];
   hands=[[front[0],front[1]+dy,25,19]];
   spread=.45;
  }
 }else if(atlasKey.startsWith('mage')){
  const index=Number(atlasKey.split('-')[1]),box=mageHeads[index]?.[col];
  if(box){const [x0,y0,x1,y1]=box;head=polygon([[x0,y0],[x1,y0],[x1,y1],[x0,y1]]);}
  const dy=row?([0,-17,-18,0,-6,0,0,0][index]||0):0;
  const measured=mageStems[index]?.[col]||mageShafts[index]||mageShafts[0];
  const [start,end]=measured.map(([x,y])=>[x,y+dy]);
  stem=`M${start}L${end}`;shaft=ribbon([start,end],6);
  const dx=end[0]-start[0],vy=end[1]-start[1],len=Math.hypot(dx,vy);
  butt=ribbon([start,[start[0]+dx/len*30,start[1]+vy/len*30],[start[0]+dx/len*65,start[1]+vy/len*65]],[4,30,12]);
  const atY=y=>[start[0]+(y-start[1])*dx/vy,y];
  hands=[[...atY(mageShafts[index][1][1]+dy),26,28],[...atY((index===4?348:index===6?324:325)+dy),27,24]];
  spread=.65;
 }else{
  const index=Number(atlasKey.split('-')[1]),scythe=atlasKey.includes('raptor');
  const h=row?241:246;
  hands=[[scythe?267:col===0&&index===6?267:263,h,27,30],[196,row?310:322,28,26]];
  const sword=index===2||(index===4&&col===2)||(index===5&&col===1);
  // The scythe neck follows its own axis; extrapolating the grip direction cuts its collar.
  if(scythe)stem=row?'M72,464L196,310L267,241L365,86':'M72,464L196,322L267,246L365,86';
  if(scythe)head=polygon([[303,0],[491,0],[491,262],[448,262],[346,139],[303,103]]);
  else if(sword)head=polygon([[260,240],[292,194],[344,0],[428,0],[428,235],[322,263],[286,275]]);
  else head=polygon([[index===1&&col===2?224:266,0],[492,0],[492,229],[321,234],[283,195],[index===1&&col===2?224:266,104]]);
  const butt=scythe?[72,464]:warriorButts[index]?.[col];
  if(butt)shaft=ribbon([butt,[scythe?330:330,scythe?148:153]],6);
 }
 return {head,shaft,hands,transform,spread,stem,butt};
}

