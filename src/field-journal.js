import {PUZZLE_PRESETS} from './puzzle-presets.js?v=critic-fixes-r54';
const NS='http://www.w3.org/2000/svg';
const paths={systems:'M5 5h7v7H5zM20 5h7v7h-7zM5 20h7v7H5zM20 20h7v7h-7zM12 8h8M8 12v8M24 12v8M12 24h8',mutations:'M11 12q5-8 10 0v10q-5 7-10 0zM12 8 9 4m11 4 3-4M7 13l-4-3m4 9H2m6 5-4 4m21-15 4-3m-4 9h5m-6 5 4 4',circuit:'M5 8h8v16h14M5 24h8M20 8h7M5 5v6m0 10v6m22-6v6m0-22v6M20 5v6',glyph:'m16 4 12 23H4z',pressure:'M5 9h22v18H5zM9 5h14M10 18h12m-6-6v12',notes:'M7 4h19v24H7zM3 9h7M3 16h7M3 23h7M13 10h7m-7 6h7m-7 6h5'};
export function journalIcon(kind='notes'){const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 32 32');svg.setAttribute('aria-hidden','true');const p=document.createElementNS(NS,'path');p.setAttribute('d',paths[kind]??paths.notes);svg.append(p);return svg;}
export function recordedSystems(discovered=[]){const known=new Set(discovered);return PUZZLE_PRESETS.filter(p=>known.has(p.id));}
const node=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;if(text!==undefined)el.textContent=text;return el;};
const systemIcon=entry=>/glyph|cipher|artifact/.test(entry.id)?'glyph':/pressure|weight|load/.test(entry.id)?'pressure':'circuit';
/** Read-only encountered archive. Controllers are fresh reference copies, never live game state. */
export function renderFieldJournal(host,{tab='systems',systems=[],mutations=[],selected=null,onSelect=()=>{}}={}){
 const entries=tab==='mutations'?mutations:recordedSystems(systems),entry=entries.find(e=>e.id===selected)??entries[0];
 const root=node('section','field-journal');root.setAttribute('aria-label',tab==='systems'?'Recorded systems':'Encountered mutations');host.append(root);
 if(!entry){const empty=node('div','journal-empty');empty.append(journalIcon(tab),node('h3','',tab==='systems'?'Nothing recorded yet':'No mutations recorded'),node('p','','Discoveries appear here as you explore.'));root.append(empty);return;}
 const roster=node('nav','journal-roster');roster.setAttribute('aria-label',tab==='systems'?'Choose a system':'Choose a mutation');
 for(const item of entries){const button=node('button','journal-entry'+(item.id===entry.id?' selected':''));button.type='button';button.setAttribute('aria-pressed',String(item.id===entry.id));button.setAttribute('aria-label','Inspect '+item.name);button.dataset.focusKey='journal-'+item.id;const icon=tab==='systems'?journalIcon(systemIcon(item)):node('img','');if(tab==='mutations'){icon.src=`assets/mutation-${item.id}.svg`;icon.alt='';}const text=node('span','journal-entry-copy');text.append(node('strong','',item.name));button.append(icon,text);button.onclick=()=>onSelect(item.id);roster.append(button);}root.append(roster);
 const detail=node('article','journal-detail');detail.setAttribute('aria-label','Selected field note');detail.setAttribute('tabindex','-1');const header=node('div','journal-detail-heading'),symbol=tab==='systems'?journalIcon(systemIcon(entry)):node('img','journal-creature');if(tab==='mutations'){symbol.src=`assets/mutation-${entry.id}.svg`;symbol.alt=entry.name;}const title=node('div','');title.append(node('h3','',entry.name));header.append(symbol,title);detail.append(header);
 if(tab==='mutations'){const portrait=node('div','journal-specimen'),image=node('img','');image.src=`assets/mutation-${entry.id}.svg`;image.alt='';portrait.append(image);detail.append(portrait);const warning=node('div','journal-warning');warning.setAttribute('aria-label','Warning');warning.append(node('strong','',entry.warning));detail.append(warning,node('p','journal-counter',entry.counter));}
 else{detail.append(node('p','journal-reference','Recorded system'));}

 root.append(detail);
}
