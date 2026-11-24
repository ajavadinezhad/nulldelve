const {test}=require('node:test'),assert=require('node:assert/strict');const {checkpointPrimaryAmmo}=require('../src/checkpoint-ammo.js');const {PRIMARY_WEAPONS}=require('../src/arsenal.js');
test('same-weapon checkpoint rounds are exact and weapon changes conserve base ammunition value',()=>{
 for(const old of PRIMARY_WEAPONS)for(const next of PRIMARY_WEAPONS){const snapshot={loadout:{primary:old.id},reserves:{rifle:120},magazines:{rifle:old.capacity}},r=checkpointPrimaryAmmo(snapshot,next.id,next.capacity),value=g=>g.baseDamage*g.pellets;if(old.id===next.id)assert.deepEqual(r,{reserve:120,loaded:old.capacity,changed:false});else{assert.equal(r.changed,true);assert.ok((r.reserve+r.loaded)*value(next)<=(120+old.capacity)*value(old));assert.ok(r.loaded<=next.capacity);}}
 const converted=checkpointPrimaryAmmo({loadout:{primary:'lmg'},reserves:{rifle:120},magazines:{rifle:60}},'mantis',5);assert.deepEqual(converted,{reserve:17,loaded:5,changed:true});
});

test('ground pickup conversion pools all ammo value without rounding gains, while retaining supplies and leftovers',()=>{
 const {checkpointLoot}=require('../src/checkpoint-ammo.js');for(const old of PRIMARY_WEAPONS)for(const next of PRIMARY_WEAPONS){
  const drops=Array.from({length:23},(_,i)=>({id:'d'+i,kind:i===7?'health':'ammo',x:i,z:2,rifle:i===7?0:1,pistol:2,amount:i===7?6:0})),saved={loadout:{primary:old.id},loot:{supplyBudget:0,drops}},copy=checkpointLoot(saved,next.id),value=g=>g.baseDamage*g.pellets,total=list=>list.filter(d=>d.kind==='ammo').reduce((n,d)=>n+d.rifle,0);
  assert.ok(Math.abs(total(copy.drops)*value(next)+copy.supplyBudget-total(drops)*value(old))<1e-7,old.id+' to '+next.id);assert.deepEqual(copy.drops.map(d=>[d.id,d.x,d.z,d.pistol,d.amount]),drops.map(d=>[d.id,d.x,d.z,d.pistol,d.amount]));assert.equal(saved.loot.drops[0].rifle,1,'conversion does not mutate the save');
 }
});
