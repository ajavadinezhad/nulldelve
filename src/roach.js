import * as THREE from '../vendor/three.module.js';

const shellGeometry=new THREE.SphereGeometry(1,14,10);
const segmentGeometry=new THREE.CylinderGeometry(1,1,1,5);
const UP=new THREE.Vector3(0,1,0);
const mats={
 shell:new THREE.MeshStandardMaterial({color:0x4e291b,roughness:.43,metalness:.12}),
 wing:new THREE.MeshStandardMaterial({color:0x6d3b23,roughness:.5,metalness:.08}),
 ridge:new THREE.MeshStandardMaterial({color:0x94603a,roughness:.65}),
 dark:new THREE.MeshStandardMaterial({color:0x221811,roughness:.82}),
 leg:new THREE.MeshStandardMaterial({color:0x7b5030,roughness:.75}),
 eye:new THREE.MeshStandardMaterial({color:0x15110b,roughness:.18})
};

// Collision radii describe the body; thin legs and antennae may extend beyond them.
export const ROACH_VARIANTS={
 normal:{hp:2,speed:2.7,radius:.32,biteDamage:12,biteRange:1.05,attackCooldown:.85,stopDistance:.78,scale:1},
 runner:{hp:1,speed:4.4,radius:.24,biteDamage:7,biteRange:.9,attackCooldown:.55,stopDistance:.65,scale:.72},
 brute:{hp:6,speed:1.9,radius:.46,biteDamage:19,biteRange:1.25,attackCooldown:1.15,stopDistance:1,scale:1.4},
 charger:{hp:8,speed:2.25,radius:.43,biteDamage:17,biteRange:1.15,attackCooldown:1.3,stopDistance:.9,scale:1.25},
 sentinel:{hp:14,speed:1.55,radius:.56,biteDamage:23,biteRange:1.45,attackCooldown:1.6,stopDistance:1.1,scale:1.65},
 boss:{hp:24,speed:1.45,radius:.75,biteDamage:28,biteRange:1.65,attackCooldown:1.4,stopDistance:1.3,scale:2.2}
};
const palettes={
 charger:{shell:0x6e3917,wing:0xa56526,ridge:0xf3bb66,dark:0x30251d,leg:0x986741,eye:0xffc15b},
 sentinel:{shell:0x25384b,wing:0x405c78,ridge:0x9bb6c9,dark:0x172331,leg:0x637a94,eye:0x9ed8ee},
 runner:{shell:0x294d2a,wing:0x527b37,ridge:0x9cad5a,dark:0x17251a,leg:0x648047,eye:0xd6ad4e},
 brute:{shell:0x36233f,wing:0x593969,ridge:0x9a769e,dark:0x211a29,leg:0x75547c,eye:0xd3a357},
 boss:{shell:0x401719,wing:0x752a2a,ridge:0xb06c4d,dark:0x211213,leg:0x754032,eye:0xf2b05a}
};
const variantMaterials={normal:mats};
for(const [name,palette] of Object.entries(palettes)){
 variantMaterials[name]=Object.fromEntries(Object.entries(mats).map(([part,base])=>{
  const material=base.clone();material.color.set(palette[part]);
  if(name==='brute'||name==='boss'){material.roughness=.38;material.metalness=.18;}
  if(part==='eye'){material.emissive.set(palette.eye);material.emissiveIntensity=.35;}
  return [part,material];
 }));
}
const spikeGeometry=new THREE.ConeGeometry(1,1,6);
function spike(parent,start,end,r,material){const a=new THREE.Vector3(...start),v=new THREE.Vector3(...end).sub(a);const mesh=new THREE.Mesh(spikeGeometry,material);mesh.position.copy(a).addScaledVector(v,.5);mesh.scale.set(r,v.length(),r);mesh.quaternion.setFromUnitVectors(UP,v.normalize());mesh.castShadow=true;parent.add(mesh);}

function ellipsoid(parent,position,scale,material){const m=new THREE.Mesh(shellGeometry,mats[material]);m.position.set(...position);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function segment(parent,start,end,r,material='leg'){
 const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),v=b.clone().sub(a);
 const m=new THREE.Mesh(segmentGeometry,mats[material]);m.position.copy(a).addScaledVector(v,.5);m.scale.set(r,v.length(),r);m.quaternion.setFromUnitVectors(UP,v.normalize());m.castShadow=true;parent.add(m);return m;
}
/** Giant cockroach facing local -Z. A low body remains readable under the top-down fog. */
export function createRoach(scene,variant='normal'){
 if(!ROACH_VARIANTS[variant])variant='normal';const stats=ROACH_VARIANTS[variant];
 const root=new THREE.Group();root.name=`cockroach-${variant}`;root.scale.set((variant==='boss'?1:.94)*stats.scale,stats.scale,stats.scale);
 const body=new THREE.Group();root.add(body);
 ellipsoid(body,[0,.25,.12],[.31,.19,.46],'shell');
 // Overlapping wing cases and a pale seam make the back recognisable from above.
 for(const side of [-1,1]){const wing=ellipsoid(body,[side*.132,.315,.12],[.17,.105,.41],'wing');wing.rotation.z=side*-.13;}
 segment(body,[0,.427,-.20],[0,.427,.48],.009,'ridge');
 for(let i=0;i<3;i++){const z=.36+i*.065;segment(body,[-.20+i*.035,.34,z],[.20-i*.035,.34,z],.009,'ridge');}
 ellipsoid(body,[0,.29,-.29],[.27,.16,.21],'shell');
 ellipsoid(body,[0,.205,-.48],[.175,.12,.14],'dark');
 for(const side of [-1,1]){
  ellipsoid(body,[side*.127,.257,-.515],[.04,.036,.045],'eye');
  segment(body,[side*.055,.17,-.565],[side*.09,.12,-.63],.018,'ridge');
 }
 const legs=[];
 for(let i=0;i<3;i++)for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.22,.21,-.20+i*.25);body.add(leg);
  const fore=i===0?-.16:i===2?.15:0;
  segment(leg,[0,0,0],[side*.19,-.015,fore],.025);
  segment(leg,[side*.19,-.015,fore],[side*.31,-.18,fore+(i===0?-.13:.12)],.017);
  // Terminal spur is long enough to read without adding separate small barbs.
  segment(leg,[side*.31,-.18,fore+(i===0?-.13:.12)],[side*.33,-.19,fore+(i===0?-.19:.17)],.009,'dark');
  legs.push({group:leg,side,index:i});
 }
 const antennae=[];
 for(const side of [-1,1]){
  const antenna=new THREE.Group();antenna.position.set(side*.085,.25,-.54);body.add(antenna);
  segment(antenna,[0,0,0],[side*.15,.13,-.13],.012,'ridge');
  segment(antenna,[side*.15,.13,-.13],[side*.25,.14,-.21],.007,'leg');
  antennae.push({group:antenna,side});
  segment(body,[side*.09,.19,.52],[side*.13,.2,.67],.012,'dark');
 }
 // Broader armour plates and longer chitin spines distinguish the heavy mutations.
 if(variant==='brute'||variant==='boss'||variant==='sentinel'){
  for(let i=0;i<3;i++){
   const plate=ellipsoid(body,[0,.39,-.10+i*.21],[.27-i*.025,.075,.15],'shell');
   plate.rotation.x=-.13;
   for(const side of [-1,1])segment(body,[side*.04,.459,-.15+i*.21],[side*.22,.43,-.08+i*.21],.012,'ridge');
  }
 }
 if(variant==='charger'){for(const side of [-1,1])spike(body,[side*.12,.25,-.48],[side*.17,.35,-.85],.055,mats.ridge);}
 if(variant==='sentinel'){for(let i=0;i<3;i++)for(const side of [-1,1])ellipsoid(body,[side*.23,.31,-.06+i*.22],[.13,.12,.17],'ridge');}
 if(variant==='boss'){
  for(let i=0;i<4;i++)for(const side of [-1,1]){
   const z=-.18+i*.19;
   spike(body,[side*.24,.32,z],[side*.42,.54,z+.06],.055,mats.ridge);
  }
  for(let i=0;i<3;i++)spike(body,[0,.43,-.08+i*.22],[0,.65,-.03+i*.22],.05,mats.ridge);
  for(const side of [-1,1])spike(body,[side*.09,.18,-.57],[side*.18,.22,-.72],.036,mats.ridge);
 }
 if(variant!=='normal')root.traverse(mesh=>{
  if(!mesh.isMesh)return;const part=Object.keys(mats).find(key=>mats[key]===mesh.material);
  if(part)mesh.material=variantMaterials[variant][part];
 });
 if(variant==='boss'){
  const telegraph=new THREE.Group();telegraph.name='nest-pulse-telegraph';telegraph.visible=false;telegraph.position.y=.018;telegraph.scale.setScalar(1/stats.scale);root.add(telegraph);
  const dangerMaterial=new THREE.MeshBasicMaterial({color:0xef7c53,transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide});
  const danger=new THREE.Mesh(new THREE.RingGeometry(0,5.5,56,1,.6,Math.PI*2-1.2),dangerMaterial);danger.rotation.x=-Math.PI/2;telegraph.add(danger);
  const edgeMaterial=new THREE.MeshBasicMaterial({color:0xffb276,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide});
  const edge=new THREE.Mesh(new THREE.RingGeometry(5.37,5.5,56,1,.6,Math.PI*2-1.2),edgeMaterial);edge.rotation.x=-Math.PI/2;edge.position.y=.008;telegraph.add(edge);
  const safeMaterial=new THREE.MeshBasicMaterial({color:0x8de6b0,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide});
  const safe=new THREE.Mesh(new THREE.CircleGeometry(5.5,16,-.6,1.2),safeMaterial);safe.rotation.x=-Math.PI/2;safe.position.y=.006;telegraph.add(safe);
  root.userData.pulseTelegraph=telegraph;root.userData.pulseMaterial=dangerMaterial;
 }
 if(variant==='charger'){const warning=new THREE.Mesh(new THREE.PlaneGeometry(.8,6.2),new THREE.MeshBasicMaterial({color:0xffaa46,transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide}));warning.name='charge-warning';warning.rotation.x=-Math.PI/2;warning.position.set(0,.025,-3.1/stats.scale);warning.scale.set(1/stats.scale,1/stats.scale,1);warning.visible=false;root.add(warning);root.userData.chargeTelegraph=warning;}
 Object.assign(root.userData,{variant,body,legs,antennae,phase:0,time:0,lastPosition:null,speed:0,animationRate:variant==='runner'?1.3:variant==='boss'?.65:variant==='brute'?.8:1});
 scene.add(root);return root;
}
/** Call after copying enemy position and heading; pass zero delta when paused. */
export function animateRoach(mesh,dt){
 if(dt<=0)return;dt=Math.min(dt,.05);const u=mesh.userData;if(!u.legs)return;
 if(u.chargeTelegraph){u.chargeTelegraph.visible=(u.chargeWindup??0)>0;u.chargeTelegraph.material.opacity=.18+(u.chargeWindup??0)*.28;}
 const pulse=u.pulse;if(u.pulseTelegraph){u.pulseTelegraph.visible=!!pulse?.active;if(pulse?.active){u.pulseTelegraph.rotation.y=-pulse.angle-mesh.rotation.y;u.pulseMaterial.opacity=.15+(pulse.progress??0)*.2;}}
 const last=u.lastPosition;const moved=last?Math.hypot(mesh.position.x-last.x,mesh.position.z-last.z):0;
 u.lastPosition={x:mesh.position.x,z:mesh.position.z};u.speed+=(Math.min(1,moved/dt/1.1)-u.speed)*(1-Math.exp(-16*dt));
 u.time+=dt;u.phase+=dt*(8+u.speed*15)*(u.animationRate??1);
 for(const leg of u.legs){const phase=u.phase+leg.index*Math.PI*.8+(leg.side===1?Math.PI:0);leg.group.rotation.y=Math.sin(phase)*.3*u.speed;leg.group.rotation.z=leg.side*Math.max(0,Math.cos(phase))*.23*u.speed;}
 const windup=Math.max(0,Math.min(1,u.attackWindup??0));
 u.biteTime=Math.max(0,(u.biteTime??0)-dt);
 const lunge=u.biteTime>0?Math.sin((1-u.biteTime/.2)*Math.PI):0;
 u.body.rotation.x=-windup*.32+lunge*.12-(u.chargeWindup??0)*.18;
 u.body.position.z=-lunge*.14;
 u.body.position.y=Math.sin(u.phase*2)*.012*u.speed+Math.sin(u.time*3)*.004+windup*.1;
 u.body.rotation.z=Math.sin(u.phase)*.025*u.speed;
 for(const a of u.antennae){a.group.rotation.y=Math.sin(u.time*4+a.side)*.18+a.side*windup*.28;a.group.rotation.x=Math.sin(u.time*3.3+a.side)*.1;}
}
