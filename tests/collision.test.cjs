const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {createPressurePuzzle,overlapsCrate,moveWithCrates}=require('../pressure-puzzle.js');
const {EXPANSION_ROOMS,carveExpansion}=require('../facility-expansion.js');

function world(){
  const source=fs.readFileSync(new URL('../main.js',`file://${__filename}`),'utf8');
  const ctx={barrelSystem:null,Math,Set,W:101,H:69,EXPANSION_ROOMS,carveExpansion,doors:[],createPressurePuzzle,overlapsCrate,moveWithCrates};vm.createContext(ctx);
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
test('all fourteen rooms and both mission positions connect through carved passages',()=>{
  const run=world();assert.equal(run(`(()=>{
    const visited=new Set(['7,29']),queue=[[7,29]];
    for(let i=0;i<queue.length;i++){const [x,z]=queue[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=nx+','+nz;if(!visited.has(k)&&!solid(nx,nz,.32)){visited.add(k);queue.push([nx,nz]);}}}
    return roomDefs.every(r=>[...visited].some(k=>{const [x,z]=k.split(',').map(Number);return x>=r.x&&x<r.x+r.w&&z>=r.z&&z<r.z+r.h;}))&&visited.has('93,7')&&visited.has('92,60');
  })()`),true);
});
