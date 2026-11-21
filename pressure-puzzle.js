export const CRATE_SIZE=1.05;
export function createPressurePuzzle(){
  return {solved:false,crates:[{x:6,z:23.5,w:CRATE_SIZE,h:CRATE_SIZE,seated:false},{x:11,z:27.8,w:CRATE_SIZE,h:CRATE_SIZE,seated:false}],plates:[{x:4,z:23.5,active:false},{x:11,z:29.5,active:false}]};
}
export function overlapsCrate(x,z,r,crate){return Math.abs(x-crate.x)<crate.w/2+r&&Math.abs(z-crate.z)<crate.h/2+r;}

/** Small axis steps prevent tunnelling. A blocked push leaves both player and box in place. */
export function moveWithCrates(actor,dx,dz,puzzle,blocked){
  for(const [axis,amount] of [['x',dx],['z',dz]]){
    const steps=Math.max(1,Math.ceil(Math.abs(amount)/.06)),step=amount/steps;
    for(let i=0;i<steps;i++){
      const x=actor.x+(axis==='x'?step:0),z=actor.z+(axis==='z'?step:0);
      if(blocked(x,z,.32))break;
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
    if(crate&&(!actor||!overlapsCrate(actor.x,actor.z,.32,{...crate,x:plate.x,z:plate.z}))){crate.x=plate.x;crate.z=plate.z;crate.seated=true;plate.active=true;}
  }
  puzzle.solved=puzzle.plates.every(p=>p.active);
  return puzzle.solved;
}
export function resetPressurePuzzle(puzzle,actor){
  if(puzzle.solved)return false;
  const fresh=createPressurePuzzle();puzzle.crates.forEach((c,i)=>Object.assign(c,fresh.crates[i]));puzzle.plates.forEach(p=>p.active=false);if(actor&&puzzle.crates.some(c=>overlapsCrate(actor.x,actor.z,.32,c))){actor.x=7;actor.z=29;}return true;
}
