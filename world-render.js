import * as THREE from './vendor/three.module.js';
/** Shared batches keep the expanded facility from creating thousands of draw calls. */
export function buildWorld(scene,map,width,height){
 const floors=[[],[],[]],walls=[];
 for(let z=0;z<height;z++)for(let x=0;x<width;x++){
  if(map[z][x]===0)floors[(x*13+z*7)%3].push([x,z]);
  else if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>map[z+dz]?.[x+dx]===0))walls.push([x,z]);
 }
 const dummy=new THREE.Object3D(),floorGeo=new THREE.PlaneGeometry(.97,.97),boxGeo=new THREE.BoxGeometry(1,1,1);
 floors.forEach((items,i)=>{const mesh=new THREE.InstancedMesh(floorGeo,new THREE.MeshStandardMaterial({color:[0x263734,0x2a3b37,0x24332f][i],roughness:.9}),items.length);items.forEach(([x,z],n)=>{dummy.position.set(x,0,z);dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();mesh.setMatrixAt(n,dummy.matrix);});mesh.receiveShadow=true;scene.add(mesh);});
 for(const [y,w,h,d,color] of [[.72,.98,1.44,.98,0x4c5954],[1.48,1.02,.08,1.02,0x899387],[.18,1.01,.16,1.01,0x293831]]){
  const mesh=new THREE.InstancedMesh(boxGeo,new THREE.MeshStandardMaterial({color,roughness:.85}),walls.length);walls.forEach(([x,z],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(w,h,d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);
 }
}
