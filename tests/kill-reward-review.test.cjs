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
test('quota-failed payout survives duplicate suppression and is recovered once after storage returns',async()=>{
 const store=storage(),profile=createCampaignProfile({storage:store,locks:null});profile.persist();const write=store.setItem;let denied=true;
 store.setItem=(key,value)=>{if(key===CAMPAIGN_PROFILE_KEY&&denied)throw Error('quota');write(key,value);};
 const id='kill.freight-yard.19';assert.equal((await profile.queueEnemyReward(id,'brute')).persisted,false);assert.equal(profile.serialize().economy.credits,158);
 assert.equal((await profile.queueEnemyReward(id,'normal')).alreadyClaimed,true);assert.ok(store.getItem(pending+id),'memory-only duplicate cannot delete recovery journal');
 denied=false;const reopened=createCampaignProfile({storage:store,locks:null});await reopened.recoverRewards();assert.equal(reopened.serialize().economy.credits,158);assert.equal(store.getItem(pending+id),null);
 await reopened.recoverRewards();assert.equal(reopened.serialize().economy.credits,158);
});
test('pending cache and first-clear rewards recover after interruption before profile locking',async()=>{
 const store=storage(),original=createCampaignProfile({storage:store,locks:null});original.persist();
 for(const id of ['contract.freight','salvage.freight.arrival'])store.setItem('nulldelve.cash-reward.pending.'+id,JSON.stringify({id}));
 const recovered=createCampaignProfile({storage:store,locks:null});await recovered.recoverRewards();assert.equal(recovered.serialize().economy.credits,370);
 for(const id of ['contract.freight','salvage.freight.arrival'])assert.equal(store.getItem('nulldelve.cash-reward.pending.'+id),null);
 await recovered.recoverRewards();assert.equal(recovered.serialize().economy.credits,370);
});
test('backup reward flush waits for all earned payout types and returns a complete wallet',async()=>{
 const store=storage();let release;const gate=new Promise(resolve=>release=resolve),locks={request:async(_name,_options,fn)=>{await gate;return fn();}},profile=createCampaignProfile({storage:store,locks});profile.persist();
 const kill=profile.queueEnemyReward('kill.security.18','brute'),contract=profile.claimCashReward('contract.breach');let done=false;const flushed=profile.flushRewards().then(result=>{done=true;return result;});await Promise.resolve();assert.equal(done,false);
 release();await Promise.all([kill,contract]);const saved=await flushed;assert.equal(saved.economy.credits,203);assert.equal(saved.economy.claimedRewards['kill.security.18'],true);assert.equal(saved.economy.claimedRewards['contract.breach'],true);
});
test('claiming a first-clear reward journals it before async locking and a new session can recover it once',async()=>{
 const store=storage();let release;const gate=new Promise(resolve=>release=resolve),locks={request:async(_name,_options,fn)=>{await gate;return fn();}},old=createCampaignProfile({storage:store,locks});old.persist();
 const id='contract.hospital',waiting=old.claimCashReward(id);assert.equal(JSON.parse(store.getItem('nulldelve.cash-reward.pending.'+id)).id,id);
 const reopened=createCampaignProfile({storage:store,locks:null});await reopened.recoverRewards();assert.equal(reopened.serialize().economy.credits,300);
 release();assert.equal((await waiting).alreadyClaimed,true);assert.equal(old.serialize().economy.credits,300);assert.equal(store.getItem('nulldelve.cash-reward.pending.'+id),null);
});
test('quota-failed exploration rewards retain their journal through a duplicate and preserve exact cash on reopen',async()=>{
 const store=storage(),profile=createCampaignProfile({storage:store,locks:null});profile.persist();const write=store.setItem;let denied=true;
 store.setItem=(key,value)=>{if(key===CAMPAIGN_PROFILE_KEY&&denied)throw Error('quota');write(key,value);};
 const id='salvage.freight.coldchain';assert.equal((await profile.claimCashReward(id)).persisted,false);assert.equal((await profile.claimCashReward(id)).alreadyClaimed,true);assert.ok(store.getItem('nulldelve.cash-reward.pending.'+id));
 denied=false;const reopened=createCampaignProfile({storage:store,locks:null});await reopened.recoverRewards();assert.equal(reopened.serialize().economy.credits,195);assert.equal(store.getItem('nulldelve.cash-reward.pending.'+id),null);
});
test('malformed recovery records cannot block backup flushing or award cash',async()=>{
 const store=storage(),profile=createCampaignProfile({storage:store,locks:null});profile.persist();
 for(const [key,entry]of [['nulldelve.cash-reward.pending.contract.unknown',{id:'contract.unknown'}],['nulldelve.enemy-reward.pending.kill.security.1',{id:'kill.security.1',variant:'unknown'}],['nulldelve.enemy-reward.pending.kill.bad.-1',{id:'kill.bad.-1',variant:'boss'}]])store.setItem(key,JSON.stringify(entry));
 await profile.recoverRewards();const saved=await profile.flushRewards();assert.equal(saved.economy.credits,150);assert.deepEqual(saved.economy.claimedRewards,{});
});
