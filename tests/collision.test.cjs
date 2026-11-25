const {WORLD_WIDTH,WORLD_HEIGHT}=require('../src/world-layout.js');
const {HOSPITAL_ROOMS,HOSPITAL_DOORS,carveHospital,addHospitalProps}=require('../src/hospital-layout.js');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {createPressurePuzzle,overlapsCrate,moveWithCrates}=require('../src/pressure-puzzle.js');
const {EXPANSION_ROOMS,carveExpansion}=require('../src/facility-expansion.js');

function world(){
  const source=fs.readFileSync(new URL('../src/main.js',`file://${__filename}`),'utf8');
  const ctx={liftWalkBlocked:require('../src/transit.js').liftWalkBlocked,runConfig:{operation:'breach'},...require('../src/signal-layout.js'),...require('../src/freight-layout.js'),enemies:[],resolveCreaturePressure:require('../src/combat-movement.js').resolveCreaturePressure,barrelSystem:null,Math,Set,W:WORLD_WIDTH,H:WORLD_HEIGHT,HOSPITAL_ROOMS,HOSPITAL_DOORS,carveHospital,EXPANSION_ROOMS,carveExpansion,doors:[],createPressurePuzzle,overlapsCrate,moveWithCrates};vm.createContext(ctx);
  vm.runInContext(source.slice(source.indexOf('const map='),source.indexOf('const boxGeo=')),ctx);
  vm.runInContext('let player={x:7,z:20};'+source.slice(source.indexOf('function solid('),source.indexOf('const pursue=')),ctx);
  return expression=>vm.runInContext(expression,ctx);
}
test('closed security doors block movement and vision; opening clears the doorway',()=>{
  const run=world();run("doors.push({x:7,z:18,axis:'x',open:false,slide:0})");
  assert.equal(run('solid(7,18,.32)'),true);
  assert.equal(run('los(7,20,7,16)'),false);
  run('doors[0].open=true;doors[0].slide=.5');
  assert.equal(run('solid(7,18)'),true,'partly open doors remain blocked');
  run('doors[0].slide=1');
  assert.equal(run('solid(7,18,.32)'),false);
  assert.equal(run('los(7,20,7,16)'),true);
});
test('cover blocks bullets and sight and keeps the player radius out',()=>{
  const run=world();assert.equal(run('solid(8,26)'),true);
  assert.equal(run('los(8,24,8,28)'),false);
  assert.equal(run('solid(8,27.02,.32)'),true);
  run('player.x=8;player.z=27.5;move(player,0,-.5)');
  assert.ok(run('player.z')>=27.07);assert.equal(run('solid(player.x,player.z,.32)'),false);
});
test('wall sliding permits motion along the wall without crossing it',()=>{
  const run=world();run('player.x=2;player.z=29;move(player,-.4,-.2)');
  assert.ok(run('player.x')>=1.82);assert.equal(run('solid(player.x,player.z,.32)'),false);
  assert.ok(Math.abs(run('player.z')-28.8)<1e-9);
  assert.equal(run('solid(-1,10)'),true);
});
test('all twenty rooms and both mission positions connect through carved passages',()=>{
  const run=world();assert.equal(run(`(()=>{
    const visited=new Set(['7,29']),queue=[[7,29]];
    for(let i=0;i<queue.length;i++){const [x,z]=queue[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=nx+','+nz;if(!visited.has(k)&&!solid(nx,nz,.32)){visited.add(k);queue.push([nx,nz]);}}}
    return visited.has('154,52')&&visited.has('160,52')&&roomDefs.every(r=>[...visited].some(k=>{const [x,z]=k.split(',').map(Number);return x>=r.x&&x<r.x+r.w&&z>=r.z&&z<r.z+r.h;}))&&visited.has('93,7')&&visited.has('92,60');
  })()`),true);
});

test('movement frees an operator clipped into the insertion southeast corner beside the seated crate',()=>{
  const run=world();
  run('Object.assign(puzzle.crates[1],{x:11,z:29.5,seated:true});player.x=13.22;player.z=31.22');
  assert.equal(run('solid(player.x,player.z,.32)'),true);
  assert.equal(run('solid(player.x,player.z,0)'),false);
  run('move(player,-.05,0)');
  assert.equal(run('solid(player.x,player.z,.32)'),false);
  run('for(let i=0;i<30;i++)move(player,-.06,0)');
  assert.ok(run('player.x')<12);
  assert.equal(run('puzzle.crates[1].seated'),true);
});
