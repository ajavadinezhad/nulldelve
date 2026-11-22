import {normalizeFieldSkill} from './field-skills.js?v=preview-polish-r31';
import {normalizeCampaignProfile} from './campaign-profile.js?v=preview-polish-r31';
import {normalizeCampaignProgress} from './campaign-progress.js?v=preview-polish-r31';
const PREFIX='#deployment=';
const MAX_CLAIMS=20000,MAX_ZONES=128,MAX_RANGES=10000;
const zoneName=value=>typeof value==='string'&&/^[a-z][a-z0-9-]{0,39}$/.test(value);
/** The URL carries contiguous paid-enemy ordinals as ranges; stored profiles keep full IDs. */
function compactClaims(profile){
 const zones=new Map(),finite={};
 for(const [id,paid]of Object.entries(profile.economy.claimedRewards)){
  const match=/^kill\.([a-z][a-z0-9-]{0,39})\.(0|[1-9][0-9]{0,3})$/.exec(id);
  if(!match){finite[id]=paid;continue;}
  const zone=match[1];if(!zones.has(zone))zones.set(zone,[]);zones.get(zone).push(Number(match[2]));
 }
 const killClaims=[];let claims=0,rangeCount=0;
 for(const [zone,ordinals]of zones){
  claims+=ordinals.length;if(claims>MAX_CLAIMS||zones.size>MAX_ZONES)return null;
  ordinals.sort((a,b)=>a-b);const ranges=[];
  for(const ordinal of ordinals){const last=ranges.at(-1);if(last&&ordinal===last[1]+1)last[1]=ordinal;else ranges.push([ordinal,ordinal]);}
  rangeCount+=ranges.length;if(rangeCount>MAX_RANGES)return null;killClaims.push([zone,ranges]);
 }
 profile.economy.claimedRewards=finite;return killClaims;
}
function expandClaims(value){
 if(!Array.isArray(value)||value.length>MAX_ZONES)return null;
 const zones=new Set(),entries=[];let claims=0,rangeCount=0;
 for(const group of value){
  if(!Array.isArray(group)||group.length!==2||!zoneName(group[0])||zones.has(group[0])||!Array.isArray(group[1])||!group[1].length)return null;
  const [zone,ranges]=group;zones.add(zone);let previous=-1;
  rangeCount+=ranges.length;if(rangeCount>MAX_RANGES)return null;
  for(const range of ranges){
   if(!Array.isArray(range)||range.length!==2)return null;
   const [start,end]=range;if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end>9999||start>end||start<=previous)return null;
   claims+=end-start+1;if(claims>MAX_CLAIMS)return null;previous=end;
   for(let ordinal=start;ordinal<=end;ordinal++)entries.push([`kill.${zone}.${ordinal}`,true]);
  }
 }
 return Object.fromEntries(entries);
}
/** Game-only session transfer survives document navigation when storage is blocked. */
export function encodeDeploymentState({profile,progress,fieldSkill}={}){
 const normalized=normalizeCampaignProfile(profile);if(!normalized)return '';
 const killClaims=compactClaims(normalized);if(!killClaims)return '';
 const campaign=normalizeCampaignProgress(progress),hash=PREFIX+encodeURIComponent(JSON.stringify({version:2,profile:normalized,killClaims,progress:campaign,...(fieldSkill?{fieldSkill:normalizeFieldSkill(fieldSkill,campaign.completed)}:{})}));
 return hash.length<=100000?hash:'';
}
export function decodeDeploymentState(hash){
 try{
  if(typeof hash!=='string'||!hash.startsWith(PREFIX)||hash.length>100000)return null;
  const value=JSON.parse(decodeURIComponent(hash.slice(PREFIX.length)));
  if(![1,2].includes(value?.version)||!value.progress||value.progress.version!==1||!Array.isArray(value.progress.completed))return null;
  const profile=normalizeCampaignProfile(value.profile);if(!profile)return null;
  if(value.version===2){const claims=expandClaims(value.killClaims);if(!claims)return null;profile.economy.claimedRewards={...profile.economy.claimedRewards,...claims};}
  return {profile,progress:normalizeCampaignProgress(value.progress),...(value.fieldSkill?{fieldSkill:normalizeFieldSkill(value.fieldSkill,normalizeCampaignProgress(value.progress).completed)}:{})};
 }catch{return null;}
}
