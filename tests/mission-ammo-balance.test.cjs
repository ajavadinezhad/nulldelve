const {test}=require('node:test'),assert=require('node:assert/strict');
const {PRIMARY_WEAPONS,primaryReserve,shotDirections}=require('../src/arsenal.js');
const {createProgression}=require('../src/progression.js');
const {ROACH_VARIANTS}=require('../src/roach.js');
const {DIFFICULTY_RULES}=require('../src/difficulty.js');
const {createLootState,dropEnemyLoot,collectNearbyLoot,refillMagazine}=require('../src/loot.js');
const OPERATIONS={breach:['security','storage'],command:['command','generator'],research:['lab','reactor','transit'],containment:['containment','evacuation'],nest:['nest']};
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
 return Object.fromEntries(progression.state.zones.map(zone=>[zone.id,[...zone.wave.map(enemy=>enemy.variant),...zone.queue]]));
}
// Economy-only projection: no enemy damage, grenades, barrels or melee; all drops
// recovered. Pellet rays hit real body sizes at3m, and whole shots miss on cadence.
function runSupply(weapon,difficulty,mobs,missEvery,upgrade=0){
 const rules=DIFFICULTY_RULES[difficulty],weapons={rifle:{...weapon,damage:weapon.baseDamage+upgrade,reserve:primaryReserve(weapon.id),ammo:weapon.capacity},pistol:{capacity:12,damage:2,pellets:1,reserve:rules.pistolReserve,ammo:12}};
 const player={x:0,z:0,hp:100,maxHp:100,ammo:weapon.capacity},loot=createLootState();let selected='rifle',killed=0,shots=0;
 for(const variant of mobs){
  const maxHp=Math.ceil(ROACH_VARIANTS[variant].hp*rules.hp);let hp=maxHp;
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
 for(const difficulty of ['easy','normal','hard']){const queues=encounterQueues(difficulty);for(const weapon of PRIMARY_WEAPONS)for(const upgrade of [0,1])for(const [operation,ids]of Object.entries(OPERATIONS)){const mobs=ids.flatMap(id=>queues[id]);assert.ok(mobs.length>0);const result=runSupply(weapon,difficulty,mobs,missEvery,upgrade);assert.equal(result.killed,mobs.length,`${difficulty} ${operation} ${weapon.id} damage upgrade${upgrade}: ${result.killed}/${mobs.length}`);}}
});
module.exports={encounterQueues,runSupply,OPERATIONS};
