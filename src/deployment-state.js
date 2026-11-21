import {normalizeCampaignProfile} from './campaign-profile.js?v=identity-r16';
import {normalizeCampaignProgress} from './campaign-progress.js?v=identity-r16';
const PREFIX='#deployment=';
/** Game-only session transfer survives document navigation when storage is blocked. */
export function encodeDeploymentState({profile,progress}={}){
 const normalized=normalizeCampaignProfile(profile);if(!normalized)return '';
 return PREFIX+encodeURIComponent(JSON.stringify({version:1,profile:normalized,progress:normalizeCampaignProgress(progress)}));
}
export function decodeDeploymentState(hash){
 try{if(typeof hash!=='string'||!hash.startsWith(PREFIX)||hash.length>100000)return null;const value=JSON.parse(decodeURIComponent(hash.slice(PREFIX.length)));if(value?.version!==1||!value.progress||value.progress.version!==1||!Array.isArray(value.progress.completed))return null;const profile=normalizeCampaignProfile(value.profile);return profile?{profile,progress:normalizeCampaignProgress(value.progress)}:null;}catch{return null;}
}
