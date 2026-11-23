import {compatibleStorage} from './storage-compat.js?v=critic-fixes-r54';

/** Earn one training point per completed operation; develop a branch before its advanced node. */
export const FIELD_SKILLS_KEY='nulldelve.field-skills.v1';
export const FIELD_SKILLS=Object.freeze([
 {id:'none',name:'Standard kit',description:'No field skill equipped.',unlockAfter:null,icon:'armory'},
 {id:'medic',name:'Field Medic',description:'Medkits restore up to 65 health. Still consumes one kit.',unlockAfter:'breach',icon:'medkit'},
 {id:'runner',name:'Rapid Response',description:'Sprint 10% faster. Walking and crate movement stay unchanged.',unlockAfter:'command',icon:'move'},
 {id:'demolition',name:'Demolition Harness',description:'Grenade effects reach 15% farther. Keep clear: the danger radius grows too.',unlockAfter:'research',icon:'grenade'},
].map(Object.freeze));
export const SKILL_BRANCHES=Object.freeze([
 {id:'medic',name:'Medicine',nodes:['medic','surgeon','plating','triage','sealant']},
 {id:'runner',name:'Mobility',nodes:['runner','pathfinder','quickloader','closequarters']},
 {id:'demolition',name:'Demolition',nodes:['demolition','ordnance','steadythrow','widearea','insulation']},
]);
const milestones=['breach','command','research','containment','nest','hospital','freight','signal'];
const advanced=[
 {id:'sealant',name:'Emergency Seal',description:'Medkits restore up to 75 health and repair 8 armor, capped at 60. Consumes a kit; no passive repair.',unlockAfter:'freight',requires:'surgeon',icon:'armor'},
 {id:'insulation',name:'Blast Insulation',description:'Take 25% less damage from your own explosions and ground fire. Retains 20% wider grenade effects; enemy attacks remain dangerous.',unlockAfter:'freight',requires:'ordnance',icon:'armor'},
 {id:'surgeon',name:'Trauma Specialist',description:'Medkits restore up to 75 health.',unlockAfter:'containment',requires:'medic',icon:'medkit'},
 {id:'pathfinder',name:'Pathfinder',description:'Sprint 15% faster. Crate movement stays unchanged.',unlockAfter:'nest',requires:'runner',icon:'move'},
 {id:'ordnance',name:'Ordnance Specialist',description:'Grenade effects and danger radius reach 20% farther.',unlockAfter:'hospital',requires:'demolition',icon:'grenade'},
 {id:'plating',name:'Reactive Plating',description:'Armor uses 20% less plating per hit. Retains Trauma Specialist: medkits restore up to 75 health.',unlockAfter:'nest',requires:'surgeon',icon:'armor'},
 {id:'triage',name:'Emergency Triage',description:'Medkits restore up to 85 health. Still consumes one kit; no passive regeneration.',unlockAfter:'hospital',requires:'surgeon',icon:'healing'},
 {id:'quickloader',name:'Tactical Reload',description:'Reload 12% faster with either gun. Retains Pathfinder: sprint 15% faster.',unlockAfter:'hospital',requires:'pathfinder',icon:'reload'},
 {id:'closequarters',name:'Close Quarters',description:'Knife strikes deal 2 damage. Retains Pathfinder: sprint 15% faster.',unlockAfter:'hospital',requires:'pathfinder',icon:'melee'},
 {id:'steadythrow',name:'Quick Cast',description:'Reach full throwing range 20% sooner. Retains Ordnance Specialist: effects and danger radius reach 20% farther.',unlockAfter:'hospital',requires:'ordnance',icon:'charge'},
 {id:'widearea',name:'Blast Control',description:'Grenade effects and danger radius reach 25% farther. Keep clear of your own blast.',unlockAfter:'hospital',requires:'ordnance',icon:'blast'},
];
export const SKILL_NODES=Object.freeze([...FIELD_SKILLS.slice(1),...advanced.filter(node=>!['sealant','insulation'].includes(node.id)),...advanced.filter(node=>['sealant','insulation'].includes(node.id))].map(Object.freeze));
export function trainingPoints(state,completed=[]){return Math.max(0,milestones.filter(id=>completed.includes(id)).length-(state?.learned?.length??0));}
export function skillLearnable(id,state,completed=[]){const node=SKILL_NODES.find(n=>n.id===id);return !!node&&fieldSkillUnlocked(id,completed)&&(!node.requires||state?.learned?.includes(node.requires))&&!state?.learned?.includes(id)&&trainingPoints(state,completed)>0;}

const baseEffects=Object.freeze({medkitHealing:50,sprintMultiplier:1,grenadeRadiusMultiplier:1,reloadMultiplier:1,meleeDamage:1,armorDamageMultiplier:1,grenadeChargeMultiplier:1,medkitArmor:0,selfExplosionMultiplier:1});
const effectOverrides={sealant:{medkitHealing:75,medkitArmor:8},insulation:{selfExplosionMultiplier:.75,grenadeRadiusMultiplier:1.2},none:{},medic:{medkitHealing:65},runner:{sprintMultiplier:1.1},demolition:{grenadeRadiusMultiplier:1.15},surgeon:{medkitHealing:75},pathfinder:{sprintMultiplier:1.15},ordnance:{grenadeRadiusMultiplier:1.2},plating:{armorDamageMultiplier:.8,medkitHealing:75},triage:{medkitHealing:85},quickloader:{reloadMultiplier:.88,sprintMultiplier:1.15},closequarters:{meleeDamage:2,sprintMultiplier:1.15},steadythrow:{grenadeChargeMultiplier:.8,grenadeRadiusMultiplier:1.2},widearea:{grenadeRadiusMultiplier:1.25}};
const effects=Object.freeze(Object.fromEntries(Object.entries(effectOverrides).map(([id,overrides])=>[id,Object.freeze({...baseEffects,...overrides})])));

export function fieldSkillUnlocked(id,completed=[]){
 const skill=[...FIELD_SKILLS,...advanced].find(item=>item.id===id);if(!skill)return false;
 if(!skill.unlockAfter)return true;
 return Array.isArray(completed)&&milestones.slice(0,milestones.indexOf(skill.unlockAfter)+1).every(milestone=>completed.includes(milestone));
}
export function normalizeFieldSkill(value,completed=[]){
 const valid=value?.version===1||value?.version===2;
 const selected=valid&&typeof value.selected==='string'&&fieldSkillUnlocked(value.selected,completed)?value.selected:'none';
 let learned=[];
 if(value?.version===1&&selected!=='none'&&FIELD_SKILLS.some(node=>node.id===selected))learned=[selected];
 if(value?.version===2&&Array.isArray(value.learned))for(const node of SKILL_NODES){if(value.learned.includes(node.id)&&skillLearnable(node.id,{learned},completed))learned.push(node.id);}
 return {version:2,selected:selected==='none'||learned.includes(selected)?selected:'none',learned,...(Number.isSafeInteger(value?.resetRevision)&&value.resetRevision>0?{resetRevision:value.resetRevision}:{})};
}
/** One specialization at a time, with bounded inherited benefits from its own branch. */
export function fieldSkillEffects(id){return Object.prototype.hasOwnProperty.call(effects,id)?effects[id]:effects.none;}
/** Shared final reload calculation for combat and armory; never compounds on repeat. */
export function effectiveFieldStats(stats={},skill='none'){
 const source=Number.isFinite(stats.unskilledReload)?stats.unskilledReload:stats.reload;
 const unskilledReload=Number.isFinite(source)?Math.max(.5,source):.5;
 const reloadMultiplier=Math.max(.88,Math.min(1,Number(fieldSkillEffects(skill).reloadMultiplier)||1));
 return {...stats,unskilledReload,reloadMultiplier,reload:Math.max(.5,unskilledReload*reloadMultiplier)};
}
export function createFieldSkills(storage){
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}storage=compatibleStorage(storage);
 let memory={version:2,selected:'none',learned:[]},volatile=false;
 function read(completed){
  if(!volatile)try{const raw=storage?.getItem(FIELD_SKILLS_KEY);if(raw!==null&&raw!==undefined)memory=normalizeFieldSkill(JSON.parse(raw),completed);}catch{}
  return normalizeFieldSkill(memory,completed);
 }
 function selected(completed=[]){return read(completed).selected;}
 function equip(id,completed=[]){
  const skill=[...FIELD_SKILLS,...advanced].find(item=>item.id===id);
  if(!skill)return {ok:false,message:'That field skill is not available.'};
  if(!fieldSkillUnlocked(id,completed))return {ok:false,message:`Complete ${skill.unlockAfter[0].toUpperCase()+skill.unlockAfter.slice(1)} to unlock this field skill.`};
  const state=read(completed);
  if(id!=='none'&&!state.learned.includes(id))return {ok:false,message:'Develop this skill first.'};
  memory={...state,selected:id};
  try{if(!storage?.setItem)throw new Error('Unavailable');storage.setItem(FIELD_SKILLS_KEY,JSON.stringify(memory));volatile=false;}
  catch{volatile=true;}
  return {ok:true,message:volatile?'Field skill equipped for this session. Browser storage is unavailable.':`${skill.name} equipped.`};
 }
 function learn(id,completed=[]){
  const state=read(completed);if(!skillLearnable(id,state,completed))return {ok:false,message:'Requires a training point, the earlier skill and its operation milestone.'};
  memory={...state,learned:[...state.learned,id],selected:id};
  try{if(!storage?.setItem)throw Error('Unavailable');storage.setItem(FIELD_SKILLS_KEY,JSON.stringify(memory));volatile=false;}catch{volatile=true;}
  return {ok:true,message:volatile?'Skill developed for this session.':'Skill developed and equipped.'};
 }
 function respec(completed=[],{atBase=false}={}){
  if(!atBase)return {ok:false,message:'Reset training at base before deployment.'};
  const current=read(completed);memory={version:2,selected:'none',learned:[],resetRevision:Math.max(Date.now(),(current.resetRevision??0)+1)};
  try{if(!storage?.setItem)throw Error('Unavailable');storage.setItem(FIELD_SKILLS_KEY,JSON.stringify(memory));volatile=false;}catch{volatile=true;}
  return {ok:true,message:volatile?'Training reset for this session.':'Training reset. All earned points returned.'};
 }
 function serialize(completed=[]){const state=read(completed);return {...state,learned:[...state.learned]};}
 function restoreTransient(saved,completed=[]){
  if(![1,2].includes(saved?.version)||typeof saved.selected!=='string'||!fieldSkillUnlocked(saved.selected,completed))return false;
  memory=normalizeFieldSkill(saved,completed);volatile=true;return true;
 }
 // A deployment is a new base choice, unlike a checkpoint's transient run state.
 function restoreDeployment(saved,completed=[]){
  if(![1,2].includes(saved?.version)||typeof saved.selected!=='string'||!fieldSkillUnlocked(saved.selected,completed))return false;
  // A stale deployment link can change the equipped choice, but cannot erase development.
  const incoming=normalizeFieldSkill(saved,completed),current=read(completed);
  if((incoming.resetRevision??0)<(current.resetRevision??0))return false;
  const learned=[...current.learned];for(const node of SKILL_NODES)if(incoming.learned.includes(node.id)&&skillLearnable(node.id,{learned},completed))learned.push(node.id);
  memory={version:2,selected:incoming.selected==='none'||learned.includes(incoming.selected)?incoming.selected:current.selected,learned,...((current.resetRevision??0)>0?{resetRevision:current.resetRevision}:{})};try{if(!storage?.setItem)throw Error('Unavailable');storage.setItem(FIELD_SKILLS_KEY,JSON.stringify(memory));volatile=false;}catch{volatile=true;}return true;
 }
 return {selected,equip,learn,respec,serialize,restoreTransient,restoreDeployment,isSessionOnly:()=>volatile};
}
