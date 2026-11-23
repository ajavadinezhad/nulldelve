const {test}=require('node:test'),assert=require('node:assert/strict');
const {EXPLORATION_CACHES}=require('../src/exploration.js');
const {createCampaignProfile,CAMPAIGN_PROFILE_KEY}=require('../src/campaign-profile.js');
const {createEconomy}=require('../src/economy.js');
const prefix='nulldelve.cash-reward.pending.';
function disk(){const values=new Map();return {get length(){return values.size},key:i=>[...values.keys()][i]??null,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};}
for(const cache of EXPLORATION_CACHES){
 test(cache.id+' remains finite through checkpoint recovery, spending and a new replay',async()=>{
  const storage=disk(),economy=createEconomy(),profile=createCampaignProfile({storage,economy,locks:null,getCompleted:()=>[cache.operation]});profile.persist();const checkpoint=economy.serialize();
  assert.equal((await profile.claimCashReward(cache.id)).amount,cache.amount);
  assert.equal((await profile.purchaseOffer('medkit')).ok,true);const earnedAndSpent=150+cache.amount-60;
  profile.restoreCheckpointEconomy(checkpoint);assert.equal(economy.state.credits,earnedAndSpent);assert.equal(economy.state.claimedRewards[cache.id],true);
  assert.equal(profile.beginReplayAttempt(cache.operation).ok,true);assert.equal((await profile.claimCashReward(cache.id)).alreadyClaimed,true);assert.equal(economy.state.credits,earnedAndSpent);
  const reopened=createCampaignProfile({storage,locks:null});assert.equal(reopened.serialize().economy.credits,earnedAndSpent);assert.equal((await reopened.claimCashReward(cache.id)).alreadyClaimed,true);
 });
 test(cache.id+' simultaneous tabs without Web Locks cannot double-pay',async()=>{
  const storage=disk(),a=createCampaignProfile({storage,locks:null});a.persist();const b=createCampaignProfile({storage,locks:null});
  const result=await Promise.all([a.claimCashReward(cache.id),b.claimCashReward(cache.id),a.claimCashReward(cache.id)]);
  assert.equal(result.filter(r=>r.ok).length,1);assert.equal(JSON.parse(storage.getItem(CAMPAIGN_PROFILE_KEY)).economy.credits,150+cache.amount);
  a.reload();b.reload();assert.equal(a.serialize().economy.credits,150+cache.amount);assert.equal(b.serialize().economy.credits,150+cache.amount);assert.equal(storage.getItem(prefix+cache.id),null);
 });
 test(cache.id+' recovers exactly once after interruption and profile-write failure',async()=>{
  const storage=disk(),profile=createCampaignProfile({storage,locks:null});profile.persist();let release;const gate=new Promise(r=>release=r),waiting=createCampaignProfile({storage,locks:{request:async(_name,_options,fn)=>{await gate;return fn();}}});
  const claim=waiting.claimCashReward(cache.id);assert.equal(JSON.parse(storage.getItem(prefix+cache.id)).id,cache.id);
  const write=storage.setItem;storage.setItem=(key,value)=>{if(key===CAMPAIGN_PROFILE_KEY)throw Error('quota');write(key,value);};
  const memory=createCampaignProfile({storage,locks:null});await memory.recoverRewards();assert.equal(memory.serialize().economy.credits,150+cache.amount);assert.ok(storage.getItem(prefix+cache.id));
  assert.equal((await memory.claimCashReward(cache.id)).alreadyClaimed,true);assert.ok(storage.getItem(prefix+cache.id));
  storage.setItem=write;const reopened=createCampaignProfile({storage,locks:null});await reopened.recoverRewards();assert.equal(reopened.serialize().economy.credits,150+cache.amount);assert.equal(storage.getItem(prefix+cache.id),null);
  release();assert.equal((await claim).alreadyClaimed,true);assert.equal(waiting.serialize().economy.credits,150+cache.amount);await reopened.recoverRewards();assert.equal(reopened.serialize().economy.credits,150+cache.amount);
 });
}
