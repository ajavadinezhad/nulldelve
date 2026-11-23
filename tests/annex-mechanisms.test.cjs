const {test}=require('node:test'),assert=require('node:assert/strict');
const {annexMechanismPanel,annexMechanismSolved,nextAnnexMechanismAction}=require('../src/annex-mechanisms.js');
test('hospital controls cause observable pressure and flow without an undisclosed exact-setting oracle',()=>{
 const initial=annexMechanismPanel('pressure',[0,0,0]).instrument,oxygen=annexMechanismPanel('pressure',[1,0,0]).instrument,filter=annexMechanismPanel('pressure',[1,1,0]).instrument,vent=annexMechanismPanel('pressure',[1,1,1]).instrument;assert.equal(oxygen.reading-initial.reading,3);assert.equal(filter.reading-oxygen.reading,2);assert.equal(vent.reading-filter.reading,-3);assert.equal(initial.flow,false);assert.equal(filter.flow,true);assert.equal(annexMechanismSolved('pressure',[2,1,0]),true);assert.equal(annexMechanismSolved('pressure',[1,2,1],true),true);assert.equal(annexMechanismSolved('pressure',[2,2,2],true),true,'physically equivalent valid operating configurations are accepted');
});
test('feeders expose actual loads and both capacity limits while keeping all motors required',()=>{
 const p=annexMechanismPanel('feeders',[0,0,1]);assert.deepEqual(p.controls.map(c=>c.load),[2,3,4]);assert.deepEqual(p.instrument.channels.map(c=>[c.reading,c.safeMax]),[[5,5],[4,4]]);assert.equal(annexMechanismSolved('feeders',[0,0,1]),true);assert.equal(annexMechanismSolved('feeders',[-1,0,1]),false);assert.equal(annexMechanismSolved('feeders',[0,0,0]),false);assert.equal(annexMechanismSolved('feeders',[0,1,0],true),true);
});
test('rail sections show both physical branches and selected buffers/through-lines, without next-input fields',()=>{
 const p=annexMechanismPanel('tracks',[0,0]);assert.equal(p.instrument.sections[0].branches.find(b=>b.selected).continues,false);assert.equal(p.instrument.sections[1].branches.find(b=>b.selected).continues,true);assert.equal(annexMechanismSolved('tracks',[1,0]),true);assert.equal(annexMechanismSolved('tracks',[0,1],true),true);assert.ok(!/solution|target|correct|next/i.test(JSON.stringify(p)));
});
test('every annex configuration stays recoverable and paid guidance only supplies a requested adjustment',()=>{
 for(const remix of [false,true])for(const [kind,count,max]of [['pressure',3,2],['feeders',3,1],['tracks',2,1]])for(let code=0;code<(max+1)**count;code++){
  let n=code,values=Array.from({length:count},()=>{const v=n%(max+1);n=Math.floor(n/(max+1));return v;});const start=[...values];for(let i=0;i<10&&!annexMechanismSolved(kind,values,remix);i++){const next=nextAnnexMechanismAction(kind,values,remix);assert.ok(next);values[next.index]=next.value;}assert.equal(annexMechanismSolved(kind,values,remix),true,`${kind} ${start}`);
 }
});
