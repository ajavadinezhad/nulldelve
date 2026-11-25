const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createEconomy}=require('../src/economy.js');
const {createCampaignProfile}=require('../src/campaign-profile.js');
const {createFieldSkills,trainingPoints}=require('../src/field-skills.js');
const {playerLevel}=require('../src/player-level.js');

test('unique kills fill the bar, unlock a spendable point, and survive checkpoint rewind',()=>{
 const storage=new Map();
 const device={getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)};
 const economy=createEconomy(),before=economy.serialize();
 const profile=createCampaignProfile({storage:device,economy});
 assert.equal(economy.claimEnemyReward('kill.security.0','normal').xp,1);
 assert.equal(economy.claimEnemyReward('kill.security.1','brute').xp,4);
 for(let i=2;i<11;i++)assert.equal(economy.claimEnemyReward('kill.security.'+i,'boss').xp,15);
 assert.equal(economy.claimEnemyReward('kill.security.11','charger').xp,5);
 assert.equal(economy.claimEnemyReward('kill.security.12','leaper').xp,5);
 assert.deepEqual(playerLevel(economy.state.xp),{level:2,xp:0,next:200,points:1});
 assert.equal(economy.claimEnemyReward('kill.security.0','normal').alreadyClaimed,true);
 assert.ok(profile.persist());
 profile.restoreCheckpointEconomy(before);
 assert.equal(economy.state.xp,150);
 assert.equal(createEconomy(economy.serialize()).state.xp,150);
 const skills=createFieldSkills(device,()=>economy.state.xp);
 assert.equal(skills.learn('medic').ok,false);
 assert.ok(skills.learn('medic',['breach']).ok);
 assert.equal(trainingPoints(skills.serialize(['breach']),['breach'],economy.state.xp),1);
 assert.equal(skills.learn('runner',['breach']).ok,false);
 assert.equal(createFieldSkills(device,()=>economy.state.xp).selected(['breach']),'medic');
});

test('old kill records keep the XP they originally awarded',()=>{
 const economy=createEconomy({claimedRewards:{'kill.security.0':true}});
 assert.equal(economy.state.xp,10);
 assert.equal(economy.claimEnemyReward('kill.security.1','normal').xp,1);
 assert.equal(createEconomy(economy.serialize()).state.xp,11);
});
