import * as THREE from '../vendor/three.module.js';
import {WIRE_LAYOUT,WIRE_LINKS,junctionPorts,evaluateCircuit} from './wire-circuit.js?v=skill-audit-r26';

/** The actual cross-room cable follows the same authored port graph as the puzzle. */
export function createWireCircuitArt(scene,state){
 const root=new THREE.Group();root.name='power-house-floor-circuit';scene.add(root);
 const box=new THREE.BoxGeometry(1,1,1),disc=new THREE.CylinderGeometry(1,1,1,20),material=new THREE.MeshBasicMaterial({color:0xffffff}),dummy=new THREE.Object3D(),color=new THREE.Color(),vectors=[[0,-1],[1,0],[0,1],[-1,0]];
 const armMesh=new THREE.InstancedMesh(box,material,18),nodes=new THREE.InstancedMesh(disc,material,9);root.add(armMesh,nodes);
 const endpoint=(index,port)=>{const node=WIRE_LAYOUT[index],v=vectors[port];return [node.x+v[0]*.8,node.z+v[1]*.8];};
 const routes=WIRE_LINKS.map(link=>({link,points:[endpoint(link.a,link.portA),...(link.via??[]),endpoint(link.b,link.portB)]}));
 routes.push({source:true,points:[[35,56],[37.2,56]]},{output:true,points:[[43.8,10],[47,10]]});
 const cableCount=routes.reduce((sum,route)=>sum+route.points.length-1,0),cables=new THREE.InstancedMesh(box,material,cableCount);root.add(cables);
 function segment(mesh,index,x,z,tx,tz,width,shade,y=.035){dummy.position.set((x+tx)/2,y,(z+tz)/2);dummy.rotation.set(0,Math.atan2(-(tz-z),tx-x),0);dummy.scale.set(Math.hypot(tx-x,tz-z),.025,width);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);mesh.setColorAt(index,color.set(shade));}
 let version='';
 function update(){const circuit=state.circuit;if(!circuit)return;const next=JSON.stringify(circuit);if(next===version)return;version=next;
  const evaluation=evaluateCircuit(circuit),live=new Set(evaluation.energized),edges=new Set(evaluation.edges.map(([a,b])=>a+':'+b)),amber=0xf3c453,gray=0x505b57;
  for(const cell of WIRE_LAYOUT){dummy.position.set(cell.x,.045,cell.z);dummy.rotation.set(0,0,0);dummy.scale.set(.32,.045,.32);dummy.updateMatrix();nodes.setMatrixAt(cell.index,dummy.matrix);nodes.setColorAt(cell.index,color.set(live.has(cell.index)?amber:0x718078));junctionPorts(circuit,cell.index).forEach((direction,i)=>{const [dx,dz]=vectors[direction];segment(armMesh,cell.index*2+i,cell.x,cell.z,cell.x+dx*.8,cell.z+dz*.8,.14,live.has(cell.index)?amber:gray,.036);});}
  let cable=0;for(const route of routes){const energized=route.source?circuit.powered:route.output?circuit.solved:edges.has(route.link.a+':'+route.link.b);for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i];segment(cables,cable++,a[0],a[1],b[0],b[1],.12,energized?amber:gray,.035);}}
  for(const mesh of [armMesh,nodes,cables]){mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere();}
 }
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=2048;const ctx=canvas.getContext('2d');ctx.font='bold 24px monospace';ctx.fillStyle='#d2cf9d';ctx.textAlign='center';for(const cell of WIRE_LAYOUT)ctx.fillText(String.fromCharCode(65+cell.index),(cell.x-33)/12*512+22,(cell.z-9)/49*2048+24);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const labelMaterial=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}),labelGeometry=new THREE.PlaneGeometry(12,49),labels=new THREE.Mesh(labelGeometry,labelMaterial);labels.rotation.x=-Math.PI/2;labels.position.set(39,.023,33.5);root.add(labels);
 update();return {update,root,dispose(){scene.remove(root);box.dispose();disc.dispose();material.dispose();labelGeometry.dispose();labelMaterial.dispose();texture.dispose();}};
}
