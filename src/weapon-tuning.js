/** Family-specific improvements: rapid fire and pellets do not multiply a flat +1. */
const DAMAGE={rifle:[1,.75,.75],smg:[.5,.5,.5],shotgun:[.75,.75,.75],marksman:[2,2,2],lmg:[.6,.6,.6],hush:[1,1,1],scattergun:[.75,.75,.75],kestrel:[1,1,1],mantis:[4,4,4],jackal:[2,2,2],vesper:[.5,.5,.5],lancet:[1.5,1.5,1.5],orison:[.75,.75,.75],pistol:[1,1,1]};
const RELOAD={rifle:.22,smg:.14,shotgun:.25,marksman:.25,lmg:.45,hush:.22,scattergun:.28,kestrel:.35,mantis:.4,jackal:.3,vesper:.28,lancet:.25,orison:.2,pistol:.18};
export function damageStep(type,rank){return (DAMAGE[type]??DAMAGE.rifle)[Math.max(0,Math.min(2,rank))];}
export function damageBonus(type,rank){return Array.from({length:Math.max(0,Math.min(3,rank))},(_,i)=>damageStep(type,i)).reduce((a,b)=>a+b,0);}
export function reloadStep(type){return RELOAD[type]??.18;}
const PENETRATION={marksman:.75,mantis:1,lancet:.85,jackal:.65,hush:.4,kestrel:.35};
/** Shells face forward; a readable rear approach bypasses armor. */
export function projectileDamage(gun,enemy,origin,damage=gun.damage){
 if(!Number.isFinite(damage)||damage<=0)return 0;
 const armor={brute:.12,charger:.15,sentinel:.35,boss:.2}[enemy.variant]??0;
 if(!armor)return damage;
 const angle=enemy.mesh?.rotation?.y??enemy.angle;
 const dx=origin?.x-enemy.x,dz=origin?.z-enemy.z,d=Math.hypot(dx,dz);
 const behind=Number.isFinite(angle)&&d>0&&(-Math.sin(angle)*dx-Math.cos(angle)*dz)/d<-.35;
 if(behind)return damage*1.2;
 return damage*(1-armor*(1-(PENETRATION[gun.id]??0)));
}
