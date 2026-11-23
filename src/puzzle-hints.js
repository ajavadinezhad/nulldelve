import {ARTIFACTS} from './progression.js?v=puzzle-visuals-r51';
/** Player-requested hints reveal one layer at a time, only for the nearby puzzle. */
const PUZZLES=[
 {id:'freight-drain',title:'Freight flood control',bounds:[154,171,23,37],unsolved:c=>c.state.operationId==='freight'&&!c.state.operationTasks?.freightDrain},
 ...[[154,171,23,37],[178,195,23,37]].map(bounds=>({id:'freight-track',title:'Freight cargo routing',bounds,unsolved:c=>c.state.operationId==='freight'&&c.state.operationTasks?.freightDrain&&!c.state.operationTasks?.freightDispatch})),

 ...[[104,121,43,62],[104,121,23,37]].map(bounds=>({id:'hospital-power',title:'Hospital emergency supply',bounds,unsolved:c=>c.state.operationId==='hospital'&&!c.state.operationTasks?.hospitalPower})),
 ...[[104,121,4,17],[128,145,4,17]].map(bounds=>({id:'hospital-diagnostics',title:'Quarantine diagnostics',bounds,unsolved:c=>c.state.operationId==='hospital'&&!c.state.operationTasks?.hospitalAuth})),
 ...[[104,121,23,37],[128,145,23,37]].map(bounds=>({id:'hospital-sterilization',title:'Theatre sterilization',bounds,unsolved:c=>c.state.operationId==='hospital'&&c.state.operationTasks?.hospitalAuth&&!c.state.operationTasks?.hospitalSterile})),
 {id:'insertion',title:'Insertion door',bounds:[2,14,21,32],unsolved:c=>!c.puzzle?.solved},
 {id:'archive',title:'Archive cipher',bounds:[2,14,4,16],unsolved:c=>!c.state.archive?.solved},
 {id:'relay',title:'Security relay link',bounds:[18,29,4,16],unsolved:c=>!c.state.relay?.completed},
 {id:'power',title:'Reactor routing',bounds:[51,69,23,38],unsolved:c=>!c.state.power?.solved},
 {id:'valves',title:'Containment pressure',bounds:[75,97,23,38],unsolved:c=>!c.state.valves?.solved},
 {id:'service-fuse',title:'Maintenance service fuse',bounds:[2,20,43,63],unsolved:c=>c.state.operationId==='command'&&!c.state.operationTasks?.commandFuse},
 ...[[25,45,43,63],[33,45,21,32],[33,45,4,21]].map(bounds=>({id:'generator-repair',title:'Power House cable route',bounds,unsolved:c=>c.state.operationId==='command'&&!c.state.operationTasks?.commandRepair})),
 {id:'coolant-purge',title:'Transit coolant purge',bounds:[51,69,43,63],unsolved:c=>c.state.operationId==='research'&&!c.state.operationTasks?.researchCoolant},
 {id:'evac-power',title:'Evacuation power',bounds:[75,97,43,63],unsolved:c=>c.state.operationId==='containment'&&!c.state.operationTasks?.evacPower},
 {id:'nest-signal-a',title:'Nest signal route',bounds:[51,69,43,63],unsolved:c=>c.state.operationId==='nest'&&!c.state.operationTasks?.nestRelay?.linked},
 {id:'nest-signal-b',title:'Containment signal link',bounds:[75,97,23,38],unsolved:c=>c.state.operationId==='nest'&&!c.state.operationTasks?.nestRelay?.linked},
 {id:'nest-decoder',title:'Nest shield decoder',bounds:[51,69,4,18],unsolved:c=>c.state.operationId==='nest'&&!c.state.operationTasks?.nestRelay?.decoded},

 ...[
  {id:'artifact-archive',title:'Etched Archive relic',bounds:[2,14,4,16]},
  {id:'artifact-generator',title:'Generator core relic',bounds:[25,45,43,63]},
  {id:'artifact-containment',title:'Containment seal relic',bounds:[75,97,23,38]},
 ].map(entry=>({...entry,unsolved:c=>Array.isArray(c.state.artifacts)&&!c.state.artifacts.includes(entry.id)})),

];
function contextValues(context={}){return {...context,state:context.progression?.state??context.progression??{}};}
function nearbyPuzzle(context){const c=contextValues(context),p=c.player;if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.z))return null;const local=PUZZLES.find(entry=>{const [x0,x1,z0,z1]=entry.bounds;return p.x>=x0&&p.x<=x1&&p.z>=z0&&p.z<=z1&&entry.unsolved(c);});if(local)return local;if(Array.isArray(c.state.artifacts)&&[[71,10],[86,20]].some(([x,z])=>Math.hypot(p.x-x,p.z-z)<6)){const missing=ARTIFACTS.find(a=>!c.state.artifacts.includes(a.id));return PUZZLES.find(entry=>entry.id===missing?.id)??null;}return null;}
/** Clues describe observation and feedback, never an input order, setting or location. */
const CLUES={
 'insertion':['The doorway and nearby equipment share a power state.','Compare how the indicators respond when something changes in the room.','Try one change at a time. A steady ready indicator confirms the room is supplying what the door needs.'],
 'archive':['The symbols belong to a mechanism with memory.','Watch whether an attempt advances or resets the status indicator.','Use the room’s environmental clues to form a hypothesis, then test it from a fresh attempt.'],
 'relay':['The equipment stores a charge only briefly.','Observe what changes after activating a station, then scout before trying again.','A failed attempt is safe to repeat. A clear route matters as much as the controls.'],
 'power':['Look at how the consoles connect to the room’s machinery.','Watch the common status indicator after each deliberate input.','Compare the room’s physical clues with the result of your attempt; do not assume the consoles’ names specify an order.'],
 'valves':['Pressure changes may require more than one adjustment.','Observe the shared response, rather than treating a valve’s label as an instruction.','Test a repeatable hypothesis from a fresh attempt and compare the result.'],
 'generator-repair':['The damaged cable belongs to a larger supply system.','An unpowered cable cannot show a complete route. Inspect the supply and the physical connections.','At a junction, compare the cable entering it with the arms you can see. Readiness is confirmed only by the completed system.'],
 'service-fuse':['The machinery is missing a service component.','Look for equipment that can be inspected in the areas you have reached.','Track what you have recovered and return to a compatible service interface.'],
 'freight-drain':['The flooded route depends on machinery.','Stabilize the area and inspect the machinery’s state.','A blocked route may change after a nearby system has been made safe.'],
 'freight-track':['The track points determine where cargo can travel.','Trace the physical rails and observe each switch’s current orientation.','Form a route hypothesis before dispatching. A rejected attempt means the complete route is not ready.'],
 'hospital-power':['The emergency supply is incomplete.','Inspect reachable service equipment for a compatible part.','A recovered component must be used at the equipment it can repair.'],
 'hospital-diagnostics':['The sealed department depends on the sample’s condition.','Inspect the workstations and watch which functions become available.','Secure the area before attempting a procedure; distinguish a missing sample from an incomplete check.'],
 'hospital-sterilization':['The pressure controls affect a shared interlock.','Watch the instruments and the cycle’s accepted or rejected state.','Change one condition at a time before testing the complete configuration. A running cycle must finish before adjustment.'],
 'coolant-purge':['The lower route is tied to the research equipment’s safety state.','Look for a service interface after the surrounding systems are stable.','A system may require both a repair and a safe area before it can complete its cycle.'],
 'evac-power':['The evacuation route has lost its supply.','Inspect the reachable service equipment once the department is safe.','Watch whether the supply reports incomplete conditions or an active recovery cycle.'],
 'nest-signal-a':['The shield is connected to equipment beyond this room.','Scout accessible routes and observe how long a stored signal remains active.','Plan a clear path before beginning a timed attempt. Repeating the attempt does not require guessing a letter order.'],
 'nest-signal-b':['This station can receive a signal from elsewhere.','Observe its state and compare it with other stations you have encountered.','Reach a receiving station while a source is still active; scout first if the charge keeps fading.'],
 'nest-decoder':['The entrance has more than one independent lock condition.','Watch whether a change affects the signal barrier or the physical seal.','A disabled signal does not necessarily mean the seal is ready. Inspect which conditions remain incomplete.'],
 'artifact-archive':['The seal’s markings recur in the facility’s older objects.','Look closely at reachable objects after stabilizing a department.','Compare what you have collected with the seal’s remaining empty sockets.'],
 'artifact-generator':['The seal’s markings recur around the facility’s machinery.','Look closely at reachable objects after stabilizing a department.','Compare what you have collected with the seal’s remaining empty sockets.'],
 'artifact-containment':['The seal’s markings recur around the containment equipment.','Look closely at reachable objects after stabilizing a department.','Compare what you have collected with the seal’s remaining empty sockets.']
};
function processHint(entry,context,stage){
 const tasks=contextValues(context).state.operationTasks;
 if(entry.id==='generator-repair'&&tasks?.genInserted&&tasks?.generatorDefense&&!tasks.generatorDefense.completed){
  if(tasks.generatorDefense.jammed)return ['The supply’s restart is interrupted.','Inspect the supply interface and observe its fault state.','A stalled restart needs attention at its service equipment before a cable route can carry power.'][stage];
  return ['The supply is still stabilizing.','Observe whether restart progress continues when you leave the equipment.','A clear room and a completed restart are separate conditions; watch the progress indicator.'][stage];
 }
 if(entry.id==='freight-track'&&tasks?.freightRoute?.running)return 'Cargo is moving. The switches remain locked until the transfer finishes.';
 return (CLUES[entry.id]??['Inspect the mechanism.','Observe the result of one change.','Use the local clues to test a different hypothesis.'])[stage];
}
export function createPuzzleHints(){
 const requests=new Map();
 const get=context=>{const entry=nearbyPuzzle(context);if(!entry)return {id:null,title:'Puzzle hint',available:false,text:'Explore a puzzle room to request a clue.',stage:0};const stage=Math.min(2,requests.get(entry.id)??0);return {id:entry.id,title:entry.title,available:true,text:processHint(entry,context,stage),stage};};
 return {get,request(context){const hint=get(context);if(hint.available)requests.set(hint.id,Math.min(2,hint.stage+1));return hint;},reset(id){if(id===undefined)requests.clear();else requests.delete(id);}};
}
