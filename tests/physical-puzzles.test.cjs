const {test}=require('node:test'),assert=require('node:assert/strict');
const {initialMechanism,mechanismAction,mechanismSolved,mechanismStateValid,mechanismPanel,nextMechanismAction}=require('../src/physical-puzzles.js');
const states=(count,max)=>Array.from({length:max**count},(_,n)=>({positions:Array.from({length:count},(_,i)=>Math.floor(n/max**i)%max)}));
test('physical inputs are local reversible state, not a prefix that resets after a wrong action',()=>{
 for(const [kind,count,max]of [['glyphs',3,4],['routing',3,2],['valves',2,4]]){
  const initial=initialMechanism(kind);assert.equal(mechanismStateValid(kind,initial),true);assert.equal(mechanismSolved(kind,initial),false);
  for(let i=0;i<count;i++){const next=mechanismAction(kind,initial,i);assert.deepEqual(initial.positions,Array(count).fill(0),'action must not mutate a checkpoint object');assert.deepEqual(next.positions,initial.positions.map((v,j)=>j===i?1:0));let roundtrip=next;for(let j=1;j<max;j++)roundtrip=mechanismAction(kind,roundtrip,i);assert.deepEqual(roundtrip,initial);}
  const a=mechanismAction(kind,mechanismAction(kind,initial,0),1),b=mechanismAction(kind,mechanismAction(kind,initial,1),0);assert.deepEqual(a,b,'order does not matter for physical apparatus');
  for(const bad of [-1,count,NaN,'0',null])assert.equal(mechanismAction(kind,initial,bad),null);
 }
});
test('every reachable apparatus state remains recoverable without reset in normal and remixed equipment',()=>{
 for(const remix of [false,true])for(const [kind,count,max]of [['glyphs',3,4],['routing',3,2],['valves',2,4]])for(let value of states(count,max)){
  let presses=0;while(!mechanismSolved(kind,value,remix)&&presses<12){const index=nextMechanismAction(kind,value,remix);assert.equal(Number.isInteger(index),true);value=mechanismAction(kind,value,index);presses++;}
  assert.equal(mechanismSolved(kind,value,remix),true,kind+' apparatus became unrecoverable');assert.equal(nextMechanismAction(kind,value,remix),null);
 }
});
test('live pressure and current are causal readings, with no next-input or answer fields',()=>{
 const zero=initialMechanism('routing'),on0=mechanismAction('routing',zero,0),on2=mechanismAction('routing',on0,2);
 assert.equal(mechanismPanel('routing',on0).instrument.reading,2);assert.equal(mechanismPanel('routing',on2).instrument.reading,6);assert.equal(mechanismSolved('routing',on2),true);assert.equal(mechanismSolved('routing',on2,true),false);
 const overload=mechanismAction('routing',on2,1);assert.equal(mechanismPanel('routing',overload).instrument.reading,9);assert.equal(mechanismSolved('routing',overload),false);
 let relief=initialMechanism('valves');relief=mechanismAction('valves',relief,0);assert.equal(mechanismPanel('valves',relief).instrument.reading,7);relief=mechanismAction('valves',relief,0);assert.equal(mechanismPanel('valves',relief).instrument.reading,5);assert.equal(mechanismSolved('valves',relief),false,'safe pressure without flow must not open the door');
 const feed=mechanismAction('valves',relief,1);assert.equal(mechanismPanel('valves',feed).instrument.reading,6);assert.equal(mechanismPanel('valves',feed).instrument.flow,true);
 for(const kind of ['glyphs','routing','valves']){const view=JSON.stringify(mechanismPanel(kind,initialMechanism(kind)));assert.doesNotMatch(view,/sequence|solution|nextAction|target/i);}
});
test('malformed mechanism checkpoints are rejected without coercion',()=>{
 for(const kind of ['glyphs','routing','valves'])for(const value of [null,{},[],{positions:[]},{positions:[NaN,0,0]},{positions:[1.2,0,0]},{positions:['1',0,0]},{positions:[-1,0,0]},{positions:[4,0,0]}])assert.equal(mechanismStateValid(kind,value),false);
 assert.equal(mechanismAction('unknown',{positions:[]},0),null);assert.equal(mechanismSolved('unknown',{positions:[]}),false);
});
test('world lamps and progress retain the actual partial physical settings after checkpoint restore',()=>{
 const {createProgression}=require('../src/progression.js');
 for(const kind of ['glyph','power','valve']){const p=createProgression({doors:[],enemies:[],spawnEnemy:()=>null}),device=p.state.devices.find(d=>d.kind===kind);p.interact(device);const before=p.state.devices.filter(d=>d.kind===kind).map(d=>[d.id,d.active,d.progress]),saved=p.serializeState(),other=createProgression({doors:[],enemies:[],spawnEnemy:()=>null});assert.equal(other.restoreState(saved,new Map()),true);assert.deepEqual(other.state.devices.filter(d=>d.kind===kind).map(d=>[d.id,d.active,d.progress]),before);}
});
