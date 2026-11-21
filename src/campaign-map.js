import {CAMPAIGN_OPERATIONS,isCampaignOperationUnlocked} from './campaign-operations.js?v=depth-r10';
const NS='http://www.w3.org/2000/svg';
let mapSerial=0;
function svgNode(tag,attributes={},parent){const node=document.createElementNS(NS,tag);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));parent?.append(node);return node;}
/** A hand-built ruined facility atlas. Cloud cover ends the known route without hinting at future content. */
export function createCampaignMap({selected,onSelect,completed=[]}){
 const root=document.createElement('section');root.className='campaign-atlas';root.setAttribute('aria-label','Facility Descent operation map');
 const art=svgNode('svg',{viewBox:'0 0 1200 650',preserveAspectRatio:'none','aria-hidden':'true'},root),id='atlas-'+(++mapSerial);
 const defs=svgNode('defs',{},art),ground=svgNode('linearGradient',{id:id+'-ground',x2:'1',y2:'1'},defs);
 svgNode('stop',{offset:'0%','stop-color':'#30353f'},ground);svgNode('stop',{offset:'100%','stop-color':'#111e1d'},ground);
 const fog=svgNode('radialGradient',{id:id+'-reveal'},defs);svgNode('stop',{offset:'0%','stop-color':'black'},fog);svgNode('stop',{offset:'65%','stop-color':'black','stop-opacity':.9},fog);svgNode('stop',{offset:'100%','stop-color':'black','stop-opacity':0},fog);
 const mask=svgNode('mask',{id:id+'-cloud'},defs);svgNode('rect',{width:1200,height:650,fill:'white'},mask);
 // Soft clearings merge along the known operations; the atlas has no unexplored markers.
 for(const op of CAMPAIGN_OPERATIONS)svgNode('ellipse',{cx:op.x*12,cy:op.y*6.5,rx:235,ry:180,fill:`url(#${id}-reveal)`},mask);
 svgNode('rect',{width:1200,height:650,fill:`url(#${id}-ground)`},art);
 svgNode('path',{d:'M-50 170 C120 250 160 120 290 190 S460 310 500 150 S700 100 740 -60 L730 -80 L-60 -80Z',fill:'#162d2c'},art);
 svgNode('path',{d:'M-20 160 C120 240 180 115 290 190 S460 300 500 150 S700 100 740 -60',fill:'none',stroke:'#4d5463','stroke-width':3,opacity:.45},art);
 const terrain=svgNode('g',{opacity:.55},art);
 for(let i=0;i<95;i++){const x=(i*137+43)%1200,y=(i*97+71)%650;svgNode('ellipse',{cx:x,cy:y,rx:14+(i%4)*7,ry:8+(i%3)*5,fill:i%3?'#21242a':'#393e49'},terrain);}
 const roads=['M-30 525 L220 445 L465 345 L690 265 L1240 90','M260 700 L360 430 L420 180 L450 -30','M600 700 L720 420 L885 140 L1000 -30','M-50 300 L270 350 L570 420 L1250 515'];
 for(const d of roads){svgNode('path',{d,fill:'none',stroke:'#17191e','stroke-width':28},art);svgNode('path',{d,fill:'none',stroke:'#586155','stroke-width':18,opacity:.55},art);svgNode('path',{d,fill:'none',stroke:'#92937a','stroke-width':1,'stroke-dasharray':'12 15',opacity:.45},art);}
 // Roofs, collapsed roof gaps, service yards, and rubble read as an abandoned industrial district.
 const districts=CAMPAIGN_OPERATIONS.map(op=>[op.x*12,op.y*6.5]);
 for(let j=0;j<districts.length;j++){const [cx,cy]=districts[j];const group=svgNode('g',{transform:`translate(${cx} ${cy}) rotate(-20)`},art);
  svgNode('rect',{x:-98,y:-73,width:196,height:146,fill:'#191b20',stroke:'#575c67','stroke-width':2,opacity:.8},group);
  for(let i=0;i<(j<2?9:4);i++){const x=-85+(i%3)*60,y=-60+Math.floor(i/3)*46,w=35+(i%2)*12,h=25+(i%3)*3;
   svgNode('rect',{x:x+6,y:y+9,width:w,height:h,fill:'#0b0c0e',opacity:.75},group);
   svgNode('path',{d:`M${x} ${y}h${w}v${h}l-9 -5 -7 5 -6 -8 -13 8Z`,fill:i%3?'#5a606c':'#474c57',stroke:'#767f90','stroke-width':1},group);
   svgNode('path',{d:`M${x+4} ${y+5}h${w-9}m-10 0v${h-10}`,stroke:'#2a2e36','stroke-width':3,fill:'none'},group);
   for(let k=0;k<3;k++)svgNode('rect',{x:x+w-4+k*5,y:y+h+4+(k%2)*4,width:4,height:3,fill:'#7b7c65',transform:`rotate(${k*18} ${x+w} ${y+h})`},group);
  }
  if(j===1){svgNode('rect',{x:-12,y:-55,width:35,height:95,fill:'#69818a',stroke:'#a7acb7'},group);svgNode('path',{d:'M-28 -65Q7 -95 42 -65L7 -45Z',fill:'#a1a8b6'},group);}
  if(j===2){for(const x of [-55,0,55]){svgNode('path',{d:`M${x-20} -20Q${x} -65 ${x+20} -20V48H${x-20}Z`,fill:'#4f5767',stroke:'#8d96a7','stroke-width':2},group);for(let y=-10;y<45;y+=13)svgNode('path',{d:`M${x-18} ${y}h36`,stroke:'#9da4b3','stroke-width':1},group);}}
  if(j===3){svgNode('rect',{x:-92,y:-65,width:184,height:135,fill:'#1e6264',opacity:.6},group);for(const x of [-50,15,70]){svgNode('ellipse',{cx:x,cy:3,rx:21,ry:39,fill:'#727a8b',stroke:'#abb2bf','stroke-width':2},group);svgNode('ellipse',{cx:x,cy:-12,rx:15,ry:27,fill:'#294b4d'},group);}svgNode('path',{d:'M-85 50H85M-80 -46H82',stroke:'#b2a571','stroke-width':7},group);}
  if(j===4){svgNode('ellipse',{cx:0,cy:0,rx:88,ry:66,fill:'#251d2b',stroke:'#73505e','stroke-width':5},group);for(let i=0;i<12;i++){const x=Math.cos(i*2.4)*55,y=Math.sin(i*2.4)*39;svgNode('ellipse',{cx:x,cy:y,rx:15+(i%3)*4,ry:11,fill:i%3?'#604153':'#b67b62',stroke:'#987063'},group);svgNode('path',{d:`M${x} ${y}Q0 20 ${-x} ${-y}`,fill:'none',stroke:'#7f4b5d','stroke-width':2},group);}}
 }
 svgNode('path',{d:CAMPAIGN_OPERATIONS.map((op,i)=>`${i?'L':'M'}${op.x*12} ${op.y*6.5}`).join(' '),fill:'none',stroke:'#a3abb9','stroke-width':2,'stroke-dasharray':'5 10',opacity:.65},art);
 svgNode('rect',{width:1200,height:650,fill:'#030b10',opacity:.94,mask:`url(#${id}-cloud)`},art);
 // Clouds are texture only: no text, locks, dots, or outlines beneath them.
 const cloud=svgNode('g',{fill:'#0a1418',opacity:.5},art);
 for(let i=0;i<24;i++){const edge=i%2===0,x=(i*181)%1300-50,y=edge?(i%4?25:625):(i*113)%650;if(!edge&&x>120&&x<1080)continue;svgNode('ellipse',{cx:x,cy:y,rx:140+(i%3)*40,ry:55+(i%4)*15},cloud);}
 for(const [index,op] of CAMPAIGN_OPERATIONS.entries()){
  const unlocked=isCampaignOperationUnlocked(op.id,completed);const control=document.createElement('button');control.disabled=!unlocked;control.type='button';control.className='campaign-node'+(selected===op.id?' selected':'')+(completed.includes(op.id)?' completed':'')+(!unlocked?' locked':'');control.style.left=op.x+'%';control.style.top=op.y+'%';control.dataset.focusKey='operation-'+op.id;control.title=!unlocked?`Complete ${CAMPAIGN_OPERATIONS[index-1]?.name??'the previous operation'} to unlock`:completed.includes(op.id)?'Completed · replay available':'Ready to deploy';control.setAttribute('aria-pressed',String(selected===op.id));control.setAttribute('aria-label',`${op.name}${!unlocked?', locked: complete the previous operation':completed.includes(op.id)?', completed':''}`);
  const dot=document.createElement('span');dot.className='campaign-node-dot';dot.textContent=!unlocked?'▣':completed.includes(op.id)?'✓':String(index+1);if(!unlocked){dot.textContent='';const lock=svgNode('svg',{viewBox:'0 0 16 18',width:13,height:15,'aria-hidden':'true'},dot);svgNode('path',{d:'M4 7V5a4 4 0 0 1 8 0v2M3 7h10v9H3z',fill:'none',stroke:'currentColor','stroke-width':2},lock);}
  const label=document.createElement('span');label.className='campaign-node-label';label.textContent=String(index+1).padStart(2,'0')+' · '+op.name;control.append(dot,label);control.onclick=()=>onSelect(op.id);root.append(control);
 }
 const caption=document.createElement('div');caption.className='campaign-map-caption';caption.textContent='NULLDELVE PERIMETER · FIELD RECON';root.append(caption);return root;
}
