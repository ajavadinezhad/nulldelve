/** Routes use swept body clearance, not just floor-cell centers. */
export function createNavigator(width,height,isSolid){
 const swept=(x,z,tx,tz,r)=>{const steps=Math.max(1,Math.ceil(Math.hypot(tx-x,tz-z)/.12));for(let i=0;i<=steps;i++)if(isSolid(x+(tx-x)*i/steps,z+(tz-z)*i/steps,r))return false;return true;};
 const inBounds=(x,z)=>x>=1&&z>=1&&x<width-1&&z<height-1;
 function pursue(enemy,target,dt,move){
  if(!Number.isFinite(dt)||dt<=0)return false;
  const radius=enemy.radius??.32;enemy.routeTimer=(enemy.routeTimer??0)-dt;
  if(enemy.routeTimer<=0||!enemy.route){
   const serial=String(enemy.id??'e0').split('').reduce((n,c)=>n+c.charCodeAt(0),0);enemy.routeTimer=.75+(serial%4)*.08;
   const sx=Math.round(enemy.x),sz=Math.round(enemy.z),gx=Math.round(target.x),gz=Math.round(target.z),goal=gz*width+gx;
   const queue=[],parents=new Int32Array(width*height).fill(-1),cellCache=new Map(),edgeCache=new Map();
   const clear=(x,z)=>{const key=z*width+x;if(!cellCache.has(key))cellCache.set(key,!isSolid(x,z,radius));return cellCache.get(key);};
   const seeds=[];for(let z=sz-1;z<=sz+1;z++)for(let x=sx-1;x<=sx+1;x++)if(inBounds(x,z)&&clear(x,z)&&swept(enemy.x,enemy.z,x,z,radius))seeds.push({x,z,d:Math.hypot(x-enemy.x,z-enemy.z)});
   seeds.sort((a,b)=>a.d-b.d);for(const p of seeds){const key=p.z*width+p.x;parents[key]=-2;queue.push(key);}
   let best=-1,bestDistance=Infinity,reachedGoal=false;const goalBlocked=!inBounds(gx,gz)||!clear(gx,gz)||!swept(gx,gz,target.x,target.z,radius);
   for(let i=0;i<queue.length;i++){
    const id=queue[i],x=id%width,z=Math.floor(id/width),distance=Math.hypot(x-target.x,z-target.z);
    if(distance<bestDistance){best=id;bestDistance=distance;}
    if(id===goal&&swept(x,z,target.x,target.z,radius)){best=id;reachedGoal=true;break;}
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,key=nz*width+nx;if(!inBounds(nx,nz)||parents[key]!==-1||!clear(nx,nz))continue;const edge=id<key?id+':'+key:key+':'+id;if(!edgeCache.has(edge))edgeCache.set(edge,swept(x,z,nx,nz,radius));if(!edgeCache.get(edge))continue;parents[key]=id;queue.push(key);}
   }
   if(!reachedGoal&&!goalBlocked)best=-1;
   enemy.route=[];
   if(best!==-1){let id=best;while(id>=0){enemy.route.push({x:id%width,z:Math.floor(id/width)});id=parents[id];}enemy.route.reverse();}
  }
  while(enemy.route?.length&&Math.hypot(enemy.route[0].x-enemy.x,enemy.route[0].z-enemy.z)<.08)enemy.route.shift();
  const point=enemy.route?.[0];if(!point)return false;
  const dx=point.x-enemy.x,dz=point.z-enemy.z,d=Math.hypot(dx,dz),step=Math.min(d,(enemy.speed??2.7)*dt);
  if(!swept(enemy.x,enemy.z,enemy.x+dx/d*step,enemy.z+dz/d*step,radius)){enemy.routeTimer=0;return false;}
  enemy.mesh.rotation.y=Math.atan2(-dx,-dz);move(enemy,dx/d*step,dz/d*step);return true;
 }
 pursue.canMoveDirect=(enemy,target)=>swept(enemy.x,enemy.z,target.x,target.z,enemy.radius??.32);
 return pursue;
}
