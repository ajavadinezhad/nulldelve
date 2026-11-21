import * as THREE from '../vendor/three.module.js';
export function createExplosions(scene){
 const effects=[];
 return {
  burst(x,z,radius=3){const mesh=new THREE.Mesh(new THREE.RingGeometry(.2,1,32),new THREE.MeshBasicMaterial({color:0xffbc6e,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.12,z);scene.add(mesh);effects.push({mesh,life:.4,radius});},
  update(dt){if(dt<=0)return;for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt;if(e.life<=0){scene.remove(e.mesh);e.mesh.geometry.dispose();e.mesh.material.dispose();effects.splice(i,1);continue;}const progress=1-e.life/.4;e.mesh.scale.setScalar(.3+progress*e.radius);e.mesh.material.opacity=.7*(1-progress);}}
 };
}
