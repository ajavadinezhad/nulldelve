import {EXPLORATION_ROOMS,carveExploration} from './exploration.js?v=progression-balance-r46';
import * as THREE from '../vendor/three.module.js';
/** Communications annex keeps every earlier coordinate and door index stable. */
export const SIGNAL_ROOMS=Object.freeze([
 {x:204,z:43,w:18,h:20,name:'SIGNAL ARRIVAL'},
 {x:204,z:23,w:18,h:15,name:'BREAKER GALLERY'},
 {x:228,z:23,w:18,h:15,name:'ANTENNA HALL'},
 {x:228,z:4,w:18,h:14,name:'TRANSMISSION CORE'},
 {x:228,z:43,w:18,h:20,name:'SERVICE EXIT'},
 ...EXPLORATION_ROOMS.filter(room=>room.operation==='signal'),
].map(Object.freeze));
export const SIGNAL_DOORS=Object.freeze([{x:200,z:52,axis:'z'},{x:212,z:40,axis:'x'},{x:224,z:30,axis:'z'},{x:236,z:20,axis:'x'},{x:236,z:40,axis:'x'},{x:224,z:52,axis:'z'}].map(Object.freeze));
export function carveSignal(carve){SIGNAL_ROOMS.forEach(r=>carve(r.x,r.z,r.w,r.h));for(const c of [[195,51,10,3],[211,37,3,7],[221,29,8,3],[235,17,3,7],[235,37,3,7],[221,51,8,3]])carve(...c);carveExploration(carve,'signal');}
export function addSignalProps(scene,box,cover){
 const root=new THREE.Group();root.name='signal-communications-equipment';scene.add(root);const batches=new Map(),steel=0x556579,amber=0xc99d58,ceramic=0xabb0bb;
 const part=(x,y,z,w,h,d,color)=>{if(!batches.has(color))batches.set(color,[]);batches.get(color).push({x,y,z,w,h,d});};
 function rack(x,z){cover.push({x,z,w:1.5,h:2});part(x,.7,z,1.5,1.4,2,steel);for(let n=0;n<4;n++){part(x,.25+n*.3,z-1.01,1.2,.12,.03,ceramic);part(x+.48,.25+n*.3,z-1.04,.12,.06,.04,amber);}}
 for(const [x,z] of [[207,47],[218,59],[206,25],[219,36],[231,25],[243,36],[230,6],[243,15],[231,60]])rack(x,z);
 // Antenna bases break firing lanes, while the perimeter service aisle stays open.
 for(const [x,z]of [[233,30],[240,30]]){cover.push({x,z,w:1.4,h:1.4});part(x,.45,z,1.4,.9,1.4,steel);part(x,1.2,z,.18,1.6,.18,ceramic);part(x,1.8,z,1.1,.12,.12,amber);}
 for(let z=24;z<37;z+=2){part(213,.02,z,.08,.03,1.5,amber);part(214,.02,z,.08,.03,1.5,amber);}
 for(let x=230;x<245;x+=2)part(x,.02,10,1.5,.03,.08,0x8b728b);
 const geometry=new THREE.BoxGeometry(1,1,1),transform=new THREE.Object3D();for(const [color,parts]of batches){const mesh=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.8,metalness:.3}),parts.length);parts.forEach((p,i)=>{transform.position.set(p.x,p.y,p.z);transform.scale.set(p.w,p.h,p.d);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);});mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);}return root;
}
