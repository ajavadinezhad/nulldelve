/** Actual shots and queued rounds retain a brief walking stance after the trigger is released. */
export function createShotRecovery(){let remaining=0;return {get active(){return remaining>0;},get remaining(){return remaining;},recordShot(interval=.1){remaining=Math.max(remaining,Math.max(.16,Math.min(.42,Number(interval)||.1)));},update(dt){remaining=Math.max(0,remaining-Math.max(0,Number(dt)||0));},cancel(){remaining=0;}};}
export function operatorMoveSpeed({grabbed=false,sprint=false,firing=false,shotRecovery=false,burstActive=false,sprintMultiplier=1}={}){return grabbed?2.4:sprint&&!firing&&!shotRecovery&&!burstActive?6*Math.max(1,Math.min(1.15,sprintMultiplier)):4;}
/** Small creatures impede passage; heavy bodies cannot be walked through. Escape ignores bodies only. */
export function resolveCreaturePressure(player,dx,dz,enemies,blocked=()=>false,{escape=false,radius=.32}={}){
 if(!Number.isFinite(dx)||!Number.isFinite(dz))return {x:0,z:0};
 const start={x:player.x,z:player.z};let x=start.x,z=start.z;
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));
 const live=enemies.filter(e=>e.hp>0&&(e.spawnDelay??0)<=0&&Math.hypot(e.x-start.x,e.z-start.z)<3+Math.hypot(dx,dz));
 for(let i=0;i<steps;i++){
  let sx=dx/steps,sz=dz/steps;
  if(!escape)for(const e of live){
   const heavy=['brute','charger','sentinel','boss'].includes(e.variant),spacing=radius+(e.radius??.32)*(heavy?1:.65),old=Math.hypot(x-e.x,z-e.z),next=Math.hypot(x+sx-e.x,z+sz-e.z);
   if(next>=spacing||next>=old-.00001)continue; // Always permit escaping an existing overlap.
   if(!heavy){sx*=.45;sz*=.45;continue;}
   const nx=(x-e.x)/(old||1),nz=(z-e.z)/(old||1),toward=sx*nx+sz*nz;
   if(toward<0){sx-=toward*nx;sz-=toward*nz;}
   if(Math.hypot(x+sx-e.x,z+sz-e.z)<spacing&&old>=spacing){sx=0;sz=0;}
  }
  if(!blocked(x+sx,z,radius))x+=sx;
  if(!blocked(x,z+sz,radius))z+=sz;
 }
 return {x:x-start.x,z:z-start.z};
}
