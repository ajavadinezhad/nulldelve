/** Finite authored exploration cash and first-clear contracts; never random loot. */
export const SALVAGE_CACHES=Object.freeze([
 ['breach','archive',8,14,20],['breach','storage',25,25,25],
 ['command','maintenance',8,57,25],['command','generator',40,48,30],
 ['research','lab',63,6,30],['research','transit',62,58,35],
 ['containment','return',83,34,35],['containment','evac',88,58,40],
 ['nest','core',91,12,40],['nest','uplink',92,50,45],
 ['hospital','pharmacy',119,33,35],['hospital','isolation',139,58,45],
 ['freight','arrival',166,59,40],['freight','coldchain',188,14,45],
].map(([operation,site,x,z,amount])=>Object.freeze({id:`salvage.${operation}.${site}`,operation,x,z,amount,label:'Salvage cash'})));
const PAYOUTS=Object.freeze({breach:45,command:60,research:75,containment:95,nest:120,hospital:150,freight:180});
export const cacheById=id=>SALVAGE_CACHES.find(cache=>cache.id===id)??null;
export const missionPayout=operation=>Object.prototype.hasOwnProperty.call(PAYOUTS,operation)?PAYOUTS[operation]:0;
export function cashReward(id){const cache=cacheById(id);if(cache)return {id:cache.id,operation:cache.operation,amount:cache.amount,label:'Salvage cash'};if(typeof id==='string'&&id.startsWith('contract.')){const operation=id.slice(9),amount=missionPayout(operation);if(amount)return {id,operation,amount,label:'First-clear contract'};}return null;}
export const validEnemyRewardId=id=>typeof id==='string'&&/^kill\.[a-z][a-z0-9-]{0,39}\.(0|[1-9][0-9]{0,3})$/.test(id);
export function normalizeRewardLedger(value){return Object.fromEntries(Object.keys(value&&typeof value==='object'&&!Array.isArray(value)?value:{}).filter(id=>value[id]===true&&(cashReward(id)||validEnemyRewardId(id))).map(id=>[id,true]));}
