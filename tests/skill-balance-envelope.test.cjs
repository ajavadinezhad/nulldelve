const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {SKILL_NODES,fieldSkillEffects,effectiveFieldStats}=require('../src/field-skills.js');
const {PRIMARY_WEAPONS}=require('../src/arsenal.js');
const {createEconomy}=require('../src/economy.js');
const {applyWeaponAttachment,attachmentOptions}=require('../src/weapon-attachments.js');
const {DIFFICULTY_RULES}=require('../src/difficulty.js');
const {ROACH_VARIANTS}=require('../src/roach.js');
const source=fs.readFileSync(new URL('../src/main.js',`file://${__filename}`),'utf8');
function fragment(start,end){const at=source.indexOf(start),stop=source.indexOf(end,at);assert.ok(at>=0&&stop>at);return source.slice(at,stop);}
const ids=['none',...SKILL_NODES.map(n=>n.id)];
test('every skill keeps real armor damage bounded across opposition difficulties and mutation attacks',()=>{
 for(const difficulty of Object.values(DIFFICULTY_RULES))for(const id of ids){const economy=createEconomy({credits:180,shield:60}),ctx={Math,Number,skillEffects:()=>fieldSkillEffects(id),economy,player:{hp:100,hurtGrace:0},audio:{bite(){}}};vm.createContext(ctx);vm.runInContext(fragment('function applyPlayerDamage','function beginReload'),ctx);
  for(const variant of Object.values(ROACH_VARIANTS))for(const shield of [0,4,40,60]){ctx.player.hp=100;ctx.player.hurtGrace=0;economy.state.shield=shield;const damage=Math.round(variant.biteDamage*difficulty.damage);ctx.damage=damage;vm.runInContext('applyPlayerDamage(damage)',ctx);const cost=fieldSkillEffects(id).armorDamageMultiplier,absorbed=Math.min(shield/cost,damage);assert.ok(Math.abs(ctx.player.hp-(100-damage+absorbed))<1e-8);assert.ok(Number.isFinite(economy.state.shield)&&economy.state.shield>=0&&economy.state.shield<=shield);assert.equal(economy.state.credits,180);if(!shield)assert.equal(ctx.player.hp,100-damage,'no skill makes an unarmored hit harmless');}
 }
});
test('every skill reload uses real upgraded and attached guns without compounding or a dominant fire-rate tier',()=>{
 const reloadSource=fragment('function reloadDuration()','function advanceWeaponTimers');
 for(const gun of [...PRIMARY_WEAPONS,{id:'pistol',capacity:12,reload:1.1,interval:.29,baseDamage:2}])for(const rank of [0,3])for(const attachment of gun.id==='pistol'?[{id:'standard'}]:attachmentOptions(gun.id)){
  const economy=createEconomy({credits:1000,upgrades:{[gun.id==='carbine'?'rifle':gun.id]:{reload:rank}}}),stats=economy.stats(gun.id,{capacity:gun.capacity,reload:gun.reload,interval:gun.interval,damage:gun.baseDamage}),profile=gun.id==='pistol'?{...gun,...stats}:applyWeaponAttachment({...gun,...stats},attachment.id),original=JSON.stringify(profile),base=profile.capacity/(profile.capacity*profile.interval+profile.reload);
  for(const id of ids){const ctx={effectiveFieldStats,activeFieldSkill:id,Math,Number,selected:'rifle',weapons:{rifle:profile},skillEffects:()=>fieldSkillEffects(id)};vm.createContext(ctx);vm.runInContext(reloadSource,ctx);const first=vm.runInContext('reloadDuration()',ctx),again=vm.runInContext('reloadDuration()',ctx);assert.equal(first,again);assert.ok(first>=.5&&first<=profile.reload);const throughput=profile.capacity/(profile.capacity*profile.interval+first);assert.ok(throughput/base<=1/.88+1e-10,'12% reload reduction cannot exceed its theoretical full-cycle upper bound');assert.equal(JSON.stringify(profile),original,'skill must never mutate the weapon or compound');}
 }
});
