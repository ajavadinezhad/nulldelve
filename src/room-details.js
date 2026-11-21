import * as THREE from '../vendor/three.module.js';

/** Facility finishing pass. Everything stays below the fog plane and off the collision map. */
export function addRoomDetails(scene, box, roomDefs) {
  const group=new THREE.Group();group.name='facility-surface-details';scene.add(group);
  const cube=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,10);
  const batches=new Map();
  function part(kind,color,x,y,z,w,h,d,rotation=0){
    const key=kind+':'+color;
    if(!batches.has(key))batches.set(key,{kind,color,items:[]});
    batches.get(key).items.push({x,y,z,w,h,d,rotation});
  }
  let seed=671;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  function floorTexture(room,index){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
    const ctx=canvas.getContext('2d');
    // Transparent grime, swept tracks and abrasion sit on the existing tiled floor.
    for(let i=0;i<1800;i++){
      ctx.fillStyle=`rgba(${i%3===0?'160,157,129':'8,17,15'},${random()*.09})`;
      const x=random()*512,z=random()*512;
      ctx.fillRect(x,z,random()*3+1,random()*2+1);
    }
    for(let i=0;i<23;i++){
      const x=40+random()*432,z=40+random()*432;
      ctx.save();ctx.translate(x,z);ctx.rotate(random()*Math.PI);
      ctx.strokeStyle='rgba(175,174,147,.12)';ctx.lineWidth=.5+random();
      ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(14+random()*25,random()*3);ctx.stroke();ctx.restore();
    }
    // Long stains near skirting, leaving readable floor labels unobscured.
    for(const x of [5,496]){
      const gradient=ctx.createLinearGradient(x,0,x+(x<100?18:-18),0);
      gradient.addColorStop(0,'rgba(0,7,5,.35)');gradient.addColorStop(1,'rgba(0,7,5,0)');
      ctx.fillStyle=gradient;ctx.fillRect(x<100?x:x-18,8,18,496);
    }
    // Maintenance access grate, bolts and warning stripe, painted flush with the floor.
    const gx=index%2?365:68,gz=345;
    ctx.fillStyle='#28322d';ctx.fillRect(gx,gz,58,82);
    ctx.strokeStyle='#6b7362';ctx.lineWidth=2;ctx.strokeRect(gx,gz,58,82);
    ctx.strokeStyle='#111e19';ctx.lineWidth=3;
    for(let i=6;i<80;i+=7){ctx.beginPath();ctx.moveTo(gx+5,gz+i);ctx.lineTo(gx+53,gz+i);ctx.stroke();}
    ctx.fillStyle='#afb09a';for(const x of [gx+3,gx+53])for(const z of [gz+3,gz+77])ctx.fillRect(x,z,2,2);
    ctx.save();ctx.beginPath();ctx.rect(gx-5,gz-10,68,7);ctx.clip();
    ctx.fillStyle='#8d865a';ctx.fillRect(gx-5,gz-10,68,7);
    ctx.strokeStyle='#202923';ctx.lineWidth=5;
    for(let x=gx-20;x<gx+80;x+=12){ctx.beginPath();ctx.moveTo(x,gz-14);ctx.lineTo(x+10,gz+1);ctx.stroke();}ctx.restore();
    // A few bootprints form a subtle route from each room's lower half.
    ctx.fillStyle='rgba(133,133,110,.10)';
    for(let i=0;i<8;i++){ctx.save();ctx.translate(230+(i%2?14:-14)+random()*12,250+i*15);ctx.rotate(-.16);ctx.fillRect(-3,-5,6,10);ctx.restore();}
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;
    const material=new THREE.MeshStandardMaterial({map:t,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(room.w-.2,room.h-.2),material);
    mesh.rotation.x=-Math.PI/2;mesh.position.set(room.x+(room.w-1)/2,.013,room.z+(room.h-1)/2);mesh.receiveShadow=true;group.add(mesh);
  }
  roomDefs.forEach((r,index)=>{
    floorTexture(r,index);
    const left=r.x-1,right=r.x+r.w,north=r.z-1,south=r.z+r.h;
    // Corners get machined wall cap sections and inset utility conduits. Short sections
    // deliberately avoid every doorway, including the horizontal connecting corridors.
    for(const x of [left,right])for(const z of [north+1.3,south-1.3]){
      part('box',0x5d6a61,x,1.535,z,.72,.025,2.25);
      for(const dx of [-.23,.23])part('pipe',0x7e8875,x+dx,1.63,z,.055,2.15,.055,Math.PI/2);
      for(const dz of [-.65,.65])part('box',0x293b32,x,1.64,z+dz,.65,.07,.1);
      for(const dz of [-.9,.9])part('box',0xb5b7a0,x,1.56,z+dz,.065,.035,.065);
    }
    // Recessed electrical service boxes are mounted on the wall caps rather than the floor.
    const x=right,z=north+3.5;
    part('box',0x273d34,x,1.63,z,.65,.22,1.1);
    part('box',0x829087,x,1.755,z,.52,.04,.93);
    part('box',0x333f38,x,1.78,z+.25,.25,.015,.27);
    part('box',index%2?0xad995e:0x8bb99a,x,1.79,z-.25,.09,.02,.09);
    // Wall return vent: visible from overhead without adding a floor obstacle.
    const ventX=left,ventZ=south-3.8;
    part('box',0x2d3d34,ventX,1.56,ventZ,.72,.08,1.35);
    for(let i=0;i<7;i++)part('box',0x798276,ventX,1.61,ventZ-.51+i*.17,.58,.035,.055);
    // Thin cable follows a wall edge, entirely on the nonwalkable perimeter.
    part('pipe',0x272d27,left+.32,1.59,north+3.9,.027,2.4,.027,Math.PI/2);
  });
  const dummy=new THREE.Object3D();
  for(const {kind,color,items} of batches.values()){
    const material=new THREE.MeshStandardMaterial({color,roughness:.82,metalness:kind==='pipe'?.45:.12});
    const mesh=new THREE.InstancedMesh(kind==='pipe'?cylinder:cube,material,items.length);
    mesh.name=kind==='pipe'?'facility-conduits':'facility-wall-trim';
    items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rotation,0,0);dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);
  }
  return group;
}
