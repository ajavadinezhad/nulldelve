import {EXPLORATION_ROOMS,carveExploration} from './exploration.js?v=critic-fixes-r54';
import * as THREE from '../vendor/three.module.js';
/** Flooded freight annex appends geometry without moving any older room. */
export const FREIGHT_ROOMS=Object.freeze([
 {x:154,z:43,w:18,h:20,name:'FREIGHT ARRIVAL'},
 {x:154,z:23,w:18,h:15,name:'PUMP HALL'},
 {x:178,z:23,w:18,h:15,name:'LOADING YARD'},
 {x:178,z:4,w:18,h:14,name:'COLD CHAIN'},
 {x:178,z:43,w:18,h:20,name:'RAIL CONTROL'},
 ...EXPLORATION_ROOMS.filter(room=>room.operation==='freight'),
].map(Object.freeze));
export const FREIGHT_DOORS=Object.freeze([
 {x:148,z:52,axis:'z'},{x:162,z:40,axis:'x'},{x:174,z:30,axis:'z'},
 {x:186,z:40,axis:'x'},{x:174,z:52,axis:'z'},{x:186,z:20,axis:'x'},
].map(Object.freeze));
// A loading spine with cargo courts replaces five interchangeable rectangular arenas.
// Keep every old device, door and spawn corner reachable for existing checkpoints.
export const FREIGHT_FLOOR=Object.freeze([
 [154,43,18,7],[160,50,6,13],[154,57,18,6],[165,51,7,3],
 [154,23,18,15],
 [178,23,18,4],[178,27,4,8],[185,27,11,8],[178,35,18,3],
 [178,4,18,14],
 [178,43,18,8],[178,50,11,4],[186,51,10,12],
 [145,51,10,3],[161,37,3,7],[171,29,8,3],
 [185,37,3,7],[171,51,8,3],[185,17,3,7],
].map(Object.freeze));
export function carveFreight(carve){for(const c of FREIGHT_FLOOR)carve(...c);carveExploration(carve,'freight');}
export function addFreightProps(scene,box,cover){
 const root=new THREE.Group();root.name='freight-annex-equipment';scene.add(root);const colors={steel:0x637480,rust:0x895b40,cargo:0x506779,yellow:0xc4a65d},batches=new Map();
 const part=(x,y,z,w,h,d,color)=>{if(!batches.has(color))batches.set(color,[]);batches.get(color).push({x,y,z,w,h,d});};
 const container=(x,z,w=3,d=2)=>{cover.push({x,z,w,h:d});part(x,.7,z,w,1.4,d,colors.cargo);for(let i=0;i<5;i++)part(x-w*.4+i*w*.2,1.43,z,.06,.06,d,colors.steel);};
 container(157,47);container(168,59);container(181,25);container(192,25);container(181,35);container(192,14);container(180,7);container(182,48);
 // A pump island splits the approach into two firing lanes.
 cover.push({x:165,z:31,w:2,h:5});part(165,.7,31,2,1.4,5,colors.steel);
 for(const z of [29.2,31,32.8])part(165,1.43,z,1.6,.08,.18,colors.rust);
 // Flood channels are visual insets; the raised maintenance route remains clear.
 for(const [x,z,w,d]of [[157,32,3,7],[168,31,3,9],[191,49,4,8]]){part(x,.016,z,w,.025,d,0x304e5d);for(const dx of [-w/2,w/2])part(x+dx,.04,z,.08,.05,d,colors.yellow);}
 for(const x of [157,168]){cover.push({x,z:25,w:2,h:2});part(x,.6,25,2,1.2,2,colors.steel);part(x,1.23,25,1.5,.08,1.5,colors.rust);}
 // Two visible rail branches meet at the cargo transfer stage.
 for(const x of [184.6,187.4])for(let z=6;z<36;z+=1.4)part(x,.04,z,.09,.06,1.3,colors.steel);
 for(let z=7;z<36;z+=1.5)part(186,.025,z,3.5,.04,.14,colors.rust);
 for(const x of [182,190]){part(x,.04,31,5,.06,.09,colors.steel);part(x,.04,33,5,.06,.09,colors.steel);}
 const transform=new THREE.Object3D(),geometry=new THREE.BoxGeometry(1,1,1);for(const [color,parts]of batches){const mesh=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.75,metalness:.35}),parts.length);parts.forEach((p,i)=>{transform.position.set(p.x,p.y,p.z);transform.scale.set(p.w,p.h,p.d);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);});mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);}return root;
}
