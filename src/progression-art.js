import {puzzleAccessVisible} from './puzzle-access.js';
import {createWireCircuitArt} from './wire-circuit-art.js?v=campaign-pacing-r53';
import * as THREE from '../vendor/three.module.js';

/** Physical interfaces for the progression puzzles; state and collision stay in the controller. */
export function createProgressionArt(scene, box, state) {
  const root=new THREE.Group();root.name='progression-puzzle-interfaces';scene.add(root);
  const geometry=new THREE.BoxGeometry(1,1,1);
  const materials={
    steel:new THREE.MeshStandardMaterial({color:0x596b7b,metalness:.45,roughness:.65}),
    dark:new THREE.MeshStandardMaterial({color:0x19232e,metalness:.3,roughness:.7}),
    trim:new THREE.MeshStandardMaterial({color:0xad9c7d,metalness:.35,roughness:.7})
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
  const devices=state.devices.filter(device=>device.kind!=='wire'&&puzzleAccessVisible(device)).map((device,index)=>{
    const g=new THREE.Group();g.name='interface-'+device.id;g.position.set(device.x,0,device.z);root.add(g);
    if(device.kind==='artifact'){
      part(g,0,.09,0,.75,.18,.75,materials.dark);part(g,0,.26,0,.48,.22,.48,materials.steel);
      const status=new THREE.MeshBasicMaterial({color:0xd9ad67}),artifactMaterial=new THREE.MeshStandardMaterial({color:0xe8c58a,emissive:0x805a27,emissiveIntensity:.6,metalness:.45,roughness:.25});
      const artifact=new THREE.Mesh(new THREE.OctahedronGeometry(.24),artifactMaterial);artifact.position.y=.64;artifact.rotation.y=Math.PI/4;g.add(artifact);
      const ring=new THREE.Mesh(new THREE.RingGeometry(.44,.49,32),status);ring.rotation.x=-Math.PI/2;ring.position.y=.025;g.add(ring);
      return {device,status,screenMaterial:artifactMaterial,artifact};
    }
    const isGlyph=device.kind==='glyph';
    if(isGlyph){part(g,0,.06,0,1.28,.12,1.2,materials.dark);part(g,0,.13,0,1.16,.025,1.08,materials.steel);}
    else{part(g,0,.055,0,.67,.11,.67,materials.dark);part(g,0,.34,.08,.34,.5,.28,materials.steel);part(g,0,.63,0,.69,.12,.62,materials.trim);}
    const display=canvasTexture(128,128),ctx=display.ctx;
    ctx.fillStyle=isGlyph?'#101722':device.task?.startsWith('hospital')?'#162733':'#182330';ctx.fillRect(0,0,128,128);
    if(isGlyph){ctx.strokeStyle='#657083';ctx.lineWidth=3;for(const [x,y,dx,dy]of [[7,7,1,1],[121,7,-1,1],[7,121,1,-1],[121,121,-1,-1]]){ctx.beginPath();ctx.moveTo(x+dx*15,y);ctx.lineTo(x,y);ctx.lineTo(x,y+dy*15);ctx.stroke();}ctx.strokeStyle='#f2f4f8';ctx.lineWidth=4;ctx.strokeRect(25,26,78,76);for(const x of [39,64,89])ctx.strokeRect(x-7,57,14,20);}
    else if(device.kind==='log'){ctx.strokeStyle='#bfd0df';ctx.lineWidth=4;ctx.strokeRect(33,22,62,70);for(let y=38;y<85;y+=13){ctx.beginPath();ctx.moveTo(43,y);ctx.lineTo(85,y);ctx.stroke();}}
    else if(device.kind==='power'){ctx.strokeStyle='#e5c477';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(73,20);ctx.lineTo(43,65);ctx.lineTo(65,65);ctx.lineTo(55,94);ctx.lineTo(88,48);ctx.lineTo(66,48);ctx.closePath();ctx.stroke();}
    else if(device.kind==='task'){
      ctx.strokeStyle=device.task==='researchCoolant'?'#8ed5de':'#e0cf91';ctx.fillStyle='#e0cf91';ctx.lineWidth=5;
      if(device.task?.startsWith('hospital')){
       ctx.strokeStyle='#c5dbe5';ctx.fillStyle='#c5dbe5';
       if(device.task==='hospitalSample'){ctx.strokeRect(48,30,32,55);ctx.strokeRect(43,23,42,9);ctx.fillStyle='#b76c7c';ctx.fillRect(53,55,22,24);}
       else if(device.task==='hospitalAuth'){ctx.beginPath();ctx.moveTo(23,60);ctx.lineTo(42,60);ctx.lineTo(52,37);ctx.lineTo(66,82);ctx.lineTo(78,53);ctx.lineTo(104,53);ctx.stroke();}
       else if(device.task.startsWith('hospitalValve')){ctx.beginPath();ctx.arc(64,55,29,0,Math.PI*2);ctx.stroke();ctx.moveTo(64,55);ctx.lineTo(79,40);ctx.stroke();}
       else{ctx.beginPath();ctx.moveTo(71,22);ctx.lineTo(46,60);ctx.lineTo(65,60);ctx.lineTo(55,90);ctx.lineTo(84,49);ctx.lineTo(65,49);ctx.closePath();ctx.stroke();}
      }
      else if(device.task==='commandFuse'){ctx.strokeRect(32,41,64,28);for(const x of [39,85]){ctx.beginPath();ctx.moveTo(x,30);ctx.lineTo(x,80);ctx.stroke();}}
      else if(device.task==='commandRepair'||device.task==='evacPower'){ctx.beginPath();ctx.arc(64,58,29,-Math.PI*.35,Math.PI*1.35);ctx.stroke();ctx.beginPath();ctx.moveTo(64,17);ctx.lineTo(64,55);ctx.stroke();}
      else if(device.task==='researchCoolant'){ctx.beginPath();ctx.moveTo(64,20);ctx.quadraticCurveTo(17,76,64,88);ctx.quadraticCurveTo(111,76,64,20);ctx.stroke();}
      else if(device.task==='nestDecode'){for(const x of [32,64,96]){ctx.beginPath();ctx.arc(x,55,9,0,Math.PI*2);ctx.stroke();}ctx.beginPath();ctx.moveTo(32,75);ctx.lineTo(64,91);ctx.lineTo(96,75);ctx.stroke();}
      else{for(const radius of [13,25,37]){ctx.beginPath();ctx.arc(64,67,radius,-Math.PI*.8,-Math.PI*.2);ctx.stroke();}ctx.beginPath();ctx.moveTo(64,61);ctx.lineTo(64,84);ctx.stroke();}
    }
    else if(device.kind==='valve'){ctx.strokeStyle='#bfd0df';ctx.lineWidth=5;ctx.beginPath();ctx.arc(64,57,29,0,Math.PI*2);ctx.moveTo(35,57);ctx.lineTo(93,57);ctx.moveTo(64,28);ctx.lineTo(64,86);ctx.stroke();}
    else{ctx.strokeStyle='#bfd0df';ctx.lineWidth=4;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(64,66,14+i*13,-Math.PI*.8,-Math.PI*.2);ctx.stroke();}ctx.beginPath();ctx.arc(64,67,4,0,Math.PI*2);ctx.stroke();}
    const screenMaterial=new THREE.MeshBasicMaterial({map:display.texture,color:0xffffff});
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(isGlyph?1.08:.59,isGlyph?1.02:.52),screenMaterial);screen.rotation.x=-Math.PI/2;screen.position.y=isGlyph?.15:.696;g.add(screen);
    const status=new THREE.MeshBasicMaterial({color:0xdfab61});
    part(g,0,isGlyph?.17:.716,isGlyph?.57:-.235,isGlyph?.62:.32,.025,.065,status);
    let wheel=null,breaker=null;
    if(device.kind==='valve'){
      wheel=new THREE.Group();wheel.name='valve-wheel-'+device.id;wheel.position.set(0,.83,0);g.add(wheel);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.24,.045,6,16),materials.steel);rim.rotation.x=-Math.PI/2;wheel.add(rim);
      for(let i=0;i<3;i++){const a=i*Math.PI*2/3,spoke=part(wheel,Math.sin(a)*.115,0,Math.cos(a)*.115,.045,.055,.24,materials.steel);spoke.rotation.y=a;}
      part(wheel,0,.02,0,.12,.07,.12,materials.trim);
    }else if(device.kind==='power'){
      part(g,0,.75,0,.22,.06,.4,materials.dark);breaker=part(g,0,.81,.10,.27,.10,.12,materials.steel);breaker.name='breaker-handle-'+device.id;
    }
    return {device,status,screenMaterial,group:g,wheel,breaker};
  });
  // No decorative puzzle plaques or free clue diagrams.
  function updateClues(){}
  function instrument(display){const c=display.ctx,w=display.canvas.width,h=display.canvas.height;c.clearRect(0,0,w,h);c.fillStyle='#131d28';c.fillRect(0,0,w,h);c.strokeStyle='#566777';c.lineWidth=3;c.strokeRect(3,3,w-6,h-6);c.fillStyle='#82919e';for(const x of [12,w-12])for(const y of [12,h-12])c.fillRect(x-2,y-2,4,4);return c;}
  function bar(c,x,y,w,h,value,color){const fraction=Math.max(0,Math.min(1,Number(value)||0));c.fillStyle='#293746';c.fillRect(x,y,w,h);c.fillStyle=color;c.fillRect(x,y,w*fraction,h);}
  function gauge(c,x,value,label){const v=Math.max(0,Math.min(2,Number(value)||0)),angle=Math.PI+v*Math.PI/2;c.strokeStyle='#566777';c.lineWidth=7;c.beginPath();c.arc(x,79,32,Math.PI,Math.PI*2);c.stroke();c.strokeStyle='#dfb879';c.lineWidth=4;c.beginPath();c.moveTo(x,79);c.lineTo(x+Math.cos(angle)*27,79+Math.sin(angle)*27);c.stroke();c.textAlign='center';c.fillStyle='#c4d0dc';c.font='bold 22px monospace';c.fillText(String(v),x,113);c.font='17px monospace';c.fillStyle='#8fa1b4';c.fillText(label,x,140);}

  // Surface timer avoids adding an unaccounted-for obstacle between the relay stations.
  const timer=canvasTexture(512,128);plane(timer.texture,2.8,.7,24,.035,14.15);let lastTimer='';
  const airlockScreen=canvasTexture(512,160);plane(airlockScreen.texture,4.4,1.2,136,.035,34.8);let lastAirlock='';
  const restartScreen=canvasTexture(512,128);plane(restartScreen.texture,4.4,1,35,.035,54.8);let lastRestart='';
  const sabotageMarkers=new Map();
  const zoneMaterials=[];
  const stripe=canvasTexture(256,64);stripe.ctx.fillStyle='#a9956e';stripe.ctx.fillRect(0,0,256,64);stripe.ctx.strokeStyle='#19232e';stripe.ctx.lineWidth=24;for(let x=-64;x<320;x+=64){stripe.ctx.beginPath();stripe.ctx.moveTo(x,0);stripe.ctx.lineTo(x+64,64);stripe.ctx.stroke();}
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
    ['artifact-archive','artifact-generator','artifact-containment'].forEach((id,i)=>{const material=new THREE.MeshBasicMaterial({color:0x4c5968}),sx=axis==='x'?(i-1)*.56:.32,sz=axis==='z'?(i-1)*.56:.32;part(g,sx,1.60,sz,.22,.10,.22,material);const collar=new THREE.Mesh(new THREE.TorusGeometry(.18,.035,6,16),materials.steel);collar.name='relic-socket-collar';collar.rotation.x=-Math.PI/2;collar.position.set(sx,1.66,sz);g.add(collar);sealMaterials.push({id,material});});
  }
  const railBoard=new THREE.Group();railBoard.name='freight-routing-board';railBoard.position.set(186,.02,31);root.add(railBoard);
  for(const x of [-1,1])part(railBoard,x,.03,0,.07,.06,5,materials.steel);
  for(const z of [-2,-1,0,1,2])part(railBoard,0,.01,z,2.5,.03,.12,materials.trim);
  const cargoCar=new THREE.Group();part(cargoCar,0,.2,0,1.5,.4,.85,materials.trim);part(cargoCar,0,.45,0,1.2,.2,.7,materials.steel);railBoard.add(cargoCar);
  const railSignals=[0,1].map(index=>{const material=new THREE.MeshBasicMaterial({color:0xb67b50});part(railBoard,index?1.5:-1.5,.1,0,.2,.15,.2,material);return material;});
  const pointHandles=[0,1].map(index=>{const pivot=new THREE.Group();pivot.name='freight-point-handle-'+index;pivot.position.set(index?1:-1,.09,index?1.5:-1.5);railBoard.add(pivot);part(pivot,0,0,0,.27,.07,.27,materials.dark);part(pivot,0,.07,-.18,.07,.08,.45,materials.steel);part(pivot,0,.10,-.39,.23,.08,.12,materials.trim);return pivot;});
  function update(time=0){
    updateClues();circuitArt.update();const route=state.operationTasks?.freightRoute;if(route){const progress=route.delivered?1:route.running?1-Math.min(1,route.remaining/3):0;cargoCar.position.z=2-progress*4;for(const signal of railSignals)signal.color.set(route.delivered?0x94cfe0:route.running?0xd5b774:0x8794a7);pointHandles.forEach((handle,i)=>handle.rotation.y=route.switches?.[i]?Math.PI/4:0);}
    const airlock=state.operationTasks?.hospitalAirlock,defense=state.operationTasks?.generatorDefense;
    if(airlock){const label=JSON.stringify([airlock.settings,airlock.running,Math.ceil(airlock.remaining*10)/10,state.operationTasks.hospitalSterile]);if(label!==lastAirlock){const c=instrument(airlockScreen);c.textAlign='center';c.fillStyle=state.operationTasks.hospitalSterile?'#94cfe0':'#bac7d4';c.font='bold 19px monospace';c.fillText(state.operationTasks.hospitalSterile?'SEALED':airlock.running?'CYCLING':'PRESSURE',256,29);airlock.settings.forEach((value,i)=>gauge(c,[100,256,412][i],value,['OXYGEN','FILTER','EXHAUST'][i]));if(airlock.running)bar(c,38,148,436,4,1-airlock.remaining/4,'#dfb879');airlockScreen.texture.needsUpdate=true;lastAirlock=label;}}
    if(defense){const progress=Math.max(0,Math.min(1,(Number(defense.progress)||0)/22)),label=JSON.stringify([defense.completed,defense.jammed,defense.started,Math.round(progress*100)]);if(label!==lastRestart){const c=instrument(restartScreen),color=defense.jammed?'#ef997c':defense.completed?'#94cfe0':'#dfb879';c.fillStyle=color;c.textAlign='center';c.font='bold 25px monospace';c.fillText(defense.completed?'STABLE':defense.jammed?'FAULT':defense.started?'STARTING':'OFFLINE',256,48);c.font='bold 20px monospace';c.fillText(Math.floor(progress*100)+'%',256,79);bar(c,48,96,416,12,defense.completed?1:progress,color);restartScreen.texture.needsUpdate=true;lastRestart=label;}
     for(const marker of sabotageMarkers.values())marker.visible=false;const wave=state.zones.find(z=>z.id==='generator')?.wave??[];for(const e of wave){if(!defense.saboteurIds.includes(e.id))continue;let marker=sabotageMarkers.get(e.id);if(!marker){marker=new THREE.Mesh(new THREE.RingGeometry(.48,.57,20),new THREE.MeshBasicMaterial({color:0xf0bb64,side:THREE.DoubleSide,transparent:true,opacity:.8}));marker.rotation.x=-Math.PI/2;root.add(marker);sabotageMarkers.set(e.id,marker);}marker.visible=e.hp>0&&e.mesh?.visible!==false&&!defense.completed;marker.position.set(e.x,.07,e.z);}}

    for(const socket of sealMaterials)socket.material.color.set(state.artifacts?.includes(socket.id)?0x94cfe0:0x4c5968);
    for(const entry of devices){const {device,status,screenMaterial}=entry;if(entry.wheel)entry.wheel.rotation.y=device.progress*Math.PI*2;if(entry.breaker)entry.breaker.position.z=device.active?-.10:.10;if(device.kind==='log'&&entry.group)entry.group.visible=!device.active;if(device.kind==='artifact'){const collected=state.artifacts?.includes(device.id);entry.artifact.visible=!collected;device.active=!!collected;}status.color.set(device.active?0x82cde0:device.kind==='relay'&&device.progress>0?0xdfab61:0x8794a7);screenMaterial.color.set(device.active?0x94def0:0xffffff);}
    const relay=state.relay,completed=relay.completed||relay.solved;
    const remaining=Math.max(0,Number(relay.remaining)||0),label=completed?'ONLINE':relay.started?remaining.toFixed(1)+' s':'OFFLINE';
    if(label!==lastTimer){const c=instrument(timer),color=completed?'#94cfe0':relay.started?'#dfb879':'#8595a6';c.fillStyle=color;c.textAlign='center';c.font='bold 34px monospace';c.fillText(label,256,61);bar(c,48,86,416,14,completed?1:relay.started?remaining/Math.max(.1,relay.duration??8):0,color);timer.texture.needsUpdate=true;lastTimer=label;}
    for(const {zone,status} of zoneMaterials){status.color.set(zone.status==='cleared'?0x94cfe0:zone.status==='active'?0xf09058:0x967d47);status.opacity=zone.status==='active'?.55+Math.sin(time*5)*.2:.45;}
  }
  update();return update;
}
