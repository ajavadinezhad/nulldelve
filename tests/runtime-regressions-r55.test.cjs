const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {worldLandmarkVisible}=require('../src/world-landmarks.js');
const {safeRegroup,canCheckpoint}=require('../src/session-rules.js');
test('landmarks update after collection and never reveal clues or duplicate logical puzzle sockets',()=>{
 const devices=[{id:'log-a',kind:'log',active:false},{id:'artifact-a',kind:'artifact',active:false},{id:'clue-a',kind:'clue'},{id:'glyph-circle',kind:'glyph'},{id:'glyph-triangle',kind:'glyph'},{id:'power-a',kind:'power'},{id:'power-b',kind:'power'},{id:'valve-a',kind:'valve'},{id:'valve-b',kind:'valve'},...['hospitalValveA','hospitalValveB','hospitalValveC','freightSwitchA','freightSwitchB','signalMotorA','signalMotorB','signalMotorC'].map(task=>({id:task,kind:'task',task})),{id:'hospital-console',kind:'task',task:'hospitalSterile'},{id:'freight-console',kind:'task',task:'freightDispatch'},{id:'signal-console',kind:'task',task:'signalLoad'}];
 const shown=operation=>devices.filter(d=>worldLandmarkVisible(d,{operation})).map(d=>d.id);
 assert.deepEqual(shown('breach'),['log-a','artifact-a','glyph-circle']);
 assert.deepEqual(shown('hospital'),['log-a','artifact-a','hospital-console']);
 assert.deepEqual(shown('freight'),['log-a','artifact-a','freight-console']);
 assert.deepEqual(shown('signal'),['log-a','artifact-a','signal-console']);
 devices[0].active=devices[1].active=true;
 assert.deepEqual(shown('research'),['power-a']);assert.deepEqual(shown('containment'),['valve-a']);
 devices[0].active=false;assert.deepEqual(shown('research'),['log-a','power-a']);
});
test('only an explicitly rested wave with no live threats permits an in-combat checkpoint',()=>{
 const player={x:0,z:0,hp:100},zone={status:'active',phaseRested:true,spawnTimer:3,queue:[{}],wave:[{hp:0}]};
 const allowed=(zones=[zone],enemies=[])=>canCheckpoint({active:true,ended:false,player,enemies,zones});
 assert.equal(safeRegroup([zone],[],player),true);assert.equal(allowed(),true);
 for(const patch of [{phaseRested:false},{spawnTimer:2.5},{queue:[]},{wave:[{hp:1}]}])assert.equal(allowed([{...zone,...patch}]),false,JSON.stringify(patch));
 assert.equal(allowed([zone,{...zone,phaseRested:false}]),false);
 assert.equal(allowed([zone],[{hp:1,x:7.99,z:0}]),false);
 assert.equal(allowed([zone],[{hp:0,x:0,z:0}]),true);
 assert.equal(allowed([zone],[{hp:1,x:8,z:0}]),true);
 assert.equal(safeRegroup([],[],player),false);assert.equal(allowed([]),true);
 for(const patch of [{active:false},{ended:true},{player:{...player,hp:0}}])assert.equal(canCheckpoint({active:true,ended:false,player,enemies:[],zones:[zone],...patch}),false);
});
test('unchanged live HUD does not repeat DOM writes, but ammo, items, reserve and bindings refresh',()=>{
 const source=fs.readFileSync(new URL('../src/main.js',`file://${__filename}`),'utf8'),start=source.indexOf('function hud()'),end=source.indexOf('\nfunction end(',start);assert.ok(start>=0&&end>start);
 let writes=0,previews=0;const elements=new Map(),node=()=>new Proxy({style:new Proxy({}, {set(o,k,v){writes++;o[k]=v;return true;}}),classList:{toggle(){writes++;}},setAttribute(){writes++;}}, {set(o,k,v){writes++;o[k]=v;return true;}}),binding={medkit:'KeyQ',grenade:'KeyG'};
 const ctx={selected:0,player:{hp:100,maxHp:100,ammo:30},reload:0,weapons:[{capacity:30,reserve:60,name:'Rifle'}],economy:{state:{credits:150,shield:0,items:{medkit:0,grenade:0,fireGrenade:0},grenadeType:'frag'}},seenRooms:new Set(),roomDefs:[{}],bindings:()=>binding,showWeaponPreview:()=>previews++,equippedModelType:()=>0,itemIconPath:x=>x,formatKey:x=>x,$:id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id);}};
 vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);vm.runInContext('hud()',ctx);const first=writes;assert.ok(first>0);assert.equal(previews,1);
 for(let i=0;i<30;i++)vm.runInContext('hud()',ctx);assert.equal(writes,first);assert.equal(previews,1);
 for(const change of [()=>ctx.player.ammo--,()=>ctx.weapons[0].reserve--,()=>ctx.economy.state.items.medkit++,()=>binding.medkit='KeyF',()=>ctx.reload=1]){const before=writes;change();vm.runInContext('hud()',ctx);assert.ok(writes>before);const after=writes;vm.runInContext('hud()',ctx);assert.equal(writes,after);}
 assert.equal(elements.get('#reserve').textContent,'RELOADING…');
});
