/** Physical apparatus state. The view receives geometry and live readings, not an input order. */
const COUNTS={glyphs:3,routing:3,valves:2},STEPS={glyphs:4,routing:2,valves:4};
const apertures=remix=>remix?[3,2,1]:[1,3,2];
export function initialMechanism(kind){return {positions:Array(COUNTS[kind]??0).fill(0)};}
export function mechanismStateValid(kind,value){return !!COUNTS[kind]&&Array.isArray(value?.positions)&&value.positions.length===COUNTS[kind]&&value.positions.every(n=>Number.isInteger(n)&&n>=0&&n<STEPS[kind]);}
export function mechanismAction(kind,value,index){if(!mechanismStateValid(kind,value)||!Number.isInteger(index)||index<0||index>=COUNTS[kind])return null;const positions=[...value.positions];positions[index]=(positions[index]+1)%STEPS[kind];return {positions};}
export function mechanismPanel(kind,value,remix=false){
 const positions=mechanismStateValid(kind,value)?value.positions:initialMechanism(kind).positions;
 if(kind==='glyphs')return {instrument:{kind:'alignment'},controls:positions.map((setting,i)=>({angle:setting*90,apertureAngle:apertures(remix)[i]*90,setting}))};
 if(kind==='routing'){
  const loads=[2,3,4],reading=positions.reduce((sum,on,i)=>sum+on*loads[i],0),rating=remix?7:6;
  return {instrument:{kind:'current',reading,max:9,safeMin:rating-.25,safeMax:rating+.25,flow:true},controls:positions.map((setting,i)=>({setting,load:loads[i]}))};
 }
 if(kind==='valves'){
  const reading=(remix?10:9)-2*positions[0]+positions[1],flow=positions[1];
  return {instrument:{kind:'pressure',reading,max:13,safeMin:4.5,safeMax:5.5,flow:flow>0,flowReading:flow},controls:positions.map((setting,i)=>({setting,angle:setting*90,direction:i===0?'relief':'feed'}))};
 }
 return {instrument:null,controls:[]};
}
export function mechanismSolved(kind,value,remix=false){
 if(!mechanismStateValid(kind,value))return false;
 if(kind==='glyphs')return value.positions.every((n,i)=>n===apertures(remix)[i]);
 const i=mechanismPanel(kind,value,remix).instrument;
 return !!i&&i.flow&&i.reading>=i.safeMin&&i.reading<=i.safeMax;
}
/** Paid camera only. This result must never be attached to the normal panel. */
export function nextMechanismAction(kind,value,remix=false){
 if(!mechanismStateValid(kind,value)||mechanismSolved(kind,value,remix))return null;
 const queue=[{value,first:null}],seen=new Set([value.positions.join(',')]);
 for(let n=0;n<queue.length;n++)for(let i=0;i<COUNTS[kind];i++){
  const next=mechanismAction(kind,queue[n].value,i),key=next.positions.join(',');if(seen.has(key))continue;
  const first=queue[n].first??i;if(mechanismSolved(kind,next,remix))return first;seen.add(key);queue.push({value:next,first});
 }
 return null;
}
