const {test}=require('node:test'),assert=require('node:assert/strict');
const {createPuzzleSettingsUI}=require('../src/puzzle-settings-ui.js');
const {createHardwareControl}=require('../src/puzzle-hardware.js');
class Node{
 constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.dataset={};this.hidden=false;this.disabled=false;this.isConnected=true;this.parent=null;this.style={setProperty(){}};const classes=new Set();this.classList={add:v=>classes.add(v),remove:v=>classes.delete(v),toggle(v,on){const yes=on===undefined?!classes.has(v):on;if(yes)classes.add(v);else classes.delete(v);return yes;},contains:v=>classes.has(v)};}
 append(...nodes){for(const n of nodes)n.parent=this;this.children.push(...nodes);}
 replaceChildren(...nodes){for(const n of this.children)n.parent=null;this.children=[];this.append(...nodes);}
 setAttribute(k,v){this.attrs[k]=v;}
 getAttribute(k){return this.attrs[k]??null;}
 addEventListener(k,fn){this['on'+k]=fn;}
 focus(){for(let n=this;n;n=n.parent)if(n.hidden)return;global.document.activeElement=this;}
 querySelectorAll(selector){return all(this).slice(1).filter(n=>selector.split(',').includes(n.tag));}
}
function all(root){return [root,...root.children.flatMap(all)];}
function withDOM(run){const previous=global.document,body=new Node('body'),outside=new Node('button');body.append(outside);global.document={body,createElement:tag=>new Node(tag),activeElement:outside};try{return run({body,outside});}finally{global.document=previous;}}
function panel(){return {kind:'glyphs',mode:'actions',title:'Archive access',locked:false,complete:false,controls:[{id:'glyph-circle',style:'key',label:'Circle',symbol:'circle',active:false},{id:'glyph-triangle',style:'key',label:'Triangle',symbol:'triangle',active:false},{id:'glyph-square',style:'key',label:'Square',symbol:'square',active:false}]};}
function event(code,shiftKey=false){return {code,shiftKey,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};}
test('action banks invoke the controller and show only accepted/rejected current feedback, with no native ranges or targets',()=>withDOM(({body})=>{
 const data=panel(),calls=[];let closed=0;const ui=createPuzzleSettingsUI({getPanel:()=>data,onPress:(kind,index)=>{calls.push([kind,index]);const accepted=index!==1;data.controls[index].active=accepted;return {ok:true,accepted,complete:false};},onClose:()=>closed++});assert.equal(ui.open(),true);
 const nodes=all(body),buttons=nodes.filter(n=>n.className==='puzzle-hardware-button'),status=nodes.find(n=>n.className==='puzzle-settings-status'),test=nodes.find(n=>n.className==='puzzle-settings-test');assert.equal(buttons.length,3);assert.equal(test.hidden,true);assert.ok(!nodes.some(n=>n.tag==='input'||/target|solution|correct order/i.test(n.textContent??'')));
 buttons[0].onclick();assert.deepEqual(calls,[['glyphs',0]]);assert.equal(status.textContent,'Accepted');assert.equal(buttons[0].dataset.feedback,'accepted');assert.equal(buttons[0].attrs['aria-pressed'],'true');buttons[1].onclick();assert.equal(status.textContent,'Rejected');assert.equal(buttons[1].dataset.feedback,'rejected');assert.equal(buttons[0].dataset.feedback,'','old feedback does not imply another correct next input');assert.equal(ui.isOpen(),true);
 data.locked=true;ui.refresh();buttons[2].onclick();assert.equal(calls.length,2);assert.equal(buttons[2].disabled,true);assert.equal(closed,0);
}));
test('action panel keyboard focus wraps only through visible controls and Escape restores its opener',()=>withDOM(({body,outside})=>{
 const data=panel(),ui=createPuzzleSettingsUI({getPanel:()=>data,onPress:()=>({ok:true,accepted:true})});ui.open();const nodes=all(body),overlay=nodes.find(n=>n.className==='puzzle-settings-overlay'),close=nodes.find(n=>n.className==='puzzle-settings-close'),buttons=nodes.filter(n=>n.className==='puzzle-hardware-button');assert.equal(document.activeElement,close);
 const backwards=event('Tab',true);overlay.onkeydown(backwards);assert.equal(backwards.prevented,true);assert.equal(document.activeElement,buttons.at(-1),'hidden Test must never be a focus trap endpoint');const forwards=event('Tab');overlay.onkeydown(forwards);assert.equal(forwards.prevented,true);assert.equal(document.activeElement,close);
 overlay.onkeydown(event('Escape'));assert.equal(ui.isOpen(),false);assert.equal(document.activeElement,outside);assert.equal(overlay.hidden,true);
}));
test('a retained action cannot activate after the panel closes, and completing a control closes once',()=>withDOM(({body})=>{
 const data=panel();let calls=0,closed=0;const ui=createPuzzleSettingsUI({getPanel:()=>data,onPress:()=>{calls++;data.complete=true;data.locked=true;return {ok:true,accepted:true,complete:true};},onClose:()=>closed++});ui.open();const button=all(body).find(n=>n.className==='puzzle-hardware-button');ui.close();button.onclick();assert.equal(calls,0,'late clicks on closed controls must not mutate live puzzles');data.locked=false;data.complete=false;ui.open();all(body).find(n=>n.className==='puzzle-hardware-button').onclick();assert.equal(calls,1);assert.equal(ui.isOpen(),false);assert.equal(closed,2);
}));
test('coupling geometry reflects only current ports, and disabled mechanical controls never actuate',()=>withDOM(()=>{
 let calls=0;const h=createHardwareControl({style:'junction',label:'Rotate coupling'},()=>calls++);h.paint({active:false,ports:[0,3]},{locked:false});const ports=all(h.element).filter(n=>n.className==='hardware-coupling-port');assert.deepEqual(ports.map(n=>n.classList.contains('connected')),[true,false,false,true]);h.button.onclick();assert.equal(calls,1);h.paint({active:true,ports:[1,2]},{locked:true});assert.deepEqual(ports.map(n=>n.classList.contains('connected')),[false,true,true,false]);h.button.onclick();assert.equal(calls,1);
}));
