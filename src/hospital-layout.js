import {EXPLORATION_ROOMS,carveExploration} from './exploration.js?v=operator-profile-r58';
import * as THREE from '../vendor/three.module.js';
/** The clinical annex keeps old facility coordinates and door indices stable. */
export const HOSPITAL_ROOMS=Object.freeze([
 {x:104,z:43,w:18,h:20,name:'HOSPITAL ADMISSION'},
 {x:104,z:23,w:18,h:15,name:'HOSPITAL PHARMACY'},
 {x:104,z:4,w:18,h:14,name:'HOSPITAL TRIAGE'},
 {x:128,z:4,w:18,h:14,name:'HOSPITAL WARD'},
 {x:128,z:23,w:18,h:15,name:'HOSPITAL SURGERY'},
 {x:128,z:43,w:18,h:20,name:'HOSPITAL ISOLATION'},
 {x:109,z:65,w:36,h:3,name:'AMBULANCE SERVICE GALLERY'},
 ...EXPLORATION_ROOMS.filter(room=>room.operation==='hospital'),
].map(Object.freeze));
export const HOSPITAL_DOORS=Object.freeze([
 {x:100,z:52,axis:'z'}, {x:112,z:40,axis:'x'},
 {x:112,z:20,axis:'x'}, {x:124,z:10,axis:'z'},
 {x:136,z:20,axis:'x'}, {x:136,z:40,axis:'x'},
 {x:124,z:52,axis:'z'}, {x:124,z:30,axis:'z'},
].map(Object.freeze));
export function carveHospital(carve){HOSPITAL_ROOMS.forEach(r=>carve(r.x,r.z,r.w,r.h));for(const corridor of [[109,62,3,5],[96,51,9,3],[111,17,3,7],[111,37,3,7],[121,9,8,3],[135,17,3,7],[135,37,3,7],[121,51,8,3],[121,29,8,3]])carve(...corridor);carveExploration(carve,'hospital');}
/** Beds, carts, theatre lights and clinical counters are readable from above. */
export function addHospitalProps(scene,box,cover){
 const root=new THREE.Group();root.name='hospital-clinical-equipment';scene.add(root);
 const white=0xc2c9cc,steel=0x647c8c,blue=0x527e98,dark=0x273642,red=0x9c5051;
 const batches=new Map();const part=(x,y,z,w,h,d,color)=>{if(!batches.has(color))batches.set(color,[]);batches.get(color).push({x,y,z,w,h,d});};
 const block=(x,z,w,h)=>cover.push({x,z,w,h});
 function bed(x,z){block(x,z,1.55,2.7);part(x,.34,z,1.5,.18,2.7,steel);part(x,.54,z,1.3,.24,2.5,white);part(x,.71,z+.3,1.31,.09,1.65,blue);part(x,.73,z-.88,.95,.13,.42,0xe4e4dd);for(const dx of [-.74,.74])part(x+dx,.71,z,.045,.3,2.45,steel);for(const dx of [-.55,.55])for(const dz of [-1,1])part(x+dx,.12,z+dz,.15,.22,.15,dark);}
 function counter(x,z,w=3){block(x,z,w,1.1);part(x,.52,z,w,1.04,1.1,white);part(x,1.08,z,w+.1,.08,1.2,steel);for(let i=0;i<3;i++)part(x-w*.32+i*w*.32,.58,z-.57,w*.25,.65,.025,blue);}
 function cabinet(x,z){block(x,z,1.5,1);part(x,.84,z,1.5,1.68,1,white);part(x,.85,z-.52,.05,1.35,.04,red);part(x,1.22,z-.53,.56,.2,.04,red);}
 function cart(x,z){block(x,z,1.05,.8);part(x,.42,z,1.05,.12,.8,steel);part(x,.72,z,1.05,.12,.8,white);part(x,.84,z,.38,.16,.3,red);}
 // Admission has a triage desk and waiting chairs rather than military crates.
 counter(107,60,3);counter(112,53,4);part(112,1.36,53,.9,.48,.16,dark);part(112,1.37,52.9,.76,.34,.025,blue);cabinet(119,46);for(const z of [47,49,51]){block(106,z,1.1,.8);part(106,.4,z,1.1,.13,.8,blue);part(105.6,.7,z,.15,.6,.8,blue);}
 // Pharmacy: perimeter cold storage leaves both fuse and flow plaque accessible.
 for(const z of [25,28,34,36])cabinet(105,z);counter(115,36,4.1);cart(119,25);
 // Triage and wards: central aisles and door approaches remain at least three wide.
 for(const [x,z]of [[107,6],[118,6],[107,14]])bed(x,z);cart(119,14);
 for(const [x,z]of [[130,6],[142,6],[130,15],[142,15]])bed(x,z);
 // Surgery: twin operating tables and an overhead light ring.
 for(const x of [133,139]){bed(x,31);const light=new THREE.Mesh(new THREE.TorusGeometry(.48,.08,5,16),new THREE.MeshStandardMaterial({color:0xd8e5e5,emissive:0x607d8e,emissiveIntensity:.4}));light.rotation.x=-Math.PI/2;light.position.set(x,1.75,31);root.add(light);}cabinet(144,36);cart(129,35);
 // Quarantine keeps a broad fight floor, with curtained beds at its edges.
 bed(131,47);bed(143,47);counter(131,60,2.4);cabinet(144,54);
 const geometry=new THREE.BoxGeometry(1,1,1),transform=new THREE.Object3D();for(const [color,parts]of batches){const mesh=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.22}),parts.length);mesh.name='hospital-equipment-'+color;parts.forEach((p,index)=>{transform.position.set(p.x,p.y,p.z);transform.scale.set(p.w,p.h,p.d);transform.updateMatrix();mesh.setMatrixAt(index,transform.matrix);});mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);}
 return root;
}
