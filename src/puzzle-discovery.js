import {compatibleStorage} from './storage-compat.js?v=audit-r21';
export const PUZZLE_DISCOVERY_KEY='nulldelve.puzzle-discovery.v1';
const kinds={glyph:'glyph-cipher',relay:'timed-relays',power:'power-sequence',valve:'pressure-balance',wire:'wire-network',artifact:'artifact-seal'};
export function encounteredPuzzles({player,devices=[],plates=[],visible=()=>false}){
 if(!player)return [];
 const near=p=>Number.isFinite(p.x)&&Number.isFinite(p.z)&&Math.hypot(player.x-p.x,player.z-p.z)<=3&&visible(p.x,p.z);
 const found=new Set();if(plates.some(near))found.add('pressure-plates');
 for(const device of devices){if(!near(device))continue;const id=device.presetId??kinds[device.kind]??(['hospitalSterile','hospitalValveA','hospitalValveB','hospitalValveC'].includes(device.task)?'hospital-pressure':['commandFuse','hospitalFuse','hospitalPower'].includes(device.task)?'fuse-hunt':null);if(id)found.add(id);}
 return [...found];
}
export function createPuzzleDiscovery(storage){
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}storage=compatibleStorage(storage);
 const known=new Set();
 function reload(){try{const saved=JSON.parse(storage?.getItem(PUZZLE_DISCOVERY_KEY)||'null');if(saved?.version===1&&Array.isArray(saved.encountered))for(const id of saved.encountered)if(typeof id==='string'&&id.length<100)known.add(id);}catch{}return [...known];}
 function record(ids){if(ids.every(id=>known.has(id)))return false;reload();let changed=false;for(const id of ids)if(typeof id==='string'&&!known.has(id)){known.add(id);changed=true;}if(changed)try{storage?.setItem(PUZZLE_DISCOVERY_KEY,JSON.stringify({version:1,encountered:[...known]}));}catch{}return changed;}
 return {list:reload,record};
}
