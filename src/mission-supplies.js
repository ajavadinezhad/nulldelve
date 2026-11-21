/** Two finite medical-security supply allotments on the hospital's required route. */
export function grantHospitalAmmo(weapons,budget=64){
 const primary=weapons.rifle,pistol=weapons.pistol,value=Math.max(1,(primary.baseDamage??primary.damage??1)*(primary.pellets??1));
 const rifleGain=Math.min(Math.ceil(Math.max(64,Math.min(80,Number.isFinite(budget)?budget:64))/value),Math.max(0,300-primary.reserve)),pistolGain=Math.min(18,Math.max(0,150-pistol.reserve));
 primary.reserve+=rifleGain;pistol.reserve+=pistolGain;return {rifle:rifleGain,pistol:pistolGain};
}
