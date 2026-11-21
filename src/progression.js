import {WIRE_LAYOUT,WIRE_SOLUTION,createWireCircuit,rotateJunction,powerCircuit} from './wire-circuit.js?v=preview-r8';
import {DIFFICULTY_RULES} from './difficulty.js?v=preview-r8';
export function progressionSequences(remix=false){return remix?{archive:['square','triangle','circle'],power:['power-c','power-a','power-b'],valves:['valve-b','valve-a','valve-b','valve-a']}:{archive:['triangle','circle','square'],power:['power-a','power-b','power-c'],valves:['valve-a','valve-b','valve-a','valve-b']};}
// Facility progression is pure state, independent of rendering and collision.
// Door 0's pressure-plate power requirement remains owned by pressure-puzzle.js.
export const ARTIFACTS=Object.freeze([
 {id:'artifact-archive',kind:'artifact',x:12,z:13,label:'ETCHED ARCHIVE RELIC'},
 {id:'artifact-generator',kind:'artifact',x:29,z:54,label:'GENERATOR CORE RELIC'},
 {id:'artifact-containment',kind:'artifact',x:94,z:36,label:'CONTAINMENT SEAL RELIC'},
].map(Object.freeze));
export function createOperationTasks(){return {commandFuse:false,genInserted:false,commandRepair:false,researchCoolant:false,evacPower:false,nestRelay:{started:false,remaining:0,linked:false,decoded:false}};}
export function createProgression({doors,enemies,spawnEnemy,onToast=()=>{},onHint=()=>{},getDifficulty=()=> 'normal',remix=false}){
  const initialSequences=progressionSequences(remix);
  const devices=[
    {id:'glyph-circle',kind:'glyph',glyph:'circle',x:4,z:5,label:'CIRCLE',active:false,progress:0},
    {id:'glyph-triangle',kind:'glyph',glyph:'triangle',x:8,z:5,label:'TRIANGLE',active:false,progress:0},
    {id:'glyph-square',kind:'glyph',glyph:'square',x:12,z:5,label:'SQUARE',active:false,progress:0},
    {id:'relay-a',kind:'relay',x:19.5,z:7,label:'RELAY A',active:false,progress:0},
    {id:'relay-b',kind:'relay',x:27,z:13,label:'RELAY B',active:false,progress:0},
    ...[{id:'power-a',x:54,z:35,label:'POWER A'},{id:'power-b',x:65,z:26,label:'POWER B'},{id:'power-c',x:60,z:35,label:'POWER C'}].map(d=>({...d,kind:'power',active:false,progress:0})),
    ...[{id:'valve-a',x:79,z:34,label:'VALVE A'},{id:'valve-b',x:92,z:26,label:'VALVE B'}].map(d=>({...d,kind:'valve',active:false,progress:0})),
    ...WIRE_LAYOUT.map(d=>({...d,kind:'wire',active:false,progress:0})),
    ...ARTIFACTS.map(d=>({...d,active:false,progress:0})),
    ...[{id:'task-fuse',task:'commandFuse',x:12,z:52,label:'MAINTENANCE FUSE'},{id:'task-generator',task:'commandRepair',x:35,z:56,label:'POWER HOUSE SUPPLY'},{id:'task-coolant',task:'researchCoolant',x:62,z:52,label:'TRANSIT COOLANT'},{id:'task-evac',task:'evacPower',x:92,z:52,label:'EVAC POWER'},{id:'task-signal-a',task:'nestStart',x:55,z:50,label:'SIGNAL RELAY A'},{id:'task-signal-b',task:'nestLink',x:82,z:31,label:'SIGNAL RELAY B'},{id:'task-signal-c',task:'nestDecode',x:61,z:12,label:'SIGNAL DECODER'}].map(d=>({...d,kind:'task',active:false,progress:0})),
    ...[{id:'log-lab',x:66,z:8,label:'RESEARCH LOG 1',text:'Specimen 07 responds to electrical pulses. The power network became its nervous system.'},{id:'log-containment',x:94,z:30,label:'RESEARCH LOG 2',text:'Containment failed from inside. The colony learned the door access sequence.'},{id:'log-nest',x:92,z:14,label:'RESEARCH LOG 3',text:'The nest is a relay, not the source. Something beneath the facility is still transmitting.'}].map(d=>({...d,kind:'log',active:false,progress:0})),
  ];
  const definitions=[
    {id:'security',label:'SECURITY PURGE',total:8,batch:3,liveCap:6,legacyTotal:24,corners:[[20,6],[27,6],[20,14],[27,14]]},
    {id:'storage',label:'STORAGE AMBUSH',total:14,batch:4,liveCap:10,legacyTotal:40,bounds:[20,26,23,29],corners:[[19.5,22],[27,22],[19.5,30],[27,30]]},
    {id:'command',label:'COMMAND MUTATION',total:20,batch:5,liveCap:12,legacyTotal:48,bounds:[35,42,6,13],corners:[[34,5],[43,5],[34,14],[43,14]],boss:true},
    {id:'lab',label:'BIO LAB OUTBREAK',total:28,batch:6,liveCap:16,legacyTotal:32,bounds:[54,65,7,14],corners:[[52,5],[67,5],[52,16],[67,16]]},
    {id:'reactor',label:'REACTOR SWARM',total:36,batch:6,liveCap:18,legacyTotal:40,bounds:[54,65,26,34],corners:[[52,24],[67,24],[52,36],[67,36]]},
    {id:'containment',label:'CONTAINMENT BREACH',total:52,batch:8,liveCap:22,legacyTotal:48,bounds:[78,93,26,34],corners:[[76,24],[95,24],[76,36],[95,36]]},
    {id:'generator',label:'GENERATOR RESTART',total:24,batch:5,liveCap:14,legacyTotal:24,corners:[[27,45],[43,45],[27,61],[43,61]],interactive:true},
    {id:'transit',label:'TRANSIT PURGE',total:40,batch:7,liveCap:20,legacyTotal:40,corners:[[53,50],[67,50],[53,61],[67,57]],interactive:true},
    {id:'evacuation',label:'EVACUATION LOCKDOWN',total:60,batch:9,liveCap:23,legacyTotal:60,corners:[[77,45],[95,45],[77,61],[95,61]],interactive:true},
    {id:'nest',label:'NEST CORE HORDE',total:80,batch:10,liveCap:24,legacyTotal:64,bounds:[78,93,7,14],corners:[[76,5],[95,5],[76,16],[95,16]],boss:true},
  ];
  definitions.sort((a,b)=>a.total-b.total);
  const difficulty=()=>DIFFICULTY_RULES[getDifficulty()]??DIFFICULTY_RULES.normal;
  const scaledTotal=definition=>Math.max(1,Math.round(definition.total*(difficulty().waveSize??1)));
  const zones=definitions.map(d=>({id:d.id,label:d.label,status:'dormant',wave:[],liveCap:d.liveCap,total:scaledTotal(d),spawned:0,queued:0,remaining:0,queue:[],spawnTimer:0}));
  const state={devices,zones,clue:{x:9,z:13,label:'△ → ○ → □'},remix:!!remix,archive:{sequence:initialSequences.archive,input:[],solved:false},relay:{started:false,remaining:0,duration:8,completed:false},elapsed:0,totalEnemies:zones.reduce((sum,zone)=>sum+zone.total,0),liveCap:36,mission:'campaign',operationId:null,operationTasks:createOperationTasks(),circuit:createWireCircuit(),milestone:0,operationZoneIds:null,power:{sequence:initialSequences.power,input:[],solved:false},valves:{sequence:initialSequences.valves,input:[],solved:false},logs:[],artifacts:[],evacuation:{started:false,remaining:20,completed:false}};
  state.clue.id='archive';state.clue.kind='clue';
  state.clues=[state.clue,{id:'power',kind:'clue',x:59,z:33,label:'REACTOR ROUTING PLAQUE'},{id:'valves',kind:'clue',x:86,z:32,label:'CONTAINMENT MAINTENANCE PLAQUE'}];
  const symbols={triangle:'△',circle:'○',square:'□'};
  function clueText(id){return id==='archive'?state.archive.sequence.map(g=>symbols[g]).join(' → '):state[id].sequence.map(value=>value.slice(-1).toUpperCase()).join(' → ');}
  function refreshClueLabels(){state.clue.label=clueText('archive');}
  refreshClueLabels();
  const [security,storage,command,lab,reactor,containment,nest]=['security','storage','command','lab','reactor','containment','nest'].map(id=>zones.find(z=>z.id===id));
  const generator=zones.find(z=>z.id==='generator'),transit=zones.find(z=>z.id==='transit'),evacuationZone=zones.find(z=>z.id==='evacuation');
  const living=enemy=>enemy&&enemy.hp>0;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const inBounds=(p,minX,maxX,minZ,maxZ)=>p.x>=minX&&p.x<=maxX&&p.z>=minZ&&p.z<=maxZ;
  const hint=text=>onHint(text);
  let archiveEntered=false,securityEntered=false,lastEvacSecond=-1,lastSignalSecond=-1,nestExitAllowance=false,legacyNestEscape=false;

  // Only this function decides progression locks. A completed security puzzle must
  // never override the temporary storage/command combat seals on shared doors.
  function recomputeLocks(){
    const securityLocked=security.status!=='cleared',annexLocked=command.status!=='cleared';
    const active=zone=>zone.status==='active',nestSignalLocked=state.operationId==='nest'&&!state.operationTasks.nestRelay.decoded&&!nestExitAllowance,nestArtifactsLocked=state.mission==='campaign'&&state.artifacts.length<3&&!nestExitAllowance;
    const nestLockReason=nestArtifactsLocked?`NEST SEAL · ${state.artifacts.length} / 3 SOCKETS FILLED`:nestSignalLocked?'NEST SIGNAL SHIELD · LINK RELAYS AND DECODE':'SECTOR SEALED · ELIMINATE THE HORDE';
    const commandPowerLocked=state.operationId==='command'&&!state.operationTasks.commandRepair,researchExitLocked=state.operationId==='research'&&(!state.operationTasks.researchCoolant||transit.status!=='cleared');
    const rules=[
      [1,!state.archive.solved,'ARCHIVE CIPHER · FOLLOW THE THREE GLYPHS'],
      [2,securityLocked||active(storage),active(storage)?'STORAGE SEALED · ELIMINATE THE HORDE':'SECURITY LOCKDOWN · LINK THE RELAYS AND CLEAR THE PURGE'],
      [3,active(storage),'STORAGE SEALED · ELIMINATE THE HORDE'],
      [4,active(command),'COMMAND SEALED · DEFEAT THE MUTATION HORDE'],
      [5,securityLocked||active(command),active(command)?'COMMAND SEALED · DEFEAT THE MUTATION HORDE':'SECURITY LOCKDOWN · LINK THE RELAYS AND CLEAR THE PURGE'],
      [6,annexLocked||active(lab)||commandPowerLocked,annexLocked?'ANNEX LOCKED · CLEAR COMMAND':active(lab)?'BIO LAB SEALED · ELIMINATE THE HORDE':'POWER CABLE BROKEN · RESTORE THE POWER HOUSE ROUTE'],
      [7,annexLocked||active(reactor),annexLocked?'ANNEX LOCKED · CLEAR COMMAND':'REACTOR SEALED · ELIMINATE THE HORDE'],
      [8,active(lab)||active(nest)||nestSignalLocked||nestArtifactsLocked,active(lab)||active(nest)?'SECTOR SEALED · ELIMINATE THE HORDE':nestLockReason],
      [9,active(reactor)||active(containment),'SECTOR SEALED · ELIMINATE THE HORDE'],
      [10,active(lab)||active(reactor),'SECTOR SEALED · ELIMINATE THE HORDE'],
      [11,active(nest)||active(containment)||nestSignalLocked||nestArtifactsLocked,active(containment)||active(nest)?'SECTOR SEALED · ELIMINATE THE HORDE':nestLockReason],
      [12,active(reactor)||active(transit)||!state.power.solved,active(reactor)||active(transit)?'REACTOR SEALED · ELIMINATE THE HORDE':'POWER OFFLINE · FIND THE ROUTING CLUE'],
      [13,active(containment)||active(evacuationZone)||!state.valves.solved,active(containment)||active(evacuationZone)?'CONTAINMENT SEALED · ELIMINATE THE HORDE':'PRESSURE LOCK · FIND THE MAINTENANCE CLUE'],
      [14,annexLocked||active(generator),active(generator)?'GENERATOR SEALED · CLEAR THE RESTART SWARM':'ANNEX LOCKED · CLEAR COMMAND'],
      [15,active(generator),'GENERATOR SEALED · CLEAR THE RESTART SWARM'],
      [16,active(generator)||active(transit),'TRANSIT SEALED · CLEAR THE SWARM'],
      [17,active(transit)||active(evacuationZone)||researchExitLocked,active(transit)||active(evacuationZone)?'EVACUATION SEALED · CLEAR THE SWARM':'COOLANT LOCK · COMPLETE THE TRANSIT PURGE'],
    ];
    for(const door of doors)door.hintTarget=null;
    for(const [index,locked,reason] of rules){
      const door=doors[index];if(!door)continue;
      if(locked&&!door.progressLocked)door.open=false;
      door.progressLocked=locked;door.lockReason=locked?reason:'';
    }
    if(zones.some(active))return;
    const target=(index,point,label)=>{if(doors[index]?.progressLocked)doors[index].hintTarget={x:point.x,z:point.z,label};};
    if(doors[0]?.needsPower&&!doors[0].unlocked)doors[0].hintTarget={x:4,z:23.5,label:'A nearby floor circuit'};
    target(1,state.clue,'An Archive clue');
    for(const index of [2,5])if(securityLocked)target(index,devices.find(d=>d.id===(state.relay.started?'relay-b':'relay-a')),state.relay.started?'The receiving Security relay':'The Security relay circuit');
    if(!state.power.solved)target(12,state.clues.find(c=>c.id==='power'),'A Reactor maintenance clue');
    if(!state.valves.solved)target(13,state.clues.find(c=>c.id==='valves'),'A Containment maintenance clue');
    if(commandPowerLocked&&!annexLocked){
      const tasks=state.operationTasks;let point,label;
      if(!tasks.commandFuse){point=devices.find(d=>d.task==='commandFuse');label='A missing service component';}
      else if(!tasks.genInserted){point=devices.find(d=>d.task==='commandRepair');label='The Power House supply';}
      else{const mismatch=WIRE_LAYOUT.slice(0,7).find(node=>node.kind==='straight'?state.circuit.rotations[node.index]%2!==WIRE_SOLUTION[node.index]%2:state.circuit.rotations[node.index]!==WIRE_SOLUTION[node.index]);point=devices.find(d=>d.id===mismatch?.id)??devices.find(d=>d.task==='commandRepair');label='A broken section of the supply cable';}
      target(6,point,label);
    }
    if(researchExitLocked){const point=!state.power.solved?state.clues.find(c=>c.id==='power'):devices.find(d=>d.task==='researchCoolant');target(17,point,!state.power.solved?'A Reactor maintenance clue':'The Transit coolant console');}
    for(const index of [8,11]){if(nestArtifactsLocked){const artifact=ARTIFACTS.find(a=>!state.artifacts.includes(a.id));target(index,artifact,'A trace of a missing relic');}else if(nestSignalLocked){const point=devices.find(d=>d.task===(state.operationTasks.nestRelay.linked?'nestDecode':state.operationTasks.nestRelay.started?'nestLink':'nestStart'));target(index,point,'A signal controlling the Nest shield');}}
  }
  const taskOperation={commandFuse:'command',commandRepair:'command',researchCoolant:'research',evacPower:'containment',nestStart:'nest',nestLink:'nest',nestDecode:'nest'};
  function nearestDevice(player){return devices.filter(d=>(d.kind!=='task'||!state.operationId||taskOperation[d.task]===state.operationId)&&distance(d,player)<=1.7).sort((a,b)=>distance(a,player)-distance(b,player))[0];}
  const nearestClue=player=>state.clues.filter(c=>distance(c,player)<=1.8).sort((a,b)=>distance(a,player)-distance(b,player))[0];
  function getPrompt(player){
    const d=nearestDevice(player),clue=nearestClue(player);
    if(clue&&(!d||distance(clue,player)<distance(d,player)))return `E · READ ${clue.id==='archive'?'THE ARCHIVE CLUE':clue.label}`;
    if(d){
      if(d.kind==='task'){
        const signal=state.operationTasks.nestRelay;
        if(d.task==='nestStart')return signal.linked?'SIGNAL LINK ESTABLISHED':`E · ${signal.started?'RESTART':'CHARGE'} SIGNAL RELAY A${signal.started?' · '+Math.ceil(signal.remaining)+'s':''}`;
        if(d.task==='nestLink')return signal.linked?'SIGNAL LINK ESTABLISHED':`E · LINK SIGNAL RELAY B${signal.started?' · '+Math.ceil(signal.remaining)+'s':' · CHARGE A FIRST'}`;
        if(d.task==='commandRepair')return state.operationTasks.commandRepair?'GENERATOR POWER ONLINE':`E · ${state.operationTasks.genInserted?'CHECK FLOOR CIRCUIT':'INSERT SERVICE FUSE'}`;
        return `E · ${d.label}${d.active?' · COMPLETE':''}`;
      }
      if(d.kind==='wire')return state.circuit.solved?'GENERATOR CABLE CONNECTED':`E · ROTATE ${d.label} · QUARTER TURN`;
      if(d.kind==='artifact')return state.artifacts.includes(d.id)?'RELIC ALREADY RECOVERED':`E · EXAMINE ${d.label}`;
      if(d.kind==='log')return `E · ${d.active?'REREAD':'READ'} ${d.label}`;
      if(d.kind==='power')return `E · ${d.label} · ${state.power.solved?'POWER ONLINE':'RESTORE ROUTING'}`;
      if(d.kind==='valve')return `E · ${d.label} · ${state.valves.solved?'PRESSURE SAFE':'VENT PRESSURE'}`;
      if(d.kind==='glyph')return state.archive.solved?'CIPHER ACCEPTED':`E · ${d.label} CONSOLE`;
      if(state.relay.completed)return 'RELAY LINK ESTABLISHED';
      if(d.id==='relay-a')return state.relay.started?`E · RESTART RELAY A · ${Math.ceil(state.relay.remaining)}s`:'E · CHARGE RELAY A';
      return state.relay.started?`E · LINK RELAY B · ${Math.ceil(state.relay.remaining)}s`:'E · RELAY B · CHARGE A FIRST';
    }
    return null;
  }
  function chooseSpawn(player,primary,alternatives){
    const candidates=[primary,...alternatives];
    // Callback performs final furniture/map collision checks. Prefer a distinct,
    // distant floor point here so a wave never materializes on top of the player.
    const valid=candidates.filter(([x,z])=>Math.hypot(x-player.x,z-player.z)>=3);
    const pool=valid.length?valid:candidates;
    return pool.reduce((best,p)=>{
      const score=([x,z])=>Math.hypot(x-player.x,z-player.z)-enemies.filter(living).reduce((sum,e)=>sum+(Math.hypot(e.x-x,e.z-z)<1.4?10:0),0);
      return score(p)>score(best)?p:best;
    },pool[0]);
  }
  function refreshCounts(zone){
    zone.queued=zone.queue.length;
    zone.remaining=zone.queued+zone.wave.filter(living).length;
  }
  function spawnBatch(zone,player){
    const definition=definitions.find(d=>d.id===zone.id);
    const localLiving=zone.wave.filter(living).length;
    const encounterLiving=new Set(zones.filter(z=>z.status==='active').flatMap(z=>z.wave.filter(living))).size;
    const available=Math.max(0,Math.min(zone.liveCap-localLiving,state.liveCap-encounterLiving));
    const attempts=Math.min(definition.batch,available,zone.queue.length);
    let spawnedNow=0;
    for(let i=0;i<attempts;i++){
      const corner=definition.corners[(zone.spawned+i)%definition.corners.length];
      const [x,z]=chooseSpawn(player,corner,definition.corners);
      // A blocked spawn stays queued. A transient collision must never silently
      // delete an enemy, release an arena early, or permanently stall the wave.
      const variant=zone.queue[0],enemy=spawnEnemy(x,z,variant,{encounter:zone.id});
      if(enemy){zone.queue.shift();zone.wave.push(enemy);zone.spawned++;spawnedNow++;}
    }
    refreshCounts(zone);
    zone.spawnTimer=spawnedNow>0?(difficulty().reinforcementInterval??3):.65;
  }
  function launchWave(zone,player){
    if(zone.status!=='dormant')return;
    const definition=definitions.find(d=>d.id===zone.id);zone.total=scaledTotal(definition);state.totalEnemies=zones.reduce((sum,z)=>sum+z.total,0);zone.status='active';
    for(let i=0;i<zone.total;i++){
      let variant='normal';
      const remix=state.remix;
      // Introduce threats gradually: simple opening, a late Storage brute,
      // then denser mixed hordes deeper in the research facility.
      if(zone===security){if(i%(remix?4:5)===(remix?2:4))variant='runner';}
      else if(zone===storage){if(i%(remix?3:4)===(remix?1:2))variant='runner';if(i===zone.total-2)variant='brute';}
      else if(zone===command){if(i%(remix?4:3)===(remix?0:1))variant='runner';if(i>=Math.floor(zone.total/2)&&i%(remix?6:7)===(remix?4:6))variant='brute';}
      else if(zone===generator){if(i%3===(remix?0:1))variant='runner';if(i%8===(remix?3:6))variant='brute';}
      else if(zone===transit){if(i%3===(remix?0:1))variant='runner';if(i%6===(remix?2:5))variant='brute';}
      else if(zone===evacuationZone){if(i%5<(remix?3:2))variant='runner';if(i%5===(remix?3:4))variant='brute';}
      else if(zone===lab){if(i%3===(remix?0:1))variant='runner';if(i%(remix?7:8)===(remix?3:6))variant='brute';}
      else if(zone===reactor){if(i%3===(remix?0:1))variant='runner';if(i%6===(remix?2:5))variant='brute';}
      else if(zone===containment){if(i%5<(remix?3:2))variant='runner';if(i%5===(remix?3:4))variant='brute';}
      else if(zone===nest){if(i%2===(remix?0:1))variant='runner';if(i%4===(remix?2:3))variant='brute';}
      if(definition.boss&&i===0)variant='boss';
      zone.queue.push(variant);
    }
    refreshCounts(zone);recomputeLocks();spawnBatch(zone,player);
  }
  function finishCircuit(player){
    if(!state.circuit.solved||state.operationTasks.commandRepair||generator.status!=='cleared')return false;
    state.operationTasks.commandRepair=true;state.milestone++;recomputeLocks();
    const console=devices.find(d=>d.task==='commandRepair');console.active=true;console.progress=1;
    onToast('CROSS-ROOM CABLE CONNECTED · BIO LAB DOOR POWERED');hint('Follow the yellow cable through Extraction and Command to the east Bio Lab doorway.');return true;
  }
  function interact(player){
    const d=nearestDevice(player),clue=nearestClue(player);
    if(clue&&(!d||distance(clue,player)<distance(d,player))){const title=clue.id==='archive'?'ARCHIVE CLUE':clue.label;onToast(`${title} · ${clueText(clue.id)}`);hint(`${title}: ${clue.id==='archive'?state.archive.sequence.join(' → ').toUpperCase():clueText(clue.id)}. Use the consoles in this order.`);return true;}
    if(!d)return false;
    if(d.kind==='wire'){
      if(state.circuit.solved){onToast('GENERATOR CABLE ALREADY CONNECTED');return true;}
      rotateJunction(state.circuit,d.index);d.progress=state.circuit.rotations[d.index]/4;
      if(!finishCircuit(player))onToast(state.circuit.powered?'JUNCTION ROTATED · FOLLOW THE YELLOW CURRENT':'JUNCTION ROTATED · INSERT THE SERVICE FUSE TO SUPPLY POWER');
      return true;
    }
    if(d.kind==='artifact'){
      if(state.artifacts.includes(d.id)){onToast('RELIC ALREADY RECOVERED');return true;}
      const ready=d.id==='artifact-archive'?state.archive.solved:d.id==='artifact-generator'?generator.status==='cleared':containment.status==='cleared'&&state.valves.solved;
      if(!ready){onToast('RELIC RESTRAINT ACTIVE · STABILIZE THIS SECTOR FIRST');hint('The relic is bound to this room’s machinery. Resolve the local threat or puzzle before removing it.');return true;}
      state.artifacts.push(d.id);d.active=true;d.progress=1;state.milestone++;recomputeLocks();onToast(`RELIC RECOVERED · ${state.artifacts.length} / 3`);hint('The relic bears the same markings as the three empty sockets at the Nest seal.');return true;
    }
    if(d.kind==='task'){
      const tasks=state.operationTasks,relay=tasks.nestRelay;
      const finish=(text,instruction)=>{d.active=true;d.progress=1;state.milestone++;onToast(text);hint(instruction);recomputeLocks();return true;};
      if(d.task==='commandFuse'){if(tasks.commandFuse){onToast('FUSE ALREADY RECOVERED');return true;}if(command.status!=='cleared'){onToast('CLEAR COMMAND BEFORE RECOVERING ITS SERVICE FUSE');return true;}tasks.commandFuse=true;return finish('SERVICE FUSE RECOVERED','Reach Generator east of Maintenance and repair the restart console.');}
      if(d.task==='commandRepair'){
        if(tasks.commandRepair){onToast('GENERATOR REPAIRED');return true;}
        if(!tasks.commandFuse){onToast('MISSING SERVICE FUSE · SEARCH MAINTENANCE TO THE WEST');return true;}
        if(tasks.genInserted){onToast(generator.status==='active'?'DEFEND THE POWER HOUSE BEFORE ROUTING ITS SUPPLY':'FOLLOW THE BROKEN CABLE THROUGH GENERATOR, EXTRACTION AND COMMAND');return true;}
        tasks.genInserted=true;state.milestone++;d.progress=.5;launchWave(generator,player);recomputeLocks();
        onToast('FUSE INSERTED · POWER HOUSE RESTART SWARM');hint('Defend Generator first. Its power supply stays off until the restart swarm is cleared.');
        return true;
      }
      if(d.task==='researchCoolant'){if(tasks.researchCoolant){onToast('COOLANT PURGE COMPLETE');return true;}if(lab.status!=='cleared'||reactor.status!=='cleared'||!state.power.solved){onToast('COOLANT LOCKED · CLEAR BIO LAB AND RESTORE REACTOR POWER');return true;}tasks.researchCoolant=true;launchWave(transit,player);return finish('TRANSIT COOLANT PURGE · SWARM INCOMING','Defend Transit while the coolant purge clears the lower route.');}
      if(d.task==='evacPower'){if(tasks.evacPower){onToast('EVAC POWER RESTORED');return true;}if(containment.status!=='cleared'||!state.valves.solved){onToast('EVAC POWER LOCKED · CLEAR CONTAINMENT AND RELEASE PRESSURE');return true;}tasks.evacPower=true;launchWave(evacuationZone,player);return finish('EVAC POWER RESTORED · LOCKDOWN INCOMING','Clear the Evacuation lockdown, then return north to the Containment sector exit.');}
      if(d.task==='nestStart'){if(relay.linked){onToast('SIGNAL LINK ESTABLISHED · FIND THE BIO LAB DECODER');return true;}relay.started=true;relay.remaining=30;d.active=true;d.progress=1;onToast('SIGNAL A CHARGED · 30s');return true;}
      if(d.task==='nestLink'){if(relay.linked){onToast('SIGNAL LINK ALREADY ESTABLISHED');return true;}if(!relay.started||relay.remaining<=0){onToast('NO SIGNAL CHARGE · START RELAY A IN TRANSIT');return true;}relay.linked=true;relay.started=false;relay.remaining=0;return finish('NEST SIGNAL LINKED','Reach Bio Lab through Reactor. Use its decoder to lower the Nest shield.');}
      if(d.task==='nestDecode'){if(relay.decoded){onToast('NEST SHIELD ALREADY DISABLED');return true;}if(!relay.linked){onToast('DECODER OFFLINE · LINK THE TRANSIT AND CONTAINMENT RELAYS');return true;}relay.decoded=true;const sealReady=state.artifacts.length===3;return finish(sealReady?'NEST APPROACH OPEN':'SIGNAL SHIELD DISABLED · RELIC SEAL STILL LOCKED',sealReady?'The Nest approach is open. Enter from Bio Lab and destroy its guarded core.':`Signal shield disabled. Recover the ${3-state.artifacts.length} missing relic${state.artifacts.length===2?'':'s'} to release the Nest seal.`);}
      return true;
    }
    if(d.kind==='log'){
      if(!state.logs.includes(d.id))state.logs.push(d.id);d.active=true;d.progress=1;
      onToast(`${d.label} · ${d.text}`);hint(state.logs.length===3?'All research logs recovered. The colony was receiving commands from below the facility.':d.text);return true;
    }
    if(d.kind==='power'||d.kind==='valve'){
      const puzzle=d.kind==='power'?state.power:state.valves,sequence=puzzle.sequence;
      if(puzzle.solved){onToast(d.kind==='power'?'REACTOR POWER ONLINE':'CONTAINMENT PRESSURE SAFE');return true;}
      if(d.id!==sequence[puzzle.input.length]){puzzle.input=[];for(const device of devices.filter(x=>x.kind===d.kind)){device.active=false;device.progress=0;}onToast('SEQUENCE RESET · CHECK THE FLOOR CLUE');return true;}
      puzzle.input.push(d.id);d.active=true;d.progress=puzzle.input.length/sequence.length;
      if(puzzle.input.length===sequence.length){puzzle.solved=true;for(const device of devices.filter(x=>x.kind===d.kind)){device.active=true;device.progress=1;}recomputeLocks();onToast(d.kind==='power'?'POWER ROUTED · SOUTH EXIT READY':'PRESSURE RELEASED · SOUTH EXIT READY');hint(d.kind==='power'?'Reactor routing restored.':'Containment pressure stabilized.');}
      else onToast(`SEQUENCE ACCEPTED · ${puzzle.input.length} / ${sequence.length}`);
      return true;
    }
    if(d.kind==='glyph'){
      if(state.archive.solved){onToast('CIPHER ALREADY ACCEPTED · ARCHIVE EXIT UNLOCKED');return true;}
      const {archive}=state;
      if(d.glyph!==archive.sequence[archive.input.length]){
        archive.input.length=0;for(const glyph of devices.filter(x=>x.kind==='glyph')){glyph.active=false;glyph.progress=0;}
        onToast('CIPHER REJECTED · SEQUENCE RESET');hint('Look for a three-symbol clue on the archive floor.');return true;
      }
      archive.input.push(d.glyph);d.active=true;d.progress=1;
      if(archive.input.length===archive.sequence.length){archive.solved=true;recomputeLocks();onToast('ARCHIVE CIPHER ACCEPTED · SECURITY ACCESS OPEN');hint('Archive access restored.');}
      else onToast(`GLYPH ACCEPTED · ${archive.input.length} / 3`);
      return true;
    }
    if(state.relay.completed){onToast('RELAY LINK ESTABLISHED');return true;}
    if(d.id==='relay-a'){
      state.relay.started=true;state.relay.remaining=state.relay.duration;d.active=true;d.progress=1;
      onToast('RELAY A CHARGED · 8s');return true;
    }
    if(!state.relay.started){onToast('RELAY B HAS NO CHARGE · ACTIVATE A FIRST');return true;}
    state.relay.completed=true;state.relay.started=false;state.relay.remaining=0;
    for(const relay of devices.filter(x=>x.kind==='relay')){relay.active=true;relay.progress=1;}
    launchWave(security,player);
    onToast('RELAYS LINKED · SECURITY PURGE INCOMING');return true;
  }
  function update(player,dt){
    const step=Number.isFinite(dt)&&dt>0?dt:0;state.elapsed+=step;
    if(legacyNestEscape&&inBounds(player,75,97,4,18))nestExitAllowance=true;else if(player.x<70||player.z>22){nestExitAllowance=false;legacyNestEscape=false;}
    const signal=state.operationTasks.nestRelay;if(signal.started&&!signal.linked){signal.remaining=Math.max(0,signal.remaining-step);const device=devices.find(d=>d.task==='nestStart');device.progress=signal.remaining/30;const seconds=Math.ceil(signal.remaining);if(seconds!==lastSignalSecond)lastSignalSecond=seconds;if(signal.remaining===0){signal.started=false;device.active=false;onToast('SIGNAL CHARGE EXPIRED · RESTART TRANSIT RELAY A');hint('The signal charge faded. Restart relay A in northwest Transit when ready.');}}
    if(state.relay.started&&!state.relay.completed){
      state.relay.remaining=Math.max(0,state.relay.remaining-step);devices[3].progress=state.relay.remaining/state.relay.duration;
      if(state.relay.remaining===0){state.relay.started=false;devices[3].active=false;devices[3].progress=0;onToast('RELAY CHARGE EXPIRED · TRY A AGAIN');hint('The relay charge faded. Plan a faster route and try the timed link again.');}
    }
    if(!archiveEntered&&inBounds(player,2,13,4,15))archiveEntered=true;
    if(!securityEntered&&inBounds(player,18,28,4,15))securityEntered=true;
    for(const definition of definitions){
      if(definition.interactive||!definition.bounds||definition.id==='nest'&&state.mission==='campaign'&&(state.artifacts.length<3||state.operationId==='nest'&&!state.operationTasks.nestRelay.decoded)||state.operationZoneIds&&!state.operationZoneIds.includes(definition.id))continue;
      const zone=zones.find(z=>z.id===definition.id);
      if(zone.status==='dormant'&&inBounds(player,...definition.bounds)){
        launchWave(zone,player);onToast(`${zone.label} · ${zone.total} HOSTILES · EXITS SEALED`);
        hint(zone===command?'Defeat the mutation horde to unlock the research annex.':zone===nest?'Survive the nest core horde. The research intel stays locked until the final creature falls.':`Survive ${zone.total} creatures. Reinforcements arrive in batches; keep moving and use cover.`);
      }
    }
    for(const zone of zones){
      if(zone.status!=='active')continue;
      zone.spawnTimer=Math.max(0,zone.spawnTimer-step);
      if(zone.queue.length&&zone.spawnTimer===0)spawnBatch(zone,player);
      refreshCounts(zone);
      if(zone.queue.length===0&&zone.remaining===0){
        zone.status='cleared';recomputeLocks();
        onToast(`${zone.label} CLEARED · ${zone.total} ELIMINATED · EXITS UNLOCKED`);
        if(zone===security)hint('Security is clear. Follow the marked route and complete the remaining sector objectives.');
        else if(zone===storage)hint('Storage is clear. Reach Command and defeat its mutation horde.');
        else if(zone===command)hint('Command is clear. Check the next objective and follow the service route.');
        else if(zone===nest)hint('Nest destroyed. Recover the cyan intel, then reach Evacuation in the southeast.');
        else hint(`${zone.label} cleared. Push deeper into the annex and find the nest core.`);
        if(zone===generator&&state.operationTasks.genInserted){powerCircuit(state.circuit);if(!finishCircuit(player))hint('Power House online. Follow its broken yellow cable north through Extraction into Command, rotating floor junctions to carry power to the Bio Lab door.');}
      }
    }
    if(state.mission==='siege'&&state.power.solved&&reactor.status==='cleared'&&!state.evacuation.completed){
      if(!state.evacuation.started){state.evacuation.started=true;onToast('POWER STABLE · EVACUATION IN 20 SECONDS');hint('Stay inside the reactor while the evacuation lift arrives.');}
      if(inBounds(player,51,69,23,38))state.evacuation.remaining=Math.max(0,state.evacuation.remaining-step);
      const second=Math.ceil(state.evacuation.remaining);if(second!==lastEvacSecond){lastEvacSecond=second;hint(`Hold inside Reactor. Evacuation lift arrives in ${second} seconds.`);}
      if(state.evacuation.remaining===0){state.evacuation.completed=true;onToast('EVACUATION LIFT READY · OPERATION COMPLETE');}
    }
    recomputeLocks();
  }
  function serializeState(){
    return {
      version:1,remix:state.remix,operationId:state.operationId,operationTasks:JSON.parse(JSON.stringify(state.operationTasks)),circuit:{rotations:[...state.circuit.rotations],powered:state.circuit.powered,solved:state.circuit.solved},milestone:state.milestone,elapsed:state.elapsed,archiveEntered,securityEntered,mission:state.mission,operationZoneIds:state.operationZoneIds?[...state.operationZoneIds]:null,power:{input:[...state.power.input],solved:state.power.solved},valves:{input:[...state.valves.input],solved:state.valves.solved},logs:[...state.logs],artifacts:[...state.artifacts],evacuation:{...state.evacuation},
      archive:{input:[...state.archive.input],solved:state.archive.solved},
      relay:{started:state.relay.started,remaining:state.relay.remaining,completed:state.relay.completed},
      zones:zones.map(zone=>({id:zone.id,status:zone.status,total:zone.total,spawned:zone.spawned,queue:[...zone.queue],spawnTimer:zone.spawnTimer,
        waveIds:zone.wave.map(enemy=>enemy.id),waveVariants:zone.wave.map(enemy=>enemy.variant||'normal')})),
    };
  }
  function restoreState(snapshot,enemyById){
    const variants=new Set(['normal','runner','brute','boss']),statuses=new Set(['dormant','active','cleared']);
    if(!snapshot||snapshot.version!==1||!snapshot.archive||!snapshot.relay||!Array.isArray(snapshot.zones)||snapshot.zones.length<7||snapshot.zones.length>zones.length)return false;
    if(snapshot.remix!==undefined&&typeof snapshot.remix!=='boolean')return false;
    const restoredSequences=progressionSequences(snapshot.remix===true);
    if(!Array.isArray(snapshot.archive.input)||snapshot.archive.input.length>3||snapshot.archive.solved&&snapshot.archive.input.length!==3||!snapshot.archive.input.every((glyph,index)=>glyph===restoredSequences.archive[index]))return false;
    if(snapshot.zones.some(saved=>!saved||!zones.some(zone=>zone.id===saved.id))||new Set(snapshot.zones.map(saved=>saved.id)).size!==snapshot.zones.length)return false;
    for(const zone of zones){
      const saved=snapshot.zones.find(item=>item&&item.id===zone.id);
      const definition=definitions.find(d=>d.id===zone.id);if(!saved&&definition.interactive)continue;const total=saved?.total??definition.legacyTotal;
      const maximum=Math.ceil(Math.max(definition.total,definition.legacyTotal)*Math.max(1.35,...Object.values(DIFFICULTY_RULES).map(rule=>rule.waveSize??1)));
      if(!saved||!Number.isInteger(total)||total<1||total>maximum||!statuses.has(saved.status)||!Array.isArray(saved.queue)||!saved.queue.every(v=>variants.has(v))||!Array.isArray(saved.waveIds)||!Number.isFinite(saved.spawned)||saved.spawned<0||saved.spawned>total||saved.queue.length>total)return false;
    }
    for(const [key,sequence] of [['power',restoredSequences.power],['valves',restoredSequences.valves]]){const saved=snapshot[key];if(saved&&(!Array.isArray(saved.input)||saved.input.length>sequence.length||!saved.input.every((id,i)=>id===sequence[i])||saved.solved&&saved.input.length!==sequence.length))return false;}
    if(snapshot.logs!==undefined&&(!Array.isArray(snapshot.logs)||snapshot.logs.some(id=>!devices.some(d=>d.kind==='log'&&d.id===id))))return false;
    if(snapshot.artifacts!==undefined&&(!Array.isArray(snapshot.artifacts)||snapshot.artifacts.length>3||new Set(snapshot.artifacts).size!==snapshot.artifacts.length||snapshot.artifacts.some(id=>!ARTIFACTS.some(a=>a.id===id))))return false;
    if(snapshot.evacuation!==undefined&&(!snapshot.evacuation||typeof snapshot.evacuation!=='object'||!Number.isFinite(snapshot.evacuation.remaining)||snapshot.evacuation.remaining<0||snapshot.evacuation.remaining>20))return false;
    if(snapshot.operationZoneIds!=null&&(!Array.isArray(snapshot.operationZoneIds)||snapshot.operationZoneIds.some(id=>!zones.some(z=>z.id===id))))return false;
    const taskDefaults=createOperationTasks(),rawTasks=snapshot.operationTasks;
    if(rawTasks?.genInserted!==undefined&&typeof rawTasks.genInserted!=='boolean')return false;
    if(rawTasks!==undefined&&(!rawTasks||typeof rawTasks!=='object'||Array.isArray(rawTasks)))return false;
    const savedTasks=rawTasks?{...taskDefaults,...rawTasks,genInserted:rawTasks.genInserted??!!rawTasks.commandRepair}:taskDefaults;
    const restoredCircuit=snapshot.circuit===undefined?(savedTasks.commandRepair?{rotations:[...WIRE_SOLUTION],powered:true,solved:true}:createWireCircuit()):createWireCircuit(snapshot.circuit);
    if(!restoredCircuit||restoredCircuit.solved!==savedTasks.commandRepair||restoredCircuit.powered&&!savedTasks.genInserted)return false;
    if(!savedTasks||typeof savedTasks!=='object'||['commandFuse','genInserted','commandRepair','researchCoolant','evacPower'].some(key=>typeof savedTasks[key]!=='boolean')||!savedTasks.nestRelay||['started','linked','decoded'].some(key=>typeof savedTasks.nestRelay[key]!=='boolean')||!Number.isFinite(savedTasks.nestRelay.remaining)||savedTasks.nestRelay.remaining<0||savedTasks.nestRelay.remaining>30)return false;
    if(snapshot.operationId!=null&&!['breach','command','research','containment','nest'].includes(snapshot.operationId))return false;
    state.circuit=restoredCircuit;state.operationId=snapshot.operationId??null;state.operationTasks=JSON.parse(JSON.stringify(savedTasks));state.milestone=Number.isFinite(snapshot.milestone)?Math.max(0,Math.floor(snapshot.milestone)):0;
    state.remix=snapshot.remix===true;state.archive.sequence=restoredSequences.archive;state.power.sequence=restoredSequences.power;state.valves.sequence=restoredSequences.valves;refreshClueLabels();
    state.operationZoneIds=snapshot.operationZoneIds?[...snapshot.operationZoneIds]:null;
    state.mission=['campaign','siege','nest'].includes(snapshot.mission)?snapshot.mission:'campaign';
    for(const key of ['power','valves']){state[key].input=[...(snapshot[key]?.input??[])];state[key].solved=!!snapshot[key]?.solved;}
    state.artifacts=[...(snapshot.artifacts??[])];nestExitAllowance=false;legacyNestEscape=snapshot.artifacts===undefined;
    state.logs=Array.isArray(snapshot.logs)?snapshot.logs.filter(id=>devices.some(d=>d.kind==='log'&&d.id===id)):[];
    state.evacuation.started=!!snapshot.evacuation?.started;state.evacuation.remaining=Math.max(0,Math.min(20,snapshot.evacuation?.remaining ?? 20));state.evacuation.completed=!!snapshot.evacuation?.completed;
    state.elapsed=Number.isFinite(snapshot.elapsed)?Math.max(0,snapshot.elapsed):0;
    archiveEntered=!!snapshot.archiveEntered;securityEntered=!!snapshot.securityEntered;
    state.archive.input=[...snapshot.archive.input];state.archive.solved=!!snapshot.archive.solved;
    state.relay.completed=!!snapshot.relay.completed;state.relay.started=!!snapshot.relay.started&&!state.relay.completed;
    state.relay.remaining=state.relay.started?Math.max(0,Math.min(8,Number(snapshot.relay.remaining)||0)):0;
    for(const d of devices){
      if(d.kind==='glyph'){d.active=state.archive.solved||state.archive.input.includes(d.glyph);d.progress=d.active?1:0;}
      else if(d.kind==='task'){const relay=state.operationTasks.nestRelay;d.active=d.task==='nestStart'?relay.started||relay.linked:d.task==='nestLink'?relay.linked:d.task==='nestDecode'?relay.decoded:!!state.operationTasks[d.task];d.progress=d.active?1:0;}
      else if(d.kind==='wire'){d.active=state.circuit.solved;d.progress=state.circuit.rotations[d.index]/4;}
      else if(d.kind==='artifact'){d.active=state.artifacts.includes(d.id);d.progress=d.active?1:0;}
      else if(d.kind==='log'){d.active=state.logs.includes(d.id);d.progress=d.active?1:0;}
      else if(d.kind==='power'||d.kind==='valve'){const puzzle=d.kind==='power'?state.power:state.valves;d.active=puzzle.solved||puzzle.input.includes(d.id);d.progress=d.active?1:0;}
      else{d.active=state.relay.completed||d.id==='relay-a'&&state.relay.started;d.progress=state.relay.completed?1:d.id==='relay-a'?state.relay.remaining/8:0;}
    }
    for(const zone of zones){
      const saved=snapshot.zones.find(item=>item&&item.id===zone.id);if(!saved){zone.status='dormant';zone.total=scaledTotal(definitions.find(d=>d.id===zone.id));zone.spawned=0;zone.queue=[];zone.wave=[];zone.spawnTimer=0;refreshCounts(zone);continue;}zone.total=saved.total??definitions.find(d=>d.id===zone.id).legacyTotal;zone.status=saved.status;zone.spawned=Math.floor(saved.spawned);zone.queue=[...saved.queue];zone.wave=[];
      zone.spawnTimer=Number.isFinite(saved.spawnTimer)?Math.max(0,Math.min(4,saved.spawnTimer)):0;
      for(let i=0;i<saved.waveIds.length;i++){
        const id=saved.waveIds[i],enemy=enemyById instanceof Map?enemyById.get(id):enemyById?.[id];
        if(enemy)zone.wave.push(enemy);
        else if(zone.status==='active'){
          // Requeue missing references rather than accidentally releasing an arena.
          const variant=saved.waveVariants?.[i];zone.queue.push(variants.has(variant)?variant:'normal');zone.spawned=Math.max(0,zone.spawned-1);
        }
      }
      if(zone.status==='cleared'||zone.status==='dormant'){zone.queue.length=0;zone.wave.length=0;}
      refreshCounts(zone);
    }
    state.totalEnemies=zones.reduce((sum,zone)=>sum+zone.total,0);recomputeLocks();return true;
  }
  function startMission(mission,player){
    if(!['siege','nest'].includes(mission))return false;
    state.mission=mission;
    state.archive.solved=true;state.archive.input=[...state.archive.sequence];state.relay.started=false;state.relay.remaining=0;state.relay.completed=true;
    archiveEntered=securityEntered=true;
    for(const d of devices.filter(d=>['glyph','relay'].includes(d.kind))){d.active=true;d.progress=1;}
    for(const zone of zones){
      const skip=['security','storage','command'].includes(zone.id)||mission==='nest'&&zone.id!=='nest';
      zone.status=skip?'cleared':'dormant';zone.spawned=skip?zone.total:0;zone.queue.length=0;zone.wave.length=0;zone.spawnTimer=0;refreshCounts(zone);
    }
    player.x=mission==='siege'?59:85;player.z=mission==='siege'?30:10;
    recomputeLocks();hint(mission==='siege'?'Restore Reactor routing, eliminate the swarm, then hold for evacuation.':'Destroy the nest horde and recover the research intel.');
    // The regular active-game update launches the checkpoint arena, preserving
    // the same wave rules as a full campaign without spawning in the menu.
    return true;
  }
  recomputeLocks();
  return {state,interact,getPrompt,refreshLocks:recomputeLocks,getDoorLead:index=>{recomputeLocks();return doors[index]?.hintTarget?{...doors[index].hintTarget}:null;},update,serializeState,restoreState,startMission,isMissionComplete:()=>state.mission==='siege'?state.evacuation.completed:state.mission==='nest'?nest.status==='cleared':false,canCollectIntel:()=>nest.status==='cleared'};
}
