const {test}=require('node:test'),assert=require('node:assert/strict');const {checkpointPrimaryAmmo}=require('../src/checkpoint-ammo.js');const {PRIMARY_WEAPONS}=require('../src/arsenal.js');
test('same-weapon checkpoint rounds are exact and weapon changes conserve base ammunition value',()=>{
 for(const old of PRIMARY_WEAPONS)for(const next of PRIMARY_WEAPONS){const snapshot={loadout:{primary:old.id},reserves:{rifle:120},magazines:{rifle:old.capacity}},r=checkpointPrimaryAmmo(snapshot,next.id,next.capacity),value=g=>g.baseDamage*g.pellets;if(old.id===next.id)assert.deepEqual(r,{reserve:120,loaded:old.capacity,changed:false});else{assert.equal(r.changed,true);assert.ok((r.reserve+r.loaded)*value(next)<=(120+old.capacity)*value(old));assert.ok(r.loaded<=next.capacity);}}
 const converted=checkpointPrimaryAmmo({loadout:{primary:'lmg'},reserves:{rifle:120},magazines:{rifle:60}},'mantis',5);assert.deepEqual(converted,{reserve:17,loaded:5,changed:true});
});
