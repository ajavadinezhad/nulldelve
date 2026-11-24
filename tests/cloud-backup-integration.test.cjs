const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');
const {createSaveSlots}=require('../src/save-slots.js');
const plain=value=>JSON.parse(JSON.stringify(value));
const memory=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};};
function realSession(){
 // Reuse the existing actual-main session fixture without registering/running
 // its test cases. It composes the real capture/restore and progression modules.
 const fixturePath=path.resolve('tests/session-roundtrip.test.cjs'),fixture=fs.readFileSync(fixturePath,'utf8'),boundary=fixture.indexOf("test('actual browser capture/restore roundtrip");assert.ok(boundary>0);
 const sandbox={require:createRequire(fixturePath),__filename:fixturePath,console,URL};vm.createContext(sandbox);vm.runInContext(fixture.slice(0,boundary)+'\nthis.makeSession=session;',sandbox);return sandbox.makeSession({expanded:true});
}
test('actual main cloud backup remains restorable by the real backup preview/import pipeline',async()=>{
 const session=realSession(),ctx=session.ctx,local=createSaveSlots(memory());ctx.saveSlots=local;ctx.economy.state.credits=777;ctx.campaignProgress.complete('breach');
 const checkpoint=plain(session.capture());local.saveCheckpoint(checkpoint,{name:'Safe checkpoint',mission:'campaign',difficulty:'normal',summary:'Verified integration fixture'});
 const source=fs.readFileSync('src/main.js','utf8'),start=source.indexOf('async function cloudBackup(){'),end=source.indexOf('async function restoreCloudBackup(',start);assert.ok(start>=0&&end>start);vm.runInContext(source.slice(start,end),ctx);
 const payload=plain(await ctx.cloudBackup());assert.equal(payload.saves.version,JSON.parse(local.exportBackup()).saves.version);assert.deepEqual(payload.saves.slots,[null,null,null]);assert.equal(payload.settings,null,'device layout does not travel between phones and desktop');assert.equal(payload.profile.economy.credits,777);assert.ok(payload.campaign.completed.includes('breach'));assert.equal(payload.checkpoint.metadata.name,'Safe checkpoint');
 const second=createSaveSlots(memory()),preview=second.previewBackup(JSON.stringify(payload)),result=second.importBackup(preview.id);assert.equal(result.ok,true);assert.deepEqual(plain(second.loadCheckpoint()),checkpoint);const restored=JSON.parse(second.exportBackup());assert.equal(restored.profile.economy.credits,777);assert.ok(restored.campaign.completed.includes('breach'));
});
test('actual cloud export waits for pending earned cash before snapshotting the wallet',async()=>{
 const session=realSession(),ctx=session.ctx;ctx.saveSlots=createSaveSlots(memory());ctx.economy.state.credits=100;const reward=ctx.campaignProfile.queueEnemyReward('kill.command.0','normal');
 const source=fs.readFileSync('src/main.js','utf8'),start=source.indexOf('async function cloudBackup(){'),end=source.indexOf('async function restoreCloudBackup(',start);vm.runInContext(source.slice(start,end),ctx);const backup=await ctx.cloudBackup();await reward;assert.equal(backup.profile.economy.credits,ctx.economy.state.credits);assert.ok(backup.profile.economy.credits>100);assert.equal(backup.profile.economy.claimedRewards['kill.command.0'],true);
});
function restoreFunction(ctx){const source=fs.readFileSync('src/main.js','utf8'),start=source.indexOf('async function restoreCloudBackup('),end=source.indexOf('async function accountAction(',start);assert.ok(start>=0&&end>start);vm.runInContext(source.slice(start,end),ctx);}
test('cloud adoption waits for durable local rewards before importing and restarting the game',async()=>{
 const session=realSession(),ctx=session.ctx,storage=memory(),local=createSaveSlots(storage),events=[];ctx.economy.state.credits=100;storage.setItem('nulldelve.profile.v1',JSON.stringify(ctx.campaignProfile.serialize()));
 const remote=JSON.parse(createSaveSlots(memory()).exportBackup());remote.profile.economy.credits=900;
 let release;const gate=new Promise(resolve=>release=resolve);ctx.campaignProfile.flushRewards=async()=>{events.push('flush');await gate;events.push('paid');};
 ctx.saveSlots={...local,previewBackup:text=>{events.push('preview');return local.previewBackup(text);},importBackup:id=>{events.push('import');return local.importBackup(id);}};ctx.finishBackupImport=()=>events.push('restart');restoreFunction(ctx);
 const adoption=ctx.restoreCloudBackup(remote);assert.deepEqual(events,['flush']);assert.equal(JSON.parse(local.exportBackup()).profile.economy.credits,100,'waiting for journal durability cannot overwrite the existing wallet');release();await adoption;assert.deepEqual(events,['flush','paid','preview','import','restart']);assert.equal(JSON.parse(local.exportBackup()).profile.economy.credits,900);
});
test('failed reward flushing aborts cloud adoption without previewing or modifying local progress',async()=>{
 const session=realSession(),ctx=session.ctx,storage=memory(),local=createSaveSlots(storage);ctx.economy.state.credits=321;storage.setItem('nulldelve.profile.v1',JSON.stringify(ctx.campaignProfile.serialize()));const before=local.exportBackup();
 ctx.campaignProfile.flushRewards=async()=>{throw new Error('Cash rewards are still saving');};ctx.saveSlots={previewBackup:()=>assert.fail('do not stage a replacement after failed journal flush'),importBackup:()=>assert.fail('do not overwrite local progress')};ctx.finishBackupImport=()=>assert.fail('do not restart');restoreFunction(ctx);
 await assert.rejects(ctx.restoreCloudBackup({}),/still saving/);assert.deepEqual(JSON.parse(local.exportBackup()).profile,JSON.parse(before).profile);assert.equal(local.loadCheckpoint(),null);
});
