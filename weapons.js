import * as THREE from './vendor/three.module.js';

// Compact, locally modelled equipment. The muzzle points down local -Z.
const materials={
  receiver:new THREE.MeshStandardMaterial({color:0x30383a,metalness:.72,roughness:.4}),
  steel:new THREE.MeshStandardMaterial({color:0x6b7571,metalness:.8,roughness:.3}),
  black:new THREE.MeshStandardMaterial({color:0x151c1c,metalness:.25,roughness:.66}),
  polymer:new THREE.MeshStandardMaterial({color:0x76755b,metalness:.08,roughness:.78}),
  glass:new THREE.MeshStandardMaterial({color:0x55847d,metalness:.25,roughness:.12}),
  brass:new THREE.MeshStandardMaterial({color:0xbba56b,metalness:.72,roughness:.38}),
};
const cube=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,10),sphere=new THREE.SphereGeometry(1,7,5);
function part(group,geometry,material,x,y,z,sx,sy,sz){const mesh=new THREE.Mesh(geometry,materials[material]);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;}
function block(group,material,x,y,z,w,h,d){return part(group,cube,material,x,y,z,w,h,d);}
function tube(group,material,x,y,z,r,length){const mesh=part(group,cylinder,material,x,y,z,r,length,r);mesh.rotation.x=Math.PI/2;return mesh;}

export function weapon(type='rifle'){
  const group=new THREE.Group();group.name='weapon';group.userData.type=type;
  if(type==='rifle'||type==='carbine'){
    block(group,'receiver',0,0,-.23,.17,.18,.53);
    block(group,'black',0,.105,-.24,.12,.035,.59);
    // Ribbed fore-end, exposed barrel, and a bored muzzle cap.
    block(group,'polymer',0,-.005,-.62,.19,.19,.32);
    for(const z of [-.52,-.60,-.68]){block(group,'black',.101,0,z,.018,.055,.035);block(group,'black',-.101,0,z,.018,.055,.035);}
    tube(group,'steel',0,0,-.95,.035,.37);
    tube(group,'black',0,0,-1.17,.052,.11);
    tube(group,'black',0,0,-1.235,.027,.025);
    block(group,'receiver',0,.12,-.92,.045,.15,.065);
    block(group,'black',0,.205,-.92,.027,.025,.045);
    // Adjustable buttstock and textured recoil pad.
    tube(group,'steel',0,0,.15,.045,.25);
    block(group,'polymer',0,-.015,.33,.145,.17,.29);
    block(group,'black',0,-.015,.49,.16,.2,.04);
    block(group,'polymer',0,-.16,.01,.105,.25,.13).rotation.x=-.2;
    const magazine=block(group,'black',0,-.21,-.28,.12,.32,.19);magazine.rotation.x=-.13;
    for(const z of [-.33,-.25])block(group,'steel',.065,-.22,z,.01,.22,.016);
    // Trigger guard, charging handle, ejection port, and optic.
    block(group,'steel',.104,.005,-.16,.018,.07,.12);
    block(group,'black',.12,.06,-.04,.075,.035,.06);
    block(group,'black',0,-.14,-.09,.11,.025,.16);
    block(group,'black',0,.15,-.18,.11,.055,.18);
    tube(group,'receiver',0,.22,-.18,.073,.18);
    tube(group,'glass',0,.22,-.28,.052,.008);
    block(group,'black',0,.2,-.37,.04,.07,.04);
    group.userData.muzzle=new THREE.Vector3(0,0,-1.25);
  }else if(type==='smg'){
    block(group,'receiver',0,0,-.2,.16,.19,.43);block(group,'black',0,.115,-.2,.13,.035,.47);
    tube(group,'steel',0,0,-.52,.035,.24);tube(group,'black',0,0,-.68,.05,.10);
    block(group,'black',0,-.02,-.4,.18,.17,.18);block(group,'polymer',0,-.18,-.02,.10,.26,.12).rotation.x=-.12;
    block(group,'black',0,-.28,-.23,.10,.43,.12);block(group,'steel',.055,-.28,-.23,.014,.30,.05);
    for(const x of [-.065,.065])tube(group,'steel',x,0,.20,.02,.43);
    block(group,'black',0,-.02,.42,.17,.2,.035);block(group,'black',0,.16,-.12,.09,.055,.13);
    tube(group,'glass',0,.20,-.19,.04,.008);block(group,'black',0,.14,-.46,.03,.06,.035);
    group.userData.muzzle=new THREE.Vector3(0,0,-.74);
  }else if(type==='shotgun'){
    block(group,'receiver',0,0,-.12,.18,.20,.47);tube(group,'steel',0,.045,-.79,.047,.93);
    tube(group,'black',0,-.07,-.69,.048,.77);tube(group,'black',0,.045,-1.27,.057,.045);
    block(group,'polymer',0,-.07,-.65,.21,.17,.34);for(let i=0;i<5;i++)block(group,'black',0,-.07,-.52-i*.06,.222,.18,.018);
    block(group,'polymer',0,-.11,.04,.12,.25,.15).rotation.x=-.24;block(group,'polymer',0,-.02,.32,.15,.18,.38);block(group,'black',0,-.02,.53,.17,.22,.045);
    block(group,'brass',.105,.035,-.15,.025,.055,.14);block(group,'black',0,.11,-.26,.11,.025,.5);block(group,'brass',0,.11,-1.16,.025,.04,.025);
    group.userData.muzzle=new THREE.Vector3(0,.045,-1.3);
  }else if(type==='marksman'){
    // Long free-floating barrel, slim stock, and a recognisable magnified scope.
    block(group,'receiver',0,0,-.23,.15,.17,.62);block(group,'black',0,.105,-.27,.12,.035,.69);
    block(group,'polymer',0,-.01,-.68,.16,.16,.37);for(const z of [-.56,-.65,-.74])block(group,'black',.087,0,z,.018,.06,.035);
    tube(group,'steel',0,0,-1.10,.027,.53);tube(group,'black',0,0,-1.42,.047,.12);tube(group,'black',0,0,-1.49,.023,.025);
    block(group,'polymer',0,-.02,.32,.14,.16,.40);block(group,'black',0,-.025,.54,.16,.21,.045);block(group,'polymer',0,.085,.30,.12,.07,.20);
    block(group,'black',0,-.16,.025,.10,.25,.12).rotation.x=-.22;block(group,'black',0,-.19,-.24,.12,.24,.14);block(group,'steel',.065,-.19,-.24,.01,.15,.04);
    for(const z of [-.12,-.47])block(group,'black',0,.15,z,.08,.11,.055);
    tube(group,'receiver',0,.235,-.30,.065,.48);tube(group,'black',0,.235,-.59,.091,.14);tube(group,'glass',0,.235,-.665,.073,.009);tube(group,'black',0,.235,-.02,.077,.09);tube(group,'glass',0,.235,.03,.056,.009);
    block(group,'black',.075,.235,-.29,.065,.09,.09);block(group,'black',0,.315,-.29,.08,.07,.08);block(group,'steel',.1,.015,-.06,.055,.035,.13);
    group.userData.muzzle=new THREE.Vector3(0,0,-1.505);
  }else if(type==='lmg'){
    // Thick receiver, hanging ammunition box, feed belt, carry handle and folded bipod.
    block(group,'receiver',0,0,-.22,.24,.24,.61);block(group,'black',0,.14,-.23,.22,.06,.58);block(group,'steel',0,.18,-.13,.12,.04,.18);
    block(group,'polymer',0,-.015,-.66,.22,.21,.30);for(const z of [-.56,-.63,-.70])block(group,'black',0,-.01,z,.236,.22,.018);
    tube(group,'steel',0,.035,-.98,.047,.42);tube(group,'black',0,.035,-1.24,.062,.11);tube(group,'black',0,.035,-1.31,.036,.025);
    tube(group,'black',0,-.08,-.99,.028,.40);block(group,'receiver',0,.15,-1.12,.04,.18,.06);
    block(group,'polymer',0,-.025,.33,.18,.21,.36);block(group,'black',0,-.025,.53,.20,.24,.04);block(group,'black',0,-.17,.02,.12,.26,.14).rotation.x=-.2;
    block(group,'polymer',0,-.29,-.27,.32,.40,.31);block(group,'black',0,-.50,-.27,.34,.035,.33);for(const x of [-.10,0,.10])block(group,'steel',x,-.30,-.435,.018,.25,.015);
    block(group,'receiver',.15,.055,-.20,.07,.07,.18);for(let i=0;i<5;i++){const belt=block(group,'brass',.18+i*.033,.025-i*.025,-.20,.025,.025,.12);belt.rotation.z=-.2;}
    block(group,'black',0,.24,-.44,.10,.055,.27);for(const z of [-.56,-.33])block(group,'steel',0,.18,z,.04,.13,.045);
    for(const side of [-1,1]){const leg=block(group,'steel',side*.085,-.10,-.91,.025,.035,.48);leg.rotation.y=side*.13;block(group,'black',side*.115,-.12,-.66,.055,.05,.09);}
    block(group,'black',0,.18,-.15,.10,.05,.12);tube(group,'glass',0,.21,-.22,.04,.009);
    group.userData.muzzle=new THREE.Vector3(0,.035,-1.325);
  }else{
    block(group,'black',0,-.035,-.16,.14,.12,.34);
    block(group,'steel',0,.04,-.21,.15,.105,.44);
    block(group,'black',0,-.17,-.015,.13,.24,.15).rotation.x=-.22;
    block(group,'black',0,-.30,.015,.15,.03,.16);
    tube(group,'black',0,.035,-.445,.035,.03);
    block(group,'black',0,.108,-.38,.035,.035,.045);
    block(group,'black',0,.108,-.035,.11,.035,.04);
    block(group,'black',0,-.13,-.18,.115,.025,.17);
    block(group,'receiver',.08,.02,-.12,.015,.045,.09);
    for(const z of [-.07,-.025,.02])block(group,'black',.077,.045,z,.009,.07,.012);
    group.userData.muzzle=new THREE.Vector3(0,.035,-.46);
  }
  return group;
}

// Effects are ordinary depth-tested meshes beneath the visibility overlay. The caller
// should emit only the player's shots and pass dt=0 while the operation is paused.
export function createCombatEffects(scene){
  const particles=[],marks=[];
  const smokeMaterial=new THREE.MeshBasicMaterial({color:0xbfc8b9,transparent:true,opacity:.22,depthWrite:false});
  const dustMaterial=new THREE.MeshBasicMaterial({color:0xc3b894,transparent:true,opacity:.48,depthWrite:false});
  const markMaterial=new THREE.MeshBasicMaterial({color:0x101714,transparent:true,opacity:.7,depthWrite:false});
  const markGeometry=new THREE.CircleGeometry(.075,7);
  let serial=0;
  function removeParticle(index){const p=particles[index];scene.remove(p.mesh);if(p.ownMaterial)p.mesh.material.dispose();particles.splice(index,1);}
  function particle(geometry,material,position,velocity,life,kind){
    if(particles.length>=64)removeParticle(0);
    const ownMaterial=kind!=='brass',mesh=new THREE.Mesh(geometry,ownMaterial?material.clone():material);
    mesh.position.copy(position);mesh.castShadow=false;scene.add(mesh);
    const p={mesh,velocity,life,maxLife:life,kind,ownMaterial,spin:((serial++%5)+3),bounced:false};particles.push(p);return p;
  }
  function shot(x,z,angle,type='rifle'){
    const forward=new THREE.Vector3(-Math.sin(angle),0,-Math.cos(angle)),right=new THREE.Vector3(Math.cos(angle),0,-Math.sin(angle));
    const origin=new THREE.Vector3(x,1.18,z).addScaledVector(right,.28).addScaledVector(forward,.5);
    const casing=particle(cylinder,materials.brass,origin,new THREE.Vector3(right.x*(1.6+(serial%3)*.2),1.6,right.z*1.6),5,'brass');
    casing.mesh.scale.set(.027,.11,.027);casing.mesh.rotation.z=Math.PI/2;
    const muzzle=new THREE.Vector3(x,1.18,z).addScaledVector(right,.28).addScaledVector(forward,['rifle','carbine','shotgun','marksman','lmg'].includes(type)?1.56:.77);
    const puff=particle(sphere,smokeMaterial,muzzle,new THREE.Vector3(forward.x*.5,.28,forward.z*.5),.3,'smoke');puff.mesh.scale.setScalar(.055);
  }
  function impact(x,z){
    if(marks.length>=40){scene.remove(marks.shift());}
    const mark=new THREE.Mesh(markGeometry,markMaterial);mark.rotation.x=-Math.PI/2;mark.rotation.z=(serial%7);mark.position.set(x,.034,z);scene.add(mark);marks.push(mark);
    for(let i=0;i<3;i++){const a=i*2.1+serial*.7,p=particle(sphere,dustMaterial,new THREE.Vector3(x,.08,z),new THREE.Vector3(Math.cos(a)*.5,.5+i*.13,Math.sin(a)*.5),.28+i*.05,'dust');p.mesh.scale.setScalar(.035);}
  }
  function update(dt){
    if(dt<=0)return;
    for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;if(p.life<=0){removeParticle(i);continue;}
      p.mesh.position.addScaledVector(p.velocity,dt);
      if(p.kind==='brass'){
        if(p.mesh.position.y>.065){p.velocity.y-=7*dt;p.mesh.rotation.x+=p.spin*dt;p.mesh.rotation.z+=p.spin*.7*dt;}
        if(p.mesh.position.y<=.065){p.mesh.position.y=.065;if(!p.bounced){p.velocity.y=Math.abs(p.velocity.y)*.24;p.velocity.x*=.45;p.velocity.z*=.45;p.bounced=true;}else{p.velocity.set(0,0,0);p.mesh.rotation.x=Math.PI/2;}}
      }else{p.velocity.multiplyScalar(Math.exp(-3*dt));p.mesh.scale.addScalar(dt*.22);p.mesh.material.opacity=(p.kind==='smoke'?.22:.48)*Math.max(0,p.life/p.maxLife);}
    }
  }
  function dispose(){while(particles.length)removeParticle(particles.length-1);for(const mark of marks)scene.remove(mark);marks.length=0;markGeometry.dispose();markMaterial.dispose();smokeMaterial.dispose();dustMaterial.dispose();}
  return {shot,impact,update,dispose};
}
