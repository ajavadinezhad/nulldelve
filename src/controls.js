import {initialQuality} from './device-presentation.js?v=exploration-ui-r45c';
export const DEFAULT_BINDINGS=Object.freeze({moveUp:'KeyW',moveDown:'KeyS',moveLeft:'KeyA',moveRight:'KeyD',interact:'KeyE',reload:'KeyR',medkit:'KeyQ',grenade:'KeyG',cycleGrenade:'KeyC',sprint:'ShiftLeft',fire:'Space',knife:'KeyF',rifle:'Digit1',pistol:'Digit2',map:'KeyM',help:'KeyH',resetPuzzle:'KeyT',aimUp:'ArrowUp',aimDown:'ArrowDown',aimLeft:'ArrowLeft',aimRight:'ArrowRight'});
export const ACTION_LABELS=Object.freeze({moveUp:'Move up',moveDown:'Move down',moveLeft:'Move left',moveRight:'Move right',interact:'Interact',reload:'Reload',medkit:'Use medkit',grenade:'Throw grenade',cycleGrenade:'Switch grenade type',sprint:'Sprint',fire:'Fire',knife:'Knife strike',rifle:'Equip rifle',pistol:'Equip pistol',map:'Full map',help:'Controls help',resetPuzzle:'Reset crates',aimUp:'Aim up',aimDown:'Aim down',aimLeft:'Aim left',aimRight:'Aim right'});
export const BINDING_ACTIONS=Object.freeze(Object.keys(DEFAULT_BINDINGS));
const RESERVED=new Set(['Escape','Tab']);
const supported=code=>typeof code==='string'&&/^(Key[A-Z]|Digit[0-9]|Space|Arrow(Up|Down|Left|Right)|Shift(Left|Right)|Control(Left|Right)|Alt(Left|Right))$/.test(code)&&!RESERVED.has(code);
export function formatKey(code){if(typeof code!=='string')return '—';const names={ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',ShiftLeft:'Shift',ShiftRight:'Shift',ControlLeft:'Ctrl',ControlRight:'Ctrl',AltLeft:'Alt',AltRight:'Alt'};if(names[code])return names[code];return code.startsWith('Key')?code.slice(3):code.startsWith('Digit')?code.slice(5):code;}
export function validateBinding(bindings,action,code){
 if(!BINDING_ACTIONS.includes(action))return {ok:false,message:'Choose a control to change.'};
 if(!supported(code))return {ok:false,message:'Use a letter, number, arrow, Space, Shift, Control, or Alt. Escape and Tab stay reserved.'};
 const conflict=BINDING_ACTIONS.find(key=>key!==action&&bindings?.[key]===code);
 if(conflict)return {ok:false,message:`${formatKey(code)} is already assigned to ${ACTION_LABELS[conflict].toLowerCase()}. Choose another key.`};
 return {ok:true,message:`${ACTION_LABELS[action]} uses ${formatKey(code)}.`};
}
export function normalizeBindings(input={}){
 const result={},used=new Set();
 for(const action of BINDING_ACTIONS){const code=input?.[action];if(supported(code)&&!used.has(code)){result[action]=code;used.add(code);}}
 const candidates=[...Object.values(DEFAULT_BINDINGS),...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter=>'Key'+letter),...'3456789'.split('').map(digit=>'Digit'+digit)];
 for(const action of BINDING_ACTIONS){if(result[action])continue;const code=[DEFAULT_BINDINGS[action],...candidates].find(key=>supported(key)&&!used.has(key));result[action]=code;used.add(code);}
 return result;
}
export function actionForCode(code,bindings=DEFAULT_BINDINGS){return BINDING_ACTIONS.find(action=>bindings?.[action]===code)??null;}
/** Latch aim on keydown, even if the key is released before the next frame. */
export function keyboardAimDirection(keys,bindings=DEFAULT_BINDINGS){
 const x=Number(keys.has(bindings.aimRight))-Number(keys.has(bindings.aimLeft));
 const z=Number(keys.has(bindings.aimDown))-Number(keys.has(bindings.aimUp));
 const length=Math.hypot(x,z);
 return length?{x:x/length,z:z/length}:null;
}
export function normalizeSettings(value={}){
 const clamp=(n,min,max,fallback)=>Number.isFinite(Number(n))?Math.max(min,Math.min(max,Number(n))):fallback;
 return {
  brightness:clamp(value?.brightness,.7,1.5,1),quality:initialQuality(value?.quality,{coarse:globalThis.matchMedia?.('(pointer: coarse)')?.matches??false,touchPoints:globalThis.navigator?.maxTouchPoints??0,touch:value?.touchControls==='on'}),zoom:clamp(value?.zoom,14,32,22),showMinimap:typeof value?.showMinimap==='boolean'?value.showMinimap:true,
  bindings:normalizeBindings(value?.bindings),touchHandedness:value?.touchHandedness==='left'?'left':'right',touchSize:value?.touchSize==='large'?'large':'normal',touchControls:['on','off','auto'].includes(value?.touchControls)?value.touchControls:'auto',aimMode:['mouse','keyboard','auto'].includes(value?.aimMode)?value.aimMode:'auto',hudScale:clamp(value?.hudScale,.85,1.5,1),
  masterVolume:clamp(value?.masterVolume,0,1,.65),sfxVolume:clamp(value?.sfxVolume,0,1,.8),musicVolume:clamp(value?.musicVolume,0,1,.35),muted:typeof value?.muted==='boolean'?value.muted:false,reducedEffects:typeof value?.reducedEffects==='boolean'?value.reducedEffects:false
 };
}
/** Trackpads can move client coordinates while reporting zero movementX/Y. */
export function pointerHasMoved(event,previous){
 if(!Number.isFinite(event?.clientX)||!Number.isFinite(event?.clientY))return false;
 if(!previous)return true;
 return Math.hypot(event.clientX-previous.x,event.clientY-previous.y)>.1||Math.abs(event.movementX??0)+Math.abs(event.movementY??0)>.2;
}
