import {createHardwareControl,createMechanismInstrument} from './puzzle-hardware.js?v=critic-fixes-r54';
/** The lever travel maps to discrete positions; no target settings enter this view. */
export function leverValueAt(clientY,rect,min,max){const compact=rect.height<=140,offset=compact?36:44,bottom=compact?50:79,top=rect.top+offset,travel=Math.max(1,rect.height-offset-bottom),t=Math.max(0,Math.min(1,(clientY-top)/travel));return Math.round(max-t*(max-min));}
export function createPuzzleSettingsUI({getPanel,onAdjust,onTest,onPress=()=>({ok:false}),onOpen=()=>{},onClose=()=>{}}){
 const node=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const overlay=node('div','puzzle-settings-overlay');overlay.hidden=true;
 const dialog=node('section','puzzle-settings-dialog');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','puzzle-settings-title');
 const header=node('header',''),title=node('h2','','');title.id='puzzle-settings-title';
 const close=node('button','puzzle-settings-close','×');close.type='button';close.setAttribute('aria-label','Close puzzle controls');header.append(title,close);
 const controls=node('div','puzzle-settings-controls'),footer=node('footer',''),status=node('p','puzzle-settings-status');status.setAttribute('role','status');
 const test=node('button','puzzle-settings-test','Test');test.type='button';footer.append(status,test);dialog.append(header,controls,footer);overlay.append(dialog);document.body.append(overlay);
 let opened=false,previousFocus=null,kind=null,rows=[],instrument=null;
 function hide(){if(!opened)return false;opened=false;overlay.hidden=true;onClose();previousFocus?.isConnected&&previousFocus.focus?.({preventScroll:true});return true;}
 function refresh(){const panel=getPanel();if(!panel||panel.kind!==kind){hide();return null;}instrument?.paint(panel.instrument);for(const [i,row]of rows.entries()){const c=panel.controls[i];if(row.paint){row.paint(c,panel);continue;}const assigned=c.value>=c.min,value=Math.max(c.min,c.value),ratio=(value-c.min)/Math.max(1,c.max-c.min);row.lever.disabled=panel.locked;row.lever.style.setProperty('--lever-angle',(assigned?66-ratio*62:35)+'deg');row.lever.classList.toggle('unassigned',!assigned);row.output.textContent=assigned?(c.options?.[c.value]??String(c.value)):'—';row.lever.setAttribute('aria-valuenow',String(value));row.lever.setAttribute('aria-valuetext',assigned?String(c.optionLabels?.[c.value]??row.output.textContent):'Not assigned');for(const [j,mark]of row.marks.entries())mark.classList.toggle('selected',assigned&&j===c.value-c.min);}test.disabled=panel.locked;test.hidden=panel.mode==='actions';return panel;}
 function adjust(i,value){if(!opened)return;const result=onAdjust(kind,i,Number(value));status.textContent=result?.ok?'':'Locked';status.dataset.state=result?.ok?'neutral':'rejected';refresh();}
 function open(){if(opened)return true;const panel=getPanel();if(!panel)return false;kind=panel.kind;dialog.dataset.mode=panel.mode??'levers';previousFocus=document.activeElement;title.textContent=panel.title;controls.replaceChildren();controls.style.setProperty('--control-count',String(panel.controls.length));controls.dataset.mode=panel.mode??'levers';rows=[];instrument=createMechanismInstrument();controls.append(instrument.element);instrument.paint(panel.instrument);
  panel.controls.forEach((c,i)=>{
   if(panel.mode==='actions'){
    const hardware=createHardwareControl(c,()=>{if(!opened)return;const result=onPress(kind,i);for(const row of rows)row.feedback?.(null);hardware.feedback(result?.accepted);status.textContent=!result?.ok?'Locked':result.accepted===false?'Rejected':result.accepted===true||result.complete?'Accepted':'';status.dataset.state=result?.accepted===false?'rejected':result?.accepted===true||result.complete?'accepted':'neutral';refresh();if(result?.complete)hide();});
    controls.append(hardware.element);rows.push(hardware);return;
   }
   const card=node('div','puzzle-lever-card'),label=node('span','puzzle-lever-label',c.label.replace(/^THEATRE /,'').replace(/^\d+ kW /,'').replace(/ MOTOR$/,''));label.id='puzzle-lever-label-'+i;
   const lever=node('button','puzzle-lever');lever.type='button';lever.setAttribute('role','slider');lever.setAttribute('aria-label',c.label);lever.setAttribute('aria-orientation','vertical');lever.setAttribute('aria-valuemin',String(c.min));lever.setAttribute('aria-valuemax',String(c.max));
   const gate=node('span','puzzle-lever-gate'),notches=node('span','puzzle-lever-notches'),marks=[];
   for(let value=c.min;value<=c.max;value++){const mark=node('span','puzzle-lever-mark',c.options?.[value]??String(value));mark.style.setProperty('--notch-top',((c.max-value)/Math.max(1,c.max-c.min)*100)+'%');notches.append(mark);marks.push(mark);}
   const arm=node('span','puzzle-lever-arm'),grip=node('span','puzzle-lever-grip');arm.append(grip);const mount=node('span','puzzle-lever-mount');lever.append(gate,notches,arm,mount);for(const visual of [gate,notches,arm,mount])visual.setAttribute('aria-hidden','true');
   const output=node('output','puzzle-lever-value');output.setAttribute('aria-live','polite');output.setAttribute('aria-label',c.label+' current setting');
   let pointer=null,startY=0,moved=false,gripTap=false;
   lever.onpointerdown=e=>{if(lever.disabled||pointer!==null||e.button>0)return;e.preventDefault();e.stopPropagation();pointer=e.pointerId;startY=e.clientY;moved=false;gripTap=!!e.target?.closest?.('.puzzle-lever-grip,.puzzle-lever-arm,.puzzle-lever-mount');lever.focus({preventScroll:true});lever.setPointerCapture?.(pointer);lever.classList.add('grabbing');};
   lever.onpointermove=e=>{if(e.pointerId!==pointer)return;if(Math.abs(e.clientY-startY)>5)moved=true;if(moved)adjust(i,leverValueAt(e.clientY,lever.getBoundingClientRect(),c.min,c.max));};
   lever.onpointerup=e=>{if(e.pointerId!==pointer)return;e.preventDefault();const id=pointer,wasGrip=gripTap;pointer=null;lever.classList.remove('grabbing');if(lever.hasPointerCapture?.(id))lever.releasePointerCapture(id);const current=getPanel()?.controls[i];if(!current||lever.disabled)return;if(moved)adjust(i,leverValueAt(e.clientY,lever.getBoundingClientRect(),c.min,c.max));else if(wasGrip)adjust(i,current.value<c.min?c.min:current.value>=c.max?c.min:current.value+1);else adjust(i,leverValueAt(e.clientY,lever.getBoundingClientRect(),c.min,c.max));};
   const cancel=()=>{pointer=null;gripTap=false;lever.classList.remove('grabbing');};lever.onpointercancel=cancel;lever.onlostpointercapture=cancel;
   lever.onclick=e=>{if(e.detail!==0||lever.disabled)return;const current=getPanel()?.controls[i];if(current)adjust(i,current.value<c.min?c.min:current.value>=c.max?c.min:current.value+1);};
   lever.onkeydown=e=>{const current=getPanel()?.controls[i];if(!current||lever.disabled)return;let value;if(e.key==='ArrowUp'||e.key==='ArrowRight')value=Math.min(c.max,current.value+1);else if(e.key==='ArrowDown'||e.key==='ArrowLeft')value=Math.max(c.min,current.value-1);else if(e.key==='Home')value=c.min;else if(e.key==='End')value=c.max;else return;e.preventDefault();e.stopPropagation();adjust(i,value);};
   card.append(label,lever,output);controls.append(card);rows.push({lever,output,marks});
  });
  status.textContent=panel.complete?'Accepted':panel.running?'Running':panel.locked?'Locked':'';status.dataset.state=panel.complete?'accepted':'neutral';opened=true;overlay.hidden=false;onOpen();refresh();close.focus({preventScroll:true});return true;
 }
 close.onclick=hide;test.onclick=()=>{const result=onTest();status.textContent=result?.ok?'Accepted':'Rejected';status.dataset.state=result?.ok?'accepted':'rejected';refresh();if(result?.ok)hide();};
 overlay.addEventListener('keydown',e=>{if(!opened)return;if(e.code==='Escape'){e.preventDefault();e.stopPropagation();hide();return;}if(e.code==='Tab'){const focusable=[...dialog.querySelectorAll('button')].filter(n=>!n.disabled&&!n.hidden);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 return {open,close:hide,isOpen:()=>opened,refresh};
}
