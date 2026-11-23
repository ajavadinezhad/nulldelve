const NS='http://www.w3.org/2000/svg';
/** Shared diagram language: graphite structure, amber state, blue live readings. */
export const DIAGRAM_COLORS=Object.freeze({surface:'#151b24',raised:'#252f3d',border:'#526174',muted:'#9cabbc',accent:'#efba62',activeFill:'#3f3424',blue:'#79b9ef',text:'#e4e9ef'});
export function normalizeLabSetup(value={}){const number=(n,max)=>Math.min(max,Math.max(0,Math.floor(Number(n)||0)));return {seed:number(value.seed,2147483647),variant:number(value.variant,999),difficulty:['easy','normal','hard'].includes(value.difficulty)?value.difficulty:'normal'};}
export function puzzleMatchesFilter(preset,query='',mechanic='all'){const text=[preset.id,preset.name,preset.mechanic,preset.gamefit,preset.description].filter(Boolean).join(' ').toLowerCase();return (!query.trim()||text.includes(query.trim().toLowerCase()))&&(mechanic==='all'||String(preset.mechanic??'Other')===mechanic);}
export function actionKey(control){return String(control.action)+':'+JSON.stringify(control.payload??null);}
export function buildPresetExport(preset,setup,controller){return {format:'nulldelve.puzzle-preset.v1',preset:preset.id,name:preset.name,...normalizeLabSetup(setup),controller:controller.serialize()};}
function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=String(text);return el;}
function svg(tag,attrs={},parent){const el=document.createElementNS(NS,tag);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,String(value));parent?.append(el);return el;}
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
function textValue(value){return Array.isArray(value)?value.join(' · '):value&&typeof value==='object'?JSON.stringify(value):String(value??'');}
function graphBoard(board,controls,activate){
 const root=svg('svg',{viewBox:'0 0 600 330',class:'board-svg',role:'group','aria-label':board.label??'Circuit state'}),nodes=board.nodes??[],byId=new Map(nodes.map(n=>[String(n.id),n]));
 const position=n=>({x:35+clamp(n.x,0,100)*5.3,y:28+clamp(n.y,0,100)*2.5});
 const edgeLayer=svg('g',{},root);
 for(const edge of board.edges??[]){const from=byId.get(String(edge.from??edge.a)),to=byId.get(String(edge.to??edge.b));if(!from||!to)continue;const a=position(from),b=position(to),attrs={x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:edge.active?DIAGRAM_COLORS.accent:DIAGRAM_COLORS.border,'stroke-width':edge.active?5:3,opacity:edge.active?1:.65};const line=svg('line',attrs,edgeLayer);attachBoardControl(line,edge,controls,activate);if(edge.label)svg('text',{x:(a.x+b.x)/2,y:(a.y+b.y)/2-9,'text-anchor':'middle'},edgeLayer).textContent=textValue(edge.label);}
 for(const n of nodes){const p=position(n),g=svg('g',{'data-node':n.id},root);svg('circle',{cx:p.x,cy:p.y,r:21,fill:n.active?DIAGRAM_COLORS.activeFill:DIAGRAM_COLORS.surface,stroke:n.active?DIAGRAM_COLORS.accent:DIAGRAM_COLORS.border,'stroke-width':2},g);svg('text',{x:p.x,y:p.y+4,'text-anchor':'middle'},g).textContent=textValue(n.symbol??n.value??n.id);if(n.label&&n.label!==n.value)svg('text',{x:p.x,y:p.y+39,'text-anchor':'middle','font-size':11},g).textContent=textValue(n.label);attachBoardControl(g,n,controls,activate);}
 return root;
}
function attachBoardControl(element,item,controls,activate){if(typeof activate!=='function')return;const index=Number.isInteger(item.controlIndex)?item.controlIndex:-1,control=index>=0?controls[index]:item.action?{action:item.action,payload:item.payload,label:item.label,disabled:item.disabled}:null;if(!control||control.disabled)return;element.setAttribute('tabindex','0');element.setAttribute('role','button');element.setAttribute('aria-label',control.label??String(control.action));element.setAttribute('data-control-key',actionKey(control));element.setAttribute('class','board-control');element.addEventListener('click',()=>activate(control));element.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate(control);}});}
function mirrorBoard(board,controls,activate){
 const rows=Math.max(1,Number(board.rows)||3),cols=Math.max(1,Number(board.cols)||4),step=Math.min(110,470/cols),left=(600-cols*step)/2,top=20,height=rows*step+40,root=svg('svg',{viewBox:`0 0 600 ${height}`,class:'board-svg',role:'group','aria-label':'Mirror grid and actual beam path'});
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)svg('rect',{x:left+col*step+2,y:top+row*step+2,width:step-4,height:step-4,fill:DIAGRAM_COLORS.surface,stroke:DIAGRAM_COLORS.border},root);
 const path=board.path??[];if(path.length>1)svg('polyline',{points:path.map(cell=>`${left+(Number(cell.col)+.5)*step},${top+(Number(cell.row)+.5)*step}`).join(' '),fill:'none',stroke:DIAGRAM_COLORS.accent,'stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round'},root);
 for(const cell of board.cells??[]){const x=left+(Number(cell.col)+.5)*step,y=top+(Number(cell.row)+.5)*step,g=svg('g',{},root),label=cell.label??(cell.kind==='emitter'?'●':cell.kind==='receiver'?'◎':cell.kind==='mirror'?(Number(cell.rotation)%2?'╲':'╱'):'');
  if(cell.kind==='receiver')svg('circle',{cx:x,cy:y,r:step*.22,fill:cell.active?DIAGRAM_COLORS.activeFill:DIAGRAM_COLORS.surface,stroke:cell.active?DIAGRAM_COLORS.accent:DIAGRAM_COLORS.border,'stroke-width':3},g);
  svg('text',{x,y:y+9,'text-anchor':'middle',style:`font-size:${cell.kind==='mirror'?36:24}px;fill:${cell.active?DIAGRAM_COLORS.text:DIAGRAM_COLORS.muted}`},g).textContent=textValue(label);attachBoardControl(g,cell,controls,activate);
 }return root;
}
function gridBoard(board,controls,activate){const rows=Math.max(1,Number(board.rows)||1),cols=Math.max(1,Number(board.cols)||Math.ceil(Math.sqrt(board.cells?.length??1))),root=node('div','board-grid');root.style.gridTemplateColumns=`repeat(${cols},minmax(0,1fr))`;root.setAttribute('role','group');root.setAttribute('aria-label',board.label??'Puzzle grid');const cells=new Map((board.cells??[]).map((c,index)=>[(c.row??Math.floor(index/cols))+','+(c.col??index%cols),c]));for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const data=cells.get(r+','+c)??{},el=node('div','board-cell'+(data.active?' active':'')+(data.blocked?' blocked':'')+(data.target?' target':''),textValue(data.label??data.value??''));if(Number.isFinite(data.rotation))el.style.setProperty('--rotation',data.rotation+'deg');const control=Number.isInteger(data.controlIndex)?controls[data.controlIndex]:data.action?{action:data.action,payload:data.payload,label:data.label}:null;if(control&&typeof activate==='function'){const button=node('button');button.type='button';button.disabled=!!control.disabled;button.dataset.controlKey=actionKey(control);button.setAttribute('aria-label',control.label??`Grid ${r+1}, ${c+1}`);button.addEventListener('click',()=>activate(control));el.append(button);}root.append(el);}return root;}
function gaugeBoard(board,controls,activate){
 const gauges=board.nodes??board.gauges??[],root=svg('svg',{viewBox:'0 0 600 285',class:'board-svg',role:'group','aria-label':'Live instrument gauges'}),width=Math.min(160,500/Math.max(1,gauges.length)),left=(600-width*gauges.length)/2;
 gauges.forEach((g,index)=>{const min=Number(g.min)||0,max=Number(g.max)||100,value=Number(g.value)||0,ratio=clamp((value-min)/(max-min||1),0,1),x=left+index*width+width*.3,w=width*.4,group=svg('g',{},root);svg('rect',{x,y:28,width:w,height:170,rx:3,fill:DIAGRAM_COLORS.surface,stroke:DIAGRAM_COLORS.border,'stroke-width':2},group);svg('rect',{x:x+5,y:193-ratio*160,width:Math.max(4,w-10),height:ratio*160,fill:g.active?DIAGRAM_COLORS.accent:DIAGRAM_COLORS.blue},group);for(let tick=0;tick<=4;tick++)svg('line',{x1:x+w+3,y1:198-tick*42.5,x2:x+w+10,y2:198-tick*42.5,stroke:DIAGRAM_COLORS.muted},group);
  if(Number.isFinite(g.target)){const y=198-clamp((g.target-min)/(max-min||1),0,1)*170;svg('line',{x1:x-10,y1:y,x2:x+w+10,y2:y,stroke:DIAGRAM_COLORS.accent,'stroke-width':3},group);svg('text',{x:x+w+16,y:y+4,'font-size':10},group).textContent=String(g.target);}
  svg('text',{x:x+w/2,y:224,'text-anchor':'middle',style:'font-size:19px'},group).textContent=String(value);svg('text',{x:x+w/2,y:248,'text-anchor':'middle','font-size':11},group).textContent=textValue(g.label??g.id);attachBoardControl(group,g,controls,activate);
 });return root;
}
function balanceBoard(board,controls,activate){
 const root=svg('svg',{viewBox:'0 0 600 315',class:'board-svg',role:'group','aria-label':'Assigned loads and circuit ratings'}),nodes=board.nodes??[],byId=new Map(nodes.map(n=>[String(n.id),n])),position=n=>({x:40+clamp(n.x,0,100)*5.2,y:20+clamp(n.y,0,100)*2.65});
 for(const edge of board.edges??[]){const from=byId.get(String(edge.from)),to=byId.get(String(edge.to));if(!from||!to)continue;const a=position(from),b=position(to);svg('line',{x1:a.x,y1:a.y+18,x2:b.x,y2:b.y-30,stroke:edge.active?DIAGRAM_COLORS.accent:DIAGRAM_COLORS.border,'stroke-width':3},root);}
 for(const n of nodes){const p=position(n),g=svg('g',{},root),isTray=Number.isFinite(n.max),w=isTray?140:82,h=isTray?64:58;
 svg('rect',{x:p.x-w/2+3,y:p.y-h/2+5,width:w,height:h,rx:3,fill:'#080b0e',opacity:.7},g);
 svg('rect',{x:p.x-w/2,y:p.y-h/2,width:w,height:h,rx:3,fill:isTray?'#333c43':'#716049',stroke:n.active?DIAGRAM_COLORS.accent:'#9b8b70','stroke-width':2},g);
 if(isTray){const ratio=clamp(Number(n.value)/(n.max||1),0,1);for(const side of [-1,1])for(let k=0;k<4;k++)svg('line',{x1:p.x+side*61-4,y1:p.y-22+k*10,x2:p.x+side*61+4,y2:p.y-16+k*10,stroke:DIAGRAM_COLORS.accent,'stroke-width':3},g);svg('rect',{x:p.x-49,y:p.y+15,width:98,height:7,fill:'#11171b'},g);svg('rect',{x:p.x-49,y:p.y+15,width:98*ratio,height:7,fill:DIAGRAM_COLORS.accent},g);
 }else{for(const offset of [-24,24])svg('rect',{x:p.x+offset-3,y:p.y-h/2,width:6,height:h,fill:'#302e2a'},g);svg('rect',{x:p.x-14,y:p.y-12,width:28,height:24,fill:'#d2c4a2',stroke:'#493e2b'},g);svg('text',{x:p.x,y:p.y+5,'text-anchor':'middle',style:'font-size:13px;fill:#30291f;font-weight:bold'},g).textContent=String(n.label??'').split(' ')[0];}
 svg('text',{x:p.x,y:isTray?p.y+3:p.y+46,'text-anchor':'middle',style:'font-size:10px;fill:#ddd8c9'},g).textContent=textValue(n.label);attachBoardControl(g,n,controls,activate);}return root;
}
function timingBoard(board,controls,activate){
 const root=svg('svg',{viewBox:'0 0 600 300',class:'board-svg',role:'group','aria-label':'Live timing windows'}),gates=(board.nodes??[]).filter(n=>Number.isFinite(n.max)&&Number.isFinite(n.target));
 if(gates.length){gates.forEach((gate,index)=>{const period=Number(gate.max)+1,value=Number(gate.value)||0,left=95,step=420/period,y=35+index*62;svg('text',{x:18,y:y+23,'font-size':11},root).textContent=textValue(gate.id);for(let tick=0;tick<period;tick++){const open=tick===Number(gate.target),current=tick===value;svg('rect',{x:left+tick*step+2,y,width:step-4,height:38,fill:open?DIAGRAM_COLORS.activeFill:DIAGRAM_COLORS.surface,stroke:current?DIAGRAM_COLORS.blue:open?DIAGRAM_COLORS.accent:DIAGRAM_COLORS.border,'stroke-width':current?3:1},root);svg('text',{x:left+(tick+.5)*step,y:y+24,'text-anchor':'middle'},root).textContent=String(tick);}});
 }else if(Number.isFinite(board.remaining)&&Number.isFinite(board.period)){const ratio=clamp(board.remaining/(board.period||1),0,1);svg('rect',{x:70,y:32,width:460,height:40,fill:DIAGRAM_COLORS.surface,stroke:DIAGRAM_COLORS.border},root);svg('rect',{x:75,y:37,width:450*ratio,height:30,fill:DIAGRAM_COLORS.blue},root);svg('text',{x:300,y:98,'text-anchor':'middle'},root).textContent=`Stored charge ${board.remaining}s / ${board.period}s`;}
 const nodes=(board.nodes??[]).filter(n=>!gates.includes(n));for(const n of nodes){const x=45+clamp(n.x,0,100)*5.1,y=210,g=svg('g',{},root);svg('rect',{x:x-47,y:y-21,width:94,height:42,fill:n.active?DIAGRAM_COLORS.activeFill:DIAGRAM_COLORS.surface,stroke:n.active?DIAGRAM_COLORS.accent:DIAGRAM_COLORS.border,'stroke-width':2},g);svg('text',{x,y:y+4,'text-anchor':'middle','font-size':10},g).textContent=textValue(n.label);attachBoardControl(g,n,controls,activate);}return root;
}
function instrumentBoard(board,readouts,controls,activate){
 if(board.nodes?.length)return graphBoard(board,controls,activate);if(board.cells?.length)return gridBoard(board,controls,activate);
 const root=svg('svg',{viewBox:'0 0 600 250',class:'board-svg',role:'img','aria-label':board.label??'Live puzzle readings'}),values=board.gauges??board.channels??readouts;
 const list=Array.isArray(values)?values:Object.entries(values??{}).map(([label,value])=>({label,value})),width=Math.min(110,500/Math.max(1,list.length)),left=(600-width*list.length)/2;
 list.forEach((g,index)=>{const raw=String(g.value??''),match=raw.match(/(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)/),numeric=parseFloat(raw),max=Number(g.max??match?.[2]??100),value=Number(g.current??match?.[1]??(Number.isFinite(numeric)?numeric:0)),ratio=clamp(value/(max||100),0,1),x=left+index*width+width*.25,w=width*.5;
  svg('rect',{x,y:35,width:w,height:140,fill:DIAGRAM_COLORS.surface,stroke:DIAGRAM_COLORS.border},root);if(g.max!==undefined||match||raw.includes('%'))svg('rect',{x:x+4,y:171-ratio*132,width:Math.max(4,w-8),height:ratio*132,fill:g.active?DIAGRAM_COLORS.accent:DIAGRAM_COLORS.blue},root);svg('text',{x:x+w/2,y:199,'text-anchor':'middle'},root).textContent=raw;svg('text',{x:x+w/2,y:221,'text-anchor':'middle','font-size':10},root).textContent=textValue(g.label??g.id??index+1);
 });return root;
}
export function renderPuzzleBoard(host,view,activate){host.replaceChildren();const board=view.board;if(!board){host.hidden=true;return;}host.hidden=false;const controls=view.controls??[];if(board.type==='gauges')host.append(gaugeBoard(board,controls,activate));else if(board.type==='balance')host.append(balanceBoard(board,controls,activate));else if(board.type==='timing')host.append(timingBoard(board,controls,activate));else if(board.type==='mirrors')host.append(mirrorBoard(board,controls,activate));else if(board.type==='wires'||board.type==='graph')host.append(graphBoard(board,controls,activate));else if(board.type==='grid')host.append(gridBoard(board,controls,activate));else host.append(instrumentBoard(board,view.readouts??[],controls,activate));if(board.legend){const legend=node('p','board-legend',Array.isArray(board.legend)?board.legend.join(' · '):board.legend);host.append(legend);}}
/** Player-facing notes describe the mechanism, not a seeded controller or target. */
export function referencePuzzleView(preset={}){
 const mechanic=String(preset.mechanic??''),kind=/glyph|cipher|sequence|memory/i.test(mechanic)?'Input':/inventory|assembly|artifact/i.test(mechanic)?'Component':'Control';
 return {controls:[],board:{type:'graph',label:'Mechanism reference; no solution or live settings',nodes:[{id:'control',x:24,y:50,symbol:'◇',label:kind},{id:'indicator',x:76,y:50,symbol:'○',label:'Status'}],edges:[]}};
}
export function referencePuzzleHint(preset={},level=1){
 const index=Number.isFinite(level)?Math.max(0,Math.min(2,Math.floor(level)-1)):0,mechanic=String(preset.mechanic??'');
 const clues=/glyph|cipher|sequence|memory/i.test(mechanic)?['Observe the result of one input.','Notice whether an attempt advances or resets the mechanism.','Use the surrounding clues to form and test your own hypothesis. No input order is recorded here.']:
 /wire|network|routing|mirror/i.test(mechanic)?['Inspect the physical connections.','Compare the current connections with the result of your changes.','Trace a possible route yourself, then test the complete system. No target route is recorded here.']:
 /pressure|balance|weight|load|temperature|thermal/i.test(mechanic)?['Observe the current instrument readings.','Change one condition and compare the response.','Test a configuration using the local evidence. No required settings are recorded here.']:
 /timing|relay|capacitor/i.test(mechanic)?['Observe which state changes over time.','Scout the mechanism before beginning a timed attempt.','Compare when the system accepts or rejects an action. No timed input sequence is recorded here.']:
 ['Inspect the components and their current state.','Try one change and observe the shared status indicator.','Use local evidence to test a different hypothesis. No solution is recorded here.'];
 return clues[index];
}
async function startWorkshop(){
 if(new URLSearchParams(location.search).has('embedded'))document.body.classList.add('embedded-journal');
 const $=id=>document.getElementById(id),{PUZZLE_PRESETS:allPresets}=await import('./puzzle-presets.js?v=progression-balance-r46'),{createPuzzleDiscovery}=await import('./puzzle-discovery.js?v=progression-balance-r46');
 const discovered=new Set(createPuzzleDiscovery().list()),presets=allPresets.filter(p=>discovered.has(p.id));
 for(const id of ['setup-form','solution-details','puzzle-controls','puzzle-readouts','puzzle-state','puzzle-feedback','reset-puzzle','export-setup']){const element=$(id);if(element)element.hidden=true;}
 if(!presets.length){$('catalog-count').textContent='Field notes';$('filter-count').textContent='';$('puzzle-title').textContent='No systems recorded';$('puzzle-objective').textContent='Discover systems while exploring.';document.body.classList.add('empty-journal');return;}
 let selected=presets[0],hintLevel=0;
 $('catalog-count').textContent=presets.length+' encountered '+(presets.length===1?'system':'systems');
 for(const mechanic of [...new Set(presets.map(p=>String(p.mechanic??'Other')))]){const option=node('option','',mechanic);option.value=mechanic;$('puzzle-filter').append(option);}
 const hintButton=document.querySelector('[data-hint="1"]');for(const button of document.querySelectorAll('[data-hint]'))button.hidden=button!==hintButton;
 function render(){
  $('puzzle-title').textContent=selected.name;$('puzzle-mechanic').textContent=selected.mechanic??'';$('puzzle-objective').textContent='Reference only';$('puzzle-instructions').textContent='';
  renderPuzzleBoard($('puzzle-board'),referencePuzzleView(selected),null);
  $('puzzle-hint').hidden=!hintLevel;$('clear-hint').hidden=!hintLevel;
  if(hintLevel)$('puzzle-hint').textContent=referencePuzzleHint(selected,hintLevel);
  hintButton.textContent=hintLevel===0?'Need a clue?':hintLevel<3?'Another clue':'Repeat clue';
 }
 function renderLibrary(){
  const list=$('preset-list'),old=list.scrollTop,left=list.scrollLeft;list.replaceChildren();const matches=presets.filter(p=>puzzleMatchesFilter(p,$('puzzle-search').value,$('puzzle-filter').value));$('filter-count').textContent=matches.length+' shown';
  for(const preset of matches){const button=node('button','preset-card'+(preset.id===selected.id?' selected':''));button.type='button';button.dataset.preset=preset.id;button.setAttribute('aria-pressed',String(preset.id===selected.id));button.append(node('span','preset-number','◇'),node('strong','',preset.name),node('small','',preset.mechanic??''));button.addEventListener('click',()=>{selected=preset;hintLevel=0;renderLibrary();render();});list.append(button);}
  if(!matches.length)list.append(node('p','objective','No matching systems.'));list.scrollTop=old;list.scrollLeft=left;
 }
 $('puzzle-search').addEventListener('input',renderLibrary);$('puzzle-filter').addEventListener('change',renderLibrary);
 hintButton.addEventListener('click',()=>{hintLevel=Math.min(3,hintLevel+1);render();});$('clear-hint').addEventListener('click',()=>{hintLevel=0;render();});renderLibrary();render();
}
if(typeof document!=='undefined'&&document.getElementById?.('preset-list'))startWorkshop().catch(error=>{const host=document.getElementById('startup-error');if(host){host.hidden=false;host.textContent='The puzzle workshop could not load. '+(error?.message??'Please reload and try again.');}});
