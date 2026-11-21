/** A short forward knife strike is always available when ammunition runs out. */
export function meleeTargets(player,aim,enemies,lineOfSight){
 let dx=aim.x-player.x,dz=aim.z-player.z;const length=Math.hypot(dx,dz);if(length<.001){dx=-Math.sin(player.angle||0);dz=-Math.cos(player.angle||0);}else{dx/=length;dz/=length;}
 return enemies.filter(e=>{if(e.hp<=0||(e.spawnDelay??0)>0)return false;const ex=e.x-player.x,ez=e.z-player.z,d=Math.hypot(ex,ez);return d<=1.45+(e.radius??.32)&&(d<.001||(dx*ex+dz*ez)/d>.4)&&lineOfSight(player.x,player.z,e.x,e.z);});
}
