import * as THREE from './vendor/three.module.js';
export const FIRE_RADIUS=2.6,FIRE_DURATION=5.5,FIRE_TICK=.6;
const finite=(value,min,max)=>Number.isFinite(value)&&value>=min&&value<=max;
/** Persistent ground fire. The game owns damage, rewards, and actor health. */
export function createFireZones(scene,{isVisible=()=>true,lineOfSight=()=>true,onDamage=()=>{}}={}){
 let zones=[],phase=0,nextId=1,reducedEffects=false;
 const views=new Map(),dummy=new THREE.Object3D();
 const geometry=scene?{floor:new THREE.CircleGeometry(FIRE_RADIUS,28),ring:new THREE.RingGeometry(FIRE_RADIUS*.86,FIRE_RADIUS,28),flame:new THREE.ConeGeometry(1,1,4),ember:new THREE.SphereGeometry(1,5,3)}:null;
 const materials=scene?{
  floor:new THREE.MeshBasicMaterial({color:0x993c16,transparent:true,opacity:.23,depthWrite:false}),
  ring:new THREE.MeshBasicMaterial({color:0xbe601e,transparent:true,opacity:.17,depthWrite:false,side:THREE.DoubleSide}),
  flame:new THREE.MeshBasicMaterial({color:0xe78226,transparent:true,opacity:.58,depthWrite:false}),
  ember:new THREE.MeshBasicMaterial({color:0xf0a652,transparent:true,opacity:.68,depthWrite:false})
 }:null;
 function build(zone){
  if(!scene)return;
  const group=new THREE.Group();group.name='incendiary-ground-fire';group.position.set(zone.x,0,zone.z);
  const floor=new THREE.Mesh(geometry.floor,materials.floor),ring=new THREE.Mesh(geometry.ring,materials.ring);floor.rotation.x=ring.rotation.x=-Math.PI/2;floor.position.y=.022;ring.position.y=.028;group.add(floor,ring);
  const flames=new THREE.InstancedMesh(geometry.flame,materials.flame,14),embers=new THREE.InstancedMesh(geometry.ember,materials.ember,10);flames.frustumCulled=embers.frustumCulled=false;group.add(flames,embers);scene.add(group);views.set(zone.id,{group,flames,embers});
 }
 function remove(zone){const view=views.get(zone.id);if(view){scene?.remove(view.group);view.flames.dispose();view.embers.dispose();views.delete(zone.id);}}
 function render(){
  for(const zone of zones){const view=views.get(zone.id);if(!view)continue;
   view.group.visible=!!isVisible(zone.x,zone.z);if(!view.group.visible)continue;
   const time=FIRE_DURATION-zone.remaining,fade=Math.min(1,zone.remaining),seed=zone.id*1.731;
   view.flames.count=reducedEffects?5:14;view.embers.count=reducedEffects?2:10;
   for(let i=0;i<view.flames.count;i++){
    const angle=i*2.399963229728653+seed,radius=Math.sqrt((i+.5)/14)*2.15,height=(.28+.42*(.5+.5*Math.sin(time*5+i*2.3)))*fade*(reducedEffects ? .65 : 1);
    dummy.position.set(Math.cos(angle)*radius,.045+height/2,Math.sin(angle)*radius);dummy.rotation.set(.08*Math.sin(time*3+i),angle,.07*Math.cos(time*4+i));dummy.scale.set(.11,height,.11);dummy.updateMatrix();view.flames.setMatrixAt(i,dummy.matrix);
   }
   for(let i=0;i<view.embers.count;i++){
    const angle=i*2.17+seed,cycle=(time*.55+i*.137)%1,radius=.45+(i%4)*.45;
    dummy.position.set(Math.cos(angle)*radius,.10+cycle*.9,Math.sin(angle)*radius);dummy.rotation.set(0,0,0);dummy.scale.setScalar((.012+.015*(1-cycle))*fade);dummy.updateMatrix();view.embers.setMatrixAt(i,dummy.matrix);
   }
   view.flames.instanceMatrix.needsUpdate=true;view.embers.instanceMatrix.needsUpdate=true;
  }
 }
 function burst(x,z){if(!finite(x,-10000,10000)||!finite(z,-10000,10000))return null;const zone={id:nextId++,x,z,remaining:FIRE_DURATION};zones.push(zone);build(zone);render();return zone.id;}
 function tick(){
  // One global interval and one pass over actors prevent overlapping fire stacking.
  const damaged=new Set();
  for(const enemy of enemiesForTick){if(!enemy||damaged.has(enemy)||enemy.hp<=0||(enemy.spawnDelay??0)>0)continue;
   if(zones.some(zone=>zone.remaining>0&&Math.hypot(enemy.x-zone.x,enemy.z-zone.z)<=FIRE_RADIUS&&lineOfSight(zone.x,zone.z,enemy.x,enemy.z))){damaged.add(enemy);onDamage(enemy,1);}
  }
 }
 let enemiesForTick=[];
 function update(dt,enemies=[]){
  if(!Number.isFinite(dt)||dt<=0){render();return;}
  let remaining=Math.min(dt,60);enemiesForTick=Array.isArray(enemies)?enemies:[];
  while(remaining>1e-8&&zones.length){
   const step=Math.min(remaining,FIRE_TICK-phase);for(const zone of zones)zone.remaining-=step;phase+=step;remaining-=step;
   if(phase>=FIRE_TICK-1e-8){phase=0;tick();}
   for(const zone of zones)if(zone.remaining<=1e-8)remove(zone);zones=zones.filter(zone=>zone.remaining>1e-8);
  }
  enemiesForTick=[];if(!zones.length)phase=0;render();
 }
 function serialize(){return {version:1,phase,nextId,zones:zones.map(zone=>({...zone}))};}
 function clear(){for(const zone of zones)remove(zone);zones=[];phase=0;nextId=1;}
 function restore(saved){
  if(!saved||saved.version!==1||!Array.isArray(saved.zones)||saved.zones.length>256||!finite(saved.phase,0,FIRE_TICK)||!Number.isSafeInteger(saved.nextId)||saved.nextId<1)return false;
  const ids=new Set(),restored=[];
  for(const zone of saved.zones){if(!zone||!Number.isSafeInteger(zone.id)||zone.id<1||ids.has(zone.id)||!finite(zone.x,-10000,10000)||!finite(zone.z,-10000,10000)||!Number.isFinite(zone.remaining))return false;ids.add(zone.id);if(zone.remaining>0)restored.push({id:zone.id,x:zone.x,z:zone.z,remaining:Math.min(FIRE_DURATION,zone.remaining)});}
  clear();zones=restored;phase=Math.min(FIRE_TICK-1e-8,saved.phase);nextId=Math.max(saved.nextId,...restored.map(zone=>zone.id+1));for(const zone of zones)build(zone);render();return true;
 }
 function setReducedEffects(value){reducedEffects=!!value;render();}
 function dispose(){clear();if(geometry)for(const value of Object.values(geometry))value.dispose();if(materials)for(const value of Object.values(materials))value.dispose();}
 return {burst,update,serialize,restore,clear,setReducedEffects,dispose};
}
