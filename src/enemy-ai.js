export function applyEnemyStagger(enemy,duration){
 if(!Number.isFinite(duration)||duration<=0)return false;
 if(enemy.variant==='sentinel'){duration=Math.min(.08,duration);if((enemy.staggerImmunity??0)>0)return false;enemy.staggerImmunity=.9;}
 if(enemy.variant==='boss'){
  if((enemy.staggerImmunity??0)>0||(enemy.pulseWindup??0)>0)return false;
  enemy.staggerTime=Math.max(enemy.staggerTime??0,Math.min(.10,duration));enemy.staggerImmunity=1.1;return true;
 }
 enemy.staggerTime=Math.max(enemy.staggerTime??0,duration);return true;
}
export const CHARGER_RUSH={windup:.9,speed:10,duration:.62,cooldown:4.5,damage:18,hitRadius:.85};
export const SCREECHER_PULSE={radius:3.2,windup:1.25,cooldown:6,damage:14};
export const LEAPER_HOP={range:6,distance:5.5,windup:1,duration:.6,cooldown:4.8,radius:1.15,damage:12};
export const NEST_PULSE={radius:5.5,windup:1.1,cooldown:6,safeHalfAngle:.6,damage:20};
const angleDifference=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
/** Roaches announce a bite before striking. Stats may live directly on enemy or in stats. */
export function updateRoachEnemy(enemy,player,dt,{lineOfSight,move,onBite,allowMovement=true}) {
  if(enemy.hp<=0||!Number.isFinite(dt)||dt<=0)return;
  const stat=(name,fallback)=>enemy[name]??enemy.stats?.[name]??fallback;
  const visual=enemy.mesh.userData;
  const shrieks=enemy.variant==='screecher'||enemy.variant==='boss'&&enemy.encounter==='hospital-isolation';
  const rushes=enemy.variant==='charger'||enemy.variant==='boss'&&enemy.encounter==='freight-cold';
  const cancelBite=()=>{enemy.attackWindup=0;visual.attackWindup=0;};
  enemy.staggerImmunity=Math.max(0,(enemy.staggerImmunity??0)-dt);
  enemy.pulseCooldown=Math.max(0,(enemy.pulseCooldown??0)-dt);
  enemy.chargeCooldown=Math.max(0,(enemy.chargeCooldown??0)-dt);
  enemy.shriekCooldown=Math.max(0,(enemy.shriekCooldown??0)-dt);
  enemy.leapCooldown=Math.max(0,(enemy.leapCooldown??0)-dt);
  enemy.cooldown=Math.max(0,(enemy.cooldown??0)-dt);
  if((enemy.pulseWindup??0)>0){
    enemy.pulseWindup=Math.max(0,enemy.pulseWindup-dt);visual.pulse={active:enemy.pulseWindup>0,angle:enemy.pulseGapAngle,radius:NEST_PULSE.radius,progress:1-enemy.pulseWindup/NEST_PULSE.windup};
    if(enemy.pulseWindup===0){const dx=player.x-enemy.x,dz=player.z-enemy.z;enemy.pulseCooldown=NEST_PULSE.cooldown;if(Math.hypot(dx,dz)<=NEST_PULSE.radius&&Math.abs(angleDifference(Math.atan2(dz,dx),enemy.pulseGapAngle))>NEST_PULSE.safeHalfAngle&&lineOfSight(enemy.x,enemy.z,player.x,player.z))onBite(NEST_PULSE.damage);}
    return;
  }
  if((enemy.staggerTime??0)>0){if((enemy.shriekWindup??0)>0)enemy.shriekCooldown=SCREECHER_PULSE.cooldown;if((enemy.leapWindup??0)>0||(enemy.leapRemaining??0)>0)enemy.leapCooldown=LEAPER_HOP.cooldown;enemy.shriekWindup=0;enemy.leapWindup=0;enemy.leapRemaining=0;visual.shriekWindup=0;visual.leapTarget=null;visual.leapProgress=0;if((enemy.chargeWindup??0)>0||(enemy.chargeRemaining??0)>0)enemy.chargeCooldown=CHARGER_RUSH.cooldown;enemy.chargeWindup=0;enemy.chargeRemaining=0;visual.chargeWindup=0;enemy.staggerTime=Math.max(0,enemy.staggerTime-dt);cancelBite();return;}
  if(shrieks&&(enemy.shriekWindup??0)>0){
    enemy.shriekWindup=Math.max(0,enemy.shriekWindup-dt);visual.shriekWindup=enemy.shriekWindup>0?1-enemy.shriekWindup/SCREECHER_PULSE.windup:0;
    if(enemy.shriekWindup===0){enemy.shriekCooldown=SCREECHER_PULSE.cooldown;enemy.cooldown=Math.max(enemy.cooldown,stat('attackCooldown',1.3));if(Math.hypot(player.x-enemy.x,player.z-enemy.z)<=SCREECHER_PULSE.radius&&lineOfSight(enemy.x,enemy.z,player.x,player.z))onBite(SCREECHER_PULSE.damage);}
    return;
  }
  if(enemy.variant==='leaper'&&(enemy.leapWindup??0)>0){
    enemy.leapWindup=Math.max(0,enemy.leapWindup-dt);visual.leapWindup=enemy.leapWindup>0?1-enemy.leapWindup/LEAPER_HOP.windup:0;
    if(enemy.leapWindup===0){enemy.leapRemaining=LEAPER_HOP.duration;visual.leapProgress=.001;}return;
  }
  if(enemy.variant==='leaper'&&(enemy.leapRemaining??0)>0){
    const elapsed=Math.min(dt,enemy.leapRemaining),distance=Math.hypot(enemy.leapX-enemy.x,enemy.leapZ-enemy.z),fraction=elapsed/enemy.leapRemaining,dx=(enemy.leapX-enemy.x)*fraction,dz=(enemy.leapZ-enemy.z)*fraction,steps=Math.max(1,Math.ceil(distance*fraction/.1));let blocked=!allowMovement;
    for(let i=0;i<steps&&!blocked;i++){const x=enemy.x,z=enemy.z,tx=x+dx/steps,tz=z+dz/steps;if(!lineOfSight(x,z,tx,tz)){blocked=true;break;}move(enemy,dx/steps,dz/steps);if(Math.abs(enemy.x-tx)>.001||Math.abs(enemy.z-tz)>.001)blocked=true;}
    enemy.leapRemaining=blocked?0:Math.max(0,enemy.leapRemaining-elapsed);visual.leapProgress=enemy.leapRemaining>0?1-enemy.leapRemaining/LEAPER_HOP.duration:0;
    if(enemy.leapRemaining===0){enemy.leapCooldown=LEAPER_HOP.cooldown;enemy.cooldown=Math.max(enemy.cooldown,stat('attackCooldown',1.1));visual.leapTarget=null;if(!blocked&&Math.hypot(player.x-enemy.x,player.z-enemy.z)<=LEAPER_HOP.radius&&lineOfSight(enemy.x,enemy.z,player.x,player.z))onBite(LEAPER_HOP.damage);}return;
  }
  if(rushes&&(enemy.chargeWindup??0)>0){
    enemy.chargeWindup=Math.max(0,enemy.chargeWindup-dt);visual.chargeWindup=1-enemy.chargeWindup/CHARGER_RUSH.windup;
    if(enemy.chargeWindup===0){enemy.chargeRemaining=CHARGER_RUSH.duration;visual.chargeWindup=0;}return;
  }
  if(rushes&&(enemy.chargeRemaining??0)>0){
    const step=Math.min(dt,enemy.chargeRemaining)*CHARGER_RUSH.speed,tx=enemy.x+enemy.chargeX*step,tz=enemy.z+enemy.chargeZ*step;
    enemy.chargeRemaining=Math.max(0,enemy.chargeRemaining-dt);
    if(!allowMovement||!lineOfSight(enemy.x,enemy.z,tx,tz)){enemy.chargeRemaining=0;enemy.chargeCooldown=CHARGER_RUSH.cooldown;return;}
    const startX=enemy.x,startZ=enemy.z;
    move(enemy,enemy.chargeX*step,enemy.chargeZ*step);
    const actualX=enemy.x-startX,actualZ=enemy.z-startZ,travel=Math.hypot(actualX,actualZ);
    // Body collision is authoritative: a centre ray can be clear while an
    // antenna-sized opening is too narrow for the charger. Never project a hit
    // beyond the movement that collision actually allowed, or slide a rush.
    const blocked=Math.abs(actualX-enemy.chargeX*step)>.001||Math.abs(actualZ-enemy.chargeZ*step)>.001;
    if(travel>.001&&!blocked){
      const px=player.x-startX,pz=player.z-startZ,t=Math.max(0,Math.min(1,(px*actualX+pz*actualZ)/(travel*travel)));
      if(!enemy.chargeHit&&Math.hypot(px-actualX*t,pz-actualZ*t)<CHARGER_RUSH.hitRadius&&lineOfSight(startX,startZ,player.x,player.z)){onBite(CHARGER_RUSH.damage);enemy.chargeHit=true;}
    }
    if(blocked)enemy.chargeRemaining=0;
    if(enemy.chargeRemaining===0)enemy.chargeCooldown=CHARGER_RUSH.cooldown;return;
  }
  const speed=stat('speed',2.7),biteRange=stat('biteRange',1.05),stopDistance=stat('stopDistance',.78);
  const dx=player.x-enemy.x,dz=player.z-enemy.z,d=Math.hypot(dx,dz);
  const seesPlayer=lineOfSight(enemy.x,enemy.z,player.x,player.z);
  if(seesPlayer&&d<stat('detectRange',11))enemy.alerted=true;
  if(!seesPlayer||!enemy.alerted){cancelBite();return;}
  enemy.mesh.rotation.y=Math.atan2(-dx,-dz);
  if(enemy.variant==='boss'&&(enemy.encounter==='nest'||enemy.bossMechanic==='pulse')&&d>2&&d<=NEST_PULSE.radius+1&&enemy.pulseCooldown<=0){
    // The telegraphed gap sits beside the starting position, so standing still is
    // dangerous while a short sidestep reaches safety. Alternate the side each pulse.
    cancelBite();enemy.pulseSide=enemy.pulseSide===1?-1:1;enemy.pulseGapAngle=Math.atan2(dz,dx)+enemy.pulseSide*.95;enemy.pulseWindup=NEST_PULSE.windup;visual.pulse={active:true,angle:enemy.pulseGapAngle,radius:NEST_PULSE.radius,progress:0};return;
  }
  if(shrieks&&d>1.4&&d<=SCREECHER_PULSE.radius+.4&&enemy.shriekCooldown<=0){cancelBite();enemy.shriekWindup=SCREECHER_PULSE.windup;visual.shriekWindup=.001;return;}
  if(enemy.variant==='leaper'&&allowMovement&&d>2.5&&d<=LEAPER_HOP.range&&enemy.leapCooldown<=0){const length=Math.min(d,LEAPER_HOP.distance);cancelBite();enemy.leapX=enemy.x+dx/d*length;enemy.leapZ=enemy.z+dz/d*length;enemy.leapWindup=LEAPER_HOP.windup;visual.leapWindup=.001;visual.leapTarget={x:enemy.leapX,z:enemy.leapZ};return;}
  if(rushes&&allowMovement&&d>3&&d<7&&(enemy.chargeCooldown??0)<=0){cancelBite();enemy.chargeX=dx/d;enemy.chargeZ=dz/d;enemy.chargeHit=false;enemy.chargeWindup=CHARGER_RUSH.windup;visual.chargeWindup=.01;return;}
  const duration=Math.max(enemy.variant==='sentinel'?.65:.15,stat('windupDuration',.35));
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
