import {normalizeCampaignOperation} from './campaign-operations.js?v=critic-fixes-r54';
/** Session rules shared by the browser game and its regression checks. */
export function createFixedStepper(step=1/60,maxCatchup=.5){
 let accumulator=0;
 return {advance(elapsed,update,running=true){if(!running){accumulator=0;return 0;}accumulator+=Math.max(0,Math.min(maxCatchup,Number(elapsed)||0));let count=0;while(accumulator+1e-9>=step){update(step);accumulator=Math.max(0,accumulator-step);count++;}return count;},reset(){accumulator=0;}};
}
export function restartOperationUrl(path,config){const mission=['campaign','siege','nest'].includes(config?.mission)?config.mission:'campaign',difficulty=['easy','normal','hard'].includes(config?.difficulty)?config.difficulty:'normal';const operation=mission==='campaign'?normalizeCampaignOperation(config?.operation):null;return `${path}?mission=${mission}&difficulty=${difficulty}${operation?'&operation='+operation:''}${config?.remix?'&remix=1':''}&play=1`;}
/** A safe checkpoint from another sector or remix must not masquerade as this run. */
export function checkpointMatchesOperation(snapshot,config){
 const saved=snapshot?.config;if(!saved||!config)return false;
 return saved.mission===config.mission&&saved.difficulty===config.difficulty&&(saved.operation??null)===(config.operation??null)&&!!saved.remix===!!config.remix;
}
export function combatIsActive(player,enemies,zones){return zones.some(z=>z.status==='active')||enemies.some(e=>e.hp>0&&Math.hypot(e.x-player.x,e.z-player.z)<8);}
export function canCheckpoint({active,ended,player,enemies,zones}){return !!active&&!ended&&player.hp>0&&!combatIsActive(player,enemies,zones);}
export function missionGuidance({mission,player,puzzle,progression}){
 const s=progression,zones=s.zones??[],zone=id=>zones.find(z=>z.id===id);
 if(mission==='siege'){
  const power=!!s.power?.solved,cleared=zone('reactor')?.status==='cleared',evac=s.evacuation??{};
  return {title:!power?'Repair reactor power':!cleared?'Clear the reactor swarm':'Hold for evacuation',hint:!power?'Inspect the reactor equipment and test its startup controls.':!cleared?'Eliminate every reactor reinforcement.':evac.completed?'Evacuation lift ready.':`Stay inside Reactor. Evacuation arrives in ${Math.ceil(evac.remaining??20)} seconds.`,steps:[{label:'Restore Reactor routing',done:power},{label:'Survive the reactor swarm',done:cleared},{label:'Hold Reactor for evacuation',done:!!evac.completed}]};
 }
 if(mission==='nest')return {title:'Destroy the nest horde',hint:zone('nest')?.status==='cleared'?'Nest cleared.':'Defeat the red mutation and all nest reinforcements.',steps:[{label:'Destroy the nest horde',done:zone('nest')?.status==='cleared'}]};
 const steps=[{label:'Power the insertion door',done:!!puzzle.solved},{label:'Solve the archive cipher',done:!!s.archive?.solved},{label:'Link the security relays',done:!!s.relay?.completed},{label:'Clear the security purge',done:zone('security')?.status==='cleared'},{label:'Clear Command and open the annex',done:zone('command')?.status==='cleared'},{label:'Restore Reactor routing',done:!!s.power?.solved},{label:'Release Containment pressure',done:!!s.valves?.solved},{label:'Destroy the nest horde',done:zone('nest')?.status==='cleared'},{label:'Recover the research intel',done:!!player.intel},{label:'Reach southeast Evacuation',done:false}];
 const first=steps.findIndex(x=>!x.done),hints=['Inspect the door circuits and floor switches. Look for something useful nearby.','Inspect the Archive controls and watch how they respond.','Inspect both relay stations. Their timed link lasts eight seconds.','Defeat the entire security horde, including reinforcements.','Reach Command in the northeast of the original wing and clear its mutation horde.','Inspect the Reactor controls and restore its power network.','Inspect the Containment controls and safely vent the pressure.','Explore the eastern annex. Find and clear Nest Core in the far northeast.','Pick up the cyan intel inside Nest Core.','Reach the green Evacuation pad in the far southeast.'];
 const battle=zones.find(z=>z.status==='active');return {title:battle?`Clear ${battle.label.toLowerCase()}`:steps[first]?.label??'Reach Evacuation',hint:battle?`${battle.remaining} creatures remain, including queued reinforcements.`:hints[first],steps};
}
