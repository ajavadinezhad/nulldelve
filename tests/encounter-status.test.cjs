const {test}=require('node:test'),assert=require('node:assert/strict');
const {encounterStatus}=require('../src/encounter-status.js');
const zone=()=>({status:'active',label:'GENERATOR RESTART',remaining:19,total:29,phaseRested:true,spawnTimer:5.8,queue:['normal'],wave:[{hp:0}]});
test('a cleared group shows the actual regroup countdown rather than looking like an empty stalled arena',()=>{
 const z=zone();assert.equal(encounterStatus(z).text,'NEXT WAVE · 6s');z.spawnTimer=1.1;assert.equal(encounterStatus(z).text,'NEXT WAVE · 2s');
 const before=JSON.stringify(z);encounterStatus(z);assert.equal(JSON.stringify(z),before);
});
test('living and delayed attackers, ordinary spawn gaps and exhausted queues never advertise a safe regroup',()=>{
 for(const change of [{wave:[{hp:2}]},{wave:[{hp:2,spawnDelay:.7}]},{phaseRested:false},{queue:[]},{spawnTimer:0}])assert.equal(encounterStatus({...zone(),...change}).phase,'combat');
 for(const status of ['dormant','cleared'])assert.equal(encounterStatus({...zone(),status}),null);
 assert.equal(encounterStatus(null),null);
});
test('objective-gated waves never advertise a countdown that cannot expire',()=>{
 const z={...zone(),id:'freight-yard',total:48,spawned:16,spawnTimer:.25};
 assert.equal(encounterStatus(z,{tasks:{freightRoute:{running:false}}}).text,'DISPATCH CARGO');
 assert.equal(encounterStatus(z,{tasks:{freightRoute:{running:true,remaining:7}}}).text,'ESCORT CARGO');
 assert.equal(encounterStatus(z,{tasks:{freightRoute:{running:true,remaining:6}}}).phase,'regroup');
 assert.equal(encounterStatus({...z,id:'hospital-isolation'},{tasks:{hospitalRecords:false}}).text,'RECOVER LEDGER');
 assert.equal(encounterStatus({...z,id:'hospital-isolation'},{tasks:{hospitalRecords:true}}).phase,'regroup');
 assert.equal(encounterStatus({...z,wave:[{hp:1}]},{tasks:{}}).phase,'combat');
});
