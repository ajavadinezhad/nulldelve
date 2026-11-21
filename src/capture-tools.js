/** Clean, continuous recording of the real rendered game. No input automation. */
export const CAPTURE_PRESETS=Object.freeze({hd:{width:1920,height:1080,fps:60,bitrate:20000000,label:'1080p / 60 fps'},uhd:{width:3840,height:2160,fps:60,bitrate:50000000,label:'4K / 60 fps'}});
export function captureMime(Recorder=globalThis.MediaRecorder){
 for(const type of ['video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'])if(Recorder?.isTypeSupported?.(type))return type;
 return '';
}
export function fitCapture(sourceWidth,sourceHeight,width,height){const scale=Math.min(width/sourceWidth,height/sourceHeight);return {x:(width-sourceWidth*scale)/2,y:(height-sourceHeight*scale)/2,width:sourceWidth*scale,height:sourceHeight*scale};}
export function createGameCapture({canvas,host=globalThis.document?.body,audioStream=()=>null,isRunning=()=>false,onStart=()=>{},onFinish=()=>{},Recorder=globalThis.MediaRecorder}={}){
 if(!canvas||!host)return null;
 const doc=host.ownerDocument??document,output=doc.createElement('canvas'),context=output.getContext('2d',{alpha:false});
 const bar=doc.createElement('section');bar.className='capture-toolbar';bar.setAttribute('aria-label','Gameplay video recorder');
 const quality=doc.createElement('select');quality.setAttribute('aria-label','Recording quality');for(const [value,preset]of Object.entries(CAPTURE_PRESETS)){const option=doc.createElement('option');option.value=value;option.textContent=preset.label;quality.append(option);}quality.value='hd';
 const record=doc.createElement('button');record.type='button';record.textContent='Record · F9';const download=doc.createElement('a');download.textContent='Download video';download.hidden=true;
 const status=doc.createElement('span');status.setAttribute('role','status');status.textContent='Play normally. F9 starts/stops. Game audio only.';
 const review=doc.createElement('details');review.className='capture-review';review.hidden=true;const summary=doc.createElement('summary');summary.textContent='Review clip';const video=doc.createElement('video');video.controls=true;video.preload='metadata';review.append(summary,video);bar.append(quality,record,download,status,review);host.append(bar);video.addEventListener('loadedmetadata',()=>{if(video.videoWidth===0){download.hidden=true;status.textContent='No video frames in this take. Record for at least two seconds.';}});
 let recorder=null,stream=null,chunks=[],url=null,recording=false,failed=false,starting=false,prepared=false,startedAt=0,firstFrameReady=null;
 const release=()=>{for(const track of stream?.getTracks?.()??[])track.stop();stream=null;recording=false;quality.disabled=false;record.textContent='Record · F9';if(prepared){prepared=false;onFinish();}};
 function stop(){if(recorder&&recorder.state!=='inactive'){record.disabled=true;recorder.stop();}}
 async function start(){
  if(recording||starting)return;if(!isRunning()){status.textContent='Start or resume an operation first.';return;}
  const preset=CAPTURE_PRESETS[quality.value]??CAPTURE_PRESETS.hd,mimeType=captureMime(Recorder);if(!mimeType||!output.captureStream||!context){status.textContent='Video recording is unavailable in this browser.';return;}
  starting=true;record.disabled=true;failed=false;chunks=[];download.hidden=true;review.hidden=true;video.removeAttribute?.('src');if(url){URL.revokeObjectURL(url);url=null;}
  try{
   prepared=true;onStart(preset);output.width=preset.width;output.height=preset.height;
   const audio=await audioStream();await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{firstFrameReady=null;reject(new Error('No rendered frame'));},3000);firstFrameReady=()=>{clearTimeout(timeout);firstFrameReady=null;resolve();};});stream=output.captureStream(preset.fps);for(const track of audio?.getAudioTracks?.()??[])stream.addTrack(track.clone());
   recorder=new Recorder(stream,{mimeType,videoBitsPerSecond:preset.bitrate,audioBitsPerSecond:192000});
   recorder.ondataavailable=event=>{if(event.data?.size)chunks.push(event.data);};
   recorder.onerror=()=>{failed=true;status.textContent='Recording failed. Try 1080p or a different browser.';try{if(recorder.state!=='inactive')recorder.stop();}catch{}release();record.disabled=false;};
   recorder.onstop=()=>{if(!failed&&chunks.length){const type=recorder.mimeType||mimeType,blob=new Blob(chunks,{type});url=URL.createObjectURL(blob);download.href=url;download.download=`nulldelve-${preset.height}p-${Date.now()}.${type.includes('mp4')?'mp4':'webm'}`;download.hidden=false;video.src=url;review.hidden=false;status.textContent=`Video ready · ${(blob.size/1048576).toFixed(1)} MB`; }else if(!failed)status.textContent='No video frames captured. Try again during play.';chunks=[];release();record.disabled=false;};
   recorder.start(1000);canvas.focus?.({preventScroll:true});recording=true;record.disabled=false;startedAt=Date.now();quality.disabled=true;record.textContent='Stop · F9';status.textContent=`Recording ${preset.label} · ${stream.getAudioTracks().length?'with game audio':'video only'} · max 90s`;
  }catch(error){failed=true;status.textContent='Could not start recording. Try 1080p or a different browser.';release();record.disabled=false;}finally{starting=false;}
 }
 function toggle(){if(recording)stop();else void start();}
 record.addEventListener('click',toggle);
 const key=event=>{if(event.code==='F9'&&!event.repeat){event.preventDefault();event.stopImmediatePropagation();toggle();}};doc.addEventListener('keydown',key,true);
 return {start,stop,isRecording:()=>recording,frame(){if(!prepared||(recording&&recorder.state!=='recording'))return;if(recording&&Date.now()-startedAt>90000){stop();return;}const r=fitCapture(canvas.width,canvas.height,output.width,output.height);context.fillStyle='#080d10';context.fillRect(0,0,output.width,output.height);context.drawImage(canvas,r.x,r.y,r.width,r.height);firstFrameReady?.();},update(running,ended=false){if(!recording)return;if(ended){stop();return;}if(!running&&recorder.state==='recording'){recorder.pause();status.textContent='Recording paused with the game';}else if(running&&recorder.state==='paused'){recorder.resume();status.textContent='Recording resumed';}},dispose(){if(recording)stop();doc.removeEventListener('keydown',key,true);if(url)URL.revokeObjectURL(url);bar.remove();}};
}
