const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(new URL('../src/main.js',`file://${__filename}`),'utf8');
test('live backup waits for pending cash before serializing the wallet',async()=>{
 const at=source.indexOf('onExportBackup:')+'onExportBackup:'.length,end=source.indexOf(',onPreviewBackup:',at),events=[];assert.ok(at>0&&end>at);
 let finish,cash=150;const queued=new Promise(resolve=>{finish=()=>{cash+=40;events.push('paid');resolve();};});
 const ctx={active:false,campaignProfile:{flushRewards:()=>{events.push('flush');return queued;},serialize:()=>({economy:{credits:cash}})},persistCampaignProfile:()=>events.push('persist'),campaignProgress:{serialize:()=>({version:1,completed:[]}),completed:()=>[]},fieldSkills:{serialize:()=>({version:2,selected:'none',learned:[]})},menu:{settings:{}},saveSlots:{exportBackup:value=>{events.push('export');return value;}}};
 const callback=vm.runInNewContext('('+source.slice(at,end)+')',ctx),result=callback();assert.deepEqual(events,['flush']);finish();const backup=await result;assert.equal(backup.profile.economy.credits,190);assert.deepEqual(events,['flush','paid','persist','export']);
});
