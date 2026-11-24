import {OPERATION_ROUTES,operationRouteComplete} from './operation-routes.js?v=operator-profile-r58';
import {WIRE_SOLUTION,createWireCircuit} from './wire-circuit.js?v=operator-profile-r58';
import {progressionSequences,createOperationTasks,ARTIFACTS,SIGNAL_TASKS,FREIGHT_TASKS,HOSPITAL_TASKS} from './progression.js?v=operator-profile-r58';
/** Facility operation map. x/y are percentages on the ruined-site map, not world coordinates. */
export const CAMPAIGN_OPERATIONS=Object.freeze([
 {id:'breach',name:'Breach',description:'Restore access through Archive and Security, then survive Storage to reach the command wing.',x:18,y:73},
 {id:'command',name:'Command',description:'Clear Command, recover a Maintenance fuse, and restart the Power House to reopen the Bio Lab route.',x:35,y:49},
 {id:'research',name:'Research',description:'Secure Bio Lab, restore Reactor power, and purge Transit to reach Containment.',x:54,y:64},
 {id:'containment',name:'Containment',description:'Stabilize Containment and restore Evacuation power before approaching the sealed Nest.',x:71,y:43},
 {id:'nest',name:'Nest & evacuation',description:'Break the Nest’s locks, destroy its core, recover the research intel, and evacuate.',x:84,y:20},
 {id:'hospital',name:'Silent hospital',description:'Restore emergency power, authenticate a quarantined sample, sterilize Surgery and recover the hospital patient ledger.',x:82,y:82},
 {id:'freight',name:'Flooded freight',description:'Drain the transfer route, reroute a quarantined cargo trolley and recover the cold-chain shipping manifest.',x:55,y:23},
 {id:'signal',name:'Dead Signal',description:'Balance the communications feeders, isolate the colony antennas and transmit the experiment records beyond the facility.',x:31,y:19},
].map(Object.freeze));
const definitions={
 signal:{spawn:[212,57],prior:['security','storage','command','generator','lab','reactor','transit','containment','evacuation','nest','hospital-triage','hospital-ward','hospital-isolation','freight-pumps','freight-yard','freight-cold'],zones:['signal-yard','signal-relay','signal-uplink']},
 breach:{spawn:[7,29],prior:[],zones:['security','storage']},
 command:{spawn:[41,29],prior:['security','storage'],zones:['command','generator']},
 research:{spawn:[49,10],prior:['security','storage','command','generator'],zones:['lab','reactor','transit']},
 containment:{spawn:[73,52],prior:['security','storage','command','generator','lab','reactor','transit'],zones:['containment','evacuation']},
 freight:{spawn:[162,57],prior:['security','storage','command','generator','lab','reactor','transit','containment','evacuation','nest','hospital-triage','hospital-ward','hospital-isolation'],zones:['freight-pumps','freight-yard','freight-cold']},
 hospital:{spawn:[112,56],prior:['security','storage','command','generator','lab','reactor','transit','containment','evacuation','nest'],zones:['hospital-triage','hospital-ward','hospital-isolation']},
 nest:{spawn:[86,42],prior:['security','storage','command','generator','lab','reactor','transit','containment','evacuation'],zones:['nest']},
};
export function normalizeCampaignOperation(value){return typeof value==='string'&&Object.hasOwn(definitions,value)?value:null;}
/** Apply a direct deployment before play starts. Other operation hordes remain dormant. */
export function deployCampaignOperation(value,{player,puzzle,progression,doors,continuing=false}){
 const id=normalizeCampaignOperation(value);if(!id)return false;
 const definition=definitions[id],snapshot=progression.serializeState(),sequences=progressionSequences(snapshot.remix),previousTasks=continuing?structuredClone(snapshot.operationTasks):null,previousCircuit=continuing?structuredClone(snapshot.circuit):null;
 snapshot.mission='campaign';snapshot.operationId=id;snapshot.operationTasks=createOperationTasks();snapshot.milestone=0;snapshot.operationZoneIds=[...definition.zones];
 if(definition.prior.includes('generator'))Object.assign(snapshot.operationTasks,{commandFuse:true,genInserted:true,commandRepair:true});
 if(definition.prior.includes('transit'))snapshot.operationTasks.researchCoolant=true;
 if(definition.prior.includes('evacuation'))snapshot.operationTasks.evacPower=true;
 snapshot.circuit=definition.prior.includes('generator')?(previousTasks?.commandRepair&&previousCircuit?.solved?previousCircuit:{rotations:[...WIRE_SOLUTION],powered:true,solved:true}):createWireCircuit();
 snapshot.elapsed=0;snapshot.operationTasks.generatorDefense={started:!!snapshot.operationTasks.genInserted,progress:snapshot.operationTasks.genInserted?22:0,jammed:false,completed:!!snapshot.operationTasks.genInserted,saboteurIds:[]};snapshot.logs=continuing?[...snapshot.logs]:[];snapshot.evacuation={started:false,remaining:20,completed:false};
 // Adjacent continuation carries completed systems; fresh/replay deployment
 // keeps its intentionally clean task state. Never carry the next sector's work.
 if(previousTasks){
  const taskOperations={...Object.fromEntries(OPERATION_ROUTES.map(r=>[r.task,r.operation])),...Object.fromEntries(SIGNAL_TASKS.map(t=>[t,'signal'])),...Object.fromEntries(FREIGHT_TASKS.map(t=>[t,'freight'])),...Object.fromEntries(HOSPITAL_TASKS.map(t=>[t,'hospital'])),commandFuse:'command',genInserted:'command',commandRepair:'command',researchCoolant:'research',evacPower:'containment'};
  for(const [task,value]of Object.entries(previousTasks))if(value===true&&taskOperations[task]&&taskOperations[task]!==id)snapshot.operationTasks[task]=true;
  for(const [key,owner,complete]of [['generatorDefense','command',previousTasks.generatorDefense?.completed],['hospitalAirlock','hospital',previousTasks.hospitalSterile],['freightRoute','freight',previousTasks.freightRoute?.delivered],['signalLoadout','signal',previousTasks.signalLoad],['nestRelay','nest',previousTasks.nestRelay?.decoded]])if(owner!==id&&complete&&previousTasks[key])snapshot.operationTasks[key]=structuredClone(previousTasks[key]);
 }

 const beyondBreach=id!=='breach',powerReady=['containment','nest','hospital','freight','signal'].includes(id),valvesReady=['nest','hospital','freight','signal'].includes(id);
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
 if(id==='signal')return tasks.signalLoad&&tasks.signalAntennaA&&tasks.signalAntennaB&&tasks.signalShutdown&&tasks.signalSent&&cleared('signal-yard')&&cleared('signal-relay')&&cleared('signal-uplink');
 if(id==='breach')return cleared('security')&&cleared('storage');
 if(id==='command')return cleared('command')&&cleared('generator')&&tasks.commandFuse&&tasks.commandRepair;
 if(id==='research')return cleared('lab')&&cleared('reactor')&&!!state.power?.solved&&tasks.researchCoolant&&cleared('transit');
 if(id==='freight')return tasks.freightDrain&&tasks.freightDispatch&&tasks.freightManifest&&tasks.freightRelease&&cleared('freight-pumps')&&cleared('freight-yard')&&cleared('freight-cold');
 if(id==='hospital')return tasks.hospitalPower&&tasks.hospitalSample&&tasks.hospitalAuth&&tasks.hospitalSterile&&cleared('hospital-triage')&&cleared('hospital-ward')&&cleared('hospital-isolation');
 if(id==='containment')return cleared('containment')&&!!state.valves?.solved&&tasks.evacPower&&cleared('evacuation');
 return state.artifacts?.length===3&&tasks.nestRelay.decoded&&cleared('nest')&&!!player.intel;
}

const EXITS={signal:{x:242,z:59,label:'Communications service exit',direction:'Leave Transmission Core south through Antenna Hall, then use the open service shortcut to the southeast exit'},freight:{x:190,z:59,label:'Freight departure platform',direction:'Reach the departure platform in southeast Rail Control'},hospital:{x:138,z:66,label:'Hospital ambulance exit',direction:'Return to Admission, then follow its long southern service gallery to ambulance dispatch'},breach:{x:41,z:29,label:'Extraction sector exit',direction:'Leave Storage east through its door into Extraction'},command:{x:49,z:10,label:'Powered Bio Lab exit',direction:'Follow the yellow cable north through Extraction and Command, then east through the powered Bio Lab doorway'},research:{x:73,z:52,label:'Eastern Transit exit',direction:'Head east from Transit toward the Evacuation corridor'},containment:{x:86,z:42,label:'Containment return exit',direction:'Return north from Evacuation toward the Containment corridor'},nest:{x:92,z:60,label:'Evacuation pad',direction:'Leave Nest Core south through Containment, then continue southeast to Evacuation'}};
export function campaignOperationExit(value){const id=normalizeCampaignOperation(value);return id?{...EXITS[id]}:null;}
export function campaignOperationComplete(value,context){const exit=campaignOperationExit(value);return !!exit&&campaignOperationObjectivesComplete(value,context)&&Math.hypot(context.player.x-exit.x,context.player.z-exit.z)<=1.4;}

export function campaignOperationGuidance(value,{player,puzzle,progression}){
 const id=normalizeCampaignOperation(value);if(!id)return null;
 const state=progression.state??progression,cleared=name=>state.zones.find(z=>z.id===name)?.status==='cleared';
 const tasks=state.operationTasks??createOperationTasks();
 const step=(label,done,hint)=>({label,done:!!done,hint});let steps;
 if(id==='signal')steps=[step('Secure the Breaker Gallery',cleared('signal-yard'),'Go north from Arrival into the Breaker Gallery.'),step('Distribute the three motor loads',tasks.signalLoad,'Inspect the Gallery equipment and test a load distribution.'),step('Isolate both antenna feeds',tasks.signalAntennaA&&tasks.signalAntennaB,'Enter Antenna Hall to the east. Isolate its west and east antenna feeds; both can be cut during the defense.'),step('Secure Antenna Hall',cleared('signal-relay'),'Defeat all antenna defense reinforcements.'),step('Cut the colony transmitter',tasks.signalShutdown,'Use the Antenna Hall transmitter console after both feeds are isolated and the defense is cleared.'),step('Secure Transmission Core',cleared('signal-uplink'),'Head north into Transmission Core and secure the uplink.'),step('Transmit the experiment evidence',tasks.signalSent,'Use the northern uplink console to send the patient ledger and shipping records outside the facility.')];
 if(id==='breach')steps=[step('Power the insertion door',puzzle.solved,''),step('Decode the Archive',state.archive.solved,''),step('Link the Security relays',state.relay.completed,''),step('Clear the Security purge',cleared('security'),'Defeat every Security reinforcement.'),step('Survive the Storage ambush',cleared('storage'),'Head south from Security through its corridor into Storage and clear the ambush.')];
 if(id==='command')steps=[step('Defeat the Command mutation',cleared('command'),'Clear Command before entering its southern maintenance route.'),step('Recover the Maintenance fuse',tasks.commandFuse,'Go south through Extraction and Generator, then west to Maintenance. Find its service fuse.'),step('Insert the Generator fuse',tasks.genInserted,'Return east to Generator and fit the service fuse at its central repair console.'),step('Defend the Power House restart',cleared('generator')&&tasks.generatorDefense?.completed,'Keep the supply running inside Generator. Stop amber-marked saboteurs and repair any jam at the console.'),step('Connect the cross-room yellow cable',tasks.commandRepair,'')];
 if(id==='research')steps=[step('Clear Bio Lab',cleared('lab'),'Eliminate the Bio Lab outbreak.'),step('Clear the Reactor swarm',cleared('reactor'),'Go south from Bio Lab and clear Reactor.'),step('Restore Reactor power',state.power.solved,''),step('Start the Transit coolant purge',tasks.researchCoolant,'Go south from Reactor into Transit and activate the central coolant console.'),step('Defend the Transit purge',cleared('transit'),'Clear the coolant purge swarm to open the eastern Transit exit.')];
 if(id==='containment')steps=[step('Clear the Containment breach',cleared('containment'),'Defeat every Containment reinforcement.'),step('Release the pressure lock',state.valves.solved,''),step('Restore Evacuation power',tasks.evacPower,'Head south into Evacuation. Restore its power at the eastern service console.'),step('Clear the Evacuation lockdown',cleared('evacuation'),'Survive the power restart lockdown before returning north.')];
 if(id==='freight')steps=[step('Secure the Pump Hall',cleared('freight-pumps'),'Move north from Arrival into the Pump Hall.'),step('Drain the flooded route',tasks.freightDrain,'Reset the Pump Hall flood breaker after clearing the breach.'),step('Prepare the cold-chain trolley',!!tasks.freightRoute?.running||!!tasks.freightDispatch,'Inspect the track network and test the cargo route.'),step('Escort cargo through the Loading Yard',cleared('freight-yard')&&tasks.freightDispatch,'Keep the cargo moving and secure its transfer route.'),step('Secure the Cold Chain',cleared('freight-cold'),'Follow the delivered cargo north into Cold Chain.'),step('Recover the shipping manifest',tasks.freightManifest,'Recover the sealed manifest after the cold-chain lockdown is cleared.'),step('Release Rail Control',tasks.freightRelease,'Return south through the Loading Yard to Rail Control and release its departure platform.')];
 if(id==='hospital')steps=[step('Recover the pharmacy power fuse',tasks.hospitalFuse,'Go north from Admission into Pharmacy and search its western service cabinet.'),step('Restart hospital emergency power',tasks.hospitalPower,'Return south to the emergency supply console in southeast Admission.'),step('Stabilize Triage',cleared('hospital-triage'),'Go north through Pharmacy into Triage and clear the first outbreak.'),step('Secure the quarantine sample',tasks.hospitalSample,'Collect the sealed sample from the central Triage workstation.'),step('Clear the patient ward',cleared('hospital-ward'),'Enter the Ward east of Triage and clear the ward outbreak.'),step('Authenticate the sample',tasks.hospitalAuth,'Use the Ward diagnostic station after the outbreak is cleared.'),step('Sterilize the operating theatre',tasks.hospitalSterile,'Inspect the theatre pressure controls and test the sealed cycle.'),step('Clear Isolation',cleared('hospital-isolation'),'Enter Isolation south of Surgery and eliminate the quarantine swarm.')];
 if(id==='nest')steps=[step('Find the three socket relics',state.artifacts?.length===3,`The Nest seal has three sockets; ${state.artifacts?.length??0} are filled. Revisit stabilized sectors and look for matching markings. Request a puzzle hint if you need a lead.`),step('Charge the Transit signal relay',tasks.nestRelay.started||tasks.nestRelay.linked,'Find the transmitter in Transit.'),step('Link the Containment relay',tasks.nestRelay.linked,tasks.nestRelay.started?`Reach the receiver in Containment within ${Math.ceil(tasks.nestRelay.remaining)} seconds.`:'Establish a signal between Transit and Containment.'),step('Decode the Nest shield',tasks.nestRelay.decoded,'Reach Bio Lab through Reactor and use the decoder near the center of the room.'),step('Destroy the Nest Core',cleared('nest'),'Enter Nest Core east of Bio Lab. Defeat the mutation and every reinforcement.'),step('Recover the research intel',player.intel,'Collect the cyan intel in the northeast of Nest Core.')];
 for(const route of OPERATION_ROUTES.filter(route=>route.operation===id&&!route.optional))steps.push(step(route.label.toLowerCase(),tasks[route.task],route.hint));
 const exit=campaignOperationExit(id);steps.push(step(id==='nest'?'Reach Evacuation':'Reach sector exit',false,`${exit.direction}. Press Interact at the marked ${exit.label.toLowerCase()} to depart.`));
 const objectivesDone=campaignOperationObjectivesComplete(id,{player,progression:state});
 const next=steps.find(s=>!s.done),battle=state.zones.find(z=>z.status==='active');
 const waitingCargo=id==='freight'&&battle?.id==='freight-yard'&&battle.phaseRested&&!battle.wave?.some(enemy=>enemy.hp>0)&&!tasks.freightRoute?.running&&!tasks.freightDispatch;
 return {title:id==='hospital'&&state.zones.find(z=>z.id==='hospital-isolation')?.status==='active'&&!tasks.hospitalRecords?'Recover patient ledger':id==='freight'&&tasks.freightRoute?.running?'Escort cargo':waitingCargo?'Prepare the cold-chain trolley':objectivesDone?(id==='nest'?'Reach Evacuation':'Reach sector exit'):battle?`Clear ${battle.label.toLowerCase()}`:next?.label??'Operation complete',hint:waitingCargo?'Inspect the track network and test the cargo route.':objectivesDone?`${exit.direction}. Press Interact at the marked ${exit.label.toLowerCase()}.`:battle?`${battle.remaining} creatures remain, including reinforcements.`:next?.hint??'All operation objectives completed.',steps:steps.map(({label,done})=>({label,done}))};
}

export function isCampaignOperationUnlocked(id,completed=[]){const index=CAMPAIGN_OPERATIONS.findIndex(op=>op.id===id);return index>=0&&CAMPAIGN_OPERATIONS.slice(0,index).every(op=>completed.includes(op.id));}
