import {createWireCircuitArt} from './wire-circuit-art.js?v=depth-r10';
import * as THREE from '../vendor/three.module.js';

/** Physical interfaces for the progression puzzles; state and collision stay in the controller. */
export function createProgressionArt(scene, box, state) {
  const root=new THREE.Group();root.name='progression-puzzle-interfaces';scene.add(root);
  const geometry=new THREE.BoxGeometry(1,1,1);
  const materials={
    steel:new THREE.MeshStandardMaterial({color:0x596b60,metalness:.45,roughness:.65}),
    dark:new THREE.MeshStandardMaterial({color:0x182a25,metalness:.3,roughness:.7}),
    trim:new THREE.MeshStandardMaterial({color:0xa89f75,metalness:.35,roughness:.7})
  };
  function part(group,x,y,z,w,h,d,material){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
  function canvasTexture(w,h){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return {canvas,ctx:canvas.getContext('2d'),texture};}
  function glyph(ctx,kind,x,y,size,color){ctx.strokeStyle=color;ctx.lineWidth=5;ctx.lineJoin='round';ctx.beginPath();
    if(kind==='circle')ctx.arc(x,y,size*.47,0,Math.PI*2);
    else if(kind==='triangle'){ctx.moveTo(x,y-size*.52);ctx.lineTo(x+size*.5,y+size*.4);ctx.lineTo(x-size*.5,y+size*.4);ctx.closePath();}
    else ctx.rect(x-size*.43,y-size*.43,size*.86,size*.86);ctx.stroke();
  }
  function plane(texture,w,h,x,y,z,materialOptions={}){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,...materialOptions}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);root.add(m);return m;}
  const circuitArt=createWireCircuitArt(scene,state);
  const devices=state.devices.filter(device=>device.kind!=='wire').map((device,index)=>{
    const g=new THREE.Group();g.name='interface-'+device.id;g.position.set(device.x,0,device.z);root.add(g);
    if(device.kind==='artifact'){
      part(g,0,.09,0,.75,.18,.75,materials.dark);part(g,0,.26,0,.48,.22,.48,materials.steel);
      const status=new THREE.MeshBasicMaterial({color:0xd9ad67}),artifactMaterial=new THREE.MeshStandardMaterial({color:0xe8c58a,emissive:0x805a27,emissiveIntensity:.6,metalness:.45,roughness:.25});
      const artifact=new THREE.Mesh(new THREE.OctahedronGeometry(.24),artifactMaterial);artifact.position.y=.64;artifact.rotation.y=Math.PI/4;g.add(artifact);
      const ring=new THREE.Mesh(new THREE.RingGeometry(.44,.49,32),status);ring.rotation.x=-Math.PI/2;ring.position.y=.025;g.add(ring);
      return {device,status,screenMaterial:artifactMaterial,artifact};
    }
    part(g,0,.055,0,.67,.11,.67,materials.dark);
    part(g,0,.34,.08,.34,.5,.28,materials.steel);
    part(g,0,.63,0,.69,.12,.62,materials.trim);
    const display=canvasTexture(128,128),ctx=display.ctx;
    ctx.fillStyle='#142923';ctx.fillRect(0,0,128,128);
    if(device.kind==='glyph')glyph(ctx,device.glyph||device.id.replace('glyph-',''),64,55,61,'#b5d7c3');
    else if(device.kind==='log'){ctx.strokeStyle='#b5d7c3';ctx.lineWidth=4;ctx.strokeRect(33,22,62,70);for(let y=38;y<85;y+=13){ctx.beginPath();ctx.moveTo(43,y);ctx.lineTo(85,y);ctx.stroke();}}
    else if(device.kind==='power'){ctx.fillStyle='#e5c477';ctx.font='bold 65px monospace';ctx.textAlign='center';ctx.fillText(device.id.slice(-1).toUpperCase(),64,80);}
    else if(device.kind==='task'){
      ctx.strokeStyle=device.task==='researchCoolant'?'#8ed5de':'#e0cf91';ctx.fillStyle='#e0cf91';ctx.lineWidth=5;
      if(device.task==='commandFuse'){ctx.strokeRect(32,41,64,28);for(const x of [39,85]){ctx.beginPath();ctx.moveTo(x,30);ctx.lineTo(x,80);ctx.stroke();}}
      else if(device.task==='commandRepair'||device.task==='evacPower'){ctx.beginPath();ctx.arc(64,58,29,-Math.PI*.35,Math.PI*1.35);ctx.stroke();ctx.beginPath();ctx.moveTo(64,17);ctx.lineTo(64,55);ctx.stroke();}
      else if(device.task==='researchCoolant'){ctx.beginPath();ctx.moveTo(64,20);ctx.quadraticCurveTo(17,76,64,88);ctx.quadraticCurveTo(111,76,64,20);ctx.stroke();}
      else if(device.task==='nestDecode'){for(const x of [32,64,96]){ctx.beginPath();ctx.arc(x,55,9,0,Math.PI*2);ctx.stroke();}ctx.beginPath();ctx.moveTo(32,75);ctx.lineTo(64,91);ctx.lineTo(96,75);ctx.stroke();}
      else{for(const radius of [13,25,37]){ctx.beginPath();ctx.arc(64,67,radius,-Math.PI*.8,-Math.PI*.2);ctx.stroke();}ctx.beginPath();ctx.moveTo(64,61);ctx.lineTo(64,84);ctx.stroke();}
    }
    else if(device.kind==='valve'){ctx.strokeStyle='#b5d7c3';ctx.lineWidth=5;ctx.beginPath();ctx.arc(64,57,29,0,Math.PI*2);ctx.moveTo(35,57);ctx.lineTo(93,57);ctx.moveTo(64,28);ctx.lineTo(64,86);ctx.stroke();}
    else{ctx.strokeStyle='#b5d7c3';ctx.lineWidth=4;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(64,66,14+i*13,-Math.PI*.8,-Math.PI*.2);ctx.stroke();}ctx.beginPath();ctx.arc(64,67,4,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='#819b8b';ctx.font=device.kind==='task'?'bold 11px monospace':'bold 13px monospace';ctx.textAlign='center';ctx.fillText(({glyph:'GLYPH INPUT',relay:'LINK RELAY',power:'POWER NODE',valve:'VALVE '+device.id.slice(-1).toUpperCase(),log:'RESEARCH LOG',task:device.label.split(' ').slice(-2).join(' ')})[device.kind],64,111);
    const screenMaterial=new THREE.MeshBasicMaterial({map:display.texture,color:0xffffff});
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(.59,.52),screenMaterial);screen.rotation.x=-Math.PI/2;screen.position.y=.696;g.add(screen);
    const status=new THREE.MeshBasicMaterial({color:0xdfab61});
    part(g,.255,.716,-.235,.075,.025,.075,status);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.42,.46,32),status);ring.rotation.x=-Math.PI/2;ring.position.y=.018;g.add(ring);
    return {device,status,screenMaterial};
  });
  // Plaques redraw after loading a saved normal/remixed operation.
  const clue=canvasTexture(512,160);plane(clue.texture,3.45,1.08,state.clue.x,.035,state.clue.z);
  const maintenance=[['power',59,33,'POWER ROUTE'],['valves',86,32,'VENT ORDER']].map(([id,x,z,title])=>{const plaque=canvasTexture(512,100);plane(plaque.texture,4.6,.9,x,.035,z);return {id,title,...plaque};});
  let clueVersion='';
  function updateClues(){
    const version=JSON.stringify([state.archive.sequence,state.power.sequence,state.valves.sequence]);if(version===clueVersion)return;clueVersion=version;
    const c=clue.ctx;c.clearRect(0,0,512,160);c.fillStyle='#222e29';c.fillRect(0,0,512,160);c.strokeStyle='#8e967b';c.lineWidth=4;c.strokeRect(4,4,504,152);
    c.fillStyle='#a4b59b';c.textAlign='center';c.font='bold 17px monospace';c.fillText('ARCHIVE OVERRIDE · INPUT ORDER',256,31);
    state.archive.sequence.forEach((kind,i)=>glyph(c,kind,100+i*157,94,61,'#ded4a6'));
    for(const x of [178,335]){c.strokeStyle='#97aa94';c.lineWidth=4;c.beginPath();c.moveTo(x-18,94);c.lineTo(x+17,94);c.lineTo(x+8,85);c.moveTo(x+17,94);c.lineTo(x+8,103);c.stroke();}clue.texture.needsUpdate=true;
    for(const plaque of maintenance){const ctx=plaque.ctx;ctx.clearRect(0,0,512,100);ctx.fillStyle='#172920';ctx.fillRect(0,0,512,100);ctx.strokeStyle='#b7ae73';ctx.lineWidth=3;ctx.strokeRect(3,3,506,94);ctx.fillStyle='#e4d4a0';ctx.font='bold 23px monospace';ctx.textAlign='center';const sequence=state[plaque.id].sequence??(plaque.id==='power'?['power-a','power-b','power-c']:['valve-a','valve-b','valve-a','valve-b']);ctx.fillText(`${plaque.title}: ${sequence.map(value=>value.slice(-1).toUpperCase()).join(' → ')}`,256,62);plaque.texture.needsUpdate=true;}
  }
  // Surface timer avoids adding an unaccounted-for obstacle between the relay stations.
  const timer=canvasTexture(512,128);plane(timer.texture,2.8,.7,24,.035,14.15);let lastTimer='';
  const zoneMaterials=[];
  const stripe=canvasTexture(256,64);stripe.ctx.fillStyle='#8f8753';stripe.ctx.fillRect(0,0,256,64);stripe.ctx.strokeStyle='#14221c';stripe.ctx.lineWidth=24;for(let x=-64;x<320;x+=64){stripe.ctx.beginPath();stripe.ctx.moveTo(x,0);stripe.ctx.lineTo(x+64,64);stripe.ctx.stroke();}
  stripe.texture.wrapS=THREE.RepeatWrapping;stripe.texture.repeat.x=4;
  const arenas={storage:{x:23,z:30.5,w:7.5},command:{x:38.5,z:14.5,w:8.5}};
  for(const zone of state.zones){const a=arenas[zone.id];if(!a)continue;
    const strip=plane(stripe.texture,a.w,.24,a.x,.032,a.z);
    const status=new THREE.MeshBasicMaterial({color:0x967d47,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false});
    const marker=new THREE.Mesh(new THREE.RingGeometry(.58,.66,32),status);marker.rotation.x=-Math.PI/2;marker.position.set(a.x,.036,a.z-.8);root.add(marker);
    zoneMaterials.push({zone,status,strip});
  }
  const sealMaterials=[];
  for(const [x,z,axis] of [[71,10,'z'],[86,20,'x']]){
    const g=new THREE.Group();g.name='nest-artifact-seal';g.position.set(x,0,z);root.add(g);
    part(g,axis==='z'?.32:0,1.51,axis==='x'?.32:0,axis==='x'?1.7:.12,.10,axis==='z'?1.7:.12,materials.dark);
    ['artifact-archive','artifact-generator','artifact-containment'].forEach((id,i)=>{const material=new THREE.MeshBasicMaterial({color:0x725c40});part(g,axis==='x'?(i-1)*.56:.32,1.60,axis==='z'?(i-1)*.56:.32,.22,.10,.22,material);sealMaterials.push({id,material});});
  }
  function update(time=0){
    updateClues();circuitArt.update();
    for(const socket of sealMaterials)socket.material.color.set(state.artifacts?.includes(socket.id)?0x8be4b3:0x725c40);
    for(const entry of devices){const {device,status,screenMaterial}=entry;if(device.kind==='artifact'){const collected=state.artifacts?.includes(device.id);entry.artifact.visible=!collected;device.active=!!collected;}status.color.set(device.active?0x86e5a3:device.kind==='relay'&&device.progress>0?0xa8cecc:0xdfab61);screenMaterial.color.set(device.active?0x8bedb2:0xffffff);}
    const relay=state.relay,completed=relay.completed||relay.solved;
    const label=completed?'LINK ESTABLISHED':relay.started?`LINK WINDOW  ${Math.ceil(Math.max(0,relay.remaining))}s`:'LINK RELAYS · 8 SECOND WINDOW';
    if(label!==lastTimer){const ctx=timer.ctx;ctx.clearRect(0,0,512,128);ctx.fillStyle='#152820';ctx.fillRect(0,0,512,128);ctx.strokeStyle=completed?'#88dba0':'#817c56';ctx.lineWidth=3;ctx.strokeRect(3,3,506,122);ctx.fillStyle=completed?'#b2efc3':'#c6bc8e';ctx.textAlign='center';ctx.font='bold 25px monospace';ctx.fillText(label,256,74);timer.texture.needsUpdate=true;lastTimer=label;}
    for(const {zone,status} of zoneMaterials){status.color.set(zone.status==='cleared'?0x86dda0:zone.status==='active'?0xf09058:0x967d47);status.opacity=zone.status==='active'?.55+Math.sin(time*5)*.2:.45;}
  }
  update();return update;
}
