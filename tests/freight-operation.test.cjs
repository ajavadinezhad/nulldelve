const {test}=require('node:test'),assert=require('node:assert/strict');
const {createProgression,freightTrackTarget}=require('../src/progression.js'),{deployCampaignOperation,isCampaignOperationUnlocked,campaignOperationObjectivesComplete,campaignOperationComplete,campaignOperationExit}=require('../src/campaign-operations.js');
function setup(remix=false,difficulty='normal'){const doors=Array.from({length:32},()=>({})),enemies=[],player={x:162,z:57,intel:false},puzzle={plates:[],crates:[]},p=createProgression({doors,enemies,remix,getDifficulty:()=>difficulty,spawnEnemy:(x,z,variant)=>{const e={id:'f'+enemies.length,x,z,variant,hp:2};enemies.push(e);return e;}});assert.equal(deployCampaignOperation('freight',{doors,enemies,player,puzzle,progression:p}),true);return {doors,enemies,player,puzzle,p};}
function use(s,id){const d=s.p.state.devices.find(d=>d.id===id);Object.assign(s.player,{x:d.x,z:d.z});assert.ok(s.p.interact(s.player));}
function clear(s,id,x,z){Object.assign(s.player,{x,z});s.p.update(s.player,.01);const wave=s.p.state.zones.find(w=>w.id===id);assert.equal(wave.status,'active');for(let i=0;i<100&&wave.status==='active';i++){wave.wave.forEach(e=>e.hp=0);s.p.update(s.player,4);}assert.equal(wave.status,'cleared');}
function routeReady(s){clear(s,'freight-pumps',162,30);use(s,'freight-pump');clear(s,'freight-yard',186,30);}
test('freight unlocks after Hospital and its transfer stays sealed in older operations',()=>{assert.equal(isCampaignOperationUnlocked('freight',['breach','command','research','containment','nest']),false);assert.equal(isCampaignOperationUnlocked('freight',['breach','command','research','containment','nest','hospital']),true);const s=setup();assert.equal(s.doors[26].progressLocked,false);deployCampaignOperation('hospital',{doors:s.doors,player:s.player,puzzle:s.puzzle,progression:s.p});assert.equal(s.doors[26].progressLocked,true);});
test('pump and cargo dispatch cannot skip their staged threats or create repeatable alarm waves',()=>{const s=setup();use(s,'freight-pump');assert.equal(s.p.state.operationTasks.freightDrain,false);routeReady(s);const count=s.enemies.length;for(let i=0;i<4;i++)use(s,'freight-dispatch');assert.equal(s.p.state.operationTasks.freightRoute.running,false);assert.equal(s.enemies.length,count);assert.equal(s.doors[31].progressLocked,true);});
test('normal and Remix rail routes are simultaneous settings, persist mid-transfer and lock during motion',()=>{for(const remix of [false,true]){const s=setup(remix);routeReady(s);for(const i of [1,0])if(freightTrackTarget(remix)[i])use(s,['freight-switch-a','freight-switch-b'][i]);use(s,'freight-dispatch');s.p.update(s.player,1);const saved=s.p.serializeState(),remaining=saved.operationTasks.freightRoute.remaining,positions=[...saved.operationTasks.freightRoute.switches];use(s,'freight-switch-a');assert.deepEqual(s.p.state.operationTasks.freightRoute.switches,positions);assert.equal(s.p.restoreState(saved,new Map(s.enemies.map(e=>[e.id,e]))),true);s.p.update(s.player,remaining);assert.equal(s.p.state.operationTasks.freightDispatch,true);assert.equal(s.doors[31].progressLocked,false);assert.equal(s.p.state.operationTasks.freightRoute.running,false);}});
test('manifest and deliberate Rail Control departure finish the route only after Cold Chain clears',()=>{const s=setup();routeReady(s);use(s,'freight-switch-a');use(s,'freight-dispatch');s.p.update(s.player,8);use(s,'freight-manifest');assert.equal(s.p.state.operationTasks.freightManifest,false);clear(s,'freight-cold',186,10);use(s,'freight-manifest');use(s,'freight-release');const context={player:s.player,progression:s.p};assert.equal(campaignOperationObjectivesComplete('freight',context),true);assert.equal(campaignOperationComplete('freight',context),false);Object.assign(s.player,campaignOperationExit('freight'));assert.equal(campaignOperationComplete('freight',context),true);});
test('malformed cargo transfer checkpoints are rejected before changing live progression',()=>{const s=setup(),before=s.p.serializeState();for(const modify of [t=>t.freightRoute.remaining=2,t=>t.freightRoute.switches=[3,0],t=>{t.freightRoute.delivered=true;t.freightDispatch=true;},t=>t.freightRelease=true]){const bad=structuredClone(before);modify(bad.operationTasks);assert.equal(s.p.restoreState(bad,new Map()),false);assert.deepEqual(s.p.serializeState(),before);}});

test('freight door guidance points to dispatch once the route is correctly set',()=>{const s=setup();routeReady(s);assert.equal(s.p.getDoorLead(31).x,164);use(s,'freight-switch-a');assert.equal(s.p.getDoorLead(31).x,189);use(s,'freight-dispatch');assert.equal(s.p.getDoorLead(31).x,189);});


test('Freight resumes cargo and lockdown checkpoints in fresh sessions across all difficulty and Remix variants',()=>{
 for(const difficulty of ['easy','normal','hard'])for(const remix of [false,true]){
  let s=setup(remix,difficulty);routeReady(s);
  for(const [i,target]of freightTrackTarget(remix).entries())if(target)use(s,['freight-switch-a','freight-switch-b'][i]);
  use(s,'freight-dispatch');s.p.update(s.player,2.5);
  const moving=s.p.serializeState();s=setup(remix,difficulty);
  assert.equal(s.p.restoreState(moving,new Map()),true);
  Object.assign(s.player,{x:180,z:29});assert.equal(s.p.getPrompt(s.player),'CARGO TRANSFER · TRACKS INTERLOCKED');
  s.p.update(s.player,moving.operationTasks.freightRoute.remaining);
  assert.equal(s.doors[31].progressLocked,false);
  assert.equal(s.p.getPrompt(s.player),'CARGO ROUTE SEALED');
  Object.assign(s.player,{x:186,z:10});s.p.update(s.player,.01);
  const fighting=s.p.serializeState();assert.equal(fighting.zones.find(z=>z.id==='freight-cold').status,'active');
  // Missing enemy references must requeue opposition rather than release the arena.
  s=setup(remix,difficulty);assert.equal(s.p.restoreState(fighting,new Map()),true);
  assert.equal(s.doors[31].progressLocked,true);
  clear(s,'freight-cold',186,10);use(s,'freight-manifest');use(s,'freight-release');
  assert.equal(campaignOperationObjectivesComplete('freight',{player:s.player,progression:s.p}),true);
  Object.assign(s.player,campaignOperationExit('freight'));assert.equal(campaignOperationComplete('freight',{player:s.player,progression:s.p}),true);
 }
});

test('automatic freight transfer completes promptly and legacy longer transfers still restore',()=>{const s=setup();routeReady(s);use(s,'freight-switch-a');use(s,'freight-dispatch');assert.equal(s.p.state.operationTasks.freightRoute.remaining,3);const saved=s.p.serializeState();saved.operationTasks.freightRoute.remaining=7;assert.equal(s.p.restoreState(saved,new Map(s.enemies.map(e=>[e.id,e]))),true);s.p.update(s.player,7);assert.equal(s.p.state.operationTasks.freightDispatch,true);});
