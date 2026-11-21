const DEFAULTS={masterVolume:.65,sfxVolume:.8,musicVolume:.35,muted:false};
const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,Number.isFinite(Number(value))?Number(value):0));

/** All audio is generated locally. Creating this controller never starts an AudioContext. */
export function createGameAudio(environment={}){
 let captureDestination=null;let context=null,master=null,sfx=null,music=null,noiseBuffer=null,disposed=false,paused=false;
 let settings={...DEFAULTS},ambient=[],lastCreature=-Infinity,lastAttack=-Infinity,serial=0;
 const voices=[];
 const Context=environment.AudioContext??globalThis.AudioContext??globalThis.webkitAudioContext;
 const setGain=(node,value)=>{if(!node||!context)return;try{node.gain.cancelScheduledValues(context.currentTime);node.gain.setValueAtTime(value,context.currentTime);}catch{}};
 function updateGains(){
  setGain(master,settings.muted?0:settings.masterVolume);
  setGain(sfx,paused?0:settings.sfxVolume);
  setGain(music,paused?0:settings.musicVolume*.12);
 }
 function applySettings(next={}){
  for(const key of ['masterVolume','sfxVolume','musicVolume'])if(next[key]!==undefined)settings[key]=clamp(next[key]);
  if(typeof next.muted==='boolean')settings.muted=next.muted;
  updateGains();
 }
 function clearVoice(voice,stop=false){
  const index=voices.indexOf(voice);if(index<0)return;
  voices.splice(index,1);voice.source.onended=null;
  if(stop){try{voice.source.stop();}catch{}}
  for(const node of voice.nodes){try{node.disconnect();}catch{}}
 }
 function register(source,nodes){
  while(voices.length>=28)clearVoice(voices[0],true);
  const voice={source,nodes};voices.push(voice);source.onended=()=>clearVoice(voice);
 }
 function playable(){return !disposed&&!paused&&!settings.muted&&context&&context.state!=='closed'&&context.state!=='suspended';}
 function envelope(gain,volume,duration,attack=.004){
  const t=context.currentTime;
  gain.gain.setValueAtTime(.0001,t);
  gain.gain.linearRampToValueAtTime(Math.max(.0001,volume),t+attack);
  gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
 }
 function output(source,volume,duration,{filterType,frequency=1000,q=.7,pan=0,attack=.004,ui=false}={}){
  const gain=context.createGain(),nodes=[source,gain];let tail=source;
  if(filterType){const filter=context.createBiquadFilter();filter.type=filterType;filter.frequency.value=frequency;filter.Q.value=q;tail.connect(filter);tail=filter;nodes.push(filter);}
  tail.connect(gain);tail=gain;
  if(context.createStereoPanner){const panner=context.createStereoPanner();panner.pan.value=clamp(pan,-1,1);gain.connect(panner);tail=panner;nodes.push(panner);}
  tail.connect(ui?master:sfx);envelope(gain,ui?volume*settings.sfxVolume:volume,duration,attack);register(source,nodes);
  source.start(context.currentTime);source.stop(context.currentTime+duration+.025);
 }
 function tone(start,end,duration,volume,type='sine',options={}){
  if(!playable()&&!(options.ui&&!disposed&&!settings.muted&&context?.state==='running'))return;
  try{const source=context.createOscillator();source.type=type;source.frequency.setValueAtTime(Math.max(10,start),context.currentTime);source.frequency.exponentialRampToValueAtTime(Math.max(10,end),context.currentTime+duration);output(source,volume,duration,options);}catch{}
 }
 function noise(duration,volume,options={}){
  if(!playable())return;
  try{const source=context.createBufferSource();source.buffer=noiseBuffer;output(source,volume,duration,options);}catch{}
 }
 function startAmbient(){
  if(!context||ambient.length)return;
  // Low, slightly detuned tones form a restrained facility drone without a repeated tune.
  for(const [frequency,volume,type] of [[43,.3,'sine'],[64.7,.085,'triangle'],[86.3,.045,'sine']]){
   const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=type;oscillator.frequency.value=frequency;gain.gain.value=volume;oscillator.connect(gain);gain.connect(music);oscillator.start();ambient.push({source:oscillator,nodes:[oscillator,gain]});
  }
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=noiseBuffer;source.loop=true;filter.type='lowpass';filter.frequency.value=190;gain.gain.value=.09;source.connect(filter);filter.connect(gain);gain.connect(music);source.start();ambient.push({source,nodes:[source,filter,gain]});
 }
 async function unlock(){
  if(disposed||!Context)return false;
  try{
   if(!context){
    context=new Context();master=context.createGain();sfx=context.createGain();music=context.createGain();
    const compressor=context.createDynamicsCompressor?.();
    sfx.connect(master);music.connect(master);
    if(compressor){master.connect(compressor);compressor.connect(context.destination);ambient.compressor=compressor;}else master.connect(context.destination);
    const length=Math.max(1,Math.floor(context.sampleRate*1.25));noiseBuffer=context.createBuffer(1,length,context.sampleRate);const data=noiseBuffer.getChannelData(0);let seed=12347;
    for(let i=0;i<length;i++){seed=(seed*16807)%2147483647;data[i]=(seed/2147483647)*2-1;}
    updateGains();startAmbient();
   }
   if(context.state==='suspended'&&context.resume)await context.resume();
   return context.state!=='closed';
  }catch{return false;}
 }
 function setPaused(value){if(paused===!!value)return;paused=!!value;if(paused)while(voices.length)clearVoice(voices[0],true);updateGains();}
 function shot(type='rifle'){
  if(type==='shotgun'){tone(90,32,.22,.4);noise(.16,.27,{filterType:'lowpass',frequency:1900});return;}
  const rifle=type!=='pistol';tone(rifle?115:175,rifle?43:62,rifle?.12:.105,rifle?.35:.28,'sine');
  noise(rifle?.09:.065,rifle?.22:.18,{filterType:'highpass',frequency:rifle?1050:1650});
 }
 function reload(){noise(.11,.1,{filterType:'bandpass',frequency:2400,q:1.1});tone(760,300,.09,.07,'triangle');}
 function door(open=true){noise(.32,.12,{filterType:'lowpass',frequency:650});tone(open?125:165,open?190:62,.32,.12,'triangle');}
 function bite(){noise(.085,.15,{filterType:'bandpass',frequency:700,q:1.5});tone(145,50,.13,.15,'sawtooth');}
 function melee(){noise(.045,.065,{filterType:'highpass',frequency:1800});tone(380,240,.055,.035,'triangle');}
 function attack(x,z,px,pz,variant){creature(x,z,px,pz,variant,{attack:true});}
 function explosion(){tone(110,23,.5,.48);noise(.48,.3,{filterType:'lowpass',frequency:1100});}
 function pickup(){tone(660,990,.17,.085,'sine');tone(990,1320,.23,.045,'sine');}
 function purchase(){tone(440,880,.17,.075,'triangle',{ui:true});tone(880,1175,.22,.04,'sine',{ui:true});}
 function puzzle(success=true){tone(success?523:180,success?784:85,.28,.095,'triangle');if(success)tone(1046,1175,.3,.045);}
 function wave(){tone(210,170,.65,.075,'triangle');noise(.35,.05,{filterType:'bandpass',frequency:470});}
 function creature(x,z,playerX,playerZ,variant='normal',{attack=false}={}){
  if(!playable()||![x,z,playerX,playerZ].every(Number.isFinite))return;
  const distance=Math.hypot(x-playerX,z-playerZ);if(distance>=12||context.currentTime-(attack?lastAttack:lastCreature)<(attack?.045:.18))return;
  if(attack)lastAttack=context.currentTime;else lastCreature=context.currentTime;const volume=(1-distance/12)**2*(variant==='boss'?.2:.12),pan=clamp((x-playerX)/8,-1,1);
  const frequency=variant==='boss'?350:variant==='brute'?600:variant==='runner'?1800:1100;
  noise(.16+(serial++%3)*.03,volume,{filterType:'bandpass',frequency,q:2.2,pan});
  if(variant==='boss'||variant==='brute')tone(variant==='boss'?75:110,45,.2,volume*.55,'sawtooth',{pan});
 }
 async function captureStream(){if(!await unlock()||!context?.createMediaStreamDestination)return null;if(!captureDestination){captureDestination=context.createMediaStreamDestination();master.connect(captureDestination);}return captureDestination.stream;}
 function dispose(){
  if(disposed)return;disposed=true;
  while(voices.length)clearVoice(voices[0],true);
  for(const item of ambient){try{item.source.stop();}catch{}for(const node of item.nodes){try{node.disconnect();}catch{}}}
  try{ambient.compressor?.disconnect();master?.disconnect();sfx?.disconnect();music?.disconnect();}catch{}
  ambient=[];
  if(context?.close){try{const closing=context.close();closing?.catch?.(()=>{});}catch{}}
  captureDestination=null;context=null;
 }
 return {captureStream,unlock,applySettings,shot,reload,door,bite,melee,attack,explosion,pickup,purchase,puzzle,wave,creature,setPaused,dispose};
}
