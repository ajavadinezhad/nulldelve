const {test}=require('node:test'),assert=require('node:assert/strict');const {stickVector,createTwinStickInput,shouldShowTouchControls}=require('../src/touch-controls.js');
test('phone controls select automatically on touch hardware with explicit on/off overrides',()=>{assert.equal(shouldShowTouchControls('auto',{coarse:true}),true);assert.equal(shouldShowTouchControls('auto',{touchPoints:5}),false);assert.equal(shouldShowTouchControls('auto',{}),false);assert.equal(shouldShowTouchControls('on',{}),true);assert.equal(shouldShowTouchControls('off',{coarse:true,touchPoints:5}),false);});
test('stick deadzone ignores idle drift and clamps diagonals without losing analog speed',()=>{assert.deepEqual(stickVector(.04,.04),{x:0,z:0});const half=stickVector(.575,0);assert.ok(Math.abs(half.x-.5)<1e-8);const diagonal=stickVector(2,2);assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.z)-1)<1e-8);assert.deepEqual(stickVector(NaN,1),{x:0,z:0});});
test('two fingers move and aim independently and releasing movement does not stop aiming',()=>{const input=createTwinStickInput();assert.equal(input.begin('move',1,1,0),true);assert.equal(input.begin('aim',2,0,-1),true);assert.deepEqual(input.getState().move,{x:1,z:0});assert.equal(input.getState().aim.z,-1);assert.equal(input.getState().firing,false);input.end('move',1);assert.deepEqual(input.getState().move,{x:0,z:0});assert.equal(input.getState().firing,false);input.end('aim',2);assert.equal(input.getState().firing,false);});
test('pointer capture ownership prevents a second finger hijacking an active stick and cancellation clears it',()=>{const input=createTwinStickInput();input.begin('move',10,.6,0);assert.equal(input.begin('move',11,-1,0),false);assert.equal(input.begin('aim',10,1,0),false);assert.equal(input.update('move',11,-1,0),false);assert.ok(input.getState().move.x>0);assert.equal(input.end('move',11),false);input.end('move',10);assert.deepEqual(input.getState().move,{x:0,z:0});input.begin('aim',11,1,0);input.reset();assert.equal(input.getState().firing,false);assert.equal(input.getState().aim.active,false);assert.equal(input.begin('move',11,0,1),true);});

test('outer movement ring sprints without requiring another finger and release clears sprint',()=>{const input=createTwinStickInput();input.begin('move',1,.6,0);assert.equal(input.getState().sprint,false);input.update('move',1,1,0);assert.equal(input.getState().sprint,true);input.begin('aim',2,0,-1);assert.equal(input.getState().sprint,true);assert.equal(input.getState().firing,false);input.end('move',1);assert.equal(input.getState().sprint,false);assert.equal(input.getState().firing,false);input.begin('move',3,1,0);input.reset();assert.equal(input.getState().sprint,false);});
test('phone interaction labels describe the nearby action while retaining full device context',()=>{const {touchInteractionContext}=require('../src/touch-controls.js');for(const [prompt,label] of [['E · OPEN DOOR','Open'],['F · CLOSE DOOR','Close'],['E · READ REACTOR PLAQUE','Read'],['E · REREAD RESEARCH LOG 1','Read'],['E · ROTATE JUNCTION A · QUARTER TURN','Rotate'],['E · LEAVE SECTOR','Exit'],['E · EVACUATE','Exit'],['E · LOCKED · MISSING RELICS','Locked'],['E · INSERT SERVICE FUSE','Insert'],['E · CHARGE SIGNAL RELAY A','Charge']]){const context=touchInteractionContext(prompt);assert.equal(context.label,label);assert.equal(context.available,true);assert.equal(context.description,prompt.slice(prompt.indexOf(' · ')+3));}assert.deepEqual(touchInteractionContext(''),{label:'Interact',description:'Interact',available:false});assert.equal(touchInteractionContext('CIPHER ACCEPTED').label,'Check');});

test('held Interact has one touch owner and releases on cancel/reset without replaying the action',()=>{const {createHeldInteraction}=require('../src/touch-controls.js'),events=[],hold=createHeldInteraction(()=>events.push('grab'),()=>events.push('release'));assert.equal(hold.begin(4),true);assert.equal(hold.begin(5),false);assert.equal(hold.end(5),false);assert.equal(hold.held,true);assert.equal(hold.end(4),true);assert.equal(hold.held,false);assert.deepEqual(events,['grab','release']);hold.begin(6);hold.reset();hold.end(6);assert.deepEqual(events,['grab','release','grab','release']);assert.equal(hold.held,false);});
test('phone crate prompts offer Grab before holding and Release during a grip',()=>{const {touchInteractionContext}=require('../src/touch-controls.js');assert.equal(touchInteractionContext('E · HOLD TO GRAB CRATE').label,'Grab');assert.equal(touchInteractionContext('E · RELEASE TO LET GO').label,'Release');});

test('invalid deadzones never produce reversed or non-finite stick input',()=>{for(const deadzone of [-1,1,2,NaN,Infinity])assert.deepEqual(stickVector(.8,.4,deadzone),{x:0,z:0});});

test('rotating the viewport releases actual captured sticks and held Interact',()=>{
 const {createTouchControls}=require('../src/touch-controls.js');
 class Node {
  constructor(){this.listeners={};this.children=[];this.style={};this.dataset={};this.classList={toggle(){},remove(){}};}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
  removeEventListener(type,fn){this.listeners[type]=(this.listeners[type]??[]).filter(f=>f!==fn);}
  emit(type,event={}){for(const fn of this.listeners[type]??[])fn({preventDefault(){},button:0,...event});}
  setAttribute(){} setPointerCapture(){} replaceChildren(){this.children=[];}
  append(...nodes){for(const node of nodes){node.parentElement=this;this.children.push(node);}}
  getBoundingClientRect(){return {left:0,top:0,width:96,height:96};}
 }
 const win=new Node(),doc=new Node();doc.body=new Node();doc.createElement=doc.createElementNS=()=>new Node();const host=new Node();host.ownerDocument=doc;
 const previousAdd=globalThis.addEventListener,previousRemove=globalThis.removeEventListener;
 globalThis.addEventListener=win.addEventListener.bind(win);globalThis.removeEventListener=win.removeEventListener.bind(win);
 try{
  const events=[],controls=createTouchControls({host,isRunning:()=>true,onAction:a=>events.push(a),device:()=>({coarse:true})});
  host.children[0].emit('pointerdown',{pointerId:1,clientX:90,clientY:48});
  assert.equal(host.children.some(n=>n.dataset.stick==='aim'),false);
  const actions=host.children.find(n=>n.className==='touch-actions');actions.children[0].emit('pointerdown',{pointerId:3});
  assert.equal(controls.getState().firing,false);assert.equal(controls.getState().interactHeld,true);
  const fireButton=host.children.find(n=>n.dataset.action==='fire');
  fireButton.emit('pointerdown',{pointerId:4});assert.equal(controls.getState().firing,true);
  fireButton.emit('pointerup',{pointerId:5});assert.equal(controls.getState().firing,true);
  fireButton.emit('pointercancel',{pointerId:4});assert.equal(controls.getState().firing,false);
  assert.equal(controls.getState().aim.active,false);assert.ok(controls.getState().move.x>0);
  fireButton.emit('pointerdown',{pointerId:6});assert.equal(controls.getState().firing,true);
  win.emit('resize');
  assert.deepEqual(controls.getState().move,{x:0,z:0});assert.equal(controls.getState().firing,false);assert.equal(controls.getState().interactHeld,false);
  assert.deepEqual(events,['interact','fire','fire','interactEnd']);
  actions.children[0].emit('pointerup',{pointerId:3});assert.equal(events.length,4);
  controls.dispose();assert.equal(win.listeners.resize.length,0);
 }finally{globalThis.addEventListener=previousAdd;globalThis.removeEventListener=previousRemove;}
});

test('aiming never fires, even at full stick deflection',()=>{
 const input=createTwinStickInput();input.begin('aim',1,.55,0);assert.equal(input.getState().aim.active,true);
 for(const [x,z] of [[1,0],[0,-1],[2,2],[-1,0]]){input.update('aim',1,x,z);assert.equal(input.getState().firing,false);}
 input.end('aim',1);assert.equal(input.getState().firing,false);
});

test('phone movement sets facing, independent aim overrides it, and idle keeps last direction',()=>{
 const {touchAimDirection}=require('../src/touch-controls.js'),input=createTwinStickInput();
 assert.equal(touchAimDirection(input.getState()),null);input.begin('move',1,.6,.6);const moving=touchAimDirection(input.getState());assert.ok(Math.abs(moving.x-Math.SQRT1_2)<1e-8);assert.ok(Math.abs(moving.z-Math.SQRT1_2)<1e-8);
 input.begin('aim',2,-1,0);assert.deepEqual(touchAimDirection(input.getState()),{x:-1,z:0});input.end('aim',2);assert.deepEqual(touchAimDirection(input.getState()),moving);input.end('move',1);assert.equal(touchAimDirection(input.getState()),null);assert.equal(touchAimDirection(null),null);assert.equal(touchAimDirection({move:{x:NaN,z:0}}),null);assert.equal(input.getState().firing,false);
});

function withTouchHarness(run,options={}){
 const {createTouchControls}=require('../src/touch-controls.js');
 class Node{
  constructor(){this.listeners={};this.children=[];this.style={};this.dataset={};this.classes=new Set();this.classList={toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name),remove:(...names)=>names.forEach(name=>this.classes.delete(name))};}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}removeEventListener(type,fn){this.listeners[type]=(this.listeners[type]??[]).filter(f=>f!==fn);}
  emit(type,event={}){for(const fn of this.listeners[type]??[])fn({preventDefault(){},button:0,...event});}
  setAttribute(){}setPointerCapture(){}replaceChildren(){this.children=[];}append(...nodes){for(const node of nodes){node.parentElement=this;this.children.push(node);}}
  getBoundingClientRect(){return {left:0,top:0,width:96,height:96};}
 }
 const win=new Node(),doc=new Node();doc.body=new Node();doc.createElement=doc.createElementNS=()=>new Node();const host=new Node();host.ownerDocument=doc;
 const previousAdd=globalThis.addEventListener,previousRemove=globalThis.removeEventListener,events=[];let running=true;
 globalThis.addEventListener=win.addEventListener.bind(win);globalThis.removeEventListener=win.removeEventListener.bind(win);
 const controls=createTouchControls({host,isRunning:()=>running,onAction:action=>events.push(action),device:()=>({coarse:true}),...options});
 try{run({controls,host,doc,win,events,setRunning:value=>{running=value;}});}finally{controls.dispose();globalThis.addEventListener=previousAdd;globalThis.removeEventListener=previousRemove;}
}
test('a brief Fire tap shoots once without needing a simulation sample or duplicating its click',()=>withTouchHarness(({controls,host,events})=>{
 const fire=host.children.find(n=>n.dataset.action==='fire');fire.emit('pointerdown',{pointerId:7});assert.deepEqual(events,['fire']);assert.equal(controls.getState().firing,true);
 fire.emit('pointerup',{pointerId:7});fire.emit('click',{detail:1});assert.equal(controls.getState().firing,false);assert.deepEqual(events,['fire']);
 fire.emit('click',{detail:0});assert.deepEqual(events,['fire','fire'],'keyboard activation remains a single explicit shot');
}));
test('disabled or stopped phone controls cannot start firing and disposal clears side/size classes',()=>withTouchHarness(({controls,host,doc,events,setRunning})=>{
 const fire=host.children.find(n=>n.dataset.action==='fire');controls.configure('on',{handedness:'left',size:'large'});assert.equal(doc.body.classes.has('touch-left-handed'),true);assert.equal(doc.body.classes.has('touch-large-controls'),true);
 fire.emit('pointerdown',{pointerId:1});assert.equal(controls.getState().firing,true);controls.configure('off');assert.equal(controls.getState().firing,false);fire.emit('pointerdown',{pointerId:2});fire.emit('click',{detail:0});assert.deepEqual(events,['fire']);
 controls.configure('on',{handedness:'left',size:'large'});setRunning(false);fire.emit('pointerdown',{pointerId:3});fire.emit('click',{detail:0});assert.equal(controls.getState().firing,false);assert.deepEqual(events,['fire']);
 controls.dispose();assert.equal(doc.body.classes.has('touch-controls-enabled'),false);assert.equal(doc.body.classes.has('touch-left-handed'),false);assert.equal(doc.body.classes.has('touch-large-controls'),false);
}));

test('a pointer ending outside controls releases its owner without stopping another finger',()=>withTouchHarness(({controls,host,win})=>{
 const move=host.children.find(n=>n.dataset.stick==='move'),fire=host.children.find(n=>n.dataset.action==='fire');
 move.emit('pointerdown',{pointerId:1,clientX:90,clientY:48});fire.emit('pointerdown',{pointerId:2});assert.equal(controls.getState().firing,true);
 win.emit('pointerup',{pointerId:2});assert.equal(controls.getState().firing,false);assert.ok(controls.getState().move.x>0);win.emit('pointercancel',{pointerId:1});assert.deepEqual(controls.getState().move,{x:0,z:0});
}));


test('holding Fire locks facing for retreat and strafe, releasing returns movement-facing immediately',()=>withTouchHarness(({controls,host,win})=>{
 const move=host.children.find(n=>n.dataset.stick==='move'),fire=host.children.find(n=>n.dataset.action==='fire');
 move.emit('pointerdown',{pointerId:1,clientX:90,clientY:48});fire.emit('pointerdown',{pointerId:2});
 assert.equal(controls.getState().facingLocked,true);assert.deepEqual(controls.getState().aim,{x:1,z:0,active:true});
 move.emit('pointermove',{pointerId:1,clientX:6,clientY:48});assert.ok(controls.getState().move.x<0);assert.deepEqual(controls.getState().aim,{x:1,z:0,active:true});
 fire.emit('pointerup',{pointerId:999});assert.equal(controls.getState().facingLocked,true);
 win.emit('pointerup',{pointerId:2});assert.equal(controls.getState().facingLocked,false);assert.equal(controls.getState().aim.active,false);assert.ok(controls.getState().move.x<0);
 fire.emit('pointerdown',{pointerId:3});assert.deepEqual(controls.getState().aim,{x:-1,z:0,active:true});win.emit('blur');assert.equal(controls.getState().facingLocked,false);assert.equal(controls.getState().firing,false);
}));

test('fresh movement beats a stale simulation-facing callback when Fire arrives in the same frame',()=>withTouchHarness(({controls,host})=>{
 const move=host.children.find(n=>n.dataset.stick==='move'),fire=host.children.find(n=>n.dataset.action==='fire');move.emit('pointerdown',{pointerId:1,clientX:90,clientY:48});fire.emit('pointerdown',{pointerId:2,clientX:20,clientY:20});assert.ok(controls.getState().aim.x>.99);assert.ok(Math.abs(controls.getState().aim.z)<.001);move.emit('pointermove',{pointerId:1,clientX:5,clientY:48});assert.ok(controls.getState().move.x<0);assert.ok(controls.getState().aim.x>.99);
 fire.emit('pointermove',{pointerId:2,clientX:20,clientY:-80});assert.ok(controls.getState().aim.z<-.8,'Fire drag retargets without needing to release');fire.emit('pointercancel',{pointerId:2});assert.equal(controls.getState().aim.active,false);assert.equal(controls.getState().firing,false);
},{getFacing:()=>({x:0,z:-1})}));
test('automatic hybrid controls follow real touch use and return to precise-input presentation',()=>withTouchHarness(({controls,host,win})=>{
 assert.equal(controls.enabled,false);win.emit('pointerdown',{pointerType:'touch'});assert.equal(controls.enabled,true);const fire=host.children.find(n=>n.dataset.action==='fire');fire.emit('pointerdown',{pointerId:8,clientX:20,clientY:20});assert.equal(controls.getState().firing,true);win.emit('pointerdown',{pointerType:'mouse'});assert.equal(controls.enabled,false);assert.equal(controls.getState().firing,false);controls.configure('on');win.emit('pointerdown',{pointerType:'mouse'});assert.equal(controls.enabled,true);controls.configure('off');win.emit('pointerdown',{pointerType:'touch'});assert.equal(controls.enabled,false);
},{device:()=>({coarse:false,touchPoints:5})}));
test('touch modality detection does not reset an already enabled stick on its first touch',()=>withTouchHarness(({controls,host,win})=>{host.children[0].emit('pointerdown',{pointerId:1,clientX:90,clientY:48});win.emit('pointerdown',{pointerType:'touch'});assert.ok(controls.getState().move.x>.9);}));
