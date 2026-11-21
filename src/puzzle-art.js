import * as THREE from '../vendor/three.module.js';

/** Visuals only: the puzzle controller owns pushing, seating and unlocking. */
export function createPuzzleArt(scene, box, crates, plates, door) {
  const root=new THREE.Group();root.name='pressure-plate-puzzle';scene.add(root);
  const dark=new THREE.MeshStandardMaterial({color:0x28342f,roughness:.8,metalness:.3});
  const yellow=new THREE.MeshStandardMaterial({color:0xe1ba52,roughness:.65,metalness:.2});
  const bodyMaterial=new THREE.MeshStandardMaterial({color:0x768575,roughness:.75,metalness:.3});
  const cube=new THREE.BoxGeometry(1,1,1);
  function part(parent,x,y,z,w,h,d,material){
    const mesh=new THREE.Mesh(cube,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function stencil(text,w,h,color='#e3d5a1'){
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
    const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 42px monospace';ctx.fillText(text,128,60);
    ctx.font='18px monospace';ctx.fillText(text==='A'||text==='B'?'PRESSURE SENSOR':'MOVABLE LOAD',128,90);
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
    const label=stencil('80 KG',.62,.32);label.position.set(0,1.105,0);g.add(label);
    g.position.set(crate.x,0,crate.z);
  }
  const indicators=[];
  const ringGeo=new THREE.RingGeometry(.53,.62,40);
  const lampGeo=new THREE.CylinderGeometry(.085,.085,.035,12);
  const green=new THREE.Color(0x83ed9d),red=new THREE.Color(0xf07953);
  const plateViews=plates.map((plate,index)=>{
    const g=new THREE.Group();g.name=`pressure-sensor-${index?'B':'A'}`;g.position.set(plate.x,0,plate.z);root.add(g);
    part(g,0,.04,0,1.5,.08,1.5,dark);
    const platform=part(g,0,.095,0,1.31,.055,1.31,bodyMaterial);
    const status=new THREE.MeshBasicMaterial({color:red});
    const ring=new THREE.Mesh(ringGeo,status);ring.rotation.x=-Math.PI/2;ring.position.y=.13;g.add(ring);
    for(const x of [-.63,.63])for(const z of [-.63,.63]){
      const lamp=new THREE.Mesh(lampGeo,status);lamp.position.set(x,.105,z);g.add(lamp);
    }
    const label=stencil(index?'B':'A',.66,.38);label.position.set(0,.135,0);g.add(label);
    // Each sensor has a matching lamp on the fixed doorway frame, outside the sliding leaf.
    const lampMaterial=new THREE.MeshBasicMaterial({color:red});
    const frame=new THREE.Group();frame.position.set(door.x+(index?1.6:-1.6),1.66,door.z);root.add(frame);
    part(frame,0,0,0,.32,.08,.42,dark);
    const lamp=new THREE.Mesh(new THREE.CylinderGeometry(.115,.115,.04,16),lampMaterial);lamp.position.y=.065;frame.add(lamp);
    indicators.push(lampMaterial);
    return {platform,status};
  });
  function update(){
    crates.forEach(crate=>{crate.mesh.position.x=crate.x;crate.mesh.position.z=crate.z;});
    plates.forEach((plate,index)=>{
      const color=plate.active?green:red;plateViews[index].status.color.copy(color);indicators[index].color.copy(color);
      plateViews[index].platform.position.y=plate.active?.065:.095;
    });
    if(door.status?.material){door.status.material.color.set(door.unlocked?0x83ed9d:0xf07953);}
  }
  update();return update;
}
