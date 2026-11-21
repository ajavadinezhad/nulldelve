/** Shared native vector assets keep gameplay, menus, and shops consistent. */
export function itemIconPath(type){return `./assets/${type==='fireGrenade'||type==='fire'?'fire-grenade':type==='grenade'?'grenade':'medkit'}.svg`;}
export function createItemIcon(type){const img=document.createElement('img');img.src=itemIconPath(type);img.alt='';img.setAttribute('aria-hidden','true');img.width=28;img.height=28;img.draggable=false;return img;}
