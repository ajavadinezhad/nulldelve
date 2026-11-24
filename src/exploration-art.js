import * as THREE from '../vendor/three.module.js';
import {EXPLORATION_ALCOVES,EXPLORATION_CACHES,EXPLORATION_EVENTS,EXPLORATION_SHORTCUTS,WORLD_REVEALS,NEST_CONDUIT_GATES,nestConduitState} from './exploration.js?v=operator-profile-r58';
/** Quiet recess dressing and small atmospheric effects remain below discovery fog. */
export function createExplorationArt(scene,{operation,claimed=()=>false,visible=()=>false,reducedEffects=()=>false,tasks=()=>({}),elapsed=()=>0,player=()=>null}={}){
 const root=new THREE.Group();root.name='optional-exploration';scene.add(root);
 const geometries={box:new THREE.BoxGeometry(1,1,1),sphere:new THREE.SphereGeometry(1,6,4)},materials=new Set(),sites=[],caches=[],effects=[],gates=[],releases=[],reveals=[],conduits=[];
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
 // Cash is stored beside a physical service-release switch. The same durable
 // claim moves this lever and its remote gate, making the reward causal.
 for(const cache of EXPLORATION_CACHES){
  const group=new THREE.Group();group.name='release-'+cache.id;group.position.set(cache.x+.8,0,cache.z);group.visible=false;root.add(group);
  block(group,0,.22,0,.36,.44,.42,steel);block(group,0,.46,0,.44,.05,.48,dark);
  for(const x of [-.1,0,.1])block(group,x,.5,.08,.025,.025,.2,edge);
  const handle=block(group,0,.57,-.06,.08,.18,.08,band);releases.push({cache,group,handle});
 }
 for(const reveal of WORLD_REVEALS){
  const group=new THREE.Group();group.name='world-reveal-'+reveal.id;group.position.set(reveal.x,0,reveal.z);group.visible=false;root.add(group);
  if(reveal.kind==='antenna'||reveal.kind==='uplink'){
   block(group,0,.45,0,.7,.9,.5,steel);
   const signalMaterial=material(0xb47468,{emissive:0x6a352d,emissiveIntensity:.55});
   for(let i=0;i<3;i++)block(group,(i-1)*.22,.98,0,.12,.08,.16,signalMaterial);
   reveals.push({reveal,group,signalMaterial});
  }else{
   block(group,0,.14,0,1.15,.28,.75,steel);const lid=block(group,0,.31,0,1.2,.08,.8,dark),specimens=new THREE.Group();group.add(specimens);
   const shell=material(0x998677,{emissive:0x3c5662,emissiveIntensity:.25});
   for(let i=0;i<3;i++){const egg=new THREE.Mesh(geometries.sphere,shell);egg.position.set((i-1)*.28,.34,0);egg.scale.set(.11,.18,.12);specimens.add(egg);}
   specimens.visible=false;reveals.push({reveal,group,lid,specimens});
  }
 }
 for(const shortcut of EXPLORATION_SHORTCUTS){
  const group=new THREE.Group();group.name=shortcut.id;group.position.set(shortcut.gate.x,0,shortcut.gate.z);if(shortcut.gate.axis==='x')group.rotation.y=Math.PI/2;group.visible=false;root.add(group);
  const frame=new THREE.Group(),barrier=new THREE.Group();group.add(frame,barrier);
  for(const z of [-1.4,1.4])block(frame,0,.55,z,.2,1.1,.18,steel);
  for(const z of [-1,-.5,0,.5,1])block(barrier,0,.45,z,.12,.9,.08,edge);
  block(barrier,0,.85,0,.13,.1,2.8,band);
  const lampMaterial=material(0xc6a66e,{emissive:0x796443,emissiveIntensity:.4}),lamp=block(frame,.13,1.03,-1.4,.08,.12,.1,lampMaterial);
  gates.push({shortcut,group,barrier,lampMaterial});
 }
 for(const gate of NEST_CONDUIT_GATES){
  const group=new THREE.Group();group.name=gate.id;group.position.set(gate.x,0,gate.z);if(gate.axis==='x')group.rotation.y=Math.PI/2;group.visible=false;root.add(group);
  // Side-mounted pressure source, overhead supply and a full-width safety rail.
  block(group,-.3,.45,-1.65,.6,.9,.45,steel);block(group,-.3,.95,-1.65,.7,.1,.5,dark);
  block(group,0,1.15,0,.12,.12,3.4,edge);
  const shutter=block(group,0,.45,0,.12,.9,2.8,steel),lamp=material(0x8bc8dc,{emissive:0x365e68,emissiveIntensity:.65});
  for(const z of [-1.3,-.65,0,.65,1.3])block(group,.12,.12,z,.1,.08,.18,lamp);
  const vapor=new THREE.Group();group.add(vapor);const steamMaterial=material(0xbacdd6,{transparent:true,opacity:.18,depthWrite:false});
  for(let i=0;i<5;i++){const puff=new THREE.Mesh(geometries.sphere,steamMaterial);puff.position.set(0,.4,(i-2)*.55);puff.scale.set(.18,.35,.2);vapor.add(puff);}
  conduits.push({gate,group,shutter,lamp,vapor});
 }
 for(const event of EXPLORATION_EVENTS){const group=new THREE.Group();group.position.set(event.x,0,event.z);group.name=event.id;group.visible=false;root.add(group);const color=event.kind==='dust'?0xa99d89:event.kind==='relay'?0x89a7bf:0xc8d4d9,mat=material(color,{transparent:true,opacity:.2,depthWrite:false}),particles=[];
  for(let i=0;i<5;i++){const mesh=new THREE.Mesh(event.kind==='relay'?geometries.box:geometries.sphere,mat);mesh.scale.setScalar(event.kind==='relay'?.08:event.kind==='dust'?.045:.13);group.add(mesh);particles.push(mesh);}effects.push({event,group,mat,particles});
 }
 return {root,update(activeEvents=[]){const current=typeof operation==='function'?operation():operation;for(const {site,group}of sites)group.visible=site.operation===current&&visible(site.cache.x,site.cache.z);for(const {cache,group}of caches)group.visible=cache.operation===current&&!claimed(cache.id)&&visible(cache.x,cache.z);
  for(const {cache,group,handle}of releases){group.visible=cache.operation===current&&visible(cache.x,cache.z);handle.rotation.x=claimed(cache.id)?Math.PI*.35:-Math.PI*.35;}
  const currentTasks=typeof tasks==='function'?tasks():tasks;
  const conduitContext={operation:current,tasks:currentTasks,elapsed:typeof elapsed==='function'?elapsed():elapsed,player:typeof player==='function'?player():player};
  for(const {gate,group,shutter,lamp,vapor}of conduits){const status=nestConduitState(gate,conduitContext);group.visible=current==='nest'&&(visible(gate.x,gate.z)||visible(gate.x+(gate.axis==='z'?.8:0),gate.z+(gate.axis==='x'?.8:0))||visible(gate.x-(gate.axis==='z'?.8:0),gate.z-(gate.axis==='x'?.8:0)));shutter.position.y=status.closed?.45:-.5;vapor.visible=status.closed;lamp.color.setHex(status.closed?0xc78579:status.warning?0xe4b767:0x8bc8dc);lamp.emissive.setHex(status.closed?0x70392f:status.warning?0x785a26:0x365e68);}
  for(const item of reveals){const active=!!currentTasks?.[item.reveal.task];item.group.visible=item.reveal.operation===current&&visible(item.reveal.x,item.reveal.z);if(item.lid){item.lid.position.z=active?-.65:0;item.specimens.visible=active;}if(item.signalMaterial){item.signalMaterial.color.setHex(active?item.reveal.kind==='antenna'?0x596675:0x8bc8dc:0xb47468);item.signalMaterial.emissive.setHex(active?item.reveal.kind==='antenna'?0x000000:0x365e68:0x6a352d);}}
  for(const {shortcut,group,barrier,lampMaterial}of gates){const open=claimed(shortcut.reward);group.visible=shortcut.operation===current&&visible(shortcut.gate.x,shortcut.gate.z);barrier.position.y=open?-.93:0;lampMaterial.color.setHex(open?0x8bc8dc:0xc6a66e);lampMaterial.emissive.setHex(open?0x395e6b:0x796443);}
  for(const {event,group,mat,particles}of effects){const state=activeEvents.find(x=>x.id===event.id);group.visible=!!state&&event.operation===current&&visible(event.x,event.z);if(!group.visible)continue;const t=Number.isFinite(state.progress)?Math.max(0,Math.min(1,state.progress)):0,quiet=typeof reducedEffects==='function'?reducedEffects():reducedEffects;mat.opacity=quiet ? .12 :(1-t)*.22;
   particles.forEach((mesh,i)=>{const f=i/particles.length;if(event.kind==='dust')mesh.position.set((f-.5)*1.1,quiet ? .2 :1.4-t*1.2,.1*Math.sin(i*2));else if(event.kind==='steam')mesh.position.set((f-.5)*.5,quiet ? .25 :.15+t*.9,.12*Math.sin(i));else mesh.position.set((f-.5)*1.2,.12,quiet?0:Math.sin(t*Math.PI+f)*.12);});
  }
 },dispose(){scene.remove(root);for(const geometry of Object.values(geometries))geometry.dispose();for(const mat of materials)mat.dispose();}};
}
