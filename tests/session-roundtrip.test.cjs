const {createBurstFire}=require('../src/weapon-actions.js');
const {applyWeaponAttachment}=require('../src/weapon-attachments.js');
const {SKILL_NODES,createFieldSkills,fieldSkillEffects,effectiveFieldStats,normalizeFieldSkill}=require('../src/field-skills.js');
const {upgradeWorldSnapshot,WORLD_WIDTH,WORLD_HEIGHT,WORLD_DOOR_COUNT}=require('../src/world-layout.js');
const {compatibleStorage}=require('../src/storage-compat.js');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {createProgression}=require('../src/progression.js');
const {createEconomy}=require('../src/economy.js');
const {createPressurePuzzle}=require('../src/pressure-puzzle.js');
const {ROACH_VARIANTS}=require('../src/roach.js');
const {missionGuidance}=require('../src/session-rules.js');
const {createCampaignProfile}=require('../src/campaign-profile.js');
const {primaryWeapon,primaryReserve}=require('../src/arsenal.js');
const {createFireZones}=require('../src/fire-grenades.js');
const {createCampaignProgress}=require('../src/campaign-progress.js');
const {createLootState}=require('../src/loot.js');
const {campaignOperationGuidance}=require('../src/campaign-operations.js');
const {createOperationStats}=require('../src/operation-records.js');
const {validateSnapshot}=require('../src/snapshot-validation.js');
const source=fs.readFileSync(new URL('../src/main.js',`file://${__filename}`),'utf8');
const noop=()=>{};
const plain=value=>JSON.parse(JSON.stringify(value));
function fragment(start,end){const at=source.indexOf(start);assert.ok(at>=0,`main contains ${start}`);const stop=source.indexOf(end,at);assert.ok(stop>at,`main contains ${end}`);return source.slice(at,stop);}
function mesh(){return {position:{x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});},copy(value){Object.assign(this,value);}},visible:false};}
function session({expanded=false}={}){
 const elements=new Map();const $=selector=>{if(!elements.has(selector))elements.set(selector,{textContent:'',dataset:{},setAttribute(name,value){this[name]=value;}});return elements.get(selector);};
 const economy=createEconomy(),puzzle=createPressurePuzzle(),enemies=[],doors=Array.from({length:expanded?WORLD_DOOR_COUNT:18},()=>({open:false,slide:0,unlocked:false}));
 const difficultyRules={easy:{maxHp:150,speed:.85,damage:.65,hp:.8,magazine:40},normal:{maxHp:100,speed:1,damage:1,hp:1,magazine:30},hard:{maxHp:80,speed:1.12,damage:1.35,hp:1.15,magazine:24}};
 const ctx={replayRewardId:null,effectiveFieldStats,fieldSkills:createFieldSkills(null),applyWeaponAttachment,normalizeFieldSkill,activeFieldSkill:'none',activeFieldSkillState:null,barrelSystem:{state:[],serialize:()=>[],restore:noop},doorHint:{serializeSeen:()=>[],restoreSeen:noop,skip:noop},fireZones:createFireZones(null),campaignProgress:createCampaignProgress(null),active:false,ended:false,menu:{settings:{aimMode:'auto'}},lastPointer:null,campaignProfile:createCampaignProfile({storage:null,economy}),primaryWeapon,primaryReserve,updateOperationEnvironment:noop,operationStats:createOperationStats(),createOperationStats,validateSnapshot,upgradeWorldSnapshot,W:expanded?WORLD_WIDTH:101,H:WORLD_HEIGHT,runConfig:{mission:'campaign',difficulty:'normal',operation:null,remix:false},difficultyRules,rules:difficultyRules.normal,economy,puzzle,enemies,doors,loot:createLootState(),lootView:{clear:noop},createLootState,
  player:{x:7,z:29,hp:100,maxHp:100,ammo:30,intel:false,angle:0,hurtGrace:0},selected:'rifle',reload:0,nextEnemyId:1,
  weapons:{rifle:{baseCapacity:30,capacity:30,ammo:30,reserve:120,baseReload:1.7,reload:1.7,baseDamage:1,interval:.11},pistol:{baseCapacity:12,capacity:12,ammo:12,reserve:60,baseReload:1.1,reload:1.1,baseDamage:2,interval:.29}},
  explored:new Set(),seenRooms:new Set(),rewardedZones:new Set(),fogPixels:new Uint8Array((expanded?WORLD_WIDTH:101)*WORLD_HEIGHT*4),previousVisible:[1],focus:{x:0,z:0},keyboardAim:{x:0,z:-1},aimMode:'mouse',guidanceKey:'',
  Map,Set,Math,Number,ROACH_VARIANTS,missionGuidance,campaignOperationGuidance,$,hud:noop,toast:noop,updateFog:noop,updatePuzzleArt:noop,removeSpawnCue:noop,
  scene:{removed:[],remove(value){this.removed.push(value);}},THREE:{Group:class {constructor(){Object.assign(this,mesh());}}},createRoach:()=>mesh(),
  attachEnemyHealthBar:(scene,enemy)=>{enemy.healthBar={group:mesh()};},
  weapon:()=>mesh(),playerMesh:{getObjectByName:()=>({parent:{remove:noop}}),add:noop,userData:{gunMount:{x:.28,y:1.18,z:-.31},flash:{position:{z:-1.56}}}}
 };
 ctx.progression=createProgression({doors,enemies,spawnEnemy:(x,z,variant,{encounter}={})=>{const stats=ROACH_VARIANTS[variant],e={encounter,id:'e'+ctx.nextEnemyId++,x,z,...stats,maxHp:stats.hp,variant,cooldown:1,alerted:true,mesh:mesh(),attackWindup:0,staggerTime:0,spawnDelay:0};enemies.push(e);return e;}});
 ctx.persistCampaignProfile=()=>ctx.campaignProfile.persist();
 ctx.queueCheckpoint=reason=>{ctx.pendingCheckpoint=reason;};
 ctx.touchControls??=null;ctx.compatibleStorage=compatibleStorage;ctx.burstFire??=createBurstFire();vm.createContext(ctx);
 vm.runInContext(fragment('function applyUpgrades()','\napplyUpgrades();'),ctx);
 vm.runInContext(fragment('function equip(type)','\nconst player='),ctx);
 vm.runInContext(fragment('function equippedModelType(','\nrefreshPlayerWeapon();'),ctx);
 vm.runInContext(fragment('function captureSnapshot()','\nfunction startOperation('),ctx);
 vm.runInContext(fragment('function missionCue(','\nfunction refreshHelp()'),ctx);
 vm.runInContext('applyUpgrades()',ctx);
 return {ctx,elements,capture:()=>plain(vm.runInContext('captureSnapshot()',ctx)),restore:data=>{ctx.saved=data;return vm.runInContext('restoreSnapshot(saved)',ctx);}};
}
function populatedSnapshot(){
 const fixture=session(),{ctx}=fixture;
 ctx.economy.restore({credits:420,upgrades:{rifle:{damage:2,magazine:1,reload:1},pistol:{damage:1,magazine:0,reload:2}},items:{medkit:2,grenade:3},shield:18});
 vm.runInContext('applyUpgrades()',ctx);
 Object.assign(ctx.player,{x:23,z:10,hp:63,ammo:7,angle:1.2,hurtGrace:.23});ctx.selected='pistol';ctx.weapons.rifle.ammo=19;ctx.reload=.64;
 ctx.puzzle.solved=true;ctx.puzzle.plates.forEach(p=>p.active=true);ctx.puzzle.crates.forEach((c,i)=>Object.assign(c,{x:ctx.puzzle.plates[i].x,z:ctx.puzzle.plates[i].z,seated:true}));ctx.doors[0].unlocked=true;
 for(const x of [8,4,12])ctx.progression.interact({x,z:5});ctx.progression.interact({x:19.5,z:7});ctx.progression.interact({x:27,z:13});
 ctx.enemies[1].hp=0;ctx.progression.update(ctx.player,.1);Object.assign(ctx.enemies[0],{hp:1,cooldown:.4,attackWindup:.2,staggerTime:.12,spawnDelay:.3});
 ctx.explored.add(7*101+4);ctx.explored.add(10*101+23);ctx.seenRooms.add('INSERTION');ctx.seenRooms.add('SECURITY');ctx.rewardedZones.add('storage');ctx.doors[1].open=true;ctx.doors[1].slide=.65;
 return fixture.capture();
}
test('actual browser capture/restore roundtrip preserves equipment, world discovery, and active horde identity',()=>{
 const saved=populatedSnapshot(),target=session();assert.equal(target.restore(saved),true);const {ctx}=target;
 assert.equal(ctx.selected,'pistol');assert.equal(ctx.player.hp,63);assert.equal(ctx.player.ammo,7);assert.equal(ctx.player.hurtGrace,.23);assert.equal(ctx.reload,.64);
 assert.equal(ctx.weapons.rifle.ammo,19);assert.equal(ctx.weapons.rifle.damage,3);assert.equal(ctx.weapons.rifle.capacity,36);assert.ok(Math.abs(ctx.weapons.rifle.reload-1.52)<1e-10);assert.equal(ctx.weapons.pistol.damage,3);
 assert.equal(ctx.economy.state.credits,420);assert.deepEqual(plain(ctx.economy.state.items),{medkit:2,grenade:3,fireGrenade:0});assert.equal(ctx.economy.state.shield,18);
 assert.deepEqual([...ctx.explored].sort((a,b)=>a-b),saved.explored.sort((a,b)=>a-b));assert.ok(ctx.seenRooms.has('SECURITY'));assert.ok(ctx.rewardedZones.has('storage'));
 assert.equal(ctx.puzzle.solved,true);assert.equal(ctx.puzzle.plates.every(p=>p.active),true);assert.equal(ctx.puzzle.crates.every(c=>c.seated),true);assert.equal(ctx.puzzle.crates[0].x,4);assert.equal(ctx.doors[0].unlocked,true);assert.equal(ctx.doors[1].slide,.65);
 const security=ctx.progression.state.zones.find(z=>z.id==='security'),savedZone=saved.progression.zones.find(z=>z.id==='security');assert.equal(security.status,'active');assert.deepEqual(plain(security.queue),savedZone.queue);assert.equal(security.spawned,savedZone.spawned);
 for(const enemy of security.wave)assert.equal(enemy,ctx.enemies.find(e=>e.id===enemy.id),'wave must refer to the live restored enemy objects');
 const restored=ctx.enemies.find(e=>e.id===saved.enemies[0].id);assert.equal(restored.attackWindup,.2);assert.equal(restored.staggerTime,.12);assert.equal(restored.spawnDelay,.3);assert.equal(restored.maxHp,2);
 assert.match(target.elements.get('#objective').textContent,/security purge/i);assert.match(target.elements.get('#hint').textContent,/reinforcements/);assert.notEqual(target.elements.get('#hint').textContent,'Search the dark rooms. Watch your corners.');
 assert.deepEqual(target.capture(),saved,'a second capture preserves all serialized session fields');
});
test('actual save restoration reconstructs the next puzzle instruction after room-entry flags were already saved',()=>{
 const saved=populatedSnapshot();saved.enemies=[];saved.progression.relay={started:false,remaining:0,completed:false};for(const zone of saved.progression.zones){zone.rewardQueue=[];zone.waveRewardIds=[];zone.status='dormant';zone.waveIds=[];zone.waveVariants=[];zone.queue=[];zone.spawned=0;zone.spawnTimer=0;}
 saved.progression.archiveEntered=true;saved.progression.securityEntered=true;const target=session();assert.equal(target.restore(saved),true);assert.equal(target.elements.get('#objective').textContent,'Link the security relays');assert.match(target.elements.get('#hint').textContent,/eight seconds/);
});
test('unsupported save versions are rejected before replacing the current session',()=>{const target=session(),saved=populatedSnapshot();saved.version=2;assert.equal(target.restore(saved),false);assert.equal(target.ctx.player.hp,100);assert.equal(target.ctx.enemies.length,0);});
test('malformed nested saves never partially replace the live operator or world',()=>{for(const corrupt of [s=>s.enemies=[null],s=>delete s.puzzle.crates,s=>s.progression.version=99,s=>s.player.x=NaN]){const target=session(),before=target.capture(),saved=populatedSnapshot();corrupt(saved);assert.equal(target.restore(saved),false);assert.deepEqual(target.capture(),before);}});
test('purchased shotgun and SMG loadouts retain their real magazine and cadence after a save',()=>{for(const id of ['smg','shotgun']){const saved=populatedSnapshot();saved.loadout={primary:id,unlocked:['carbine',id]};saved.selected='rifle';saved.player.ammo=2;saved.magazines.rifle=2;const target=session();assert.equal(target.restore(saved),true);const config=primaryWeapon(id);assert.equal(target.ctx.campaignProfile.state.primary,id);assert.equal(target.ctx.weapons.rifle.baseCapacity,config.capacity);assert.equal(target.ctx.weapons.rifle.interval,config.interval);assert.equal(target.ctx.weapons.rifle.pellets,config.pellets);assert.equal(target.ctx.player.ammo,2);assert.equal(target.capture().loadout.primary,id);}});
test('returning to an older checkpoint retains newer predeployment purchases',()=>{const saved=populatedSnapshot(),target=session();target.ctx.economy.restore({credits:500});assert.equal(target.ctx.campaignProfile.purchaseWeapon('shotgun').ok,true);assert.equal(target.ctx.economy.purchase('armor').ok,true);target.ctx.campaignProfile.markPurchase();const credits=target.ctx.economy.state.credits;assert.equal(target.restore(saved),true);assert.equal(target.ctx.campaignProfile.state.primary,'shotgun');assert.equal(target.ctx.economy.state.credits,credits);assert.equal(target.ctx.economy.state.shield,40);assert.ok(target.ctx.player.ammo<=target.ctx.weapons.pistol.capacity);});
test('adopting a higher-revision save preserves purchases made after restoring it',()=>{const saved=populatedSnapshot();saved.profileRevision=5;const target=session();assert.equal(target.restore(saved),true);assert.equal(target.ctx.campaignProfile.state.revision,5);assert.equal(target.ctx.economy.purchase('armor').ok,true);target.ctx.campaignProfile.markPurchase();const credits=target.ctx.economy.state.credits;assert.equal(target.restore(saved),true);assert.equal(target.ctx.campaignProfile.state.revision,6);assert.equal(target.ctx.economy.state.credits,credits);});

test('loading a sidearm save during a rifle reload restores weapon identity before its saved timer',()=>{const saved=populatedSnapshot(),target=session();target.ctx.reload=1.2;assert.equal(target.restore(saved),true);assert.equal(target.ctx.selected,'pistol');assert.equal(target.ctx.player.ammo,7);assert.equal(target.ctx.weapons.rifle.ammo,19);assert.equal(target.ctx.reload,.64);});

test('restoring a checkpoint respects mouse-only aiming and re-arms pointer detection',()=>{const saved=populatedSnapshot(),target=session();target.ctx.menu.settings.aimMode='mouse';target.ctx.lastPointer={x:400,y:300};assert.equal(target.restore(saved),true);assert.equal(target.ctx.aimMode,'mouse');assert.equal(target.ctx.lastPointer,null);});

test('charger cooldown survives actual session restoration and old saves get a warning grace',()=>{const saved=populatedSnapshot(),enemy=saved.enemies[0];enemy.variant='charger';enemy.maxHp=8;enemy.chargeCooldown=2.6;for(const zone of saved.progression.zones){const index=zone.waveIds.indexOf(enemy.id);if(index>=0)zone.waveVariants[index]='charger';}const target=session();assert.equal(target.restore(saved),true);assert.equal(target.ctx.enemies.find(e=>e.id===enemy.id).chargeCooldown,2.6);assert.equal(target.capture().enemies.find(e=>e.id===enemy.id).chargeCooldown,2.6);delete enemy.chargeCooldown;const legacy=session();assert.equal(legacy.restore(saved),true);assert.equal(legacy.ctx.enemies.find(e=>e.id===enemy.id).chargeCooldown,1);});

test('actual legacy session restoration expands into the hospital map without moving discovered rooms or losing inventory',()=>{const saved=populatedSnapshot(),target=session({expanded:true});assert.equal(target.restore(saved),true);const copy=target.capture();assert.deepEqual(copy.world,[WORLD_WIDTH,WORLD_HEIGHT]);assert.equal(copy.doors.length,WORLD_DOOR_COUNT);assert.deepEqual(copy.explored,saved.explored.map(index=>Math.floor(index/101)*WORLD_WIDTH+index%101));assert.equal(copy.player.hp,63);assert.equal(copy.player.ammo,7);assert.equal(copy.loadout.primary,saved.loadout.primary);assert.equal(target.ctx.progression.state.zones.find(zone=>zone.id==='hospital-triage').status,'dormant');});

test('new mutation cooldowns survive checkpoints while unsafe transient warnings are discarded',()=>{for(const [variant,key,value]of [['screecher','shriekCooldown',4.2],['leaper','leapCooldown',3.1]]){const saved=populatedSnapshot(),enemy=saved.enemies[0];enemy.variant=variant;enemy.maxHp=variant==='screecher'?10:7;enemy[key]=value;enemy.shriekWindup=.2;enemy.leapWindup=.2;enemy.leapRemaining=.2;for(const zone of saved.progression.zones){const index=zone.waveIds.indexOf(enemy.id);if(index>=0)zone.waveVariants[index]=variant;}const target=session();assert.equal(target.restore(saved),true);const live=target.ctx.enemies.find(item=>item.id===enemy.id);assert.equal(live[key],value);assert.equal(live.shriekWindup,0);assert.equal(live.leapWindup,0);assert.equal(live.leapRemaining,0);assert.equal(target.capture().enemies.find(item=>item.id===enemy.id)[key],value);}});

test('attachments apply once across repeated upgrades and checkpoint restore preserves the equipped skill',()=>{const h=session({expanded:true});h.ctx.campaignProgress.complete('breach');h.ctx.fieldSkills.learn('medic',h.ctx.campaignProgress.completed());h.ctx.activeFieldSkill='medic';h.ctx.economy.state.attachments.carbine='precision';vm.runInContext('applyUpgrades()',h.ctx);const interval=h.ctx.weapons.rifle.interval;vm.runInContext('applyUpgrades()',h.ctx);assert.equal(h.ctx.weapons.rifle.interval,interval);const saved=h.ctx.captureSnapshot();assert.equal(saved.fieldSkill.selected,'medic');h.ctx.activeFieldSkill='none';assert.equal(h.ctx.restoreSnapshot(saved),true);assert.equal(h.ctx.activeFieldSkill,'medic');});
test('largest demolition fire survives actual snapshot validation and restoration',()=>{const first=session({expanded:true});for(const id of ['breach','command','research','containment','nest','hospital','freight'])first.ctx.campaignProgress.complete(id);for(const id of ['demolition','ordnance','widearea'])assert.ok(first.ctx.fieldSkills.learn(id,first.ctx.campaignProgress.completed()).ok);first.ctx.activeFieldSkill='widearea';first.ctx.fireZones.burst(30,30,1.25);const saved=first.capture();assert.equal(saved.fireZones.zones[0].radius,3.25);const second=session({expanded:true});for(const id of ['breach','command','research','containment','nest','hospital','freight'])second.ctx.campaignProgress.complete(id);assert.equal(second.restore(saved),true);assert.equal(second.ctx.activeFieldSkill,'widearea');assert.equal(second.ctx.fireZones.serialize().zones[0].radius,3.25);const invalid=plain(saved);invalid.fireZones.zones[0].radius=3.26;assert.equal(second.restore(invalid),false);assert.equal(second.ctx.fireZones.serialize().zones[0].radius,3.25);});

test('quickloader checkpoint keeps remaining reload time and matching animation duration',()=>{const first=session({expanded:true});for(const id of ['breach','command','research','containment','nest','hospital'])first.ctx.campaignProgress.complete(id);for(const id of ['runner','pathfinder','quickloader'])assert.ok(first.ctx.fieldSkills.learn(id,first.ctx.campaignProgress.completed()).ok);first.ctx.activeFieldSkill='quickloader';first.ctx.skillEffects=()=>fieldSkillEffects(first.ctx.activeFieldSkill);first.ctx.audio={reload:noop};first.ctx.player.ammo=0;vm.runInContext(fragment('function beginReload','function resumeRun'),first.ctx);vm.runInContext('beginReload()',first.ctx);const duration=first.ctx.weapons.rifle.reload*.88;assert.ok(Math.abs(first.ctx.reload-duration)<1e-8);first.ctx.reload-=.25;const saved=first.capture(),second=session({expanded:true});for(const id of ['breach','command','research','containment','nest','hospital'])second.ctx.campaignProgress.complete(id);second.ctx.skillEffects=()=>fieldSkillEffects(second.ctx.activeFieldSkill);vm.runInContext(fragment('function beginReload','function resumeRun'),second.ctx);assert.equal(second.restore(saved),true);assert.equal(second.ctx.activeFieldSkill,'quickloader');assert.ok(Math.abs(second.ctx.reload-(duration-.25))<1e-8);assert.ok(Math.abs(vm.runInContext('1-reload/reloadDuration()',second.ctx)-.25/duration)<1e-8);assert.ok(source.includes('progress:1-reload/reloadDuration()'));});


test('all skill paths survive two actual checkpoint captures across every operation and all difficulties',()=>{
 const {deployCampaignOperation}=require('../src/campaign-operations.js'),operations=require('../src/campaign-operations.js').CAMPAIGN_OPERATIONS.map(operation=>operation.id);let combinations=0;
 for(const node of SKILL_NODES)for(const operation of operations)for(const difficulty of ['easy','normal','hard']){
  const first=session({expanded:true});for(const id of operations)first.ctx.campaignProgress.complete(id);
  const path=[];for(let current=node;current;current=SKILL_NODES.find(n=>n.id===current.requires))path.unshift(current.id);
  for(const id of path)assert.ok(first.ctx.fieldSkills.learn(id,operations).ok);first.ctx.activeFieldSkill=node.id;
  Object.assign(first.ctx.runConfig,{operation,difficulty});deployCampaignOperation(operation,{player:first.ctx.player,puzzle:first.ctx.puzzle,progression:first.ctx.progression,doors:first.ctx.doors});
  const saved=first.capture(),fresh=session({expanded:true});for(const id of operations)fresh.ctx.campaignProgress.complete(id);
  assert.equal(fresh.restore(saved),true,`${node.id}/${operation}/${difficulty} first restore`);assert.equal(fresh.ctx.activeFieldSkill,node.id);
  assert.equal(fresh.ctx.fieldSkills.selected(operations),'none','checkpoint does not replace independent base selection');
  const second=fresh.capture();assert.deepEqual(second.fieldSkill,saved.fieldSkill,'recapture retains learned prerequisites from the running checkpoint');
  assert.equal(fresh.restore(second),true);assert.equal(fresh.ctx.activeFieldSkill,node.id);assert.deepEqual(fieldSkillEffects(fresh.ctx.activeFieldSkill),fieldSkillEffects(node.id));combinations++;
 }
 assert.equal(combinations,SKILL_NODES.length*operations.length*3);
});

test('resuming an older skill checkpoint preserves newer base development separately',()=>{
 const operations=['breach','command','research','containment','nest','hospital','freight'],first=session({expanded:true}),fresh=session({expanded:true});
 for(const ctx of [first.ctx,fresh.ctx])for(const id of operations)ctx.campaignProgress.complete(id);
 for(const id of ['demolition','ordnance','widearea'])assert.ok(first.ctx.fieldSkills.learn(id,operations).ok);first.ctx.activeFieldSkill='widearea';const checkpoint=first.capture();
 for(const id of ['runner','pathfinder','quickloader'])assert.ok(fresh.ctx.fieldSkills.learn(id,operations).ok);const base=fresh.ctx.fieldSkills.serialize(operations);
 assert.ok(fresh.restore(checkpoint));assert.equal(fresh.ctx.activeFieldSkill,'widearea');assert.deepEqual(fresh.ctx.fieldSkills.serialize(operations),base);
 const next=fresh.capture();assert.equal(next.fieldSkill.selected,'widearea');assert.ok(next.fieldSkill.learned.includes('widearea'));assert.ok(fresh.restore(next));assert.equal(fresh.ctx.activeFieldSkill,'widearea');assert.deepEqual(fresh.ctx.fieldSkills.serialize(operations),base);
});

test('actual retry restores checkpoint supplies after cash earnings without refunding or duplicating cash',async()=>{
 const target=session(),{campaignProfile,economy}=target.ctx;
 economy.restore({credits:500});await campaignProfile.purchaseOffer('medkit');
 const saved=target.capture();economy.consume('medkit');campaignProfile.persist();
 await campaignProfile.queueEnemyReward('kill.command.0','normal');
 const cash=economy.state.credits;
 assert.equal(target.restore(saved),true);assert.equal(economy.state.items.medkit,1);assert.equal(economy.state.credits,cash);
 assert.equal((await campaignProfile.queueEnemyReward('kill.command.0','normal')).amount,0);
});

test('checkpoint roundtrip preserves replay attempt identity instead of minting a new payout',()=>{
 const first=session({expanded:true});first.ctx.replayRewardId='replay.breach.checkpoint-token';const saved=first.capture();assert.equal(saved.replayRewardId,first.ctx.replayRewardId);
 const restored=session({expanded:true});assert.equal(restored.restore(saved),true);assert.equal(restored.ctx.replayRewardId,saved.replayRewardId);assert.equal(restored.capture().replayRewardId,saved.replayRewardId);
 const legacy=plain(saved);delete legacy.replayRewardId;assert.equal(restored.restore(legacy),true);assert.equal(restored.ctx.replayRewardId,null);
});
