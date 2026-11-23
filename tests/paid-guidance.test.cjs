const {test}=require('node:test'),assert=require('node:assert/strict');
const {nextGuidanceStep,puzzleStatusFeedback,GUIDANCE_COST}=require('../src/paid-guidance.js');
const {createProgression}=require('../src/progression.js');
const {createPressurePuzzle,updatePressurePuzzle}=require('../src/pressure-puzzle.js');
const {deployCampaignOperation,campaignOperationObjectivesComplete,CAMPAIGN_OPERATIONS}=require('../src/campaign-operations.js');
const {createEconomy}=require('../src/economy.js');
const {createCampaignProfile}=require('../src/campaign-profile.js');
function setup(operation,remix=false){const enemies=[],doors=Array.from({length:38},()=>({})),puzzle=createPressurePuzzle(),player={},progression=createProgression({doors,enemies,remix,spawnEnemy:(x,z,variant)=>{const e={x,z,variant,hp:2,id:'e'+enemies.length};enemies.push(e);return e;}});assert.equal(deployCampaignOperation(operation,{player,puzzle,progression,doors}),true);return {operation,mission:'campaign',player,puzzle,progression,enemies};}
test('camera resolver takes every operation through its actual puzzle and route actions, normal and remix',()=>{
 for(const remix of [false,true])for(const {id:operation}of CAMPAIGN_OPERATIONS){const c=setup(operation,remix);let exited=false;
  for(let n=0;n<2500;n++){
   const step=nextGuidanceStep(c);assert.ok(step,operation+' missing step');assert.ok(Number.isFinite(step.x)&&Number.isFinite(step.z));Object.assign(c.player,{x:step.x,z:step.z});
   if(step.id==='exit'){assert.ok(campaignOperationObjectivesComplete(operation,c),operation+' exited before objectives');exited=true;break;}
   if(step.id==='insertion'){const plate=c.puzzle.plates.find(p=>!p.active),crate=c.puzzle.crates.find(p=>!p.seated);Object.assign(crate,{x:plate.x,z:plate.z});updatePressurePuzzle(c.puzzle);}
   else if(step.id==='intel')c.player.intel=true;
   else if(!step.id.startsWith('fight-'))c.progression.interact(c.player);
   c.enemies.forEach(e=>e.hp=0);c.progression.update(c.player,1);
  }
  assert.ok(exited,operation+' guidance did not reach exit, remix='+remix+' step='+JSON.stringify(nextGuidanceStep(c)));
 }
});
test('a simple puzzle returns only the next live control, adapts after input and never solves it',()=>{const c=setup('breach');c.puzzle.solved=true;const first=nextGuidanceStep(c);assert.equal(first.id,'glyph-circle');assert.equal(c.progression.state.archive.input.length,0);c.progression.interact(first);assert.equal(nextGuidanceStep(c).id,'glyph-triangle');assert.equal(c.progression.state.archive.solved,false);});
test('camera assistance charges fixed cash, rejects insufficient funds, and stays out of shop offers',()=>{assert.equal(GUIDANCE_COST,20);const e=createEconomy({credits:25});assert.ok(!e.getOffers().some(o=>o.id==='guidance'));assert.equal(e.purchase('guidance').ok,true);assert.equal(e.state.credits,5);assert.equal(e.purchase('guidance').ok,false);assert.equal(e.state.credits,5);});
function storage(){const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};}
test('camera spending survives an older checkpoint and profile reopen',async()=>{const store=storage(),e=createEconomy(),p=createCampaignProfile({storage:store,economy:e});p.persist();const checkpoint={economy:e.serialize(),profileRevision:p.state.revision,profilePurchaseRevision:p.state.purchaseRevision};assert.equal((await p.purchaseOffer('guidance')).ok,true);assert.equal(e.state.credits,130);assert.equal(p.hasPurchasesSince(checkpoint),true);p.restoreCheckpointEconomy(checkpoint.economy);assert.equal(e.state.credits,130);const other=createEconomy(),reopened=createCampaignProfile({storage:store,economy:other});assert.equal(other.state.credits,130);});
test('unpaid feedback never points to a location or correct input',()=>{for(const text of ['MISSING FUSE · SEARCH PHARMACY','ISOLATE BOTH ANTENNA FEEDS AND CLEAR THE DEFENSE','A → B → A','Follow the yellow cable','RELIC RECOVERED · 1 / 3'])assert.doesNotMatch(puzzleStatusFeedback(text),/PHARMACY|ANTENNA|→|yellow|1 \/ 3/);assert.equal(puzzleStatusFeedback('INPUT REJECTED'),'INPUT REJECTED');});

test('live camera button coalesces rapid taps, charges before showing, and handles rejection',async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),source=fs.readFileSync('src/main.js','utf8'),at=source.indexOf("$('#replay-guidance').onclick="),end=source.indexOf("\n$('#switch-grenade')",at);assert.ok(at>0&&end>at);
 for(const fail of [false,true]){
  const c=setup('breach'),button={},e=createEconomy({credits:25});let unblock,shows=0,charges=0;
  const gate=new Promise(resolve=>unblock=resolve),noop=()=>{},ctx={...c,runConfig:{operation:c.operation,mission:c.mission},GUIDANCE_COST,nextGuidanceStep,guidanceBusy:false,$:()=>button,isRunning:()=>!ctx.guidanceBusy,campaignProfile:{flushRewards:()=>gate,purchaseOffer:async id=>{charges++;return fail?{ok:false,message:'Unavailable'}:e.purchase(id);}},touchControls:{reset:noop},keys:new Set(['KeyW']),shooting:true,burstFire:{cancel:noop},grenadeActions:{cancel:noop},doorHint:{repeat(){shows++;assert.equal(e.state.credits,5,'camera must not reveal before payment');return true;}},hud:noop,updateDeploymentTransfer:noop,queueCheckpoint:noop,toast:noop,renderer:{domElement:{focus:noop}}};vm.createContext(ctx);vm.runInContext(source.slice(at,end),ctx);
  const first=button.onclick(),second=button.onclick();assert.equal(ctx.guidanceBusy,true);assert.equal(shows,0);unblock();await Promise.all([first,second]);assert.equal(charges,1);assert.equal(shows,fail?0:1);assert.equal(e.state.credits,fail?25:5);assert.equal(ctx.guidanceBusy,false);
 }
});

test('Freight camera follows cargo phase actions, but never skips living defenders',()=>{
 const c=setup('freight'),yard=c.progression.state.zones.find(z=>z.id==='freight-yard');
 yard.status='active';yard.phaseRested=true;yard.wave=[];
 assert.match(nextGuidanceStep(c).id,/freightSwitch|freightDispatch/);
 yard.wave.push({hp:1});
 assert.equal(nextGuidanceStep(c).id,'fight-freight-yard');
});
