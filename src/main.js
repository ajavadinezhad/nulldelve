import {campaignDebrief} from './campaign-story.js?v=completion-r30';
import {encounterStatus} from './encounter-status.js?v=completion-r30';
import {SALVAGE_CACHES} from './mission-salvage.js?v=completion-r30';
import {createSalvageArt} from './salvage-art.js?v=completion-r30';
import {FREIGHT_ROOMS,FREIGHT_DOORS,carveFreight,addFreightProps} from './freight-layout.js?v=completion-r30';
import {createFieldSkills,fieldSkillEffects,normalizeFieldSkill} from './field-skills.js?v=completion-r30';
import {applyWeaponAttachment} from './weapon-attachments.js?v=completion-r30';
import {createMutationNotes} from './mutation-notes.js?v=completion-r30';
import {grantHospitalAmmo} from './mission-supplies.js?v=completion-r30';
import {WORLD_WIDTH,WORLD_HEIGHT,upgradeWorldSnapshot} from './world-layout.js?v=completion-r30';
import {HOSPITAL_ROOMS,HOSPITAL_DOORS,carveHospital,addHospitalProps} from './hospital-layout.js?v=completion-r30';
import {createGrenadeActions} from './grenade-actions.js?v=completion-r30';
import {cameraViewSize,renderPixelRatio} from './device-presentation.js?v=completion-r30';
import {attachGraphicsRecovery,renderGraphicsRecovery,graphicsRecoveryUrl} from './graphics-recovery.js?v=completion-r30';
import {compatibleStorage} from './storage-compat.js?v=completion-r30';
import {createTouchControls} from './touch-controls.js?v=completion-r30';
import {createHudFeedback} from './hud-feedback.js?v=completion-r30';
import {createPuzzleDiscovery,encounteredPuzzles} from './puzzle-discovery.js?v=completion-r30';
const puzzleDiscovery=createPuzzleDiscovery();
const mutationNotes=createMutationNotes();
import * as THREE from '../vendor/three.module.js';
import {buildArt} from './environment.js?v=completion-r30';
import {soldier, animateSoldier} from './character.js?v=completion-r30';
import {weapon, createCombatEffects} from './weapons.js?v=completion-r30';
import {addRoomDetails} from './room-details.js?v=completion-r30';
import {createMinimap} from './minimap.js?v=completion-r30';
import {createRoach,animateRoach,ROACH_VARIANTS} from './roach.js?v=completion-r30';
import {updateRoachEnemy,applyEnemyStagger} from './enemy-ai.js?v=completion-r30';
import {createPressurePuzzle,nearestPullableCrate,beginCrateGrab,releaseCrateGrab,overlapsCrate,moveWithCrates,updatePressurePuzzle,resetPressurePuzzle} from './pressure-puzzle.js?v=completion-r30';
import {createPuzzleArt} from './puzzle-art.js?v=completion-r30';
import {createWeaponPreview} from './weapon-preview.js?v=completion-r30';
import {createProgression} from './progression.js?v=completion-r30';
import {createProgressionArt} from './progression-art.js?v=completion-r30';
import {EXPANSION_ROOMS,EXPANSION_DOORS,carveExpansion,addExpansionProps} from './facility-expansion.js?v=completion-r30';
import {buildWorld} from './world-render.js?v=completion-r30';
import {createNavigator} from './navigation.js?v=completion-r30';
import {createGameMenu} from './game-menu.js?v=completion-r30';
import {createSaveSlots} from './save-slots.js?v=completion-r30';
import {attachEnemyHealthBar,updateEnemyHealthBar} from './enemy-health.js?v=completion-r30';
import {createEconomy} from './economy.js?v=completion-r30';
import {createExplosions} from './explosion.js?v=completion-r30';
import {createGameAudio} from './audio.js?v=completion-r30';
import {DEFAULT_BINDINGS,actionForCode,formatKey,pointerHasMoved,keyboardAimDirection} from './controls.js?v=completion-r30';
import {createFixedStepper,restartOperationUrl,combatIsActive,canCheckpoint,missionGuidance,checkpointMatchesOperation} from './session-rules.js?v=completion-r30';
import {createLootState,dropEnemyLoot,collectNearbyLoot,refillMagazine} from './loot.js?v=completion-r30';
import {observeHudLayout} from './interface-layout.js?v=completion-r30';
import {createMapFocus} from './map-accessibility.js?v=completion-r30';
import {encodeDeploymentState,decodeDeploymentState} from './deployment-state.js?v=completion-r30';
import {placeLootDrops} from './loot-placement.js?v=completion-r30';
import {createExplosiveBarrels} from './explosive-barrels.js?v=completion-r30';
import {createDoorHintCamera,previewFog} from './door-hint-camera.js?v=completion-r30';
import {createFireZones} from './fire-grenades.js?v=completion-r30';
import {itemIconPath} from './item-icons.js?v=completion-r30';
import {createLootView} from './loot-view.js?v=completion-r30';
import {meleeTargets} from './melee.js?v=completion-r30';
import {createPuzzleHints} from './puzzle-hints.js?v=completion-r30';
import {createOnboarding} from './onboarding.js?v=completion-r30';
import {createOperationStats,recordResult,formatDuration,readOperationRecords} from './operation-records.js?v=completion-r30';
import {validateSnapshot} from './snapshot-validation.js?v=completion-r30';
import {DIFFICULTY_RULES} from './difficulty.js?v=completion-r30';
import {createCampaignProfile} from './campaign-profile.js?v=completion-r30';
import {primaryWeapon,shotDirections,primaryReserve} from './arsenal.js?v=completion-r30';
import {createCampaignProgress} from './campaign-progress.js?v=completion-r30';
import {buildOperationEnvironment} from './operation-environments.js?v=completion-r30';
import {CAMPAIGN_OPERATIONS,normalizeCampaignOperation,deployCampaignOperation,campaignOperationComplete,campaignOperationObjectivesComplete,campaignOperationExit,campaignOperationGuidance} from './campaign-operations.js?v=completion-r30';
const $=s=>document.querySelector(s), W=WORLD_WIDTH,H=WORLD_HEIGHT;
const hudFeedback=createHudFeedback({query:$});
function browserStorage(){try{return compatibleStorage(localStorage);}catch{return null;}}
function operationTitle(){return CAMPAIGN_OPERATIONS.find(op=>op.id===runConfig.operation)?.name??(runConfig.mission==='campaign'?'Facility descent':runConfig.mission==='siege'?'Reactor siege':'Nest hunt');}
const params=new URLSearchParams(location.search);
const runConfig={mission:['campaign','siege','nest'].includes(params.get('mission'))?params.get('mission'):'campaign',difficulty:['easy','normal','hard'].includes(params.get('difficulty'))?params.get('difficulty'):'normal',operation:normalizeCampaignOperation(params.get('operation')),remix:params.get('remix')==='1'};
const difficultyRules=DIFFICULTY_RULES;
const puzzleHints=createPuzzleHints();const campaignProgress=createCampaignProgress(browserStorage());const fieldSkills=createFieldSkills(browserStorage());let activeFieldSkill=fieldSkills.selected(campaignProgress.completed()),activeFieldSkillState=null;
function skillEffects(){return fieldSkillEffects(activeFieldSkill);}
const operationStats=createOperationStats();let tutorial=null;
const saveSlots=createSaveSlots();function latestSnapshot(){const data=saveSlots.loadCheckpoint();return validateSnapshot(data)?data:null;}const baseSnapshot=latestSnapshot();
const loot=createLootState();const economy=createEconomy(baseSnapshot?.economy);const campaignProfile=createCampaignProfile({storage:browserStorage(),economy,getCompleted:()=>campaignProgress.completed()});if(!campaignProfile.reload())campaignProfile.restoreLoadout(baseSnapshot?.loadout??{});const incomingDeployment=decodeDeploymentState(location.hash);if(incomingDeployment){campaignProfile.restoreTransient(incomingDeployment.profile);campaignProgress.restoreTransient(incomingDeployment.progress);if(incomingDeployment.fieldSkill)fieldSkills.restoreDeployment(incomingDeployment.fieldSkill,campaignProgress.completed());activeFieldSkill=fieldSkills.selected(campaignProgress.completed());campaignProfile.persist();campaignProgress.persist();if(!campaignProfile.isSessionOnly()&&!campaignProgress.isSessionOnly()&&!fieldSkills.isSessionOnly())history.replaceState(null,'',location.pathname+location.search);}
const audio=createGameAudio();audio.setPaused(true);const simulation=createFixedStepper();
let barrelSystem=null,doorHint=null,restoreHintFog=null,guidanceDoorIndex=null;
let grenadeActions=null;
let rules=difficultyRules[runConfig.difficulty],menu=null,touchControls=null,mapOpen=false,helpOpen=false,aimMode='mouse',lastPointer=null;
let guidanceKey='';let checkpointPending=null,lastCheckpointTime=0;let keyboardAim={x:0,z:-1};const rewardedZones=new Set();

const scene=new THREE.Scene();const lootView=createLootView(scene);scene.background=new THREE.Color('#080e11');
const renderer=new THREE.WebGLRenderer({canvas:$('#game'),antialias:true});renderer.setPixelRatio(renderPixelRatio('medium',{width:innerWidth,height:innerHeight,pixelRatio:devicePixelRatio}));
const fireZones=createFireZones(scene,{isVisible:visible,lineOfSight:(ax,az,bx,bz)=>los(ax,az,bx,bz,true),onDamage:(enemy,damage)=>{if(ended||enemy.hp<=0)return;if(enemy===player){applyPlayerDamage(damage*6);hud();if(player.hp<=0)end(false);return;}if(enemy.kind==='barrel'){barrelSystem?.hit(enemy,damage);return;}enemy.alerted=true;enemy.hp=Math.max(0,enemy.hp-damage);if(!enemy.hp)rewardEnemyKill(enemy);updateEnemyHealthBar(enemy);}});
const combatEffects=createCombatEffects(scene);const explosions=createExplosions(scene);
const showWeaponPreview=createWeaponPreview($('#weapon-preview'));
const camera=new THREE.OrthographicCamera();camera.up.set(0,0,-1);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
scene.add(new THREE.HemisphereLight(0xc9e8db,0x243028,1.6));const sun=new THREE.DirectionalLight(0xffffff,2.6);sun.position.set(-10,25,15);scene.add(sun);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-34,right:34,top:34,bottom:-34,near:.1,far:90});sun.position.set(5,35,20);sun.target.position.set(23,0,17);scene.add(sun.target);sun.shadow.normalBias=.04;
const map=Array.from({length:H},()=>Array(W).fill(1)), explored=new Set(),seenRooms=new Set();
const roomDefs=[{x:2,z:21,w:12,h:11,name:'INSERTION'},{x:2,z:4,w:12,h:12,name:'ARCHIVE'},{x:18,z:4,w:11,h:12,name:'SECURITY'},{x:18,z:21,w:11,h:11,name:'STORAGE'},{x:33,z:21,w:12,h:11,name:'EXTRACTION'},{x:33,z:4,w:12,h:12,name:'COMMAND'},...EXPANSION_ROOMS,...HOSPITAL_ROOMS,...FREIGHT_ROOMS];
function carve(x,z,w,h){for(let j=z;j<z+h;j++)for(let i=x;i<x+w;i++)map[j][i]=0;}roomDefs.forEach(r=>carve(r.x,r.z,r.w,r.h));carve(6,15,3,7);carve(13,9,6,3);carve(22,15,3,7);carve(28,25,6,3);carve(37,15,3,7);carve(28,9,6,3);carveExpansion(carve);carveHospital(carve);carveFreight(carve);const totalFloor=map.reduce((sum,row)=>sum+row.filter(v=>v===0).length,0);
const puzzle=createPressurePuzzle();
const cover=[{x:8,z:26,w:3,h:1.5},{x:6,z:8,w:2,h:3},{x:23,z:9,w:3,h:2},{x:22,z:26,w:2,h:3},{x:39,z:8,w:2,h:3},{x:39,z:26,w:3,h:2}];
const boxGeo=new THREE.BoxGeometry(1,1,1);function box(x,y,z,w,h,d,color,group=scene){const m=new THREE.Mesh(boxGeo,new THREE.MeshStandardMaterial({color,roughness:.85}));m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
const visibleTiles=new Uint8Array(W*H);
const fogPixels=new Uint8Array(W*H*4);
for(let i=0;i<W*H;i++)fogPixels.set([8,14,17,255],i*4);
const fogTexture=new THREE.DataTexture(fogPixels,W,H);fogTexture.colorSpace=THREE.SRGBColorSpace;fogTexture.needsUpdate=true;
const fogOverlay=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:fogTexture,transparent:true,depthWrite:false}));fogOverlay.rotation.x=-Math.PI/2;fogOverlay.position.set((W-1)/2,3,(H-1)/2);fogOverlay.renderOrder=10;scene.add(fogOverlay);
buildWorld(scene,map,W,H);
buildArt(scene,box,cover,roomDefs.slice(0,6));
addExpansionProps(scene,box,cover);addHospitalProps(scene,box,cover);addFreightProps(scene,box,cover);
addRoomDetails(scene,box,roomDefs);
let salvageBusy=false;
const salvageArt=createSalvageArt(scene,{caches:SALVAGE_CACHES,operation:()=>runConfig.operation,claimed:id=>!!economy.state.claimedRewards?.[id],visible});
function nearbySalvage(){return SALVAGE_CACHES.find(cache=>cache.operation===runConfig.operation&&!economy.state.claimedRewards?.[cache.id]&&Math.hypot(cache.x-player.x,cache.z-player.z)<=1.6&&visible(cache.x,cache.z));}
function collectSalvage(){const cache=nearbySalvage();if(!cache)return false;if(salvageBusy)return true;salvageBusy=true;campaignProfile.claimCashReward(cache.id).then(result=>{if(result.ok&&result.amount>0){audio.pickup();hud();salvageArt.update();toast(`SALVAGE SECURED · +$${result.amount}`);queueCheckpoint('Cash cache secured');}else if(!result.ok)toast(result.message??'Cash cache could not be collected.');}).catch(()=>toast('Cash cache could not be collected. Try again.')).finally(()=>{salvageBusy=false;});return true;}

let operationEnvironment=null;function updateOperationEnvironment(){operationEnvironment?.dispose();operationEnvironment=buildOperationEnvironment({scene,operation:runConfig.operation,roomDefs,cover});scene.background.set(operationEnvironment.background);const fogColor=operationEnvironment.background;for(let i=0;i<fogPixels.length;i+=4){fogPixels[i]=(fogColor>>16)&255;fogPixels[i+1]=(fogColor>>8)&255;fogPixels[i+2]=fogColor&255;}fogTexture.needsUpdate=true;sun.color.set(operationEnvironment.lightColor);sun.intensity=operationEnvironment.lightIntensity;const ambient=scene.children.find(child=>child.isHemisphereLight);if(ambient){ambient.color.set(operationEnvironment.hemisphereSky);ambient.groundColor.set(operationEnvironment.hemisphereGround);}}
updateOperationEnvironment();
const doors=[{x:7,z:18,axis:'x'},{x:15.5,z:10,axis:'z'},{x:23,z:18,axis:'x'},{x:30.5,z:26,axis:'z'},{x:38,z:18,axis:'x'},{x:30.5,z:10,axis:'z'},...EXPANSION_DOORS,...HOSPITAL_DOORS,...FREIGHT_DOORS].map(door=>({...door}));
for(const door of doors){
 door.open=false;door.slide=0;door.group=new THREE.Group();door.group.position.set(door.x,0,door.z);if(door.axis==='z')door.group.rotation.y=Math.PI/2;scene.add(door.group);
 box(0,.75,0,3,1.5,.24,0x667b73,door.group);box(0,1.53,0,3.1,.08,.3,0xa2afa0,door.group);
 for(const x of [-.8,0,.8])box(x,.8,-.135,.04,1.2,.03,0x2a3b35,door.group);
 box(.95,.8,-.16,.12,.3,.06,0xd1bb73,door.group);
 const status=box(-1.1,1.55,0,.15,.04,.16,0xd7a75f,door.group);door.status=status;
 for(const side of [-1,1]){const x=door.axis==='x'?door.x+side*1.6:door.x,z=door.axis==='x'?door.z:door.z+side*1.6;box(x,.8,z,door.axis==='x'?.2:.5,1.6,door.axis==='x'?.5:.2,0x9a9b85);}
}
doors[0].needsPower=true;doors[0].unlocked=false;doors[0].status.material.color.set(0xe96c52);
const updatePuzzleArt=createPuzzleArt(scene,box,puzzle.crates,puzzle.plates,doors[0]);
function nearbyDoor(){return doors.filter(d=>Math.hypot(d.x-player.x,d.z-player.z)<2.7).sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0];}
function beginInteraction(){if(beginCrateGrab(puzzle,player,(x,z,r)=>solid(x,z,r,true)))return;interact();}
function interact(){const hospitalSampleBefore=!!progression.state.operationTasks?.hospitalSample,hospitalAuthBefore=!!progression.state.operationTasks?.hospitalAuth,freightDrainBefore=!!progression.state.operationTasks?.freightDrain,freightDispatchBefore=!!progression.state.operationTasks?.freightRoute?.running;if(runConfig.operation&&campaignOperationComplete(runConfig.operation,{player,progression})){queueCheckpoint('Sector departed');commitCheckpoint();end(true);return;}if(collectSalvage())return;const artifactsBefore=progression.state.artifacts?.length??0,taskBefore=progression.state.milestone??0,cipherBefore=progression.state.archive.solved,powerBefore=progression.state.power.solved,valvesBefore=progression.state.valves.solved,logsBefore=progression.state.logs.length;if(progression.interact(player)){if((runConfig.operation==='hospital'&&((!hospitalSampleBefore&&progression.state.operationTasks.hospitalSample)||(!hospitalAuthBefore&&progression.state.operationTasks.hospitalAuth)))||(runConfig.operation==='freight'&&((!freightDrainBefore&&progression.state.operationTasks.freightDrain)||(!freightDispatchBefore&&progression.state.operationTasks.freightRoute?.running)))){grantHospitalAmmo(weapons);audio.pickup('ammo');hud();}if((progression.state.artifacts?.length??0)>artifactsBefore){for(const id of progression.state.artifacts)campaignProgress.recordArtifact(id);}if((progression.state.milestone??0)>taskBefore)queueCheckpoint('Operation milestone');if(!powerBefore&&progression.state.power.solved)queueCheckpoint('Reactor power restored');if(!valvesBefore&&progression.state.valves.solved)queueCheckpoint('Containment vented');if(progression.state.logs.length>logsBefore){for(const id of progression.state.logs)campaignProgress.recordLog(id);for(const id of progression.state.artifacts??[])campaignProgress.recordArtifact(id);queueCheckpoint('Research log recovered');}if(!cipherBefore&&progression.state.archive.solved){queueCheckpoint('Archive cipher solved');audio.puzzle(true);}return;}const d=nearbyDoor();if(!d)return;if(d.progressLocked){toast(d.lockReason);return;}if(d.needsPower&&!d.unlocked){toast('NO POWER · 2 CIRCUITS OFFLINE');return;}const across=d.axis==='x'?Math.abs(player.z-d.z):Math.abs(player.x-d.x),along=d.axis==='x'?Math.abs(player.x-d.x):Math.abs(player.z-d.z);if(d.open&&((across<.6&&along<1.9)||enemies.some(e=>e.hp>0&&Math.abs(e.x-d.x)<(d.axis==='x'?1.9:.6)&&Math.abs(e.z-d.z)<(d.axis==='x'?.6:1.9)))){toast('CLEAR THE DOORWAY FIRST');return;}if(d.slide>.05&&d.slide<.95)return;d.open=!d.open;if(d.open)tutorial?.event('door');d.status.material.color.set(d.open||d.unlocked?0x9ae8a9:0xd7a75f);audio.door(d.open);updateFog();}
function actor(color){return soldier(color,scene,box);}
const primary=primaryWeapon(campaignProfile.state.primary);const weapons={rifle:{...primary,name:primary.name.toUpperCase(),capacity:primary.id==='carbine'?rules.magazine:primary.capacity,ammo:primary.id==='carbine'?rules.magazine:primary.capacity,reserve:primaryReserve(primary.id,runConfig.difficulty)},pistol:{name:'P9 SIDEARM',capacity:12,ammo:12,reserve:rules.pistolReserve,interval:.29,reload:1.1,baseDamage:2,range:22,stagger:.25,pellets:1,spread:0}};let selected='rifle';
for(const gun of Object.values(weapons)){gun.baseCapacity=gun.capacity;gun.baseReload=gun.reload;}
function applyUpgrades(){for(const [type,gun] of Object.entries(weapons)){const id=type==='rifle'?(gun.id??campaignProfile.state.primary):'pistol',base=type==='rifle'?primaryWeapon(id):{interval:.29,range:22,spread:0,stagger:.25};const stats=economy.stats(id,{capacity:gun.baseCapacity,reload:gun.baseReload,interval:base.interval,damage:gun.baseDamage});const profile={...gun,...stats,interval:base.interval,range:base.range,spread:base.spread,stagger:base.stagger};Object.assign(gun,type==='rifle'?applyWeaponAttachment(profile,economy.state.attachments?.[id]):profile);}}
applyUpgrades();
function equip(type){if(type===selected||!['rifle','pistol'].includes(type))return;reload=0;weapons[selected].ammo=player.ammo;selected=type;player.ammo=weapons[type].ammo;const old=playerMesh.getObjectByName('weapon');old.parent.remove(old);const gun=weapon(equippedModelType(type));gun.position.copy(playerMesh.userData.gunMount);playerMesh.add(gun);playerMesh.userData.flash.position.z=type==='rifle'?-1.56:-.77;hud();}
const player={x:7,z:29,hp:rules.maxHp,maxHp:rules.maxHp,ammo:weapons.rifle.capacity,hurtGrace:0,intel:false,angle:0};const playerMesh=actor(0xa4e4b4);const ring=new THREE.Mesh(new THREE.RingGeometry(.43,.46,32),new THREE.MeshBasicMaterial({color:0xb7f8c6,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.05;scene.add(ring);
function equippedModelType(type=selected){return type==='rifle'?(weapons.rifle.id??'carbine'):'pistol';}
function refreshPlayerWeapon(){const old=playerMesh.getObjectByName('weapon');if(old)old.parent.remove(old);const gun=weapon(equippedModelType());gun.position.copy(playerMesh.userData.gunMount);playerMesh.add(gun);}
function applyPrimaryLoadout(){const config=primaryWeapon(campaignProfile.state.primary);Object.assign(weapons.rifle,config,{name:config.name.toUpperCase(),baseCapacity:config.id==='carbine'?rules.magazine:config.capacity,baseReload:config.reload});applyUpgrades();if(!active||ended)weapons.rifle.reserve=primaryReserve(config.id,runConfig.difficulty);weapons.rifle.ammo=weapons.rifle.capacity;if(selected==='rifle')player.ammo=weapons.rifle.ammo;refreshPlayerWeapon();}
refreshPlayerWeapon();
let nextEnemyId=1;const enemies=[];
function spawnEnemy(x,z,variant='normal',{encounter,rewardIdentity}={}){
 const baseStats=ROACH_VARIANTS[variant]||ROACH_VARIANTS.normal;const stats={...baseStats,hp:Math.ceil(baseStats.hp*rules.hp),speed:baseStats.speed*rules.speed,biteDamage:Math.round(baseStats.biteDamage*rules.damage),behavior:rules.behavior,windupDuration:rules.windupDuration};
 const room=roomDefs.find(r=>x>=r.x&&x<r.x+r.w&&z>=r.z&&z<r.z+r.h);
 const safe=(cx,cz)=>!solid(cx,cz,stats.radius)&&Math.hypot(cx-player.x,cz-player.z)>3&&!enemies.some(e=>e.hp>0&&Math.hypot(cx-e.x,cz-e.z)<stats.radius+(e.radius??.32)+.2)&&(!room||(cx>=room.x+.5&&cx<room.x+room.w-1&&cz>=room.z+.5&&cz<room.z+room.h-1));
 let spawnFound=safe(x,z);if(!spawnFound){let found=false;for(let radius=.75;radius<8&&!found;radius+=.75)for(let i=0;i<16;i++){const a=i*Math.PI/8,cx=x+Math.cos(a)*radius,cz=z+Math.sin(a)*radius;if(safe(cx,cz)){x=cx;z=cz;found=true;spawnFound=true;break;}}}
 if(!spawnFound)return null;
 const enemy={encounter,rewardIdentity:rewardIdentity??`kill.static.${nextEnemyId-1}`,bossMechanic:encounter==='nest'&&variant==='boss'?'pulse':undefined,id:'e'+nextEnemyId++,alerted:true,x,z,...stats,variant,mesh:createRoach(scene,variant),cooldown:1,spawnDelay:.7,attackWindup:0,staggerTime:0};enemy.mesh.position.set(x,0,z);enemy.mesh.visible=visible(x,z);attachEnemyHealthBar(scene,enemy);enemy.mesh.visible=false;enemy.spawnCue=new THREE.Mesh(new THREE.RingGeometry(.38,.52,24),new THREE.MeshBasicMaterial({color:variant==='boss'?0xed7968:0xc9a568,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide}));enemy.spawnCue.rotation.x=-Math.PI/2;enemy.spawnCue.position.set(x,.045,z);enemy.spawnCue.visible=visible(x,z);scene.add(enemy.spawnCue);enemies.push(enemy);return enemy;
}
[[8,6,'normal'],[25,6,'runner'],[20,13,'normal'],[25,24,'brute'],[36,7,'runner'],[42,13,'normal'],[42,29,'normal']].forEach(([x,z,type])=>{const e=spawnEnemy(x,z,type);if(e){e.alerted=false;e.spawnDelay=0;removeSpawnCue(e);}});

const progression=createProgression({doors,enemies,spawnEnemy,getDifficulty:()=>runConfig.difficulty,remix:runConfig.remix,onToast:toast});
// Pre-ledger completed operations already paid into the existing wallet; never pay them again.
const completedRewardZones={breach:['security','storage'],command:['command','generator'],research:['lab','reactor','transit'],containment:['containment','evacuation'],nest:['nest'],hospital:['hospital-triage','hospital-ward','hospital-isolation'],freight:['freight-pumps','freight-yard','freight-cold']};
const paidZones=new Set(campaignProgress.completed().flatMap(id=>completedRewardZones[id]??[]));
campaignProfile.migrateEnemyRewards(progression.state.zones.filter(zone=>paidZones.has(zone.id)).flatMap(zone=>Array.from({length:Math.ceil(Math.max(zone.total,120)*1.5)},(_,i)=>`kill.${zone.id}.${i}`)));
const updateProgressionArt=createProgressionArt(scene,box,progression.state);
const missionPoints={intel:{x:93,z:7},exit:{x:92,z:60}};
const intelMesh=box(93,.35,7,.7,.65,.7,0x51dfe5);const intelGlow=new THREE.Mesh(new THREE.RingGeometry(.65,.73,32),new THREE.MeshBasicMaterial({color:0x51dfe5,side:THREE.DoubleSide}));intelGlow.rotation.x=-Math.PI/2;intelGlow.position.set(93,.04,7);scene.add(intelGlow);
const sectorExitMarker=new THREE.Mesh(new THREE.RingGeometry(.65,.82,32),new THREE.MeshBasicMaterial({color:0xa7e0b5,transparent:true,opacity:.75,side:THREE.DoubleSide}));sectorExitMarker.rotation.x=-Math.PI/2;sectorExitMarker.position.y=.06;sectorExitMarker.visible=false;scene.add(sectorExitMarker);
const exit=box(92,.025,60,2,.04,2,0x294b3d);const exitRing=new THREE.Mesh(new THREE.RingGeometry(.8,.88,32),new THREE.MeshBasicMaterial({color:0x9fe6ae,side:THREE.DoubleSide}));exitRing.rotation.x=-Math.PI/2;exitRing.position.set(92,.06,60);scene.add(exitRing);
let active=false,paused=false,ended=false,shooting=false,reload=0,fire=0,meleeCooldown=0,time=0,fogTick=0;const keys=new Set(),mouse=new THREE.Vector2(),aim=new THREE.Vector3(7,0,24),ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),tracers=[];
function solid(x,z,r=0,ignoreCrates=false,ignoreBarrels=false){if(x<1||z<1||x>=W-1||z>=H-1)return true;for(const dx of [-r,r])for(const dz of [-r,r])if(map[Math.round(z+dz)]?.[Math.round(x+dx)]!==0)return true;if(doors.some(d=>(!d.open||d.slide<.92)&&Math.abs(x-d.x)<(d.axis==='x'?1.5:.16)+r&&Math.abs(z-d.z)<(d.axis==='x'?.16:1.5)+r))return true;if(!ignoreCrates&&puzzle.crates.some(c=>overlapsCrate(x,z,r,c)))return true;return cover.some(c=>Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.h/2+r)||(!ignoreBarrels&&!!barrelSystem?.state.some(b=>b.hp>0&&Math.hypot(x-b.x,z-b.z)<b.radius+r));}
function los(ax,az,bx,bz,ignoreBarrels=false){const d=Math.hypot(bx-ax,bz-az),n=Math.ceil(d*7);for(let i=1;i<n;i++)if(solid(ax+(bx-ax)*i/n,az+(bz-az)*i/n,0,false,ignoreBarrels))return false;return true;}
function visible(x,z){return Math.hypot(player.x-x,player.z-z)<10&&los(player.x,player.z,x,z);}
function move(a,dx,dz){if(a===player){moveWithCrates(a,dx,dz,puzzle,(x,z,r)=>solid(x,z,r,true));return;}const radius=a.radius??.32;if(!solid(a.x+dx,a.z,radius))a.x+=dx;if(!solid(a.x,a.z+dz,radius))a.z+=dz;}
const pursue=createNavigator(W,H,(x,z,r)=>solid(x,z,r));
barrelSystem=createExplosiveBarrels(scene,{blocked:(x,z,r)=>solid(x,z,r)||enemies.some(e=>e.hp>0&&Math.hypot(e.x-x,e.z-z)<r+(e.radius??.32)),lineOfSight:(ax,az,bx,bz)=>los(ax,az,bx,bz,true),onBlast:({x,z,radius,damage})=>{if(ended)return;audio.explosion();if(!menu?.settings.reducedEffects)explosions.burst(x,z);for(const enemy of enemies){if(enemy.hp<=0||(enemy.spawnDelay??0)>0)continue;const distance=Math.hypot(enemy.x-x,enemy.z-z);if(distance>radius||!los(x,z,enemy.x,enemy.z,true))continue;enemy.hp=Math.max(0,enemy.hp-Math.max(2,Math.round(damage*(1-distance/radius))));enemy.alerted=true;if(!enemy.hp)rewardEnemyKill(enemy);updateEnemyHealthBar(enemy);}const distance=Math.hypot(player.x-x,player.z-z);if(active&&distance<radius&&los(x,z,player.x,player.z,true)&&applyPlayerDamage(Math.max(1,Math.round(30*(1-distance/radius))))){hud();if(!player.hp)end(false);} }});barrelSystem.update(visible);
function toast(s){if(hudFeedback.notify(s))return;if(/(HORDE|SWARM|PURGE|OUTBREAK|BREACH).*(HOSTILES|INCOMING)/.test(s))audio.wave();$('#toast').textContent=s;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').textContent='',2500);}
const drawMinimap=createMinimap({canvas:$('#minimap'),map,width:W,height:H,explored,player,doors,roomDefs,mission:missionPoints,landmarks:[...progression.state.devices,...puzzle.plates.map((p,i)=>({x:p.x,z:p.z,kind:'plate',label:i?'B':'A',complete:()=>p.active})),...progression.state.clues.map(clue=>({...clue,kind:'clue',label:'?'}))]});
let previousVisible=[];
function updateFog(){
 for(const id of previousVisible){visibleTiles[id]=0;const x=id%W,z=Math.floor(id/W);fogPixels[((H-1-z)*W+x)*4+3]=209;}
 previousVisible=[];
 for(let z=Math.max(0,Math.floor(player.z)-11);z<=Math.min(H-1,Math.ceil(player.z)+11);z++)for(let x=Math.max(0,Math.floor(player.x)-11);x<=Math.min(W-1,Math.ceil(player.x)+11);x++){
  const id=z*W+x,d=Math.hypot(x-player.x,z-player.z);if(d>=10)continue;
  const t=solid(x,z)&&d>.8?(d-.8)/d:1;
  if(los(player.x,player.z,player.x+(x-player.x)*t,player.z+(z-player.z)*t)){visibleTiles[id]=1;explored.add(id);previousVisible.push(id);fogPixels[((H-1-z)*W+x)*4+3]=0;}
 }
 for(const e of enemies){e.mesh.visible=e.hp>0&&(e.spawnDelay??0)<=0&&visible(e.x,e.z);updateEnemyHealthBar(e);}
 intelMesh.visible=!player.intel&&visible(93,7);intelGlow.visible=intelMesh.visible;exitRing.visible=visible(92,60);fogTexture.needsUpdate=true;drawMinimap(visibleTiles);
}

function bindings(){return menu?.settings.bindings??DEFAULT_BINDINGS;}
function isRunning(){return active&&!paused&&!ended&&!mapOpen&&!helpOpen&&!doorHint?.isActive()&&!menu?.isOpen();}
function isSafeToShop(){return !active||ended;}
function prepareOperation(){if(active&&!ended){queueCheckpoint('Returned to base');commitCheckpoint();}persistCampaignProfile();active=false;paused=true;shooting=false;keys.clear();audio.setPaused(true);tutorial?.hide();helpOpen=false;$('#controls-help').hidden=true;document.body.classList.remove('playing');return true;}
function hud(){showWeaponPreview(equippedModelType());$('#cash-amount').textContent='$'+economy.state.credits.toLocaleString();$('#medkit-count').textContent=economy.state.items.medkit;const fireSelected=economy.state.grenadeType==='fire',grenadeCount=economy.state.items[fireSelected?'fireGrenade':'grenade'];$('#grenade-count').textContent=grenadeCount;$('#grenade-type-label').textContent=fireSelected?'Fire':'Frag';$('#grenade-name').textContent=fireSelected?'Fire':'Frag';$('#grenade-icon').src=itemIconPath(fireSelected?'fireGrenade':'grenade');$('#switch-grenade').hidden=!economy.state.items.fireGrenade&&!fireSelected;$('#medkit-key').textContent=formatKey(bindings().medkit);$('#grenade-key').textContent=formatKey(bindings().grenade);$('#use-medkit').setAttribute('aria-label',`Use medkit, ${economy.state.items.medkit} available, key ${formatKey(bindings().medkit)}`);$('#use-grenade').setAttribute('aria-label',`Hold to set range, release to throw ${fireSelected?'fire':'frag'} grenade, ${grenadeCount} available, key ${formatKey(bindings().grenade)}`);$('#use-medkit').classList.toggle('empty',economy.state.items.medkit===0);$('#use-grenade').classList.toggle('empty',grenadeCount===0);$('#armor').textContent=Math.ceil(economy.state.shield)+' ARMOR';$('#armorbar').style.width=(economy.state.shield/60*100)+'%';$('.armor-track').setAttribute('aria-valuenow',String(economy.state.shield));$('#health').textContent=Math.ceil(player.hp);$('#healthbar').style.width=(player.hp/player.maxHp*100)+'%';$('#ammo').textContent=`${player.ammo} / ${weapons[selected].capacity}`;$('#reserve').textContent=reload>0?'RELOADING…':weapons[selected].reserve+' RESERVE';$('.player-status').classList.toggle('low-health',player.hp>0&&player.hp<=player.maxHp*.3);$('.ammo-status').classList.toggle('empty-magazine',player.ammo===0&&reload===0);$('.ammo-status').classList.toggle('low-ammo',player.ammo>0&&player.ammo<=Math.max(1,Math.floor(weapons[selected].capacity*.2)));$('.ammo-status').classList.toggle('out-of-ammo',player.ammo===0&&weapons[selected].reserve===0);$('.ammo-status').classList.toggle('reloading',reload>0);$('#weapon').textContent=weapons[selected].name;$('#rooms').textContent=`${seenRooms.size} / ${roomDefs.length}`;}
function end(win){
 if(ended)return;
 ended=true;active=false;audio.setPaused(true);tutorial?.hide();shooting=false;keys.clear();touchControls?.reset();menu?.hide();document.body.classList.remove('playing');
 persistCampaignProfile();if(win&&runConfig.mission==='campaign'&&runConfig.operation){campaignProgress.complete(runConfig.operation);void campaignProfile.claimCashReward('contract.'+runConfig.operation).then(result=>{if(result.ok&&result.amount>0){hud();const notes=$('#result-notes');if(notes){const payout=document.createElement('p');payout.textContent=`First-clear payout · +$${result.amount}`;notes.append(payout);}}}).catch(()=>{});}
 const result=recordResult(browserStorage(),runConfig,operationStats,win,explorationPercent());
 const story=win?campaignDebrief(runConfig,campaignProgress.completed(),[...new Set([...progression.state.logs,...campaignProgress.researchLogs()])]):null;
 const sectorComplete=win&&runConfig.mission==='campaign'&&runConfig.operation&&runConfig.operation!==CAMPAIGN_OPERATIONS[CAMPAIGN_OPERATIONS.length-1].id;
 const overlay=$('#overlay');overlay.classList.remove('menu-overlay');overlay.style.display='flex';
 overlay.innerHTML=`<section class="result-panel${win?' result-success':''}" role="dialog" aria-modal="true" aria-labelledby="result-title"><div class="result-heading"><svg class="result-symbol" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="16" cy="16" r="13"/><path d="${win?'m9 16 5 5 9-10':'m11 11 10 10m0-10L11 21'}"/></svg><h1 id="result-title">${story?.finale?'Campaign complete':sectorComplete?'Sector secured':win?'Mission complete':'Operation failed'}</h1></div><p id="result-context" class="result-context"></p><section id="result-story" class="result-story" hidden></section><div class="result-actions" id="result-actions"><button id="again" class="result-action">Retry operation</button><button id="back-menu" class="result-action">Main menu</button></div><details class="result-details"><summary>Run details</summary><dl class="debrief" id="result-stats"></dl><div id="result-notes"></div></details></section>`;
 const difficulty={easy:'Recruit',normal:'Operator',hard:'Veteran'}[runConfig.difficulty]??runConfig.difficulty;
 $('#result-context').textContent=operationTitle()+' · '+difficulty+(result.personalBest?' · Personal best':'');
 if(story){const panel=$('#result-story');panel.hidden=false;const heading=document.createElement('h2'),body=document.createElement('p');heading.textContent=story.heading;body.textContent=story.body;panel.append(heading,body);}
 const debrief=$('#result-stats');for(const [label,value] of [['Time',formatDuration(result.elapsed)],['Creatures defeated',result.kills],['Facility mapped',result.exploration+'%'],['Shots fired',result.shots],['Supplies used',`${result.medkits} medkits · ${result.grenades} grenades`]]){const term=document.createElement('dt'),detail=document.createElement('dd');term.textContent=label;detail.textContent=value;debrief.append(term,detail);}
 let primary=$('#again');
 if(win&&runConfig.mission==='campaign'){const mapButton=document.createElement('button');mapButton.textContent=sectorComplete?'Next operation':'Facility map';mapButton.className='result-action result-primary';mapButton.onclick=()=>{prepareOperation();menu.show('campaign-map');};$('#again').before(mapButton);primary=mapButton;}
 else if(!win&&checkpointMatchesOperation(latestSnapshot(),runConfig)){const button=document.createElement('button');button.id='restart-checkpoint';button.textContent='Restart checkpoint';button.className='result-action result-primary';button.onclick=queueCheckpointLoad;$('#again').before(button);primary=button;}
 else $('#again').className='result-action result-primary';
 if(win&&result.delta!==null){const difference=document.createElement('p');difference.className='debrief-delta';difference.textContent=(result.delta<0?'−':'+')+formatDuration(Math.abs(result.delta))+' vs previous best';$('#result-notes').append(difference);}
 if(story?.evidence){const transmission=document.createElement('p');transmission.className='debrief-transmission';transmission.textContent=story.evidence;$('#result-notes').append(transmission);}
 $('#again').onclick=()=>{location.href=deploymentUrl(runConfig);};$('#back-menu').onclick=()=>menu.show('main');primary.focus?.();
}

function trace(ax,az,bx,bz,color){if(menu?.settings.reducedEffects)return;const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(ax,.7,az),new THREE.Vector3(bx,.7,bz)]);const line=new THREE.Line(g,new THREE.LineBasicMaterial({color}));scene.add(line);tracers.push({line,life:.07});}
function shoot(){
 if(fire>0||reload>0||playerMesh.userData.grenadeCharging||Number.isFinite(playerMesh.userData.throwPhase))return;
 if(player.ammo<=0){if(weapons[selected].reserve>0)beginReload();else{fire=.3;toast('NO AMMO · '+formatKey(bindings().knife)+' KNIFE · COLLECT SUPPLIES');}return;}
 const gun=weapons[selected],aimX=aim.x-player.x,aimZ=aim.z-player.z,hasAim=Math.hypot(aimX,aimZ)>.05,directions=shotDirections(hasAim?aimX:-Math.sin(player.angle),hasAim?aimZ:-Math.cos(player.angle),gun);if(!directions.length)return;
 player.ammo--;operationStats.shots++;audio.shot(equippedModelType());fire=gun.interval;playerMesh.userData.flashTime=menu?.settings.reducedEffects?0:.065;
 if(!menu?.settings.reducedEffects)combatEffects.shot(player.x,player.z,player.angle,selected);
 for(const direction of directions){if(ended)break;let x=player.x,z=player.z;for(let distance=.5;distance<gun.range;distance+=.1){x=player.x+direction.x*distance;z=player.z+direction.z*distance;const barrel=barrelSystem?.findHit(x,z,.12);if(barrel){barrelSystem.hit(barrel,gun.damage);break;}if(solid(x,z))break;
  const enemy=enemies.find(e=>e.hp>0&&(e.spawnDelay??0)<=0&&Math.hypot(e.x-x,e.z-z)<(e.radius??.32)+.12);if(!enemy)continue;
  enemy.alerted=true;enemy.hp=Math.max(0,enemy.hp-gun.damage);if(gun.stagger>0)applyEnemyStagger(enemy,gun.stagger);if(enemy.hp===0)rewardEnemyKill(enemy);enemy.mesh.visible=enemy.hp>0;if(!enemy.hp)enemy.healthBar.group.visible=false;updateEnemyHealthBar(enemy);break;
 }
 if(ended)return;trace(player.x,player.z,x,z,0xd2f9b2);const ix=x-direction.x*.2,iz=z-direction.z*.2;if(!menu?.settings.reducedEffects&&visible(ix,iz))combatEffects.impact(ix,iz);
 }
 hud();
}
function applyPlayerDamage(damage){if(!Number.isFinite(damage)||damage<=0||(player.hurtGrace??0)>0)return false;player.hurtGrace=.4;audio.bite();const armorCost=Math.max(.8,Math.min(1,Number(skillEffects().armorDamageMultiplier)||1)),absorbed=Math.min(economy.state.shield/armorCost,damage);economy.state.shield=Math.max(0,economy.state.shield-absorbed*armorCost);player.hp=Math.max(0,player.hp-(damage-absorbed));return true;}
function beginReload(){if(typeof grenadeActions!=='undefined'&&grenadeActions?.isAnimating())return;if(typeof grenadeActions!=='undefined'&&grenadeActions?.charging)grenadeActions.cancel();if(player.ammo>=weapons[selected].capacity||reload>0)return;if(weapons[selected].reserve<=0){toast('NO RESERVE AMMO · '+formatKey(bindings().knife)+' KNIFE · COLLECT GOLD SUPPLIES');return;}reload=reloadDuration();audio.reload();hud();}
function reloadDuration(){return Math.max(.5,weapons[selected].reload*Math.max(.88,Math.min(1,Number(skillEffects().reloadMultiplier)||1)));}
function advanceWeaponTimers(dt){meleeCooldown=Math.max(0,meleeCooldown-dt);fire=Math.max(0,fire-dt);if(reload>0){reload=Math.max(0,reload-dt);if(reload===0){player.ammo=refillMagazine(weapons[selected],player.ammo);hud();}}}
function resumeRun(){if(typeof puzzle!=='undefined')puzzle.grabbed=null;touchControls?.reset();paused=false;simulation.reset();void audio.unlock();audio.setPaused(false);shooting=false;keys.clear();$('#pause').textContent='PAUSE  ESC';document.body.classList.add('playing');return true;}
function pauseRun(){
 if(typeof puzzle!=='undefined')puzzle.grabbed=null;
 if(typeof grenadeActions!=='undefined')grenadeActions?.cancel();
 if(!active||ended)return;
 touchControls?.reset();doorHint?.skip();
 if(helpOpen){helpOpen=false;$('#controls-help').hidden=true;$('#help-button').setAttribute('aria-expanded','false');}
 if(mapOpen){mapOpen=false;mapFocus.close();drawMinimap.setExpanded(false);$('.map-panel').classList.remove('map-expanded');$('.map-panel').style.display=menu?.settings?.showMinimap===false?'none':'block';$('#toggle-map').textContent='EXPAND  '+formatKey(bindings().map);$('#toggle-map').setAttribute('aria-label','Open map');}
 paused=true;shooting=false;keys.clear();simulation.reset();audio.setPaused(true);$('#pause').textContent='RESUME  ESC';menu?.show('pause');
}
function togglePause(){
 if(mapOpen){toggleMap();return;}
 if(!active||ended)return;
 if(menu?.isOpen()){resumeRun();menu.hide();return;}
 pauseRun();
}
$('#pause').onclick=togglePause;
function toggleHelp(){if(!active||ended||menu?.isOpen())return;if(typeof puzzle!=='undefined')puzzle.grabbed=null;if(typeof grenadeActions!=='undefined')grenadeActions?.cancel();touchControls?.reset();helpOpen=!helpOpen;const help=$('#controls-help');help.hidden=!helpOpen;$('#help-button').setAttribute('aria-expanded',String(helpOpen));keys.clear();shooting=false;simulation.reset();if(helpOpen){refreshHelp();help.focus?.();}else renderer.domElement.focus();}
$('#help-button').onclick=toggleHelp;
$('#replay-guidance').onclick=()=>{const door=doors[guidanceDoorIndex];if(!isRunning()||!door?.hintTarget)return;if(combatIsActive(player,enemies,progression.state.zones)){toast('CAMERA LEAD AVAILABLE AFTER COMBAT');return;}doorHint.repeat(String(guidanceDoorIndex),door.hintTarget,player);};
$('#switch-grenade').onclick=()=>{if(isRunning())cycleGrenade();renderer.domElement.focus();};
$('#use-medkit').onclick=()=>{if(isRunning())useMedkit();renderer.domElement.focus();};$('#use-grenade').onclick=event=>{if(event.detail===0&&isRunning())throwGrenade();renderer.domElement.focus();};const grenadeButton=$('#use-grenade');let grenadePointer=null;
grenadeButton.addEventListener('pointerdown',event=>{if(!isRunning()||event.button>0||grenadePointer!==null)return;event.preventDefault();grenadePointer=event.pointerId;grenadeButton.setPointerCapture?.(event.pointerId);beginGrenadeCharge();});
grenadeButton.addEventListener('pointerup',event=>{if(event.pointerId!==grenadePointer)return;grenadePointer=null;event.preventDefault();if(isRunning())releaseGrenadeCharge();else cancelGrenadeCharge();renderer.domElement.focus();});
function cancelGrenadePointer(event){if(event&&event.type!=='resize'&&event.pointerId!==grenadePointer)return;grenadePointer=null;cancelGrenadeCharge();}
grenadeButton.addEventListener('pointercancel',cancelGrenadePointer);grenadeButton.addEventListener('lostpointercapture',cancelGrenadePointer);window.addEventListener('resize',cancelGrenadePointer);

function toggleMap(){
 if(typeof puzzle!=='undefined')puzzle.grabbed=null;
 if(menu?.isOpen()||ended)return;if(typeof grenadeActions!=='undefined')grenadeActions?.cancel();touchControls?.reset();mapOpen=!mapOpen;shooting=false;keys.clear();drawMinimap.setExpanded(mapOpen);$('.map-panel').classList.toggle('map-expanded',mapOpen);$('#toggle-map').textContent=(mapOpen?'CLOSE MAP  ':'EXPAND  ')+formatKey(bindings().map);$('#toggle-map').setAttribute('aria-label',mapOpen?'Close map':'Open map');$('.map-panel').style.display=mapOpen||menu?.settings.showMinimap?'block':'none';drawMinimap(visibleTiles);if(mapOpen)mapFocus.open();else{mapFocus.close();renderer.domElement.focus();}
}
$('#toggle-map').onclick=toggleMap;
touchControls=createTouchControls({host:$('#touch-controls'),isRunning,onAction:action=>{if(action==='interact')beginInteraction();if(action==='interactEnd')releaseCrateGrab(puzzle);if(action==='reload')beginReload();if(action==='weapon')equip(selected==='rifle'?'pistol':'rifle');if(action==='knife')knifeStrike();renderer.domElement.focus();}});
const mapFocus=createMapFocus({panel:$('.map-panel'),closeButton:$('#toggle-map'),onClose:toggleMap});
doorHint=createDoorHintCamera({onBegin:target=>{touchControls?.reset();restoreHintFog=previewFog(fogPixels,W,H,map,target);fogTexture.needsUpdate=true;renderer.domElement.style.filter=`brightness(${menu?.settings.brightness??1}) grayscale(1)`;keys.clear();shooting=false;for(const enemy of enemies){enemy.mesh.visible=false;if(enemy.healthBar)enemy.healthBar.group.visible=false;}lootView.update(loot,()=>false,time);barrelSystem.update(()=>false);toast('LOCKED · '+target.label);},onEnd:()=>{restoreHintFog?.();restoreHintFog=null;fogTexture.needsUpdate=true;renderer.domElement.style.filter=`brightness(${menu?.settings.brightness??1})`;focus.x=player.x;focus.z=player.z;updateFog();lootView.update(loot,visible,time);barrelSystem.update(visible);}});
addEventListener('keydown',e=>{
 void audio.unlock();if(e.defaultPrevented)return;
 if(doorHint?.isActive()){e.preventDefault();if(e.code==='Escape'||actionForCode(e.code,bindings())==='interact')doorHint.skip();return;}
 if(helpOpen){if(e.code==='Escape'||actionForCode(e.code,bindings())==='help'){e.preventDefault();toggleHelp();}return;}
 if(e.code==='Escape'){e.preventDefault();togglePause();return;}
 if(menu?.isOpen()){keys.clear();return;}
 if(e.target?.closest?.('input,select,textarea,summary'))return;if(e.target?.closest?.('button')&&(e.code==='Space'||e.code==='Enter'))return;
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)||Object.values(bindings()).includes(e.code))e.preventDefault();
 if(actionForCode(e.code,bindings())==='map'&&!e.repeat){toggleMap();return;}
 if(mapOpen)return;keys.add(e.code);const action=actionForCode(e.code,bindings());
 if(action?.startsWith('aim')&&menu?.settings.aimMode!=='mouse'){
  const direction=keyboardAimDirection(keys,bindings());
  if(direction)keyboardAim=direction;
  aimMode='keyboard';
 }
 if(action==='reload'&&active&&!paused)beginReload();
 if(action==='help'&&!e.repeat)toggleHelp();
 if(active&&!paused&&!e.repeat){
  if(action==='cycleGrenade')cycleGrenade();if(action==='medkit')useMedkit();if(action==='grenade')beginGrenadeCharge();if(action==='interact')beginInteraction();
  if(action==='resetPuzzle'&&!puzzle.solved){resetPressurePuzzle(puzzle,player);toast('CRATES RESET');updatePuzzleArt();updateFog();}
  if(action==='knife')knifeStrike();if(action==='rifle')equip('rifle');if(action==='pistol')equip('pistol');
 }
});
addEventListener('keyup',e=>{keys.delete(e.code);if(actionForCode(e.code,bindings())==='interact')releaseCrateGrab(puzzle);if(actionForCode(e.code,bindings())==='grenade'){if(isRunning())releaseGrenadeCharge();else cancelGrenadeCharge();}});addEventListener('blur',()=>{keys.clear();shooting=false;if(active&&!paused)pauseRun();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)pauseRun();});
addEventListener('pointermove',e=>{if(e.target!==renderer.domElement||e.pointerType==='touch')return;if(isRunning())tutorial?.event('aim');if(!Number.isFinite(e.clientX)||!Number.isFinite(e.clientY))return;if(menu?.settings.aimMode!=='keyboard'&&pointerHasMoved(e,lastPointer))aimMode='mouse';lastPointer={x:e.clientX,y:e.clientY};mouse.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);if(aimMode==='mouse'){$('#crosshair').style.left=e.clientX+'px';$('#crosshair').style.top=e.clientY+'px';}});
addEventListener('pointerdown',()=>{void audio.unlock();},{capture:true});renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'&&e.button===0&&isRunning()){renderer.domElement.focus();shooting=true;}});addEventListener('pointerup',()=>shooting=false);addEventListener('contextmenu',e=>e.preventDefault());
let viewHeight=22;let focus={x:player.x,z:player.z};function resize(){if(menu)document.documentElement.style.setProperty('--hud-scale',String(menu.settings.hudScale??1));const aspect=innerWidth/innerHeight,{height:h,width:w}=cameraViewSize(viewHeight,aspect,!!touchControls?.enabled);camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.near=.1;camera.far=100;camera.updateProjectionMatrix();renderer.setPixelRatio(renderPixelRatio(menu?.settings.quality??'medium',{width:innerWidth,height:innerHeight,pixelRatio:devicePixelRatio}));renderer.setSize(innerWidth,innerHeight);}addEventListener('resize',resize);renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();viewHeight=THREE.MathUtils.clamp(viewHeight+Math.sign(e.deltaY)*1.5,14,32);resize();},{passive:false});resize();
function simulate(dt){
 if(isRunning()){const lockedDoor=nearbyDoor();if(lockedDoor?.hintTarget)guidanceDoorIndex=doors.indexOf(lockedDoor);operationStats.elapsed+=dt;for(const d of doors)d.slide=THREE.MathUtils.clamp(d.slide+(d.open?1:-1)*dt*2.7,0,1);const touch=touchControls?.getState();if(!keys.has(bindings().interact)&&!touch?.interactHeld)releaseCrateGrab(puzzle);let dx=Number(keys.has(bindings().moveRight))-Number(keys.has(bindings().moveLeft))+(touch?.move.x??0),dz=Number(keys.has(bindings().moveDown))-Number(keys.has(bindings().moveUp))+(touch?.move.z??0);const l=Math.max(1,Math.hypot(dx,dz)),speed=puzzle.grabbed!=null?2.4:keys.has(bindings().sprint)||touch?.sprint?6*skillEffects().sprintMultiplier:4;move(player,dx/l*dt*speed,dz/l*dt*speed);if(updatePressurePuzzle(puzzle,player)){doors[0].unlocked=true;$('#hint').textContent='Door powered. Use '+formatKey(bindings().interact)+' at the green indicator.';toast('BOTH CIRCUITS ONLINE · DOOR READY · '+formatKey(bindings().interact));queueCheckpoint('Insertion door powered');audio.puzzle(true);}updatePuzzleArt();progression.update(player,dt);mutationNotes.record(enemies,visible);puzzleDiscovery.record(encounteredPuzzles({player,devices:progression.state.devices,plates:puzzle.plates,visible}));const ax=Number(keys.has(bindings().aimRight))-Number(keys.has(bindings().aimLeft)),az=Number(keys.has(bindings().aimDown))-Number(keys.has(bindings().aimUp));if((ax||az)&&menu?.settings.aimMode!=='mouse'){const length=Math.hypot(ax,az);keyboardAim={x:ax/length,z:az/length};aimMode='keyboard';}if(touch?.aim.active){const length=Math.hypot(touch.aim.x,touch.aim.z);keyboardAim={x:touch.aim.x/length,z:touch.aim.z/length};aimMode='keyboard';}if(ax||az||touch?.aim.active)tutorial?.event('aim');tutorial?.update(player,puzzle);if(aimMode==='keyboard')aim.set(player.x+keyboardAim.x*10,0,player.z+keyboardAim.z*10);else{ray.setFromCamera(mouse,camera);ray.ray.intersectPlane(plane,aim);}if(Math.hypot(aim.x-player.x,aim.z-player.z)>.05)player.angle=Math.atan2(-(aim.x-player.x),-(aim.z-player.z));grenadeActions?.update(dt,player,aim,solid);advanceWeaponTimers(dt);player.hurtGrace=Math.max(0,(player.hurtGrace??0)-dt);if(shooting||touch?.firing||keys.has(bindings().fire))shoot();if(ended)return;
 const livingEnemies=enemies.filter(enemy=>enemy.hp>0);
 for(const e of livingEnemies){
   if((e.spawnDelay??0)>0){e.spawnDelay=Math.max(0,e.spawnDelay-dt);e.mesh.visible=false;if(e.spawnCue){e.spawnCue.visible=visible(e.x,e.z);e.spawnCue.scale.setScalar(1+(.7-e.spawnDelay)*.6);e.spawnCue.material.opacity=.35+Math.sin(time*18)*.2;}if(e.spawnDelay===0)removeSpawnCue(e);continue;}
   const wasWinding=(e.attackWindup??0)>0;
   const sabotageTarget=progression.getSabotageTarget(e),enemyTarget=sabotageTarget??player;
   let routed=false;if(e.alerted&&!(e.attackWindup>0)&&!(e.pulseWindup>0||e.chargeWindup>0||e.chargeRemaining>0||e.shriekWindup>0||e.leapWindup>0||e.leapRemaining>0)&&!(e.staggerTime>0)&&!pursue.canMoveDirect(e,enemyTarget))routed=pursue(e,enemyTarget,dt,move);
   updateRoachEnemy(e,enemyTarget,dt,{lineOfSight:los,move,allowMovement:!routed,onBite:damage=>{
     if(sabotageTarget){progression.sabotage(e);return;}
     if(!applyPlayerDamage(damage))return;
     $('.player-status').classList.add('damaged');clearTimeout(player.damageTimer);player.damageTimer=setTimeout(()=>$('.player-status').classList.remove('damaged'),180);
     hud();if(player.hp<=0)end(false);
   }});
   if(!wasWinding&&e.attackWindup>0&&visible(e.x,e.z))audio.attack(e.x,e.z,player.x,player.z,e.variant);
   e.chitterTimer=(e.chitterTimer??2)-dt;if(e.chitterTimer<=0){e.chitterTimer=3+(Number(e.id.slice(1))%4);if(visible(e.x,e.z))audio.creature(e.x,e.z,player.x,player.z,e.variant);}
   if(!(e.attackWindup>0)&&!(e.pulseWindup>0||e.chargeWindup>0||e.chargeRemaining>0||e.shriekWindup>0||e.leapWindup>0||e.leapRemaining>0)&&!(e.staggerTime>0))for(const other of livingEnemies){if(other===e||other.hp<=0||(other.spawnDelay??0)>0)continue;const dx=e.x-other.x,dz=e.z-other.z,d=Math.hypot(dx,dz),spacing=(e.radius??.32)+(other.radius??.32)+.12;if(d>0&&d<spacing)move(e,dx/d*Math.min(.04,(spacing-d)*dt*3),dz/d*Math.min(.04,(spacing-d)*dt*3));}
   e.mesh.position.set(e.x,0,e.z);e.mesh.visible=e.hp>0&&(e.spawnDelay??0)<=0&&visible(e.x,e.z);updateEnemyHealthBar(e);
   if(ended)break;
 }

 if(ended)return;
 fireZones.update(dt,[...livingEnemies,...barrelSystem.state.filter(b=>b.hp>0),player]);if(ended)return;
 const collected=collectNearbyLoot(loot,player,weapons,los);if(collected.health||collected.rifle||collected.pistol){tutorial?.event('loot');audio.pickup();hud();if(collected.health)toast(`+${collected.health} HEALTH`);}
 refreshGuidance();
 const horde=progression.state.zones.find(z=>z.status==='active');
 const encounter=encounterStatus(horde),hordeDisplay=$('#horde-status');hordeDisplay.hidden=!encounter;if(encounter){hordeDisplay.textContent=encounter.text;hordeDisplay.dataset.phase=encounter.phase;hordeDisplay.setAttribute('aria-label',encounter.label);}
 for(const zone of progression.state.zones)if(zone.status==='cleared'&&!rewardedZones.has(zone.id)){rewardedZones.add(zone.id);player.hp=Math.min(player.maxHp,player.hp+8);hud();queueCheckpoint(zone.label+' cleared');}
 if(runConfig.mission!=='campaign'&&progression.isMissionComplete()){queueCheckpoint('Operation completed');commitCheckpoint();end(true);return;}
 if(checkpointPending)commitCheckpoint();
 if(progression.state.elapsed-lastCheckpointTime>120&&!horde&&enemies.every(e=>e.hp<=0||Math.hypot(player.x-e.x,player.z-e.z)>8)){queueCheckpoint('Field checkpoint');commitCheckpoint();}
 const room=roomDefs.find(r=>player.x>=r.x&&player.x<r.x+r.w&&player.z>=r.z&&player.z<r.z+r.h);if(room){if(!seenRooms.has(room.name)&&room.name!=='INSERTION'&&!horde&&enemies.every(e=>e.hp<=0||Math.hypot(player.x-e.x,player.z-e.z)>5))queueCheckpoint(room.name+' reached');seenRooms.add(room.name);$('#sector').textContent=room.name;hud();}if(!player.intel&&progression.canCollectIntel()&&Math.hypot(player.x-93,player.z-7)<1.2){player.intel=true;queueCheckpoint('Research intel recovered');$('#objective').textContent='Reach extraction';$('#hint').textContent='Find Evacuation in the far southeast wing.';$('#intel').textContent='◆ INTEL SECURED';toast('INTEL SECURED · GET TO EXTRACTION');audio.pickup();}if(!runConfig.operation&&player.intel&&Math.hypot(player.x-92,player.z-60)<1.2){queueCheckpoint('Evacuation reached');commitCheckpoint();end(true);}
 }
}

let last=performance.now(),lastPausedRender=0;renderer.setAnimationLoop(()=>{
 const now=performance.now(),elapsed=Math.max(0,(now-last)/1000);last=now;
 const dt=Math.min(elapsed,.1);let running=isRunning();if(running)time+=dt;audio.setPaused(!running);simulation.advance(elapsed,simulate,running);running=isRunning();if(!running&&!doorHint?.isActive()&&now-lastPausedRender<250)return;if(!running)lastPausedRender=now;const hintFocus=doorHint?.update(dt,player);

 for(const d of doors){d.group.position.set(d.x+(d.axis==='x'?d.slide*3:0),0,d.z+(d.axis==='z'?d.slide*3:0));if(d!==doors[0])d.status.material.color.set(d.progressLocked?0xe57c59:0x92d9a6);}
 const guidanceDoor=doors[guidanceDoorIndex];$('#replay-guidance').hidden=!active||!!menu?.isOpen()||!guidanceDoor?.hintTarget;$('#replay-guidance').disabled=!!doorHint?.isActive();
 salvageArt.update();
 const nearest=isRunning()?nearbyDoor():null;const cashCache=isRunning()?nearbySalvage():null;const devicePrompt=cashCache?`E · SALVAGE · $${cashCache.amount}`:isRunning()?progression.getPrompt(player):null;const sectorExit=runConfig.operation?campaignOperationExit(runConfig.operation):null,exitReady=!!sectorExit&&campaignOperationObjectivesComplete(runConfig.operation,{player,progression});missionPoints.exit=runConfig.operation?(exitReady?sectorExit:null):{x:92,z:60};missionPoints.intel=runConfig.operation&&runConfig.operation!=='nest'?null:{x:93,z:7};sectorExitMarker.visible=exitReady&&visible(sectorExit.x,sectorExit.z);if(exitReady)sectorExitMarker.position.set(sectorExit.x,.06,sectorExit.z);const exitPrompt=isRunning()&&exitReady&&Math.hypot(player.x-sectorExit.x,player.z-sectorExit.z)<=1.4?(runConfig.operation==='nest'?'E · EVACUATE':'E · LEAVE SECTOR'):null;const cratePrompt=isRunning()?(puzzle.grabbed!=null?'E · RELEASE TO LET GO':nearestPullableCrate(puzzle,player,(x,z,r)=>solid(x,z,r,true))?'E · HOLD TO GRAB CRATE':null):null;$('#interact').textContent=(cratePrompt||exitPrompt||devicePrompt||(nearest?(nearest.progressLocked?'E · LOCKED · '+nearest.lockReason:nearest.needsPower&&!nearest.unlocked?'E · LOCKED · NO POWER':`E · ${nearest.open?'CLOSE':'OPEN'} DOOR`):'')).replace(/^E · /,formatKey(bindings().interact)+' · ');
 touchControls?.setInteractAvailable($('#interact').textContent);
 for(const mesh of [playerMesh]){if(!paused)mesh.userData.flashTime=Math.max(0,mesh.userData.flashTime-dt);mesh.userData.flash.visible=mesh.userData.flashTime>0;}
 playerMesh.position.set(player.x,0,player.z);playerMesh.rotation.y=player.angle;if(isRunning()){animateSoldier(playerMesh,active?dt:0,reload>0?{progress:1-reload/reloadDuration(),type:equippedModelType()}:false);for(const e of enemies)if(e.hp>0&&e.mesh.visible)animateRoach(e.mesh,active?dt:0);}combatEffects.update(running?dt:0);explosions.update(running?dt:0);updateProgressionArt(time);ring.material.color.set(player.hurtGrace>0?0xf2b26f:0xb7f8c6);ring.position.set(player.x,.05,player.z);if(hintFocus){focus.x=hintFocus.x;focus.z=hintFocus.z;}else{focus.x+=(player.x-focus.x)*(1-Math.exp(-7*dt));focus.z+=(player.z-focus.z)*(1-Math.exp(-7*dt));}camera.position.set(focus.x,40,focus.z);camera.lookAt(focus.x,0,focus.z);camera.updateMatrixWorld();if(aimMode==='keyboard'&&active){const screen=aim.clone().project(camera);$('#crosshair').style.left=THREE.MathUtils.clamp((screen.x+1)*innerWidth/2,16,innerWidth-16)+'px';$('#crosshair').style.top=THREE.MathUtils.clamp((1-screen.y)*innerHeight/2,16,innerHeight-16)+'px';}sun.position.set(player.x-18,35,player.z+3);sun.target.position.set(player.x,0,player.z);if(running)fogTick+=dt;if(running&&fogTick>.07){updateFog();fogTick=0;}intelMesh.rotation.y=time;for(let i=tracers.length-1;i>=0;i--){tracers[i].life-=dt;if(tracers[i].life<=0){scene.remove(tracers[i].line);tracers[i].line.geometry.dispose();tracers[i].line.material.dispose();tracers.splice(i,1);}}if(running){lootView.update(loot,visible,time);barrelSystem.update(visible);}renderer.render(scene,camera);
});
Object.assign(window,{renderer,scene,gameDebug:{player,enemies,map,explored,seenRooms,los,solid,move,updateFog,doors,cover,puzzle,progression}});enemies.forEach(e=>e.mesh.position.set(e.x,0,e.z));updateFog();hud();

function applySettings(settings){
 touchControls?.configure(settings.touchControls);
 renderer.domElement.style.filter=`brightness(${settings.brightness})`;
 renderer.shadowMap.enabled=settings.quality!=='low';const shadowSize=settings.quality==='high'?2048:1024;if(sun.shadow.mapSize.x!==shadowSize){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(shadowSize,shadowSize);renderer.shadowMap.needsUpdate=true;}
 audio.applySettings(settings);fireZones.setReducedEffects(!!settings.reducedEffects);document.body.classList.toggle('reduced-effects',!!settings.reducedEffects);const fittingScale=settings.hudScale??1;document.documentElement.style.setProperty('--hud-scale',String(fittingScale));if(settings.aimMode==='mouse'||settings.aimMode==='keyboard')aimMode=settings.aimMode;viewHeight=settings.zoom;resize();refreshHelp();$('.map-panel').style.display=settings.showMinimap?'block':'none';
}
function captureSnapshot(){return {
 version:3,fieldSkill:{...(activeFieldSkillState??fieldSkills.serialize(campaignProgress.completed())),selected:activeFieldSkill},barrels:barrelSystem.serialize(),doorHints:doorHint?.serializeSeen()??[],fireZones:fireZones.serialize(),profileRevision:campaignProfile.state.revision,profilePurchaseRevision:campaignProfile.state.purchaseRevision,loadout:{primary:active&&!ended?(weapons.rifle.id??campaignProfile.state.primary):campaignProfile.state.primary,unlocked:[...campaignProfile.state.unlocked]},stats:{...operationStats},loot:JSON.parse(JSON.stringify(loot)),reserves:{rifle:weapons.rifle.reserve,pistol:weapons.pistol.reserve},economy:economy.serialize(),world:[W,H],config:{...runConfig},player:{x:player.x,z:player.z,hp:player.hp,maxHp:player.maxHp,ammo:player.ammo,intel:player.intel,angle:player.angle,hurtGrace:player.hurtGrace},selected,
 magazines:{rifle:selected==='rifle'?player.ammo:weapons.rifle.ammo,pistol:selected==='pistol'?player.ammo:weapons.pistol.ammo},reload,
 enemies:enemies.map(e=>({id:e.id,rewardIdentity:e.rewardIdentity,x:e.x,z:e.z,hp:e.hp,maxHp:e.maxHp,variant:e.variant,cooldown:e.cooldown,alerted:e.alerted,spawnDelay:e.spawnDelay,attackWindup:e.attackWindup,staggerTime:e.staggerTime,lootDropped:!!e.lootDropped,encounter:e.encounter,bossMechanic:e.bossMechanic,pulseCooldown:e.pulseCooldown,chargeCooldown:e.chargeCooldown,shriekCooldown:e.shriekCooldown,leapCooldown:e.leapCooldown,staggerImmunity:e.staggerImmunity})),
 doors:doors.map(d=>({open:d.open,slide:d.slide,unlocked:!!d.unlocked})),
 puzzle:{solved:puzzle.solved,crates:puzzle.crates.map(c=>({x:c.x,z:c.z,seated:c.seated})),plates:puzzle.plates.map(p=>({active:p.active}))},
 progression:progression.serializeState(),explored:[...explored],seenRooms:[...seenRooms],rewardedZones:[...rewardedZones]
};}
function restoreSnapshot(data){
 if(!validateSnapshot(data))return false;if(data.world[0]!==W||data.world[1]!==H||data.doors.length!==doors.length)data=upgradeWorldSnapshot(data);
 if(!validateSnapshot(data,{width:W,height:H,doorCount:doors.length,crateCount:puzzle.crates.length,plateCount:puzzle.plates.length,barrelIds:barrelSystem.state.map(b=>b.id)}))return false;
 if(typeof grenadeActions!=='undefined')grenadeActions?.clear();doorHint?.skip();barrelSystem.restore(data.barrels);doorHint?.restoreSeen(data.doorHints??[]);guidanceDoorIndex=data.doorHints?.length?Number(data.doorHints[data.doorHints.length-1].split('|')[0]):null;
 Object.assign(operationStats,createOperationStats(data.stats));
 activeFieldSkillState=normalizeFieldSkill(data.fieldSkill,campaignProgress.completed());activeFieldSkill=activeFieldSkillState.selected;
 Object.assign(runConfig,{operation:null,remix:false},data.config);updateOperationEnvironment();rules=difficultyRules[runConfig.difficulty]||difficultyRules.normal;campaignProfile.reload();const retainPurchases=campaignProfile.hasPurchasesSince(data);if(!retainPurchases){campaignProfile.restoreLoadout(data.loadout??{});campaignProfile.restoreCheckpointEconomy(data.economy);campaignProfile.state.revision=Math.max(campaignProfile.state.revision,Number(data.profileRevision)||0);}applyPrimaryLoadout();
 Object.assign(player,data.player);if(player.maxHp!==100){player.hp=Math.min(100,Math.max(0,player.hp/player.maxHp*100));player.maxHp=100;}player.hurtGrace=Math.max(0,Math.min(.4,Number(player.hurtGrace)||0));if(!Number.isFinite(player.x)||!Number.isFinite(player.z)||player.x<1||player.z<1||player.x>=W-1||player.z>=H-1)return false;
 for(const e of enemies){removeSpawnCue(e);scene.remove(e.mesh);if(e.healthBar)scene.remove(e.healthBar.group);}enemies.length=0;const byId=new Map();nextEnemyId=1;lootView.clear();Object.assign(loot,createLootState(data.loot));weapons.rifle.reserve=Math.max(0,Math.min(300,Number(data.reserves?.rifle??120)||0));weapons.pistol.reserve=Math.max(0,Math.min(150,Number(data.reserves?.pistol??60)||0));
 for(const saved of data.enemies){if(!saved.rewardIdentity){const zone=data.progression.zones.find(z=>z.waveIds?.includes(saved.id));const index=zone?.waveIds.indexOf(saved.id);saved.rewardIdentity=zone?`kill.${zone.id}.${Math.max(0,zone.spawned-zone.waveIds.length+index)}`:`kill.static.${Math.max(0,(Number(saved.id?.slice(1))||1)-1)}`;}const base=ROACH_VARIANTS[saved.variant]||ROACH_VARIANTS.normal;const enemy={...base,...saved,maxHp:saved.maxHp??Math.ceil(base.hp*rules.hp),speed:base.speed*rules.speed,biteDamage:Math.round(base.biteDamage*rules.damage),behavior:rules.behavior,windupDuration:rules.windupDuration,mesh:saved.hp>0?createRoach(scene,saved.variant):new THREE.Group()};if(saved.variant==='screecher')enemy.shriekCooldown=Math.max(0,Math.min(6,Number.isFinite(saved.shriekCooldown)?saved.shriekCooldown:1));if(saved.variant==='leaper')enemy.leapCooldown=Math.max(0,Math.min(4.8,Number.isFinite(saved.leapCooldown)?saved.leapCooldown:1));if(saved.variant==='charger')enemy.chargeCooldown=Math.max(0,Math.min(4.5,Number.isFinite(saved.chargeCooldown)?saved.chargeCooldown:1));enemy.chargeWindup=0;enemy.chargeRemaining=0;enemy.shriekWindup=0;enemy.leapWindup=0;enemy.leapRemaining=0;enemy.pulseWindup=0;enemy.attackWindup=Math.max(0,Number(enemy.attackWindup)||0);enemy.staggerTime=Math.max(0,Number(enemy.staggerTime)||0);enemy.mesh.position.set(enemy.x,0,enemy.z);enemy.mesh.visible=false;attachEnemyHealthBar(scene,enemy);enemies.push(enemy);byId.set(enemy.id,enemy);nextEnemyId=Math.max(nextEnemyId,(Number(enemy.id?.slice(1))||0)+1);}
 if(!progression.restoreState(data.progression,byId))return false;progression.state.mission=runConfig.mission;runConfig.remix=!!progression.state.remix;for(const zone of progression.state.zones)for(const enemy of zone.wave){enemy.encounter=zone.id;if(zone.id==='nest'&&enemy.variant==='boss'){enemy.bossMechanic='pulse';enemy.pulseCooldown=Math.max(2,Number(enemy.pulseCooldown)||0);}enemy.pulseWindup=0;}for(const zone of data.progression.zones)if(zone.status==='cleared'&&!zone.waveRewardIds)for(let i=0;i<(zone.total??zone.spawned);i++)campaignProfile.queueEnemyReward(`kill.${zone.id}.${i}`,'paid').catch(()=>{});for(const enemy of enemies)if(enemy.hp<=0&&!enemy.rewardIdentity){enemy.rewardIdentity=`kill.static.${Math.max(0,(Number(enemy.id?.slice(1))||1)-1)}`;}for(const enemy of enemies)if(enemy.hp<=0)campaignProfile.queueEnemyReward(enemy.rewardIdentity,'paid').catch(()=>{});fireZones.clear();if(data.fireZones)fireZones.restore(data.fireZones);for(const id of progression.state.logs)campaignProgress.recordLog(id);for(const id of progression.state.artifacts??[])campaignProgress.recordArtifact(id);
 data.doors?.forEach((d,i)=>{if(doors[i])Object.assign(doors[i],d);});
 progression.state.artifacts=[...new Set([...progression.state.artifacts,...campaignProgress.artifacts()])];progression.state.logs=[...new Set([...progression.state.logs,...campaignProgress.researchLogs()])];for(const device of progression.state.devices){if(device.kind==='artifact'||device.kind==='log'){device.active=(device.kind==='artifact'?progression.state.artifacts:progression.state.logs).includes(device.id);device.progress=device.active?1:0;}}progression.refreshLocks();
 puzzle.grabbed=null;puzzle.solved=!!data.puzzle.solved;puzzle.crates.forEach((c,i)=>Object.assign(c,data.puzzle.crates[i]));puzzle.plates.forEach((p,i)=>Object.assign(p,data.puzzle.plates[i]));doors[0].unlocked=puzzle.solved;updatePuzzleArt();
 explored.clear();for(const id of data.explored)if(Number.isInteger(id)&&id>=0&&id<W*H)explored.add(id);seenRooms.clear();data.seenRooms?.forEach(r=>seenRooms.add(r));rewardedZones.clear();data.rewardedZones?.forEach(z=>rewardedZones.add(z));
 for(let i=0;i<W*H;i++)fogPixels[i*4+3]=255;for(const id of explored){const x=id%W,z=Math.floor(id/W);fogPixels[((H-1-z)*W+x)*4+3]=209;}previousVisible=[];
 weapons.rifle.ammo=data.magazines?.rifle??rules.magazine;weapons.pistol.ammo=data.magazines?.pistol??12;reload=0;if(data.selected!==selected)equip(data.selected==='pistol'?'pistol':'rifle');weapons.rifle.ammo=data.magazines?.rifle??rules.magazine;weapons.pistol.ammo=data.magazines?.pistol??12;weapons.rifle.ammo=Math.min(weapons.rifle.ammo,weapons.rifle.capacity);weapons.pistol.ammo=Math.min(weapons.pistol.ammo,weapons.pistol.capacity);player.ammo=Math.min(data.player.ammo,weapons[selected].capacity);reload=Math.max(0,Number(data.reload)||0);
 focus.x=player.x;focus.z=player.z;keyboardAim={x:-Math.sin(player.angle),z:-Math.cos(player.angle)};aimMode=menu?.settings.aimMode==='mouse'?'mouse':'keyboard';lastPointer=null;

 reload=Math.max(0,reload);refreshPlayerWeapon();persistCampaignProfile();refreshGuidance(true);updateFog();hud();if(retainPurchases)queueCheckpoint('Loadout updated');return true;
}
function startOperation(saveInitial=true){active=true;ended=false;resumeRun();menu?.hide();renderer.domElement.focus();if(saveInitial&&runConfig.mission==='campaign'&&(!runConfig.operation||runConfig.operation==='breach'))tutorial?.start(player,{touch:!!touchControls?.enabled});toast(operationTitle().toUpperCase());if(saveInitial)queueCheckpoint('Operation deployment');if(checkpointPending)commitCheckpoint();}
function queueLoad(slot){const snapshot=saveSlots.load(slot);if(!snapshot)throw new Error('This save slot is empty or could not be read.');try{compatibleStorage(sessionStorage).setItem('nulldelve.pendingLoad',JSON.stringify(snapshot));}catch{throw new Error('Browser session storage is unavailable. Enable storage to load this save.');}location.href=location.pathname+'?play=load';return true;}
menu=createGameMenu({overlay:$('#overlay'),
 getStatus:()=>({active:active&&!ended,personalBests:readOperationRecords(browserStorage()),persistenceWarning:campaignProfile.isSessionOnly()||campaignProgress.isSessionOnly()||fieldSkills.isSessionOnly()?'Session only':null,completedOperations:campaignProgress.completed(),mutationNotes:mutationNotes.list(),fieldSkill:fieldSkills.selected(campaignProgress.completed()),skillState:fieldSkills.serialize(campaignProgress.completed()),config:{...runConfig},researchLogs:progression.state.devices.filter(d=>d.kind==='log'&&d.active).map(d=>({label:d.label,text:d.text})),slots:saveSlots.list(),checkpoint:saveSlots.checkpointInfo(),missionGuidance:currentGuidance().steps,armory:{available:isSafeToShop(),reason:'Available at base before deployment.',bindings:bindings(),credits:economy.state.credits,grenadeType:economy.state.grenadeType,offers:economy.getOffers(),weapons:campaignProfile.getWeaponOffers(),items:economy.state.items,sidearm:{stats:{damage:weapons.pistol.damage,capacity:weapons.pistol.capacity,reload:weapons.pistol.reload}},shield:economy.state.shield,primary:campaignProfile.state.primary},canContinue:active&&!ended||!!latestSnapshot()}),
 onPrepareOperation:prepareOperation,
 onFieldSkill:id=>{if(!isSafeToShop())return {ok:false,message:"Choose a field skill before deployment."};const result=id.startsWith('learn:')?fieldSkills.learn(id.slice(6),campaignProgress.completed()):fieldSkills.equip(id,campaignProgress.completed());if(result.ok){activeFieldSkill=fieldSkills.selected(campaignProgress.completed());activeFieldSkillState=null;updateDeploymentTransfer();}return result;},
 onNewGame:config=>{if(config.mission==='campaign'&&config.operation&&!campaignProgress.isUnlocked(config.operation))return {ok:false,message:'Finish the previous operation to unlock this location.'};persistCampaignProfile();location.href=deploymentUrl(config);},
 onContinue:()=>{if(active&&!ended){resumeRun();return true;}return queueCheckpointLoad();},
 onPurchase:async id=>{if(!isSafeToShop())return {ok:false,message:'Visit the armory before deployment.'};const result=await campaignProfile.purchaseOffer(id);if(result.ok){audio.purchase();applyPrimaryLoadout();hud();updateDeploymentTransfer();}return result;},
 onResume:resumeRun,onClose:()=>{if(active&&!ended)renderer.domElement.focus();},onLoad:queueLoad,onLoadCheckpoint:queueCheckpointLoad,
 onSave:slot=>{saveSlots.save(slot,captureSnapshot(),{name:operationTitle(),mission:runConfig.mission,difficulty:runConfig.difficulty,summary:`${$('#sector').textContent} · ${Math.ceil(player.hp)} HP · ${explorationPercent()}% mapped`});toast('OPERATION SAVED');},
 onExportBackup:async()=>{await campaignProfile.flushRewards();persistCampaignProfile();return saveSlots.exportBackup({profile:campaignProfile.serialize(),campaign:campaignProgress.serialize(),fieldSkill:fieldSkills.serialize(campaignProgress.completed()),settings:menu.settings,...(active?{checkpoint:{snapshot:captureSnapshot(),metadata:{name:'Session recovery',summary:operationTitle()}}}:{})});},onPreviewBackup:text=>saveSlots.previewBackup(text),onImportBackup:id=>{const result=saveSlots.importBackup(id);finishBackupImport();return result;},
 onSettings:applySettings
});
grenadeActions=createGrenadeActions({scene,getChargeDuration:()=>skillEffects().grenadeChargeMultiplier,onImpact:detonateGrenade,onPose:({charging,phase,power})=>{playerMesh.userData.grenadeCharging=charging;playerMesh.userData.throwPhase=phase;const button=$('#use-grenade');button.classList.toggle('charging-grenade',charging);button.style.setProperty('--throw-power',String(power));button.title=charging?`Throw power ${Math.round(power*100)}% · release to throw`:'Hold to set throw power; release to throw';}});
tutorial=createOnboarding({storage:browserStorage(),host:$('#tutorial'),getBindings:bindings});
applySettings(menu.settings);observeHudLayout($('.player-status'));
let pending=null;try{const value=compatibleStorage(sessionStorage).getItem('nulldelve.pendingLoad');compatibleStorage(sessionStorage).removeItem('nulldelve.pendingLoad');if(value)pending=JSON.parse(value);}catch{}
if(pending){if(restoreSnapshot(pending))startOperation(false);else toast('SAVE COULD NOT BE RESTORED');}
else if(params.get('play')==='1'&&(!runConfig.operation||campaignProgress.isUnlocked(runConfig.operation))){
 if(runConfig.mission==='campaign'&&runConfig.operation){deployCampaignOperation(runConfig.operation,{player,puzzle,progression,doors});progression.state.logs=campaignProgress.researchLogs();progression.state.artifacts=campaignProgress.artifacts();for(const device of progression.state.devices)if(device.kind==='log')device.active=progression.state.logs.includes(device.id);else if(device.kind==='artifact')device.active=progression.state.artifacts.includes(device.id);for(const e of enemies)if(runConfig.operation!=='breach'||e.z>16||e.x>29){e.hp=0;e.mesh.visible=false;}for(const z of progression.state.zones)if(z.status==='cleared')rewardedZones.add(z.id);focus.x=player.x;focus.z=player.z;updatePuzzleArt();refreshGuidance(true);}
 if(runConfig.mission!=='campaign'){progression.startMission(runConfig.mission,player);for(const z of progression.state.zones)if(z.status==='cleared')rewardedZones.add(z.id);focus.x=player.x;focus.z=player.z;for(const e of enemies){e.hp=0;e.mesh.visible=false;}$('#objective').textContent=runConfig.mission==='siege'?'Survive the reactor horde':'Destroy the nest horde';}
 startOperation();updateFog();
}else if(params.get('play')==='1'&&runConfig.operation){menu.show('campaign-map');toast('FINISH THE PREVIOUS OPERATION TO UNLOCK THIS LOCATION');}

function explorationPercent(){let count=0;for(const id of explored)if(map[Math.floor(id/W)]?.[id%W]===0)count++;return Math.round(count/totalFloor*100);}
function queueCheckpoint(reason){checkpointPending=reason;}
function commitCheckpoint(){
 if(typeof grenadeActions!=='undefined'&&grenadeActions?.isBusy())return;
 if(!checkpointPending||!canCheckpoint({active,ended,player,enemies,zones:progression.state.zones}))return;
 if(Date.now()<(commitCheckpoint.retryAt??0))return;const reason=checkpointPending;checkpointPending=null;
 try{persistCampaignProfile();saveSlots.saveCheckpoint(captureSnapshot(),{name:reason,mission:runConfig.mission,difficulty:runConfig.difficulty,summary:`${$('#sector').textContent} · ${Math.ceil(player.hp)} HP · ${explorationPercent()}% mapped`});commitCheckpoint.retryAt=0;commitCheckpoint.failureNotified=false;lastCheckpointTime=progression.state.elapsed;$('#checkpoint-note').textContent='CHECKPOINT SAVED';clearTimeout(commitCheckpoint.timer);commitCheckpoint.timer=setTimeout(()=>$('#checkpoint-note').textContent='',3000);}catch{checkpointPending=reason;commitCheckpoint.retryAt=Date.now()+5000;if(!commitCheckpoint.failureNotified){toast('CHECKPOINT COULD NOT BE SAVED · RETRYING');commitCheckpoint.failureNotified=true;}}
}
function queueCheckpointLoad(){const snapshot=saveSlots.loadCheckpoint();if(!validateSnapshot(snapshot,{barrelIds:barrelSystem.state.map(b=>b.id)}))return false;try{compatibleStorage(sessionStorage).setItem('nulldelve.pendingLoad',JSON.stringify(snapshot));}catch{return false;}location.href=location.pathname+'?play=load';return true;}

function useMedkit(){
 if(player.hp>=player.maxHp){toast('HEALTH IS ALREADY FULL');return;}
 if(!economy.consume('medkit')){toast('NO MEDKITS · RESTOCK AT BASE');return;}
 const healed=Math.min(skillEffects().medkitHealing,player.maxHp-player.hp);operationStats.medkits++;persistCampaignProfile();player.hp+=healed;audio.pickup();hud();toast(`MEDKIT USED · +${Number(healed.toFixed(2))} HEALTH`);
}
function throwGrenade(power=.15){
 if(grenadeActions?.isAnimating()||reload>0)return;
 const fire=economy.state.grenadeType==='fire';if(!economy.consume(fire?'fireGrenade':'grenade')){
  const other=fire?'grenade':'fireGrenade';if(economy.state.items[other]>0){economy.state.grenadeType=fire?'frag':'fire';persistCampaignProfile();hud();toast(`GRENADE READY · ${fire?'FRAG':'FIRE'} SELECTED · USE AGAIN TO THROW`);return;}
  toast('NO GRENADES · RESTOCK AT BASE');return;
 }
 operationStats.grenades++;persistCampaignProfile();grenadeActions.launch(player,aim,power,fire,solid);hud();
}
function detonateGrenade(x,z,fire){
 if(ended)return;const radius=3*skillEffects().grenadeRadiusMultiplier;if(!fire)barrelSystem.explodeNear(x,z,radius);if(ended)return;if(fire){fireZones.burst(x,z,skillEffects().grenadeRadiusMultiplier);}else{audio.explosion();if(!menu?.settings.reducedEffects){explosions.burst(x,z,radius);combatEffects.impact(x,z);}}
 if(Math.hypot(player.x-x,player.z-z)<=radius&&los(x,z,player.x,player.z)){applyPlayerDamage(fire?8:25);hud();if(player.hp<=0){end(false);return;}}
 for(const enemy of enemies){if(enemy.hp<=0||(enemy.spawnDelay??0)>0||Math.hypot(enemy.x-x,enemy.z-z)>radius+(enemy.radius??.32)||!los(x,z,enemy.x,enemy.z))continue;enemy.alerted=true;enemy.hp=Math.max(0,enemy.hp-(fire?2:8));if(enemy.hp===0){rewardEnemyKill(enemy);enemy.mesh.visible=false;}updateEnemyHealthBar(enemy);}hud();
}
function beginGrenadeCharge(){if(reload>0||grenadeActions?.isAnimating())return;const type=economy.state.grenadeType==='fire'?'fireGrenade':'grenade';if(!economy.state.items[type]){throwGrenade();return;}grenadeActions.begin();}
function releaseGrenadeCharge(){if(!grenadeActions?.charging)return;const power=grenadeActions.power;grenadeActions.cancel();throwGrenade(power);}
function cancelGrenadeCharge(){grenadeActions?.cancel();}

function cycleGrenade(){economy.state.grenadeType=economy.state.grenadeType==='fire'?'frag':'fire';persistCampaignProfile();hud();}

function removeSpawnCue(enemy){if(!enemy.spawnCue)return;scene.remove(enemy.spawnCue);enemy.spawnCue.geometry.dispose();enemy.spawnCue.material.dispose();enemy.spawnCue=null;}
function currentGuidance(){return campaignOperationGuidance(runConfig.operation,{player,puzzle,progression})??missionGuidance({mission:runConfig.mission,player,puzzle,progression:progression.state});}
function refreshGuidance(force=false){const g=currentGuidance(),key=g.title+'|'+g.hint;if(force||key!==guidanceKey){guidanceKey=key;$('#objective').textContent=g.title;$('#hint').textContent=g.hint;$('#intel').textContent=player.intel?'◆ INTEL SECURED':'◇ INTEL NOT RECOVERED';$('#intel').hidden=runConfig.mission==='campaign'&&runConfig.operation&&runConfig.operation!=='nest';}}
function refreshHelp(){
 const b=bindings(),help=$('#controls-help');$('#toggle-map').textContent=(mapOpen?'CLOSE MAP  ':'EXPAND  ')+formatKey(b.map);$('#help-button').setAttribute('aria-label','Controls help, '+formatKey(b.help));if(!help)return;help.setAttribute('tabindex','-1');help.setAttribute('role','region');help.setAttribute('aria-label','Controls help; play is paused');help.replaceChildren();const heading=document.createElement('strong');heading.textContent='CONTROLS · GAME PAUSED';help.append(heading);
 const rows=[[`${formatKey(b.moveUp)} ${formatKey(b.moveLeft)} ${formatKey(b.moveDown)} ${formatKey(b.moveRight)}`,'Move'],[['aimUp','aimLeft','aimDown','aimRight'].map(k=>formatKey(b[k])).join(' / '),'Aim (or mouse)'],['CLICK / '+formatKey(b.fire),'Fire'],[formatKey(b.knife),'Knife'],[formatKey(b.interact),'Interact / hold to drag crate'],[formatKey(b.reload),'Reload'],[formatKey(b.sprint),'Sprint'],[formatKey(b.rifle)+' / '+formatKey(b.pistol),'Weapons'],[formatKey(b.medkit),'Medkit'],[formatKey(b.grenade),'Hold / release grenade'],[formatKey(b.cycleGrenade),'Switch frag / fire'],[formatKey(b.map),'Full map'],[formatKey(b.resetPuzzle),'Reset crates'],[formatKey(b.help),'Close help']];
 if(touchControls?.enabled){const text=document.createElement('p');text.textContent='Left stick: move; push its edge to sprint. Right stick: aim and fire. Hold the grenade icon for range, release to throw. Hold Interact beside a crate and move to drag it. Release to let go. Tap other action icons to reload, swap, or strike.';help.append(text);if(!puzzle.solved){const reset=document.createElement('button');reset.type='button';reset.textContent='Reset crates';reset.onclick=()=>{resetPressurePuzzle(puzzle,player);updatePuzzleArt();updateFog();toggleHelp();};help.append(reset);}}else for(const [key,label] of rows){const span=document.createElement('span'),kbd=document.createElement('kbd');kbd.textContent=key;span.append(kbd,document.createTextNode(' '+label));help.append(span);}
 const hintContext={player,puzzle,progression};const hintInfo=puzzleHints.get(hintContext);if(hintInfo.available){const hintText=document.createElement('p');hintText.className='puzzle-hint-text';hintText.hidden=true;const request=document.createElement('button');request.type='button';request.className='puzzle-hint-button';request.textContent='Puzzle hint';request.onclick=()=>{const hint=puzzleHints.request(hintContext);hintText.textContent=hint.text;hintText.hidden=false;request.textContent=hint.stage===2?'Show hint again':'More help';};help.append(request,hintText);}
 {const replay=document.createElement('button');replay.type='button';replay.textContent='Replay training';replay.onclick=()=>{tutorial?.start(player,{force:true,touch:!!touchControls?.enabled});toggleHelp();};help.append(replay);}
 const close=document.createElement('button');close.type='button';close.textContent='Back to game';close.onclick=toggleHelp;help.append(close);
}
refreshGuidance(true);

function rewardEnemyKill(enemy){if(ended||enemy.lootDropped)return;operationStats.kills++;campaignProfile.queueEnemyReward(enemy.rewardIdentity??`kill.static.${Math.max(0,(Number(enemy.id?.slice(1))||1)-1)}`,enemy.variant).then(()=>hud()).catch(()=>{});const drops=dropEnemyLoot(loot,enemy,{player,weapons,difficulty:runConfig.difficulty,selected,reachable:los});placeLootDrops(loot,drops,enemy,{solid,lineOfSight:los});scene.remove(enemy.mesh);if(enemy.healthBar)scene.remove(enemy.healthBar.group);enemy.mesh=new THREE.Group();enemy.mesh.visible=false;persistCampaignProfile();hud();}

function knifeStrike(){
 if(meleeCooldown>0)return;meleeCooldown=.55;
 const dx=-Math.sin(player.angle),dz=-Math.cos(player.angle);trace(player.x+dx*.3,player.z+dz*.3,player.x+dx*1.5,player.z+dz*1.5,0xe4e8d5);
 let hit=false;for(const enemy of meleeTargets(player,aim,enemies,los)){hit=true;enemy.hp=Math.max(0,enemy.hp-Math.max(1,Math.min(2,Number(skillEffects().meleeDamage)||1)));enemy.alerted=true;applyEnemyStagger(enemy,.25);if(enemy.hp===0){rewardEnemyKill(enemy);enemy.mesh.visible=false;}updateEnemyHealthBar(enemy);}
 if(hit)audio.melee();hud();
}


attachGraphicsRecovery({canvas:renderer.domElement,pause:()=>{pauseRun();menu?.hide();touchControls?.reset();active=false;ended=true;paused=true;shooting=false;keys.clear();audio.setPaused(true);renderer.setAnimationLoop(null);},showRecovery:({restored})=>{const snapshot=saveSlots.loadCheckpoint(),hasCheckpoint=!!snapshot&&validateSnapshot(snapshot,{barrelIds:barrelSystem.state.map(b=>b.id)});renderGraphicsRecovery({overlay:$('#overlay'),hasCheckpoint,restored,reload:saved=>{location.href=graphicsRecoveryUrl(location.pathname,saved);}});}});

function finishBackupImport(){active=false;paused=true;ended=false;checkpointPending=null;shooting=false;keys.clear();simulation.reset();audio.setPaused(true);tutorial?.hide();location.href=location.pathname;}

function updateDeploymentTransfer(){if(campaignProfile.isSessionOnly()||campaignProgress.isSessionOnly()||fieldSkills.isSessionOnly())history.replaceState(null,'',location.pathname+location.search+encodeDeploymentState({profile:campaignProfile.serialize(),progress:campaignProgress.serialize(),fieldSkill:fieldSkills.serialize(campaignProgress.completed())}));}
function persistCampaignProfile(){const ok=campaignProfile.persist();updateDeploymentTransfer();return ok;}
function deploymentUrl(config){persistCampaignProfile();campaignProgress.persist();return restartOperationUrl(location.pathname,config)+encodeDeploymentState({profile:campaignProfile.serialize(),progress:campaignProgress.serialize(),fieldSkill:fieldSkills.serialize(campaignProgress.completed())});}

// Recover durable reward journal entries interrupted by closing/reloading the page.
campaignProfile.recoverEnemyRewards().then(()=>hud()).catch(()=>{});
