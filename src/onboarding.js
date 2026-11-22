import {compatibleStorage} from './storage-compat.js?v=ui-stability-r37';
import {formatKey} from './controls.js?v=ui-stability-r37';
const KEY='nulldelve.tutorial.v1';
export function createOnboarding({storage,host,getBindings}){
 storage=compatibleStorage(storage);
 let enabled=false,start=null,step=0,touch=false;const done=new Set();
 const steps=[['move',b=>`Move with ${['moveUp','moveLeft','moveDown','moveRight'].map(k=>formatKey(b[k])).join(' / ')}.`],['aim',b=>`Aim independently with the mouse or ${['aimUp','aimLeft','aimDown','aimRight'].map(k=>formatKey(b[k])).join(' / ')}. Click or ${formatKey(b.fire)} fires.`],['crate',b=>`Push crates onto switches. Hold ${formatKey(b.interact)} beside a crate and move to pull it.`],['door',b=>`Press ${formatKey(b.interact)} near doors or equipment to interact.`],['loot',()=> 'Defeat a creature, then walk over an ammo case or medical pouch.']];
 const touchSteps=[['move',()=> 'Movement stick moves; push its edge to sprint.'],['aim',()=> 'Drag the aim stick to aim and fire.'],['crate',()=> 'Push crates onto switches. Hold Grab beside a crate and move to pull it.'],['door',()=> 'Approach a door, then tap Open.'],['loot',()=> 'Walk over ammo cases and medical pouches to collect them.']];
 const activeSteps=()=>touch?touchSteps:steps,key=()=>touch?'nulldelve.tutorial.touch.v1':KEY;
 function finish(){enabled=false;host.hidden=true;try{storage?.setItem(key(),'done');}catch{}}
 function draw(){host.replaceChildren();host.hidden=!enabled;if(!enabled)return;const current=activeSteps(),text=document.createElement('span');text.textContent=`${touch?'':'FIELD TRAINING '}${step+1}/${current.length} · ${current[step][1](getBindings())}`;const skip=document.createElement('button');skip.textContent=touch?'Skip':'Skip tutorial';skip.setAttribute?.('aria-label','Skip tutorial');skip.onclick=finish;host.append(text,skip);}
 return {start(player,{force=false,touch:touchMode=false}={}){touch=touchMode;let completed=false;try{completed=storage?.getItem(key())==='done';}catch{}enabled=force||!completed;start={x:player.x,z:player.z};step=0;done.clear();draw();},event(name){done.add(name);},update(player,puzzle){if(!enabled)return;if(Math.hypot(player.x-start.x,player.z-start.z)>1)done.add('move');if(puzzle?.plates?.some(p=>p.active))done.add('crate');const previous=step,current=activeSteps();while(step<current.length&&done.has(current[step][0]))step++;if(step===current.length)finish();else if(previous!==step)draw();},hide(){host.hidden=true;},refresh:draw};
}
