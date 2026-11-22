const {test}=require('node:test'),assert=require('node:assert/strict');
const {PRIMARY_WEAPONS,primaryReserve,shotDirections}=require('../src/arsenal.js');
const {createProgression,hospitalFlowSequence}=require('../src/progression.js');
const {deployCampaignOperation}=require('../src/campaign-operations.js');
const {createPressurePuzzle}=require('../src/pressure-puzzle.js');
const {ROACH_VARIANTS}=require('../src/roach.js');
const {DIFFICULTY_RULES}=require('../src/difficulty.js');
const {grantHospitalAmmo,grantSignalAmmo}=require('../src/mission-supplies.js');
const {createLootState,dropEnemyLoot,collectNearbyLoot,refillMagazine}=require('../src/loot.js');
const OPERATIONS={breach:['security','storage'],command:['command','generator'],research:['lab','reactor','transit'],containment:['containment','evacuation'],nest:['nest'],hospital:['hospital-triage','hospital-ward','hospital-isolation'],freight:['freight-pumps','freight-yard','freight-cold'],signal:['signal-yard','signal-relay','signal-uplink']};
// Use actual generated queues, not a duplicate table of encounter compositions.
function encounterQueues(difficulty){
 const enemies=[],progression=createProgression({doors:Array.from({length:18},()=>({})),enemies,getDifficulty:()=>difficulty,spawnEnemy:(x,z,variant)=>{const enemy={id:'e'+enemies.length,x,z,variant,hp:2};enemies.push(enemy);return enemy;}});
 progression.interact({x:19.5,z:7});progression.interact({x:27,z:13});
 for(const [x,z]of [[23,26],[38,10],[59,10],[59,30],[86,30]])progression.update({x,z},.01);
 // Satisfy prerequisite locks only to ask the controller for interactive queues.
 for(const zone of progression.state.zones)if(['command','lab','reactor','containment'].includes(zone.id))zone.status='cleared';
 progression.state.power.solved=true;progression.state.valves.solved=true;progression.state.operationTasks.commandFuse=true;
 for(const id of ['task-generator','task-coolant','task-evac'])progression.interact(progression.state.devices.find(device=>device.id===id));
 progression.state.artifacts=['artifact-archive','artifact-generator','artifact-containment'];progression.update({x:85,z:10},.01);
 return {...Object.fromEntries(progression.state.zones.map(zone=>[zone.id,[...zone.wave.map(enemy=>enemy.variant),...zone.queue]])),...hospitalQueues(difficulty),...freightQueues(difficulty),...signalQueues(difficulty)};
}
// Deploy and progress actual hospital task actions to obtain each authored wave.
function hospitalQueues(difficulty){
 const enemies=[],doors=Array.from({length:26},()=>({})),player={x:112,z:56},puzzle=createPressurePuzzle(),queues={};
 const progression=createProgression({doors,enemies,getDifficulty:()=>difficulty,spawnEnemy:(x,z,variant)=>{const enemy={id:'hospital-e'+enemies.length,x,z,variant,hp:2};enemies.push(enemy);return enemy;}});
 assert.equal(deployCampaignOperation('hospital',{player,puzzle,progression,doors}),true);
 const use=id=>{const device=progression.state.devices.find(d=>d.id===id);assert.ok(device,id);Object.assign(player,{x:device.x,z:device.z});assert.equal(progression.interact(player),true,id);};
 const capture=(id,x,z)=>{Object.assign(player,{x,z});progression.update(player,.01);const zone=progression.state.zones.find(zone=>zone.id===id);assert.equal(zone.status,'active',id);queues[id]=[...zone.wave.map(enemy=>enemy.variant),...zone.queue];for(let i=0;i<1000&&zone.status==='active';i++){zone.wave.forEach(enemy=>enemy.hp=0);progression.update(player,.1);}assert.equal(zone.status,'cleared',id);};
 use('hospital-fuse');use('hospital-power');capture('hospital-triage',112,10);use('hospital-sample');capture('hospital-ward',136,10);use('hospital-auth');
 for(const [i,target]of require('../src/progression.js').hospitalAirlockTarget(false).entries())for(let n=0;n<target;n++)use(['hospital-oxygen','hospital-filter','hospital-saline'][i]);use('hospital-cycle');for(let n=0;n<24;n++)progression.update(player,.5);
 capture('hospital-isolation',136,52);return queues;
}
// Follow authored freight interactions to obtain its actual staged opposition.
function freightQueues(difficulty){
 const enemies=[],doors=Array.from({length:32},()=>({})),player={x:162,z:57},puzzle=createPressurePuzzle(),queues={};
 const progression=createProgression({doors,enemies,getDifficulty:()=>difficulty,spawnEnemy:(x,z,variant)=>{const e={id:'f'+enemies.length,x,z,variant,hp:2};enemies.push(e);return e;}});deployCampaignOperation('freight',{player,puzzle,progression,doors});
 const use=id=>{Object.assign(player,progression.state.devices.find(d=>d.id===id));progression.interact(player);};
 const capture=(id,x,z)=>{Object.assign(player,{x,z});progression.update(player,.01);const zone=progression.state.zones.find(z=>z.id===id);assert.equal(zone.status,'active',id);queues[id]=[...zone.wave.map(e=>e.variant),...zone.queue];for(let n=0;n<100&&zone.status==='active';n++){zone.wave.forEach(e=>e.hp=0);progression.update(player,4);}assert.equal(zone.status,'cleared',id);};
 capture('freight-pumps',162,30);use('freight-pump');capture('freight-yard',186,30);use('freight-switch-a');use('freight-dispatch');progression.update(player,8);capture('freight-cold',186,10);return queues;
}
function signalQueues(difficulty){
 const enemies=[],doors=Array.from({length:38},()=>({})),player={},puzzle=createPressurePuzzle(),queues={};
 const progression=createProgression({doors,enemies,getDifficulty:()=>difficulty,spawnEnemy:(x,z,variant)=>{const e={id:'signal'+enemies.length,x,z,variant,hp:2};enemies.push(e);return e;}});deployCampaignOperation('signal',{player,puzzle,progression,doors});
 const use=id=>{Object.assign(player,progression.state.devices.find(d=>d.id===id));progression.interact(player);};
 const capture=(id,x,z)=>{Object.assign(player,{x,z});progression.update(player,.01);const zone=progression.state.zones.find(z=>z.id===id);assert.equal(zone.status,'active',id);queues[id]=[...zone.wave.map(e=>e.variant),...zone.queue];for(let n=0;n<100&&zone.status==='active';n++){zone.wave.forEach(e=>e.hp=0);progression.update(player,4);}assert.equal(zone.status,'cleared',id);};
 capture('signal-yard',212,30);use('signal-motor-a');use('signal-motor-b');use('signal-motor-c');use('signal-motor-c');use('signal-load');capture('signal-relay',236,30);use('signal-antenna-a');use('signal-antenna-b');use('signal-shutdown');capture('signal-uplink',236,10);return queues;
}
// Economy-only projection: no enemy damage, grenades, barrels or melee; all drops
// recovered; Hospital uses its two actual finite route allotments. Pellet rays hit real body sizes at3m, and whole shots miss on cadence.
function runSupply(weapon,difficulty,mobs,missEvery,upgrade=0,supplyStops=[],supplyBudget=64){
 const rules=DIFFICULTY_RULES[difficulty],weapons={rifle:{...weapon,damage:weapon.baseDamage+upgrade,reserve:primaryReserve(weapon.id),ammo:weapon.capacity},pistol:{capacity:12,damage:2,pellets:1,reserve:rules.pistolReserve,ammo:12}};
 const player={x:0,z:0,hp:100,maxHp:100,ammo:weapon.capacity},loot=createLootState();let selected='rifle',killed=0,shots=0;
 for(const variant of mobs){
  if(supplyStops.includes(killed)){if(supplyBudget==='signal')grantSignalAmmo(weapons);else grantHospitalAmmo(weapons,supplyBudget);}
  const maxHp=Math.ceil(ROACH_VARIANTS[variant].hp*rules.hp);let hp=maxHp+(variant==='mender'?6:0); // Conservative: all three repairs land before this supporter is killed.
  while(hp>0){
   let gun=weapons[selected];
   if(player.ammo===0){player.ammo=refillMagazine(gun,0);if(!player.ammo){gun.ammo=0;selected=selected==='rifle'?'pistol':'rifle';gun=weapons[selected];player.ammo=gun.ammo||refillMagazine(gun,0);if(!player.ammo)break;}}
   player.ammo--;gun.ammo=player.ammo;shots++;
   if(shots%missEvery!==0){const hits=gun.pellets===1?1:shotDirections(1,0,gun).filter(ray=>Math.abs(ray.z*3)<=ROACH_VARIANTS[variant].radius+.12).length;hp-=gun.damage*hits;}
  }
  if(hp>0)break;
  dropEnemyLoot(loot,{x:0,z:0,variant,maxHp},{player,weapons,selected,difficulty});collectNearbyLoot(loot,player,weapons);killed++;
 }
 return {killed,rounds:weapons.rifle.reserve+weapons.rifle.ammo,pistol:weapons.pistol.reserve+weapons.pistol.ammo,shots};
}
for(const missEvery of [5,4])test(`whole-operation supply budgets support${Math.round((1-1/missEvery)*100)}% accuracy with either weapon and optional first damage upgrade`,()=>{
 for(const difficulty of ['easy','normal','hard']){const queues=encounterQueues(difficulty);for(const weapon of PRIMARY_WEAPONS)for(const upgrade of [0,1])for(const [operation,ids]of Object.entries(OPERATIONS)){const mobs=ids.flatMap(id=>queues[id]);assert.ok(mobs.length>0);const supplyStops=operation==='signal'?[queues['signal-yard'].length,queues['signal-yard'].length+queues['signal-relay'].length]:operation==='freight'?[queues['freight-pumps'].length,queues['freight-pumps'].length+queues['freight-yard'].length]:operation==='hospital'?[queues['hospital-triage'].length,queues['hospital-triage'].length+queues['hospital-ward'].length]:[];const result=runSupply(weapon,difficulty,mobs,missEvery,upgrade,supplyStops,operation==='signal'?'signal':64);assert.equal(result.killed,mobs.length,`${difficulty} ${operation} ${weapon.id} damage upgrade${upgrade}: ${result.killed}/${mobs.length}`);}}
});
module.exports={encounterQueues,runSupply,OPERATIONS};

test('Hospital remains completable with an upgraded pump shotgun at75% accuracy without a large leftover stockpile',()=>{const queues=encounterQueues('hard'),ids=OPERATIONS.hospital,mobs=ids.flatMap(id=>queues[id]),stops=[queues[ids[0]].length,queues[ids[0]].length+queues[ids[1]].length],weapon=PRIMARY_WEAPONS.find(weapon=>weapon.id==='shotgun'),result=runSupply(weapon,'hard',mobs,4,1,stops);assert.ok(mobs.includes('leaper')&&mobs.includes('screecher'),'projection must include the costly new mutations');assert.equal(result.killed,mobs.length);assert.ok(result.rounds+result.pistol>0);assert.ok(result.rounds+result.pistol<30,'survival budget should not become a large stockpile');});
