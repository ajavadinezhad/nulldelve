import * as THREE from '../vendor/three.module.js';
import {weapon} from './weapons.js?v=skills-r23';

// All art is generated locally: no external models or texture downloads.
export function buildArt(scene, box, cover, rooms) {
  function texture(kind) {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle=kind==='wood'?'#786344':'#46534c';ctx.fillRect(0,0,128,128);
    let seed=197;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
    for(let i=0;i<1600;i++){ctx.fillStyle=`rgba(${random()>.5?'255,255,255':'0,0,0'},${random()*.09})`;ctx.fillRect(random()*128,random()*128,kind==='wood'?random()*35:2,1);}
    ctx.strokeStyle=kind==='wood'?'#3b3023':'#222e29';ctx.lineWidth=2;
    for(let i=0;i<128;i+=32){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.stroke();}
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
  }
  const wood=texture('wood'),metal=texture('metal');
  function crate(x,z,w=1.2,d=1.2,y=0) {
    const g=new THREE.Group();scene.add(g);g.position.set(x,y,z);
    const body=box(0,.55,0,w,1.1,d,0xb19b75,g);body.material.map=wood;
    for(const a of [-1,1]){
      box(a*(w/2-.07),.58,0,.12,1.2,d+.05,0x4b4938,g);
      box(0,.58,a*(d/2-.06),w,1.2,.1,0x4b4938,g);
    }
    for(const z of [-d*.26,d*.26])box(0,1.13,z,w,.06,.07,0x333d36,g);
    box(0,1.17,0,.32,.025,.24,0xddd3ac,g);
    return g;
  }
  function desk(c){box(c.x,.92,c.z,c.w,.18,c.h,0x797b6c);for(const x of [-1,1])for(const z of [-1,1])box(c.x+x*(c.w/2-.16),.43,c.z+z*(c.h/2-.16),.14,.85,.14,0x272f2c);
    box(c.x,.35,c.z,c.w*.7,.65,c.h*.65,0x414e49);
    box(c.x,1.12,c.z-.25,.9,.2,.55,0x151d1c);box(c.x,1.24,c.z-.25,.73,.04,.4,0x60aaa0);
    box(c.x+.5,1.04,c.z+.45,.6,.02,.36,0xd4cdb7);box(c.x-.6,1.04,c.z+.4,.6,.04,.25,0x232f2b);
  }
  cover.slice(0,6).forEach((c,i)=>{
    if([1,2,4].includes(i)){desk(c);return;}
    crate(c.x-.65,c.z,1.25,c.h);crate(c.x+.67,c.z,1.25,c.h);
    crate(c.x-.65,c.z,.95,c.h*.8,1.2);
  });
  const extras=[{x:19.5,z:30,w:1.2,h:1.2},{x:27,z:29,w:1.2,h:1.2},{x:35,z:23,w:1.2,h:1.2}];
  extras.forEach(c=>{crate(c.x,c.z,c.w,c.h);cover.push(c);});
  function locker(x,z){box(x,.9,z,.85,1.8,.8,0x465a51).material.map=metal;box(x,1.82,z,.92,.06,.86,0x6f8175);box(x+.26,1,z+.42,.07,.3,.04,0xaba88b);for(let i=0;i<4;i++)box(x,1.55,z+.43,.53,.025,.015,0x1c2b24);cover.push({x,z,w:.85,h:.8});}
  [3,4,5,10,11,12].forEach(x=>locker(x,21.15));[19,20,21].forEach(x=>locker(x,4.15));
  function barrel(x,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(.44,.44,1.05,16),new THREE.MeshStandardMaterial({color:0x7c4939,roughness:.8}));m.position.set(x,.525,z);scene.add(m);for(const y of [.18,.85]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.45,.035,5,16),new THREE.MeshStandardMaterial({color:0x292e29}));ring.rotation.x=Math.PI/2;ring.position.set(x,y,z);scene.add(ring);}box(x,1.06,z,.14,.03,.14,0xb6a680);cover.push({x,z,w:.9,h:.9});}
  barrel(12,23);barrel(12,24.2);barrel(35,30);barrel(36.1,30);
  // Floor markings, ceiling-free utility fixtures, and equipment give rooms a purpose.
  for(const r of rooms){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#8a9d8c';ctx.font='bold 36px monospace';ctx.textAlign='center';ctx.fillText(r.name,256,70);
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
    const label=new THREE.Mesh(new THREE.PlaneGeometry(4,.95),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));label.rotation.x=-Math.PI/2;label.position.set(r.x+r.w/2,.025,r.z+1.8);scene.add(label);
    box(r.x+.1,.03,r.z+r.h/2,.045,.025,r.h-1,0x9c925f);box(r.x+r.w-1.1,.03,r.z+r.h/2,.045,.025,r.h-1,0x9c925f);
    for(const x of [r.x+2,r.x+r.w-3]){box(x,1.3,r.z-0.44,1.8,.12,.13,0x1f2c29);const strip=box(x,1.32,r.z-.34,1.5,.06,.1,0xdce4c2);strip.material.emissive.set(0xb5d6a2);strip.material.emissiveIntensity=.7;}
  }
  // A rifle rack in the insertion room.
  box(3.1,.5,27,1.25,1,2.5,0x293831);box(3.1,1.04,27,1.35,.1,2.6,0x718071);
  for(let i=0;i<3;i++){const g=weapon('rifle');g.rotation.y=Math.PI/2;g.position.set(3.1,1.08,26.2+i*.7);scene.add(g);}
  cover.push({x:3.1,z:27,w:1.35,h:2.6});
  // Sandbags near extraction.
  for(let i=0;i<4;i++){box(34.7+i*.65,.25,27,.7,.5,.85,0x929077);if(i<3)box(35+i*.65,.7,27,.65,.4,.8,0x7e8069);}
  cover.push({x:35.7,z:27,w:2.7,h:.85});
}
