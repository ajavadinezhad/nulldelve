/** Passage coordinates preserve existing doors and puzzle gates. */
export const LIFT_LINKS=Object.freeze([
 {id:'hospital-service-lift',operation:'hospital',door:19,a:{x:112,z:38},b:{x:112,z:42},duration:1.8},
 {id:'signal-core-lift',operation:'signal',door:35,a:{x:236,z:18},b:{x:236,z:22},duration:2.1},
]);
export const STAIR_PASSAGES=Object.freeze([{x:38,z:18,length:5,width:2.5,height:.55},{x:186,z:20,length:6,width:2.5,height:.65}]);
export function stairHeightAt(x,z){for(const s of STAIR_PASSAGES){const t=(z-s.z)/s.length+.5;if(Math.abs(x-s.x)<s.width/2&&t>0&&t<1)return (1-Math.abs(t*2-1))*s.height;}return 0;}
/** Safety gate closes the entire shaft walking lane, even when its access door is open. */
export function liftWalkBlocked(x,z,r=0,operation,links=LIFT_LINKS){return links.some(link=>link.operation===operation&&Math.abs(x-(link.a.x+link.b.x)/2)<1.5+r&&Math.abs(z-(link.a.z+link.b.z)/2)<.14+r);}
/** Old checkpoints on the newly gated shaft recover to the nearest safe landing. */
export function recoverLiftLanding(player,operation){for(const link of LIFT_LINKS){if(link.operation!==operation||!liftWalkBlocked(player.x,player.z,.32,operation,[link]))continue;const entry=Math.hypot(player.x-link.a.x,player.z-link.a.z)<=Math.hypot(player.x-link.b.x,player.z-link.b.z)?link.a:link.b;Object.assign(player,entry);return true;}return false;}
export function createLiftTransfer({doors,blocked=()=>false,links=LIFT_LINKS}={}){
 let ride=null;
 const ready=link=>{const d=doors?.[link.door];return d?.open&&d.slide>=.95&&!d.progressLocked&&(!d.needsPower||d.unlocked);};
 function nearby(player,operation){if(ride)return null;for(const link of links){if(link.operation!==operation||!ready(link))continue;for(const [entry,exit] of [[link.a,link.b],[link.b,link.a]])if(Math.hypot(player.x-entry.x,player.z-entry.z)<=2.1)return {link,entry,exit};}return null;}
 function cancel(player){if(!ride)return false;Object.assign(player,ride.from);ride=null;return true;}
 return {get active(){return !!ride;},get linkId(){return ride?.link.id??null;},get progress(){return ride?ride.elapsed/ride.link.duration:0;},nearby,
 start(player,operation){const next=nearby(player,operation);if(!next)return false;const from={x:player.x,z:player.z};const steps=Math.ceil(Math.hypot(next.exit.x-from.x,next.exit.z-from.z)/.15);for(let n=0;n<=steps;n++){const t=n/Math.max(1,steps);if(blocked(from.x+(next.exit.x-from.x)*t,from.z+(next.exit.z-from.z)*t,.32))return false;}ride={...next,from,elapsed:0};return true;},
 update(dt,player){if(!ride)return false;if(!ready(ride.link)){cancel(player);return false;}if(!Number.isFinite(dt)||dt<=0)return false;ride.elapsed=Math.min(ride.link.duration,ride.elapsed+dt);const t=ride.elapsed/ride.link.duration,ease=t*t*(3-2*t);player.x=ride.from.x+(ride.exit.x-ride.from.x)*ease;player.z=ride.from.z+(ride.exit.z-ride.from.z)*ease;if(t<1)return false;Object.assign(player,ride.exit);ride=null;return true;},cancel};
}
