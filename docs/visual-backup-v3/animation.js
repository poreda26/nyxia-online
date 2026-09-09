import anchors from './footAnchors.json';
// One atlas, eight rows: each hero has front/back views. Four walk frames
// followed by four attack frames. No wall-clock timer: pausing freezes poses.
export const ATTACK_DURATION = 0.56;
export function heroFrame(world, heroIndex) {
  const actor=world.actor;
  const attacking=world.swingUntil>world.time;
  const elapsed=Math.max(0,world.time-(world.swingStarted??0));
  const column=attacking?4+Math.min(3,Math.floor(elapsed/ATTACK_DURATION*4))
    :actor.moving?Math.floor((actor.walkTime||0)*8)%4:1;
  return {row:heroIndex*2+(actor.back?1:0),column,attacking};
}
export function drawAnimatedHero(ctx,atlas,world,heroIndex) {
  let {row,column,attacking}=heroFrame(world,heroIndex);
  const archer=heroIndex===2;
  if(archer) {row=(world.actor.back?2:0)+(attacking?1:0);column%=4;}
  const cellW=atlas.width/(archer?4:8),cellH=atlas.height/(archer?4:8);
  const a=world.actor,size=120;
  const foot=archer?anchors.archer[row*4+column]:anchors.heroes[row*8+column];
  ctx.save();ctx.translate(a.x,a.y);ctx.scale(a.facing||1,1);
  ctx.drawImage(atlas,column*cellW,row*cellH,cellW,cellH,-size/2,-size*foot,size,size);
  ctx.restore();
}
