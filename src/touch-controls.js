export function stickVector(x,z,deadzone=.15){
 const length=Math.hypot(x,z);if(!Number.isFinite(deadzone)||deadzone<0||deadzone>=1||!Number.isFinite(length)||length<=deadzone)return {x:0,z:0};
 const magnitude=(Math.min(1,length)-deadzone)/(1-deadzone);return {x:x/length*magnitude,z:z/length*magnitude};
}
export function createTwinStickInput(){
 const sticks={move:{pointer:null,x:0,z:0},aim:{pointer:null,x:0,z:0}};
 function update(name,id,x,z){const stick=sticks[name];if(!stick||stick.pointer!==id)return false;Object.assign(stick,stickVector(x,z));return true;}
 function end(name,id){const stick=sticks[name];if(!stick||stick.pointer!==id)return false;Object.assign(stick,{pointer:null,x:0,z:0});return true;}
 return {begin(name,id,x=0,z=0){const stick=sticks[name];if(!stick||stick.pointer!==null||Object.values(sticks).some(s=>s.pointer===id))return false;stick.pointer=id;return update(name,id,x,z);},update,end,reset(){for(const stick of Object.values(sticks))Object.assign(stick,{pointer:null,x:0,z:0});},getState(){const move={x:sticks.move.x,z:sticks.move.z},aim={x:sticks.aim.x,z:sticks.aim.z,active:sticks.aim.pointer!==null&&Math.hypot(sticks.aim.x,sticks.aim.z)>0};return {move,aim,sprint:sticks.move.pointer!==null&&Math.hypot(move.x,move.z)>=.85,firing:false};}};
}
/** Independent aiming overrides movement; releasing both retains the game's last facing. */
export function touchAimDirection(state){
 const source=state?.aim?.active?state.aim:state?.move;
 const x=source?.x??0,z=source?.z??0,length=Math.hypot(x,z);
 return Number.isFinite(length)&&length>0?{x:x/length,z:z/length}:null;
}
export function shouldShowTouchControls(mode,{coarse=false,touchPoints=0}={}){return mode==='on'||mode!=='off'&&(coarse||touchPoints>0);}
/** Small action labels retain the full nearby-device context for assistive input. */
export function touchInteractionContext(prompt){
 const description=typeof prompt==='string'?prompt.replace(/^[^·]{1,24} · /,'').trim():'';
 if(!description)return {label:'Interact',description:'Interact',available:!!prompt};
 let label='Use';
 if(/\bLOCKED\b|\bNO POWER\b|\bCHARGE A FIRST\b/.test(description))label='Locked';
 else if(/\bEVACUATE\b|\bLEAVE SECTOR\b/.test(description))label='Exit';
 else if(/^(?:REREAD|READ)\b/.test(description))label='Read';
 else if(/^(?:HOLD.*GRAB|GRAB)\b/.test(description))label='Grab';
 else if(/^RELEASE\b/.test(description))label='Release';
 else if(/^RIDE\b/.test(description))label='Ride';
 else if(/^ROTATE\b/.test(description))label='Rotate';
 else if(/^OPEN\b/.test(description))label='Open';
 else if(/^CLOSE\b/.test(description))label='Close';
 else if(/^(?:RESTART|CHARGE)\b/.test(description))label='Charge';
 else if(/^LINK\b/.test(description))label='Link';
 else if(/^INSERT\b/.test(description))label='Insert';
 else if(/^EXAMINE\b/.test(description))label='Examine';
 else if(/COMPLETE|ACCEPTED|ALREADY|ONLINE|CONNECTED|ESTABLISHED/.test(description))label='Check';
 return {label,description,available:true};
}
/** One finger owns the held action until release, cancellation or input reset. */
export function createHeldInteraction(onStart,onEnd){let pointer=null;return {get held(){return pointer!==null;},begin(id){if(pointer!==null)return false;pointer=id;onStart();return true;},end(id){if(pointer!==id)return false;pointer=null;onEnd();return true;},reset(){if(pointer!==null){pointer=null;onEnd();}}};}
const ICONS={grab:'M10 10h12v13H10zM10 14h12M16 10v13M3 17h4v9h7m15-9h-4v9h-7',interact:'M8 5h15v23H8zM4 17h15m-5-5 5 5-5 5',reload:'M25 12a11 11 0 1 0 1 10M25 5v8h-8',weapon:'M4 13h8V9h12v4h5v5H17l-5 9H6l4-9H4z',knife:'m7 27 7-7m-3 3 4 4M14 20 25 5l2 9-9 10z'};
export function createTouchControls({host,isRunning,onAction,device=()=>({coarse:globalThis.matchMedia?.('(pointer: coarse)')?.matches??false,touchPoints:globalThis.navigator?.maxTouchPoints??0})}){
 if(!host)return {enabled:false,getState:()=>({move:{x:0,z:0},aim:{x:0,z:0,active:false},sprint:false,firing:false}),reset(){},configure(){}};
 const heldInteract=createHeldInteraction(()=>onAction('interact'),()=>onAction('interactEnd'));
 let fireButton=null;const heldFire=createHeldInteraction(()=>fireButton?.classList.toggle('held',true),()=>fireButton?.classList.toggle('held',false));
 const input=createTwinStickInput(),knobs={},cleanups=[];let enabled=false,mode='auto',lastInteractPrompt=null;
 const doc=host.ownerDocument??document,make=(tag,cls,text)=>{const node=doc.createElement(tag);node.className=cls;if(text)node.textContent=text;return node;};
 function paint(name){const state=input.getState()[name],knob=knobs[name];const travel=(knob.parentElement.getBoundingClientRect?.().width||96)*.24;knob.style.transform=`translate(${state.x*travel}px,${state.z*travel}px)`;knob.parentElement.classList.toggle('engaged',Math.hypot(state.x,state.z)>0);}
 function reset(){heldFire.reset();heldInteract.reset();input.reset();for(const name of Object.keys(knobs))paint(name);}
 function listen(node,name,callback,options){node.addEventListener(name,callback,options);cleanups.push(()=>node.removeEventListener(name,callback,options));}
 host.replaceChildren();
 for(const [name,label] of [['move','Move + aim']]){
  const stick=make('div','touch-stick touch-stick-'+name);stick.setAttribute('role','group');stick.setAttribute('aria-label',name==='move'?'Movement and facing thumbstick; push to the outer edge to sprint':'Aim thumbstick; rotate only, does not fire');stick.dataset.stick=name;let origin=null;
  const track=make('span','touch-stick-track'),knob=make('span','touch-stick-knob'),caption=make('span','touch-stick-label',label);track.setAttribute('aria-hidden','true');knob.setAttribute('aria-hidden','true');stick.append(track,knob,caption);knobs[name]=knob;host.append(stick);
  const position=e=>{const rect=stick.getBoundingClientRect(),radius=Math.min(rect.width,rect.height)*.38;return {x:(e.clientX-(origin?.x??rect.left+rect.width/2))/radius,z:(e.clientY-(origin?.z??rect.top+rect.height/2))/radius};};
  listen(stick,'pointerdown',e=>{if(!enabled||!isRunning()||e.button>0)return;e.preventDefault();const p=position(e);if(!input.begin(name,e.pointerId,name==='aim'?0:p.x,name==='aim'?0:p.z))return;if(name==='aim')origin={x:e.clientX,z:e.clientY};try{stick.setPointerCapture(e.pointerId);}catch{}paint(name);});
  listen(stick,'pointermove',e=>{const p=position(e);if(input.update(name,e.pointerId,p.x,p.z)){e.preventDefault();paint(name);}});
  const end=e=>{if(input.end(name,e.pointerId)){e.preventDefault();origin=null;paint(name);}};listen(stick,'pointerup',end);listen(stick,'pointercancel',end);listen(stick,'lostpointercapture',end);
 }
 const actions=make('div','touch-actions');for(const [action,label] of [['interact','Interact'],['reload','Reload'],['weapon','Swap'],['knife','Melee']]){const button=make('button','touch-action');button.type='button';button.dataset.action=action;button.setAttribute('aria-label',label);const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg'),path=doc.createElementNS('http://www.w3.org/2000/svg','path');svg.setAttribute('viewBox','0 0 32 32');svg.setAttribute('aria-hidden','true');path.setAttribute('d',ICONS[action]);svg.append(path);button.append(svg,make('span','',label));if(action==='interact'){
 listen(button,'pointerdown',event=>{if(!enabled||!isRunning()||event.button>0)return;event.preventDefault();if(heldInteract.begin(event.pointerId)){try{button.setPointerCapture(event.pointerId);}catch{}}});
 const end=event=>{if(heldInteract.end(event.pointerId))event.preventDefault();};for(const type of ['pointerup','pointercancel','lostpointercapture'])listen(button,type,end);
 listen(button,'click',event=>{if(event.detail===0&&enabled&&isRunning()){onAction(action);onAction('interactEnd');}});
 }else listen(button,'click',()=>{if(enabled&&isRunning())onAction(action);});actions.append(button);}host.append(actions);
 fireButton=make('button','touch-action touch-fire');fireButton.type='button';fireButton.dataset.action='fire';fireButton.setAttribute('aria-label','Fire; hold to shoot');
 const fireSvg=doc.createElementNS('http://www.w3.org/2000/svg','svg'),firePath=doc.createElementNS('http://www.w3.org/2000/svg','path');fireSvg.setAttribute('viewBox','0 0 32 32');fireSvg.setAttribute('aria-hidden','true');firePath.setAttribute('d','M12 27V12l4-7 4 7v15zM12 20h8');fireSvg.append(firePath);fireButton.append(fireSvg,make('span','','Fire'));host.append(fireButton);
 listen(fireButton,'pointerdown',event=>{if(!enabled||!isRunning()||event.button>0)return;event.preventDefault();if(heldFire.begin(event.pointerId)){try{fireButton.setPointerCapture(event.pointerId);}catch{}}});
 const endFire=event=>{if(heldFire.end(event.pointerId))event.preventDefault();};for(const type of ['pointerup','pointercancel','lostpointercapture'])listen(fireButton,type,endFire);
 listen(fireButton,'click',event=>{if(event.detail===0&&enabled&&isRunning())onAction('fire');});
 function configure(next=mode,{handedness='right',size='normal'}={}){reset();doc.body.classList.toggle('touch-left-handed',handedness==='left');doc.body.classList.toggle('touch-large-controls',size==='large');mode=next;const nextEnabled=shouldShowTouchControls(mode,device());if(nextEnabled!==enabled)reset();enabled=nextEnabled;host.hidden=!enabled;doc.body.classList.toggle('touch-controls-enabled',enabled);}
 configure();listen(globalThis,'blur',reset);listen(globalThis,'resize',reset);listen(doc,'visibilitychange',()=>{if(doc.hidden)reset();});
 return {get enabled(){return enabled;},getState:()=>enabled?{...input.getState(),firing:heldFire.held,interactHeld:heldInteract.held}:{move:{x:0,z:0},aim:{x:0,z:0,active:false},sprint:false,firing:false},reset,configure,setInteractAvailable(prompt){if(prompt===lastInteractPrompt)return;lastInteractPrompt=prompt;const button=actions.querySelector('[data-action="interact"]');if(!button)return;const context=touchInteractionContext(prompt);button.classList.toggle('available',context.available);button.setAttribute('aria-label',context.description);button.title=context.description;button.querySelector('span').textContent=context.label;button.querySelector('path').setAttribute('d',['Grab','Release'].includes(context.label)?ICONS.grab:ICONS.interact);},dispose(){reset();cleanups.forEach(fn=>fn());doc.body.classList.remove('touch-controls-enabled');host.replaceChildren();}};
}
