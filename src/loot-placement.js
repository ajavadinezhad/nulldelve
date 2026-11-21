const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
/** Relocate fresh drops onto reachable floor; state already contains these drops. */
export function placeLootDrops(state,drops,origin,{solid=()=>false,lineOfSight=()=>true}={}){
 const incoming=new Set(drops),placed=[],resolved=new Set();
 const existing=()=>state.drops.filter(d=>!incoming.has(d)||resolved.has(d));
 function candidates(drop){
  const result=[{x:drop.x,z:drop.z},{x:origin.x,z:origin.z}];
  // An even-area golden-angle spiral gives stable coverage without randomness.
  for(let i=1;i<=240;i++){const radius=4*Math.sqrt(i/240),angle=i*2.399963229728653;result.push({x:origin.x+Math.cos(angle)*radius,z:origin.z+Math.sin(angle)*radius});}
  return result;
 }
 for(const drop of [...drops]){
  if(!state.drops.includes(drop))continue;
  const points=candidates(drop),others=existing();
  const clear=(point,radius)=>distance(point,origin)<=4.00001&&!solid(point.x,point.z,radius)&&lineOfSight(origin.x,origin.z,point.x,point.z)&&others.every(other=>distance(point,other)>=.55);
  let point=points.find(p=>clear(p,.38)),compact=false;
  if(!point){point=points.find(p=>clear(p,.22));compact=!!point;}
  if(point){Object.assign(drop,point,{compact});resolved.add(drop);placed.push(drop);continue;}
  const merge=others.filter(other=>other.kind===drop.kind&&distance(other,origin)<=4&&lineOfSight(origin.x,origin.z,other.x,other.z)&&!solid(other.x,other.z,other.compact ? .22 : .38)).sort((a,b)=>distance(a,origin)-distance(b,origin))[0];
  if(merge){
   for(const key of ['amount','rifle','pistol'])merge[key]=(Number(merge[key])||0)+(Number(drop[key])||0);
   state.drops.splice(state.drops.indexOf(drop),1);if(!placed.includes(merge))placed.push(merge);continue;
  }
  // A creature body fits here. In an entirely packed narrow passage, retaining a
  // compact overlapping drop at its body is preferable to deleting a resource.
  drop.x=origin.x;drop.z=origin.z;drop.compact=true;resolved.add(drop);placed.push(drop);
 }
 return placed;
}
