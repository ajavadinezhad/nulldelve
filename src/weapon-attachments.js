import {PRIMARY_WEAPONS} from './arsenal.js?v=ui-audit-r35';
const STANDARD=Object.freeze({id:'standard',name:'Standard',description:'Original weapon handling.'});
const SINGLE=Object.freeze([STANDARD,Object.freeze({id:'handling',name:'Fast handling',description:'Reload −0.25s · range −15%'}),Object.freeze({id:'precision',name:'Long barrel',description:'Range +20% · firing interval +15%'})]);
const PELLET=Object.freeze([STANDARD,Object.freeze({id:'choke',name:'Tight choke',description:'Spread −40% · stagger −35%'}),Object.freeze({id:'breacher',name:'Breaching kit',description:'Stagger +30% · spread +15%'})]);
/** One free, mutually exclusive predeployment configuration per owned primary. */
export function attachmentOptions(weaponId){const gun=PRIMARY_WEAPONS.find(gun=>gun.id===weaponId);return gun?(gun.pellets>1?PELLET:SINGLE):[];}
export function normalizeAttachments(value){return Object.fromEntries(PRIMARY_WEAPONS.map(gun=>[gun.id,attachmentOptions(gun.id).some(option=>option.id===value?.[gun.id])?value[gun.id]:'standard']));}
/** Apply once after numeric upgrades. Capacity, damage and supply value never change. */
export function applyWeaponAttachment(profile,attachmentId){
 const result={...profile},gun=PRIMARY_WEAPONS.find(gun=>gun.id===profile.id);
 if(!gun||!attachmentOptions(gun.id).some(option=>option.id===attachmentId))return result;
 if(attachmentId==='handling'){result.reload=Math.max(.5,(result.reload??gun.reload)-.25);result.range=(result.range??gun.range)*.85;}
 if(attachmentId==='precision'){result.range=(result.range??gun.range)*1.2;result.interval=(result.interval??gun.interval)*1.15;}
 if(attachmentId==='choke'){result.spread=(result.spread??gun.spread)*.6;result.stagger=(result.stagger??gun.stagger)*.65;}
 if(attachmentId==='breacher'){result.spread=(result.spread??gun.spread)*1.15;result.stagger=(result.stagger??gun.stagger)*1.3;}
 return result;
}
