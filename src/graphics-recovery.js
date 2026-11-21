/** Keep a GPU reset from silently leaving a running, invisible operation. */
export function attachGraphicsRecovery({canvas,pause=()=>{},showRecovery=()=>{}}={}){
 let interrupted=false,disposed=false;
 function lost(event){
  event.preventDefault();
  if(disposed||interrupted)return;
  interrupted=true;
  pause();
  showRecovery({restored:false});
 }
 function restored(){if(!disposed&&interrupted)showRecovery({restored:true});}
 canvas?.addEventListener('webglcontextlost',lost);
 canvas?.addEventListener('webglcontextrestored',restored);
 return {isInterrupted:()=>interrupted,dispose(){disposed=true;canvas?.removeEventListener('webglcontextlost',lost);canvas?.removeEventListener('webglcontextrestored',restored);}};
}
/** Recovery never captures the interrupted frame or writes over the safe save. */
export function graphicsRecoveryUrl(path,hasCheckpoint=false){return path+(hasCheckpoint?'?play=load':'');}
export function renderGraphicsRecovery({overlay,reload,hasCheckpoint=false,restored=false}={}){
 if(!overlay)return;
 const document=overlay.ownerDocument??globalThis.document;
 const panel=document.createElement('div');panel.className='card startup-error graphics-recovery';panel.setAttribute('role','alertdialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Graphics interrupted');
 const title=document.createElement('h1');title.textContent='Graphics interrupted';
 const text=document.createElement('p');text.textContent=(restored?'Graphics are available again. ':'Your browser reset the graphics. ')+(hasCheckpoint?'Reload to resume your last safe checkpoint.':'Reload to return to the main menu.');
 const retry=document.createElement('button');retry.type='button';retry.textContent=hasCheckpoint?'Resume checkpoint':'Reload game';retry.addEventListener('click',()=>reload?.(hasCheckpoint));
 panel.append(title,text,retry);overlay.classList.remove('menu-overlay');overlay.replaceChildren(panel);overlay.style.display='flex';retry.focus();
}
