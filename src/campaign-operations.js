import {OPERATION_ROUTES,operationRouteComplete} from './operation-routes.js?v=rotation-r14';
import {WIRE_SOLUTION,createWireCircuit} from './wire-circuit.js?v=rotation-r14';
import {progressionSequences,createOperationTasks,ARTIFACTS} from './progression.js?v=rotation-r14';
/** Facility operation map. x/y are percentages on the ruined-site map, not world coordinates. */
export const CAMPAIGN_OPERATIONS=Object.freeze([
 {id:'breach',name:'Breach',description:'Restore access through Archive and Security, then survive Storage to reach the command wing.',x:18,y:73},
 {id:'command',name:'Command',description:'Clear Command, recover a Maintenance fuse, and restart the Power House to reopen the Bio Lab route.',x:35,y:49},
 {id:'research',name:'Research',description:'Secure Bio Lab, restore Reactor power, and purge Transit to reach Containment.',x:54,y:64},
 {id:'containment',name:'Containment',description:'Stabilize Containment and restore Evacuation power before approaching the sealed Nest.',x:71,y:43},
 {id:'nest',name:'Nest & evacuation',description:'Break the Nest’s locks, destroy its core, recover the research intel, and evacuate.',x:84,y:20},
].map(Object.freeze));
const definitions={
 breach:{spawn:[7,29],prior:[],zones:['security','storage']},
 command:{spawn:[35,13],prior:['security','storage'],zones:['command','generator']},
 research:{spawn:[59,10],prior:['security','storage','command','generator'],zones:['lab','reactor','transit']},
 containment:{spawn:[86,30],prior:['security','storage','command','generator','lab','reactor','transit'],zones:['containment','evacuation']},
 nest:{spawn:[59,52],prior:['security','storage','command','generator','lab','reactor','transit','containment','evacuation'],zones:['nest']},
};
export function normalizeCampaignOperation(value){return typeof value==='string'&&Object.hasOwn(definitions,value)?value:null;}
/** Apply a direct deployment before play starts. Other operation hordes remain dormant. */
export function deployCampaignOperation(value,{player,puzzle,progression,doors}){
 const id=normalizeCampaignOperation(value);if(!id)return false;
 const definition=definitions[id],snapshot=progression.serializeState(),sequences=progressionSequences(snapshot.remix);
 snapshot.mission='campaign';snapshot.operationId=id;snapshot.operationTasks=createOperationTasks();snapshot.milestone=0;snapshot.operationZoneIds=[...definition.zones];
 if(definition.prior.includes('generator'))Object.assign(snapshot.operationTasks,{commandFuse:true,genInserted:true,commandRepair:true});
 if(definition.prior.includes('transit'))snapshot.operationTasks.researchCoolant=true;
 if(definition.prior.includes('evacuation'))snapshot.operationTasks.evacPower=true;
 snapshot.circuit=definition.prior.includes('generator')?{rotations:[...WIRE_SOLUTION],powered:true,solved:true}:createWireCircuit();
 snapshot.elapsed=0;snapshot.logs=[];snapshot.evacuation={started:false,remaining:20,completed:false};
 const beyondBreach=id!=='breach',powerReady=['containment','nest'].includes(id),valvesReady=id==='nest';
 snapshot.archive={input:beyondBreach?[...sequences.archive]:[],solved:beyondBreach};
 snapshot.relay={started:false,remaining:0,completed:beyondBreach};
 snapshot.archiveEntered=beyondBreach;snapshot.securityEntered=beyondBreach;
 snapshot.power={input:powerReady?[...sequences.power]:[],solved:powerReady};
 snapshot.valves={input:valvesReady?[...sequences.valves]:[],solved:valvesReady};
 for(const zone of snapshot.zones){const cleared=definition.prior.includes(zone.id);zone.status=cleared?'cleared':'dormant';zone.spawned=cleared?progression.state.zones.find(z=>z.id===zone.id).total:0;zone.queue=[];zone.waveIds=[];zone.waveVariants=[];zone.spawnTimer=0;}
 if(!progression.restoreState(snapshot,new Map()))return false;
 puzzle.solved=beyondBreach;
 puzzle.plates.forEach((plate,index)=>{plate.active=beyondBreach;const crate=puzzle.crates[index];if(beyondBreach&&crate){crate.x=plate.x;crate.z=plate.z;crate.seated=true;}});
 if(doors[0])doors[0].unlocked=beyondBreach;
 player.x=definition.spawn[0];player.z=definition.spawn[1];player.intel=false;
 return true;
}
export function campaignOperationObjectivesComplete(value,{player,progression}){
 const id=normalizeCampaignOperation(value);if(!id)return false;
 const state=progression.state??progression,cleared=name=>state.zones.find(z=>z.id===name)?.status==='cleared';
 const tasks=state.operationTasks??createOperationTasks();
 if(!operationRouteComplete(id,tasks))return false;
 if(id==='breach')return cleared('security')&&cleared('storage');
 if(id==='command')return cleared('command')&&cleared('generator')&&tasks.commandFuse&&tasks.commandRepair;
 if(id==='research')return cleared('lab')&&cleared('reactor')&&!!state.power?.solved&&tasks.researchCoolant&&cleared('transit');
 if(id==='containment')return cleared('containment')&&!!state.valves?.solved&&tasks.evacPower&&cleared('evacuation');
 return state.artifacts?.length===3&&tasks.nestRelay.decoded&&cleared('nest')&&!!player.intel;
}

const EXITS={breach:{x:41,z:29,label:'Extraction sector exit',direction:'Leave Storage east through its door into Extraction'},command:{x:49,z:10,label:'Powered Bio Lab exit',direction:'Follow the yellow cable north through Extraction and Command, then east through the powered Bio Lab doorway'},research:{x:73,z:52,label:'Eastern Transit exit',direction:'Head east from Transit toward the Evacuation corridor'},containment:{x:86,z:42,label:'Containment return exit',direction:'Return north from Evacuation toward the Containment corridor'},nest:{x:92,z:60,label:'Evacuation pad',direction:'Leave Nest Core south through Containment, then continue southeast to Evacuation'}};
export function campaignOperationExit(value){const id=normalizeCampaignOperation(value);return id?{...EXITS[id]}:null;}
export function campaignOperationComplete(value,context){const exit=campaignOperationExit(value);return !!exit&&campaignOperationObjectivesComplete(value,context)&&Math.hypot(context.player.x-exit.x,context.player.z-exit.z)<=1.4;}

export function campaignOperationGuidance(value,{player,puzzle,progression}){
 const id=normalizeCampaignOperation(value);if(!id)return null;
 const state=progression.state??progression,cleared=name=>state.zones.find(z=>z.id===name)?.status==='cleared';
 const tasks=state.operationTasks??createOperationTasks();
 const step=(label,done,hint)=>({label,done:!!done,hint});let steps;
 if(id==='breach')steps=[step('Power the insertion door',puzzle.solved,''),step('Decode the Archive',state.archive.solved,''),step('Link the Security relays',state.relay.completed,''),step('Clear the Security purge',cleared('security'),'Defeat every Security reinforcement.'),step('Survive the Storage ambush',cleared('storage'),'Head south from Security through its corridor into Storage and clear the ambush.')];
 if(id==='command')steps=[step('Defeat the Command mutation',cleared('command'),'Clear Command before entering its southern maintenance route.'),step('Recover the Maintenance fuse',tasks.commandFuse,'Go south through Extraction and Generator, then west to Maintenance. Find its service fuse.'),step('Insert the Generator fuse',tasks.genInserted,'Return east to Generator and fit the service fuse at its central repair console.'),step('Defend the Power House restart',cleared('generator'),'Eliminate the restart swarm inside Generator before routing power.'),step('Connect the cross-room yellow cable',tasks.commandRepair,'')];
 if(id==='research')steps=[step('Clear Bio Lab',cleared('lab'),'Eliminate the Bio Lab outbreak.'),step('Clear the Reactor swarm',cleared('reactor'),'Go south from Bio Lab and clear Reactor.'),step('Restore Reactor power',state.power.solved,''),step('Start the Transit coolant purge',tasks.researchCoolant,'Go south from Reactor into Transit and activate the central coolant console.'),step('Defend the Transit purge',cleared('transit'),'Clear the coolant purge swarm to open the eastern Transit exit.')];
 if(id==='containment')steps=[step('Clear the Containment breach',cleared('containment'),'Defeat every Containment reinforcement.'),step('Release the pressure lock',state.valves.solved,''),step('Restore Evacuation power',tasks.evacPower,'Head south into Evacuation. Restore its power at the eastern service console.'),step('Clear the Evacuation lockdown',cleared('evacuation'),'Survive the power restart lockdown before returning north.')];
 if(id==='nest')steps=[step('Find the three socket relics',state.artifacts?.length===3,`The Nest seal has three sockets; ${state.artifacts?.length??0} are filled. Revisit stabilized sectors and look for matching markings. Request a puzzle hint if you need a lead.`),step('Charge the Transit signal relay',tasks.nestRelay.started||tasks.nestRelay.linked,'Find relay A in northwest Transit. Prepare a route east through Evacuation and north to Containment.'),step('Link the Containment relay',tasks.nestRelay.linked,tasks.nestRelay.started?`Reach relay B in southwest Containment within ${Math.ceil(tasks.nestRelay.remaining)} seconds.`:'Charge Transit relay A, then reach Containment relay B within thirty seconds.'),step('Decode the Nest shield',tasks.nestRelay.decoded,'Reach Bio Lab through Reactor and use the decoder near the center of the room.'),step('Destroy the Nest Core',cleared('nest'),'Enter Nest Core east of Bio Lab. Defeat the mutation and every reinforcement.'),step('Recover the research intel',player.intel,'Collect the cyan intel in the northeast of Nest Core.')];
 for(const route of OPERATION_ROUTES.filter(route=>route.operation===id))steps.push(step(route.label.toLowerCase(),tasks[route.task],route.hint));
 const exit=campaignOperationExit(id);steps.push(step(id==='nest'?'Reach Evacuation':'Reach sector exit',false,`${exit.direction}. Press Interact at the marked ${exit.label.toLowerCase()} to depart.`));
 const objectivesDone=campaignOperationObjectivesComplete(id,{player,progression:state});
 const next=steps.find(s=>!s.done),battle=state.zones.find(z=>z.status==='active');
 return {title:objectivesDone?(id==='nest'?'Reach Evacuation':'Reach sector exit'):battle?`Clear ${battle.label.toLowerCase()}`:next?.label??'Operation complete',hint:objectivesDone?`${exit.direction}. Press Interact at the marked ${exit.label.toLowerCase()}.`:battle?`${battle.remaining} creatures remain, including reinforcements.`:next?.hint??'All operation objectives completed.',steps:steps.map(({label,done})=>({label,done}))};
}

export function isCampaignOperationUnlocked(id,completed=[]){const index=CAMPAIGN_OPERATIONS.findIndex(op=>op.id===id);return index>=0&&CAMPAIGN_OPERATIONS.slice(0,index).every(op=>completed.includes(op.id));}
