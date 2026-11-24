import {primaryWeapon} from './arsenal.js?v=google-launch-r59';
/** Preserve rounds for the same gun; retain base ammunition value across weapon changes. */
export function checkpointPrimaryAmmo(snapshot,currentId,capacity){
 const oldId=snapshot?.loadout?.primary??'carbine',old=primaryWeapon(oldId),next=primaryWeapon(currentId);
 const reserve=Math.max(0,Math.min(300,Number(snapshot?.reserves?.rifle??120)||0)),loaded=Math.max(0,Number(snapshot?.magazines?.rifle)||0),limit=Math.max(1,Math.min(1000,Number(capacity)||next.capacity));
 if(old.id===next.id)return {reserve,loaded:Math.min(limit,loaded),changed:false};
 const value=gun=>Math.max(1,gun.baseDamage)*Math.max(1,gun.pellets??1),rounds=Math.floor((reserve+loaded)*value(old)/value(next)),magazine=Math.min(limit,rounds);
 return {reserve:Math.min(300,Math.max(0,rounds-magazine)),loaded:magazine,changed:true};
}

/** Ground pickups use the checkpoint primary's rounds; pool fractional value so
 * many small drops cannot create extra expensive rounds or lose one per drop. */
export function checkpointLoot(snapshot,currentId){
 const saved=snapshot?.loot;if(!saved)return saved;
 const old=primaryWeapon(snapshot?.loadout?.primary??'carbine'),next=primaryWeapon(currentId),value=gun=>Math.max(1,gun.baseDamage)*Math.max(1,gun.pellets??1);
 let credit=0;const drops=(saved.drops??[]).map(drop=>{if(drop.kind!=='ammo'||old.id===next.id)return {...drop};credit+=Math.max(0,Number(drop.rifle)||0)*value(old);const rifle=Math.floor((credit+1e-9)/value(next));credit-=rifle*value(next);return {...drop,rifle};});
 // Preserve the sub-round remainder as earned value for the next finite drop.
 return {...saved,supplyBudget:Math.max(0,Number(saved.supplyBudget)||0)+credit,drops};
}
