import {hospitalAirlockTarget,freightTrackTarget} from './progression.js?v=expansion-r22';
import {createWireCircuitArt} from './wire-circuit-art.js?v=expansion-r22';
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
    ctx.fillStyle=device.task?.startsWith('hospital')?'#162733':'#142923';ctx.fillRect(0,0,128,128);
    if(device.kind==='glyph')glyph(ctx,device.glyph||device.id.replace('glyph-',''),64,55,61,'#b5d7c3');
    else if(device.kind==='log'){ctx.strokeStyle='#b5d7c3';ctx.lineWidth=4;ctx.strokeRect(33,22,62,70);for(let y=38;y<85;y+=13){ctx.beginPath();ctx.moveTo(43,y);ctx.lineTo(85,y);ctx.stroke();}}
    else if(device.kind==='power'){ctx.fillStyle='#e5c477';ctx.font='bold 65px monospace';ctx.textAlign='center';ctx.fillText(device.id.slice(-1).toUpperCase(),64,80);}
    else if(device.kind==='task'){
      ctx.strokeStyle=device.task==='researchCoolant'?'#8ed5de':'#e0cf91';ctx.fillStyle='#e0cf91';ctx.lineWidth=5;
      if(device.task?.startsWith('hospital')){
       ctx.strokeStyle='#c5dbe5';ctx.fillStyle='#c5dbe5';
       if(device.task==='hospitalSample'){ctx.strokeRect(48,30,32,55);ctx.strokeRect(43,23,42,9);ctx.fillStyle='#b76c7c';ctx.fillRect(53,55,22,24);}
       else if(device.task==='hospitalAuth'){ctx.beginPath();ctx.moveTo(23,60);ctx.lineTo(42,60);ctx.lineTo(52,37);ctx.lineTo(66,82);ctx.lineTo(78,53);ctx.lineTo(104,53);ctx.stroke();}
       else if(device.task.startsWith('hospitalValve')){ctx.beginPath();ctx.arc(64,55,29,0,Math.PI*2);ctx.stroke();ctx.font='bold 33px monospace';ctx.textAlign='center';ctx.fillText(device.task.slice(-1)==='A'?'O':device.task.slice(-1)==='B'?'F':'E',64,67);}
       else{ctx.beginPath();ctx.moveTo(71,22);ctx.lineTo(46,60);ctx.lineTo(65,60);ctx.lineTo(55,90);ctx.lineTo(84,49);ctx.lineTo(65,49);ctx.closePath();ctx.stroke();}
      }
      else if(device.task==='commandFuse'){ctx.strokeRect(32,41,64,28);for(const x of [39,85]){ctx.beginPath();ctx.moveTo(x,30);ctx.lineTo(x,80);ctx.stroke();}}
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
  const hospitalPlaque=canvasTexture(512,160);plane(hospitalPlaque.texture,3.8,1.1,118,.035,31);
  const freightPlaque=canvasTexture(512,160);plane(freightPlaque.texture,4.2,1.1,164,.035,25);
  let clueVersion='';
  function updateClues(){
    const version=JSON.stringify([state.archive.sequence,state.power.sequence,state.valves.sequence,state.remix]);if(version===clueVersion)return;clueVersion=version;
    const fc=freightPlaque.ctx;fc.fillStyle='#23323e';fc.fillRect(0,0,512,160);fc.strokeStyle='#bca477';fc.lineWidth=4;fc.strokeRect(4,4,504,152);fc.fillStyle='#e5d3ae';fc.textAlign='center';fc.font='bold 26px monospace';fc.fillText('COLD CHAIN ROUTE',256,52);fc.fillText('A / B: '+freightTrackTarget(state.remix).join(' / '),256,111);freightPlaque.texture.needsUpdate=true;
    const hc=hospitalPlaque.ctx;hc.clearRect(0,0,512,160);hc.fillStyle='#243540';hc.fillRect(0,0,512,160);hc.strokeStyle='#a5bbc8';hc.lineWidth=4;hc.strokeRect(4,4,504,152);hc.textAlign='center';hc.fillStyle='#e0e9e9';hc.font='bold 24px monospace';hc.fillText('QUARANTINE PRESSURE',256,48);hc.font='bold 22px monospace';hc.fillText('O / F / E: '+hospitalAirlockTarget(state.remix).join(' / '),256,106);hospitalPlaque.texture.needsUpdate=true;
    const c=clue.ctx;c.clearRect(0,0,512,160);c.fillStyle='#222e29';c.fillRect(0,0,512,160);c.strokeStyle='#8e967b';c.lineWidth=4;c.strokeRect(4,4,504,152);
    c.fillStyle='#a4b59b';c.textAlign='center';c.font='bold 17px monospace';c.fillText('ARCHIVE OVERRIDE · INPUT ORDER',256,31);
    state.archive.sequence.forEach((kind,i)=>glyph(c,kind,100+i*157,94,61,'#ded4a6'));
    for(const x of [178,335]){c.strokeStyle='#97aa94';c.lineWidth=4;c.beginPath();c.moveTo(x-18,94);c.lineTo(x+17,94);c.lineTo(x+8,85);c.moveTo(x+17,94);c.lineTo(x+8,103);c.stroke();}clue.texture.needsUpdate=true;
    for(const plaque of maintenance){const ctx=plaque.ctx;ctx.clearRect(0,0,512,100);ctx.fillStyle='#172920';ctx.fillRect(0,0,512,100);ctx.strokeStyle='#b7ae73';ctx.lineWidth=3;ctx.strokeRect(3,3,506,94);ctx.fillStyle='#e4d4a0';ctx.font='bold 23px monospace';ctx.textAlign='center';const sequence=state[plaque.id].sequence??(plaque.id==='power'?['power-a','power-b','power-c']:['valve-a','valve-b','valve-a','valve-b']);ctx.fillText(`${plaque.title}: ${sequence.map(value=>value.slice(-1).toUpperCase()).join(' → ')}`,256,62);plaque.texture.needsUpdate=true;}
  }
  // Surface timer avoids adding an unaccounted-for obstacle between the relay stations.
  const timer=canvasTexture(512,128);plane(timer.texture,2.8,.7,24,.035,14.15);let lastTimer='';
  const airlockScreen=canvasTexture(512,160);plane(airlockScreen.texture,4.4,1.2,136,.035,34.8);let lastAirlock='';
  const restartScreen=canvasTexture(512,128);plane(restartScreen.texture,4.4,1,35,.035,54.8);let lastRestart='';
  const sabotageMarkers=new Map();
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
  const railBoard=new THREE.Group();railBoard.name='freight-routing-board';railBoard.position.set(186,.02,31);root.add(railBoard);
  for(const x of [-1,1])part(railBoard,x,.03,0,.07,.06,5,materials.steel);
  for(const z of [-2,-1,0,1,2])part(railBoard,0,.01,z,2.5,.03,.12,materials.trim);
  const cargoCar=new THREE.Group();part(cargoCar,0,.2,0,1.5,.4,.85,materials.trim);part(cargoCar,0,.45,0,1.2,.2,.7,materials.steel);railBoard.add(cargoCar);
  const railSignals=[0,1].map(index=>{const material=new THREE.MeshBasicMaterial({color:0xb67b50});part(railBoard,index?1.5:-1.5,.1,0,.2,.15,.2,material);return material;});
  function update(time=0){
    updateClues();circuitArt.update();const route=state.operationTasks?.freightRoute;if(route){const progress=route.delivered?1:route.running?1-route.remaining/8:0;cargoCar.position.z=2-progress*4;const target=freightTrackTarget(state.remix);for(let i=0;i<2;i++)railSignals[i].color.set(route.switches[i]===target[i]?0x84b8c8:0xc18c51);}
    const airlock=state.operationTasks?.hospitalAirlock,target=hospitalAirlockTarget(state.remix),defense=state.operationTasks?.generatorDefense;
    if(airlock){const label=state.operationTasks.hospitalSterile?'AIRLOCK STERILE':airlock.running?`SEALED CYCLE ${Math.ceil(airlock.remaining)}s`:`O ${airlock.settings[0]}/2  F ${airlock.settings[1]}/2  E ${airlock.settings[2]}/2`;if(label!==lastAirlock){const c=airlockScreen.ctx;c.clearRect(0,0,512,160);c.fillStyle='#1a2a38';c.fillRect(0,0,512,160);c.textAlign='center';c.font='bold 26px monospace';c.fillStyle='#b7cbd8';c.fillText(label,256,53);c.font='bold 22px monospace';c.fillStyle='#ecc17c';c.fillText('OXYGEN / FILTER / EXHAUST',256,98);c.font='18px monospace';c.fillText('MATCH GAUGES · THEN START CYCLE',256,133);airlockScreen.texture.needsUpdate=true;lastAirlock=label;}}
    if(defense){const label=defense.completed?'RESTART STABLE':defense.jammed?'JAMMED · INTERACT TO REPAIR':defense.started?`DEFEND RESTART ${Math.floor(defense.progress/22*100)}%`:'EMERGENCY RESTART';if(label!==lastRestart){const c=restartScreen.ctx;c.clearRect(0,0,512,128);c.fillStyle='#202a35';c.fillRect(0,0,512,128);c.fillStyle=defense.jammed?'#ef997c':'#edc17c';c.textAlign='center';c.font='bold 24px monospace';c.fillText(label,256,64);c.font='17px monospace';c.fillText('AMBER RINGS: CONSOLE SABOTEURS',256,102);restartScreen.texture.needsUpdate=true;lastRestart=label;}
     for(const marker of sabotageMarkers.values())marker.visible=false;const wave=state.zones.find(z=>z.id==='generator')?.wave??[];for(const e of wave){if(!defense.saboteurIds.includes(e.id))continue;let marker=sabotageMarkers.get(e.id);if(!marker){marker=new THREE.Mesh(new THREE.RingGeometry(.48,.57,20),new THREE.MeshBasicMaterial({color:0xf0bb64,side:THREE.DoubleSide,transparent:true,opacity:.8}));marker.rotation.x=-Math.PI/2;root.add(marker);sabotageMarkers.set(e.id,marker);}marker.visible=e.hp>0&&e.mesh?.visible!==false&&!defense.completed;marker.position.set(e.x,.07,e.z);}}

    for(const socket of sealMaterials)socket.material.color.set(state.artifacts?.includes(socket.id)?0x8be4b3:0x725c40);
    for(const entry of devices){const {device,status,screenMaterial}=entry;if(device.kind==='artifact'){const collected=state.artifacts?.includes(device.id);entry.artifact.visible=!collected;device.active=!!collected;}status.color.set(device.active?0x86e5a3:device.kind==='relay'&&device.progress>0?0xa8cecc:0xdfab61);screenMaterial.color.set(device.active?0x8bedb2:0xffffff);}
    const relay=state.relay,completed=relay.completed||relay.solved;
    const label=completed?'LINK ESTABLISHED':relay.started?`LINK WINDOW  ${Math.ceil(Math.max(0,relay.remaining))}s`:'LINK RELAYS · 8 SECOND WINDOW';
    if(label!==lastTimer){const ctx=timer.ctx;ctx.clearRect(0,0,512,128);ctx.fillStyle='#152820';ctx.fillRect(0,0,512,128);ctx.strokeStyle=completed?'#88dba0':'#817c56';ctx.lineWidth=3;ctx.strokeRect(3,3,506,122);ctx.fillStyle=completed?'#b2efc3':'#c6bc8e';ctx.textAlign='center';ctx.font='bold 25px monospace';ctx.fillText(label,256,74);timer.texture.needsUpdate=true;lastTimer=label;}
    for(const {zone,status} of zoneMaterials){status.color.set(zone.status==='cleared'?0x86dda0:zone.status==='active'?0xf09058:0x967d47);status.opacity=zone.status==='active'?.55+Math.sin(time*5)*.2:.45;}
  }
  update();return update;
}
