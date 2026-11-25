import {effectiveFieldStats} from './field-skills.js?v=mandatory-google-r61';
import {cashReward} from './mission-salvage.js?v=mandatory-google-r61';
import {attachmentOptions,applyWeaponAttachment} from './weapon-attachments.js?v=mandatory-google-r61';
import {compatibleStorage} from './storage-compat.js?v=mandatory-google-r61';
import {PRIMARY_WEAPONS} from './arsenal.js?v=mandatory-google-r61';
import {createEconomy,isEnemyRewardVariant} from './economy.js?v=mandatory-google-r61';
export const CAMPAIGN_PROFILE_KEY='nulldelve.profile.v1';
const PENDING_PREFIX='nulldelve.enemy-reward.pending.';
const CASH_PENDING_PREFIX='nulldelve.cash-reward.pending.';
const LOCK_KEY=CAMPAIGN_PROFILE_KEY+'.lease';
const ids=()=>PRIMARY_WEAPONS.map(weapon=>weapon.id);
const revision=value=>Number.isSafeInteger(value)&&value>=0?value:0;
const initial=()=>({version:1,revision:0,purchaseRevision:0,economy:createEconomy().serialize(),primary:'carbine',unlocked:['carbine']});
export function normalizeCampaignProfile(value){
 if(!value||value.version!==1||!value.economy||typeof value.economy!=='object'||Array.isArray(value.economy)||!Array.isArray(value.unlocked)||typeof value.primary!=='string')return null;
 const unlocked=['carbine',...ids().filter(id=>id!=='carbine'&&value.unlocked.includes(id))];
 return {version:1,revision:revision(value.revision),purchaseRevision:Math.min(revision(value.revision),revision(value.purchaseRevision??value.revision)),economy:createEconomy(value.economy).serialize(),primary:unlocked.includes(value.primary)?value.primary:'carbine',unlocked};
}
/** One shared economy; shop mutations synchronize before charging and reject conflicts. */
export function createCampaignProfile({storage,economy=createEconomy(),locks=globalThis.navigator?.locks,getCompleted=()=>[]}={}){
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}const journalStorage=storage;storage=compatibleStorage(storage);
 const state={primary:'carbine',unlocked:['carbine'],revision:0,purchaseRevision:0};
 let observedRaw=null,sessionOnly=false,leaseToken=null,lastFailure=null;
 const token=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
 function serialize(){return normalizeCampaignProfile({version:1,revision:state.revision,purchaseRevision:state.purchaseRevision,economy:economy.serialize(),primary:state.primary,unlocked:state.unlocked});}
 function apply(saved){state.revision=saved.revision;state.purchaseRevision=saved.purchaseRevision;economy.restore(saved.economy);state.primary=saved.primary;state.unlocked=[...saved.unlocked];}
 function read(){try{const raw=storage?.getItem(CAMPAIGN_PROFILE_KEY)??null;return {raw,saved:normalizeCampaignProfile(JSON.parse(raw||'null')),available:!!storage};}catch{return {raw:null,saved:null,available:false};}}
 function reload({force=false}={}){if(sessionOnly&&!force)return false;const latest=read();observedRaw=latest.raw;if(latest.saved){apply(latest.saved);sessionOnly=false;return true;}return false;}
 function activeLease(){try{const value=JSON.parse(storage?.getItem(LOCK_KEY)||'null');return value&&value.expires>Date.now()?value:null;}catch{return null;}}
 function persist(){
  lastFailure=null;const saved=serialize(),raw=JSON.stringify(saved),latest=read(),lease=activeLease();
  if(lease&&lease.token!==leaseToken){lastFailure='conflict';return false;}
  if(latest.available&&latest.raw!==observedRaw){
   observedRaw=latest.raw;if(latest.saved)apply(latest.saved);lastFailure='conflict';return false;
  }
  // A quota failure keeps the current run in memory, never silently replacing it
  // with the older profile still readable from browser storage.
  if(sessionOnly&&latest.saved&&latest.saved.revision>state.revision){apply(latest.saved);observedRaw=latest.raw;sessionOnly=false;lastFailure='conflict';return false;}
  try{
   if(!storage||typeof storage.setItem!=='function')throw new Error('Unavailable');
   storage.setItem(CAMPAIGN_PROFILE_KEY,raw);
   if(storage.getItem(CAMPAIGN_PROFILE_KEY)!==raw){const winner=read();observedRaw=winner.raw;if(winner.saved)apply(winner.saved);lastFailure='conflict';return false;}
   observedRaw=raw;sessionOnly=false;return true;
  }catch{sessionOnly=true;lastFailure='storage';return false;}
 }
 function markPurchase(){state.revision=Math.min(Number.MAX_SAFE_INTEGER,revision(state.revision)+1);state.purchaseRevision=state.revision;persist();return state.revision;}
 function beginReplayAttempt(operation){
  if(!(getCompleted()??[]).includes(operation))return {ok:false,message:'First-clear contract applies to this operation.'};
  // Do not supersede a legitimate completed replay whose durable payout is
  // still queued (for example while another tab briefly holds the lease).
  if([...pendingRewards.values()].some(entry=>cashReward(entry.id)?.token&&cashReward(entry.id).operation===operation))return {ok:false,message:'Your previous replay reward is still saving. Try again shortly.'};
  if(!beginMutation())return {ok:false,message:'Another tab is updating the armory. Try again.'};
  const before=serialize();return finishMutation(economy.beginReplayAttempt(operation,token()),before,true);
 }
 function weaponUnlocked(weapon){if(!weapon.unlockAfter)return true;const order=['breach','command','research','containment','nest','hospital','freight','signal'],done=getCompleted()??[];return order.slice(0,order.indexOf(weapon.unlockAfter)+1).every(id=>done.includes(id));}
 function getWeaponOffers(skill='none'){return PRIMARY_WEAPONS.map(weapon=>{const owned=state.unlocked.includes(weapon.id),unlocked=owned||weaponUnlocked(weapon),equipped=state.primary===weapon.id,attachment=economy.state.attachments[weapon.id]??'standard',stats=effectiveFieldStats(applyWeaponAttachment({...weapon,...economy.stats(weapon.id,{damage:weapon.baseDamage,capacity:weapon.capacity,interval:weapon.interval,reload:weapon.reload})},attachment),skill);return {id:'weapon.'+weapon.id,weaponId:weapon.id,kind:'weapon',label:weapon.name??weapon.label??weapon.id,description:weapon.description??'Primary weapon for your next deployment.',unlockAfter:weapon.unlockAfter??null,locked:!unlocked,cost:weapon.cost,stats:{damage:stats.damage,capacity:stats.capacity,interval:stats.interval,burstCount:stats.burstCount??1,burstInterval:stats.burstInterval??.075,pierce:stats.pierce??1,pierceMultiplier:stats.pierceMultiplier??.6,reload:stats.reload,unskilledReload:stats.unskilledReload,reloadMultiplier:stats.reloadMultiplier,pellets:stats.pellets,range:stats.range},attachment,attachmentOptions:attachmentOptions(weapon.id),owned,equipped,available:unlocked&&!equipped&&(owned||economy.state.credits>=weapon.cost)};});}
 function setAttachment(value){const [,weaponId,attachmentId,...extra]=String(value).split('.');if(extra.length||!state.unlocked.includes(weaponId)||state.primary!==weaponId)return {ok:false,message:'Equip an owned weapon before modifying it.'};const option=attachmentOptions(weaponId).find(option=>option.id===attachmentId);if(!option)return {ok:false,message:'That attachment is not available for this weapon.'};economy.state.attachments[weaponId]=attachmentId;return {ok:true,message:`${option.name} fitted.`};}
 function mutate(value,equipOnly=false){
  const id=String(value).replace(/^(weapon|equip)\./,''),weapon=PRIMARY_WEAPONS.find(item=>item.id===id);
  if(!weapon)return {ok:false,message:'That weapon is not available.'};
  if(!state.unlocked.includes(id)){
   if(!weaponUnlocked(weapon))return {ok:false,message:`Complete ${weapon.unlockAfter} to unlock ${weapon.name}.`};
   if(equipOnly)return {ok:false,message:'Purchase this weapon before equipping it.'};
   if(economy.state.credits<weapon.cost)return {ok:false,message:`Not enough cash. You need $${weapon.cost-economy.state.credits} more.`};
   economy.state.credits-=weapon.cost;state.unlocked.push(id);
  }
  state.primary=id;return {ok:true,message:`Equipped ${weapon.name??weapon.label??id}.`};
 }
 function beginMutation(){
  if(activeLease()?.token!==leaseToken&&activeLease())return false;
  if(!sessionOnly){const latest=read();if(latest.raw!==observedRaw&&latest.saved)apply(latest.saved);observedRaw=latest.raw;}
  return true;
 }
 function finishMutation(result,before,increment,purchase=false){
  if(!result.ok)return result;
  if(increment)state.revision=Math.min(Number.MAX_SAFE_INTEGER,revision(state.revision)+1);
  if(purchase)state.purchaseRevision=state.revision;
  const persisted=persist();
  if(!persisted&&lastFailure==='conflict'){
   const latest=read();if(latest.saved){apply(latest.saved);observedRaw=latest.raw;}else apply(before);
   return {ok:false,message:'The armory changed in another tab. Your purchase was not completed. Please try again.'};
  }
  return {...result,persisted,sessionOnly:!persisted,message:result.message+(!persisted?' Session only · Download a backup before closing.':'')};
 }
 // Compatibility entry points retain the caller-owned revision marker. The menu
 // uses purchaseOffer, which owns the entire synchronized transaction instead.
 function purchaseWeapon(value){if(!beginMutation())return {ok:false,message:'Another tab is updating the armory. Try again.'};const before=serialize();return finishMutation(mutate(value),before,false);}
 function equipPrimary(value){if(!beginMutation())return {ok:false,message:'Another tab is updating the armory. Try again.'};const before=serialize();return finishMutation(mutate(value,true),before,false);}
 async function acquireLease(){
  if(sessionOnly||!storage?.setItem)return true;
  const current=activeLease();if(current)return false;
  const candidate=token();try{storage.setItem(LOCK_KEY,JSON.stringify({token:candidate,expires:Date.now()+3000}));}catch{sessionOnly=true;return true;}
  // Fallback browsers without Web Locks resolve simultaneous claims before charging.
  await new Promise(resolve=>setTimeout(resolve,0));
  if(activeLease()?.token!==candidate)return false;leaseToken=candidate;return true;
 }
 function releaseLease(){try{if(leaseToken&&activeLease()?.token===leaseToken)storage.removeItem(LOCK_KEY);}catch{}leaseToken=null;}
 async function purchaseOffer(id){
  const transaction=async()=>{
   if(!await acquireLease())return {ok:false,message:'Another tab is updating the armory. Try again.'};
   try{
    if(!beginMutation())return {ok:false,message:'Another tab is updating the armory. Try again.'};
    const before=serialize();let result;
    if(String(id).startsWith('weapon.'))result=mutate(id);
    else if(String(id).startsWith('equip.'))result=mutate(id,true);
    else if(String(id).startsWith('enemy.')){const parts=String(id).slice(6).split('.'),variant=parts.pop();result=economy.claimEnemyReward(parts.join('.'),variant);}
    else if(String(id).startsWith('reward.'))result=economy.claimReward(String(id).slice(7));
    else if(String(id).startsWith('attachment.'))result=setAttachment(id);
    else {
     const upgrade=String(id).match(/^(carbine|rifle|smg|shotgun|marksman|lmg|hush|scattergun|kestrel|mantis|jackal|vesper|lancet|orison|pistol)\.(damage|magazine|reload)$/);
     const gun=upgrade?.[1]==='rifle'?'carbine':upgrade?.[1];
     if(upgrade&&gun!=='pistol'&&(!state.unlocked.includes(gun)||state.primary!==gun))result={ok:false,message:'Equip an owned weapon before upgrading it.'};
     else result=economy.purchase(id);
    }
    return finishMutation(result,before,true,!String(id).startsWith('enemy.')&&!String(id).startsWith('reward.'));
   }finally{releaseLease();}
  };
  if(!locks?.request)return transaction();
  let started=false;try{return await locks.request(CAMPAIGN_PROFILE_KEY,{mode:'exclusive'},()=>{started=true;return transaction();});}catch(error){if(started)throw error;return transaction();}
 }
 const pendingRewards=new Map();let rewardQueue=Promise.resolve();
 function queueReward(key,entry,offer){
  pendingRewards.set(key,entry);
  try{journalStorage?.setItem(key,JSON.stringify(entry));}catch{sessionOnly=true;}
  rewardQueue=rewardQueue.catch(()=>{}).then(async()=>{
   let result;for(let attempt=0;attempt<12;attempt++){
    result=await purchaseOffer(offer);
    if(result.ok||result.alreadyClaimed||result.expired)break;
    await new Promise(resolve=>setTimeout(resolve,25*(attempt+1)));
   }
   // An in-memory duplicate after a quota failure is not a durable payout.
   // Keep its journal until storage itself confirms the wallet and claim.
   if(result?.expired||(result?.ok||result?.alreadyClaimed)&&read().saved?.economy.claimedRewards[entry.id]===true){
    pendingRewards.delete(key);try{journalStorage?.removeItem(key);}catch{}
   }
   return result;
  });return rewardQueue;
 }
 function queueEnemyReward(id,variant){
  if(typeof id!=='string'||!/^kill\.[a-z][a-z0-9-]{0,39}\.(0|[1-9][0-9]{0,3})$/.test(id)||!isEnemyRewardVariant(variant))return Promise.resolve({ok:false,message:'Unknown enemy reward.'});
  const key=PENDING_PREFIX+id;
  // Preserve the original payout value through retries, changed mutation mixes
  // and legacy migration; a later duplicate must not replace the earned amount.
  try{const queued=pendingRewards.get(key)??JSON.parse(journalStorage?.getItem(key)||'null');if(queued?.id===id&&isEnemyRewardVariant(queued.variant))variant=queued.variant;}catch{}
  return queueReward(key,{id,variant},'enemy.'+id+'.'+variant);
 }
 function claimCashReward(id){
  if(!cashReward(id))return Promise.resolve({ok:false,message:'Unknown cash reward.'});
  return queueReward(CASH_PENDING_PREFIX+id,{id},'reward.'+id);
 }
 function recoverRewards(){
  try{for(let i=0;i<(journalStorage?.length??0);i++){const key=journalStorage.key(i);if(!key?.startsWith(PENDING_PREFIX)&&!key?.startsWith(CASH_PENDING_PREFIX))continue;try{const entry=JSON.parse(journalStorage.getItem(key));if(entry&&typeof entry.id==='string'&&(key===CASH_PENDING_PREFIX+entry.id&&cashReward(entry.id)||key===PENDING_PREFIX+entry.id&&/^kill\.[a-z][a-z0-9-]{0,39}\.(0|[1-9][0-9]{0,3})$/.test(entry.id)&&isEnemyRewardVariant(entry.variant)))pendingRewards.set(key,entry);}catch{}}}catch{}
  for(const [key,entry] of [...pendingRewards]){if(key.startsWith(CASH_PENDING_PREFIX))claimCashReward(entry.id);else queueEnemyReward(entry.id,entry.variant);}
  return rewardQueue;
 }
 // Keep the existing startup hook compatible while recovering all reward types.
 function recoverEnemyRewards(){return recoverRewards();}
 async function flushRewards(){
  await rewardQueue;if(pendingRewards.size)await recoverRewards();
  if([...pendingRewards.values()].some(entry=>!economy.state.claimedRewards[entry.id]))throw new Error('Cash rewards are still being saved. Please try again.');
  return serialize();
 }
 function flushEnemyRewards(){return flushRewards();}
 function migrateEnemyRewards(ids=[]){if(!beginMutation())return false;const before=serialize();return finishMutation(economy.migrateEnemyRewards(ids),before,true).ok;}
 function hasPurchasesSince(snapshot){return state.purchaseRevision>revision(snapshot?.profilePurchaseRevision??snapshot?.profileRevision);}
 function restoreCheckpointEconomy(saved){
  const latest=read(),preserve=!!latest.saved||sessionOnly||state.revision>0,current=economy.serialize();
  economy.restore(saved);
  if(preserve){economy.state.credits=current.credits;economy.state.enemyRewardsVersion=current.enemyRewardsVersion;economy.state.claimedRewards={...economy.state.claimedRewards,...current.claimedRewards};economy.state.replayAttempts={...current.replayAttempts};}
 }
 function restoreLoadout(saved={}){const primary=ids().includes(saved.primary)?saved.primary:'carbine';state.unlocked=['carbine',...ids().filter(id=>id!=='carbine'&&(state.unlocked.includes(id)||saved.unlocked?.includes(id)||id===primary))];state.primary=primary;return true;}
 function restoreTransient(value){const saved=normalizeCampaignProfile(value);if(!saved)return false;const latest=read();if(latest.saved&&latest.saved.revision>saved.revision){observedRaw=latest.raw;apply(latest.saved);return false;}apply(saved);observedRaw=latest.raw;sessionOnly=true;return true;}
 reload();
 return {state,persist,reload,markPurchase,hasPurchasesSince,beginReplayAttempt,getWeaponOffers,purchaseWeapon,equipPrimary,purchaseOffer,claimCashReward,queueEnemyReward,recoverEnemyRewards,recoverRewards,flushRewards,flushEnemyRewards,migrateEnemyRewards,restoreCheckpointEconomy,restoreLoadout,serialize,restoreTransient,isSessionOnly:()=>sessionOnly};
}
export function defaultCampaignProfile(){return initial();}
