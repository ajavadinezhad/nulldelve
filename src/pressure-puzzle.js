export const CRATE_SIZE=1.05;
export function createPressurePuzzle(){
  return {solved:false,crates:[{x:6,z:23.5,w:CRATE_SIZE,h:CRATE_SIZE,seated:false},{x:11,z:27.8,w:CRATE_SIZE,h:CRATE_SIZE,seated:false}],plates:[{x:4,z:23.5,active:false},{x:11,z:29.5,active:false}]};
}
export function overlapsCrate(x,z,r,crate){return Math.abs(x-crate.x)<crate.w/2+r&&Math.abs(z-crate.z)<crate.h/2+r;}

/** A nearby unseated crate can be gripped from any accessible face. */
export function nearestPullableCrate(puzzle,actor,blocked=()=>false){
 if(puzzle.solved)return null;
 return puzzle.crates.filter(crate=>!crate.seated&&Math.hypot(Math.max(0,Math.abs(actor.x-crate.x)-crate.w/2),Math.max(0,Math.abs(actor.z-crate.z)-crate.h/2))<=.65&&!overlapsCrate(actor.x,actor.z,.25,crate)&&!Array.from({length:9},(_,i)=>(i+1)/10).some(t=>blocked(actor.x+(crate.x-actor.x)*t,actor.z+(crate.z-actor.z)*t,0))).sort((a,b)=>Math.hypot(a.x-actor.x,a.z-actor.z)-Math.hypot(b.x-actor.x,b.z-actor.z))[0]??null;
}
export function beginCrateGrab(puzzle,actor,blocked){const crate=nearestPullableCrate(puzzle,actor,blocked);puzzle.grabbed=crate?puzzle.crates.indexOf(crate):null;return !!crate;}
export function releaseCrateGrab(puzzle){puzzle.grabbed=null;}

/** Small axis steps prevent tunnelling. A blocked push leaves both player and box in place. */
export function moveWithCrates(actor,dx,dz,puzzle,blocked){
  // A door, crate, or restored checkpoint can leave the actor overlapping an edge.
  // Find a nearby clear center without crossing a wall or a crate.
  const clear=(x,z,r)=>!blocked(x,z,r)&&!puzzle.crates.some(crate=>overlapsCrate(x,z,r,crate));
  if((dx||dz)&&!clear(actor.x,actor.z,.32)&&clear(actor.x,actor.z,0)){
    const direction=Math.atan2(dz,dx);
    for(let distance=.04;distance<=.65;distance+=.04){
      for(let offset=0;offset<16;offset++){
        const angle=direction+offset*Math.PI/8;
        const x=actor.x+Math.cos(angle)*distance,z=actor.z+Math.sin(angle)*distance;
        if(!clear(x,z,.32))continue;
        const steps=Math.ceil(distance/.025);
        if(Array.from({length:steps},(_,i)=>(i+1)/steps).some(t=>!clear(actor.x+(x-actor.x)*t,actor.z+(z-actor.z)*t,0)))continue;
        releaseCrateGrab(puzzle);
        actor.x=x;actor.z=z;
        return;
      }
    }
  }
  for(const [axis,amount] of [['x',dx],['z',dz]]){
    const steps=Math.max(1,Math.ceil(Math.abs(amount)/.06)),step=amount/steps;
    for(let i=0;i<steps;i++){
      const x=actor.x+(axis==='x'?step:0),z=actor.z+(axis==='z'?step:0);
      if(blocked(x,z,.32))break;
      const gripped=puzzle.grabbed==null?null:puzzle.crates[puzzle.grabbed];
      if(gripped){
        if(gripped.seated||puzzle.solved){releaseCrateGrab(puzzle);break;}
        const cx=gripped.x+(axis==='x'?step:0),cz=gripped.z+(axis==='z'?step:0);
        if(blocked(cx,cz,gripped.w/2)||Array.from({length:9},(_,i)=>(i+1)/10).some(t=>blocked(x+(cx-x)*t,z+(cz-z)*t,.08))||puzzle.crates.some(other=>other!==gripped&&(overlapsCrate(cx,cz,gripped.w/2,other)||overlapsCrate(x,z,.32,other))))break;
        gripped.x=cx;gripped.z=cz;actor.x=x;actor.z=z;continue;
      }
      const touching=puzzle.crates.filter(c=>overlapsCrate(x,z,.32,c));
      if(touching.length>1)break;
      if(touching.length){
        const crate=touching[0];if(crate.seated)break;
        const cx=crate.x+(axis==='x'?step:0),cz=crate.z+(axis==='z'?step:0);
        if(blocked(cx,cz,crate.w/2)||puzzle.crates.some(other=>other!==crate&&overlapsCrate(cx,cz,crate.w/2,other)))break;
        crate.x=cx;crate.z=cz;
      }
      actor.x=x;actor.z=z;
    }
  }
}
export function updatePressurePuzzle(puzzle,actor){
  if(puzzle.solved)return false;
  for(const plate of puzzle.plates){
    if(plate.active)continue;
    const crate=puzzle.crates.find(c=>!c.seated&&Math.abs(c.x-plate.x)<.22&&Math.abs(c.z-plate.z)<.22);
    // Don't snap into a player standing alongside the box.
    if(crate&&(!actor||!overlapsCrate(actor.x,actor.z,.32,{...crate,x:plate.x,z:plate.z}))&&!puzzle.crates.some(other=>other!==crate&&overlapsCrate(plate.x,plate.z,crate.w/2,other))){crate.x=plate.x;crate.z=plate.z;crate.seated=true;plate.active=true;if(puzzle.crates[puzzle.grabbed]===crate)releaseCrateGrab(puzzle);}
  }
  puzzle.solved=puzzle.plates.every(p=>p.active);
  return puzzle.solved;
}
export function resetPressurePuzzle(puzzle,actor){
  if(puzzle.solved)return false;
  releaseCrateGrab(puzzle);const fresh=createPressurePuzzle();puzzle.crates.forEach((c,i)=>Object.assign(c,fresh.crates[i]));puzzle.plates.forEach(p=>p.active=false);if(actor&&puzzle.crates.some(c=>overlapsCrate(actor.x,actor.z,.32,c))){actor.x=7;actor.z=29;}return true;
}
