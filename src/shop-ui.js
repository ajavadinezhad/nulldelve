import {weaponThumbnail} from './weapon-preview.js?v=campaign-pacing-r53';
import {createItemIcon} from './item-icons.js?v=campaign-pacing-r53';
import {formatKey} from './controls.js?v=campaign-pacing-r53';
const SVG_NS='http://www.w3.org/2000/svg';
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
const integer=value=>Number.isFinite(Number(value))?Math.max(0,Math.floor(Number(value))):0;
function icon(type){
 if(type==='carbine')type='rifle';
 const wrapper=element('span','shop-icon');wrapper.setAttribute('aria-hidden','true');
 if(type==='medkit'||type==='grenade'||type==='fireGrenade'){wrapper.append(createItemIcon(type));return wrapper;}
 const svg=document.createElementNS(SVG_NS,'svg');svg.setAttribute('viewBox','0 0 72 48');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','2.5');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('stroke-linecap','round');
 const paths={
  weapons:['M11 6v36M61 6v36M11 40h50','M17 11h33v6H33l-5 8h-8l4-10h-7z','M19 29h37v5H40l-5 7H24l4-8h-9z'],
  rifle:['M8 26h16v-8h27v5h14v4H48v6H26l-7 8h-7l4-12H8z','M32 32v10h8l3-10M29 18v-5h12v5M51 22v6M58 22v6'],
  smg:['M10 19h40v6h12v5H32l-6 12H15l4-14h-9z','M34 30v12h9V30M24 19v-7h15v7M50 23h13'],
  marksman:['M5 23h52v5H29l-8 12H9l6-14H5z','M45 18h22v5M25 12h21v6H25zM22 11v8M47 10v9M31 18v5M41 18v5'],
  lmg:['M7 16h39v9H25l-7 14H6l6-18H7z','M46 19h22M27 25h20v17H27zM31 29v9M38 29v9M53 23l-5 17M56 23l7 17M24 11h15v5'],
  hush:['M8 24h43v6H30l-8 11H11l5-13H8z','M48 21h20v10H48zM27 13h18v7H27zM33 30v10h8V30'],
  scattergun:['M7 18h39v11H29l-9 12H8l7-16H7z','M46 18h21v5H46M46 26h21v5H46M29 31a8 8 0 1 0 16 0 8 8 0 1 0-16 0'],
  kestrel:['M8 20h42v9H29l-7 12H11l5-16H8z','M50 21h17v5H50M38 29v12h10V29M21 14h20v6M6 20V10h15v10'],
  jackal:['M8 20h44v10H29L20 41H9l6-15H8z','M52 18h14v13H52M28 11h20v9M28 30v9h11v-9'],
  vesper:['M5 22h50v7H28l-8 12H9l6-15H5z','M55 23h14M27 12h20v7H27M30 29v13h8V29M43 19v4'],
  lancet:['M4 24h42v6H27l-8 11H8l5-14H4z','M46 23h23v6H46M27 11h19v7H27zM31 30v10h7V30M52 20v12M60 20v12'],
  orison:['M7 21h43v9H29l-8 11H10l6-15H7z','M50 22h17v6H50M23 12h27v6H23M29 30v11h9V30M28 12v6M35 12v6M42 12v6'],
  mantis:['M4 24h41v6H26l-8 11H7l5-14H4z','M45 23h23v6H45M28 10h21v8H28zM25 9v11M50 8v12M53 30l-5 11M57 30l8 11M29 30v9h8v-9'],
  shotgun:['M5 20h48v7H29l-8 13H8l7-16H5z','M30 14h34v6M30 23h23M27 29h20'],
  pistol:['M14 12h43v12H34l-5 17H17l5-20h-8z','M34 24v9h10l4-9M21 17h31'],
  gear:['M13 14h46v28H13zM25 14V7h22v7','M32 20h8v6h6v8h-6v6h-8v-6h-6v-8h6z'],
  damage:['M36 7a17 17 0 1 0 0 34 17 17 0 1 0 0-34','M36 3v12M36 33v12M15 24h12M45 24h12','M36 20v8M32 24h8'],
  magazine:['M24 5h24v32l-5 7H24z','M24 13h24M30 19v16M36 19v16M42 19v16'],
  reload:['M52 17a18 18 0 1 0 1 13','M52 6v12H40','M36 14v11l7 5'],
  armor:['M36 4l18 7v12c0 10-8 17-18 21-10-4-18-11-18-21V11z','M27 24l6 6 13-14']
 };
 for(const d of paths[type]??paths.gear){const path=document.createElementNS(SVG_NS,'path');path.setAttribute('d',d);svg.append(path);}wrapper.append(svg);return wrapper;
}
const TITLES={damage:'Damage',magazine:'Magazine',reload:'Reload',medkit:'Medkit',grenade:'Frag grenade',fireGrenade:'Fire grenade',armor:'Armor'};
const EFFECTS={damage:'+1 damage / shot',magazine:'+6 rounds',reload:'−0.18s · 0.5s minimum',medkit:'+50 health',grenade:'Blast area',fireGrenade:'Burn area',armor:'+40 armor · 60 maximum'};
const SUPPLIES=new Set(['medkit','grenade','fireGrenade','armor']);
function purchaseButton(offer,onPurchase,{label,name,maxed=false,full=false}={}){
 const cost=integer(offer.cost),button=element('button','shop-buy menu-button primary',maxed?'Maxed':full?'Full':label??`$${cost.toLocaleString()}`);button.type='button';button.disabled=maxed||full||offer.available===false;if(!maxed&&!full&&(label===undefined||String(label).startsWith('$'))){const cash=element('img','cash-icon');cash.src='./assets/cash.svg';cash.alt='';cash.setAttribute('aria-hidden','true');button.append(cash);}
 button.setAttribute('data-offer-id',String(offer.id));button.setAttribute('aria-label',maxed?`${name??offer.label}, maximum level`:full?`${name??offer.label}, full`:`${name??offer.label} for $${cost} cash`);button.title=maxed?'Fully upgraded':full?'At capacity':name??offer.label??'';button.addEventListener('click',()=>onPurchase(offer.id));return button;
}
/** Browse without equipping; only the equipped weapon exposes upgrade actions. */
export function renderShop(target,armory,onPurchase,{group:selectedGroup='weapons',onGroupChange=()=>{},selectedWeapon=null,onWeaponSelect=()=>{},detailTab='upgrades',onDetailTab=()=>{}}={}){
 if(!armory){target.append(element('p','shop-status','Armory unavailable.'));return;}
 selectedGroup=['gear','skills'].includes(selectedGroup)?selectedGroup:'weapons';const credits=integer(armory.credits),header=element('div','shop-toolbar'),balance=element('div','shop-balance');balance.setAttribute('aria-label',`$${credits} cash available`);const cash=element('img','cash-icon');cash.src='./assets/cash.svg';cash.alt='';balance.append(cash,element('strong','',`$${credits.toLocaleString()}`));
 const tabs=element('div','menu-tabs shop-tabs');tabs.setAttribute('aria-label','Armory categories');for(const [id,title]of [['weapons','Weapons'],['gear','Supplies'],['skills','Skills']]){const tab=element('button','menu-button secondary'+(selectedGroup===id?' selected':''));tab.type='button';tab.append(icon(id==='skills'?'armor':id),element('span','',title));tab.dataset.focusKey='shop-'+id;tab.setAttribute('aria-pressed',String(selectedGroup===id));tab.addEventListener('click',()=>onGroupChange(id));tabs.append(tab);}header.append(tabs,balance);target.append(header);
 const offers=Array.isArray(armory.offers)?armory.offers:[];if(selectedGroup==='skills')return;if(selectedGroup==='gear'){renderSupplies(target,armory,offers,onPurchase);return;}
 const guns=[...(armory.weapons??[]),{weaponId:'pistol',label:'P9 Sidearm',owned:true,stats:armory.sidearm?.stats??{}}];const gunId=g=>g.weaponId??String(g.id).replace(/^weapon\./,'');const selected=guns.find(g=>gunId(g)===selectedWeapon)??guns.find(g=>gunId(g)===armory.primary)??guns[0];if(!selected){target.append(element('p','shop-status','No weapons available.'));return;}
 const layout=element('div','armory-workbench'),list=element('nav','armory-roster');list.setAttribute('aria-label','Weapon selection');list.dataset.scrollKey='weapon-roster';
 for(const gun of guns){const id=gunId(gun),name=String(gun.name??gun.label??id),equipped=id==='pistol'||id===armory.primary;const row=element('button','roster-weapon'+(id===gunId(selected)?' selected':''));row.type='button';row.dataset.focusKey='browse-'+id;row.setAttribute('data-weapon-id',id);row.setAttribute('aria-label',`Inspect ${name}`);row.setAttribute('aria-pressed',String(id===gunId(selected)));const copy=element('span','roster-copy');copy.append(element('strong','',name),element('small','',equipped?'Equipped':gun.owned?'Owned':gun.locked?'Locked':`$${integer(gun.cost)}`));row.append(icon(id),copy);row.addEventListener('click',()=>onWeaponSelect(id));list.append(row);}
 const detail=element('section','armory-detail');detail.setAttribute('aria-label','Selected weapon');const id=gunId(selected),name=String(selected.name??selected.label??id),owned=!!selected.owned,equipped=id==='pistol'||id===armory.primary;
 const title=element('div','armory-detail-heading');title.append(element('h3','',name));const ownership=element('span','weapon-ownership'+(equipped?' equipped-label':''),equipped?'Equipped':owned?'Owned':selected.locked?'Locked':'Available');title.append(ownership);detail.append(title);
 const preview=element('div','armory-weapon-preview');try{const img=element('img');img.src=weaponThumbnail(id);img.alt=name+' weapon model';preview.append(img);}catch{preview.append(icon(id));}detail.append(preview,weaponStats(selected.stats??{}));
 if(!equipped){const cost=integer(selected.cost),control=purchaseButton({id:(owned?'equip.':'weapon.')+id,cost,available:!selected.locked&&(owned||credits>=cost)},onPurchase,{label:owned?'Equip':`Buy · $${cost.toLocaleString()}`,name:owned?`Equip ${name}`:`Buy ${name}`});if(owned)control.setAttribute('aria-label',`Equip ${name}`);detail.append(control);if(selected.locked)detail.append(element('small','shop-status',`Complete ${selected.unlockAfter} to unlock`));if(!selected.locked&&!owned&&credits<cost)detail.append(element('small','shop-status',`$${cost-credits} short`));}
 else{const detailTabs=element('div','workbench-tabs');for(const [tab,label]of [['upgrades','Upgrades'],...(id==='pistol'?[]:[['attachment','Attachment']])]){const control=element('button',detailTab===tab?'selected':'');control.type='button';control.textContent=label;control.setAttribute('aria-pressed',String(detailTab===tab));control.dataset.focusKey='detail-'+tab;control.addEventListener('click',()=>onDetailTab(tab));detailTabs.append(control);}detail.append(detailTabs);if(detailTab==='attachment'&&id!=='pistol')renderAttachments(detail,selected,onPurchase);else renderUpgrades(detail,{offers,prefix:id==='carbine'?'rifle':id,name,stats:selected.stats??{},credits,onPurchase});}
 layout.append(list,detail);target.append(layout);
}

function weaponStats(stats){const list=element('dl','weapon-row-stats');for(const [label,value]of [['Damage',Number.isFinite(stats.damage)?`${stats.damage}${stats.pellets>1?' × '+stats.pellets:''}`:null],['Rounds',stats.capacity??stats.magazine],[stats.burstCount>1?'Burst':'Rate',stats.interval>0?(stats.burstCount>1?`${stats.burstCount}-round / ${Number(stats.interval.toFixed(2))}s`:`${(1/stats.interval).toFixed(1)}/s`):null],['Reload',Number.isFinite(stats.reload)?`${Number(stats.reload.toFixed(2))}s`:null],['Range',Number.isFinite(stats.range)?`${Number(stats.range.toFixed(2))}m`:null],['Pierce',stats.pierce>1?`${stats.pierce} targets · ${Math.round((stats.pierceMultiplier??.6)*100)}%`:null]]){if(value===null||value===undefined)continue;const stat=element('div','weapon-stat'+(['Burst','Pierce'].includes(label)?' weapon-stat-wide':''));stat.dataset.stat=label.toLowerCase();stat.append(element('dt','',label),element('dd','',String(value)));list.append(stat);}return list;}
function upgradeEffect(kind,stats,maxed,increment=6){const current=kind==='damage'?stats.damage:kind==='magazine'?stats.capacity??stats.magazine:stats.reload;if(!Number.isFinite(current))return EFFECTS[kind]??'';if(maxed)return kind==='reload'?`${Number(current.toFixed(2))}s`:String(current);const baseReload=Number.isFinite(stats.unskilledReload)?stats.unskilledReload:current,reloadMultiplier=Number.isFinite(stats.reloadMultiplier)?Math.max(.88,Math.min(1,stats.reloadMultiplier)):1;const next=kind==='damage'?current+1:kind==='magazine'?current+increment:Math.max(.5,Math.max(.5,baseReload-.18)*reloadMultiplier);if(kind==='damage'&&stats.pellets>1)return `${current}×${stats.pellets} → ${next}×${stats.pellets}`;return `${Number(current.toFixed(2))}${kind==='reload'?'s':''} → ${Number(next.toFixed(2))}${kind==='reload'?'s':''}`;}
function renderUpgrades(target,{offers,prefix,name,stats,credits,onPurchase}){
 const panel=element('div','inline-upgrades');panel.setAttribute('aria-label',`${name} upgrades`);panel.setAttribute('data-upgrade-weapon',prefix);
 for(const kind of ['damage','magazine','reload']){const offer=offers.find(item=>item.id===prefix+'.'+kind);if(!offer)continue;const level=integer(offer.level),maxLevel=integer(offer.maxLevel)||3,maxed=level>=maxLevel,cost=integer(offer.cost),available=!maxed&&offer.available!==false&&credits>=cost,control=element('section','inline-upgrade'),copy=element('div','inline-upgrade-copy');copy.append(element('strong','',TITLES[kind]),element('span','upgrade-effect',upgradeEffect(kind,stats,maxed,offer.increment??6)));const tier=element('small','upgrade-level',`${level}/${maxLevel}`);tier.setAttribute('aria-label',`Upgrade level ${level} of ${maxLevel}`);copy.append(tier);control.append(icon(kind),copy,purchaseButton({...offer,available},onPurchase,{maxed,name:`Upgrade ${name} ${TITLES[kind].toLowerCase()}`}));panel.append(control);
 }if(panel.children.length)target.append(panel);
}
function renderSupplies(target,armory,offers,onPurchase){const list=element('div','supply-list'),credits=integer(armory.credits),medkitHealing=Number.isFinite(armory.medkitHealing)?Math.max(50,Math.min(85,armory.medkitHealing)):50;for(const offer of offers.filter(item=>SUPPLIES.has(item.id))){const kind=offer.id,owned=integer(offer.owned),full=kind==='armor'?owned>=60:owned>=5,cost=integer(offer.cost),available=!full&&offer.available!==false&&credits>=cost,row=element('article','supply-row'),copy=element('div','supply-row-copy');row.title=kind==='medkit'?`Use to restore up to ${medkitHealing} health. Carry up to five.`:kind==='grenade'?'Area blast. Hold to set throw range, release to throw.':kind==='fireGrenade'?'Burning area. Hold to set throw range, release to throw.':offer.description??'';copy.append(element('h3','',TITLES[kind]),element('span','',kind==='medkit'?`+${medkitHealing} health`:EFFECTS[kind]),element('small','',`${owned}/${kind==='armor'?60:5}`));row.append(icon(kind),copy,purchaseButton({...offer,available},onPurchase,{full,name:`Buy ${offer.label??TITLES[kind]}`}));list.append(row);}target.append(list);if(!list.children.length)target.append(element('p','shop-status','No supplies available.'));}

function renderAttachments(target,gun,onPurchase){
 if(!Array.isArray(gun.attachmentOptions)||!gun.attachmentOptions.length)return;
 const row=element('label','setting-row attachment-choice'),copy=element('span','');copy.append(element('strong','','Attachment'));const select=element('select');select.setAttribute('aria-label',`${gun.label??gun.weaponId} attachment`);select.dataset.focusKey='attachment-'+gun.weaponId;
 for(const option of gun.attachmentOptions){const item=element('option','',option.name);item.value=option.id;item.selected=option.id===(gun.attachment??'standard');select.append(item);}select.value=gun.attachment??'standard';select.addEventListener('change',()=>onPurchase(`attachment.${gun.weaponId}.${select.value}`));row.append(copy,select);target.append(row);
 const selected=gun.attachmentOptions.find(option=>option.id===(gun.attachment??'standard'));target.append(element('small','shop-status attachment-effect',selected?.description??''));
}
