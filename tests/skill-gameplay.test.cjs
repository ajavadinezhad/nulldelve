const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {fieldSkillEffects,effectiveFieldStats}=require('../src/field-skills.js');
const {createGrenadeActions}=require('../src/grenade-actions.js');
const {createFireZones}=require('../src/fire-grenades.js');
const source=fs.readFileSync(new URL('../src/main.js',`file://${__filename}`),'utf8');
const noop=()=>{};
function fragment(start,end){const at=source.indexOf(start),stop=source.indexOf(end,at);assert.ok(at>=0&&stop>at);return source.slice(at,stop);}
function context(skill,extra={}){const ctx={activeFieldSkill:skill,effectiveFieldStats,skillEffects:()=>fieldSkillEffects(skill),Math,Number,...extra};vm.createContext(ctx);return ctx;}
test('plating spends less existing armor, preserves overflow damage and never protects an unarmored player',()=>{
 for(const [skill,shield,expectedHp,expectedShield]of [['none',10,100,0],['plating',10,100,2],['plating',4,95,0],['plating',0,90,0]]){
  const ctx=context(skill,{player:{hp:100,hurtGrace:0},economy:{state:{shield}},audio:{bite:noop}});vm.runInContext(fragment('function applyPlayerDamage','function beginReload'),ctx);assert.equal(vm.runInContext('applyPlayerDamage(10)',ctx),true);assert.ok(Math.abs(ctx.player.hp-expectedHp)<1e-8);assert.ok(Math.abs(ctx.economy.state.shield-expectedShield)<1e-8);assert.equal(vm.runInContext('applyPlayerDamage(10)',ctx),false);
 }
});
test('quickloader reduces both weapon reload duration without compounding or creating ammo',()=>{
 const {refillMagazine}=require('../src/loot.js');
 for(const selected of ['rifle','pistol']){const ctx=context('quickloader',{grenadeActions:null,reload:0,fire:0,meleeCooldown:0,selected,player:{ammo:0},weapons:{rifle:{capacity:30,reload:2,reserve:7},pistol:{capacity:12,reload:1,reserve:3}},refillMagazine,audio:{reload:noop},hud:noop});vm.runInContext(fragment('function beginReload','function resumeRun'),ctx);const duration=ctx.weapons[selected].reload*.88;vm.runInContext('beginReload()',ctx);assert.ok(Math.abs(ctx.reload-duration)<1e-8);vm.runInContext('beginReload()',ctx);assert.ok(Math.abs(ctx.reload-duration)<1e-8);ctx.dt=duration;vm.runInContext('advanceWeaponTimers(dt)',ctx);assert.equal(ctx.player.ammo,selected==='rifle'?7:3);assert.equal(ctx.weapons[selected].reserve,0);assert.equal(ctx.weapons[selected].reload,selected==='rifle'?2:1);}
});
test('close quarters changes actual melee damage while keeping cooldown, targeting and kill flow',()=>{
 for(const [skill,expected]of [['none',2],['closequarters',1]]){const enemy={hp:3,mesh:{visible:true}},ctx=context(skill,{player:{x:0,z:0,angle:0},aim:{x:0,z:-1},enemies:[enemy],los:()=>true,meleeTargets:()=>[enemy],meleeCooldown:0,trace:noop,applyEnemyStagger:noop,rewardEnemyKill:noop,updateEnemyHealthBar:noop,audio:{melee:noop},hud:noop});vm.runInContext(fragment('function knifeStrike()','\n\nattachGraphicsRecovery'),ctx);vm.runInContext('knifeStrike()',ctx);assert.equal(enemy.hp,expected);assert.equal(ctx.meleeCooldown,.55);vm.runInContext('knifeStrike()',ctx);assert.equal(enemy.hp,expected);}
});
test('advanced medicine consumes one kit and clamps its real healing to missing health',()=>{
 for(const [hp,expected]of [[10,95],[80,100]]){let consumed=0;const ctx=context('triage',{player:{hp,maxHp:100},economy:{consume:()=>{consumed++;return true;}},operationStats:{medkits:0},persistCampaignProfile:noop,audio:{pickup:noop},hud:noop,toast:noop});vm.runInContext(fragment('function useMedkit()','function throwGrenade'),ctx);vm.runInContext('useMedkit()',ctx);assert.equal(ctx.player.hp,expected);assert.equal(consumed,1);assert.equal(ctx.operationStats.medkits,1);}
});
test('steady throw charges faster but leaves release animation and flight timing unchanged',()=>{
 const player={x:0,z:0,angle:0},aim={x:10,z:0};let impact=[0,0];const actions=['none','steadythrow'].map((id,i)=>createGrenadeActions({getChargeDuration:()=>fieldSkillEffects(id).grenadeChargeMultiplier,onImpact:()=>impact[i]++}));for(const a of actions){a.begin();a.update(.5,player,aim);}assert.ok(Math.abs(actions[0].power-.4)<1e-8);assert.ok(Math.abs(actions[1].power-.5)<1e-8);for(const a of actions){a.cancel();a.launch(player,aim,1);}for(let i=0;i<15;i++){for(const a of actions)a.update(.1,player,aim);assert.equal(impact[0],impact[1]);}assert.deepEqual(impact,[1,1]);
});
test('all demolition ranks affect actual ground fire, danger and persisted radius',()=>{
 for(const id of ['demolition','ordnance','widearea']){const hits=[],radius=2.6*fieldSkillEffects(id).grenadeRadiusMultiplier,fire=createFireZones(null,{onDamage:e=>hits.push(e)});fire.burst(10,10,fieldSkillEffects(id).grenadeRadiusMultiplier);const restored=createFireZones(null,{onDamage:e=>hits.push(e)});assert.equal(restored.restore(fire.serialize()),true);assert.ok(Math.abs(restored.serialize().zones[0].radius-radius)<1e-8);const enemy={x:10+radius-.01,z:10,hp:10},player={x:10,z:10+radius-.01,hp:100},outside={x:10+radius+.01,z:10,hp:10};restored.update(.6,[enemy,player,outside]);assert.ok(hits.includes(enemy));assert.ok(hits.includes(player));assert.ok(!hits.includes(outside));}
});
test('missing new effect fields keep baseline damage and reload finite',()=>{
 const ctx=context('none',{skillEffects:()=>({}),player:{hp:100,hurtGrace:0,ammo:0},economy:{state:{shield:4}},audio:{bite:noop,reload:noop},weapons:{rifle:{reload:2,capacity:30,reserve:20}},selected:'rifle',reload:0,grenadeActions:null,hud:noop});vm.runInContext(fragment('function applyPlayerDamage','function resumeRun'),ctx);assert.equal(vm.runInContext('applyPlayerDamage(10)',ctx),true);assert.equal(ctx.player.hp,94);vm.runInContext('beginReload()',ctx);assert.equal(ctx.reload,2);
});


test('all explosive ranks apply their radius at actual grenade detonation without bypassing walls or delayed spawns',()=>{
 for(const skill of ['none','demolition','ordnance','widearea']){
  const multiplier=fieldSkillEffects(skill).grenadeRadiusMultiplier,radius=3*multiplier;
  for(const fire of [false,true]){
   const inside={x:radius-.01,z:0,hp:20,radius:0,mesh:{}},outside={x:radius+.01,z:0,hp:20,radius:0,mesh:{}},hidden={x:1,z:1,hp:20,radius:0,mesh:{}},pending={x:1,z:0,hp:20,radius:0,spawnDelay:.1,mesh:{}};
   let burstRadius=0,fireRadius=0;const ctx=context(skill,{ended:false,player:{x:0,z:20,hp:100},enemies:[inside,outside,hidden,pending],barrelSystem:{explodeNear:(_x,_z,r)=>burstRadius=r},fireZones:{burst:(_x,_z,m)=>fireRadius=m},audio:{explosion:noop},menu:{settings:{reducedEffects:true}},los:(_x,_z,x,z)=>!(x===1&&z===1),updateEnemyHealthBar:noop,rewardEnemyKill:()=>assert.fail('nonlethal test'),applyPlayerDamage:()=>assert.fail('operator outside radius'),end:noop,hud:noop});
   vm.runInContext(fragment('function detonateGrenade','function beginGrenadeCharge'),ctx);ctx.fire=fire;vm.runInContext('detonateGrenade(0,0,fire)',ctx);
   assert.equal(inside.hp,fire?18:12);assert.equal(outside.hp,20);assert.equal(hidden.hp,20);assert.equal(pending.hp,20);assert.equal(fire?fireRadius:burstRadius,fire?multiplier:radius);
  }
 }
});
