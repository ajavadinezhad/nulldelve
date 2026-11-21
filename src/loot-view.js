import * as THREE from '../vendor/three.module.js';
/** Grounded field equipment, with shared meshes and no floating markers. */
export function createLootView(scene){
 const views=new Map(),box=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,8),sphere=new THREE.SphereGeometry(1,10,7);
 const materials={case:new THREE.MeshStandardMaterial({color:0x35413c,roughness:.76,metalness:.35}),edge:new THREE.MeshStandardMaterial({color:0x8d9584,roughness:.5,metalness:.65}),black:new THREE.MeshStandardMaterial({color:0x171e1c,roughness:.9}),brass:new THREE.MeshStandardMaterial({color:0xc0a36a,roughness:.48,metalness:.7}),cloth:new THREE.MeshStandardMaterial({color:0xb7ad8e,roughness:1}),strap:new THREE.MeshStandardMaterial({color:0x555e42,roughness:1}),patch:new THREE.MeshStandardMaterial({color:0xe7dfbe,roughness:.95,emissive:0x201c10}),red:new THREE.MeshStandardMaterial({color:0xaa4939,roughness:.9}),shadow:new THREE.MeshBasicMaterial({color:0x020605,transparent:true,opacity:.32,depthWrite:false})};
 function part(g,kind,mat,x,y,z,w,h,d,rotation=0){const mesh=new THREE.Mesh(kind,materials[mat]);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.rotation.y=rotation;mesh.castShadow=mat!=='shadow';mesh.receiveShadow=true;g.add(mesh);return mesh;}
 function base(){const group=new THREE.Group();part(group,sphere,'shadow',0,.008,0,.43,.007,.34);return group;}
 function ammo(){const g=base();g.name='loot-ammo';
  part(g,box,'case',0,.105,0,.62,.19,.43);part(g,box,'black',0,.205,-.005,.53,.035,.35);
  // Hinged lid rests open; latches and a carry handle distinguish the silhouette.
  const lid=new THREE.Group();lid.position.set(0,.205,-.215);lid.rotation.x=.98;g.add(lid);part(lid,box,'case',0,0,-.215,.63,.045,.43);part(lid,box,'edge',0,.027,-.415,.43,.018,.025);part(lid,box,'black',0,.03,-.27,.18,.045,.035);
  for(const x of [-.23,.23]){part(g,box,'edge',x,.14,.225,.055,.08,.025);part(g,box,'edge',x,.19,-.215,.055,.045,.035);}
  for(const x of [-.15,.02]){part(g,box,'black',x,.245,.015,.105,.07,.26,-.14);for(const dx of [-.024,.024])part(g,box,'edge',x+dx,.285,.015,.012,.007,.20,-.14);}
  for(let i=0;i<4;i++){const cartridge=part(g,cylinder,'brass',.15+i*.028,.235,.07,.017,.14,.017);cartridge.rotation.x=Math.PI/2;}
  part(g,box,'brass',.05,.207,.17,.23,.009,.025);return g;
 }
 function medical(){const g=base();g.name='loot-health';
  // Soft canvas body with seams, webbing, a zipper and a stitched medical patch.
  part(g,sphere,'cloth',0,.16,0,.34,.16,.245);part(g,box,'cloth',0,.17,0,.51,.17,.34);
  for(const x of [-.22,.22]){part(g,box,'strap',x,.335,0,.045,.025,.35);part(g,box,'strap',x,.16,.18,.055,.15,.035);part(g,box,'edge',x,.18,.205,.06,.045,.018);}
  part(g,box,'strap',0,.34,-.12,.22,.035,.04);part(g,box,'black',0,.334,0,.38,.012,.018);part(g,box,'edge',.17,.345,.012,.055,.012,.025);
  part(g,box,'patch',0,.34,.055,.28,.018,.22);part(g,box,'red',0,.356,.055,.17,.012,.055);part(g,box,'red',0,.357,.055,.055,.012,.17);
  for(const z of [-.14,.15])part(g,box,'strap',0,.254,z,.35,.01,.012);return g;
 }
 const prototypes={ammo:ammo(),health:medical()};
 function build(drop){const view=prototypes[drop.kind].clone(true);let hash=0;for(const char of drop.id)hash=(hash*31+char.charCodeAt(0))|0;view.rotation.y=(hash%11)*.12-.6;scene.add(view);return view;}
 function clear(){for(const view of views.values())scene.remove(view);views.clear();}
 return {update(state,visible){const live=new Set();for(const drop of state.drops){live.add(drop.id);let view=views.get(drop.id);if(!view){view=build(drop);views.set(drop.id,view);}view.visible=visible(drop.x,drop.z);view.position.set(drop.x,0,drop.z);view.scale.setScalar(drop.compact?.6:1);}for(const [id,view] of views)if(!live.has(id)){scene.remove(view);views.delete(id);}},clear,dispose(){clear();box.dispose();cylinder.dispose();sphere.dispose();for(const mat of Object.values(materials))mat.dispose();}};
}
