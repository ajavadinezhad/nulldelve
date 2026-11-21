/** Difficulty changes opposition, not the operator's health or equipment. */
export const DIFFICULTY_RULES=Object.freeze({
 easy:Object.freeze({maxHp:100,speed:1,damage:1,hp:.8,magazine:30,primaryReserve:60,pistolReserve:24,waveSize:.75,reinforcementInterval:4,behavior:'direct',windupDuration:.45}),
 normal:Object.freeze({maxHp:100,speed:1,damage:1,hp:1,magazine:30,primaryReserve:60,pistolReserve:24,waveSize:1,reinforcementInterval:3,behavior:'pursue',windupDuration:.35}),
 hard:Object.freeze({maxHp:100,speed:1,damage:1,hp:1.5,magazine:30,primaryReserve:60,pistolReserve:24,waveSize:1.35,reinforcementInterval:2.2,behavior:'flank',windupDuration:.3})
});
