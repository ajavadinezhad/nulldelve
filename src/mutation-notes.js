/** Encounter knowledge is optional, local and never exposes undiscovered enemies. */
export const MUTATION_NOTES_KEY='nulldelve.mutations.v1';
export const MUTATION_NOTES=Object.freeze([
 {id:'normal',name:'Worker',color:'#a66d45',warning:'Short bite windup',counter:'Keep moving and leave space before it lunges.'},
 {id:'runner',name:'Runner',color:'#c39450',warning:'Fast approach',counter:'Track its approach; avoid getting pinned against a wall.'},
 {id:'brute',name:'Brute',color:'#a45f4c',warning:'Heavy bite',counter:'Its front shell resists light rounds. Circle behind its slow turn or use penetrating fire.'},
 {id:'charger',name:'Charger',color:'#c17e51',warning:'Long rush marker',counter:'Step sideways after it commits. Cover stops the rush; an interrupted charger briefly resists stagger.'},
 {id:'sentinel',name:'Sentinel',color:'#9186b5',warning:'Resists stagger',counter:'Its heavy front shell resists light rounds. Use its slow turn to reach the rear; stagger resistance returns quickly.'},
 {id:'screecher',name:'Screecher',color:'#a47ac1',warning:'Radial warning',counter:'Cover blocks its shriek. An interrupt hardens its shell briefly; evade the next warning.'},
 {id:'leaper',name:'Leaper',color:'#d7d1bb',warning:'Landing marker',counter:'Leave the locked landing point. After an interrupt it briefly resists further stagger.'},
 {id:'spitter',name:'Spitter',color:'#d4a363',warning:'Locked ground circle',counter:'Leave the amber spit circle or use cover. After an interrupt it briefly resists stagger.'},
 {id:'mender',name:'Mender',color:'#9bd8e6',warning:'Pale repair pulse',counter:'Interrupt once, then separate it from injured creatures while its shell recovers. Three repair charges only.'},
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
