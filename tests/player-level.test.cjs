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
 for(let i=0;i<15;i++)assert.ok(economy.claimEnemyReward('kill.security.'+i,'normal').ok);
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
