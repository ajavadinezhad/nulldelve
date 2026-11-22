/** Display existing encounter timing without changing spawning, rewards or difficulty. */
export function encounterStatus(zone){
 if(!zone||zone.status!=='active')return null;
 const regroup=zone.phaseRested===true&&zone.spawnTimer>0&&zone.queue?.length>0&&!zone.wave?.some(enemy=>enemy.hp>0);
 const seconds=regroup?Math.max(1,Math.ceil(Math.min(6,zone.spawnTimer))):0;
 return {phase:regroup?'regroup':'combat',text:regroup?`NEXT WAVE · ${seconds}s`:`${zone.label} · ${zone.remaining} LEFT`,
  label:regroup?`${zone.label}: next wave in ${seconds} seconds. ${zone.remaining} enemies remain.`:`${zone.label}: ${zone.remaining} of ${zone.total} enemies remain.`};
}
