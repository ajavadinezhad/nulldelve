const {test}=require('node:test'),assert=require('node:assert/strict');const {stickVector,createTwinStickInput,shouldShowTouchControls}=require('../src/touch-controls.js');
test('phone controls select automatically on touch hardware with explicit on/off overrides',()=>{assert.equal(shouldShowTouchControls('auto',{coarse:true}),true);assert.equal(shouldShowTouchControls('auto',{touchPoints:5}),true);assert.equal(shouldShowTouchControls('auto',{}),false);assert.equal(shouldShowTouchControls('on',{}),true);assert.equal(shouldShowTouchControls('off',{coarse:true,touchPoints:5}),false);});
test('stick deadzone ignores idle drift and clamps diagonals without losing analog speed',()=>{assert.deepEqual(stickVector(.04,.04),{x:0,z:0});const half=stickVector(.575,0);assert.ok(Math.abs(half.x-.5)<1e-8);const diagonal=stickVector(2,2);assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.z)-1)<1e-8);assert.deepEqual(stickVector(NaN,1),{x:0,z:0});});
test('two fingers move and aim/fire independently and releasing movement does not stop aiming',()=>{const input=createTwinStickInput();assert.equal(input.begin('move',1,1,0),true);assert.equal(input.begin('aim',2,0,-1),true);assert.deepEqual(input.getState().move,{x:1,z:0});assert.equal(input.getState().aim.z,-1);assert.equal(input.getState().firing,true);input.end('move',1);assert.deepEqual(input.getState().move,{x:0,z:0});assert.equal(input.getState().firing,true);input.end('aim',2);assert.equal(input.getState().firing,false);});
test('pointer capture ownership prevents a second finger hijacking an active stick and cancellation clears it',()=>{const input=createTwinStickInput();input.begin('move',10,.6,0);assert.equal(input.begin('move',11,-1,0),false);assert.equal(input.begin('aim',10,1,0),false);assert.equal(input.update('move',11,-1,0),false);assert.ok(input.getState().move.x>0);assert.equal(input.end('move',11),false);input.end('move',10);assert.deepEqual(input.getState().move,{x:0,z:0});input.begin('aim',11,1,0);input.reset();assert.equal(input.getState().firing,false);assert.equal(input.getState().aim.active,false);assert.equal(input.begin('move',11,0,1),true);});

test('outer movement ring sprints without requiring another finger and release clears sprint',()=>{const input=createTwinStickInput();input.begin('move',1,.6,0);assert.equal(input.getState().sprint,false);input.update('move',1,1,0);assert.equal(input.getState().sprint,true);input.begin('aim',2,0,-1);assert.equal(input.getState().sprint,true);assert.equal(input.getState().firing,true);input.end('move',1);assert.equal(input.getState().sprint,false);assert.equal(input.getState().firing,true);input.begin('move',3,1,0);input.reset();assert.equal(input.getState().sprint,false);});
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
  host.children[1].emit('pointerdown',{pointerId:2,clientX:48,clientY:48});
  assert.equal(controls.getState().firing,false);
  host.children[1].emit('pointermove',{pointerId:2,clientX:48,clientY:4});
  host.children[2].children[0].emit('pointerdown',{pointerId:3});
  assert.equal(controls.getState().firing,true);assert.equal(controls.getState().interactHeld,true);
  win.emit('resize');
  assert.deepEqual(controls.getState().move,{x:0,z:0});assert.equal(controls.getState().firing,false);assert.equal(controls.getState().interactHeld,false);
  assert.deepEqual(events,['interact','interactEnd']);
  host.children[2].children[0].emit('pointerup',{pointerId:3});assert.equal(events.length,2);
  controls.dispose();assert.equal(win.listeners.resize.length,0);
 }finally{globalThis.addEventListener=previousAdd;globalThis.removeEventListener=previousRemove;}
});

test('aiming uses an ammunition-safe inner zone and hysteresis at the fire ring',()=>{
 const input=createTwinStickInput();input.begin('aim',1,.55,0);assert.equal(input.getState().aim.active,true);assert.equal(input.getState().firing,false);
 input.update('aim',1,.9,0);assert.equal(input.getState().firing,false);
 input.update('aim',1,1,0);assert.equal(input.getState().firing,true);
 input.update('aim',1,.88,0);assert.equal(input.getState().firing,true);
 input.update('aim',1,.6,0);assert.equal(input.getState().firing,false);
 input.update('aim',1,.8,0);assert.equal(input.getState().firing,false);
 input.end('aim',1);assert.equal(input.getState().firing,false);
});
