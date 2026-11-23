const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {PRIMARY_WEAPONS}=require('../src/arsenal.js'),{createEconomy}=require('../src/economy.js'),{ROACH_VARIANTS}=require('../src/roach.js'),{DIFFICULTY_RULES}=require('../src/difficulty.js'),{encounterStats}=require('../src/campaign-threat.js'),{projectileDamage}=require('../src/weapon-tuning.js'),{updateRoachEnemy,applyEnemyStagger}=require('../src/enemy-ai.js');
const {operatorMoveSpeed}=require('../src/combat-movement.js');
const source=fs.readFileSync('src/main.js','utf8'),damageSource=source.slice(source.indexOf('function applyPlayerDamage('),source.indexOf('function reloadDuration('));
const BUILDS={stock:{id:'carbine'},damage:{id:'carbine',damage:1},handling:{id:'carbine',magazine:2,reload:2},precision:{id:'marksman',damage:1}};
function weaponFor(build){const base=PRIMARY_WEAPONS.find(gun=>gun.id===build.id),key=base.id==='carbine'?'rifle':base.id,economy=createEconomy({credits:10000});for(const kind of ['damage','magazine','reload'])for(let n=0;n<(build[kind]??0);n++)assert.equal(economy.purchase(key+'.'+kind).ok,true);return {...base,...economy.stats(base.id,{damage:base.baseDamage,capacity:base.capacity,reload:base.reload,interval:base.interval})};}
/** Fixed synthetic defend/circle encounter, not a full mission or a phone player model.
 * All builds face exactly the same roster, 80% deterministic aim, identical circular route and
 * one-second hold every six seconds. Holding the trigger uses the live firing
 * movement policy; releasing during reload permits its actual sprint speed.
 * Uses live mutation AI, real armor damage,
 * upgrade purchases, body armor and hurt grace. Reserve is fixed250 to isolate
 * combat exposure; no loot, skills, grenades, healing, body separation or map A*.
 */
function simulate(build,encounter='hospital-ward',difficulty='normal'){
 const gun=weaponFor(build),rules=DIFFICULTY_RULES[difficulty],roster=['normal','runner','normal','brute','normal','runner','normal','charger','normal','runner','normal','brute','normal','runner','normal','sentinel'];
 const enemies=roster.map((variant,i)=>{const stats=encounterStats(ROACH_VARIANTS[variant],rules,encounter,variant),a=i*Math.PI*2/roster.length;return {...stats,id:'e'+i,variant,encounter,x:Math.cos(a)*5.5,z:Math.sin(a)*5.5,maxHp:stats.hp,alerted:true,cooldown:.7,staggerTime:0,mesh:{rotation:{y:0},userData:{}}};});
 const player={x:3.2,z:0,hp:100,maxHp:100,hurtGrace:0},economy={state:{shield:40}},ctx={player,economy,audio:{bite(){}},skillEffects:()=>({armorDamageMultiplier:1})};ctx.shotRecovery??=require('../src/combat-movement.js').createShotRecovery();ctx.fieldAbility??=require('../src/field-ability.js').createFieldAbility();ctx.checkpointPrimaryAmmo=require('../src/checkpoint-ammo.js').checkpointPrimaryAmmo;ctx.projectileDamage=require('../src/weapon-tuning.js').projectileDamage;vm.createContext(ctx);vm.runInContext(damageSource,ctx);
 let time=0,fire=0,reload=0,ammo=gun.capacity,reserve=250,shots=0,reloads=0,reloadExposure=0,hits=0,rawDamage=0,angle=0,firingTravel=0,sprintTravel=0;const dt=.02;
 const lineOfSight=()=>true,move=(enemy,x,z)=>{enemy.x=Math.max(-7,Math.min(7,enemy.x+x));enemy.z=Math.max(-7,Math.min(7,enemy.z+z));};
 for(let tick=0;tick<4500&&player.hp>0&&enemies.some(e=>e.hp>0);tick++){
  time=tick*dt;const cycle=time%6,triggerHeld=reload<=0&&ammo>0,speed=operatorMoveSpeed({sprint:true,firing:triggerHeld,sprintMultiplier:1});if(cycle<5){angle+=speed*dt/3.2;if(triggerHeld)firingTravel+=speed*dt;else sprintTravel+=speed*dt;}player.x=Math.cos(angle)*3.2;player.z=Math.sin(angle)*3.2;player.hurtGrace=Math.max(0,player.hurtGrace-dt);fire=Math.max(0,fire-dt);
  if(reload>0){reloadExposure+=dt;reload=Math.max(0,reload-dt);if(reload===0){const fill=Math.min(gun.capacity,reserve);ammo=fill;reserve-=fill;}}
  if(reload===0&&fire===0){if(ammo===0&&reserve>0){reload=gun.reload;reloads++;}else if(ammo>0){const target=enemies.filter(e=>e.hp>0&&Math.hypot(e.x-player.x,e.z-player.z)<gun.range).sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0];if(target){ammo--;shots++;fire=gun.interval;if(shots%5!==0){target.hp=Math.max(0,target.hp-projectileDamage(gun,target,player));if(gun.stagger)applyEnemyStagger(target,gun.stagger);}}}}
  for(const enemy of enemies)if(enemy.hp>0)updateRoachEnemy(enemy,player,dt,{lineOfSight,move,onBite:damage=>{rawDamage+=damage;if(ctx.applyPlayerDamage(damage))hits++;}});
 }
 return {time:Number(time.toFixed(2)),shots,reloads,reloadExposure:Number(reloadExposure.toFixed(2)),damageTaken:100-player.hp,armorSpent:40-economy.state.shield,hits,rawDamage,firingTravel:Number(firingTravel.toFixed(2)),sprintTravel:Number(sprintTravel.toFixed(2)),killed:enemies.filter(e=>e.hp===0).length,total:enemies.length,survived:player.hp>0,complete:enemies.every(e=>e.hp===0)};
}
test('stock, damage, handling and precision builds are compared in the same live-AI scenarios without skipping stock',t=>{
 for(const encounter of ['reactor','hospital-ward','signal-uplink'])for(const difficulty of ['normal','hard']){
  const results=Object.fromEntries(Object.entries(BUILDS).map(([name,build])=>[name,simulate(build,encounter,difficulty)]));
  for(const [name,result]of Object.entries(results)){assert.ok(result.time>0&&result.shots>0,name);for(const key of ['time','shots','reloads','reloadExposure','damageTaken','armorSpent','hits'])assert.ok(Number.isFinite(result[key])&&result[key]>=0,key);assert.ok(result.killed<=result.total);assert.equal(result.complete,result.killed===result.total);assert.ok(result.damageTaken<=100);}
  assert.ok(results.damage.killed>=results.stock.killed,'damage investment cannot reduce kills under this fixed route');
  if(results.stock.complete&&results.damage.complete){assert.ok(results.damage.shots<results.stock.shots,'investment must reduce shots at actual health breakpoints');assert.ok(results.damage.time<results.stock.time,'reduced shots must matter in actual fire/reload cycles');}
  if(results.stock.complete&&results.handling.complete)assert.ok(results.handling.reloadExposure<results.stock.reloadExposure,'handling must reduce exposure rather than inflate paper DPS only');
  assert.ok(results.precision.shots<results.stock.shots||results.precision.killed>results.stock.killed,'precision should have a measurable shot-economy niche');
  t.diagnostic(encounter+' '+difficulty+' '+JSON.stringify(results));
 }
});
test('comparison traces are deterministic and register real incoming damage with armor and hurt grace',()=>{
 const first=simulate(BUILDS.stock),again=simulate(BUILDS.stock);assert.deepEqual(first,again);assert.ok(first.hits>0,'a stationary-target DPS calculation is not an encounter test');assert.ok(first.armorSpent>0);assert.ok(first.rawDamage>=first.damageTaken+first.armorSpent);assert.ok(first.reloads>0);
});
test('actual movement policy prevents sprint firing while retaining deliberate sprint disengagement',()=>{
 for(const sprintMultiplier of [1,1.1,1.15]){assert.equal(operatorMoveSpeed({sprint:true,firing:true,sprintMultiplier}),4);assert.equal(operatorMoveSpeed({sprint:true,firing:false,sprintMultiplier}),6*sprintMultiplier);assert.equal(operatorMoveSpeed({grabbed:true,sprint:true,firing:true,sprintMultiplier}),2.4);}
 const result=simulate(BUILDS.stock);assert.ok(result.firingTravel>0);assert.ok(result.sprintTravel>0,'reloading model releases the trigger to deliberately disengage');
 assert.match(source,/speed=operatorMoveSpeed\(\{grabbed:puzzle.grabbed!=null,sprint:/,'main must use the shared policy rather than leave tests disconnected');
});
test('Vesper sustained stagger cannot indefinitely prevent ranged and area mutations from completing their attacks',()=>{
 const gun=PRIMARY_WEAPONS.find(g=>g.id==='vesper');
 for(const variant of ['spitter','screecher']){
  const enemy={...encounterStats(ROACH_VARIANTS[variant],DIFFICULTY_RULES.normal,'signal-relay',variant),id:'special',variant,hp:1000,x:0,z:0,alerted:true,spitCooldown:0,shriekCooldown:0,staggerTime:0,mesh:{rotation:{y:0},userData:{}}},player={x:variant==='spitter'?5:2.8,z:0};let shots=0,accepted=0,attacks=0,next=0;
  // Keep the test body alive to observe whether the ability can execute at all.
  // Actual Vesper bullets still call this same stagger path after dealing damage.
  for(let i=0;i<1500;i++){const elapsed=i*.02;if(elapsed+1e-8>=next){shots++;if(applyEnemyStagger(enemy,gun.stagger))accepted++;next+=gun.interval;}updateRoachEnemy(enemy,player,.02,{lineOfSight:()=>true,move:()=>{},onBite:()=>attacks++});}
  assert.ok(accepted>0&&accepted<shots/2,'there must be visible stagger windows and resisted follow-up hits');assert.ok(attacks>0,variant+': continuous suppression may interrupt an attack, not permanently remove the mutation ability');
 }
});
module.exports={simulate,weaponFor,BUILDS};
