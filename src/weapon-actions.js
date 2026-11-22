/** Burst follow-ups are transient: ammo is spent by the caller for each real round. */
export function createBurstFire(){
 let remaining=0,timer=0,interval=.075;
 return {get active(){return remaining>0;},begin(count=1,gap=.075){remaining=Math.max(0,Math.min(2,Math.floor(count)-1));interval=Math.max(.05,Math.min(.2,Number(gap)||.075));timer=interval;},cancel(){remaining=0;timer=0;},update(dt,fire){if(!remaining)return;timer-=Math.max(0,Math.min(.1,Number(dt)||0));while(remaining>0&&timer<=0){remaining--;timer+=interval;if(fire()===false){remaining=0;break;}}}};
}
