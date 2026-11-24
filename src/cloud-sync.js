/** Automatic checkpoint sync. A remote revision must be adopted explicitly;
 * a conflict never overwrites either device's progress. */
export function createCloudSync({client,getBackup,restoreBackup,onChange=()=>{},storage,delayMs=2500}={}){
 let revision=null,remote=null,needsChoice=false,pending=false,error='',lastSaved=null,queued=false,flight=null,generation=0,timer=null;
 const key=()=>{const s=client.getState();return `nulldelve.cloud.binding.${s.project??''}.${s.userId??''}`;};
 const notify=()=>onChange(state());
 function state(){return {...client.getState(),revision,needsChoice,pending,error,lastSaved,hasRemote:!!remote,remoteTime:remote?.updated_at??null};}
 function remember(){try{storage?.setItem(key(),JSON.stringify({revision}));}catch{}}
 function forget(){if(timer!==null)clearTimeout(timer);timer=null;revision=null;remote=null;needsChoice=false;queued=false;pending=false;error='';lastSaved=null;generation++;notify();}
 async function connect(){
  const auth=client.getState();if(!auth.signedIn)return forget();
  const run=++generation;pending=true;error='';notify();
  try{const fetched=await client.fetchSave();if(run!==generation)return;remote=fetched;
   let binding=null;try{binding=JSON.parse(storage?.getItem(key())??'null');}catch{}
   if(!fetched){revision=0;needsChoice=false;remember();queued=true;}
   else if(Number.isSafeInteger(binding?.revision)&&binding.revision===fetched.revision){revision=fetched.revision;needsChoice=false;queued=true;}
   else{revision=fetched.revision;needsChoice=true;}
  }catch(e){if(run===generation)error=e.message||'Cloud is unavailable. Local progress is safe.';}
  finally{if(run===generation){pending=false;notify();if(queued&&!needsChoice)void flush();}}
 }
 async function flush(){
  if(timer!==null)clearTimeout(timer);timer=null;queued=true;if(flight||pending||needsChoice||revision===null||!client.getState().signedIn)return flight;
  const run=generation;flight=(async()=>{
   while(queued&&!needsChoice&&run===generation){queued=false;pending=true;error='';notify();
    try{const payload=await getBackup();if(run!==generation)break;const result=await client.writeSave(payload,{expectedRevision:revision});if(run!==generation)break;
     if(result?.conflict){const latest=await client.fetchSave();if(run!==generation)break;needsChoice=true;remote=latest;error='Progress changed on another device. Choose which progress to keep.';break;}
     if(!result?.ok)throw new Error('Cloud save was not accepted. Local progress is safe.');
     revision=result.revision;remote={...result,payload};lastSaved=result.updated_at??new Date().toISOString();remember();
    }catch(e){if(run===generation)error=e.message||'Cloud save failed. Local progress is safe.';break;}
    finally{if(run===generation){pending=false;notify();}}
   }
  })();try{await flight;}finally{flight=null;if(run===generation){pending=false;notify();}}return state();
 }
 async function useCloud(){if(pending)return;const run=generation;pending=true;error='';notify();try{
  const latest=await client.fetchSave();if(run!==generation)return;if(!latest)throw new Error('No cloud progress is available.');
  await restoreBackup(latest.payload);if(run!==generation)return;revision=latest.revision;remote=latest;needsChoice=false;queued=false;remember();
 }catch(e){if(run===generation)error=e.message||'Cloud progress could not be restored.';throw e;}finally{if(run===generation){pending=false;notify();}}}
 async function useDevice(){if(pending)return;const run=generation;pending=true;notify();try{const latest=await client.fetchSave();if(run!==generation)return;remote=latest;revision=remote?.revision??0;needsChoice=false;}finally{if(run===generation)pending=false;}if(run===generation)await flush();return state();}
 return {getState:state,connect,schedule:()=>{if(!client.getState().signedIn)return;queued=true;if(timer===null&&revision!==null&&!needsChoice)timer=setTimeout(()=>{timer=null;void flush();},delayMs);},flush,useCloud,useDevice,forget};
}
