/** Observable engineering state for annex controls; paid guidance is kept separate. */
const feederCapacity=remix=>remix?[6,3]:[5,4];
const valid=(values,count,max)=>Array.isArray(values)&&values.length===count&&values.every(n=>Number.isInteger(n)&&n>=0&&n<=max);
export function annexMechanismPanel(kind,values,remix=false){
 if(kind==='pressure'){
  const [oxygen,filter,exhaust]=valid(values,3,2)?values:[0,0,0],reading=2+3*oxygen-(4-2*filter)-3*exhaust,rating=remix?2:6;
  return {instrument:{kind:'pressure',reading,min:-8,max:12,safeMin:rating-.4,safeMax:rating+.4,flow:oxygen>0&&filter>0},controls:[{effect:'supply',load:3},{effect:'filter',load:2},{effect:'vent',load:-3}]};
 }
 if(kind==='feeders'){
  const loads=[2,3,4],allocated=[0,0],capacities=feederCapacity(remix);(values??[]).forEach((feeder,i)=>{if(feeder===0||feeder===1)allocated[feeder]+=loads[i]??0;});
  return {instrument:{kind:'feeders',channels:allocated.map((reading,i)=>({label:['A','B'][i],reading,min:0,max:9,safeMin:0,safeMax:capacities[i]}))},controls:loads.map(load=>({load}))};
 }
 if(kind==='tracks'){
  const positions=valid(values,2,1)?values:[0,0],through=remix?[0,1]:[1,0];
  // Both physical branches are shown: one continues toward Cold Chain, the other
  // ends at a buffer. Selected segments describe points as set, not correctness.
  const sections=positions.map((setting,i)=>({setting,branches:[0,1].map(branch=>({branch,continues:branch===through[i],selected:branch===setting}))}));
  return {instrument:{kind:'rails',sections},controls:[]};
 }
 return {instrument:null,controls:[]};
}
export function annexMechanismSolved(kind,values,remix=false){
 if(kind==='pressure'){if(!valid(values,3,2))return false;const i=annexMechanismPanel(kind,values,remix).instrument;return i.flow&&i.reading>=i.safeMin&&i.reading<=i.safeMax;}
 if(kind==='feeders'){return valid(values,3,1)&&annexMechanismPanel(kind,values,remix).instrument.channels.every(c=>c.reading<=c.safeMax);}
 if(kind==='tracks')return valid(values,2,1)&&annexMechanismPanel(kind,values,remix).instrument.sections.every(s=>s.branches.find(b=>b.selected).continues);
 return false;
}
/** This one-step result belongs only to requested paid assistance. */
export function nextAnnexMechanismAction(kind,values,remix=false){
 if(annexMechanismSolved(kind,values,remix))return null;
 const max={pressure:2,feeders:1,tracks:1}[kind],count={pressure:3,feeders:3,tracks:2}[kind];if(max===undefined||!Array.isArray(values)||values.length!==count)return null;
 const queue=[{values:[...values],first:null}],seen=new Set([values.join(',')]);
 for(let n=0;n<queue.length;n++)for(let index=0;index<count;index++)for(let value=0;value<=max;value++){
  const next=[...queue[n].values];next[index]=value;const key=next.join(',');if(seen.has(key))continue;seen.add(key);const first=queue[n].first??{index,value};if(annexMechanismSolved(kind,next,remix))return first;queue.push({values:next,first});
 }
 return null;
}
