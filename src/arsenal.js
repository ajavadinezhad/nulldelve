/** Primary weapons share the rifle equipment slot and its reserve ammunition. */
export const PRIMARY_WEAPONS=Object.freeze([
 {id:'carbine',name:'MK4 Carbine',capacity:30,reload:1.7,interval:.11,baseDamage:1,range:18,stagger:0,pellets:1,spread:0,cost:0,description:'Balanced accuracy and sustained fire.'},
 {id:'smg',name:'VX9 SMG',capacity:36,reload:1.6,interval:.065,baseDamage:1,range:15,stagger:.04,pellets:1,spread:0,cost:220,description:'Compact automatic weapon with a high rate of fire.'},
 {id:'shotgun',name:'BREACH-12 Shotgun',capacity:6,reload:2.2,interval:.75,baseDamage:1,range:10,stagger:.22,pellets:5,spread:.22,cost:300,description:'Five-pellet close-range blast. Slow fire and limited magazine.'},
 {id:'marksman',name:'SABLE DMR',capacity:10,reload:2.1,interval:.48,baseDamage:4,range:28,stagger:.18,pellets:1,spread:0,cost:450,description:'Scoped rifle. High single-shot damage and long reach.'},
 {id:'lmg',name:'M60 WARDEN LMG',capacity:60,reload:3.6,interval:.085,baseDamage:1,range:21,stagger:0,pellets:1,spread:0,cost:650,description:'Heavy automatic weapon. Large belt box and slow reload.'},
 {id:'hush',name:'HUSH-9 Precision Carbine',capacity:18,reload:2,interval:.24,baseDamage:2,range:23,stagger:.08,pellets:1,spread:0,cost:380,description:'Measured precision fire. Efficient single shots; less effective when surrounded.'},
 {id:'scattergun',name:'TWIN Drum Scattergun',capacity:8,reload:2.8,interval:.44,baseDamage:1,range:7,stagger:.12,pellets:3,spread:.36,cost:520,description:'Rapid three-pellet bursts for tight corridors. Short reach and a slow drum reload.'},
].map(Object.freeze));
export function primaryWeapon(id){return PRIMARY_WEAPONS.find(w=>w.id===id)??PRIMARY_WEAPONS[0];}
/** Deterministic fan in radians. The central pellet follows the exact aim direction. */
export function shotDirections(dx,dz,profile){const length=Math.hypot(dx,dz);if(length<.001)return [];const base=Math.atan2(dz,dx),count=Math.max(1,Math.min(9,Math.floor(profile?.pellets??1))),spread=Math.max(0,Math.min(.8,profile?.spread??0));return Array.from({length:count},(_,i)=>{const angle=base+(count===1?0:(i/(count-1)-.5)*spread);return {x:Math.cos(angle),z:Math.sin(angle)};});}
export function primaryReserve(id){return id==='hush'?36:id==='scattergun'?16:id==='shotgun'?12:id==='smg'?90:id==='marksman'?24:id==='lmg'?120:60;}
