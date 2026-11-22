const {SIGNAL_ROOMS,SIGNAL_DOORS,carveSignal,addSignalProps}=require('../src/signal-layout.js');
const {WORLD_WIDTH,WORLD_HEIGHT}=require('../src/world-layout.js');
const {HOSPITAL_ROOMS,HOSPITAL_DOORS,carveHospital,addHospitalProps}=require('../src/hospital-layout.js');
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const {createPressurePuzzle,moveWithCrates,updatePressurePuzzle}=require('../src/pressure-puzzle.js');
const {EXPANSION_ROOMS,carveExpansion,addExpansionProps}=require('../src/facility-expansion.js');
test('both pressure plates are reachable by pushing crates through the actual furnished room',async()=>{
 const THREE=await import('../vendor/three.module.js'),{buildArt}=await import('../src/environment.js');
 const source=fs.readFileSync(new URL('../src/main.js',`file://${__filename}`),'utf8'),ctx={...require('../src/freight-layout.js'),SIGNAL_ROOMS,SIGNAL_DOORS,carveSignal,W:WORLD_WIDTH,H:WORLD_HEIGHT,HOSPITAL_ROOMS,HOSPITAL_DOORS,carveHospital,createPressurePuzzle,EXPANSION_ROOMS,carveExpansion};vm.createContext(ctx);
 vm.runInContext(source.slice(source.indexOf('const map='),source.indexOf('const boxGeo='))+';globalThis.layout={map,cover,roomDefs,puzzle};',ctx);
 const {map,cover,roomDefs,puzzle}=ctx.layout,scene=new THREE.Scene();
 const previous=global.document;global.document={createElement:()=>({getContext:()=>new Proxy({},{get:(o,k)=>o[k]??(()=>{})})})};
 try{buildArt(scene,(x,y,z,w,h,d,color,g=scene)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color}));m.position.set(x,y,z);g.add(m);return m;},cover,roomDefs.slice(0,6));}finally{global.document=previous;}
 const blocked=(x,z,r)=>{for(const dx of [-r,r])for(const dz of [-r,r])if(map[Math.round(z+dz)]?.[Math.round(x+dx)]!==0)return true;return cover.some(c=>Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.h/2+r);};
 const a={x:7,z:23.5};for(let i=0;i<100;i++){moveWithCrates(a,-.04,0,puzzle,blocked);updatePressurePuzzle(puzzle,a);}assert.equal(puzzle.plates[0].active,true,'northwest plate seats');
 Object.assign(a,{x:11,z:26.9});for(let i=0;i<100;i++){moveWithCrates(a,0,.04,puzzle,blocked);updatePressurePuzzle(puzzle,a);}assert.equal(puzzle.solved,true,'southeast plate powers door');
});
