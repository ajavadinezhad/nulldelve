const {test}=require('node:test'),assert=require('node:assert/strict');
const {createCampaignProfile,CAMPAIGN_PROFILE_KEY}=require('../src/campaign-profile.js');
const {createEconomy}=require('../src/economy.js');
function storage(){const data=new Map();return {data,get length(){return data.size},key:i=>[...data.keys()][i]??null,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};}
const pending='nulldelve.enemy-reward.pending.';
test('interrupted reward journal pays once after reopening and removes the durable journal entry',async()=>{
 const store=storage(),economy=createEconomy(),first=createCampaignProfile({storage:store,economy,locks:null});assert.ok(first.persist());
 const id='kill.freight-pumps.0';store.setItem(pending+id,JSON.stringify({id,variant:'brute'}));
 const restoredEconomy=createEconomy(),restored=createCampaignProfile({storage:store,economy:restoredEconomy,locks:null});await restored.recoverEnemyRewards();
 assert.equal(restoredEconomy.state.credits,158);assert.equal(store.getItem(pending+id),null);
 const again=createCampaignProfile({storage:store,locks:null});await again.recoverEnemyRewards();assert.equal(again.serialize().economy.credits,158);
 assert.equal((await again.queueEnemyReward(id,'boss')).alreadyClaimed,true);assert.equal(again.serialize().economy.credits,158);
});
test('checkpoint restore retains earned cash and spent balance rather than refunding old snapshot money',async()=>{
 const store=storage(),economy=createEconomy(),profile=createCampaignProfile({storage:store,economy,locks:null});profile.persist();const checkpoint=economy.serialize();
 await profile.queueEnemyReward('kill.freight-yard.2','boss');assert.equal(economy.state.credits,190);
 profile.restoreCheckpointEconomy(checkpoint);assert.equal(economy.state.credits,190);assert.ok(economy.state.claimedRewards['kill.freight-yard.2']);
 assert.ok((await profile.purchaseOffer('medkit')).ok);assert.equal(economy.state.credits,130);
 profile.restoreCheckpointEconomy(checkpoint);assert.equal(economy.state.credits,130);
 assert.equal((await profile.queueEnemyReward('kill.freight-yard.2','normal')).alreadyClaimed,true);assert.equal(economy.state.credits,130);
 const reloaded=createCampaignProfile({storage:store,locks:null});assert.equal(reloaded.serialize().economy.credits,130);
});
test('two tabs claiming the same enemy cannot duplicate cash or erase the winning balance',async()=>{
 const store=storage(),a=createCampaignProfile({storage:store,locks:null}),b=createCampaignProfile({storage:store,locks:null});a.persist();b.reload();
 const results=await Promise.all([a.queueEnemyReward('kill.freight-cold.8','sentinel'),b.queueEnemyReward('kill.freight-cold.8','sentinel')]);
 assert.equal(results.filter(result=>result.ok).length,1);assert.equal(results.filter(result=>result.alreadyClaimed).length,1);
 assert.equal(JSON.parse(store.getItem(CAMPAIGN_PROFILE_KEY)).economy.credits,164);
});
test('legacy migration cannot replace an interrupted real payout with a zero-payment seed',async()=>{
 const store=storage();let release;const gate=new Promise(resolve=>release=resolve),locks={request:async(_name,_options,fn)=>{await gate;return fn();}},profile=createCampaignProfile({storage:store,locks});profile.persist();
 const id='kill.security.4',earned=profile.queueEnemyReward(id,'brute'),seed=profile.queueEnemyReward(id,'paid');
 assert.equal(JSON.parse(store.getItem(pending+id)).variant,'brute');release();await Promise.all([earned,seed]);assert.equal(profile.serialize().economy.credits,158);
});
