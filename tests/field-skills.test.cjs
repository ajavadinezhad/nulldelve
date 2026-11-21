const {test}=require('node:test'),assert=require('node:assert/strict');
const {FIELD_SKILLS,SKILL_NODES,SKILL_BRANCHES,trainingPoints,skillLearnable,FIELD_SKILLS_KEY,fieldSkillUnlocked,normalizeFieldSkill,fieldSkillEffects,createFieldSkills}=require('../src/field-skills.js');
const progress=['breach','command','research'];
function store(){const data=new Map();return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}
test('one skill unlocks only at its contiguous campaign milestone, without any currency or XP',()=>{assert.equal(FIELD_SKILLS.length,4);assert.ok(fieldSkillUnlocked('none'));assert.equal(fieldSkillUnlocked('runner',['command']),false);assert.equal(fieldSkillUnlocked('demolition',['breach','research']),false);assert.ok(fieldSkillUnlocked('medic',['breach']));assert.ok(fieldSkillUnlocked('runner',progress));assert.ok(fieldSkillUnlocked('demolition',progress));assert.equal(fieldSkillUnlocked('unknown',progress),false);});
test('legacy, malformed and unearned saved choices normalize to standard kit',()=>{for(const saved of [undefined,null,{},'medic',{version:9,selected:'medic'},{version:1,selected:['medic']},{version:1,selected:'unknown'}])assert.equal(normalizeFieldSkill(saved,progress).selected,'none');assert.equal(normalizeFieldSkill({version:1,selected:'demolition'},['breach']).selected,'none');assert.equal(normalizeFieldSkill({version:1,selected:'medic'},['breach']).selected,'medic');});
test('skill selection persists one mutually exclusive effect and never changes supply inventory',()=>{const storage=store();storage.data.set('nulldelve.profile.v1','existing inventory');const skills=createFieldSkills(storage);assert.equal(skills.selected(progress),'none');assert.equal(skills.equip('demolition',[]).ok,false);assert.equal(skills.equip('unknown',progress).ok,false);assert.equal(storage.data.has(FIELD_SKILLS_KEY),false);assert.ok(skills.learn('medic',progress).ok);assert.equal(skills.selected(progress),'medic');assert.equal(createFieldSkills(storage).selected(progress),'medic');assert.ok(skills.learn('runner',progress).ok);assert.equal(skills.selected(progress),'runner');assert.deepEqual(fieldSkillEffects(skills.selected(progress)),{...fieldSkillEffects('none'),sprintMultiplier:1.1});assert.equal(storage.data.get('nulldelve.profile.v1'),'existing inventory');});
test('effects are bounded, immutable and include a demolition risk rather than immunity',()=>{assert.deepEqual(fieldSkillEffects('none'),{medkitHealing:50,sprintMultiplier:1,grenadeRadiusMultiplier:1,reloadMultiplier:1,meleeDamage:1,armorDamageMultiplier:1,grenadeChargeMultiplier:1});assert.equal(fieldSkillEffects('medic').medkitHealing,65);assert.equal(fieldSkillEffects('medic').sprintMultiplier,1);assert.equal(fieldSkillEffects('demolition').grenadeRadiusMultiplier,1.15);assert.equal(fieldSkillEffects('demolition').medkitHealing,50);assert.ok(Object.isFrozen(fieldSkillEffects('demolition')));assert.equal(fieldSkillEffects('unknown'),fieldSkillEffects('none'));});
test('unavailable storage retains a session choice; checkpoint restore does not overwrite base selection',()=>{const storage=store(),base=createFieldSkills(storage);base.learn('medic',progress);const saved=base.serialize(progress);base.learn('runner',progress);assert.ok(base.restoreTransient(saved,progress));assert.equal(base.selected(progress),'medic');assert.equal(createFieldSkills(storage).selected(progress),'runner');assert.ok(base.isSessionOnly());assert.equal(base.restoreTransient({version:1,selected:'demolition'},[]),false);const noStore=createFieldSkills(null);assert.ok(noStore.learn('medic',progress).ok);assert.equal(noStore.selected(progress),'medic');assert.ok(noStore.isSessionOnly());const hostile=createFieldSkills({getItem(){throw Error('Denied');},setItem(){throw Error('Denied');}});assert.ok(hostile.learn('runner',progress).ok);assert.equal(hostile.selected(progress),'runner');});
test('serialization is detached and storage corruption is harmless',()=>{const storage=store(),skills=createFieldSkills(storage);skills.learn('medic',progress);const saved=skills.serialize(progress);saved.selected='demolition';assert.equal(skills.selected(progress),'medic');storage.data.set(FIELD_SKILLS_KEY,'malformed');assert.doesNotThrow(()=>skills.selected(progress));assert.equal(createFieldSkills(storage).selected(progress),'none');});

test('incoming deployment selection persists across reload while checkpoint restore remains transient',()=>{const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},completed=['breach','command','research'],skills=createFieldSkills(storage);skills.learn('runner',completed);assert.equal(skills.restoreDeployment({version:1,selected:'medic'},completed),true);assert.equal(skills.isSessionOnly(),false);assert.equal(createFieldSkills(storage).selected(completed),'medic');assert.equal(skills.restoreTransient({version:1,selected:'demolition'},completed),true);assert.equal(skills.selected(completed),'demolition');assert.equal(createFieldSkills(storage).selected(completed),'medic');assert.equal(skills.restoreDeployment({version:1,selected:'demolition'},[]),false);});

test('advanced skills require development of their parent and spend one finite training point',()=>{const completed=['breach','command','research','containment','nest','hospital'],skills=createFieldSkills(store());assert.equal(skills.learn('surgeon',completed).ok,false);assert.ok(skills.learn('medic',completed).ok);assert.ok(skills.learn('surgeon',completed).ok);assert.equal(skills.learn('surgeon',completed).ok,false);assert.equal(skills.selected(completed),'surgeon');assert.deepEqual(skills.serialize(completed).learned,['medic','surgeon']);assert.equal(fieldSkillEffects('surgeon').medkitHealing,75);assert.equal(createFieldSkills(null).equip('medic',completed).ok,false);const early=createFieldSkills(null);assert.ok(early.learn('medic',['breach']).ok);assert.equal(early.learn('runner',['breach']).ok,false);assert.equal(early.learn('surgeon',['breach']).ok,false);});


test('legacy migration cannot introduce advanced skills absent from the old catalog',()=>{
 const completed=['breach','command','research','containment','nest','hospital'];
 for(const selected of ['surgeon','pathfinder','ordnance']){
  const normalized=normalizeFieldSkill({version:1,selected},completed);
  assert.equal(normalized.selected,'none');assert.deepEqual(normalized.learned,[]);
 }
 const advanced=normalizeFieldSkill({version:2,selected:'surgeon',learned:['surgeon']},completed);
 assert.equal(advanced.selected,'none');assert.deepEqual(advanced.learned,[]);
});

test('stale deployment transfers preserve developed nodes and spent points across reload',()=>{
 const completed=['breach','command','research','containment','nest','hospital'],storage=store(),skills=createFieldSkills(storage);
 assert.ok(skills.learn('medic',completed).ok);const old=skills.serialize(completed);
 assert.ok(skills.learn('surgeon',completed).ok);assert.ok(skills.learn('runner',completed).ok);
 assert.ok(skills.restoreDeployment(old,completed));
 const restored=createFieldSkills(storage).serialize(completed);
 assert.equal(restored.selected,'medic');assert.deepEqual(restored.learned,['medic','runner','surgeon']);
 assert.ok(skills.restoreDeployment({version:1,selected:'demolition'},completed));
 const imported=skills.serialize(completed);assert.deepEqual(imported.learned,['medic','runner','demolition','surgeon']);
 assert.equal(imported.selected,'demolition');
});

const allOperations=['breach','command','research','containment','nest','hospital','freight'];
test('twelve distinct skills form three prerequisite spines with specialization forks',()=>{
 assert.equal(SKILL_NODES.length,12);assert.equal(new Set(SKILL_NODES.map(node=>node.id)).size,12);
 for(const branch of SKILL_BRANCHES){assert.equal(branch.nodes.length,4);const [base,advanced,...leaves]=branch.nodes;assert.equal(SKILL_NODES.find(node=>node.id===advanced).requires,base);for(const id of leaves)assert.equal(SKILL_NODES.find(node=>node.id===id).requires,advanced);}
 for(const leaf of ['plating','triage','quickloader','closequarters','steadythrow','widearea'])assert.equal(skillLearnable(leaf,{learned:[]},allOperations),false);
});
test('specializations provide bounded mutually exclusive abilities without stacking ancestors',()=>{
 const changed={plating:['armorDamageMultiplier',.8],triage:['medkitHealing',85],quickloader:['reloadMultiplier',.88],closequarters:['meleeDamage',2],steadythrow:['grenadeChargeMultiplier',.8],widearea:['grenadeRadiusMultiplier',1.25]};
 for(const [id,[key,value]]of Object.entries(changed)){assert.equal(fieldSkillEffects(id)[key],value);assert.ok(Object.isFrozen(fieldSkillEffects(id)));for(const other of Object.keys(fieldSkillEffects('none')))if(other!==key)assert.equal(fieldSkillEffects(id)[other],fieldSkillEffects('none')[other],id+' does not stack '+other);}
 const skills=createFieldSkills(store());for(const id of ['runner','pathfinder','quickloader'])assert.ok(skills.learn(id,allOperations).ok);assert.equal(skills.selected(allOperations),'quickloader');assert.equal(fieldSkillEffects(skills.selected(allOperations)).sprintMultiplier,1);assert.equal(trainingPoints(skills.serialize(allOperations),allOperations),4);
});
test('seven earned points force branch choices and stale imports cannot erase developed leaves',()=>{
 const storage=store(),skills=createFieldSkills(storage);for(const id of ['runner','pathfinder','quickloader','closequarters','demolition','ordnance','widearea'])assert.ok(skills.learn(id,allOperations).ok);
 const before=skills.serialize(allOperations);assert.equal(trainingPoints(before,allOperations),0);assert.equal(skills.learn('medic',allOperations).ok,false);
 assert.ok(skills.restoreDeployment({version:2,selected:'triage',learned:['medic','surgeon','triage']},allOperations));
 const after=createFieldSkills(storage).serialize(allOperations);assert.deepEqual(new Set(after.learned),new Set(before.learned));assert.equal(after.selected,'widearea');assert.equal(trainingPoints(after,allOperations),0);
});
test('a stale tab reads newly developed skills before spending another point',()=>{
 const storage=store(),a=createFieldSkills(storage),b=createFieldSkills(storage);assert.ok(a.learn('runner',allOperations).ok);assert.ok(a.learn('pathfinder',allOperations).ok);assert.ok(a.learn('quickloader',allOperations).ok);assert.ok(b.learn('medic',allOperations).ok);assert.deepEqual(new Set(a.serialize(allOperations).learned),new Set(['runner','pathfinder','quickloader','medic']));assert.equal(trainingPoints(a.serialize(allOperations),allOperations),3);
});
