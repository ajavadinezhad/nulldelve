import * as THREE from './vendor/three.module.js';

// Existing rooms stay in their original coordinates; this wing extends east and south.
export const EXPANSION_ROOMS = [
  {x:51,z:4,w:18,h:14,name:'BIO LAB'},
  {x:75,z:4,w:22,h:14,name:'NEST CORE'},
  {x:51,z:23,w:18,h:15,name:'REACTOR'},
  {x:75,z:23,w:22,h:15,name:'CONTAINMENT'},
  {x:2,z:43,w:18,h:20,name:'MAINTENANCE'},
  {x:25,z:43,w:20,h:20,name:'GENERATOR'},
  {x:51,z:43,w:18,h:20,name:'TRANSIT'},
  {x:75,z:43,w:22,h:20,name:'EVACUATION'}
];

export function carveExpansion(carve) {
  EXPANSION_ROOMS.forEach(r=>carve(r.x,r.z,r.w,r.h));
  [
    [44,9,8,3],[44,29,8,3],[68,9,8,3],[68,29,8,3],
    [58,17,3,7],[85,17,3,7],[58,37,3,7],[85,37,3,7],
    [37,31,3,13],[19,51,7,3],[44,51,8,3],[68,51,8,3]
  ].forEach(args=>carve(...args));
}

// Append after the original six doors: this order is part of the mission controller API.
export const EXPANSION_DOORS = [
  {x:47,z:10,axis:'z'}, {x:47,z:30,axis:'z'},
  {x:71,z:10,axis:'z'}, {x:71,z:30,axis:'z'},
  {x:59,z:20,axis:'x'}, {x:86,z:20,axis:'x'},
  {x:59,z:40,axis:'x'}, {x:86,z:40,axis:'x'},
  {x:38,z:37,axis:'x'}, {x:22,z:52,axis:'z'},
  {x:47,z:52,axis:'z'}, {x:71,z:52,axis:'z'}
];

export function addExpansionProps(scene, box, cover) {
  const root=new THREE.Group();root.name='expanded-facility-equipment';scene.add(root);
  const geometry={box:new THREE.BoxGeometry(1,1,1),cylinder:new THREE.CylinderGeometry(1,1,1,16)};
  const material={
    housing:new THREE.MeshStandardMaterial({color:0x57685d,roughness:.82,metalness:.35}),
    dark:new THREE.MeshStandardMaterial({color:0x25362d,roughness:.8,metalness:.45}),
    steel:new THREE.MeshStandardMaterial({color:0x92978a,roughness:.6,metalness:.55}),
    amber:new THREE.MeshStandardMaterial({color:0xb7a45b,roughness:.8,metalness:.18}),
    wood:new THREE.MeshStandardMaterial({color:0x88765a,roughness:.95}),
    ceramic:new THREE.MeshStandardMaterial({color:0xa9b5a4,roughness:.65,metalness:.1}),
    cyan:new THREE.MeshStandardMaterial({color:0x76b9b4,emissive:0x397e79,emissiveIntensity:.65,roughness:.5}),
    green:new THREE.MeshStandardMaterial({color:0x89a986,emissive:0x527e49,emissiveIntensity:.35,roughness:.55})
  };
  const batches=new Map();
  function part(kind,mat,x,y,z,w,h,d){const key=kind+':'+mat;if(!batches.has(key))batches.set(key,{kind,mat,parts:[]});batches.get(key).parts.push({x,y,z,w,h,d});}
  function b(mat,x,y,z,w,h,d){part('box',mat,x,y,z,w,h,d);}
  function cy(mat,x,y,z,r,h){part('cylinder',mat,x,y,z,r,h,r);}
  function collision(x,z,w,h){cover.push({x,z,w,h});}
  function tank(x,z){
    collision(x,z,1.9,1.9);cy('dark',x,.15,z,.95,.3);cy('ceramic',x,1.02,z,.78,1.5);
    cy('steel',x,.4,z,.84,.15);cy('steel',x,1.72,z,.84,.15);cy('dark',x,1.84,z,.69,.12);
    cy('green',x,1.92,z,.54,.05);
    for(const dx of [-.35,.35])b('steel',x+dx,1.05,z-.73,.09,1.14,.12);
    b('cyan',x,1.25,z-.8,.28,.38,.04);b('amber',x,.28,z-.91,.5,.04,.05);
  }
  function generator(x,z,w=3.4,d=2.4){
    collision(x,z,w,d);b('dark',x,.18,z,w+.08,.36,d+.08);b('housing',x,1.02,z,w,1.55,d);
    b('steel',x,1.83,z,w+.1,.12,d+.08);
    for(let i=0;i<5;i++)b('dark',x-w*.35+i*w*.175,1.91,z,w*.065,.055,d*.65);
    b('amber',x,1.16,z-d/2-.025,w*.7,.11,.055);
    b('dark',x+w*.28,1.3,z-d/2-.06,.6,.55,.07);b('cyan',x+w*.28,1.4,z-d/2-.11,.45,.26,.035);
    b('steel',x-w*.31,1.93,z,.34,.06,.45);b('amber',x-w*.31,1.98,z,.22,.025,.2);
    for(const dx of [-w*.34,w*.34])for(const dz of [-d*.33,d*.33])b('steel',x+dx,.05,z+dz,.3,.1,.3);
  }
  function shelf(x,z,w=3.3,d=1.05){
    collision(x,z,w,d);b('dark',x,.13,z,w,.26,d);b('housing',x,.85,z,w,.22,d);b('steel',x,1.52,z,w,.11,d);
    for(const dx of [-w/2+.08,w/2-.08])b('steel',x+dx,.83,z,.13,1.65,d);
    for(let i=0;i<3;i++){
      const xx=x-w*.31+i*w*.31;b(i%2?'wood':'housing',xx,.51,z,w*.24,.47,d*.8);
      b('wood',xx,1.2,z,w*.24,.5,d*.8);b('amber',xx,1.46,z,.1,.035,d*.82);
    }
  }
  function bench(x,z,w=3.4,d=1.35){
    collision(x,z,w,d);b('housing',x,.5,z,w,.95,d);b('ceramic',x,1.04,z,w+.13,.13,d+.08);
    for(const dx of [-w*.3,0,w*.3]){b('dark',x+dx,.66,z-d/2-.015,w*.24,.5,.035);b('steel',x+dx,.73,z-d/2-.04,.3,.045,.04);}
    b('dark',x+.5,1.18,z-.15,.8,.16,.55);b('cyan',x+.5,1.28,z-.15,.64,.025,.4);
    b('steel',x-w*.3,1.16,z+.13,.35,.12,.38);b('green',x-w*.3,1.25,z+.13,.27,.035,.3);
  }
  // BIO LAB: instrumentation and paired containment vessels, with an open central route.
  tank(54,6.7);tank(65.5,14.2);bench(61.3,6.1,4.0,1.4);
  // NEST CORE: abandoned perimeter stores. The objective at (93,7) remains clear.
  shelf(79.5,6.2,4.1,1.1);
  // REACTOR: compact generator banks leave a broad center and all three-wide entrances open.
  generator(54.1,26.2,3.4,2.6);generator(64.6,34.2,3.6,2.4);
  // CONTAINMENT: lab service cabinets set against opposite corners.
  bench(79.1,26.1,3.4,1.4);shelf(92.1,34.2,3.6,1.1);
  // MAINTENANCE: tool storage and a heavy repair station.
  shelf(6.0,46.4,4.3,1.15);bench(15.1,59.3,3.8,1.5);
  // GENERATOR: two machinery banks flank the open room.
  generator(29.4,47.0,4.0,2.8);generator(40.0,59.0,4.2,2.7);
  // TRANSIT: loading equipment stays away from east/west central thoroughfares.
  shelf(55.2,46.2,4.0,1.15);bench(64.3,59.2,3.6,1.45);
  // EVACUATION: staging supply racks and a backup generator, keeping (92,60) free.
  shelf(79.4,46.3,4.1,1.2);generator(84.0,59.1,3.6,2.4);

  // Worn floor edge markings are shallow surfaces, not extra collision rectangles.
  for(const r of EXPANSION_ROOMS){
    const x=r.x+r.w/2-.5,z=r.z+r.h-1.7;
    b('amber',x,.018,z,Math.min(r.w-4,9),.025,.065);
    for(let i=0;i<6;i++)b('dark',x-2.5+i,.036,z,.4,.012,.09);
  }
  const transform=new THREE.Object3D();
  for(const {kind,mat,parts} of batches.values()){
    const mesh=new THREE.InstancedMesh(geometry[kind],material[mat],parts.length);
    mesh.name='expansion-equipment-'+mat;
    parts.forEach((p,i)=>{transform.position.set(p.x,p.y,p.z);transform.scale.set(p.w,p.h,p.d);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);});
    mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);
  }
  return root;
}
