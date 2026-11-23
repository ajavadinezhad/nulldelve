/** Routine combat feedback stays on the relevant instrument, not in the objective area. */
export function feedbackFor(message){
 if(message==='INPUT ACCEPTED')return {target:'#interact',tone:'success'};
 if(/^(?:INPUT REJECTED|ROUTE REJECTED|DISTRIBUTION REJECTED|PRESSURE MISMATCH)/.test(message))return {target:'#interact',tone:'warning'};
 if(/^SALVAGE SECURED\b/.test(message))return {target:'#credits',tone:'success'};
 if(/^NO (?:RESERVE )?AMMO\b/.test(message))return {target:'.ammo-status',tone:'warning'};
 if(/^NO MEDKITS\b/.test(message))return {target:'#use-medkit',tone:'warning'};
 if(/^NO GRENADES\b/.test(message))return {target:'#use-grenade',tone:'warning'};
 if(/^GRENADE READY\b/.test(message))return {target:'#use-grenade',tone:'success'};
 if(/^HEALTH IS ALREADY FULL\b/.test(message))return {target:'.vital',tone:'neutral'};
 if(/^MEDKIT USED\b|^\+\d+ HEALTH\b/.test(message))return {target:'.vital',tone:'success'};
 return null;
}
export function createHudFeedback({query,setTimer=setTimeout}={}){
 const active=new WeakMap();
 return {notify(message){const cue=feedbackFor(message);if(!cue)return false;const element=query(cue.target),status=query('#hud-status');if(status)status.textContent=message;if(!element)return true;const previous=active.get(element);if(previous?.tone===cue.tone)return true;if(previous)element.classList.remove('hud-pulse-'+previous.tone);const current={tone:cue.tone};active.set(element,current);element.classList.add('hud-pulse','hud-pulse-'+cue.tone);setTimer(()=>{if(active.get(element)!==current)return;element.classList.remove('hud-pulse','hud-pulse-'+cue.tone);active.delete(element);},1400);return true;}};
}
