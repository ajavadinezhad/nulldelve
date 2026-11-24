import {ROACH_VARIANTS} from './roach.js?v=operator-profile-r58';
import {projectileDamage} from './weapon-tuning.js?v=operator-profile-r58';
import {DIFFICULTY_RULES} from './difficulty.js?v=operator-profile-r58';
/** Persistent drops and finite ammunition, independent of rendering. */
export const RESERVE_LIMITS={rifle:300,pistol:150};
const MAX_PICKUP_ID=Number.MAX_SAFE_INTEGER-1;
function allocatePickupId(state,used=new Set(state.drops.map(drop=>drop.id))){
 let sequence=Number.isSafeInteger(state.nextId)&&state.nextId>0&&state.nextId<=MAX_PICKUP_ID?state.nextId:1;
 while(used.has('drop'+sequence))sequence=sequence>=MAX_PICKUP_ID?1:sequence+1;
 state.nextId=sequence>=MAX_PICKUP_ID?1:sequence+1;return 'drop'+sequence;
}
export function createLootState(saved){
 const state={drops:[],nextId:1,kills:0,supplyBudget:0};
 if(saved&&Array.isArray(saved.drops)){
  const used=new Set(),budget=value=>Number.isFinite(value)?Math.max(0,Math.min(10000,value)):0;
  // Older imports can omit nextId. Recover the sequence from existing IDs before
  // allocating another pickup, otherwise two supplies share one rendered mesh.
  for(const drop of saved.drops){const match=/^drop(\d+)$/.exec(String(drop?.id??''));if(match){const number=Number(match[1]);if(Number.isSafeInteger(number)&&number<MAX_PICKUP_ID)state.nextId=Math.max(state.nextId,number+1);}}
  if(Number.isSafeInteger(saved.nextId)&&saved.nextId>0&&saved.nextId<=MAX_PICKUP_ID)state.nextId=Math.max(state.nextId,saved.nextId);
  for(const d of saved.drops){
   if(!d||!Number.isFinite(d.x)||!Number.isFinite(d.z)||!['health','ammo'].includes(d.kind))continue;
   let id=typeof d.id==='string'&&d.id.length>0?d.id:null;
   if(!id||used.has(id))id=allocatePickupId(state,used);used.add(id);
   state.drops.push({id,...(d.compact?{compact:true}:{}),kind:d.kind,x:d.x,z:d.z,amount:budget(d.amount),rifle:budget(d.rifle),pistol:budget(d.pistol)});
  }
  state.kills=Number.isSafeInteger(saved.kills)?Math.max(0,saved.kills):0;
  state.supplyBudget=Number.isFinite(saved.supplyBudget)?Math.max(0,Math.min(1000,saved.supplyBudget)):0;
 }
 return state;
}
export function dropEnemyLoot(state,enemy,{player,weapons,selected,difficulty='normal',reachable=()=>true}={}){
 if(enemy.lootDropped)return [];enemy.lootDropped=true;state.kills++;
 const big=['brute','charger','sentinel','screecher','leaper','spitter','mender'].includes(enemy.variant),boss=enemy.variant==='boss';
 // Count nearby uncollected supplies in the aid budget: ignoring drops must not
 // create an unlimited pile, while supplies behind closed geometry or left in
 // older rooms do not block aid the player can actually collect.
 const nearby=player?state.drops.filter(d=>Math.hypot(d.x-player.x,d.z-player.z)<=8&&reachable(player.x,player.z,d.x,d.z)):[];
 const held=selected??player?.selected;
 const supply=gun=>Math.max(0,Number(weapons?.[gun]?.reserve)||0)+Math.max(0,Number(held===gun?player?.ammo:weapons?.[gun]?.ammo)||0)+nearby.reduce((n,d)=>n+(d.kind==='ammo'?Math.max(0,Number(d[gun])||0):0),0);
 const primaryPellets=Math.max(1,Number(weapons?.rifle?.pellets)||1);
 const baseValue=Math.max(1,Number(weapons?.rifle?.baseDamage)||1)*primaryPellets;
 const baseHp=({normal:2,runner:1,brute:6,charger:8,sentinel:14,screecher:10,leaper:7,spitter:6,mender:8,boss:24})[enemy.variant]??2;
 const actualHealth=Number(enemy.maxHp),healthBudget=Math.max(1,Math.min(10000,Number.isFinite(actualHealth)&&actualHealth>0?actualHealth:Math.ceil(baseHp*(DIFFICULTY_RULES[difficulty]?.hp??1))));
 // Credit 70% of the unupgraded centered-shot cost at a fixed 3m reference.
 // This accounts for real pellet spread, shell armor and unavoidable overkill,
 // never the player's misses, aim position or purchased damage. Inventory caps delivery:
 // min(capacity, existing supply + earned supply), never a low-ammo windfall.
 const baseline={...weapons?.rifle,damage:Math.max(1,Number(weapons?.rifle?.baseDamage)||1)},radius=ROACH_VARIANTS[enemy.variant]?.radius??.32,spread=Math.max(0,Math.min(.8,Number(baseline.spread)||0));
 const centerHits=primaryPellets===1?1:Array.from({length:primaryPellets},(_,i)=>Math.abs(Math.sin((i/(primaryPellets-1)-.5)*spread)*3)<=radius+.12).filter(Boolean).length;
 const shotDamage=projectileDamage(baseline,{variant:enemy.variant,x:0,z:0},{x:3,z:0},baseline.damage)*Math.max(1,centerHits),baselineRounds=Math.ceil(healthBudget/Math.max(.1,shotDamage));
 state.supplyBudget=Math.min(1000,(Number.isFinite(state.supplyBudget)?state.supplyBudget:0)+baselineRounds*baseValue*.7);
 const added=[];
 if(big||boss||state.kills%3===0){
  const earned=Math.max(0,Math.floor((state.supplyBudget+1e-9)/baseValue));
  state.supplyBudget=Math.max(0,state.supplyBudget-earned*baseValue);
  const primaryCap=Math.min(RESERVE_LIMITS.rifle,Math.max((weapons?.rifle?.capacity??30)*2,Math.ceil(60/baseValue))),pistolCap=36;
  const rifle=Math.min(earned,Math.max(0,primaryCap-supply('rifle'))),pistol=Math.min(boss?6:big?3:3,Math.max(0,pistolCap-supply('pistol')));
  if(rifle>0||pistol>0)added.push({id:allocatePickupId(state),kind:'ammo',x:enemy.x+.24,z:enemy.z+.12,rifle,pistol,amount:0});
 }
 const hp=Math.max(0,Number(player?.hp)||0),maxHp=Math.max(0,Number(player?.maxHp)||0);
 const pendingHealth=nearby.reduce((n,d)=>n+(d.kind==='health'?d.amount:0),0),effectiveHp=hp+pendingHealth;
 const injured=hp>0&&maxHp>0&&effectiveHp<maxHp;
 const regularHealth=effectiveHp<maxHp*.6&&state.kills%(effectiveHp<maxHp*.25?4:10)===0;
 if(injured&&(big||boss||regularHealth)){
  const amount=boss?18:big?8:6;
  added.push({id:allocatePickupId(state),kind:'health',x:enemy.x-.26,z:enemy.z-.16,amount,rifle:0,pistol:0});
 }
 state.drops.push(...added);return added;
}
export function collectNearbyLoot(state,player,weapons,reachable=()=>true){
 const gains={health:0,rifle:0,pistol:0};
 for(let i=state.drops.length-1;i>=0;i--){const d=state.drops[i];if(Math.hypot(player.x-d.x,player.z-d.z)>1.15||!reachable(player.x,player.z,d.x,d.z))continue;
  if(d.kind==='health'){const gain=Math.min(d.amount,Math.max(0,player.maxHp-player.hp));player.hp+=gain;d.amount-=gain;gains.health+=gain;}
  else for(const gun of ['rifle','pistol']){const weapon=weapons[gun];if(!weapon)continue;const current=Math.max(0,Number(weapon.reserve)||0),gain=Math.min(d[gun],Math.max(0,RESERVE_LIMITS[gun]-current));weapon.reserve=current+gain;d[gun]-=gain;gains[gun]+=gain;}
  if(d.kind==='health'?d.amount<=0:d.rifle<=0&&d.pistol<=0)state.drops.splice(i,1);
 }
 return gains;
}
export function refillMagazine(weapon,current){const needed=Math.max(0,weapon.capacity-current),moved=Math.min(needed,Math.max(0,Number(weapon.reserve)||0));weapon.reserve=Math.max(0,(Number(weapon.reserve)||0)-moved);return current+moved;}
