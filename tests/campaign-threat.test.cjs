const {test}=require('node:test'),assert=require('node:assert/strict');
const {campaignThreat,encounterStats}=require('../src/campaign-threat.js');
const {ROACH_VARIANTS}=require('../src/roach.js');
const {DIFFICULTY_RULES}=require('../src/difficulty.js');
test('campaign opposition escalates independently of equipment without changing player health',()=>{
 const zones=['security','command','lab','containment','nest','hospital-triage','freight-pumps','signal-yard'];
 for(const rules of Object.values(DIFFICULTY_RULES)){
  let last=0;
  for(const id of zones){const stats=encounterStats(ROACH_VARIANTS.normal,rules,id,'normal');assert.ok(stats.hp>=last);last=stats.hp;assert.equal(stats.biteDamage,Math.round(ROACH_VARIANTS.normal.biteDamage*rules.damage));assert.equal(stats.windupDuration,rules.windupDuration);assert.ok(stats.speed<=ROACH_VARIANTS.normal.speed*1.12+.001);}
  assert.equal(rules.maxHp,100);
 }
 assert.equal(campaignThreat('unknown').hp,1);assert.equal(encounterStats(ROACH_VARIANTS.normal,DIFFICULTY_RULES.easy,'signal-yard').behavior,'direct');assert.equal(encounterStats(ROACH_VARIANTS.normal,DIFFICULTY_RULES.normal,'hospital-triage').behavior,'flank');
});
test('later baseline weapons need materially more shots; damage upgrades recover headroom',()=>{
 const base=ROACH_VARIANTS.normal,early=encounterStats(base,DIFFICULTY_RULES.normal,'security','normal'),late=encounterStats(base,DIFFICULTY_RULES.normal,'hospital-ward','normal');
 assert.equal(early.hp,2);assert.equal(late.hp,4);assert.equal(Math.ceil(late.hp/2),early.hp);
 const boss=encounterStats(ROACH_VARIANTS.boss,DIFFICULTY_RULES.normal,'hospital-isolation','boss');assert.equal(boss.hp,44);assert.ok(Math.ceil(boss.hp/2)<boss.hp);
});
test('main uses the same threat policy for spawning and restored movement without healing saves',()=>{
 const source=require('node:fs').readFileSync('src/main.js','utf8');assert.match(source,/stats=encounterStats\(baseStats,rules,encounter,variant\)/);assert.match(source,/speed:encounterStats\(base,rules,saved.encounter,saved.variant\).speed/);assert.match(source,/\.\.\.base,\.\.\.saved,maxHp:saved.maxHp/);
});
test('first facility deployments continue at the previous sector exit',()=>{
 const {deployCampaignOperation,campaignOperationExit}=require('../src/campaign-operations.js'),{createProgression}=require('../src/progression.js'),{createPressurePuzzle}=require('../src/pressure-puzzle.js');
 for(const [prior,next]of [['breach','command'],['command','research'],['research','containment'],['containment','nest']]){const player={},progression=createProgression({doors:[],enemies:[],spawnEnemy:()=>null});assert.equal(deployCampaignOperation(next,{player,progression,puzzle:createPressurePuzzle(),doors:[]}),true);const exit=campaignOperationExit(prior);assert.equal(player.x,exit.x);assert.equal(player.z,exit.z);}
});
test('route supply grants once through the real interaction path, including the nested Nest relay flag',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),{createProgression}=require('../src/progression.js'),source=fs.readFileSync('src/main.js','utf8');
 for(const [operation,id]of [['research','route-sample'],['containment','route-isolate'],['nest','task-signal-c']]){
  const p=createProgression({doors:[],enemies:[],spawnEnemy:()=>null});p.state.operationId=operation;for(const z of p.state.zones)z.status='cleared';p.state.valves.solved=true;p.state.operationTasks.nestRelay.linked=true;
  const d=p.state.devices.find(d=>d.id===id),player={x:d.x,z:d.z};let grants=0;const noop=()=>{},ctx={player,progression:p,runConfig:{operation},puzzleSettings:{open:noop},liftTransfer:null,campaignOperationComplete:()=>false,collectSalvage:()=>false,queueCheckpoint:noop,weapons:{},grantHospitalAmmo:()=>grants++,audio:{pickup:noop},hud:noop};ctx.shotRecovery??=require('../src/combat-movement.js').createShotRecovery();ctx.fieldAbility??=require('../src/field-ability.js').createFieldAbility();ctx.checkpointPrimaryAmmo=require('../src/checkpoint-ammo.js').checkpointPrimaryAmmo;ctx.checkpointLoot=require('../src/checkpoint-ammo.js').checkpointLoot;ctx.projectileDamage=require('../src/weapon-tuning.js').projectileDamage;vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function interact('),source.indexOf('function actor(')),ctx);ctx.interact(d);assert.equal(grants,1,operation);ctx.interact(d);assert.equal(grants,1,operation+' cannot repeat its allotment');
 }
});
