import {FREIGHT_ROOMS} from './freight-layout.js?v=critic-fixes-r54';
import {SIGNAL_ROOMS} from './signal-layout.js?v=critic-fixes-r54';
/** Recover legacy checkpoints inside reshaped rooms without crossing a sector gate. */
export function recoverWorldPosition(player,{operation,blocked=()=>false,radius=.32}={}){
 if(!player||!Number.isFinite(player.x)||!Number.isFinite(player.z)||!blocked(player.x,player.z,radius))return false;
 const rooms=operation==='freight'?FREIGHT_ROOMS.slice(0,5):operation==='signal'?SIGNAL_ROOMS.slice(0,5):[];
 const room=rooms.find(r=>player.x>=r.x&&player.x<r.x+r.w&&player.z>=r.z&&player.z<r.z+r.h);if(!room)return false;
 let nearest=null,distance=Infinity;
 for(let z=room.z+1;z<room.z+room.h-1;z++)for(let x=room.x+1;x<room.x+room.w-1;x++){
  const d=Math.hypot(player.x-x,player.z-z);if(d>=distance||blocked(x,z,radius))continue;nearest={x,z};distance=d;
 }
 if(!nearest)return false;Object.assign(player,nearest);return true;
}
