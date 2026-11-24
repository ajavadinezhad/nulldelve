/** Optional service recesses and local return loops never join separate progression rooms. */
export const EXPLORATION_ALCOVES=Object.freeze([
 {id:'hospital-linen',operation:'hospital',name:'LINEN SERVICE RECESS',room:{x:110,z:1,w:5,h:2},neck:{x:111,z:3,w:3,h:2},cache:{x:112,z:1.8},event:{x:112,z:4.1,kind:'steam',duration:3.2}},
 {id:'freight-manifest',operation:'freight',name:'COLD STORAGE RECESS',room:{x:186,z:1,w:5,h:2},neck:{x:187,z:3,w:3,h:2},cache:{x:188,z:1.8},event:{x:188,z:4.1,kind:'dust',duration:2.8}},
 {id:'signal-receiver',operation:'signal',name:'RECEIVER SERVICE RECESS',room:{x:236,z:1,w:5,h:2},neck:{x:237,z:3,w:3,h:2},cache:{x:238,z:1.8},event:{x:238,z:4.1,kind:'relay',duration:3.5}},
].map(value=>Object.freeze({...value,room:Object.freeze(value.room),neck:Object.freeze(value.neck),cache:Object.freeze(value.cache),event:Object.freeze(value.event)})));
export const EXPLORATION_ROOMS=Object.freeze(EXPLORATION_ALCOVES.map(site=>Object.freeze({...site.room,name:site.name,operation:site.operation})));
// Each release belongs to an existing durable cache claim, so checkpoint/replay
// cannot repeat its cash and cannot forget an opened route. Both ends stay in
// the same arena: these loops never bypass a powered or combat-locked door.
export const EXPLORATION_SHORTCUTS=Object.freeze([
 {id:'shortcut.hospital.linen',operation:'hospital',reward:'secret.hospital.linen',gate:{x:107,z:2,axis:'z'},floor:[[100,1,12,3],[100,1,3,16],[100,14,7,3]],returnPoint:{x:105,z:15}},
 {id:'shortcut.freight.manifest',operation:'freight',reward:'secret.freight.manifest',gate:{x:183,z:30,axis:'z'},floor:[[190,1,9,3],[196,1,3,16],[193,14,6,3],[182,29,4,3]],returnPoint:{x:194,z:15}},
 {id:'shortcut.signal.receiver',operation:'signal',reward:'secret.signal.receiver',gate:{x:236,z:50,axis:'x'},floor:[[240,1,10,3],[247,1,3,16],[243,14,7,3],[235,48,3,6],[235,51,9,3],[241,51,3,8]],returnPoint:{x:244,z:16}},
].map(value=>Object.freeze({...value,gate:Object.freeze(value.gate),floor:Object.freeze(value.floor.map(Object.freeze)),returnPoint:Object.freeze(value.returnPoint)})));
export function explorationReleaseForReward(id){return EXPLORATION_SHORTCUTS.find(shortcut=>shortcut.reward===id)??null;}
export function explorationShortcutBlocked(x,z,r=0,{operation,claimed=()=>false}={}){
 return EXPLORATION_SHORTCUTS.some(shortcut=>(!operation||shortcut.operation===operation)&&!claimed(shortcut.reward)&&Math.abs(x-shortcut.gate.x)<(shortcut.gate.axis==='x'?1.5:.16)+r&&Math.abs(z-shortcut.gate.z)<(shortcut.gate.axis==='x'?.16:1.5)+r);
}

export const EXPLORATION_CACHES=Object.freeze(EXPLORATION_ALCOVES.map((site,index)=>Object.freeze({id:['secret.hospital.linen','secret.freight.manifest','secret.signal.receiver'][index],operation:site.operation,...site.cache,amount:[18,22,24][index],label:'Service release and recovered cash'})));
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
export function carveExploration(carve,operation){for(const site of EXPLORATION_ALCOVES){if(operation&&site.operation!==operation)continue;for(const r of [site.room,site.neck])carve(r.x,r.z,r.w,r.h);}for(const shortcut of EXPLORATION_SHORTCUTS){if(operation&&shortcut.operation!==operation)continue;for(const rect of shortcut.floor)carve(...rect);}}
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

/** Observable consequences of the evidence chain; no reward or collision state. */
export const WORLD_REVEALS=Object.freeze([
 {id:'command-backup',operation:'command',task:'commandBackup',x:42,z:29,kind:'uplink'},
 {id:'research-specimen',operation:'research',task:'researchSample',x:64,z:13,kind:'specimen'},
 {id:'hospital-cargo',operation:'hospital',task:'hospitalRecords',x:142,z:60,kind:'cargo'},
 {id:'freight-origin',operation:'freight',task:'freightManifest',x:191,z:7,kind:'cargo'},
 {id:'signal-silenced',operation:'signal',task:'signalShutdown',x:237,z:34,kind:'antenna'},
 {id:'signal-evidence',operation:'signal',task:'signalSent',x:237,z:8,kind:'uplink'},
].map(Object.freeze));

/** Nest's old service corridors become briefly live conduits after charging the
 * transmitter. These safety shutters do not deal damage or create rewards. */
export const NEST_CONDUIT_GATES=Object.freeze([
 {id:'nest-transfer-conduit',x:71,z:52,axis:'z',stage:'charged',phase:0},
 {id:'nest-lab-conduit',x:59,z:20,axis:'x',stage:'linked',phase:1.1},
].map(Object.freeze));
export function nestConduitState(gate,{operation,tasks={},elapsed=0,player}={}){
 const relay=tasks.nestRelay,live=operation==='nest'&&!relay?.decoded&&(gate.stage==='charged'?relay?.started&&!relay?.linked:relay?.linked);
 if(!live)return {live:false,closed:false,warning:false};
 const phase=((Math.max(0,Number(elapsed)||0)+gate.phase)%4.8+4.8)%4.8;
 // A shutter cannot close around someone already crossing its narrow seam.
 const normal=gate.axis==='x'?'z':'x',across=normal==='x'?'z':'x';
 const crossing=player&&Math.abs(player[normal]-gate[normal])<.41&&Math.abs(player[across]-gate[across])<1.8;
 return {live:true,closed:!crossing&&phase>=4.05,warning:!crossing&&phase>=3.45&&phase<4.05};
}
export function nestConduitBlocked(x,z,r=0,context={}){
 return NEST_CONDUIT_GATES.some(gate=>nestConduitState(gate,context).closed&&Math.abs(x-gate.x)<(gate.axis==='x'?1.5:.1)+r&&Math.abs(z-gate.z)<(gate.axis==='x'?.1:1.5)+r);
}
