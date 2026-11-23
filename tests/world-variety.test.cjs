const {test}=require('node:test'),assert=require('node:assert/strict'),THREE=require('../vendor/three.module.js');
const {EXPLORATION_SHORTCUTS,explorationShortcutBlocked}=require('../src/exploration.js');
function world(operation,unlocked=false){
 const layout=require('../src/'+operation+'-layout.js'),map=Array.from({length:69},()=>Array(251).fill(1)),cover=[],scene=new THREE.Scene();
 layout['carve'+operation[0].toUpperCase()+operation.slice(1)]((x,z,w,h)=>{for(let zz=z;zz<z+h;zz++)for(let xx=x;xx<x+w;xx++)map[zz][xx]=0;});
 layout['add'+operation[0].toUpperCase()+operation.slice(1)+'Props'](scene,null,cover);
 const claimed=()=>unlocked,blocked=(x,z,r=.32)=>[-r,r].some(dx=>[-r,r].some(dz=>map[Math.round(z+dz)]?.[Math.round(x+dx)]!==0))||cover.some(c=>Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.h/2+r)||explorationShortcutBlocked(x,z,r,{operation,claimed});
 return {map,blocked,scene};
}
function distance(world,a,b){const q=[[...a,0]],seen=new Set([a.join(',')]);for(let n=0;n<q.length;n++){const [x,z,d]=q[n];if(x===b[0]&&z===b[1])return d;for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,zz=z+dz,key=xx+','+zz;if(seen.has(key)||world.blocked(xx,zz)||world.blocked(x+dx*.5,z+dz*.5))continue;seen.add(key);q.push([xx,zz,d+1]);}}return Infinity;}
test('Freight and Signal now have materially different walkable room topology',()=>{
 const freight=world('freight'),signal=world('signal');let different=0;
 for(let z=23;z<63;z++)for(let x=154;x<196;x++)if(freight.map[z][x]!==signal.map[z][x+50])different++;
 assert.ok(different>=150,'worlds must not merely translate the same five rectangles');
 assert.equal(freight.map[53][156],1,'Freight arrival narrows into its loading spine');assert.equal(freight.map[53][162],0);
 assert.equal(signal.map[30][209],1,'Signal feeder gallery has separated aisles');assert.equal(signal.map[30][212],0);
 for(const w of [freight,signal])w.scene.traverse(o=>o.geometry?.dispose());
});
test('durable secret releases create shorter real cargo and service return routes',()=>{
 for(const [operation,a,b]of [['freight',[180,30],[189,30]],['signal',[236,46],[242,59]]]){
  const closed=world(operation),open=world(operation,true),before=distance(closed,a,b),after=distance(open,a,b);
  assert.ok(Number.isFinite(before)&&Number.isFinite(after),operation+' both routes remain viable');assert.ok(after+4<=before,operation+' discovery must remove a real detour: '+before+' vs '+after);
 }
});
test('shortcut releases follow existing durable reward ownership and do not mutate cash or progression',()=>{
 const {createEconomy}=require('../src/economy.js');
 for(const shortcut of EXPLORATION_SHORTCUTS){const economy=createEconomy(),g=shortcut.gate,args={operation:shortcut.operation,claimed:id=>!!economy.state.claimedRewards[id]};assert.equal(explorationShortcutBlocked(g.x,g.z,.32,args),true);assert.equal(economy.claimReward(shortcut.reward).ok,true);assert.equal(explorationShortcutBlocked(g.x,g.z,.32,args),false);const restored=createEconomy(economy.serialize());assert.equal(explorationShortcutBlocked(g.x,g.z,.32,{operation:shortcut.operation,claimed:id=>!!restored.state.claimedRewards[id]}),false);assert.equal(restored.claimReward(shortcut.reward).alreadyClaimed,true);}
});
test('discovered shortcut gate art matches collision state and stays behind discovery fog',()=>{
 const {createExplorationArt}=require('../src/exploration-art.js'),scene=new THREE.Scene();let claimed=false,revealed=false;const shortcut=EXPLORATION_SHORTCUTS[1],art=createExplorationArt(scene,{operation:'freight',claimed:()=>claimed,visible:()=>revealed});art.update();const gate=scene.getObjectByName(shortcut.id);assert.equal(gate.visible,false);revealed=true;art.update();assert.equal(gate.visible,true);assert.equal(gate.children[1].position.y,0);claimed=true;art.update();assert.equal(gate.children[1].position.y,-.93);art.dispose();
});
test('legacy checkpoints inside reshaped room walls recover locally without changing earned state',()=>{
 const {recoverWorldPosition}=require('../src/world-position-recovery.js');
 for(const [operation,x,z]of [['freight',156,53],['signal',209,30]]){
  const w=world(operation),player={x,z,hp:67,ammo:8,angle:.4,intel:true};assert.equal(w.blocked(x,z),true);assert.equal(recoverWorldPosition(player,{operation,blocked:w.blocked}),true);assert.equal(w.blocked(player.x,player.z),false);assert.deepEqual({hp:player.hp,ammo:player.ammo,angle:player.angle,intel:player.intel},{hp:67,ammo:8,angle:.4,intel:true});assert.equal(recoverWorldPosition(player,{operation,blocked:w.blocked}),false);
 }
 const outside={x:174,z:30,hp:67};assert.equal(recoverWorldPosition(outside,{operation:'freight',blocked:()=>true}),false,'must not teleport a checkpoint across a progression doorway');assert.deepEqual(outside,{x:174,z:30,hp:67});
});
test('legacy live mutations recover out of new walls with full body clearance and reward identity intact',()=>{
 const {recoverWorldPosition}=require('../src/world-position-recovery.js');
 for(const [operation,x,z,radius]of [['freight',183,33,.75],['signal',209,30,.43]]){
  const w=world(operation),enemy={x,z,radius,hp:17,maxHp:44,variant:radius===.75?'boss':'charger',rewardIdentity:'kill.'+operation+'.7'};
  assert.equal(w.blocked(x,z,radius),true);assert.equal(recoverWorldPosition(enemy,{operation,blocked:w.blocked,radius}),true);assert.equal(w.blocked(enemy.x,enemy.z,radius),false);
  assert.equal(enemy.hp,17);assert.equal(enemy.maxHp,44);assert.equal(enemy.rewardIdentity,'kill.'+operation+'.7');assert.equal(enemy.radius,radius);
 }
});
