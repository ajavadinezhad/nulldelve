const {test}=require('node:test');const assert=require('node:assert/strict');
const {DEFAULT_BINDINGS,normalizeBindings,validateBinding,actionForCode,normalizeSettings}=require('../src/controls.js');
test('a quick aim tap survives release before the next frame, with remapped diagonals',()=>{
 const {keyboardAimDirection}=require('../src/controls.js');
 const bindings={...DEFAULT_BINDINGS,aimDown:'KeyK',aimLeft:'KeyJ'},keys=new Set(['KeyK']);
 const latched=keyboardAimDirection(keys,bindings);keys.clear();
 assert.deepEqual(latched,{x:0,z:1});
 assert.equal(keyboardAimDirection(keys,bindings),null);
 keys.add('KeyK');keys.add('KeyJ');
 const diagonal=keyboardAimDirection(keys,bindings);
 assert.ok(Math.abs(diagonal.x+Math.SQRT1_2)<1e-12);
 assert.ok(Math.abs(diagonal.z-Math.SQRT1_2)<1e-12);
 keys.add('ArrowUp');assert.deepEqual(keyboardAimDirection(keys,bindings),{x:-1,z:0});
});
test('legacy settings get complete bindings and audio/HUD defaults',()=>{const settings=normalizeSettings({brightness:1.2});assert.deepEqual(settings.bindings,DEFAULT_BINDINGS);assert.equal(settings.aimMode,'auto');assert.equal(settings.hudScale,1);assert.equal(settings.masterVolume,.65);assert.equal(settings.muted,false);});
test('remapping rejects menu keys and duplicates but supports gameplay keys',()=>{assert.equal(validateBinding(DEFAULT_BINDINGS,'reload','Escape').ok,false);assert.equal(validateBinding({...DEFAULT_BINDINGS,fire:'KeyZ'},'reload','Space').ok,true);assert.equal(validateBinding(DEFAULT_BINDINGS,'reload','KeyT').ok,false);assert.equal(validateBinding(DEFAULT_BINDINGS,'reload','KeyW').ok,false);assert.equal(validateBinding(DEFAULT_BINDINGS,'reload','KeyV').ok,true);});
test('normalized bindings recover from corrupt saves without duplicate assignments',()=>{const result=normalizeBindings({moveUp:'KeyS',moveDown:'KeyS',moveLeft:'Escape',medkit:3});assert.equal(result.moveUp,'KeyS');assert.equal(new Set(Object.values(result)).size,Object.keys(DEFAULT_BINDINGS).length);assert.ok(!Object.values(result).includes('Escape'));assert.equal(actionForCode('KeyS',result),'moveUp');});
test('settings preserve remaps while clamping presentation and audio controls',()=>{const s=normalizeSettings({bindings:{...DEFAULT_BINDINGS,reload:'KeyV'},aimMode:'keyboard',hudScale:99,masterVolume:-2,musicVolume:99,muted:true});assert.equal(s.bindings.reload,'KeyV');assert.equal(s.aimMode,'keyboard');assert.equal(s.hudScale,1.5);assert.equal(s.masterVolume,0);assert.equal(s.musicVolume,1);assert.equal(s.muted,true);});

test('touchpad motion is detected from absolute coordinates even without movement deltas',()=>{const {pointerHasMoved}=require('../src/controls.js');assert.equal(pointerHasMoved({clientX:210,clientY:100,movementX:0,movementY:0},{x:200,y:100}),true);assert.equal(pointerHasMoved({clientX:210,clientY:110},{x:210,y:100}),true);assert.equal(pointerHasMoved({clientX:210,clientY:110},null),true);assert.equal(pointerHasMoved({clientX:210,clientY:110,movementX:0,movementY:0},{x:210,y:110}),false);assert.equal(pointerHasMoved({clientX:NaN,clientY:110},null),false);});

{const settings=normalizeSettings({touchHandedness:'left',touchSize:'large'});assert.equal(settings.touchHandedness,'left');assert.equal(settings.touchSize,'large');const invalid=normalizeSettings({touchHandedness:'invalid',touchSize:'huge'});assert.equal(invalid.touchHandedness,'right');assert.equal(invalid.touchSize,'normal');}
