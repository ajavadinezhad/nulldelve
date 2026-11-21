import {compatibleStorage} from './storage-compat.js?v=armory-r20';

/** One milestone-unlocked passive choice, never an XP tree or supply generator. */
export const FIELD_SKILLS_KEY='nulldelve.field-skills.v1';
export const FIELD_SKILLS=Object.freeze([
 {id:'none',name:'Standard kit',description:'No field skill equipped.',unlockAfter:null,icon:'armory'},
 {id:'medic',name:'Field Medic',description:'Medkits restore up to 65 health. Still consumes one kit.',unlockAfter:'breach',icon:'medkit'},
 {id:'runner',name:'Rapid Response',description:'Sprint 10% faster. Walking and crate movement stay unchanged.',unlockAfter:'command',icon:'move'},
 {id:'demolition',name:'Demolition Harness',description:'Grenade effects reach 15% farther. Keep clear: the danger radius grows too.',unlockAfter:'research',icon:'grenade'},
].map(Object.freeze));
const milestones=['breach','command','research'];
const effects=Object.freeze({
 none:Object.freeze({medkitHealing:50,sprintMultiplier:1,grenadeRadiusMultiplier:1}),
 medic:Object.freeze({medkitHealing:65,sprintMultiplier:1,grenadeRadiusMultiplier:1}),
 runner:Object.freeze({medkitHealing:50,sprintMultiplier:1.1,grenadeRadiusMultiplier:1}),
 demolition:Object.freeze({medkitHealing:50,sprintMultiplier:1,grenadeRadiusMultiplier:1.15}),
});
export function fieldSkillUnlocked(id,completed=[]){
 const skill=FIELD_SKILLS.find(item=>item.id===id);if(!skill)return false;
 if(!skill.unlockAfter)return true;
 return Array.isArray(completed)&&milestones.slice(0,milestones.indexOf(skill.unlockAfter)+1).every(milestone=>completed.includes(milestone));
}
export function normalizeFieldSkill(value,completed=[]){
 const id=value?.version===1&&typeof value.selected==='string'?value.selected:'none';
 return {version:1,selected:fieldSkillUnlocked(id,completed)?id:'none'};
}
/** Returns a frozen object: selecting a skill replaces, rather than stacks, effects. */
export function fieldSkillEffects(id){return effects[id]??effects.none;}
export function createFieldSkills(storage){
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}storage=compatibleStorage(storage);
 let memory={version:1,selected:'none'},volatile=false;
 function read(completed){
  if(!volatile)try{const raw=storage?.getItem(FIELD_SKILLS_KEY);if(raw!==null&&raw!==undefined)memory=normalizeFieldSkill(JSON.parse(raw),completed);}catch{}
  return normalizeFieldSkill(memory,completed);
 }
 function selected(completed=[]){return read(completed).selected;}
 function equip(id,completed=[]){
  const skill=FIELD_SKILLS.find(item=>item.id===id);
  if(!skill)return {ok:false,message:'That field skill is not available.'};
  if(!fieldSkillUnlocked(id,completed))return {ok:false,message:`Complete ${skill.unlockAfter[0].toUpperCase()+skill.unlockAfter.slice(1)} to unlock this field skill.`};
  memory={version:1,selected:id};
  try{if(!storage?.setItem)throw new Error('Unavailable');storage.setItem(FIELD_SKILLS_KEY,JSON.stringify(memory));volatile=false;}
  catch{volatile=true;}
  return {ok:true,message:volatile?'Field skill equipped for this session. Browser storage is unavailable.':`${skill.name} equipped.`};
 }
 function serialize(completed=[]){return {...read(completed)};}
 function restoreTransient(saved,completed=[]){
  if(saved?.version!==1||typeof saved.selected!=='string'||!fieldSkillUnlocked(saved.selected,completed))return false;
  memory=normalizeFieldSkill(saved,completed);volatile=true;return true;
 }
 return {selected,equip,serialize,restoreTransient,isSessionOnly:()=>volatile};
}
