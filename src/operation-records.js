import {compatibleStorage} from './storage-compat.js?v=balance-r11';
const KEY='nulldelve.records.v1';
// Keep legacy normal keys readable; alternate puzzle layouts have separate best times.
export function operationRecordKey(config){return config.mission+(config.operation?':'+config.operation:'')+':'+config.difficulty+(config.remix?':remix':'');}
export function createOperationStats(saved={}){return {elapsed:Math.max(0,Number(saved.elapsed)||0),kills:Math.max(0,Number(saved.kills)||0),shots:Math.max(0,Number(saved.shots)||0),medkits:Math.max(0,Number(saved.medkits)||0),grenades:Math.max(0,Number(saved.grenades)||0)};}
export function recordResult(storage,config,stats,won,exploration){storage=compatibleStorage(storage);
 const result={...createOperationStats(stats),won:!!won,exploration,mission:config.mission,difficulty:config.difficulty,operation:config.operation??null,remix:!!config.remix};
 let records={};try{records=JSON.parse(storage.getItem(KEY)||'{}')||{};}catch{}
 if(typeof records!=='object'||Array.isArray(records)||records===null)records={};
 const key=operationRecordKey(config),previous=records[key];result.previousBest=Number.isFinite(previous?.elapsed)?previous.elapsed:null;result.delta=result.previousBest===null?null:result.elapsed-result.previousBest;result.personalBest=!!won&&(!previous||result.elapsed<previous.elapsed);
 if(result.personalBest){records[key]={elapsed:result.elapsed,kills:result.kills,exploration};try{storage.setItem(KEY,JSON.stringify(records));}catch{}}
 return result;
}
export function formatDuration(seconds){const n=Math.max(0,Math.floor(seconds));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}

export function completedCampaignOperations(storage){storage=compatibleStorage(storage);try{const records=JSON.parse(storage.getItem(KEY)||'{}');return ['breach','command','research','containment','nest'].filter(id=>['easy','normal','hard'].some(d=>[false,true].some(remix=>Number.isFinite(records[operationRecordKey({mission:'campaign',operation:id,difficulty:d,remix})]?.elapsed))));}catch{return [];}}

export function readOperationRecords(storage){storage=compatibleStorage(storage);try{const value=JSON.parse(storage?.getItem(KEY)||'{}');if(!value||typeof value!=='object'||Array.isArray(value))return {};return Object.fromEntries(Object.entries(value).filter(([key,r])=>/^campaign(?::(breach|command|research|containment|nest))?:(easy|normal|hard)(?::remix)?$/.test(key)&&Number.isFinite(r?.elapsed)&&r.elapsed>=0));}catch{return {};}}
