export const FREIGHT_ESCORT_PATH=Object.freeze([{x:186,z:35},{x:186,z:32},{x:189,z:29},{x:186,z:26}].map(Object.freeze));
export const FREIGHT_ESCORT_DURATION=8;
export function freightEscortPoint(remaining){const t=Math.max(0,Math.min(1,1-remaining/FREIGHT_ESCORT_DURATION))*3,i=Math.min(2,Math.floor(t)),f=t-i,a=FREIGHT_ESCORT_PATH[i],b=FREIGHT_ESCORT_PATH[i+1];return {x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f};}
export function freightEscortStatus(cargo,player,enemies=[]){
 const point=freightEscortPoint(cargo.remaining);
 return {point,near:Math.hypot(player.x-point.x,player.z-point.z)<=4,blocked:enemies.some(e=>e.hp>0&&(e.spawnDelay??0)<=0&&Math.hypot(e.x-point.x,e.z-point.z)<2.5)};
}
