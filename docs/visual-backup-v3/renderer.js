import anchors from './footAnchors.json';
import { drawAnimatedHero } from './animation';
import { WORLD, CAMP, NPCS, inCamp, attackRange } from './engine';

export function cameraFor(width,height,actor) {
  const zoom=Math.max(0.68,Math.min(1.15,height/650));
  const vw=width/zoom,vh=height/zoom;
  return { zoom,x:Math.max(0,Math.min(WORLD.width-vw,actor.x-vw/2)),y:Math.max(0,Math.min(WORLD.height-vh,actor.y-vh/2)) };
}
function label(ctx,text,x,y,color='#f6ead2',size=14) {
  ctx.font=`600 ${size}px "Manrope", sans-serif`;ctx.textAlign='center';
  ctx.lineWidth=4;ctx.strokeStyle='#0b1517';ctx.strokeText(text,x,y);ctx.fillStyle=color;ctx.fillText(text,x,y);
}
function ring(ctx,x,y,rx,ry,color) {
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
}
function sprite(ctx,atlas,index,x,y,size,facing=1) {
  ctx.save();ctx.translate(x,y);ctx.scale(facing,1);
  const cw=atlas.width/4,ch=atlas.height/2;
  ctx.drawImage(atlas,(index%4)*cw,Math.floor(index/4)*ch,cw,ch,-size/2,-size*(ch/cw)*anchors.actors[index],size,size*(ch/cw));
  ctx.restore();
}
export function drawWorld(ctx,width,height,world,player,art) {
  const cam=cameraFor(width,height,world.actor);
  ctx.clearRect(0,0,width,height);ctx.fillStyle='#0a1817';ctx.fillRect(0,0,width,height);
  ctx.save();ctx.scale(cam.zoom,cam.zoom);ctx.translate(-cam.x,-cam.y);
  if(art.terrain) ctx.drawImage(art.terrain,0,0,WORLD.width,WORLD.height);
  ctx.fillStyle='#06151b16';ctx.fillRect(0,0,WORLD.width,WORLD.height);
  ctx.save();ctx.setLineDash([6,12]);ring(ctx,CAMP.x,CAMP.y,CAMP.radius,CAMP.radius,'#a7e5c944');ctx.restore();
  label(ctx,'GÜVENLİ KAMP',CAMP.x,CAMP.y+115,'#b6ddc7',13);
  const target=world.monsters.find(m=>m.id===world.target && m.hp>0);
  if(target) {
    ring(ctx,target.x,target.y,35,17,'#efb569');
    ctx.save();ctx.setLineDash([5,10]);ctx.lineWidth=1;ctx.strokeStyle='#f3d6a744';ctx.beginPath();ctx.moveTo(world.actor.x,world.actor.y);ctx.lineTo(target.x,target.y);ctx.stroke();ctx.restore();
  }
  const heroIndex=player.class==='mage'?3:player.class==='rogue'?2:player.race==='karus'?1:0;
  const actors=[...world.monsters.filter(m=>m.hp>0).map(m=>({...m,kind:'monster'})),...NPCS.map(n=>({...n,kind:'npc',sprite:7})),{...world.actor,kind:'hero',sprite:heroIndex}].sort((a,b)=>a.y-b.y);
  for(const a of actors) {
    // Small contact shadows sit exactly at the alpha-derived foot baseline.
    const shadowWidth=a.sprite===5?29:a.sprite===4?25:19;
    ctx.beginPath();ctx.ellipse(a.x,a.y,shadowWidth,5,0,0,Math.PI*2);ctx.fillStyle='#07100bb3';ctx.fill();
    if(a.kind==='hero' && art.animations) drawAnimatedHero(ctx,heroIndex===2?art.archer:art.animations,world,heroIndex);
    else if(art.atlas) sprite(ctx,art.atlas,a.sprite,a.x,a.y,a.kind==='hero'?88:a.kind==='npc'?84:a.sprite===5?96:82,a.facing||1);
    if(a.kind==='hero') {
      label(ctx,player.nickname,a.x,a.y-120,'#f8e8be',15);
      // A small equipment badge uses the actual currently equipped item asset.
      if(art.weapon) {ctx.drawImage(art.weapon,a.x+30,a.y-56,28,40);}
      if(player.class==='warrior' && world.swingUntil>world.time && world.time-world.swingStarted>=0.24 && world.time-world.swingStarted<0.40) {
        ctx.save();ctx.translate(a.x,a.y-30);ctx.scale(a.facing,1);ctx.beginPath();ctx.arc(0,0,attackRange(player)>100?70:52,-1.2,0.8);ctx.strokeStyle=player.class==='mage'?'#9bdeff':'#ffe0aa';ctx.lineWidth=5;ctx.shadowBlur=18;ctx.shadowColor=ctx.strokeStyle;ctx.stroke();ctx.restore();
      }
    } else if(a.kind==='npc') {
      label(ctx,a.name,a.x,a.y-112,'#d9dfac',14);label(ctx,'◆',a.x,a.y-132,'#efd98b',18);
    } else {
      const selected=a.id===world.target;
      label(ctx,a.template.name,a.x,a.y-(a.sprite===5?115:95),selected?'#ffe0a3':'#e2d9c3',13);
      if(a.hp<a.template.hp || selected) {
        const y=a.y-(a.sprite===5?107:87);ctx.fillStyle='#101712';ctx.fillRect(a.x-25,y,50,5);ctx.fillStyle=a.state==='return'?'#a4b69c':'#c96652';ctx.fillRect(a.x-25,y,50*a.hp/a.template.hp,5);
      }
    }
  }
  const shot=world.projectile;
  if(shot && world.time>=shot.start && world.time<shot.end) {
    const t=(world.time-shot.start)/(shot.end-shot.start);
    const x=shot.from.x+(shot.to.x-shot.from.x)*t,y=shot.from.y+(shot.to.y-shot.from.y)*t;
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(shot.to.y-shot.from.y,shot.to.x-shot.from.x));
    ctx.strokeStyle=shot.kind==='arrow'?'#f2d59a':'#91e4ff';ctx.lineWidth=shot.kind==='arrow'?2:5;
    ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=shot.kind==='magic'?12:0;
    ctx.beginPath();ctx.moveTo(-25,0);ctx.lineTo(4,0);ctx.stroke();
    if(shot.kind==='arrow'){ctx.beginPath();ctx.moveTo(-3,-4);ctx.lineTo(4,0);ctx.lineTo(-3,4);ctx.stroke();}
    ctx.restore();
  }
  for(const e of world.effects) {ctx.globalAlpha=Math.min(1,(e.until-world.time)*2);label(ctx,e.text,e.x,e.y-(1.1-(e.until-world.time))*38,e.color,20);}
  ctx.globalAlpha=1;ctx.restore();
  return cam;
}
