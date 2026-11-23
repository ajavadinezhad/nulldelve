/** Authored opposition, independent of owned equipment and player health. */
const stages=[
 ['security','storage'],['command','generator'],['lab','reactor','transit'],
 ['containment','evacuation'],['nest'],
 ['hospital-triage','hospital-ward','hospital-isolation'],
 ['freight-pumps','freight-yard','freight-cold'],['signal-yard','signal-relay','signal-uplink']
];
const durability=[1,1.05,1.1,1.15,1.2,1.5,1.55,1.6];
const pace=[1,1,1.02,1.04,1.06,1.08,1.1,1.12];
export function campaignThreat(encounter){
 const stage=stages.findIndex(zones=>zones.includes(encounter));
 return {stage:stage+1,hp:durability[stage]??1,speed:pace[stage]??1,flank:stage>=3};
}
export function encounterStats(base,rules,encounter){
 const threat=campaignThreat(encounter);
 return {...base,hp:Math.ceil(base.hp*(rules.hp+threat.hp-1)),speed:base.speed*rules.speed*threat.speed,
 biteDamage:Math.round(base.biteDamage*rules.damage),
 behavior:rules.behavior==='direct'?'direct':threat.flank?'flank':rules.behavior,
 windupDuration:rules.windupDuration};
}
