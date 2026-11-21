const PAN=.65,HOLD=.8,TOTAL=PAN*2+HOLD;
const point=value=>value&&Number.isFinite(value.x)&&Number.isFinite(value.z);
const ease=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});
/** A brief, once-per-prerequisite camera hint; independent of the game camera. */
export function createDoorHintCamera({onBegin=()=>{},onEnd=()=>{}}={}){
 let active=null;const seen=new Set();
 function key(id,target){return `${id}|${target.id??target.label??''}|${target.x},${target.z}`;}
 function finish(reason){if(!active)return;const ended=active;active=null;onEnd({reason,target:{...ended.target}});}
 function start(id,target,player,{force=false}={}){
  if(active||typeof id!=='string'||!id||!point(target)||!point(player))return false;
  const token=key(id,target);if(seen.has(token)&&!force)return false;
  seen.add(token);if(seen.size>128)seen.delete(seen.values().next().value);
  active={target:{...target},from:{x:player.x,z:player.z},player:{x:player.x,z:player.z},elapsed:0};onBegin({...target});return true;
 }
 function update(dt,player){
  if(!active)return null;if(point(player))active.player={x:player.x,z:player.z};
  if(Number.isFinite(dt)&&dt>0)active.elapsed+=dt;
  const {elapsed,target,from}=active;
  if(elapsed>=TOTAL){const position={...active.player};finish('complete');return position;}
  if(elapsed<PAN)return mix(from,target,ease(elapsed/PAN));
  if(elapsed<PAN+HOLD)return {x:target.x,z:target.z};
  return mix(target,active.player,ease((elapsed-PAN-HOLD)/PAN));
 }
 function skip(){if(!active)return null;const position={...active.player};finish('skip');return position;}
 function reset({clearSeen=true}={}){finish('reset');if(clearSeen)seen.clear();}
 function serializeSeen(){return [...seen];}
 function restoreSeen(values){if(!Array.isArray(values)||values.length>128||!values.every(value=>typeof value==='string'&&value.length>0&&value.length<=512))return false;seen.clear();for(const value of values)seen.add(value);return true;}
 function repeat(id,target,player){return start(id,target,player,{force:true});}
 return {start,repeat,update,isActive:()=>!!active,skip,reset,serializeSeen,restoreSeen};
}
/** Temporary fog pixels only. Discovery sets and actor visibility are untouched. */
export function previewFog(pixels,width,height,map,target){
 if(!pixels||!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0||pixels.length<width*height*4||!point(target))return ()=>{};
 const length=width*height*4,before=Array.from(pixels.slice(0,length));let restored=false;
 for(let z=0;z<height;z++)for(let x=0;x<width;x++){
  // World z runs opposite the fog texture's vertical coordinate.
  const at=((height-1-z)*width+x)*4,near=Math.hypot(x+.5-target.x,z+.5-target.z)<=3;
  if(near){const floor=map?.[z]?.[x]===0,gray=floor?56:32;pixels[at]=pixels[at+1]=pixels[at+2]=gray;pixels[at+3]=floor?150:220;}
  else pixels[at+3]=Math.max(pixels[at+3],235);
 }
 return ()=>{if(restored)return;restored=true;for(let i=0;i<length;i++)pixels[i]=before[i];};
}
