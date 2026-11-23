const {test}=require('node:test'),assert=require('node:assert/strict');
const {recordedSystems,renderFieldJournal}=require('../src/field-journal.js');
class Node{constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.style={setProperty(){}};this.dataset={};this.textContent='';}append(...nodes){this.children.push(...nodes);}setAttribute(k,v){this.attrs[k]=v;}replaceChildren(...nodes){this.children=nodes;}}
const all=root=>[root,...root.children.flatMap(all)];
function render(options){const old=global.document;global.document={createElement:tag=>new Node(tag),createElementNS:(ns,tag)=>new Node(tag)};const host=new Node('main');try{renderFieldJournal(host,options);return host;}finally{global.document=old;}}
test('journal exposes only recorded systems, with stable catalog order',()=>{assert.deepEqual(recordedSystems(['glyph-cipher','invalid']).map(p=>p.id),['glyph-cipher']);assert.equal(recordedSystems().length,0);});
test('system diagrams are read-only, without solve or state-changing controls',()=>{const selected=[],host=render({systems:['glyph-cipher'],onSelect:id=>selected.push(id)}),nodes=all(host),buttons=nodes.filter(n=>n.tag==='button');assert.deepEqual(buttons.map(n=>n.textContent),['','Need a clue?']);assert.ok(!nodes.some(n=>n.attrs.role==='button'));buttons[0].onclick();assert.deepEqual(selected,['glyph-cipher']);assert.ok(nodes.some(n=>n.attrs['aria-label']==='Reference diagram, not live puzzle state'));});
test('empty journal and mutations avoid undiscovered placeholders and puzzle hints',()=>{assert.ok(all(render({systems:[]})).some(n=>n.textContent==='Nothing recorded yet'));const notes=[{id:'runner',name:'Runner',warning:'Fast approach',counter:'Keep space.'}],nodes=all(render({tab:'mutations',mutations:notes}));assert.ok(nodes.some(n=>n.textContent==='Keep space.'));assert.equal(nodes.filter(n=>n.tag==='button').length,1);});

test('every recorded mutation has a real journal illustration',()=>{const fs=require('node:fs'),{MUTATION_NOTES}=require('../src/mutation-notes.js');for(const note of MUTATION_NOTES)assert.ok(fs.existsSync('assets/mutation-'+note.id+'.svg'),note.id);});

test('reference clues stay bounded without a solution reveal',()=>{
 for(const [hintLevel,label] of [[0,'Need a clue?'],[1,'Another clue'],[2,'Another clue'],[3,'Repeat clue'],[100,'Repeat clue'],[NaN,'Need a clue?']]){
  const nodes=all(render({systems:['glyph-cipher'],hintLevel}));assert.equal(nodes.filter(n=>n.tag==='button').at(-1).textContent,label);
  if(Number.isFinite(hintLevel)&&hintLevel>0)assert.ok(nodes.some(n=>n.attrs['aria-label']==='Mechanism clue; no solution or live settings'));
 }
});

test('recorded notes never render seeded answers, target values, or solution orders',()=>{
 const presets=recordedSystems(['glyph-cipher','wire-network','hospital-pressure','freight-routing']);assert.equal(presets.length,4);
 for(const preset of presets){for(const hintLevel of [0,1,2,3]){const nodes=all(render({systems:[preset.id],hintLevel}));const text=nodes.map(n=>n.textContent).join(' ');assert.doesNotMatch(text,/Triangle.*Circle.*Square|target [0-9]|Track A.*Divert|A → B|A, then B/);assert.ok(!nodes.some(n=>n.attrs.role==='button'));}}
});
