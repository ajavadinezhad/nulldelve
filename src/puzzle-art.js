import * as THREE from '../vendor/three.module.js';

/** Visuals only: the puzzle controller owns pushing, seating and unlocking. */
export function createPuzzleArt(scene, box, crates, plates, door) {
  const root=new THREE.Group();root.name='pressure-plate-puzzle';scene.add(root);
  const dark=new THREE.MeshStandardMaterial({color:0x29313d,roughness:.8,metalness:.3});
  const yellow=new THREE.MeshStandardMaterial({color:0xc5a573,roughness:.65,metalness:.2});
  const bodyMaterial=new THREE.MeshStandardMaterial({color:0x778493,roughness:.75,metalness:.3});
  const cube=new THREE.BoxGeometry(1,1,1);
  function part(parent,x,y,z,w,h,d,material){
    const mesh=new THREE.Mesh(cube,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function stencil(text,w,h,color='#d7c29e'){
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
    const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 42px monospace';ctx.fillText(text,128,60);

    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));mesh.rotation.x=-Math.PI/2;return mesh;
  }
  for(const [index,crate] of crates.entries()){
    const g=new THREE.Group();g.name=`pushable-weight-${index+1}`;root.add(g);crate.mesh=g;
    const w=crate.w??1.05,d=crate.h??1.05;
    part(g,0,.53,0,w,.98,d,bodyMaterial);
    part(g,0,1.04,0,w+.04,.06,d+.04,dark);
    // Wide yellow bands wrap the equipment box so it reads differently from wooden cover.
    for(const x of [-w*.31,w*.31]){
      part(g,x,1.08,0,.13,.035,d+.07,yellow);
      for(const z of [-d*.51,d*.51])part(g,x,.55,z,.13,.96,.035,yellow);
    }
    for(const x of [-w*.52,w*.52])part(g,x,.7,0,.045,.13,.42,dark);
    for(const z of [-d*.38,d*.38])part(g,0,.075,z,w+.03,.12,.13,dark);
    const label=stencil('↔',.62,.32);label.position.set(0,1.105,0);g.add(label);
    g.position.set(crate.x,0,crate.z);
  }
  // Fixed check / cross silhouettes remain readable when a crate covers a plate.
  function stateMark(parent,x,y,z){
    const ready=new THREE.Group(),waiting=new THREE.Group();ready.position.set(x,y,z);waiting.position.set(x,y,z);parent.add(ready,waiting);
    const white=new THREE.MeshBasicMaterial({color:0xf0f3f7});
    function stroke(parent,x1,z1,x2,z2){const bar=part(parent,(x1+x2)/2,0,(z1+z2)/2,.065,.018,Math.hypot(x2-x1,z2-z1),white);bar.rotation.y=Math.atan2(x2-x1,z2-z1);}
    stroke(ready,-.16,0,-.04,.12);stroke(ready,-.04,.12,.2,-.16);
    for(const angle of [-Math.PI/4,Math.PI/4]){const bar=part(waiting,0,0,0,.065,.018,.29,white);bar.rotation.y=angle;}
    return active=>{ready.visible=active;waiting.visible=!active;};
  }
  const indicators=[],marks=[];
  const lampGeo=new THREE.CylinderGeometry(.085,.085,.035,12);
  const green=new THREE.Color(0x9acfe9),red=new THREE.Color(0xf07953);
  const plateViews=plates.map((plate,index)=>{
    const g=new THREE.Group();g.name=`pressure-sensor-${index?'B':'A'}`;g.position.set(plate.x,0,plate.z);root.add(g);
    part(g,0,.04,0,1.5,.08,1.5,dark);
    const platform=part(g,0,.095,0,1.31,.055,1.31,bodyMaterial);
    const status=new THREE.MeshBasicMaterial({color:red});
    const outline=new THREE.MeshBasicMaterial({color:0xd7e1ee});
    for(const side of [-1,1])for(const end of [-1,1]){part(g,side*.57,.13,end*.47,.065,.025,.26,outline);part(g,side*.47,.13,end*.57,.26,.025,.065,outline);}
    for(const x of [-.63,.63])for(const z of [-.63,.63]){
      const lamp=new THREE.Mesh(lampGeo,status);lamp.position.set(x,.105,z);g.add(lamp);
    }
    // Each sensor has a matching lamp on the fixed doorway frame, outside the sliding leaf.
    const lampMaterial=new THREE.MeshBasicMaterial({color:red});
    const frame=new THREE.Group();frame.position.set(door.x+(index?1.6:-1.6),1.66,door.z);root.add(frame);
    part(frame,0,0,0,.32,.08,.42,dark);
    const lamp=new THREE.Mesh(new THREE.CylinderGeometry(.115,.115,.04,16),lampMaterial);lamp.position.y=.065;frame.add(lamp);
    marks.push([stateMark(g,.89,.15,0),stateMark(frame,0,.1,.32)]);
    indicators.push(lampMaterial);
    return {platform,status};
  });
  function update(){
    crates.forEach(crate=>{crate.mesh.position.x=crate.x;crate.mesh.position.z=crate.z;});
    plates.forEach((plate,index)=>{
      for(const mark of marks[index])mark(plate.active);
      const color=plate.active?green:red;plateViews[index].status.color.copy(color);indicators[index].color.copy(color);
      plateViews[index].platform.position.y=plate.active?.065:.095;
    });
    if(door.status?.material){door.status.material.color.set(door.unlocked?0x9acfe9:0xf07953);}
  }
  update();return update;
}
