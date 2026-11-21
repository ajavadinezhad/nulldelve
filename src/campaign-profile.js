import {attachmentOptions,applyWeaponAttachment} from './weapon-attachments.js?v=audit-r21';
import {compatibleStorage} from './storage-compat.js?v=audit-r21';
import {PRIMARY_WEAPONS} from './arsenal.js?v=audit-r21';
import {createEconomy} from './economy.js?v=audit-r21';
export const CAMPAIGN_PROFILE_KEY='nulldelve.profile.v1';
const LOCK_KEY=CAMPAIGN_PROFILE_KEY+'.lease';
const ids=()=>PRIMARY_WEAPONS.map(weapon=>weapon.id);
const revision=value=>Number.isSafeInteger(value)&&value>=0?value:0;
const initial=()=>({version:1,revision:0,economy:createEconomy().serialize(),primary:'carbine',unlocked:['carbine']});
export function normalizeCampaignProfile(value){
 if(!value||value.version!==1||!value.economy||typeof value.economy!=='object'||Array.isArray(value.economy)||!Array.isArray(value.unlocked)||typeof value.primary!=='string')return null;
 const unlocked=['carbine',...ids().filter(id=>id!=='carbine'&&value.unlocked.includes(id))];
 return {version:1,revision:revision(value.revision),economy:createEconomy(value.economy).serialize(),primary:unlocked.includes(value.primary)?value.primary:'carbine',unlocked};
}
/** One shared economy; shop mutations synchronize before charging and reject conflicts. */
export function createCampaignProfile({storage,economy=createEconomy(),locks=globalThis.navigator?.locks}={}){
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}storage=compatibleStorage(storage);
 const state={primary:'carbine',unlocked:['carbine'],revision:0};
 let observedRaw=null,sessionOnly=false,leaseToken=null,lastFailure=null;
 const token=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
 function serialize(){return normalizeCampaignProfile({version:1,revision:state.revision,economy:economy.serialize(),primary:state.primary,unlocked:state.unlocked});}
 function apply(saved){state.revision=saved.revision;economy.restore(saved.economy);state.primary=saved.primary;state.unlocked=[...saved.unlocked];}
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
 function markPurchase(){state.revision=Math.min(Number.MAX_SAFE_INTEGER,revision(state.revision)+1);persist();return state.revision;}
 function getWeaponOffers(){return PRIMARY_WEAPONS.map(weapon=>{const owned=state.unlocked.includes(weapon.id),equipped=state.primary===weapon.id,attachment=economy.state.attachments[weapon.id]??'standard',stats=applyWeaponAttachment({...weapon,...economy.stats(weapon.id,{damage:weapon.baseDamage,capacity:weapon.capacity,interval:weapon.interval,reload:weapon.reload})},attachment);return {id:'weapon.'+weapon.id,weaponId:weapon.id,kind:'weapon',label:weapon.name??weapon.label??weapon.id,description:weapon.description??'Primary weapon for your next deployment.',cost:weapon.cost,stats:{damage:stats.damage,capacity:stats.capacity,interval:stats.interval,reload:stats.reload,pellets:stats.pellets,range:stats.range},attachment,attachmentOptions:attachmentOptions(weapon.id),owned,equipped,available:!equipped&&(owned||economy.state.credits>=weapon.cost)};});}
 function setAttachment(value){const [,weaponId,attachmentId,...extra]=String(value).split('.');if(extra.length||!state.unlocked.includes(weaponId)||state.primary!==weaponId)return {ok:false,message:'Equip an owned weapon before modifying it.'};const option=attachmentOptions(weaponId).find(option=>option.id===attachmentId);if(!option)return {ok:false,message:'That attachment is not available for this weapon.'};economy.state.attachments[weaponId]=attachmentId;return {ok:true,message:`${option.name} fitted.`};}
 function mutate(value,equipOnly=false){
  const id=String(value).replace(/^(weapon|equip)\./,''),weapon=PRIMARY_WEAPONS.find(item=>item.id===id);
  if(!weapon)return {ok:false,message:'That weapon is not available.'};
  if(!state.unlocked.includes(id)){
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
 function finishMutation(result,before,increment){
  if(!result.ok)return result;
  if(increment)state.revision=Math.min(Number.MAX_SAFE_INTEGER,revision(state.revision)+1);
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
    else if(String(id).startsWith('attachment.'))result=setAttachment(id);
    else result=economy.purchase(id);
    return finishMutation(result,before,true);
   }finally{releaseLease();}
  };
  if(!locks?.request)return transaction();
  let started=false;try{return await locks.request(CAMPAIGN_PROFILE_KEY,{mode:'exclusive'},()=>{started=true;return transaction();});}catch(error){if(started)throw error;return transaction();}
 }
 function restoreLoadout(saved={}){const primary=ids().includes(saved.primary)?saved.primary:'carbine';state.unlocked=['carbine',...ids().filter(id=>id!=='carbine'&&(state.unlocked.includes(id)||saved.unlocked?.includes(id)||id===primary))];state.primary=primary;return true;}
 function restoreTransient(value){const saved=normalizeCampaignProfile(value);if(!saved)return false;const latest=read();if(latest.saved&&latest.saved.revision>saved.revision){observedRaw=latest.raw;apply(latest.saved);return false;}apply(saved);observedRaw=latest.raw;sessionOnly=true;return true;}
 reload();
 return {state,persist,reload,markPurchase,getWeaponOffers,purchaseWeapon,equipPrimary,purchaseOffer,restoreLoadout,serialize,restoreTransient,isSessionOnly:()=>sessionOnly};
}
export function defaultCampaignProfile(){return initial();}
