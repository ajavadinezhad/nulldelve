import * as THREE from './vendor/three.module.js';
export const BARREL_POINTS=Object.freeze([[12,22],[12,14],[19,14],[27,30],[43,5],[67,16],[67,36],[95,36],[43,61],[67,61],[95,61],[95,16]].map(Object.freeze));
export const BARREL_RADIUS=.38,BARREL_HP=3,BARREL_BLAST_RADIUS=3.4;
const idFor=index=>'barrel-'+(index+1);
/** A supplied snapshot must be complete when a live ID list is available. */
export function validateBarrelSnapshot(saved,knownIds){
 if(saved===undefined)return true;
 if(!Array.isArray(saved)||saved.length>BARREL_POINTS.length)return false;
 const allowed=new Set(knownIds??BARREL_POINTS.map((_,i)=>idFor(i))),seen=new Set();
 for(const value of saved){if(!value||!allowed.has(value.id)||seen.has(value.id)||!Number.isFinite(value.hp)||value.hp<0||value.hp>BARREL_HP)return false;seen.add(value.id);}
 return knownIds===undefined||saved.length===allowed.size;
}
/** Static fuel drums with synchronous queued chain reactions and shared visuals. */
export function createExplosiveBarrels(scene,{blocked=()=>false,lineOfSight=()=>true,onBlast=()=>{}}={}){
 const state=[],views=new Map(),detonated=new Set(),queued=new Set(),queue=[];
 let processing=false;
 const geometry=scene?{body:new THREE.CylinderGeometry(.35,.35,.95,14),band:new THREE.CylinderGeometry(.367,.367,.055,14),lid:new THREE.CylinderGeometry(.352,.352,.035,14),diamond:new THREE.PlaneGeometry(.26,.26),stripe:new THREE.BoxGeometry(.035,.17,.012),cap:new THREE.CylinderGeometry(.055,.055,.027,8)}:null;
 const materials=scene?{fuel:new THREE.MeshStandardMaterial({color:0x8c332a,roughness:.68,metalness:.46}),band:new THREE.MeshStandardMaterial({color:0x252a27,roughness:.52,metalness:.68}),lid:new THREE.MeshStandardMaterial({color:0x633029,roughness:.72,metalness:.44}),hazard:new THREE.MeshStandardMaterial({color:0xc8a54a,roughness:.8,metalness:.08}),symbol:new THREE.MeshStandardMaterial({color:0x24271d,roughness:.85})}:null;
 function build(barrel){
  if(!scene)return;const group=new THREE.Group();group.name=barrel.id;group.visible=false;group.position.set(barrel.x,0,barrel.z);
  function mesh(key,material,x,y,z){const part=new THREE.Mesh(geometry[key],materials[material]);part.position.set(x,y,z);part.castShadow=part.receiveShadow=true;group.add(part);return part;}
  mesh('body','fuel',0,.49,0);for(const y of [.19,.76])mesh('band','band',0,y,0);mesh('lid','lid',0,.982,0);mesh('cap','band',.15,1.015,0);
  for(const side of [1,-1]){const diamond=mesh('diamond','hazard',0,.49,.354*side);diamond.rotation.set(0,side===1?0:Math.PI,Math.PI/4);mesh('stripe','symbol',0,.51,.365*side);}
  const top=mesh('diamond','hazard',0,1.006,0);top.rotation.set(-Math.PI/2,0,Math.PI/4);const mark=mesh('stripe','symbol',0,1.017,0);mark.rotation.x=-Math.PI/2;
  scene.add(group);views.set(barrel.id,group);
 }
 function inPuzzleRoute(x,z){return (x>3.2-BARREL_RADIUS&&x<7.2+BARREL_RADIUS&&z>22.5-BARREL_RADIUS&&z<24.5+BARREL_RADIUS)||(x>10-BARREL_RADIUS&&x<12+BARREL_RADIUS&&z>26.8-BARREL_RADIUS&&z<30.5+BARREL_RADIUS);}
 function safe(x,z){return !blocked(x,z,BARREL_RADIUS)&&!inPuzzleRoute(x,z)&&Math.hypot(x-7,z-29)>1.2+BARREL_RADIUS&&state.every(other=>Math.hypot(x-other.x,z-other.z)>BARREL_RADIUS*2+.35);}
 for(let index=0;index<BARREL_POINTS.length;index++){
  const [x,z]=BARREL_POINTS[index];let point=safe(x,z)?{x,z}:null;
  for(let i=1;i<=144&&!point;i++){const radius=3*Math.sqrt(i/144),angle=i*2.399963229728653,cx=x+Math.cos(angle)*radius,cz=z+Math.sin(angle)*radius;if(safe(cx,cz))point={x:cx,z:cz};}
  if(!point)continue;const barrel={id:idFor(index),kind:'barrel',...point,hp:BARREL_HP,maxHp:BARREL_HP,radius:BARREL_RADIUS};state.push(barrel);build(barrel);
 }
 function detach(barrel){const view=views.get(barrel.id);if(view){view.visible=false;scene?.remove(view);}}
 function enqueue(barrel){if(!barrel||detonated.has(barrel.id)||queued.has(barrel.id))return;queued.add(barrel.id);queue.push(barrel);}
 function drain(){
  if(processing)return 0;processing=true;let count=0;
  try{while(queue.length){const barrel=queue.shift();queued.delete(barrel.id);if(detonated.has(barrel.id))continue;barrel.hp=0;detonated.add(barrel.id);detach(barrel);count++;
   onBlast({x:barrel.x,z:barrel.z,radius:BARREL_BLAST_RADIUS,damage:10});
   for(const other of state)if(other.hp>0&&Math.hypot(other.x-barrel.x,other.z-barrel.z)<=BARREL_BLAST_RADIUS&&lineOfSight(barrel.x,barrel.z,other.x,other.z))enqueue(other);
  }}finally{processing=false;}return count;
 }
 function findHit(x,z,padding=.12){return state.find(barrel=>barrel.hp>0&&Math.hypot(x-barrel.x,z-barrel.z)<=barrel.radius+Math.max(0,padding))??null;}
 function hit(value,damage){const barrel=typeof value==='string'?state.find(item=>item.id===value):state.find(item=>item===value);if(!barrel||barrel.hp<=0||!Number.isFinite(damage)||damage<=0)return 0;barrel.hp=Math.max(0,barrel.hp-damage);if(barrel.hp>0)return 0;enqueue(barrel);return drain();}
 function explodeNear(x,z,radius){if(!Number.isFinite(x)||!Number.isFinite(z)||!Number.isFinite(radius)||radius<0)return 0;for(const barrel of state)if(barrel.hp>0&&Math.hypot(barrel.x-x,barrel.z-z)<=radius+barrel.radius&&lineOfSight(x,z,barrel.x,barrel.z))enqueue(barrel);return drain();}
 function update(visible=()=>true){for(const barrel of state){const view=views.get(barrel.id);if(view)view.visible=barrel.hp>0&&!!visible(barrel.x,barrel.z);}}
 function serialize(){return state.map(barrel=>({id:barrel.id,hp:barrel.hp}));}
 function restore(saved){
  if(!validateBarrelSnapshot(saved,state.map(barrel=>barrel.id)))return false;
  const hp=new Map(saved?.map(value=>[value.id,value.hp])??state.map(barrel=>[barrel.id,BARREL_HP]));queue.length=0;queued.clear();detonated.clear();
  for(const barrel of state){barrel.hp=hp.get(barrel.id);const view=views.get(barrel.id);if(barrel.hp<=0){detonated.add(barrel.id);detach(barrel);}else if(view){scene?.add(view);view.visible=false;}}return true;
 }
 function dispose(){for(const view of views.values())scene?.remove(view);views.clear();queue.length=0;queued.clear();if(geometry)for(const value of Object.values(geometry))value.dispose();if(materials)for(const value of Object.values(materials))value.dispose();}
 return {state,findHit,hit,explodeNear,update,serialize,restore,dispose};
}
