import * as THREE from '../vendor/three.module.js';

/** Regional dressing stays below walls and never changes collision or door access. */
const THEMES={
 signal:{background:0x11101b,lightColor:0xe9d9ff,lightIntensity:2.7,hemisphereSky:0xd8d0e8,hemisphereGround:0x353143,floor:0x4a455c,rooms:['SIGNAL ARRIVAL','BREAKER GALLERY','ANTENNA HALL','TRANSMISSION CORE','SERVICE EXIT'],label:'Dead Signal'},
 freight:{background:0x0c151d,lightColor:0xd9e8ef,lightIntensity:2.7,hemisphereSky:0xc6d7e4,hemisphereGround:0x35414b,floor:0x415566,rooms:['FREIGHT ARRIVAL','PUMP HALL','LOADING YARD','COLD CHAIN','RAIL CONTROL'],label:'Flooded freight'},
 hospital:{background:0x101921,lightColor:0xe4f2ff,lightIntensity:2.65,hemisphereSky:0xdce8ee,hemisphereGround:0x3b4d5b,floor:0x899da7,rooms:['HOSPITAL ADMISSION','HOSPITAL PHARMACY','HOSPITAL TRIAGE','HOSPITAL WARD','HOSPITAL SURGERY','HOSPITAL ISOLATION'],label:'Silent hospital'},
 breach:{background:0x15120d,lightColor:0xffd5a0,lightIntensity:2.55,hemisphereSky:0xe6cba0,hemisphereGround:0x3b3025,floor:0x69533a,rooms:['INSERTION','ARCHIVE','SECURITY'],label:'Collapsed entrance'},
 command:{background:0x08101a,lightColor:0xbdd9ff,lightIntensity:2.55,hemisphereSky:0xb8d7f6,hemisphereGround:0x202d43,floor:0x253b55,rooms:['STORAGE','COMMAND'],label:'Cold command bunker'},
 research:{background:0x0a180e,lightColor:0xc5efb3,lightIntensity:2.65,hemisphereSky:0xc5eac1,hemisphereGround:0x243c22,floor:0x325a33,rooms:['BIO LAB','REACTOR'],label:'Overgrown research wing'},
 containment:{background:0x07191c,lightColor:0xb3e8ef,lightIntensity:2.55,hemisphereSky:0xb5e9ed,hemisphereGround:0x183f49,floor:0x1c5a62,rooms:['CONTAINMENT'],label:'Flooded containment'},
 nest:{background:0x180b21,lightColor:0xe2b7ec,lightIntensity:2.45,hemisphereSky:0xe3b9e8,hemisphereGround:0x41243f,floor:0x522b4c,rooms:['NEST CORE','EVACUATION'],label:'Organic infestation'},
};
export function buildOperationEnvironment({scene,operation,roomDefs=[],cover=[]}){
 const root=new THREE.Group();root.name='operation-environment';scene.add(root);
 const geometries={box:new THREE.BoxGeometry(1,1,1),sphere:new THREE.SphereGeometry(1,9,6),cylinder:new THREE.CylinderGeometry(1,1,1,8),plane:new THREE.PlaneGeometry(1,1)};
 const materials=new Map(),batches=new Map(),dummy=new THREE.Object3D();
 function add(kind,color,x,y,z,sx,sy,sz,rotation=0,{emissive=0,opacity=1,metalness=0,roughness=.85}={}){
  const key=[kind,color,emissive,opacity,metalness,roughness].join(':');
  if(!batches.has(key))batches.set(key,{kind,color,emissive,opacity,metalness,roughness,parts:[]});
  batches.get(key).parts.push({x,y,z,sx,sy,sz,rotation});
 }
 const slab=(color,x,z,w,d,opacity=1)=>add('box',color,x,.002,z,w,.004,d,0,{opacity});
 function clear(x,z,r=.32){return !cover.some(c=>Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.h/2+r);}
 // Only small perimeter accents rise above the floor. Central corridors, consoles,
 // floor switches, and player-sized routes remain unobstructed and readable.
 function perimeter(r,fn){for(let i=0;i<8;i++){const x=r.x+1+(i/7)*(r.w-3),z=i%2?r.z+.7:r.z+r.h-1.7;if(clear(x,z,.5))fn(x,z,i);}}
 for(const [id,theme] of Object.entries(THEMES)){
  for(const r of roomDefs.filter(room=>theme.rooms.includes(room.name))){
   slab(theme.floor,r.x+(r.w-1)/2,r.z+(r.h-1)/2,r.w-.14,r.h-.14,.38);
   if(id==='signal'){for(let z=r.z+1;z<r.z+r.h-1;z+=3){slab(0xb29cc2,r.x+r.w/2,z,.1,1.4,.6);}perimeter(r,(x,z,i)=>{add('box',0x8c739e,x,.02,z,.8,.03,.16);add('box',0xc5aa70,x,1.45,z,.9,.05,.1,0,{emissive:0x69563b});});}
   if(id==='freight'){
    for(let z=r.z+1;z<r.z+r.h-1;z+=3){slab(0x426777,r.x+r.w/2,z,r.w-3,.8,.22);slab(0xb28b50,r.x+1,z,.12,1.4,.7);}
    for(const x of [r.x+2,r.x+r.w-3])add('box',0xd6a86b,x,1.53,r.z+1,1.8,.05,.15,0,{emissive:0x997044});
   }
   if(id==='hospital'){
    // Clinical wayfinding, blood-red biohazard marks and cold emergency light strips.
    const centerX=r.x+(r.w-1)/2;
    for(let z=r.z+1;z<r.z+r.h-1;z+=2)slab(0x477b99,centerX,z,.16,1.1,.7);
    for(const side of [-1,1]){const x=centerX+side*(r.w/2-1.2),z=r.z+1.1;add('box',0xe4f2f3,x,1.53,z,1.8,.05,.15,0,{emissive:0x6e9aad});}
    if(r.name==='HOSPITAL ADMISSION'){slab(0x95484d,centerX,r.z+4,2.2,.5);slab(0x95484d,centerX,r.z+4,.5,2.2);}
    if(r.name==='HOSPITAL ISOLATION')perimeter(r,(x,z,i)=>{add('sphere',0x875e78,x,.15,z,.45,.23,.32);add('box',0x9d4f59,x+.2,.025,z+.3,.55,.025,.12,i*.4);});
   }
   if(id==='breach'){
    // Broken slabs, rebar and emergency lamps distinguish the ruined entry.
    perimeter(r,(x,z,i)=>{add('box',0x918979,x,.10,z,.7+(i%3)*.18,.17,.45,i*.6);add('box',0x33302a,x+.12,.16,z,.85,.035,.04,i*.5);add('box',0xf3a846,x,.025,z+.45,.32,.025,.1,0,{emissive:0x9b460d});});
    for(let i=0;i<7;i++)slab(0x2b241c,r.x+1+i*(r.w-3)/6,r.z+2+(i%3)*2,.8,.07);
   }
   if(r.name==='ARCHIVE'){for(let i=0;i<5;i++){const x=r.x+1.2+i*.5,z=r.z+r.h-2;if(clear(x,z,.4)){add('box',0x5a5141,x,.20,z,.45,.35,.18,.7);add('box',0xa8976b,x+.12,.08,z+.35,.22,.07,.17,i*.4);}}}
   if(r.name==='SECURITY'){for(let i=0;i<4;i++){const x=r.x+r.w-1.5,z=r.z+2+i*.75;if(clear(x,z,.4)){add('box',0x4a5857,x,.22,z,.4,.4,.65,.12);add('box',0xe2b568,x,.44,z,.28,.025,.11,0,{emissive:0x65471a});}}}
   if(r.name==='BIO LAB'){const x=r.x+1.2,z=r.z+2;if(clear(x,z,.5)){add('cylinder',0x596b64,x,.18,z,.55,.3,.55);for(let i=0;i<5;i++)add('box',0x9dc4aa,x+.3+i*.12,.04,z+.3+i*.09,.2,.04,.12,i);add('sphere',0x7eaa4f,x,.19,z,.42,.15,.35);}}
   if(r.name==='REACTOR'){for(let i=0;i<12;i++){const x=r.x+.7+i*(r.w-2)/12,z=r.z+.55;if(clear(x,z,.25)){add('box',0x5d773e,x,.06,z,1.3,.07,.15,.05);if(i%3===0)add('sphere',0x91ba4b,x,.13,z+.2,.15,.2,.15);}}}
   if(id==='command'){
    // Low server banks with blue screens, scattered broken display panels.
    perimeter(r,(x,z,i)=>{add('box',0x182b3d,x,.29,z,.58,.55,.38);add('box',0x74c7ed,x,.58,z,.45,.025,.27,0,{emissive:0x28627c});for(let n=0;n<3;n++)add('box',0x0c1723,x,.18+n*.11,z+.21,.39,.025,.025);});
    for(let i=0;i<5;i++){slab(0x526377,r.x+1.5+i*1.65,r.z+3+(i%2)*2,.55,.38);slab(0x78a9b9,r.x+1.5+i*1.65,r.z+3+(i%2)*2,.4,.22);}
   }
   if(id==='research'){
    // Glass growth vessels, roots and luminous spores at the room edges.
    perimeter(r,(x,z,i)=>{add('cylinder',0x1c3529,x,.10,z,.37,.2,.37);add('cylinder',0x9bdbb4,x,.48,z,.30,.66,.30,0,{opacity:.40,metalness:.25,roughness:.2});add('sphere',0x94ba4b,x,.43,z,.17,.3,.17);add('sphere',0xc9ee83,x+.22,.25,z+.14,.08,.08,.08,0,{emissive:0x668329});});
    for(let i=0;i<9;i++)add('box',0x48603c,r.x+.8+(i/8)*(r.w-2.6),.055,r.z+1.4+(i%3)*.23,1.3,.065,.08,i*.45);
   }
   if(id==='containment'){
    // Shallow pools and reflective ripples; steel drains and red hazard bars.
    for(let i=0;i<5;i++){const x=r.x+3+i*3.2,z=r.z+3+(i%2)*4;add('sphere',0x388895,x,.04,z,1.5,.025,1.05,0,{opacity:.65,metalness:.65,roughness:.18});for(let n=0;n<3;n++)slab(0x70b6bd,x-.5+n*.35,z,.16,.035,.7);}
    perimeter(r,(x,z,i)=>{add('box',0x566e75,x,.18,z,.65,.32,.3,0,{metalness:.7});add('box',0xef7062,x,.36,z,.40,.025,.13,0,{emissive:0x7c2420});});
    for(let i=0;i<9;i++)slab(i%2?0x202b2e:0xcfae54,r.x+1+i*2,r.z+r.h-2.3,.65,.18);
   }
   if(id==='nest'){
    // Uneven organic cysts and branching red veins instead of industrial clutter.
    perimeter(r,(x,z,i)=>{add('sphere',0x633a66,x,.20,z,.62,.38,.46);add('sphere',0xc65870,x+.12,.4,z,.21,.20,.21,0,{emissive:0x4c152d});add('sphere',0x38263f,x-.25,.17,z+.3,.32,.24,.31);});
    for(let i=0;i<14;i++){const x=r.x+1+(i/13)*(r.w-3),z=r.z+1.8+(i%3)*.25;add('box',0x8e3959,x,.046,z,1.2,.035,.10,(i%2?.6:-.6));add('box',0x8e3959,x+.22,.045,z+.35,.65,.035,.07,-.8);}
   }
  }
 }
 for(const [key,batch] of batches){
  const mat=new THREE.MeshStandardMaterial({color:batch.color,emissive:batch.emissive,emissiveIntensity:.65,transparent:batch.opacity<1,opacity:batch.opacity,depthWrite:batch.opacity===1,metalness:batch.metalness,roughness:batch.roughness});materials.set(key,mat);
  const mesh=new THREE.InstancedMesh(geometries[batch.kind],mat,batch.parts.length);mesh.name='regional-'+batch.kind;mesh.receiveShadow=true;
  batch.parts.forEach((p,index)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.rotation,0);dummy.scale.set(p.sx,p.sy,p.sz);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);});root.add(mesh);
 }
 const theme=THEMES[operation]??{background:0x080e11,lightColor:0xffffff,lightIntensity:2.6,hemisphereSky:0xc9e8db,hemisphereGround:0x243028,label:'Ruined facility'};
 return {background:theme.background,lightColor:theme.lightColor,lightIntensity:theme.lightIntensity,hemisphereSky:theme.hemisphereSky,hemisphereGround:theme.hemisphereGround,label:theme.label,root,dispose(){root.traverse(object=>{if(object.isInstancedMesh)object.dispose();});scene.remove(root);for(const geometry of Object.values(geometries))geometry.dispose();for(const material of materials.values())material.dispose();}};
}
