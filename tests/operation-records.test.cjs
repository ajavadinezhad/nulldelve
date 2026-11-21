const {test}=require('node:test'),assert=require('node:assert/strict');
const {createOperationStats,recordResult,formatDuration}=require('../src/operation-records.js');
test('only successful faster completions replace mission and difficulty bests',()=>{const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},config={mission:'siege',difficulty:'normal'};assert.equal(recordResult(storage,config,{elapsed:90,kills:40},false,50).personalBest,false);assert.equal(data.size,0);assert.equal(recordResult(storage,config,{elapsed:120,kills:40},true,60).personalBest,true);assert.equal(recordResult(storage,config,{elapsed:125},true,60).personalBest,false);assert.equal(recordResult(storage,config,{elapsed:110},true,60).personalBest,true);assert.equal(recordResult(storage,{...config,difficulty:'hard'},{elapsed:150},true,60).personalBest,true);assert.equal(formatDuration(125),'2:05');assert.equal(createOperationStats().medkits,0);});

test('normal and remixed personal bests remain separate while legacy normal records stay readable',()=>{const {readOperationRecords,completedCampaignOperations,operationRecordKey}=require('../src/operation-records.js');const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},config={mission:'campaign',operation:'breach',difficulty:'normal'};recordResult(storage,config,{elapsed:100},true,40);assert.equal(recordResult(storage,{...config,remix:true},{elapsed:50},true,40).previousBest,null);const normal=recordResult(storage,config,{elapsed:70},true,40);assert.equal(normal.previousBest,100);assert.equal(normal.personalBest,true);assert.equal(normal.delta,-30);const records=readOperationRecords(storage);assert.equal(operationRecordKey(config),'campaign:breach:normal');assert.equal(records[operationRecordKey(config)].elapsed,70);assert.equal(records[operationRecordKey({...config,remix:true})].elapsed,50);assert.deepEqual(completedCampaignOperations(storage),['breach']);const legacy={getItem:()=>JSON.stringify({'campaign:command:hard':{elapsed:200},'campaign:research:easy:remix':{elapsed:300}})};assert.equal(readOperationRecords(legacy)['campaign:command:hard'].elapsed,200);assert.deepEqual(completedCampaignOperations(legacy),['command','research']);});


test('every authored campaign operation retains base and Remix records after reading',()=>{
 const {CAMPAIGN_OPERATIONS}=require('../src/campaign-operations.js');
 const {readOperationRecords,completedCampaignOperations,operationRecordKey}=require('../src/operation-records.js');
 const data=new Map(),storage={getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)};
 for(const {id:operation} of CAMPAIGN_OPERATIONS)for(const difficulty of ['easy','normal','hard'])for(const remix of [false,true]){
  const config={mission:'campaign',operation,difficulty,remix};recordResult(storage,config,{elapsed:123,kills:15},true,60);
  assert.equal(readOperationRecords(storage)[operationRecordKey(config)]?.elapsed,123,operationRecordKey(config));
 }
 assert.deepEqual(completedCampaignOperations(storage),CAMPAIGN_OPERATIONS.map(operation=>operation.id));
});
test('record reading rejects unknown operations, malformed key suffixes and invalid elapsed values',()=>{
 const {readOperationRecords,completedCampaignOperations}=require('../src/operation-records.js');
 const records={'campaign:hospital:normal':{elapsed:120},'campaign:normal':{elapsed:80},'campaign:future:normal':{elapsed:10},'campaign:hospital:nightmare':{elapsed:10},'campaign:hospital:normal:remix:extra':{elapsed:10},'campaign:hospital:hard':{elapsed:-1},'campaign:hospital:easy':{elapsed:'100'}};
 assert.deepEqual(Object.keys(readOperationRecords({getItem:()=>JSON.stringify(records)})),['campaign:hospital:normal','campaign:normal']);
 assert.deepEqual(completedCampaignOperations({getItem:()=>JSON.stringify({'campaign:hospital:hard':{elapsed:-1}})}),[]);
});
