import {compatibleStorage} from './storage-compat.js?v=operator-profile-r58';
import {formatKey} from './controls.js?v=operator-profile-r58';
const LESSONS=['move','aim','push','pull','puzzle','door','fire','reload','ability','loot','checkpoint','armory','medkit','grenade'];
const BASICS=['move','aim','puzzle','door','fire','reload','ability'];
/** Training observes real play. Acknowledging a card never fabricates an action,
 * spends supplies, changes puzzle state or unlocks progression. */
export function createOnboarding({storage,host,getBindings,getContext=()=>({})}){
 storage=compatibleStorage(storage);let enabled=false,touch=false,origin=null,previousCrates=[],baseline={},shown=null,hidden=false,state=null,highlight=null;
 const key=()=>`nulldelve.training.v2.${touch?'touch':'desktop'}`,legacy=()=>touch?'nulldelve.tutorial.touch.v1':'nulldelve.tutorial.v1';
 const fresh=()=>({version:2,enrolled:true,done:[],acknowledged:[],skipped:false});
 const known=id=>state?.done.includes(id)||state?.acknowledged.includes(id);
 function save(){try{storage?.setItem(key(),JSON.stringify(state));if(state.skipped||BASICS.every(known))storage?.setItem(legacy(),'done');}catch{}}
 function record(id,kind='done'){if(!state||!LESSONS.includes(id)||known(id))return;state[kind].push(id);save();}
 function clearHighlight(){highlight?.classList?.remove('training-focus');highlight=null;}
 function stop(){enabled=false;hidden=true;host.hidden=true;shown=null;clearHighlight();}
 function skip(){if(state){state.skipped=true;save();}stop();}
 function words(id){const b=getBindings(),k=name=>formatKey(b[name]);return {
 move:touch?'Move + turn with the movement stick. Push its edge to sprint.':`Move with ${['moveUp','moveLeft','moveDown','moveRight'].map(k).join(' / ')}. Hold ${k('sprint')} to sprint.`,
 aim:touch?'The stick turns your weapon. Fire is a separate button.':`Turn with the mouse or ${['aimUp','aimLeft','aimDown','aimRight'].map(k).join(' / ')}.`,
 push:'Walk into a movable crate to push it. Keep yourself an escape route.',
 pull:touch?'Hold Grab beside a crate, then move to pull. Release to let go.':`Hold ${k('interact')} beside a crate, then move to pull. Release to let go.`,
 puzzle:'Watch the equipment’s power indicators as you move nearby objects.',
 door:touch?'Approach a door or console, then tap its contextual Interact button.':`${k('interact')} operates a nearby door or console.`,
 fire:touch?'Hold Fire to shoot while keeping your facing. Drag Fire to turn; release to turn with movement.':`Click or ${k('fire')} fires. Aim at a creature; firing slows movement briefly.`,
 reload:touch?'Reload moves rounds from reserve into your magazine. Tap Reload when safe.':`${k('reload')} reloads from reserve. Find a safe moment; it takes time.`,
 ability:getContext().ability?.id==='guard'?`${touch?'Ability icon':k('ability')}: briefly reduces incoming damage. Wait for it to recharge.`:getContext().ability?.id==='demolition'?`${touch?'Ability icon':k('ability')}: a remote blast uses one frag grenade. Keep clear of it.`:touch?'Lightning: a free short escape through the swarm. It needs time to recharge.':`${k('ability')}: a free short escape through the swarm. It needs time to recharge.`,
 loot:'Walk over ammo cases and medical pouches to collect what you can use.',
 checkpoint:'Checkpoint saved. Continue returns here; you do not need to save manually.',
 armory:'Cash buys weapons, upgrades and supplies at base before your next operation.',
 medkit:touch?'The medkit icon uses one owned kit to restore missing health.':`${k('medkit')} uses one owned medkit to restore missing health.`,
 grenade:touch?'Hold the grenade icon to set range; release to throw. Stay clear of the blast.':`Hold ${k('grenade')} to set throw range; release to throw. Stay clear of the blast.`,
 }[id];}
 function draw(id){if(!enabled||hidden||!id){if(!host.hidden)host.hidden=true;clearHighlight();shown=null;return;}if(id===shown&&!host.hidden)return;shown=id;host.replaceChildren();host.hidden=false;host.setAttribute?.('aria-label','Field training');host.setAttribute?.('data-lesson',id);
  const doc=host.ownerDocument??document,text=doc.createElement('span');text.className='training-copy';text.textContent=words(id);const actions=doc.createElement('div');actions.className='training-actions';
  const acknowledge=doc.createElement('button');acknowledge.type='button';acknowledge.textContent='Got it';acknowledge.setAttribute?.('aria-label','Dismiss this lesson');acknowledge.onclick=()=>{record(id,'acknowledged');shown=null;host.hidden=true;clearHighlight();};
  const skipButton=doc.createElement('button');skipButton.type='button';skipButton.textContent='Skip training';skipButton.onclick=skip;actions.append(acknowledge,skipButton);host.append(text,actions);clearHighlight();
  const target={move:'.touch-stick-move',aim:'.touch-stick-move',fire:'.touch-fire',reload:'[data-action="reload"]',ability:'#use-skill',door:'[data-action="interact"]',pull:'[data-action="interact"]',medkit:'#use-medkit',grenade:'#use-grenade'}[id];if(target){highlight=doc.querySelector?.(target);highlight?.classList?.add('training-focus');}
 }
 function start(player,{force=false,touch:mode=false,eligible=true,returning=false}={}){touch=mode;hidden=false;shown=null;let saved=null,legacyDone=false;try{saved=JSON.parse(storage?.getItem(key())||'null');legacyDone=storage?.getItem(legacy())==='done';}catch{}
  const valid=saved?.version===2&&Array.isArray(saved.done)&&Array.isArray(saved.acknowledged);state=force?fresh():valid?{...fresh(),...saved,done:saved.done.filter(id=>LESSONS.includes(id)),acknowledged:saved.acknowledged.filter(id=>LESSONS.includes(id))}:fresh();
  enabled=force||(!state.skipped&&(valid||eligible&&!returning&&!legacyDone));origin={x:player.x,z:player.z};previousCrates=[];baseline={...getContext().stats};if(enabled)save();draw(enabled&&!known('move')?'move':null);return enabled;
 }
 return {start,replay:(player,options={})=>start(player,{...options,force:true}),skip,event(name){if(enabled)record(name==='crate'?'push':name);},hide(){hidden=true;host.hidden=true;clearHighlight();},refresh(){if(enabled&&!hidden){const id=shown;shown=null;draw(id);}},
 update(player,puzzle){if(!enabled||hidden)return;const c=getContext()??{},stats=c.stats??{};if(origin&&Math.hypot(player.x-origin.x,player.z-origin.z)>1)record('move');
  const crates=puzzle?.crates??[];for(let i=0;i<crates.length;i++){const old=previousCrates[i],crate=crates[i];if(old&&Math.hypot(crate.x-old.x,crate.z-old.z)>.015)record(puzzle.grabbed===i||puzzle.grabbed===crate.id?'pull':'push');}previousCrates=crates.map(crate=>({x:crate.x,z:crate.z}));
  if(puzzle?.plates?.some(plate=>plate.active))record('push');if(puzzle?.solved)record('puzzle');if((stats.shots??0)>(baseline.shots??0))record('fire');if(c.reloading)record('reload');if(c.abilityCooling)record('ability');if((stats.medkits??0)>(baseline.medkits??0))record('medkit');if((stats.grenades??0)>(baseline.grenades??0))record('grenade');
  if(!known('move'))return draw('move');if(!known('aim'))return draw('aim');const nearCrate=crates.some(crate=>!crate.seated&&Math.hypot(player.x-crate.x,player.z-crate.z)<3);
  if(!puzzle?.solved&&nearCrate&&!known('push'))return draw('push');if(!puzzle?.solved&&nearCrate&&known('push')&&!known('pull'))return draw('pull');if(!puzzle?.solved&&known('push')&&!known('puzzle'))return draw('puzzle');
  if(c.nearInteract&&!known('door'))return draw('door');if(c.combat&&!known('fire'))return draw('fire');if(c.weapon?.ammo<c.weapon?.capacity&&c.weapon?.reserve>0&&!known('reload'))return draw('reload');if(c.items?.medkit>0&&player.hp<player.maxHp&&!known('medkit'))return draw('medkit');if(c.combat&&((c.items?.grenade??0)+(c.items?.fireGrenade??0)>0)&&!known('grenade'))return draw('grenade');
  if(!c.combat&&c.abilityReady&&(c.ability?.id!=='demolition'||c.items?.grenade>0)&&!known('ability'))return draw('ability');if(!c.combat&&c.lootNearby&&!known('loot'))return draw('loot');if(!c.combat&&c.checkpoint&&puzzle?.solved&&!known('checkpoint'))return draw('checkpoint');if(!c.combat&&c.cash>0&&known('checkpoint')&&!known('armory'))return draw('armory');draw(null);
 },serialize:()=>state?JSON.parse(JSON.stringify(state)):null,get active(){return enabled&&!hidden;},get current(){return shown;}};
}
