import * as THREE from '../vendor/three.module.js';
import {LIFT_LINKS,STAIR_PASSAGES} from './transit.js?v=welcome-popup-r60';
/** Shallow shafts and closed safety rails distinguish transfers from walking lanes. */
export function buildTransitArt(scene){
 const root=new THREE.Group();root.name='facility-transit';scene.add(root);const geo=new THREE.BoxGeometry(1,1,1),materials=new Map(),batches=new Map();
 const part=(x,y,z,w,h,d,color)=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.7,metalness:.35}));if(!batches.has(color))batches.set(color,[]);batches.get(color).push({x,y,z,w,h,d});};
 for(const s of STAIR_PASSAGES){for(let i=0;i<12;i++){const t=(i+.5)/12,y=(1-Math.abs(t*2-1))*s.height;part(s.x,y/2,s.z-s.length/2+t*s.length,s.width,y+.025,s.length/12,0x697583);part(s.x,y+.022,s.z-s.length/2+i*s.length/12,s.width,.025,.035,0xb2b3a8);}for(const side of [-1,1]){part(s.x+side*(s.width/2+.12),.55,s.z,.07,1.1,s.length,0x485564);for(let i=0;i<4;i++)part(s.x+side*(s.width/2+.12),.75,s.z-s.length/2+i*s.length/3,.09,.7,.09,0x9ca4a9);}}
 for(const lift of LIFT_LINKS){const z=(lift.a.z+lift.b.z)/2;part(lift.a.x,.022,z,2.6,.04,Math.abs(lift.b.z-lift.a.z)+1,0x3c4654);for(const x of [lift.a.x-1.35,lift.a.x+1.35]){part(x,.55,z,.12,1.1,4.5,0x606b7a);part(x,.08,z,.055,.025,4.5,0xbcb2a1);}for(const p of [lift.a,lift.b]){part(p.x,.055,p.z,2.4,.025,.12,0xc4b18b);part(p.x-1.05,.38,p.z,.22,.7,.26,0x7c8c9c);part(p.x-1.05,.75,p.z,.14,.04,.14,0x9cb9cd);}}
 const gates=[];
 for(const lift of LIFT_LINKS){const gate=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({color:0xc3a36d,roughness:.6,metalness:.45}),5),t=new THREE.Object3D(),x=(lift.a.x+lift.b.x)/2,z=(lift.a.z+lift.b.z)/2;
  gate.name='lift-safety-gate-'+lift.id;for(let i=0;i<5;i++){t.position.set(x-1.2+i*.6,.38,z);t.scale.set(.07,.76,.12);t.updateMatrix();gate.setMatrixAt(i,t.matrix);}gate.computeBoundingSphere();root.add(gate);gates.push({id:lift.id,mesh:gate});
 }
 root.userData.update=activeId=>{for(const gate of gates)gate.mesh.visible=gate.id!==activeId;};
 // Long gallery: alternating lighting pools and a utility trench along one side.
 for(let x=111;x<=143;x+=4){part(x,.035,65.1,1.6,.035,.08,0xb7c4cb);part(x,.024,66.85,1.8,.025,.2,0x34424b);}part(126,.012,66,34,.018,2.45,0x566774);
 const transform=new THREE.Object3D();for(const [color,parts]of batches){const mesh=new THREE.InstancedMesh(geo,materials.get(color),parts.length);parts.forEach((p,i)=>{transform.position.set(p.x,p.y,p.z);transform.scale.set(p.w,p.h,p.d);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);});mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);}
 return root;
}
