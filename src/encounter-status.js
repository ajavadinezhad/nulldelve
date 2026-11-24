import {freightEscortPhaseReady} from './freight-escort.js?v=welcome-popup-r60';
/** Display existing encounter timing without changing spawning, rewards or difficulty. */
export function encounterStatus(zone,{tasks}={}){
 if(!zone||zone.status!=='active')return null;
 const regroup=zone.phaseRested===true&&zone.spawnTimer>0&&zone.queue?.length>0&&!zone.wave?.some(enemy=>enemy.hp>0);
 const phase=Math.floor((zone.spawned??0)/Math.max(1,Math.ceil(zone.total/3)));
 if(regroup&&tasks){const waitingCargo=zone.id==='freight-yard'&&!freightEscortPhaseReady(tasks.freightRoute,phase),waitingLedger=zone.id==='hospital-isolation'&&phase>=1&&!tasks.hospitalRecords;if(waitingCargo||waitingLedger){const text=waitingLedger?'RECOVER LEDGER':tasks.freightRoute?.running?'ESCORT CARGO':'DISPATCH CARGO';return {phase:'objective',text,label:`${zone.label}: ${text.toLowerCase()}. ${zone.remaining} enemies remain.`};}}
 const seconds=regroup?Math.max(1,Math.ceil(Math.min(6,zone.spawnTimer))):0;
 return {phase:regroup?'regroup':'combat',text:regroup?`NEXT WAVE · ${seconds}s`:`${zone.label} · ${zone.remaining} LEFT`,
  label:regroup?`${zone.label}: next wave in ${seconds} seconds. ${zone.remaining} enemies remain.`:`${zone.label}: ${zone.remaining} of ${zone.total} enemies remain.`};
}
