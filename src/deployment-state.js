import {normalizeFieldSkill} from './field-skills.js?v=skill-audit-r26';
import {normalizeCampaignProfile} from './campaign-profile.js?v=skill-audit-r26';
import {normalizeCampaignProgress} from './campaign-progress.js?v=skill-audit-r26';
const PREFIX='#deployment=';
/** Game-only session transfer survives document navigation when storage is blocked. */
export function encodeDeploymentState({profile,progress,fieldSkill}={}){
 const normalized=normalizeCampaignProfile(profile);if(!normalized)return '';
 return PREFIX+encodeURIComponent(JSON.stringify({version:1,profile:normalized,progress:normalizeCampaignProgress(progress),...(fieldSkill?{fieldSkill:normalizeFieldSkill(fieldSkill,normalizeCampaignProgress(progress).completed)}:{})}));
}
export function decodeDeploymentState(hash){
 try{if(typeof hash!=='string'||!hash.startsWith(PREFIX)||hash.length>100000)return null;const value=JSON.parse(decodeURIComponent(hash.slice(PREFIX.length)));if(value?.version!==1||!value.progress||value.progress.version!==1||!Array.isArray(value.progress.completed))return null;const profile=normalizeCampaignProfile(value.profile);return profile?{profile,progress:normalizeCampaignProgress(value.progress),...(value.fieldSkill?{fieldSkill:normalizeFieldSkill(value.fieldSkill,normalizeCampaignProgress(value.progress).completed)}:{})}:null;}catch{return null;}
}
