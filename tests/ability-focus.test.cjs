const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('activating the HUD ability returns focus so the real keyboard handler accepts Fire',()=>{
 const source=fs.readFileSync('src/main.js','utf8'),button={},canvas={},keys=new Set();let focused=button,used=0;
 const ctx={$:()=>button,useFieldAbility:()=>used++,renderer:{domElement:{focus(){focused=canvas;}}}};vm.createContext(ctx);
 const binding=source.match(/\$\('#use-skill'\)\.onclick=.*;/)[0];vm.runInContext(binding,ctx);button.onclick();assert.equal(used,1);assert.equal(focused,canvas);
 let keydown;const keyCtx={addEventListener:(name,handler)=>{if(name==='keydown')keydown=handler;},audio:{unlock(){}},doorHint:null,helpOpen:false,puzzleSettings:null,menu:{isOpen:()=>false,settings:{aimMode:'mouse'}},bindings:()=>({fire:'Space'}),actionForCode:code=>code==='Space'?'fire':null,keys,active:true,paused:false,ended:false,mapOpen:false,isRunning:()=>true,tutorial:null};
 vm.createContext(keyCtx);const start=source.indexOf("addEventListener('keydown',e=>{"),end=source.indexOf("addEventListener('keyup'",start);vm.runInContext(source.slice(start,end),keyCtx);
 keydown({code:'Space',repeat:false,preventDefault(){},target:{closest:selector=>focused===button&&selector==='button'?button:null}});assert.equal(keys.has('Space'),true);
});
