/** Player identity is local to this browser; independent of weapons/checkpoints. */
export const IDENTITY_KEY='nulldelve.identity.v1';
export const AVATARS=['scout','medic','engineer','recon','warden','pilot'];
export function normalizeIdentity(value){
 if(!value||value.version!==1||typeof value.displayName!=='string'||!AVATARS.includes(value.avatar))return null;
 const displayName=Array.from(value.displayName.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,'').trim()).slice(0,24).join('');
 return displayName?{version:1,displayName,avatar:value.avatar}:null;
}
export function readIdentity(storage){try{return normalizeIdentity(JSON.parse(storage.getItem(IDENTITY_KEY)));}catch{return null;}}
export function saveIdentity(storage,value){const identity=normalizeIdentity(value);if(!identity)return false;try{storage.setItem(IDENTITY_KEY,JSON.stringify(identity));return true;}catch{return false;}}
