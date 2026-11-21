import * as THREE from '../vendor/three.module.js';
import {soldier} from './character.js?v=features-r19';
import {createRoach} from './roach.js?v=features-r19';

const cache=new Map();
let renderAttempted=false;
const DESCRIPTIONS={
 hospital:'3D preview of Silent hospital: clinical beds, a red medical cross, operating equipment, and pale and violet mutations.',
 campaign:'3D preview of Facility descent: connected concrete rooms, security doors, stacked crates, and an armed operator.',
 siege:'3D preview of Reactor siege: an illuminated reactor surrounded by cover, machinery, and approaching brown and green creatures.',
 nest:'3D preview of Nest hunt: a dark infested chamber with a giant spiked red creature, purple armored creatures, and egg clusters.'
};

// Render actual game assets once. Menu rerenders reuse plain image copies, not new
// live WebGL contexts or animation loops. Every texture stays on this device.
function renderPreviews(){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
 renderer.setSize(640,320,false);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 const ownedGeometries=new Set(),ownedMaterials=new Set();
 const cube=new THREE.BoxGeometry(1,1,1);ownedGeometries.add(cube);
 const sphere=new THREE.SphereGeometry(1,14,10);ownedGeometries.add(sphere);
 const cylinder=new THREE.CylinderGeometry(1,1,1,16);ownedGeometries.add(cylinder);
 const ring=new THREE.TorusGeometry(1,.055,6,24);ownedGeometries.add(ring);
 const materialCache=new Map();
 const mat=(color,emissive=0)=>{const key=`${color}/${emissive}`;if(!materialCache.has(key)){const material=new THREE.MeshStandardMaterial({color,roughness:.8,metalness:.12,emissive,emissiveIntensity:emissive?.9:0});materialCache.set(key,material);ownedMaterials.add(material);}return materialCache.get(key);};
 function mesh(scene,geometry,color,x,y,z,sx,sy,sz,emissive=0){const m=new THREE.Mesh(geometry,mat(color,emissive));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
 const box=(s,x,y,z,w,h,d,c,e=0)=>mesh(s,cube,c,x,y,z,w,h,d,e);
 const round=(s,x,y,z,w,h,d,c)=>mesh(s,sphere,c,x,y,z,w,h,d);
 function crate(s,x,z,size=1.3){box(s,x,.57,z,size,1.14,size,0x907348);for(const dx of [-.38,.38])box(s,x+dx*size,1.17,z,.09,.07,size+.05,0xb79d6c);box(s,x,.65,z+size/2+.025,size+.02,.11,.055,0x4b4531);}
 function room(s,x,z,w,d,color=0x3c5048){box(s,x,-.18,z,w,.35,d,color);box(s,x,.75,z-d/2,w,1.5,.32,0x718078);box(s,x-w/2,.75,z,.32,1.5,d,0x718078);box(s,x,.04,z+d/2,w,.06,.12,0x9c9976);}
 function operator(s,x,z){const actor=soldier(0xa4e4b4,s);actor.position.set(x,0,z);actor.rotation.y=.6;return actor;}
 function roach(s,x,z,variant,angle=0){const actor=createRoach(s,variant);actor.position.set(x,.02,z);actor.rotation.y=angle;return actor;}
 function campaign(s){
  room(s,-5,1,8,9);room(s,3,-3,8,8,0x45554d);room(s,4,5,7,7,0x35493f);
  box(s,-1,.55,.1,.25,1.1,3.2,0x809588);box(s,-.97,1.14,.1,.3,.08,3.3,0xc9bb82);
  box(s,2,.55,1.0,3.1,1.1,.25,0x617e72);box(s,2,1.13,1,3.2,.06,.3,0xc9bb82);
  for(const [x,z] of [[-7,-1],[-6,-1],[5,-5],[6,6],[2,6]])crate(s,x,z);
  crate(s,-7,-1,1);box(s,-7,1.63,-1,1,.85,1,0xb19662);
  box(s,4,.65,-3,3.2,1.3,1.1,0x263c38);box(s,4,1.34,-3,2.7,.06,.8,0x74c9bd,0x397d74);
  box(s,6,.3,-2,.6,.6,.6,0x6de4e2,0x44bdc7);operator(s,-5,3);
  for(const x of [-7,-3,1,5])box(s,x,1.52,x<0?-3.35:-6.85,1.4,.08,.14,0xc9dfbb,0x99c299);
 }
 function siege(s){
  room(s,0,0,18,12,0x3e4a43);
  for(const x of [-6,6]){box(s,x,.12,0,.12,.04,9,0xc2a554);box(s,x,1.15,-4.5,2,2.3,1.5,0x405750);box(s,x,2.33,-4.5,1.5,.04,1.1,0x70aa97,0x386e60);}
  mesh(s,cylinder,0x455954,0,1.6,-1,2.1,3.2,2.1);mesh(s,cylinder,0x78d5b5,0,1.65,-1,1.45,2.6,1.45,0x2f8d74);
  for(const y of [.25,1.1,2.2,3.1]){const m=mesh(s,ring,0xced3a5,0,y,-1,2.17,2.17,2.17);m.rotation.x=Math.PI/2;}
  box(s,0,3.35,-1,4.5,.25,4.5,0x59695b);
  for(const [x,z] of [[-4,1],[4,2],[-3,4],[5,-2]])crate(s,x,z,1.3);
  operator(s,-5,3.4);roach(s,5,3,'normal',-.7);roach(s,6,-1,'runner',-.9);roach(s,3,-4,'normal',-1.7);
 }
 function nest(s){
  room(s,0,0,18,13,0x302d2a);
  for(let i=0;i<8;i++){const x=-7+i*2;box(s,x,.08,-3+(i%3)*3,1.3,.1,2.2,0x4b2924);}
  for(const [x,z] of [[-6,-3],[6,-3],[6,4],[-5,4]]){
   round(s,x,.25,z,.8,.3,1.1,0x58362c);
   for(let i=0;i<3;i++)round(s,x+(i-1)*.3,.48+(i%2)*.15,z+(i%2)*.35,.29,.43,.29,0x8d7350);
  }
  roach(s,0,0,'boss',-.3);roach(s,-4,1.5,'brute',-.4);roach(s,4,-2.5,'brute',.7);
  box(s,-7,.8,-5.6,1.4,1.6,.8,0x4c4138);box(s,-7,1.64,-5.6,1.1,.04,.6,0xbf7043,0x843b23);
  box(s,6,1.35,-6.35,2.5,.12,.16,0xd37e58,0x9c3c21);
 }
 function hospital(s){
  room(s,-4,1,8,10,0x8c9fa8);room(s,5,-1,8,12,0x9cabb1);
  box(s,.25,.75,-1,.30,1.5,10,0xb9c5ca);box(s,5,.025,3,5,.02,.10,0x54819a);
  function bed(x,z){box(s,x,.30,z,1.5,.15,2.7,0x5e7585);box(s,x,.50,z,1.3,.25,2.5,0xe1e7e7);box(s,x,.66,z+.35,1.32,.09,1.65,0x638ba5);box(s,x,.69,z-.85,1,.13,.45,0xeceddf);for(const side of [-1,1])box(s,x+side*.73,.64,z,.05,.25,2.5,0x8797a4);}
  for(const [x,z]of [[-6,-2],[-2,-2],[3,-4],[7,-4]])bed(x,z);
  box(s,-6,.8,-3.6,1.3,1.6,.8,0xb8c8cc);box(s,-6,1.62,-3.6,.8,.025,.22,0xaa4c54);box(s,-6,1.63,-3.6,.22,.025,.8,0xaa4c54);
  box(s,4,.75,3.9,2.3,1.5,.9,0xc0ccd0);box(s,4,1.53,3.9,1.8,.03,.55,0x6a93a6);
  operator(s,-4,3.4);roach(s,4,1,'leaper',-.4);roach(s,7,-1,'screecher',.7);
 }
 function instanceScene(s){
  // Merge identical geometry/material draws. Imported soldier/creature details keep
  // their exact shapes while the thumbnail stays below 150 rendered meshes.
  s.updateMatrixWorld(true);const groups=new Map(),remove=[];
  s.traverse(node=>{if(!node.isMesh||!node.visible)return;let p=node.parent;while(p){if(!p.visible)return;p=p.parent;}const key=`${node.geometry.uuid}:${node.material.uuid}`;if(!groups.has(key))groups.set(key,{geometry:node.geometry,material:node.material,matrices:[]});groups.get(key).matrices.push(node.matrixWorld.clone());remove.push(node);});
  for(const node of remove)node.parent.remove(node);
  for(const {geometry,material,matrices} of groups.values()){const m=new THREE.InstancedMesh(geometry,material,matrices.length);matrices.forEach((matrix,i)=>m.setMatrixAt(i,matrix));m.castShadow=true;m.receiveShadow=true;m.instanceMatrix.needsUpdate=true;s.add(m);}
 }
 try{
  for(const [id,build] of Object.entries({campaign,siege,nest,hospital})){
   const s=new THREE.Scene();s.background=new THREE.Color(id==='nest'?0x121315:0x0d1818);
   s.add(new THREE.HemisphereLight(0xe8f4df,0x28342f,2.3));const key=new THREE.DirectionalLight(id==='nest'?0xffd7bd:0xf6fff3,3.2);key.position.set(-6,16,10);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:50});key.shadow.normalBias=.04;s.add(key);
   build(s);instanceScene(s);
   const camera=new THREE.OrthographicCamera(-14,14,7,-7,.1,100);camera.position.set(11,17,15);camera.lookAt(-.3,0,0);camera.updateProjectionMatrix();
   renderer.render(s,camera);
   // Copy before disposing the renderer, making rerenders independent of WebGL state.
   const copy=document.createElement('canvas');copy.width=640;copy.height=320;copy.getContext('2d').drawImage(renderer.domElement,0,0);
   cache.set(id,copy.toDataURL('image/png'));
  }
 }finally{
  renderer.dispose();renderer.forceContextLoss();for(const g of ownedGeometries)g.dispose();for(const m of ownedMaterials)m.dispose();
 }
}

/** Return a fresh accessible image node; mission renders are cached across menu views. */
export function buildMissionPreview(mission='campaign'){
 if(!Object.hasOwn(DESCRIPTIONS,mission))mission='campaign';
 if(!cache.has(mission)&&!renderAttempted){
  renderAttempted=true;
  try{renderPreviews();}catch(error){console.warn('Mission previews could not be rendered.',error);}
 }
 const image=document.createElement('img');image.width=640;image.height=320;image.alt=DESCRIPTIONS[mission];image.decoding='async';image.draggable=false;
 if(cache.has(mission))image.src=cache.get(mission);
 else{image.alt='3D mission preview unavailable. The mission can still be selected.';image.hidden=true;}
 return image;
}
