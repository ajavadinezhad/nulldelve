import * as THREE from '../vendor/three.module.js';
import { weapon } from './weapons.js?v=critic-review-7';

const sphere = new THREE.SphereGeometry(1, 14, 10);
const cube = new THREE.BoxGeometry(1, 1, 1);
const capsule = new THREE.CapsuleGeometry(1, 1, 5, 10);
const up = new THREE.Vector3(0, 1, 0);
const materials = new Map();
function material(color, metalness = 0) {
  const key = `${color}:${metalness}`;
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: metalness ? .55 : .94, metalness }));
  return materials.get(key);
}
function shape(group, geometry, color, position, scale, metalness=0) {
  const mesh = new THREE.Mesh(geometry, material(color, metalness));
  mesh.position.set(...position); mesh.scale.set(...scale);
  mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
}
const round = (g,c,p,s) => shape(g,sphere,c,p,s);
const block = (g,c,p,s,m=0) => shape(g,cube,c,p,s,m);
function limb(g,a,b,r,color) {
  const v = new THREE.Vector3(...b).sub(new THREE.Vector3(...a));
  const mesh = shape(g, capsule, color, new THREE.Vector3(...a).addScaledVector(v,.5).toArray(), [r,Math.max(.015,v.length()-r*2)/3,r]);
  // CapsuleGeometry(1,1) has total length 3: stretch the shaft to the measured segment.
  mesh.scale.y = v.length()/3;
  mesh.quaternion.setFromUnitVectors(up,v.normalize()); return mesh;
}

/** A compact tactical operator built in metres, facing local -Z. */
export function soldier(color, scene) {
  const g = new THREE.Group(); g.name = 'tactical-operator';
  const friendly = color === 0xa4e4b4;
  const cloth = friendly ? 0x65705a : 0x776357;
  const darkCloth = friendly ? 0x414d3e : 0x51443d;
  const armor = friendly ? 0x3b4a40 : 0x4d3d36;
  const trim = 0x242c29, webbing = 0x8b8c6c, skin=0xa8886d;
  const hips = new THREE.Group(); hips.position.y=.79; g.add(hips);
  round(hips,darkCloth,[0,0,0],[.265,.15,.17]);
  block(hips,trim,[0,.06,0],[.53,.065,.35]);
  block(hips,0x9b9c83,[0,.06,-.18],[.11,.07,.025],.5);
  const legs=[];
  for(const side of [-1,1]) {
    const leg = new THREE.Group(); leg.position.set(side*.165,-.04,0); hips.add(leg);
    limb(leg,[0,0,0],[side*.025,-.31,.015],.105,cloth);
    const knee=new THREE.Group();knee.position.set(side*.025,-.32,.015);leg.add(knee);
    round(knee,trim,[0,.015,-.09],[.095,.11,.055]);
    block(knee,0x717564,[0,.025,-.135],[.12,.095,.025]);
    limb(knee,[0,-.035,.015],[0,-.29,.01],.078,darkCloth);
    round(knee,trim,[0,-.33,-.065],[.105,.09,.18]);
    block(knee,0x151b19,[0,-.38,-.055],[.2,.045,.31]);
    for(let i=0;i<3;i++)block(knee,0x686d5d,[0,-.265,-.18+i*.035],[.12,.012,.009]);
    round(leg,cloth,[side*.095,-.15,.03],[.045,.12,.11]);
    block(leg,webbing,[side*.126,-.15,-.015],[.015,.035,.1]);
    legs.push({leg,knee});
  }
  const upper=new THREE.Group();upper.position.y=.83;g.add(upper);
  round(upper,cloth,[0,.27,0],[.29,.33,.185]);
  // Plate carrier, shoulder straps, belt pouches and backpack.
  round(upper,armor,[0,.26,-.12],[.275,.275,.125]);
  block(upper,armor,[0,.31,-.217],[.4,.33,.045]);
  block(upper,0x727e67,[0,.43,-.244],[.22,.035,.015]);
  for(const x of [-.16,.16]) {
    block(upper,webbing,[x,.49,-.02],[.055,.04,.38]);
    block(upper,trim,[x,.46,-.18],[.065,.055,.055]);
  }
  for(const x of [-.145,0,.145]) {
    round(upper,darkCloth,[x,.13,-.235],[.064,.12,.06]);
    block(upper,webbing,[x,.18,-.292],[.085,.025,.012]);
  }
  for(const side of [-1,1]) {
    round(upper,darkCloth,[side*.29,.12,.04],[.065,.13,.1]);
    block(upper,webbing,[side*.345,.17,.04],[.02,.025,.13]);
  }
  round(upper,darkCloth,[0,.26,.225],[.24,.255,.12]);
  round(upper,armor,[0,.22,.32],[.195,.17,.065]);
  for(const x of [-.12,.12])block(upper,webbing,[x,.3,.357],[.035,.22,.02]);
  block(upper,trim,[.24,.42,.16],[.09,.15,.07]);
  limb(upper,[.24,.46,.16],[.24,.8,.17],.012,trim);
  // Neck, jaw, ears and helmet; small contrasting fittings remain legible from overhead.
  round(upper,skin,[0,.57,-.01],[.09,.1,.09]);
  round(upper,skin,[0,.72,-.025],[.155,.2,.15]);
  round(upper,0x82654f,[0,.66,-.125],[.11,.09,.05]);
  round(upper,trim,[0,.725,-.145],[.15,.065,.035]);
  block(upper,0x1c2927,[0,.77,-.173],[.235,.055,.03],.25);
  const helmet=round(upper,cloth,[0,.84,.005],[.205,.15,.225]);
  const helmetRim=round(upper,armor,[0,.785,.005],[.215,.055,.235]);
  // Sewn helmet strips and retention mount.
  block(upper,webbing,[0,.984,-.005],[.055,.015,.27]);
  block(upper,trim,[0,.87,-.219],[.085,.09,.035]);
  block(upper,0x848b78,[0,.92,-.23],[.04,.03,.035],.4);
  for(const side of [-1,1]){
    round(upper,trim,[side*.186,.735,.005],[.046,.09,.07]);
    block(upper,webbing,[side*.192,.85,.04],[.035,.08,.14]);
  }
  limb(upper,[-.2,.71,-.02],[-.14,.66,-.17],.012,trim);
  round(upper,trim,[-.13,.66,-.18],[.025,.02,.025]);
  // Bent elbows and gloved hands form a deliberate two-handed firing stance.
  const arms=new THREE.Group();upper.add(arms);
  for(const side of [-1,1])round(arms,cloth,[side*.29,.4,-.01],[.115,.13,.12]);
  limb(arms,[.30,.38,-.03],[.37,.22,-.22],.085,cloth);
  round(arms,trim,[.37,.22,-.22],[.085,.08,.09]);
  limb(arms,[.37,.22,-.22],[.28,.31,-.52],.07,cloth);
  round(arms,trim,[.28,.31,-.53],[.075,.065,.095]);
  limb(arms,[-.30,.38,-.03],[-.30,.20,-.25],.085,cloth);
  round(arms,trim,[-.30,.20,-.25],[.085,.08,.09]);
  limb(arms,[-.30,.20,-.25],[.20,.30,-.73],.067,cloth);
  round(arms,trim,[.20,.30,-.75],[.075,.065,.095]);
  // Muted identification panels distinguish allies without making armour fluorescent.
  block(arms,friendly?0x91bba1:0xb0795e,[-.397,.42,-.015],[.025,.09,.13]);
  block(upper,friendly?0xaccbb1:0xb48972,[0,.40,.365],[.11,.055,.012]);
  const gunMount=new THREE.Vector3(.28,1.18,-.31);
  const gun=weapon('rifle');gun.position.copy(gunMount);g.add(gun);
  const flash=new THREE.Mesh(new THREE.ConeGeometry(.15,.48,6),new THREE.MeshBasicMaterial({color:0xffd386}));
  flash.rotation.x=-Math.PI/2;flash.position.set(.28,1.18,-1.56);flash.visible=false;g.add(flash);
  Object.assign(g.userData,{flash,flashTime:0,gunMount,upper,hips,legs,arms,phase:0,idle:0,lastPosition:null,moveBlend:0,recoil:0,helmet,helmetRim});
  scene.add(g);return g;
}

/** Call after updating the root position and aim angle; no gameplay state is changed here. */
export function animateSoldier(mesh,dt,reloading=false) {
  const u=mesh.userData;if(!u.upper||dt<=0)return;
  dt=Math.min(dt,.05);u.idle+=dt;
  const last=u.lastPosition;
  const dx=last?mesh.position.x-last.x:0,dz=last?mesh.position.z-last.z:0;
  const speed=Math.min(8,Math.hypot(dx,dz)/dt);
  u.lastPosition={x:mesh.position.x,z:mesh.position.z};
  u.moveBlend+=(Math.min(1,speed/2)-u.moveBlend)*(1-Math.exp(-12*dt));
  u.phase+=dt*(5+speed*1.9)*u.moveBlend;
  if(speed>.1){
    const localAngle=Math.atan2(-dx,-dz)-mesh.rotation.y;
    u.hips.rotation.y=Math.atan2(Math.sin(localAngle),Math.cos(localAngle));
  }
  for(let i=0;i<2;i++){
    const stride=Math.sin(u.phase+i*Math.PI)*u.moveBlend;
    u.legs[i].leg.rotation.x=stride*.45;
    u.legs[i].knee.rotation.x=Math.max(0,-stride)*.55;
  }
  u.upper.position.y=.83+Math.sin(u.phase*2)*.018*u.moveBlend+Math.sin(u.idle*2)*.006;
  u.upper.rotation.z=Math.sin(u.phase)*.025*u.moveBlend;
  if(u.flashTime>0)u.recoil=.055;
  u.recoil*=Math.exp(-23*dt);
  const gun=mesh.getObjectByName('weapon');
  if(gun){gun.position.copy(u.gunMount);gun.position.z+=u.recoil;gun.rotation.x=reloading?-.28+Math.sin(u.idle*7)*.06:0;gun.rotation.z=reloading?-.22:0;}
  u.arms.rotation.x=reloading?-.16:0;
  u.upper.position.z=u.recoil*.35;
}
