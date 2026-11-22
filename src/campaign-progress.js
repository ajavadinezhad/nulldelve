import {compatibleStorage} from './storage-compat.js?v=ui-stability-r37';
import {CAMPAIGN_OPERATIONS} from './campaign-operations.js?v=ui-stability-r37';
export const CAMPAIGN_PROGRESS_KEY='nulldelve.campaign.v1';
const ids=CAMPAIGN_OPERATIONS.map(operation=>operation.id);
const logIds=['log-lab','log-containment','log-nest'];
const artifactIds=['artifact-archive','artifact-generator','artifact-containment'];
/** A gap never unlocks a later operation, even in edited or older records. */
export function normalizeCampaignProgress(value){
 const source=value?.version===1&&Array.isArray(value.completed)?value.completed:[];
 const completed=[];for(const id of ids){if(!source.includes(id))break;completed.push(id);}
 return {version:1,completed,researchLogs:logIds.filter(id=>value?.version===1&&Array.isArray(value.researchLogs)&&value.researchLogs.includes(id)),artifacts:artifactIds.filter(id=>value?.version===1&&Array.isArray(value.artifacts)&&value.artifacts.includes(id))};
}
export function createCampaignProgress(storage){
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}storage=compatibleStorage(storage);
 let memory=normalizeCampaignProgress(null),volatile=false;
 function stored(){try{const raw=storage?.getItem(CAMPAIGN_PROGRESS_KEY);if(raw!==null&&raw!==undefined)return normalizeCampaignProgress(JSON.parse(raw));
  const records=JSON.parse(storage?.getItem('nulldelve.records.v1')||'{}');return normalizeCampaignProgress({version:1,completed:ids.filter(id=>['easy','normal','hard'].some(d=>Number.isFinite(records?.['campaign:'+id+':'+d]?.elapsed)))});
 }catch{return null;}}
 function read(){const latest=stored();if(latest){if(volatile){memory=normalizeCampaignProgress({version:1,completed:memory.completed.length>=latest.completed.length?memory.completed:latest.completed,researchLogs:[...memory.researchLogs,...latest.researchLogs],artifacts:[...memory.artifacts,...latest.artifacts]});}else memory=latest;}return memory;}
 function persist(){const latest=stored();if(latest)memory=normalizeCampaignProgress({version:1,completed:memory.completed.length>=latest.completed.length?memory.completed:latest.completed,researchLogs:[...memory.researchLogs,...latest.researchLogs],artifacts:[...memory.artifacts,...latest.artifacts]});try{if(!storage?.setItem)throw new Error('Unavailable');storage.setItem(CAMPAIGN_PROGRESS_KEY,JSON.stringify(memory));volatile=false;return true;}catch{volatile=true;return false;}}
 function completed(){return [...read().completed];}
 function researchLogs(){return [...read().researchLogs];}
 function isUnlocked(id){const index=ids.indexOf(id);return index>=0&&(index===0||read().completed.includes(ids[index-1]));}
 function complete(id){if(!isUnlocked(id))return false;const current=completed();if(current.includes(id))return true;memory=normalizeCampaignProgress({...read(),completed:[...current,id]});persist();return true;}
 function recordLog(id){if(!logIds.includes(id))return false;const current=researchLogs();if(current.includes(id))return true;memory=normalizeCampaignProgress({...read(),researchLogs:[...current,id]});persist();return true;}
 function artifacts(){return [...read().artifacts];}
 function recordArtifact(id){if(!artifactIds.includes(id))return false;const current=artifacts();if(current.includes(id))return true;memory=normalizeCampaignProgress({...read(),artifacts:[...current,id]});persist();return true;}
 function serialize(){return JSON.parse(JSON.stringify(read()));}
 function restoreTransient(value){if(!value||value.version!==1||!Array.isArray(value.completed))return false;const incoming=normalizeCampaignProgress(value),latest=read();memory=normalizeCampaignProgress({version:1,completed:incoming.completed.length>=latest.completed.length?incoming.completed:latest.completed,researchLogs:[...latest.researchLogs,...incoming.researchLogs],artifacts:[...latest.artifacts,...incoming.artifacts]});volatile=true;return true;}
 return {completed,isUnlocked,complete,researchLogs,recordLog,artifacts,recordArtifact,serialize,restoreTransient,persist,isSessionOnly:()=>volatile};
}
