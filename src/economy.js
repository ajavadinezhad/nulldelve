import {cashReward,normalizeRewardLedger} from './mission-salvage.js?v=expansion-r22';
import {normalizeAttachments} from './weapon-attachments.js?v=expansion-r22';
// Pure campaign economy. The game owns healing, shield absorption, and explosions;
// this module owns credits, purchases, inventory, upgrades, and saved-state hygiene.
const GUNS=['rifle','smg','shotgun','marksman','lmg','hush','scattergun','kestrel','mantis','jackal','vesper','pistol'],UPGRADES=['damage','magazine','reload'];
const MAGAZINE_STEPS={rifle:6,smg:6,shotgun:2,marksman:2,lmg:10,hush:3,scattergun:2,kestrel:4,mantis:1,jackal:1,vesper:4,pistol:2};
const COSTS={damage:[100,200,350],magazine:[80,160,280],reload:[80,160,280]};
const REWARDS={normal:2,runner:3,brute:8,charger:10,sentinel:14,screecher:12,leaper:9,boss:40};
const GUN_NAMES={rifle:'MK4',smg:'VX9',shotgun:'BREACH-12',marksman:'SABLE',lmg:'M60',hush:'HUSH-9',scattergun:'TWIN',kestrel:'KESTREL',mantis:'MANTIS',jackal:'JACKAL',vesper:'VESPER',pistol:'P9'};
const ITEM_LIMIT=5,CREDIT_LIMIT=999999999;
const clamp=(value,min,max,fallback=0)=>typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
const integer=(value,min,max,fallback=0)=>Math.floor(clamp(value,min,max,fallback));

export function createEconomy(snapshot){
  const state={claimedRewards:{},attachments:normalizeAttachments(),credits:150,upgrades:Object.fromEntries(GUNS.map(gun=>[gun,{damage:0,magazine:0,reload:0}])),magazineBonuses:Object.fromEntries(GUNS.map(gun=>[gun,0])),items:{medkit:0,grenade:0,fireGrenade:0},grenadeType:'frag',shield:0};
  function restore(saved){
    // An older save with no economy starts at the normal allowance. An explicit
    // economy object with malformed/zero credits never silently grants more money.
    const legacy=saved===undefined||saved===null;
    const data=!legacy&&typeof saved==='object'&&!Array.isArray(saved)?saved:{};
    state.credits=legacy?150:integer(data.credits,0,CREDIT_LIMIT);
    state.attachments=normalizeAttachments(data.attachments);
    state.claimedRewards=normalizeRewardLedger(data.claimedRewards);
    for(const gun of GUNS)for(const upgrade of UPGRADES)state.upgrades[gun][upgrade]=integer((gun==='rifle'?(data.upgrades?.rifle??data.upgrades?.carbine):data.upgrades?.[gun])?.[upgrade],0,3);
    // Existing purchases used six rounds per tier. Preserve that paid capacity
    // and any loaded ammunition; new purchases add the weapon-specific step.
    for(const gun of GUNS){const level=state.upgrades[gun].magazine,step=MAGAZINE_STEPS[gun],bonus=data.magazineBonuses?.[gun];state.magazineBonuses[gun]=Number.isFinite(bonus)?integer(bonus,level*Math.min(6,step),level*Math.max(6,step)):level*6;}
    for(const item of ['medkit','grenade','fireGrenade'])state.items[item]=integer(data.items?.[item],0,ITEM_LIMIT);
    state.grenadeType=data.grenadeType==='fire'?'fire':'frag';
    state.shield=clamp(data.shield,0,60);
    return state;
  }
  function serialize(){return {claimedRewards:{...state.claimedRewards},attachments:{...state.attachments},credits:state.credits,upgrades:Object.fromEntries(GUNS.map(gun=>[gun,{...state.upgrades[gun]}])),magazineBonuses:{...state.magazineBonuses},items:{...state.items},grenadeType:state.grenadeType,shield:state.shield};}
  function getOffers(){
    const offers=[];
    for(const gun of GUNS)for(const upgrade of UPGRADES){
      const level=state.upgrades[gun][upgrade],maxed=level>=3,cost=maxed?0:COSTS[upgrade][level];
      const labels={damage:'Damage tuning',magazine:'Extended magazine',reload:'Quick reload kit'};
      const descriptions={damage:'+1 damage per shot for this weapon.',magazine:`+${MAGAZINE_STEPS[gun]} round${MAGAZINE_STEPS[gun]===1?'':'s'} per magazine for this weapon.`,reload:'Reload this weapon 0.18 seconds faster (minimum 0.5s).'};
      offers.push({id:`${gun}.${upgrade}`,kind:'upgrade',label:`${GUN_NAMES[gun]} ${labels[upgrade]}`,description:maxed?'Fully upgraded.':descriptions[upgrade],cost,owned:level,level,maxLevel:3,increment:upgrade==='magazine'?MAGAZINE_STEPS[gun]:upgrade==='damage'?1:-.18,available:!maxed&&state.credits>=cost});
    }
    for(const [id,label,description,cost] of [['medkit','Field medkit','Use to restore up to 50 health. Carry up to five.',60],['grenade','Frag grenade','A throwable explosive. Carry up to five.',90],['fireGrenade','Incendiary grenade','Burns an area. Carry up to five.',120]]){
      offers.push({id,kind:'item',label,description,effect:id==='fireGrenade'?'Burns an area':id==='grenade'?'Explodes on impact':'Restores health',cost,owned:state.items[id],available:state.items[id]<ITEM_LIMIT&&state.credits>=cost});
    }
    offers.push({id:'armor',kind:'armor',label:'Armor plates',description:'Restore up to 40 shield, to a maximum of 60.',cost:100,owned:state.shield,available:state.shield<60&&state.credits>=100});
    return offers;
  }
  function purchase(id){
    if(typeof id==='string'&&id.startsWith('carbine.'))id='rifle.'+id.slice(8);
    const offer=getOffers().find(item=>item.id===id);
    if(!offer)return {ok:false,message:'That item is not available.'};
    if(offer.kind==='upgrade'&&offer.level>=offer.maxLevel)return {ok:false,message:'This weapon upgrade is already at its maximum level.'};
    if(offer.kind==='item'&&state.items[id]>=ITEM_LIMIT)return {ok:false,message:`You can carry only ${ITEM_LIMIT} ${id==='medkit'?'medkits':id==='fireGrenade'?'incendiary grenades':'frag grenades'}.`};
    if(id==='armor'&&state.shield>=60)return {ok:false,message:'Your armor is already full.'};
    if(state.credits<offer.cost)return {ok:false,message:`Not enough cash. You need $${offer.cost-state.credits} more.`};
    state.credits-=offer.cost;
    if(offer.kind==='upgrade'){const [gun,upgrade]=id.split('.');state.upgrades[gun][upgrade]++;if(upgrade==='magazine')state.magazineBonuses[gun]+=MAGAZINE_STEPS[gun];}
    else if(offer.kind==='item')state.items[id]++;
    else state.shield=Math.min(60,state.shield+40);
    return {ok:true,message:`Purchased ${offer.label}.`};
  }
  function rewardKill(variant='normal'){
    const amount=Object.prototype.hasOwnProperty.call(REWARDS,variant)?REWARDS[variant]:0;
    state.credits=Math.min(CREDIT_LIMIT,state.credits+amount);return amount;
  }
  function claimReward(id){const reward=cashReward(id);if(!reward)return {ok:false,message:'Unknown cash reward.'};if(state.claimedRewards[id])return {ok:false,alreadyClaimed:true,message:'Already collected.'};state.claimedRewards[id]=true;state.credits=Math.min(CREDIT_LIMIT,state.credits+reward.amount);return {ok:true,amount:reward.amount,message:`+$${reward.amount} · ${reward.label}`};}
  function consume(item){
    if(!['medkit','grenade','fireGrenade'].includes(item)||state.items[item]<=0)return false;
    state.items[item]--;return true;
  }
  function stats(type,base={}){
    const key=type==='carbine'?'rifle':type,upgrades=GUNS.includes(key)?state.upgrades[key]:{damage:0,magazine:0,reload:0};
    const capacity=integer(base.capacity,1,10000,12),reload=clamp(base.reload,0,100,1.3),interval=clamp(base.interval,.001,100,.2);
    return {damage:clamp(base.damage,1,10000,1)+upgrades.damage,capacity:capacity+(state.magazineBonuses[key]??0),reload:Math.max(.5,reload-.18*upgrades.reload),interval};
  }
  restore(snapshot);
  return {state,getOffers,purchase,rewardKill,claimReward,consume,stats,serialize,restore};
}
