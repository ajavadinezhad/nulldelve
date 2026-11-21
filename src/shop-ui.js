import {createItemIcon} from './item-icons.js?v=review-r18';
import {formatKey} from './controls.js?v=review-r18';
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
const EFFECTS={damage:'+1 damage / shot',magazine:'+6 rounds',reload:'−0.18s · 0.5s minimum',medkit:'+50 health',grenade:'Blast area · hold for range',fireGrenade:'Burn area · hold for range',armor:'+40 armor · 60 maximum'};
const SUPPLIES=new Set(['medkit','grenade','fireGrenade','armor']);
function purchaseButton(offer,onPurchase,{label,name,maxed=false,full=false}={}){
 const cost=integer(offer.cost),button=element('button','shop-buy menu-button primary',maxed?'Maxed':full?'Full':label??`$${cost.toLocaleString()}`);button.type='button';button.disabled=maxed||full||offer.available===false;if(!maxed&&!full&&(label===undefined||String(label).startsWith('$'))){const cash=element('img','cash-icon');cash.src='./assets/cash.svg';cash.alt='';cash.setAttribute('aria-hidden','true');button.append(cash);}
 button.setAttribute('data-offer-id',String(offer.id));button.setAttribute('aria-label',maxed?`${name??offer.label}, maximum level`:full?`${name??offer.label}, full`:`${name??offer.label} for $${cost} cash`);button.title=maxed?'Fully upgraded':full?'At capacity':name??offer.label??'';button.addEventListener('click',()=>onPurchase(offer.id));return button;
}
/** Only the selected gun owns the upgrade controls shown beneath it. */
export function renderShop(target,armory,onPurchase,{group:selectedGroup='weapons',onGroupChange=()=>{},sidearmOpen=false,onSidearmToggle=()=>{}}={}){
 if(!armory){target.append(element('p','shop-status','Armory unavailable.'));return;}
 selectedGroup=selectedGroup==='gear'?'gear':'weapons';const credits=integer(armory.credits),header=element('div','shop-toolbar'),balance=element('div','shop-balance');balance.setAttribute('aria-label',`$${credits} cash available`);const cashIcon=element('img','cash-icon');cashIcon.src='./assets/cash.svg';cashIcon.alt='';cashIcon.setAttribute('aria-hidden','true');balance.append(cashIcon,element('strong','',`$${credits.toLocaleString()}`));
 const tabs=element('div','menu-tabs shop-tabs');tabs.setAttribute('aria-label','Armory categories');for(const [group,title]of [['weapons','Weapons'],['gear','Supplies']]){const tab=element('button',`menu-button secondary${selectedGroup===group?' selected':''}`);tab.type='button';tab.append(icon(group),element('span','',title));tab.dataset.focusKey='shop-'+group;tab.setAttribute('aria-pressed',String(selectedGroup===group));tab.addEventListener('click',()=>onGroupChange(group));tabs.append(tab);}header.append(tabs,balance);target.append(header);
 const offers=Array.isArray(armory.offers)?armory.offers:[];
 if(selectedGroup==='gear'){renderSupplies(target,armory,offers,onPurchase);return;}
 const list=element('div','weapon-list');
 for(const gun of Array.isArray(armory.weapons)?armory.weapons:[]){
  const id=gun.weaponId??String(gun.id).replace(/^weapon\./,''),name=String(gun.name??gun.label??id),owned=!!gun.owned,equipped=owned&&(armory.primary?armory.primary===id:!!gun.equipped),cost=integer(gun.cost);
  const row=element('article',`weapon-row${equipped?' equipped':''}`);row.setAttribute('data-weapon-id',id);const main=element('div','weapon-row-main'),copy=element('div','weapon-row-copy');copy.append(element('h3','weapon-row-name',name),weaponStats(gun.stats??{}));main.append(icon(id),copy);
  const actionId=(owned?'equip.':'weapon.')+id,available=!equipped&&gun.available!==false&&(owned||credits>=cost),control=purchaseButton({id:actionId,cost,available},onPurchase,{label:equipped?'Equipped':owned?'Equip':`$${cost.toLocaleString()}`,name:equipped?`${name}, equipped`:owned?`Equip ${name}`:`Buy ${name}`});control.disabled=!available;if(equipped)control.setAttribute('aria-label',`${name}, equipped`);if(owned&&!equipped)control.setAttribute('aria-label',`Equip ${name}`);main.append(control);row.append(main);
  if(equipped)renderUpgrades(row,{offers,prefix:id==='carbine'?'rifle':id,name,stats:gun.stats??{},credits,onPurchase});
  if(!owned&&credits<cost)row.append(element('small','shop-status weapon-shortfall',`$${(cost-credits).toLocaleString()} short`));list.append(row);
 }target.append(list);
 const sidearmOffers=offers.filter(offer=>String(offer.id).startsWith('pistol.'));if(sidearmOffers.length){const sidearm=element('details','sidearm-row');sidearm.open=sidearmOpen;sidearm.dataset.focusKey='sidearm';sidearm.addEventListener('toggle',()=>onSidearmToggle(sidearm.open));const summary=element('summary','sidearm-summary');summary.dataset.focusKey='sidearm-summary';summary.append(icon('pistol'),element('strong','','P9 Sidearm'),element('span','','Upgrades'));sidearm.append(summary);renderUpgrades(sidearm,{offers:sidearmOffers,prefix:'pistol',name:'P9 Sidearm',stats:armory.sidearm?.stats??{},credits,onPurchase});target.append(sidearm);}
 if(!list.children.length)target.append(element('p','shop-status','No weapons available.'));
}
function weaponStats(stats){const list=element('dl','weapon-row-stats');for(const [label,value]of [['Damage',Number.isFinite(stats.damage)?`${stats.damage}${stats.pellets>1?' × '+stats.pellets:''}`:null],['Rounds',stats.capacity??stats.magazine],['Rate',stats.interval>0?`${(1/stats.interval).toFixed(1)}/s`:null],['Reload',Number.isFinite(stats.reload)?`${stats.reload}s`:null],['Range',Number.isFinite(stats.range)?`${stats.range}m`:null]]){if(value===null||value===undefined)continue;const stat=element('div');stat.append(element('dt','',label),element('dd','',String(value)));list.append(stat);}return list;}
function upgradeEffect(kind,stats,maxed,increment=6){const current=kind==='damage'?stats.damage:kind==='magazine'?stats.capacity??stats.magazine:stats.reload;if(!Number.isFinite(current))return EFFECTS[kind]??'';if(maxed)return kind==='reload'?`${Number(current.toFixed(2))}s`:String(current);const next=kind==='damage'?current+1:kind==='magazine'?current+increment:Math.max(.5,current-.18);if(kind==='damage'&&stats.pellets>1)return `${current}×${stats.pellets} → ${next}×${stats.pellets}`;return `${Number(current.toFixed(2))}${kind==='reload'?'s':''} → ${Number(next.toFixed(2))}${kind==='reload'?'s':''}`;}
function renderUpgrades(target,{offers,prefix,name,stats,credits,onPurchase}){
 const panel=element('div','inline-upgrades');panel.setAttribute('aria-label',`${name} upgrades`);panel.setAttribute('data-upgrade-weapon',prefix);
 for(const kind of ['damage','magazine','reload']){const offer=offers.find(item=>item.id===prefix+'.'+kind);if(!offer)continue;const level=integer(offer.level),maxLevel=integer(offer.maxLevel)||3,maxed=level>=maxLevel,cost=integer(offer.cost),available=!maxed&&offer.available!==false&&credits>=cost,control=element('section','inline-upgrade'),copy=element('div','inline-upgrade-copy');copy.append(element('strong','',TITLES[kind]),element('span','upgrade-effect',upgradeEffect(kind,stats,maxed,offer.increment??6)));const tier=element('small','upgrade-level',`${level}/${maxLevel}`);tier.setAttribute('aria-label',`Upgrade level ${level} of ${maxLevel}`);copy.append(tier);control.append(icon(kind),copy,purchaseButton({...offer,available},onPurchase,{maxed,name:`Upgrade ${name} ${TITLES[kind].toLowerCase()}`}));panel.append(control);
 }if(panel.children.length)target.append(panel);
}
function renderSupplies(target,armory,offers,onPurchase){const list=element('div','supply-list'),credits=integer(armory.credits);for(const offer of offers.filter(item=>SUPPLIES.has(item.id))){const kind=offer.id,owned=integer(offer.owned),full=kind==='armor'?owned>=60:owned>=5,cost=integer(offer.cost),available=!full&&offer.available!==false&&credits>=cost,row=element('article','supply-row'),copy=element('div','supply-row-copy');row.title=offer.description??'';copy.append(element('h3','',TITLES[kind]),element('span','',EFFECTS[kind]),element('small','',`${owned}/${kind==='armor'?60:5}`));row.append(icon(kind),copy,purchaseButton({...offer,available},onPurchase,{full,name:`Buy ${offer.label??TITLES[kind]}`}));list.append(row);}target.append(list);if(!list.children.length)target.append(element('p','shop-status','No supplies available.'));}
