import * as THREE from '../vendor/three.module.js';
import {EXPLORATION_ALCOVES,EXPLORATION_CACHES,EXPLORATION_EVENTS} from './exploration.js?v=exploration-ui-r45c';
/** Quiet recess dressing and small atmospheric effects remain below discovery fog. */
export function createExplorationArt(scene,{operation,claimed=()=>false,visible=()=>false,reducedEffects=()=>false}={}){
 const root=new THREE.Group();root.name='optional-exploration';scene.add(root);
 const geometries={box:new THREE.BoxGeometry(1,1,1),sphere:new THREE.SphereGeometry(1,6,4)},materials=new Set(),sites=[],caches=[],effects=[];
 const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.85,...extra});materials.add(m);return m;};
 const steel=material(0x556578),edge=material(0x8796a4),dark=material(0x26313e),paper=material(0xb8c1a1),bill=material(0x567553),band=material(0xc3ad82);
 const block=(group,x,y,z,w,h,d,mat)=>{const mesh=new THREE.Mesh(geometries.box,mat);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.receiveShadow=true;group.add(mesh);return mesh;};
 for(const site of EXPLORATION_ALCOVES){
  const group=new THREE.Group();group.position.set(site.room.x+2,0,site.room.z+.5);group.name=site.id;group.visible=false;root.add(group);sites.push({site,group});
  // Torn panel and a narrow shelf leave the central approach fully clear.
  block(group,-1.7,.45,0,.18,.9,1.35,steel);block(group,-1.62,.95,0,.42,.06,1.4,edge);
  const loose=block(group,1.7,.14,-.1,.7,.08,.8,dark);loose.rotation.y=.26;
 }
 for(const cache of EXPLORATION_CACHES){const group=new THREE.Group();group.position.set(cache.x,0,cache.z);group.name=cache.id;group.visible=false;root.add(group);for(let i=0;i<3;i++)block(group,(i%2)*.025,.16+i*.07,0,.62,.07,.3,i===2?bill:paper);block(group,.02,.24,0,.11,.25,.32,band);caches.push({cache,group});}
 for(const event of EXPLORATION_EVENTS){const group=new THREE.Group();group.position.set(event.x,0,event.z);group.name=event.id;group.visible=false;root.add(group);const color=event.kind==='dust'?0xa99d89:event.kind==='relay'?0x89a7bf:0xc8d4d9,mat=material(color,{transparent:true,opacity:.2,depthWrite:false}),particles=[];
  for(let i=0;i<5;i++){const mesh=new THREE.Mesh(event.kind==='relay'?geometries.box:geometries.sphere,mat);mesh.scale.setScalar(event.kind==='relay'?.08:event.kind==='dust'?.045:.13);group.add(mesh);particles.push(mesh);}effects.push({event,group,mat,particles});
 }
 return {root,update(activeEvents=[]){const current=typeof operation==='function'?operation():operation;for(const {site,group}of sites)group.visible=site.operation===current&&visible(site.cache.x,site.cache.z);for(const {cache,group}of caches)group.visible=cache.operation===current&&!claimed(cache.id)&&visible(cache.x,cache.z);
  for(const {event,group,mat,particles}of effects){const state=activeEvents.find(x=>x.id===event.id);group.visible=!!state&&event.operation===current&&visible(event.x,event.z);if(!group.visible)continue;const t=Number.isFinite(state.progress)?Math.max(0,Math.min(1,state.progress)):0,quiet=typeof reducedEffects==='function'?reducedEffects():reducedEffects;mat.opacity=quiet ? .12 :(1-t)*.22;
   particles.forEach((mesh,i)=>{const f=i/particles.length;if(event.kind==='dust')mesh.position.set((f-.5)*1.1,quiet ? .2 :1.4-t*1.2,.1*Math.sin(i*2));else if(event.kind==='steam')mesh.position.set((f-.5)*.5,quiet ? .25 :.15+t*.9,.12*Math.sin(i));else mesh.position.set((f-.5)*1.2,.12,quiet?0:Math.sin(t*Math.PI+f)*.12);});
  }
 },dispose(){scene.remove(root);for(const geometry of Object.values(geometries))geometry.dispose();for(const mat of materials)mat.dispose();}};
}
