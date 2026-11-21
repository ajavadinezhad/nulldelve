import {WORLD_WIDTH,WORLD_HEIGHT,WORLD_DOOR_COUNT,LEGACY_WIDTH,LEGACY_HEIGHT,LEGACY_DOOR_COUNT} from './world-layout.js?v=audit-r21';
import {validateBarrelSnapshot} from './explosive-barrels.js?v=audit-r21';
import {PRIMARY_WEAPONS} from './arsenal.js?v=audit-r21';
import {normalizeCampaignOperation} from './campaign-operations.js?v=audit-r21';
import {createProgression} from './progression.js?v=audit-r21';
const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const finite=(value,min=-Infinity,max=Infinity)=>Number.isFinite(value)&&value>=min&&value<=max;
const variants=new Set(['normal','runner','brute','charger','sentinel','screecher','leaper','boss']);
/** Validate on a detached world before the live session is touched. */
export function validateSnapshot(data,{width,height,doorCount,crateCount=2,plateCount=2,barrelIds}={}){
 try{
  if(!object(data)||data.version!==3||!Array.isArray(data.world)||data.world.length!==2)return false;
  const legacy=data.world[0]===LEGACY_WIDTH&&data.world[1]===LEGACY_HEIGHT,current=data.world[0]===WORLD_WIDTH&&data.world[1]===WORLD_HEIGHT;
  if(!legacy&&!current)return false;
  width??=legacy?LEGACY_WIDTH:WORLD_WIDTH;height??=legacy?LEGACY_HEIGHT:WORLD_HEIGHT;doorCount??=legacy?LEGACY_DOOR_COUNT:WORLD_DOOR_COUNT;
  if(data.world[0]!==width||data.world[1]!==height)return false;
  if(legacy&&data.config?.operation==='hospital')return false;
  if(!object(data.config)||!['campaign','siege','nest'].includes(data.config.mission)||!['easy','normal','hard'].includes(data.config.difficulty))return false;
  if(data.config.remix!==undefined&&typeof data.config.remix!=='boolean')return false;
  if(!validateBarrelSnapshot(data.barrels,barrelIds))return false;
  if(data.doorHints!==undefined&&(!Array.isArray(data.doorHints)||data.doorHints.length>200||!data.doorHints.every(id=>typeof id==='string'&&id.length<500)))return false;
  if(data.fireZones!==undefined){const f=data.fireZones;if(!object(f)||f.version!==1||!finite(f.phase,0,.6)||!Number.isInteger(f.nextId)||f.nextId<1||!Array.isArray(f.zones)||f.zones.length>100||new Set(f.zones.map(z=>z?.id)).size!==f.zones.length||!f.zones.every(z=>object(z)&&Number.isInteger(z.id)&&z.id>0&&z.id<f.nextId&&finite(z.x,0,width)&&finite(z.z,0,height)&&finite(z.remaining,0,5.5)&&(z.radius===undefined||finite(z.radius,2.6,2.99))))return false;}
  if(data.config.operation!=null&&!normalizeCampaignOperation(data.config.operation))return false;
  if(data.profileRevision!==undefined&&(!Number.isSafeInteger(data.profileRevision)||data.profileRevision<0))return false;
  if(data.loadout!==undefined&&(!object(data.loadout)||!PRIMARY_WEAPONS.some(w=>w.id===data.loadout.primary)||!Array.isArray(data.loadout.unlocked)||!data.loadout.unlocked.every(id=>PRIMARY_WEAPONS.some(w=>w.id===id))))return false;
  const p=data.player;if(!object(p)||!finite(p.x,1,width-1-Number.EPSILON)||!finite(p.z,1,height-1-Number.EPSILON)||p.x>=width-1||p.z>=height-1||!finite(p.hp,0,10000)||!finite(p.maxHp,1,10000)||p.hp>p.maxHp||!finite(p.ammo,0,1000)||!finite(p.angle)||typeof p.intel!=='boolean')return false;
  if(!['rifle','pistol'].includes(data.selected)||!object(data.magazines)||!['rifle','pistol'].every(k=>finite(data.magazines[k],0,1000))||!finite(data.reload,0,60))return false;
  if(!Array.isArray(data.enemies)||data.enemies.length>5000)return false;
  // Early version-3 saves predate health bars and omit maxHp; match restore's fallback.
  const legacyHp={normal:2,runner:1,brute:6,charger:8,sentinel:14,screecher:10,leaper:7,boss:24},hpScale={easy:.8,normal:1,hard:1.5}[data.config.difficulty];
  const ids=new Set();for(const e of data.enemies){const maxHp=e?.maxHp??Math.ceil(legacyHp[e?.variant]*hpScale);if(!object(e)||typeof e.id!=='string'||ids.has(e.id)||!variants.has(e.variant)||!finite(e.x,0,width)||!finite(e.z,0,height)||!finite(e.hp,0,10000)||!finite(maxHp,1,10000)||e.hp>maxHp||!finite(e.cooldown,0,1000))return false;ids.add(e.id);if(e.shriekCooldown!==undefined&&!finite(e.shriekCooldown,0,6))return false;if(e.leapCooldown!==undefined&&!finite(e.leapCooldown,0,4.8))return false;if(e.chargeCooldown!==undefined&&!finite(e.chargeCooldown,0,4.5))return false;for(const key of ['spawnDelay','attackWindup','staggerTime'])if(e[key]!==undefined&&!finite(e[key],0,1000))return false;}
  if(!Array.isArray(data.doors)||data.doors.length!==doorCount||!data.doors.every(d=>object(d)&&typeof d.open==='boolean'&&typeof d.unlocked==='boolean'&&finite(d.slide,0,1)))return false;
  const puzzle=data.puzzle;if(!object(puzzle)||typeof puzzle.solved!=='boolean'||!Array.isArray(puzzle.crates)||puzzle.crates.length!==crateCount||!puzzle.crates.every(c=>object(c)&&finite(c.x,0,width)&&finite(c.z,0,height)&&typeof c.seated==='boolean')||!Array.isArray(puzzle.plates)||puzzle.plates.length!==plateCount||!puzzle.plates.every(p=>object(p)&&typeof p.active==='boolean'))return false;
  if(!Array.isArray(data.explored)||data.explored.length>width*height||!data.explored.every(id=>Number.isInteger(id)&&id>=0&&id<width*height))return false;
  for(const key of ['seenRooms','rewardedZones'])if(data[key]!==undefined&&(!Array.isArray(data[key])||data[key].length>1000||!data[key].every(s=>typeof s==='string'&&s.length<200)))return false;
  if(data.reserves!==undefined&&(!object(data.reserves)||!finite(data.reserves.rifle,0,300)||!finite(data.reserves.pistol,0,150)))return false;
  if(data.loot!==undefined){if(!object(data.loot)||!Array.isArray(data.loot.drops)||data.loot.drops.length>10000)return false;for(const d of data.loot.drops)if(!object(d)||!['ammo','health'].includes(d.kind)||!finite(d.x,0,width)||!finite(d.z,0,height)||!['amount','rifle','pistol'].every(k=>finite(d[k],0,10000)))return false;}
  // The progression module remains the source of truth for puzzle/wave versions.
  const shadow=createProgression({doors:Array.from({length:doorCount},()=>({})),enemies:[],spawnEnemy:()=>null});
  return shadow.restoreState(data.progression,new Map(data.enemies.map(e=>[e.id,{...e}])) )===true;
 }catch{return false;}
}
