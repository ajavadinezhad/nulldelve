/** Preset-only local artwork. User-supplied URLs/HTML never reach the interface. */
export const PLAYER_AVATARS=Object.freeze(['sentinel','specter','vanguard','raven','cipher','ember','warden','nomad']);
export function normalizePlayerIdentity(value){
 if(!value||typeof value!=='object')return null;
 const username=typeof value.username==='string'?value.username.trim().toLowerCase():'',displayName=typeof (value.display_name??value.displayName)==='string'?(value.display_name??value.displayName).trim():'';
 if(!/^[a-z][a-z0-9_]{2,19}$/.test(username)||displayName.length<1||Array.from(displayName).length>24||/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069<>]/.test(displayName)||!PLAYER_AVATARS.includes(value.avatar))return null;
 return {username,displayName,avatar:value.avatar};
}
export function avatarPath(id){return './assets/avatars/'+(PLAYER_AVATARS.includes(id)?id:'sentinel')+'.svg';}
const WELCOME_KEY='nulldelve.welcome.seen.v1';
/** Viewing/dismissing the welcome is not signing in; only Auth establishes a session. */
export function shouldShowWelcome(state,storage){if(!state?.configured)return false;if(state.signedIn)return state.profileLoaded===true&&!state.profile;try{return storage?.getItem(WELCOME_KEY)!=='1';}catch{return false;}}
export function markWelcomeSeen(storage){try{storage?.setItem(WELCOME_KEY,'1');}catch{}}
