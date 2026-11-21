/** Routine combat feedback stays on the relevant instrument, not in the objective area. */
export function feedbackFor(message){
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
 const active=new WeakSet();
 return {notify(message){const cue=feedbackFor(message);if(!cue)return false;const element=query(cue.target),status=query('#hud-status');if(status)status.textContent=message;if(!element)return true;if(active.has(element))return true;active.add(element);element.classList.add('hud-pulse','hud-pulse-'+cue.tone);setTimer(()=>{element.classList.remove('hud-pulse','hud-pulse-'+cue.tone);active.delete(element);},1400);return true;}};
}
