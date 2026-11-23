const FAMILIES={escape:['pathfinder','quickloader','closequarters'],guard:['surgeon','plating','triage','sealant'],demolition:['ordnance','steadythrow','widearea','insulation']};
const INFO=Object.freeze({escape:Object.freeze({id:'escape',name:'Break away',icon:'move',cooldown:18,duration:.38}),guard:Object.freeze({id:'guard',name:'Field guard',icon:'armor',cooldown:28,duration:2.4}),demolition:Object.freeze({id:'demolition',name:'Remote charge',icon:'blast',cooldown:12,duration:0})});
const BASIC=Object.freeze({id:'escape',name:'Break away',icon:'move',cooldown:24,duration:.22});
export function abilityForSkill(skill){if(['none','medic','runner','demolition'].includes(skill))return BASIC;const kind=Object.keys(FAMILIES).find(k=>FAMILIES[k].includes(skill));return kind?INFO[kind]:null;}
export function createFieldAbility(){
 const cooldowns={escape:0,guard:0,demolition:0};let active=null;
 return {get active(){return active?{...active,direction:active.direction&&{...active.direction}}:null;},get damageMultiplier(){return active?.id==='guard'?.5:1;},status(skill){const info=abilityForSkill(skill);return info?{...info,remaining:cooldowns[info.id],ready:cooldowns[info.id]===0}:null;},
 activate(skill,{player,direction,aim,consumeGrenade=()=>false,onDetonate=()=>{},blocked=()=>false}={}){
  const info=abilityForSkill(skill);if(!info||active||cooldowns[info.id]>0||!player||player.hp<=0)return {ok:false};
  let dx=direction?.x??-Math.sin(player.angle||0),dz=direction?.z??-Math.cos(player.angle||0),length=Math.hypot(dx,dz);if(length<.01){dx=-Math.sin(player.angle||0);dz=-Math.cos(player.angle||0);length=1;}dx/=length;dz/=length;
  if(info.id==='demolition'){
   let x=aim?.x??player.x+dx*6,z=aim?.z??player.z+dz*6,d=Math.hypot(x-player.x,z-player.z);if(!Number.isFinite(d)||d<2)return {ok:false};if(d>8){x=player.x+(x-player.x)/d*8;z=player.z+(z-player.z)/d*8;}
   // Stop before blocking geometry; never detonate through a sealed door or wall.
   const steps=Math.max(1,Math.ceil(Math.hypot(x-player.x,z-player.z)/.15));let target={x:player.x,z:player.z};for(let i=1;i<=steps;i++){const p={x:player.x+(x-player.x)*i/steps,z:player.z+(z-player.z)*i/steps};if(blocked(p.x,p.z,.1))break;target=p;}if(Math.hypot(target.x-player.x,target.z-player.z)<2||!consumeGrenade())return {ok:false};cooldowns.demolition=info.cooldown;onDetonate(target);return {ok:true,id:info.id};
  }
  cooldowns[info.id]=info.cooldown;active={id:info.id,remaining:info.duration,direction:{x:dx,z:dz}};return {ok:true,id:info.id};
 },update(dt,{player,move=()=>{}}={}){if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.1);for(const key of Object.keys(cooldowns))cooldowns[key]=Math.max(0,cooldowns[key]-dt);if(active){const step=Math.min(dt,active.remaining);if(active.id==='escape'&&player)move(player,active.direction.x*8.5*step,active.direction.z*8.5*step,{escape:true});active.remaining=Math.max(0,active.remaining-step);if(active.remaining===0)active=null;}},cancel(){active=null;},serialize(){return {version:1,cooldowns:{...cooldowns}};},restore(value){if(value?.version!==1||!value.cooldowns||Object.keys(INFO).some(k=>!Number.isFinite(value.cooldowns[k])||value.cooldowns[k]<0||value.cooldowns[k]>(k==='escape'?24:INFO[k].cooldown)))return false;Object.assign(cooldowns,value.cooldowns);active=null;return true;}};
}
