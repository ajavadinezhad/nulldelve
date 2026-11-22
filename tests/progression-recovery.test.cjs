const {test}=require('node:test'),assert=require('node:assert/strict');
const {createFieldSkills,trainingPoints,effectiveFieldStats,fieldSkillEffects}=require('../src/field-skills.js');
const {createEconomy}=require('../src/economy.js');
const {createCampaignProfile}=require('../src/campaign-profile.js');
const {replayReward,missionPayout}=require('../src/mission-salvage.js');
const completed=['breach','command','research','containment','nest','hospital','freight'];
function storage(){const data=new Map();return {data,get length(){return data.size},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};}
test('base-only training reset refunds earned points and stale transfers cannot undo it',()=>{
 const disk=storage(),skills=createFieldSkills(disk);for(const id of ['runner','pathfinder','quickloader'])assert.ok(skills.learn(id,completed).ok);
 const stale=skills.serialize(completed);assert.equal(trainingPoints(stale,completed),4);
 assert.equal(skills.respec(completed).ok,false);assert.equal(skills.selected(completed),'quickloader');
 assert.ok(skills.respec(completed,{atBase:true}).ok);const fresh=createFieldSkills(disk);assert.equal(fresh.selected(completed),'none');assert.equal(trainingPoints(fresh.serialize(completed),completed),7);
 assert.equal(fresh.restoreDeployment(stale,completed),false);assert.deepEqual(fresh.serialize(completed).learned,[]);
 for(const id of ['medic','surgeon','triage'])assert.ok(fresh.learn(id,completed).ok);assert.equal(trainingPoints(fresh.serialize(completed),completed),4);
 const updated=fresh.serialize(completed);assert.ok(createFieldSkills(disk).restoreDeployment(updated,completed));
});
test('session-only reset retains refunded training without silently claiming durable storage',()=>{
 const skills=createFieldSkills(null);skills.learn('medic',completed);assert.ok(skills.respec(completed,{atBase:true}).ok);assert.ok(skills.isSessionOnly());assert.equal(trainingPoints(skills.serialize(completed),completed),7);
});
test('effective reload is shared, clamped, idempotent and preserves input',()=>{
 for(const reload of [.5,.56,.8,1.7,3.6])for(const skill of ['none','quickloader','closequarters']){
  const source={reload,capacity:30},effective=effectiveFieldStats(source,skill);assert.equal(source.reload,reload);assert.equal(effective.reload,Math.max(.5,reload*fieldSkillEffects(skill).reloadMultiplier));assert.deepEqual(effectiveFieldStats(effective,skill),effective);
 }
 const p=createCampaignProfile({storage:null});const mk4=p.getWeaponOffers('quickloader').find(w=>w.weaponId==='carbine');assert.equal(mk4.stats.reload,1.7*.88);assert.equal(mk4.stats.unskilledReload,1.7);
});
test('replay payouts require completed operations and the current durable attempt, paid only once',async()=>{
 const disk=storage(),money=createEconomy({credits:0}),profile=createCampaignProfile({storage:disk,economy:money,getCompleted:()=>completed});profile.persist();
 const checkpoint=money.serialize(),first=profile.beginReplayAttempt('breach');assert.ok(first.ok&&first.persisted);assert.equal(replayReward(first.rewardId).amount,30);
 assert.equal((await profile.claimCashReward(first.rewardId)).amount,30);assert.equal((await profile.claimCashReward(first.rewardId)).alreadyClaimed,true);assert.equal(money.state.credits,30);
 profile.restoreCheckpointEconomy(checkpoint);assert.equal(money.state.credits,30);assert.equal((await profile.claimCashReward(first.rewardId)).alreadyClaimed,true);
 const next=profile.beginReplayAttempt('breach');assert.ok(next.ok);assert.notEqual(next.rewardId,first.rewardId);assert.equal((await profile.claimCashReward(first.rewardId)).expired,true);
 const reopenedMoney=createEconomy(),reopened=createCampaignProfile({storage:disk,economy:reopenedMoney,getCompleted:()=>completed});assert.equal((await reopened.claimCashReward(next.rewardId)).amount,30);assert.equal(reopenedMoney.state.credits,60);await reopened.flushRewards();
 const newcomer=createCampaignProfile({storage:null,getCompleted:()=>[]});assert.equal(newcomer.beginReplayAttempt('freight').ok,false);
});
test('replay resupply is smaller than each first clear and forged or obsolete tokens never pay',async()=>{
 const e=createEconomy({credits:0});for(const op of completed){const id=`replay.${op}.valid-token`;assert.ok(replayReward(id).amount<missionPayout(op));assert.equal(e.claimReward(id).ok,false);assert.ok(e.beginReplayAttempt(op,'valid-token').ok);assert.equal(e.claimReward(id).amount,replayReward(id).amount);}
 const serialized=e.serialize();serialized.replayAttempts={bad:'replay.breach.valid-token',freight:'bad'};assert.deepEqual(createEconomy(serialized).state.replayAttempts,{});
});
test('replay completion journal recovers after reload and duplicate exit does not pay again',async()=>{
 const disk=storage(),profile=createCampaignProfile({storage:disk,getCompleted:()=>completed});profile.persist();const attempt=profile.beginReplayAttempt('freight');
 disk.setItem('nulldelve.cash-reward.pending.'+attempt.rewardId,JSON.stringify({id:attempt.rewardId}));
 const money=createEconomy(),reopened=createCampaignProfile({storage:disk,economy:money,getCompleted:()=>completed});await reopened.recoverRewards();assert.equal(money.state.credits,240);assert.equal((await reopened.claimCashReward(attempt.rewardId)).alreadyClaimed,true);assert.equal(money.state.credits,240);
});
test('starting another replay cannot invalidate a completed reward still being saved',async()=>{
 const disk=storage(),money=createEconomy({credits:0}),profile=createCampaignProfile({storage:disk,economy:money,getCompleted:()=>completed});profile.persist();const first=profile.beginReplayAttempt('breach');
 const payment=profile.claimCashReward(first.rewardId);assert.equal(profile.beginReplayAttempt('breach').ok,false);assert.equal((await payment).amount,30);assert.ok(profile.beginReplayAttempt('breach').ok);assert.equal(money.state.credits,30);
});
