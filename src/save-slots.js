import {createFieldSkills,normalizeFieldSkill,FIELD_SKILLS_KEY} from './field-skills.js?v=progression-balance-r46';
import {compatibleStorage,LEGACY_BACKUP_FORMAT} from './storage-compat.js?v=progression-balance-r46';
import {normalizeCampaignProfile,defaultCampaignProfile,CAMPAIGN_PROFILE_KEY} from './campaign-profile.js?v=progression-balance-r46';
import {createCampaignProgress,normalizeCampaignProgress,CAMPAIGN_PROGRESS_KEY} from './campaign-progress.js?v=progression-balance-r46';
import {validateSnapshot} from './snapshot-validation.js?v=progression-balance-r46';
import {normalizeSettings} from './controls.js?v=progression-balance-r46';
const KEY='nulldelve.saves.v2';
const VERSION=2;
const CHECKPOINT_KEY='nulldelve.autosave.v1';
const empty=()=>({version:VERSION,slots:[null,null,null]});
const validSlot=slot=>Number.isInteger(slot)&&slot>=1&&slot<=3;
const copy=value=>JSON.parse(JSON.stringify(value));

// Public slot numbers are 1–3. Only game snapshots and their display metadata
// are stored; malformed or unavailable browser storage behaves as empty slots.
export function createSaveSlots(storage){
  if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}storage=compatibleStorage(storage);
  function read(){
    try{
      if(!storage||typeof storage.getItem!=='function')return empty();
      const raw=storage.getItem(KEY);if(!raw)return empty();
      const data=JSON.parse(raw);
      if(!data||data.version!==VERSION||!Array.isArray(data.slots)||data.slots.length!==3)return empty();
      const slots=data.slots.map((entry,index)=>{
        if(!entry||typeof entry!=='object'||!Object.prototype.hasOwnProperty.call(entry,'snapshot'))return null;
        const meta=entry.metadata;
        if(!meta||meta.slot!==index+1||typeof meta.name!=='string'||typeof meta.time!=='string'||!Number.isFinite(Date.parse(meta.time))||typeof meta.mission!=='string'||typeof meta.difficulty!=='string')return null;
        return {metadata:{slot:index+1,name:meta.name,time:meta.time,mission:meta.mission,difficulty:meta.difficulty,summary:meta.summary??''},snapshot:entry.snapshot};
      });
      return {version:VERSION,slots};
    }catch{return empty();}
  }
  function readCheckpoint(){
    try{
      if(!storage||typeof storage.getItem!=='function')return null;
      const raw=storage.getItem(CHECKPOINT_KEY);if(!raw)return null;
      const entry=JSON.parse(raw),meta=entry?.metadata;
      if(entry?.version!==1||!Object.prototype.hasOwnProperty.call(entry,'snapshot')||!meta||meta.slot!=='checkpoint'||typeof meta.name!=='string'||typeof meta.time!=='string'||!Number.isFinite(Date.parse(meta.time))||typeof meta.mission!=='string'||typeof meta.difficulty!=='string')return null;
      return {metadata:{slot:'checkpoint',name:meta.name,time:meta.time,mission:meta.mission,difficulty:meta.difficulty,summary:meta.summary??''},snapshot:entry.snapshot};
    }catch{return null;}
  }
  function nextTime(data=read()){
    const manualTime=data.slots.reduce((latest,entry)=>Math.max(latest,entry?Date.parse(entry.metadata.time):0),0);
    const checkpoint=readCheckpoint(),checkpointTime=checkpoint?Date.parse(checkpoint.metadata.time):0;
    return new Date(Math.max(Date.now(),manualTime+1,checkpointTime+1)).toISOString();
  }
  function persist(key,data){
    try{storage.setItem(key,JSON.stringify(data));}catch(error){
      if(error?.name==='QuotaExceededError'||error?.name==='NS_ERROR_DOM_QUOTA_REACHED')throw new Error('Your game could not be saved because browser storage is full. Free some browser storage and try again.');
      throw new Error('Your game could not be saved because browser storage is unavailable or disabled.');
    }
  }
  let pendingBackup=null,previewSequence=0;
  function backupDocument(overrides={}){
    let settings=null;try{const raw=storage?.getItem('nulldelve.settings.v1');if(raw)settings=normalizeSettings(JSON.parse(raw));}catch{}
    let profile=defaultCampaignProfile();try{profile=normalizeCampaignProfile(JSON.parse(storage?.getItem(CAMPAIGN_PROFILE_KEY)||'null'))||profile;}catch{}
    if(overrides.profile!==undefined){const live=normalizeCampaignProfile(overrides.profile);if(!live)throw new Error('The current armory profile could not be backed up.');profile=live;}
    const campaign=overrides.campaign!==undefined?normalizeCampaignProgress(overrides.campaign):createCampaignProgress(storage).serialize();
    if(overrides.settings!==undefined)settings=normalizeSettings(overrides.settings);
    const fieldSkill=overrides.fieldSkill!==undefined?normalizeFieldSkill(overrides.fieldSkill,campaign.completed):createFieldSkills(storage).serialize(campaign.completed);
    let checkpoint=readCheckpoint();
    if(overrides.checkpoint!==undefined){
      const live=overrides.checkpoint;
      if(!live||!validateSnapshot(live.snapshot))throw new Error('The current operation could not be backed up.');
      const meta=live.metadata??{},config=live.snapshot.config;
      checkpoint={metadata:{slot:'checkpoint',name:typeof meta.name==='string'&&meta.name.trim()?meta.name.trim().slice(0,100):'Session backup',time:new Date().toISOString(),mission:config.mission,difficulty:config.difficulty,summary:typeof meta.summary==='string'?meta.summary.slice(0,1000):''},snapshot:copy(live.snapshot)};
    }
    return {format:'nulldelve-backup',version:1,createdAt:new Date().toISOString(),saves:read(),checkpoint,settings,campaign,profile,fieldSkill};
  }
  function exportBackup(overrides){return JSON.stringify(backupDocument(overrides),null,2);}
  function previewBackup(text){
    pendingBackup=null;
    if(typeof text!=='string'||text.length>10_000_000)throw new Error('Choose a Nulldelve backup smaller than 10 MB.');
    let data;try{data=JSON.parse(text);}catch{throw new Error('This file is not a readable game backup.');}
    if(!data||!['nulldelve-backup',LEGACY_BACKUP_FORMAT].includes(data.format)||data.version!==1||data.saves?.version!==VERSION||!Array.isArray(data.saves.slots)||data.saves.slots.length!==3)throw new Error('This backup format is not supported.');
    const validateEntry=(entry,slot)=>{
      if(entry===null)return null;
      const meta=entry?.metadata;
      if(!meta||meta.slot!==slot||typeof meta.name!=='string'||meta.name.length>100||typeof meta.time!=='string'||!Number.isFinite(Date.parse(meta.time))||!['campaign','siege','nest'].includes(meta.mission)||!['easy','normal','hard'].includes(meta.difficulty)||!validateSnapshot(entry.snapshot))throw new Error('This backup contains an invalid saved operation. Your current saves have not changed.');
      return {metadata:{slot,name:meta.name,time:meta.time,mission:meta.mission,difficulty:meta.difficulty,summary:typeof meta.summary==='string'?meta.summary.slice(0,1000):''},snapshot:copy(entry.snapshot)};
    };
    const slots=data.saves.slots.map((entry,index)=>validateEntry(entry,index+1));
    const checkpoint=data.checkpoint===null?null:validateEntry(data.checkpoint,'checkpoint');
    if(data.settings!==null&&(!data.settings||typeof data.settings!=='object'||Array.isArray(data.settings)))throw new Error('This backup contains invalid settings.');
    const hasCampaign=Object.prototype.hasOwnProperty.call(data,'campaign');
    if(hasCampaign&&(!data.campaign||data.campaign.version!==1||!Array.isArray(data.campaign.completed)||!data.campaign.completed.every(id=>typeof id==='string')))throw new Error('This backup contains invalid campaign progress.');
    const hasProfile=Object.prototype.hasOwnProperty.call(data,'profile'),profile=hasProfile?normalizeCampaignProfile(data.profile):null;
    if(hasProfile&&!profile)throw new Error('This backup contains an invalid armory profile.');
    const hasFieldSkill=Object.prototype.hasOwnProperty.call(data,'fieldSkill');
    if(hasFieldSkill&&(!hasCampaign||![1,2].includes(data.fieldSkill?.version)||typeof data.fieldSkill.selected!=='string'||data.fieldSkill.version===2&&(!Array.isArray(data.fieldSkill.learned)||!data.fieldSkill.learned.every(id=>typeof id==='string'))))throw new Error('This backup contains invalid skill development.');
    const fieldSkill=hasFieldSkill?normalizeFieldSkill(data.fieldSkill,normalizeCampaignProgress(data.campaign).completed):null;
    pendingBackup={id:++previewSequence,saves:{version:VERSION,slots},checkpoint,settings:data.settings===null?null:normalizeSettings(data.settings),campaign:hasCampaign?normalizeCampaignProgress(data.campaign):null,profile,fieldSkill};
    return {id:pendingBackup.id,slots:slots.map(e=>e?copy(e.metadata):null),checkpoint:checkpoint?copy(checkpoint.metadata):null,hasSettings:pendingBackup.settings!==null,hasProfile:pendingBackup.profile!==null,hasFieldSkill:pendingBackup.fieldSkill!==null,hasCampaign:pendingBackup.campaign!==null,completedCampaign:pendingBackup.campaign?[...pendingBackup.campaign.completed]:null};
  }
  function importBackup(id){
    if(!pendingBackup||pendingBackup.id!==id)throw new Error('Preview a backup before restoring it.');
    if(!storage||typeof storage.setItem!=='function'||typeof storage.removeItem!=='function')throw new Error('Backup restore is unavailable in this browser.');
    const backup=pendingBackup;
    const updates=[[KEY,JSON.stringify(backup.saves)],[CHECKPOINT_KEY,backup.checkpoint?JSON.stringify({version:1,...backup.checkpoint}):null]];
    if(backup.settings)updates.push(['nulldelve.settings.v1',JSON.stringify(backup.settings)]);
    if(backup.campaign)updates.push([CAMPAIGN_PROGRESS_KEY,JSON.stringify(backup.campaign)]);
    if(backup.profile)updates.push([CAMPAIGN_PROFILE_KEY,JSON.stringify(backup.profile)]);
    if(backup.fieldSkill)updates.push([FIELD_SKILLS_KEY,JSON.stringify(backup.fieldSkill)]);
    let old;try{old=updates.map(([key])=>[key,storage.getItem(key)]);}catch{throw new Error('Browser storage could not be read. Your saves have not changed.');}
    try{for(const [key,value] of updates){if(value===null)storage.removeItem(key);else storage.setItem(key,value);}}
    catch{for(const [key,value] of old){try{if(value===null)storage.removeItem(key);else storage.setItem(key,value);}catch{}}throw new Error('The backup could not be restored. Check browser storage and try again.');}
    pendingBackup=null;return {ok:true,message:'Backup restored. Saved games and backed-up settings are ready.',settings:backup.settings?copy(backup.settings):null};
  }
  function list(){return read().slots.map(entry=>entry?copy(entry.metadata):null);}
  function save(slot,snapshot,meta={}){
    if(!validSlot(slot))throw new Error('Choose save slot 1, 2, or 3.');
    if(!storage||typeof storage.setItem!=='function')throw new Error('Game saves are unavailable in this browser.');
    let safeSnapshot,safeSummary;
    try{safeSnapshot=copy(snapshot);safeSummary=copy(meta.summary??'');}catch{throw new Error('This game state could not be saved. Try saving again after restarting the mission.');}
    const data=read();
    const savedTime=nextTime(data);
    const metadata={slot,name:typeof meta.name==='string'&&meta.name.trim()?meta.name.trim().slice(0,100):`Operation ${slot}`,time:savedTime,mission:typeof meta.mission==='string'?meta.mission:'campaign',difficulty:typeof meta.difficulty==='string'?meta.difficulty:'normal',summary:safeSummary};
    data.slots[slot-1]={metadata,snapshot:safeSnapshot};
    persist(KEY,data);
    return copy(metadata);
  }
  function load(slot){if(!validSlot(slot))return null;const entry=read().slots[slot-1];return entry?copy(entry.snapshot):null;}
  function latest(){
    let found=null,time=-Infinity;
    for(const meta of list()){if(meta&&Date.parse(meta.time)>time){found=meta.slot;time=Date.parse(meta.time);}}
    return found;
  }
  function saveCheckpoint(snapshot,meta={}){
    if(!storage||typeof storage.setItem!=='function')throw new Error('Game saves are unavailable in this browser.');
    let safeSnapshot,safeSummary;
    try{safeSnapshot=copy(snapshot);safeSummary=copy(meta.summary??'');}catch{throw new Error('This game state could not be saved. Try saving again after restarting the mission.');}
    const metadata={slot:'checkpoint',name:typeof meta.name==='string'&&meta.name.trim()?meta.name.trim().slice(0,100):'Checkpoint',time:nextTime(),mission:typeof meta.mission==='string'?meta.mission:'campaign',difficulty:typeof meta.difficulty==='string'?meta.difficulty:'normal',summary:safeSummary};
    persist(CHECKPOINT_KEY,{version:1,metadata,snapshot:safeSnapshot});return copy(metadata);
  }
  function loadCheckpoint(){const checkpoint=readCheckpoint();return checkpoint?copy(checkpoint.snapshot):null;}
  function checkpointInfo(){const checkpoint=readCheckpoint();return checkpoint?copy(checkpoint.metadata):null;}
  return {list,save,load,latest,saveCheckpoint,loadCheckpoint,checkpointInfo,exportBackup,previewBackup,importBackup};
}
