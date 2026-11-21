/** Keep contextual messages above the real, reflowed HUD rather than a guessed scaled box. */
export function observeHudLayout(panel,root=globalThis.document?.documentElement){
 if(!panel||!root)return ()=>{};
 const update=()=>{const height=Math.ceil(panel.getBoundingClientRect().height);if(Number.isFinite(height)&&height>0)root.style.setProperty('--combat-panel-height',height+'px');};
 update();const observer=typeof ResizeObserver==='function'?new ResizeObserver(update):null;observer?.observe(panel);globalThis.addEventListener?.('resize',update);
 return ()=>{observer?.disconnect();globalThis.removeEventListener?.('resize',update);};
}
