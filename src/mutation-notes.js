/** Encounter knowledge is optional, local and never exposes undiscovered enemies. */
export const MUTATION_NOTES_KEY='nulldelve.mutations.v1';
export const MUTATION_NOTES=Object.freeze([
 {id:'normal',name:'Worker',color:'#a66d45',warning:'Short bite windup',counter:'Keep moving and leave space before it lunges.'},
 {id:'runner',name:'Runner',color:'#c39450',warning:'Fast approach',counter:'Track its approach; avoid getting pinned against a wall.'},
 {id:'brute',name:'Brute',color:'#a45f4c',warning:'Heavy bite',counter:'Use its slower pace to make space while reloading.'},
 {id:'charger',name:'Charger',color:'#c17e51',warning:'Long rush marker',counter:'Step sideways after it commits. Solid cover stops the rush.'},
 {id:'sentinel',name:'Sentinel',color:'#9186b5',warning:'Resists stagger',counter:'Keep your distance during its longer bite windup; do not rely on shots to interrupt it.'},
 {id:'screecher',name:'Screecher',color:'#a47ac1',warning:'Radial warning',counter:'Solid cover blocks the shriek. Stagger interrupts its windup.'},
 {id:'leaper',name:'Leaper',color:'#d7d1bb',warning:'Landing marker',counter:'Move away from the locked landing point. Stagger interrupts takeoff.'},
 {id:'boss',name:'Matriarch',color:'#b35843',warning:'Large body, heavy bite',counter:'Keep an escape lane open and clear nearby smaller creatures.'},
].map(Object.freeze));
const valid=new Set(MUTATION_NOTES.map(n=>n.id));
export function createMutationNotes(storage){
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
 const known=new Set();
 function list(){try{const saved=JSON.parse(storage?.getItem(MUTATION_NOTES_KEY)||'null');if(saved?.version===1&&Array.isArray(saved.encountered))for(const id of saved.encountered)if(valid.has(id))known.add(id);}catch{}return MUTATION_NOTES.filter(n=>known.has(n.id));}
 list();
 return {list,record(enemies,visible){const seen=enemies.filter(e=>e.hp>0&&(e.spawnDelay??0)<=0&&valid.has(e.variant)&&!known.has(e.variant)&&visible(e.x,e.z)).map(e=>e.variant);if(!seen.length)return false;list();for(const id of seen)known.add(id);try{storage?.setItem(MUTATION_NOTES_KEY,JSON.stringify({version:1,encountered:[...known]}));}catch{}return true;}};
}
