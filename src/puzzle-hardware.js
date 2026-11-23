/** Reusable physical controls. These receive identities/current state, never solutions. */
export function createHardwareControl(control,onActivate){
 const node=(tag,cls)=>{const n=document.createElement(tag);n.className=cls;return n;};
 const card=node('div','puzzle-hardware-card'),label=node('span','puzzle-lever-label');label.textContent=control.label;card.dataset.hardware=control.style;
 const button=node('button','puzzle-hardware-button');button.type='button';button.setAttribute('aria-label',control.label);button.dataset.hardware=control.style;
 const lamp=node('span','hardware-status-lamp');lamp.setAttribute('aria-hidden','true');
 const face=node('span','hardware-face');face.setAttribute('aria-hidden','true');let wheel=null,ports=[];
 if(control.style==='key'){const glyph=node('span','hardware-symbol');glyph.dataset.symbol=control.symbol;face.append(glyph);}
 else if(control.style==='breaker'){const channel=node('span','hardware-breaker-channel'),handle=node('span','hardware-breaker-handle');channel.append(handle);face.append(channel);}
 else if(control.style==='wheel'){wheel=node('span','hardware-wheel');for(let i=0;i<3;i++){const spoke=node('span','hardware-wheel-spoke');spoke.style.transform=`rotate(${i*120}deg)`;wheel.append(spoke);}const hub=node('span','hardware-wheel-hub');wheel.append(hub);face.append(wheel);}
 else if(control.style==='junction'){const coupling=node('span','hardware-coupling');for(let i=0;i<4;i++){const port=node('span','hardware-coupling-port');port.style.transform=`rotate(${i*90}deg)`;coupling.append(port);ports.push(port);}const hub=node('span','hardware-wheel-hub');coupling.append(hub);face.append(coupling);}
 button.append(face,lamp);card.append(label,button);let turns=0;
 button.onclick=()=>{if(button.disabled)return;turns++;if(wheel)wheel.style.transform=`rotate(${turns*90}deg)`;onActivate();};
 function paint(current,panel){button.disabled=panel.locked;button.setAttribute('aria-pressed',String(!!current.active));lamp.classList.toggle('lit',!!current.active);button.classList.toggle('engaged',!!current.active);ports.forEach((port,i)=>port.classList.toggle('connected',current.ports?.includes(i)??false));}
 return {element:card,button,paint,feedback(accepted){button.dataset.feedback=accepted===true?'accepted':accepted===false?'rejected':'';}};
}
