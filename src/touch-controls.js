export function stickVector(x,z,deadzone=.15){
 const length=Math.hypot(x,z);if(!Number.isFinite(length)||length<=deadzone)return {x:0,z:0};
 const magnitude=(Math.min(1,length)-deadzone)/(1-deadzone);return {x:x/length*magnitude,z:z/length*magnitude};
}
export function createTwinStickInput(){
 const sticks={move:{pointer:null,x:0,z:0},aim:{pointer:null,x:0,z:0}};
 function update(name,id,x,z){const stick=sticks[name];if(!stick||stick.pointer!==id)return false;Object.assign(stick,stickVector(x,z));return true;}
 function end(name,id){const stick=sticks[name];if(!stick||stick.pointer!==id)return false;Object.assign(stick,{pointer:null,x:0,z:0});return true;}
 return {begin(name,id,x=0,z=0){const stick=sticks[name];if(!stick||stick.pointer!==null||Object.values(sticks).some(s=>s.pointer===id))return false;stick.pointer=id;return update(name,id,x,z);},update,end,reset(){for(const stick of Object.values(sticks))Object.assign(stick,{pointer:null,x:0,z:0});},getState(){const move={x:sticks.move.x,z:sticks.move.z},aim={x:sticks.aim.x,z:sticks.aim.z,active:sticks.aim.pointer!==null&&Math.hypot(sticks.aim.x,sticks.aim.z)>0};return {move,aim,firing:aim.active&&Math.hypot(aim.x,aim.z)>.2};}};
}
export function shouldShowTouchControls(mode,{coarse=false,touchPoints=0}={}){return mode==='on'||mode!=='off'&&(coarse||touchPoints>0);}
const ICONS={interact:'M8 5h15v23H8zM4 17h15m-5-5 5 5-5 5',reload:'M25 12a11 11 0 1 0 1 10M25 5v8h-8',weapon:'M4 13h8V9h12v4h5v5H17l-5 9H6l4-9H4z',knife:'m7 27 7-7m-3 3 4 4M14 20 25 5l2 9-9 10z'};
export function createTouchControls({host,isRunning,onAction,device=()=>({coarse:globalThis.matchMedia?.('(pointer: coarse)')?.matches??false,touchPoints:globalThis.navigator?.maxTouchPoints??0})}){
 if(!host)return {enabled:false,getState:()=>({move:{x:0,z:0},aim:{x:0,z:0,active:false},firing:false}),reset(){},configure(){}};
 const input=createTwinStickInput(),knobs={},cleanups=[];let enabled=false,mode='auto';
 const doc=host.ownerDocument??document,make=(tag,cls,text)=>{const node=doc.createElement(tag);node.className=cls;if(text)node.textContent=text;return node;};
 function paint(name){const state=input.getState()[name],knob=knobs[name];knob.style.transform=`translate(${state.x*34}px,${state.z*34}px)`;knob.parentElement.classList.toggle('engaged',Math.hypot(state.x,state.z)>0);}
 function reset(){input.reset();for(const name of ['move','aim'])paint(name);}
 function listen(node,name,callback,options){node.addEventListener(name,callback,options);cleanups.push(()=>node.removeEventListener(name,callback,options));}
 host.replaceChildren();
 for(const [name,label] of [['move','Move'],['aim','Aim + fire']]){
  const stick=make('div','touch-stick touch-stick-'+name);stick.setAttribute('role','group');stick.setAttribute('aria-label',name==='move'?'Movement thumbstick':'Aim and fire thumbstick');stick.dataset.stick=name;
  const track=make('span','touch-stick-track'),knob=make('span','touch-stick-knob'),caption=make('span','touch-stick-label',label);track.setAttribute('aria-hidden','true');knob.setAttribute('aria-hidden','true');stick.append(track,knob,caption);knobs[name]=knob;host.append(stick);
  const position=e=>{const rect=stick.getBoundingClientRect(),radius=Math.min(rect.width,rect.height)*.38;return {x:(e.clientX-rect.left-rect.width/2)/radius,z:(e.clientY-rect.top-rect.height/2)/radius};};
  listen(stick,'pointerdown',e=>{if(!enabled||!isRunning()||e.button>0)return;e.preventDefault();const p=position(e);if(!input.begin(name,e.pointerId,p.x,p.z))return;try{stick.setPointerCapture(e.pointerId);}catch{}paint(name);});
  listen(stick,'pointermove',e=>{const p=position(e);if(input.update(name,e.pointerId,p.x,p.z)){e.preventDefault();paint(name);}});
  const end=e=>{if(input.end(name,e.pointerId)){e.preventDefault();paint(name);}};listen(stick,'pointerup',end);listen(stick,'pointercancel',end);listen(stick,'lostpointercapture',end);
 }
 const actions=make('div','touch-actions');for(const [action,label] of [['interact','Interact'],['reload','Reload'],['weapon','Swap'],['knife','Melee']]){const button=make('button','touch-action');button.type='button';button.dataset.action=action;button.setAttribute('aria-label',label);const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg'),path=doc.createElementNS('http://www.w3.org/2000/svg','path');svg.setAttribute('viewBox','0 0 32 32');svg.setAttribute('aria-hidden','true');path.setAttribute('d',ICONS[action]);svg.append(path);button.append(svg,make('span','',label));listen(button,'click',()=>{if(enabled&&isRunning())onAction(action);});actions.append(button);}host.append(actions);
 function configure(next=mode){mode=next;const nextEnabled=shouldShowTouchControls(mode,device());if(nextEnabled!==enabled)reset();enabled=nextEnabled;host.hidden=!enabled;doc.body.classList.toggle('touch-controls-enabled',enabled);}
 configure();listen(globalThis,'blur',reset);listen(doc,'visibilitychange',()=>{if(doc.hidden)reset();});
 return {get enabled(){return enabled;},getState:()=>enabled?input.getState():{move:{x:0,z:0},aim:{x:0,z:0,active:false},firing:false},reset,configure,setInteractAvailable(available){actions.querySelector('[data-action="interact"]')?.classList.toggle('available',!!available);},dispose(){reset();cleanups.forEach(fn=>fn());doc.body.classList.remove('touch-controls-enabled');host.replaceChildren();}};
}
