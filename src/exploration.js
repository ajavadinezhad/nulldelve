/** Optional, one-entry service recesses. Nothing links separate progression rooms. */
export const EXPLORATION_ALCOVES=Object.freeze([
 {id:'hospital-linen',operation:'hospital',name:'LINEN SERVICE RECESS',room:{x:110,z:1,w:5,h:2},neck:{x:111,z:3,w:3,h:2},cache:{x:112,z:1.8},event:{x:112,z:4.1,kind:'steam',duration:3.2}},
 {id:'freight-manifest',operation:'freight',name:'COLD STORAGE RECESS',room:{x:186,z:1,w:5,h:2},neck:{x:187,z:3,w:3,h:2},cache:{x:188,z:1.8},event:{x:188,z:4.1,kind:'dust',duration:2.8}},
 {id:'signal-receiver',operation:'signal',name:'RECEIVER SERVICE RECESS',room:{x:236,z:1,w:5,h:2},neck:{x:237,z:3,w:3,h:2},cache:{x:238,z:1.8},event:{x:238,z:4.1,kind:'relay',duration:3.5}},
].map(value=>Object.freeze({...value,room:Object.freeze(value.room),neck:Object.freeze(value.neck),cache:Object.freeze(value.cache),event:Object.freeze(value.event)})));
export const EXPLORATION_ROOMS=Object.freeze(EXPLORATION_ALCOVES.map(site=>Object.freeze({...site.room,name:site.name,operation:site.operation})));
export const EXPLORATION_CACHES=Object.freeze(EXPLORATION_ALCOVES.map((site,index)=>Object.freeze({id:['secret.hospital.linen','secret.freight.manifest','secret.signal.receiver'][index],operation:site.operation,...site.cache,amount:[18,22,24][index],label:'Recovered service cash'})));
// These beats activate on approach, never reveal fog, and stay spent after checkpoints.
const ROUTE_EVENTS=[
 {id:'breach-falling-dust',operation:'breach',x:23,z:18,kind:'dust',duration:3},
 {id:'command-supply-fault',operation:'command',x:38,z:28,kind:'relay',duration:3.5},
 {id:'command-pipe-vent',operation:'command',x:35,z:42,kind:'steam',duration:4},
 {id:'research-transfer-dust',operation:'research',x:59,z:19,kind:'dust',duration:3.2},
 {id:'research-coolant-vent',operation:'research',x:59,z:41,kind:'steam',duration:4.2},
 {id:'containment-airlock-vent',operation:'containment',x:86,z:42,kind:'steam',duration:4},
 {id:'nest-return-fault',operation:'nest',x:86,z:24,kind:'relay',duration:3.5},
 {id:'hospital-gallery-dust',operation:'hospital',x:125,z:66,kind:'dust',duration:4},
 {id:'freight-track-dust',operation:'freight',x:186,z:20,kind:'dust',duration:3.5},
 {id:'signal-lift-fault',operation:'signal',x:236,z:18,kind:'relay',duration:3.8},
];
export const EXPLORATION_EVENTS=Object.freeze([...EXPLORATION_ALCOVES.map(site=>({id:'exploration.'+site.id,operation:site.operation,...site.event})),...ROUTE_EVENTS].map(Object.freeze));
export function carveExploration(carve,operation){for(const site of EXPLORATION_ALCOVES){if(operation&&site.operation!==operation)continue;for(const r of [site.room,site.neck])carve(r.x,r.z,r.w,r.h);}}
export function nearbyExplorationCache(player,{operation,claimed=()=>false,visible=()=>false}={}){
 if(!player)return null;
 return EXPLORATION_CACHES.find(cache=>cache.operation===operation&&!claimed(cache.id)&&visible(cache.x,cache.z)&&Math.hypot(cache.x-player.x,cache.z-player.z)<=1.4)??null;
}
/** One-shot atmosphere only: no damage, collision, puzzle state, or reward mutation. */
export function createExplorationEvents(){
 const seen=new Set(),active=new Map();
 const views=()=>[...active.values()].map(({event,elapsed})=>({...event,progress:Math.min(1,elapsed/event.duration)}));
 return {update(dt,{player,operation,visible=()=>false,enabled=true}={}){
  const started=[];
  if(enabled&&Number.isFinite(dt)&&dt>=0){
   for(const [id,state]of active){state.elapsed=Math.min(state.event.duration,state.elapsed+dt);if(state.elapsed>=state.event.duration)active.delete(id);}
   if(player)for(const event of EXPLORATION_EVENTS){if(event.operation!==operation||seen.has(event.id)||!visible(event.x,event.z)||Math.hypot(event.x-player.x,event.z-player.z)>3.5)continue;seen.add(event.id);active.set(event.id,{event,elapsed:0});started.push(event.id);}
  }
  return {started,active:views()};
 },serialize(){return {version:1,seen:[...seen]};},restore(value){if(value?.version!==1||!Array.isArray(value.seen))return false;const valid=new Set(EXPLORATION_EVENTS.map(e=>e.id));for(const id of value.seen)if(valid.has(id))seen.add(id);active.clear();return true;},reset(){seen.clear();active.clear();}};
}
