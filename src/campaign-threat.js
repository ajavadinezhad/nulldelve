/** Authored opposition, independent of owned equipment and player health. */
const stages=[
 ['security','storage'],['command','generator'],['lab','reactor','transit'],
 ['containment','evacuation'],['nest'],
 ['hospital-triage','hospital-ward','hospital-isolation'],
 ['freight-pumps','freight-yard','freight-cold'],['signal-yard','signal-relay','signal-uplink']
];
// Explicit integer breakpoints prevent +5% from doubling a one-health runner.
const HEALTH={normal:[2,2,3,3,4,4,5,5],runner:[1,1,1,2,2,2,3,3],brute:[6,7,8,9,10,12,13,14],charger:[8,8,9,10,11,13,14,15],sentinel:[14,14,15,17,19,21,23,25],screecher:[10,10,11,12,13,15,16,17],leaper:[7,7,8,9,10,11,12,13],spitter:[6,6,7,8,9,10,11,12],mender:[8,8,9,10,11,12,13,14],boss:[24,28,32,36,40,44,48,52]};
const pace=[1,1,1.02,1.04,1.06,1.08,1.1,1.12];
export function campaignThreat(encounter){
 const stage=stages.findIndex(zones=>zones.includes(encounter));
 return {stage:stage+1,hp:stage<0?1:HEALTH.normal[stage]/2,speed:pace[stage]??1,flank:stage>=3};
}
export function encounterStats(base,rules,encounter,variant){
 const threat=campaignThreat(encounter);
 return {...base,hp:Math.ceil((HEALTH[variant]?.[threat.stage-1]??base.hp)*rules.hp),speed:base.speed*rules.speed*threat.speed,
 biteDamage:Math.round(base.biteDamage*rules.damage),
 behavior:rules.behavior==='direct'?'direct':threat.flank?'flank':rules.behavior,
 windupDuration:rules.windupDuration};
}
