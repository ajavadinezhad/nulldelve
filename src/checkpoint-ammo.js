import {primaryWeapon} from './arsenal.js?v=integration-fixes-r55';
/** Preserve rounds for the same gun; retain base ammunition value across weapon changes. */
export function checkpointPrimaryAmmo(snapshot,currentId,capacity){
 const oldId=snapshot?.loadout?.primary??'carbine',old=primaryWeapon(oldId),next=primaryWeapon(currentId);
 const reserve=Math.max(0,Math.min(300,Number(snapshot?.reserves?.rifle??120)||0)),loaded=Math.max(0,Number(snapshot?.magazines?.rifle)||0),limit=Math.max(1,Math.min(1000,Number(capacity)||next.capacity));
 if(old.id===next.id)return {reserve,loaded:Math.min(limit,loaded),changed:false};
 const value=gun=>Math.max(1,gun.baseDamage)*Math.max(1,gun.pellets??1),rounds=Math.floor((reserve+loaded)*value(old)/value(next)),magazine=Math.min(limit,rounds);
 return {reserve:Math.min(300,Math.max(0,rounds-magazine)),loaded:magazine,changed:true};
}
