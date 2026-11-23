import * as THREE from '../vendor/three.module.js';
import {HOSPITAL_ROOMS} from './hospital-layout.js?v=paid-camera-r47';
/** Shared batches keep the facility and clinical wing cheap to draw. */
export function buildWorld(scene,map,width,height){
 const floors=Array.from({length:9},()=>[]),walls=[[],[],[]],hospitalStart=Math.min(...HOSPITAL_ROOMS.map(room=>room.x))-1;
 for(let z=0;z<height;z++)for(let x=0;x<width;x++){
  const region=x>=153?2:x>=hospitalStart?1:0;
  if(map[z][x]===0)floors[(region*3)+(x*13+z*7)%3].push([x,z]);
  else if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>map[z+dz]?.[x+dx]===0))walls[region].push([x,z]);
 }
 const dummy=new THREE.Object3D(),floorGeo=new THREE.PlaneGeometry(.97,.97),boxGeo=new THREE.BoxGeometry(1,1,1);
 floors.forEach((items,i)=>{if(!items.length)return;const mesh=new THREE.InstancedMesh(floorGeo,new THREE.MeshStandardMaterial({color:[0x263734,0x2a3b37,0x24332f,0x9daeb3,0xa7b7bb,0x97a9b0,0x41484c,0x4e5152,0x3d484b][i],roughness:.9}),items.length);mesh.name=i<3?'facility-floor':i<6?'hospital-floor':'freight-floor';items.forEach(([x,z],n)=>{dummy.position.set(x,0,z);dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();mesh.setMatrixAt(n,dummy.matrix);});mesh.receiveShadow=true;scene.add(mesh);});
 for(const [region,items]of walls.entries())for(const [y,w,h,d,color]of [[.72,.98,1.44,.98,region===2?0x71614d:region?0x9ba9af:0x4c5954],[1.48,1.02,.08,1.02,region===2?0xa99679:region?0xd5dcde:0x899387],[.18,1.01,.16,1.01,region===2?0x394652:region?0x4a6574:0x293831]]){
  if(!items.length)continue;const mesh=new THREE.InstancedMesh(boxGeo,new THREE.MeshStandardMaterial({color,roughness:.85}),items.length);mesh.name=region===2?'freight-wall':region?'hospital-wall':'facility-wall';items.forEach(([x,z],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(w,h,d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);
 }
}
