/** Focus belongs to the discovered map until gameplay regains control. */
export function createMapFocus({panel,closeButton,onClose=()=>{}}){
 let opened=false,previousFocus=null,previousLabel=null;
 const document=panel.ownerDocument??globalThis.document;
 function controls(){
  return [...panel.querySelectorAll('button,input,select,textarea,a[href],[tabindex]')].filter(node=>!node.disabled&&!node.hidden&&node.tabIndex!==-1&&node.getAttribute?.('aria-hidden')!=='true'&&!node.closest?.('[hidden],[inert]')&&(!node.getClientRects||node.getClientRects().length>0));
 }
 function open(){
  if(opened)return;opened=true;previousFocus=document?.activeElement;previousLabel=panel.getAttribute('aria-label');
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Discovered map');
  (closeButton??controls()[0])?.focus({preventScroll:true});
 }
 function close(){
  if(!opened)return;opened=false;panel.removeAttribute('role');panel.removeAttribute('aria-modal');
  if(previousLabel===null)panel.removeAttribute('aria-label');else panel.setAttribute('aria-label',previousLabel);
  if(previousFocus?.isConnected)previousFocus.focus?.({preventScroll:true});previousFocus=null;
 }
 panel.addEventListener('keydown',event=>{
  if(!opened)return;
  if(event.key==='Escape'||event.code==='Escape'){event.preventDefault();event.stopPropagation();onClose();return;}
  if(event.key!=='Tab'&&event.code!=='Tab')return;
  const available=controls();if(!available.length){event.preventDefault();return;}
  const first=available[0],last=available.at(-1),focused=document?.activeElement;
  if(event.shiftKey&&(focused===first||!panel.contains(focused))){event.preventDefault();last.focus({preventScroll:true});}
  else if(!event.shiftKey&&(focused===last||!panel.contains(focused))){event.preventDefault();first.focus({preventScroll:true});}
 });
 return {open,close};
}
