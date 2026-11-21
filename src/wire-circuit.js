/** Authored cross-room circuit. Ports are clockwise north/east/south/west. */
export const WIRE_LAYOUT=Object.freeze([
 ['elbow',38,56,'Generator'],['straight',38,46,'Generator'],['straight',38,29,'Extraction'],['straight',38,20,'Command corridor'],['elbow',38,13,'Command'],['elbow',43,13,'Command'],['elbow',43,10,'Command'],['straight',35,46,'Generator'],['elbow',41,29,'Extraction'],
].map(([kind,x,z,room],index)=>Object.freeze({index,id:'wire-'+index,kind,x,z,room,label:'JUNCTION '+String.fromCharCode(65+index)})));
export const WIRE_LINKS=Object.freeze([
 {a:0,portA:0,b:1,portB:2},{a:1,portA:0,b:2,portB:2},{a:2,portA:0,b:3,portB:2,via:[[36.4,28.2],[36.4,23],[38,23]]},{a:3,portA:0,b:4,portB:2},{a:4,portA:1,b:5,portB:3},{a:5,portA:0,b:6,portB:2},{a:1,portA:3,b:7,portB:1},{a:2,portA:1,b:8,portB:3},
].map(Object.freeze));
export const WIRE_SOLUTION=Object.freeze([3,1,1,1,1,3,1,0,0]);
const START=[1,0,0,0,3,1,3,1,2];
export function junctionPorts(circuit,index){return (WIRE_LAYOUT[index]?.kind==='straight'?[1,3]:[0,1]).map(direction=>(direction+circuit.rotations[index])%4);}
export function evaluateCircuit(circuit){
 const energized=[],edges=[];if(!circuit.powered||!junctionPorts(circuit,0).includes(3))return {connected:false,energized,edges};
 const queue=[0],seen=new Set(queue),visitedEdges=new Set();for(let i=0;i<queue.length;i++){const index=queue[i];energized.push(index);for(const [edgeIndex,link] of WIRE_LINKS.entries()){if(link.a!==index&&link.b!==index)continue;const fromA=link.a===index,port=fromA?link.portA:link.portB,otherPort=fromA?link.portB:link.portA,neighbor=fromA?link.b:link.a;if(!junctionPorts(circuit,index).includes(port)||!junctionPorts(circuit,neighbor).includes(otherPort))continue;if(!visitedEdges.has(edgeIndex)){visitedEdges.add(edgeIndex);edges.push([link.a,link.b]);}if(!seen.has(neighbor)){seen.add(neighbor);queue.push(neighbor);}}}
 return {connected:seen.has(6)&&junctionPorts(circuit,6).includes(1),energized,edges};
}
export function createWireCircuit(saved){if(!saved)return {rotations:[...START],powered:false,solved:false};if(!validateWireCircuit(saved))return null;return {rotations:[...saved.rotations],powered:saved.powered,solved:saved.solved};}
export function validateWireCircuit(saved){return !!saved&&Array.isArray(saved.rotations)&&saved.rotations.length===9&&saved.rotations.every(rotation=>Number.isInteger(rotation)&&rotation>=0&&rotation<4)&&typeof saved.powered==='boolean'&&typeof saved.solved==='boolean'&&saved.solved===evaluateCircuit(saved).connected;}
export function rotateJunction(circuit,index){if(!Number.isInteger(index)||index<0||index>=9||circuit.solved)return false;circuit.rotations[index]=(circuit.rotations[index]+1)%4;circuit.solved=evaluateCircuit(circuit).connected;return true;}
export function powerCircuit(circuit){circuit.powered=true;circuit.solved=evaluateCircuit(circuit).connected;return circuit.solved;}
