import {compatibleStorage} from './storage-compat.js?v=puzzle-visuals-r51';
import {formatKey} from './controls.js?v=puzzle-visuals-r51';
const KEY='nulldelve.tutorial.v1';
export function createOnboarding({storage,host,getBindings}){
 storage=compatibleStorage(storage);
 let enabled=false,start=null,step=0,touch=false;const done=new Set();
 const steps=[['move',b=>`Move with ${['moveUp','moveLeft','moveDown','moveRight'].map(k=>formatKey(b[k])).join(' / ')}.`],['aim',b=>`Aim: mouse / ${['aimUp','aimLeft','aimDown','aimRight'].map(k=>formatKey(b[k])).join(' ')} · Fire: click / ${formatKey(b.fire)}.`],['crate',b=>`Crates: push · Hold ${formatKey(b.interact)} + move: pull.`],['door',b=>`${formatKey(b.interact)}: doors / equipment.`],['loot',()=> 'Walk over ammo cases / medical pouches.']];
 const touchSteps=[['move',()=> 'Movement stick: move + aim · edge: sprint.'],['aim',()=> 'Move + aim stick: turn · Fire button: shoot.'],['crate',()=> 'Crates: push · Hold Grab + move: pull.'],['door',()=> 'Approach a door, then tap Open.'],['loot',()=> 'Walk over ammo cases / medical pouches.']];
 const activeSteps=()=>touch?touchSteps:steps,key=()=>touch?'nulldelve.tutorial.touch.v1':KEY;
 function finish(){enabled=false;host.hidden=true;try{storage?.setItem(key(),'done');}catch{}}
 function draw(){host.replaceChildren();host.hidden=!enabled;if(!enabled)return;const current=activeSteps(),text=document.createElement('span');text.textContent=`${touch?'':'TRAINING '}${step+1}/${current.length} · ${current[step][1](getBindings())}`;const skip=document.createElement('button');skip.textContent=touch?'Skip':'Skip tutorial';skip.setAttribute?.('aria-label','Skip tutorial');skip.onclick=finish;host.append(text,skip);}
 return {start(player,{force=false,touch:touchMode=false}={}){touch=touchMode;let completed=false;try{completed=storage?.getItem(key())==='done';}catch{}enabled=force||!completed;start={x:player.x,z:player.z};step=0;done.clear();draw();},event(name){done.add(name);},update(player,puzzle){if(!enabled)return;if(Math.hypot(player.x-start.x,player.z-start.z)>1)done.add('move');if(puzzle?.plates?.some(p=>p.active))done.add('crate');const previous=step,current=activeSteps();while(step<current.length&&done.has(current[step][0]))step++;if(step===current.length)finish();else if(previous!==step)draw();},hide(){host.hidden=true;},refresh:draw};
}
