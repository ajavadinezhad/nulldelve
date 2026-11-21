/** Persistent drops and finite ammunition, independent of rendering. */
export const RESERVE_LIMITS={rifle:300,pistol:150};
const MAX_PICKUP_ID=Number.MAX_SAFE_INTEGER-1;
function allocatePickupId(state,used=new Set(state.drops.map(drop=>drop.id))){
 let sequence=Number.isSafeInteger(state.nextId)&&state.nextId>0&&state.nextId<=MAX_PICKUP_ID?state.nextId:1;
 while(used.has('drop'+sequence))sequence=sequence>=MAX_PICKUP_ID?1:sequence+1;
 state.nextId=sequence>=MAX_PICKUP_ID?1:sequence+1;return 'drop'+sequence;
}
export function createLootState(saved){
 const state={drops:[],nextId:1,kills:0};
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
 }
 return state;
}
export function dropEnemyLoot(state,enemy,{player,weapons,selected}={}){
 if(enemy.lootDropped)return [];enemy.lootDropped=true;state.kills++;
 const big=enemy.variant==='brute',boss=enemy.variant==='boss';
 // Count nearby uncollected supplies in the aid budget: ignoring drops must not
 // create an unlimited pile, while supplies left in older rooms do not block aid.
 const nearby=player?state.drops.filter(d=>Math.hypot(d.x-player.x,d.z-player.z)<=8):[];
 const held=selected??player?.selected;
 const supply=gun=>Math.max(0,Number(weapons?.[gun]?.reserve)||0)+Math.max(0,Number(held===gun?player?.ammo:weapons?.[gun]?.ammo)||0)+nearby.reduce((n,d)=>n+(d.kind==='ammo'?Math.max(0,Number(d[gun])||0):0),0);
 const lowAmmo=!!weapons&&supply('rifle')<18&&supply('pistol')<8;
 const added=[];
 if(big||boss||state.kills%3===0||lowAmmo){
  const baseRifle=boss?12:big?6:lowAmmo?2:3,rifle=weapons?.rifle?.pellets>1?Math.max(1,Math.round(baseRifle/3)):baseRifle,pistol=boss?4:big?2:1;
  added.push({id:allocatePickupId(state),kind:'ammo',x:enemy.x+.24,z:enemy.z+.12,rifle,pistol,amount:0});
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
