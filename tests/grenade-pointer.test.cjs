const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 const handlers={},windowHandlers={},events=[],elements=new Map();let running=true;
 const button={addEventListener:(type,fn)=>handlers[type]=fn,setPointerCapture:id=>events.push('capture:'+id)};
 const get=selector=>selector==='#use-grenade'?button:(elements.has(selector)?elements.get(selector):elements.set(selector,{}).get(selector));
 const context={$:get,isRunning:()=>running,beginGrenadeCharge:()=>events.push('begin'),releaseGrenadeCharge:()=>events.push('release'),cancelGrenadeCharge:()=>events.push('cancel'),throwGrenade:()=>events.push('throw'),useMedkit(){},renderer:{domElement:{focus(){}}},window:{addEventListener:(type,fn)=>windowHandlers[type]=fn}};
 const source=fs.readFileSync('src/main.js','utf8'),start=source.indexOf("$('#use-medkit').onclick="),end=source.indexOf('\n',source.indexOf("window.addEventListener('resize',cancelGrenadePointer);",start));
 assert.ok(start>=0&&end>start,'extract the live grenade button handlers');vm.runInNewContext(source.slice(start,end),context);
 return {events,setRunning:value=>running=value,emit(type,id){handlers[type]({type,pointerId:id,button:0,preventDefault(){}});},resize(){windowHandlers.resize({type:'resize'});},click(detail){button.onclick({detail});}};
}
test('secondary fingers cannot take over, throw, or cancel a held grenade',()=>{
 const h=setup();h.emit('pointerdown',1);h.emit('pointerdown',2);h.emit('pointerup',2);h.emit('pointercancel',2);h.emit('lostpointercapture',2);
 assert.deepEqual(h.events,['capture:1','begin']);h.emit('pointerup',1);h.emit('lostpointercapture',1);h.emit('pointerup',1);
 assert.deepEqual(h.events,['capture:1','begin','release']);
});
test('owner cancellation never throws and frees the button for another finger',()=>{
 const h=setup();h.emit('pointerdown',3);h.emit('pointercancel',3);h.emit('pointerup',3);h.emit('pointerdown',4);h.emit('pointerup',4);
 assert.deepEqual(h.events,['capture:3','begin','cancel','capture:4','begin','release']);
});
test('viewport rotation cancels a charge and the stale release cannot throw it',()=>{
 const h=setup();h.emit('pointerdown',5);h.resize();h.emit('pointerup',5);h.emit('pointerdown',6);h.emit('pointerup',6);
 assert.deepEqual(h.events,['capture:5','begin','cancel','capture:6','begin','release']);
});
test('a paused release cancels, while keyboard activation still throws once',()=>{
 const h=setup();h.emit('pointerdown',7);h.setRunning(false);h.emit('pointerup',7);h.click(0);h.setRunning(true);h.click(1);h.click(0);
 assert.deepEqual(h.events,['capture:7','begin','cancel','throw']);
});
