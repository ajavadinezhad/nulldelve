export function applyEnemyStagger(enemy,duration){
 if(!Number.isFinite(duration)||duration<=0)return false;
 if(enemy.variant==='boss'){
  if((enemy.staggerImmunity??0)>0||(enemy.pulseWindup??0)>0)return false;
  enemy.staggerTime=Math.max(enemy.staggerTime??0,Math.min(.10,duration));enemy.staggerImmunity=1.1;return true;
 }
 enemy.staggerTime=Math.max(enemy.staggerTime??0,duration);return true;
}
export const NEST_PULSE={radius:5.5,windup:1.1,cooldown:6,safeHalfAngle:.6,damage:20};
const angleDifference=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
/** Roaches announce a bite before striking. Stats may live directly on enemy or in stats. */
export function updateRoachEnemy(enemy,player,dt,{lineOfSight,move,onBite,allowMovement=true}) {
  if(enemy.hp<=0||!Number.isFinite(dt)||dt<=0)return;
  const stat=(name,fallback)=>enemy[name]??enemy.stats?.[name]??fallback;
  const visual=enemy.mesh.userData;
  const cancelBite=()=>{enemy.attackWindup=0;visual.attackWindup=0;};
  enemy.staggerImmunity=Math.max(0,(enemy.staggerImmunity??0)-dt);
  enemy.pulseCooldown=Math.max(0,(enemy.pulseCooldown??0)-dt);
  enemy.cooldown=Math.max(0,(enemy.cooldown??0)-dt);
  if((enemy.pulseWindup??0)>0){
    enemy.pulseWindup=Math.max(0,enemy.pulseWindup-dt);visual.pulse={active:enemy.pulseWindup>0,angle:enemy.pulseGapAngle,radius:NEST_PULSE.radius,progress:1-enemy.pulseWindup/NEST_PULSE.windup};
    if(enemy.pulseWindup===0){const dx=player.x-enemy.x,dz=player.z-enemy.z;enemy.pulseCooldown=NEST_PULSE.cooldown;if(Math.hypot(dx,dz)<=NEST_PULSE.radius&&Math.abs(angleDifference(Math.atan2(dz,dx),enemy.pulseGapAngle))>NEST_PULSE.safeHalfAngle&&lineOfSight(enemy.x,enemy.z,player.x,player.z))onBite(NEST_PULSE.damage);}
    return;
  }
  if((enemy.staggerTime??0)>0){enemy.staggerTime=Math.max(0,enemy.staggerTime-dt);cancelBite();return;}
  const speed=stat('speed',2.7),biteRange=stat('biteRange',1.05),stopDistance=stat('stopDistance',.78);
  const dx=player.x-enemy.x,dz=player.z-enemy.z,d=Math.hypot(dx,dz);
  const seesPlayer=lineOfSight(enemy.x,enemy.z,player.x,player.z);
  if(seesPlayer&&d<stat('detectRange',11))enemy.alerted=true;
  if(!seesPlayer||!enemy.alerted){cancelBite();return;}
  enemy.mesh.rotation.y=Math.atan2(-dx,-dz);
  if(enemy.variant==='boss'&&(enemy.encounter==='nest'||enemy.bossMechanic==='pulse')&&d>2&&d<=NEST_PULSE.radius+1&&enemy.pulseCooldown<=0){
    cancelBite();enemy.pulseGapAngle=Math.atan2(dz,dx);enemy.pulseWindup=NEST_PULSE.windup;visual.pulse={active:true,angle:enemy.pulseGapAngle,radius:NEST_PULSE.radius,progress:0};return;
  }
  const duration=Math.max(.15,stat('windupDuration',.35));
  if((enemy.attackWindup??0)>0){
    if(d>=biteRange){cancelBite();return;}
    enemy.attackWindup=Math.max(0,enemy.attackWindup-dt);
    visual.attackWindup=1-enemy.attackWindup/duration;
    if(enemy.attackWindup===0){
      visual.attackWindup=0;visual.biteTime=.2;
      enemy.cooldown=stat('attackCooldown',.85);onBite(stat('biteDamage',12));
    }
    return;
  }
  if(d<biteRange&&enemy.cooldown<=0){enemy.attackWindup=duration;visual.attackWindup=.01;return;}
  if(allowMovement&&d>stopDistance&&d>0){
    let mx=dx/d,mz=dz/d;
    if(stat('behavior','pursue')==='flank'&&d>2.5&&d<8){
      // Stable opposite-side approaches split a group around the operator. Keep
      // the direct route when the lateral steering segment is blocked by cover.
      const hash=String(enemy.id??'e0').split('').reduce((sum,char)=>sum+char.charCodeAt(0),0),side=hash%2?1:-1;
      const fx=mx-mz*.65*side,fz=mz+mx*.65*side,length=Math.hypot(fx,fz);
      const candidateX=fx/length,candidateZ=fz/length;
      if(lineOfSight(enemy.x,enemy.z,enemy.x+candidateX*1.2,enemy.z+candidateZ*1.2)){mx=candidateX;mz=candidateZ;}
    }
    const step=Math.min(dt*speed,d-stopDistance);move(enemy,mx*step,mz*step);
  }
}
