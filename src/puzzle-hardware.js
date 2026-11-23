/** Reusable physical controls. These receive identities/current state, never solutions. */
export function createHardwareControl(control,onActivate){
 const node=(tag,cls)=>{const n=document.createElement(tag);n.className=cls;return n;};
 const card=node('div','puzzle-hardware-card'),label=node('span','puzzle-lever-label');label.textContent=control.label;card.dataset.hardware=control.style;
 const button=node('button','puzzle-hardware-button');button.type='button';button.setAttribute('aria-label',control.label);button.dataset.hardware=control.style;
 const lamp=node('span','hardware-status-lamp');lamp.setAttribute('aria-hidden','true');
 const face=node('span','hardware-face');face.setAttribute('aria-hidden','true');let wheel=null,key=null,socket=null,ports=[];
 if(control.style==='key'){socket=node('span','hardware-key-socket');key=node('span','hardware-key-rotor');const glyph=node('span','hardware-symbol');glyph.dataset.symbol=control.symbol;key.append(glyph);face.append(socket,key);}
 else if(control.style==='breaker'){const channel=node('span','hardware-breaker-channel'),handle=node('span','hardware-breaker-handle');channel.append(handle);face.append(channel);}
 else if(control.style==='wheel'){wheel=node('span','hardware-wheel');for(let i=0;i<3;i++){const spoke=node('span','hardware-wheel-spoke');spoke.style.transform=`rotate(${i*120}deg)`;wheel.append(spoke);}const hub=node('span','hardware-wheel-hub');wheel.append(hub);face.append(wheel);}
 else if(control.style==='junction'){const coupling=node('span','hardware-coupling');for(let i=0;i<4;i++){const port=node('span','hardware-coupling-port');port.style.transform=`rotate(${i*90}deg)`;coupling.append(port);ports.push(port);}const hub=node('span','hardware-wheel-hub');coupling.append(hub);face.append(coupling);}
 const reading=node('output','hardware-live-reading');reading.setAttribute('aria-live','off');button.append(face,lamp);card.append(label,button,reading);let turns=0;
 button.onclick=()=>{if(button.disabled)return;turns++;if(wheel)wheel.style.transform=`rotate(${turns*90}deg)`;onActivate();};
 function paint(current,panel){if(key&&Number.isFinite(current.angle))key.style.transform=`rotate(${current.angle}deg)`;if(socket&&Number.isFinite(current.apertureAngle)){socket.hidden=false;socket.style.transform=`rotate(${current.apertureAngle}deg)`;}else if(socket)socket.hidden=true;if(wheel&&Number.isFinite(current.angle))wheel.style.transform=`rotate(${current.angle}deg)`;reading.hidden=current.setting===undefined&&current.load===undefined;reading.textContent=current.load!==undefined?`${current.load} A`:current.setting!==undefined&&control.style==='wheel'?String(current.setting):'';if(current.direction)reading.dataset.direction=current.direction;button.disabled=panel.locked;button.setAttribute('aria-pressed',String(current.setting===undefined?!!current.active:current.setting>0));if(current.setting!==undefined)button.setAttribute('aria-label',`${control.label}, ${control.style==='key'?'quarter turn':control.style==='breaker'?'switch':'setting'} ${current.setting}${current.load!==undefined?', '+current.load+' amperes':''}`);lamp.classList.toggle('lit',!!current.active);button.classList.toggle('engaged',!!current.active);ports.forEach((port,i)=>port.classList.toggle('connected',current.ports?.includes(i)??false));}
 return {element:card,button,paint,feedback(accepted){button.dataset.feedback=accepted===true?'accepted':accepted===false?'rejected':'';}};
}

/** Actual instrument readings and engineering limits, never a next-action highlight. */
export function createMechanismInstrument(){
 const make=(tag,cls)=>{const n=document.createElement(tag);n.className=cls;return n;};
 const element=make('div','puzzle-instrument'),gauge=make('div','puzzle-instrument-gauge'),safe=make('span','puzzle-instrument-safe'),needle=make('span','puzzle-instrument-needle'),output=make('output','puzzle-instrument-reading'),flow=make('span','puzzle-instrument-flow');
 gauge.append(safe,needle);element.append(gauge,output,flow);gauge.setAttribute('aria-hidden','true');flow.setAttribute('role','img');
 return {element,paint(instrument){
  element.hidden=!instrument||instrument.kind==='alignment';if(element.hidden)return;
  const maximum=Math.max(1,Number(instrument.max)||1),ratio=n=>Math.max(0,Math.min(100,Number(n)/maximum*100)),reading=Number(instrument.reading)||0;
  safe.style.left=ratio(instrument.safeMin)+'%';safe.style.width=Math.max(1,ratio(instrument.safeMax)-ratio(instrument.safeMin))+'%';needle.style.left=ratio(reading)+'%';
  const unit=instrument.kind==='current'?'A':'bar';output.textContent=`${Number(reading.toFixed(1))} ${unit}`;output.setAttribute('aria-label',`${instrument.kind==='current'?'Current':'Pressure'} ${reading} ${unit}; operating band ${instrument.safeMin} to ${instrument.safeMax}`);
  flow.hidden=instrument.kind!=='pressure';flow.classList.toggle('flowing',!!instrument.flow);flow.textContent='⇢';flow.setAttribute('aria-label',instrument.flow?'Flow established':'No flow');
 }};
}
