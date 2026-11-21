import {compatibleStorage} from './storage-compat.js?v=critic-review-7';
import {formatKey} from './controls.js?v=critic-review-7';
const KEY='nulldelve.tutorial.v1';
export function createOnboarding({storage,host,getBindings}){
 storage=compatibleStorage(storage);
 let enabled=false,start=null,step=0;const done=new Set();
 const steps=[['move',b=>`Move with ${['moveUp','moveLeft','moveDown','moveRight'].map(k=>formatKey(b[k])).join(' / ')}.`],['aim',b=>`Aim independently with the mouse or ${['aimUp','aimLeft','aimDown','aimRight'].map(k=>formatKey(b[k])).join(' / ')}. Click or ${formatKey(b.fire)} fires.`],['crate',()=> 'Walk into crates to push them.'],['door',b=>`Press ${formatKey(b.interact)} near doors or equipment to interact.`],['loot',()=> 'Defeat a creature, then walk over an ammo case or medical pouch.']];
 function finish(){enabled=false;host.hidden=true;try{storage?.setItem(KEY,'done');}catch{}}
 function draw(){host.replaceChildren();host.hidden=!enabled;if(!enabled)return;const text=document.createElement('span');text.textContent=`FIELD TRAINING ${step+1}/${steps.length} · ${steps[step][1](getBindings())}`;const skip=document.createElement('button');skip.textContent='Skip tutorial';skip.onclick=finish;host.append(text,skip);}
 return {start(player,{force=false}={}){let completed=false;try{completed=storage?.getItem(KEY)==='done';}catch{}enabled=force||!completed;start={x:player.x,z:player.z};step=0;done.clear();draw();},event(name){done.add(name);},update(player,puzzle){if(!enabled)return;if(Math.hypot(player.x-start.x,player.z-start.z)>1)done.add('move');if(puzzle.plates.some(p=>p.active))done.add('crate');const previous=step;while(step<steps.length&&done.has(steps[step][0]))step++;if(step===steps.length)finish();else if(previous!==step)draw();},hide(){host.hidden=true;},refresh:draw};
}
