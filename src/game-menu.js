import {renderFieldJournal,journalIcon} from './field-journal.js?v=paid-camera-r47';
import {createPuzzleDiscovery} from './puzzle-discovery.js?v=paid-camera-r47';
import {FIELD_SKILLS,SKILL_BRANCHES,SKILL_NODES,trainingPoints,skillLearnable,fieldSkillUnlocked,fieldSkillEffects} from './field-skills.js?v=paid-camera-r47';
import {compatibleStorage} from './storage-compat.js?v=paid-camera-r47';
import {formatDuration,operationRecordKey} from './operation-records.js?v=paid-camera-r47';
import {createCampaignMap} from './campaign-map.js?v=paid-camera-r47';
import {CAMPAIGN_OPERATIONS,isCampaignOperationUnlocked} from './campaign-operations.js?v=paid-camera-r47';
import {createItemIcon} from './item-icons.js?v=paid-camera-r47';
import {buildMissionPreview} from './mission-previews.js?v=paid-camera-r47';
import {renderShop} from './shop-ui.js?v=paid-camera-r47';
import {normalizeSettings,DEFAULT_BINDINGS,ACTION_LABELS,BINDING_ACTIONS,validateBinding,formatKey} from './controls.js?v=paid-camera-r47';
const SETTINGS_KEY='nulldelve.settings.v1';
const DEFAULT_SETTINGS=normalizeSettings();
const MISSIONS=[
 {id:'campaign',name:'Facility descent',description:'Explore the full facility, restore its systems, recover the intel, and find your way out.',meta:'STORY OPERATION · FULL FACILITY'},
 {id:'siege',name:'Reactor siege',description:'Restore reactor power, defeat the swarm, and hold for the evacuation lift.',meta:'REACTOR ARENA · SURVIVAL'},
 {id:'nest',name:'Nest hunt',description:'Enter the mutated nest and take on the facility’s most dangerous creatures.',meta:'NEST ARENA · MUTATED THREATS'}
];
const DIFFICULTIES=[
 {id:'easy',name:'Recruit / Easy'},
 {id:'normal',name:'Operator / Normal'},
 {id:'hard',name:'Veteran / Hard'}
];
function readSettings(){try{return normalizeSettings(JSON.parse(compatibleStorage(localStorage).getItem(SETTINGS_KEY)??'{}'));}catch{return normalizeSettings();}}
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function button(text,action,className='menu-button'){const node=element('button',className,text);node.type='button';node.addEventListener('click',action);return node;}
function skillIcon(node){const paths={armory:'menu-armory',move:'skill-mobility',armor:'skill-armor',reload:'skill-reload',melee:'skill-melee',charge:'skill-charge',healing:'skill-triage',blast:'skill-blast'};if(!paths[node.icon])return createItemIcon(node.icon);const image=element('img','skill-icon');image.src='./assets/'+paths[node.icon]+'.svg';image.alt='';image.setAttribute('aria-hidden','true');image.width=28;image.height=28;image.draggable=false;return image;}
function formatTime(value){if(!value)return 'Time unavailable';try{const date=new Date(value);return Number.isNaN(date.getTime())?'Time unavailable':date.toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}catch{return 'Time unavailable';}}

/** DOM-only game menu. The owning game controls gameplay, save storage and settings effects. */
export function createGameMenu({overlay,onNewGame=()=>{},onPrepareOperation=()=>{},onExportBackup=null,onPreviewBackup=null,onImportBackup=null,onContinue=()=>{},onLoad=()=>{},onLoadCheckpoint=()=>{},onSave=()=>{},onPurchase=()=>{},onFieldSkill=()=>{},onRespecFieldSkills=null,onResume=()=>{},onClose=()=>{},onSettings=()=>{},getStatus=()=>({active:false,slots:[],canContinue:false})}){
 const settings=readSettings();
 const previousDifficulty=status().config?.difficulty;
 let open=false,view='main',mission='campaign',operation=CAMPAIGN_OPERATIONS[0].id,difficulty=['easy','normal','hard'].includes(previousDifficulty)?previousDifficulty:'normal',statusText='',busy=false,returnView='main',previousFocus=null,settingsTab='controls',shopTab='weapons',shopSelectedWeapon=null,shopDetailTab='upgrades',selectedSkill=null,selectedSkillBranch=null,backupPreview=null,backupFilename='',keyboardOpen=null;
 let shell=null,content=null,statusNode=null,captureAction=null,notesTab='systems',noteSelection=null,noteHint=0,revealSkillDetails=false,revealSkillTree=false,confirmTrainingReset=false;
 const compactSkills=()=>typeof matchMedia==='function'&&matchMedia('(max-width:1100px)').matches;
 const nestedScrollPositions=new Map();
 function status(){try{return getStatus()??{active:false,slots:[],canContinue:false};}catch{return {active:false,slots:[],canContinue:false};}}
 function notice(message){statusText=message;if(statusNode)statusNode.textContent=message;}
 async function action(callback,args=[],{close=true,message=''}={}){
  if(busy)return;busy=true;notice('');shell?.setAttribute('aria-busy','true');
  try{const initialView=view;const result=await callback(...args);if(result===false||result?.ok===false){if(!close)render(false);notice(result?.reason??result?.message??'That action could not be completed. Please try again.');return;}if(close){hide();}else{render(view!==initialView);notice(result?.message??message);}}
  catch(error){if(!close)render(false);notice(typeof error?.message==='string'&&error.message.trim()?error.message:'That action could not be completed. Please try again.');}
  finally{busy=false;shell?.removeAttribute('aria-busy');}
 }
 function clearConfirmations(){backupPreview=null;backupFilename='';confirmTrainingReset=false;}
 function changeView(next){if(busy)return;clearConfirmations();captureAction=null;statusText='';view=next;if(next==='missions')returnView='main';render();}
 function heading(eyebrow,title,description){if(view==='main'||view==='pause')content.append(element('h2','menu-title',title));if(description)content.append(element('p','menu-description',description));}
 function actions(){const row=element('div','menu-actions');content.append(row);return row;}
 function openPanel(next,home=view){returnView=home==='pause'?'pause':'main';changeView(next);}
 async function prepareView(next,back='main'){await action(async()=>{const result=await onPrepareOperation();if(result===false||result?.ok===false)return result;returnView=back;view=next;if(next==='campaign-map'){const done=status().completedOperations??[];operation=CAMPAIGN_OPERATIONS.find(item=>!done.includes(item.id)&&isCampaignOperationUnlocked(item.id,done))?.id??operation;}return result;},[],{close:false});}
 function homeAction(row,label,callback,detail,primary=false){const control=button('',callback,`menu-button home-action${primary?' primary':''}`);control.append(element('strong','',label));if(detail)control.append(element('small','',detail));const symbols={'Continue':'play','Resume':'play','New operation':'operation','Armory':'armory','Field notes':'notes','Saved games':'saves','Save / load':'saves','Settings':'settings','Main menu':'home'},icon=element('img','menu-action-icon');icon.src='./assets/menu-'+(symbols[label]??'operation')+'.svg';icon.alt='';icon.setAttribute('aria-hidden','true');icon.width=32;icon.height=32;control.append(icon);row.append(control);return control;}
 function latestSave(current){return current.checkpoint??null;}
 function drawMain(current){
  const hero=element('div','menu-hero');const heroCopy=element('div','menu-hero-copy');heroCopy.append(element('strong','','Every room is unknown'));const artwork=element('img','menu-keyart');artwork.src='./assets/facility-keyart.svg';artwork.alt='A lone operative facing the sealed doors of a ruined facility';hero.append(artwork,heroCopy);content.append(hero);
  const row=actions();row.classList.add('home-actions');const save=latestSave(current),missionName=MISSIONS.find(m=>m.id===save?.mission)?.name??'Saved operation';
  const continueButton=homeAction(row,'Continue',()=>action(current.active?onResume:onContinue),current.active?(CAMPAIGN_OPERATIONS.find(item=>item.id===current.config?.operation)?.name??'Current operation'):save?`${missionName} · ${save.name??'Checkpoint'} · ${formatTime(save.time)}`:'',true);continueButton.disabled=!(current.canContinue||current.active);
  homeAction(row,'New operation',()=>openPanel('missions','main'));
  homeAction(row,'Armory',()=>prepareView('armory'));
  homeAction(row,'Field notes',()=>openPanel('field-notes','main'));
  homeAction(row,'Settings',()=>openPanel('settings','main'));
 }
 function drawPause(){
  const current=status();heading('OPERATION PAUSED','Paused');
  const row=actions();row.classList.add('home-actions','pause-actions');
  homeAction(row,'Resume',()=>action(onResume),null,true);
  homeAction(row,'Field notes',()=>openPanel('field-notes','pause'));
  homeAction(row,'Settings',()=>openPanel('settings','pause'));
  homeAction(row,'Main menu',()=>changeView('main'));
  drawGuidance(current);
 }
 function drawFieldNotes(){
  heading('FIELD ARCHIVE','Field notes');
  const tabs=element('div','menu-tabs journal-tabs');for(const [id,label]of [['systems','Systems'],['mutations','Mutations']]){const tab=button('',()=>{notesTab=id;noteSelection=null;noteHint=0;render(false);},'menu-button secondary'+(notesTab===id?' selected':''));tab.append(journalIcon(id),element('span','',label));tab.setAttribute('aria-pressed',String(notesTab===id));tabs.append(tab);}content.append(tabs);
  renderFieldJournal(content,{tab:notesTab,systems:createPuzzleDiscovery().list(),mutations:status().mutationNotes??[],selected:noteSelection,onSelect:id=>{noteSelection=id;noteHint=0;render(false);if(compactSkills()){const detail=content.querySelector('.journal-detail');detail?.scrollIntoView({block:'nearest'});detail?.focus?.({preventScroll:true});}}});
 }
 function drawEquipment(current){
  const row=element('section','menu-equipment');row.setAttribute('aria-label','Medical and explosive equipment');
  const grenadeType=current.armory?.grenadeType==='fire'?'fireGrenade':'grenade';
  for(const [type,label] of [['medkit','Medkit'],[grenadeType,grenadeType==='fireGrenade'?'Fire grenade':'Frag grenade']]){
   const chip=element('div','menu-equipment-item'),text=element('div','');text.append(element('strong','',label));text.append(element('small','',`${current.armory?.items?.[type]??0}${current.active?' · '+formatKey(settings.bindings[type==='fireGrenade'?'grenade':type]):''}`));chip.append(createItemIcon(type),text);row.append(chip);
  }
  content.append(row);
 }
 function drawGuidance(current){
  const guidance=current.missionGuidance;if(!guidance||Array.isArray(guidance)&&!guidance.length)return;
  const panel=element('section','menu-guidance');panel.setAttribute('aria-label','Current mission objective');panel.append(element('strong','','Next objective'));
  if(Array.isArray(guidance)){
   const entries=guidance.filter(Boolean),next=entries.find(entry=>!entry.done);
   panel.append(element('p','',next?(typeof next==='string'?next:next.label??''):'All objectives complete.'));
   const details=element('details','mission-details');details.append(element('summary','','Mission details'));const list=element('ul');
   for(const entry of entries)list.append(element('li',entry.done?'complete':'',`${entry.done?'✓ ':''}${typeof entry==='string'?entry:entry.label??''}`));details.append(list);if(current.researchLogs?.length){const title=element('h3','','Recovered research');details.append(title);for(const log of current.researchLogs){details.append(element('strong','',log.label),element('p','',log.text));}if(current.researchLogs.length===3)details.append(element('p','','All logs recovered: the colony is receiving commands from beneath the facility.'));}panel.append(details);
  }else panel.append(element('p','',String(guidance)));content.append(panel);
 }
 function drawMissions(){
  heading('','New operation');
  const option=MISSIONS[0],card=button('',()=>prepareView('campaign-map'),'mission-card facility-campaign-card');card.dataset.focusKey='campaign-facility';
  const preview=element('div','mission-preview');preview.append(buildMissionPreview('campaign'));
  card.append(preview,element('strong','mission-name',option.name),element('span','mission-description','Descend into an infested facility.'));
  content.append(card);
 }
 function drawCampaignMap(){
  heading('','Facility descent');
  const completed=status().completedOperations??[];
  if(!isCampaignOperationUnlocked(operation,completed))operation=(CAMPAIGN_OPERATIONS.find(item=>!completed.includes(item.id)&&isCampaignOperationUnlocked(item.id,completed))??CAMPAIGN_OPERATIONS.find(item=>isCampaignOperationUnlocked(item.id,completed))??CAMPAIGN_OPERATIONS[0]).id;
  const deployment=element('div','campaign-deployment'),mapPane=element('div','campaign-map-pane'),briefing=element('div','campaign-briefing');deployment.append(mapPane,briefing);content.append(deployment);
  mapPane.append(createCampaignMap({selected:operation,onSelect:id=>{if(!CAMPAIGN_OPERATIONS.some(item=>item.id===id))return;if(!isCampaignOperationUnlocked(id,status().completedOperations??[])){notice('Complete the previous operation to unlock this location.');return;}operation=id;render(false);},completed}));
  const selected=CAMPAIGN_OPERATIONS.find(item=>item.id===operation)??CAMPAIGN_OPERATIONS[0];
  const detail=element('section','campaign-operation-detail');{const preview=element('div','mission-preview hospital-preview');preview.append(buildMissionPreview(selected.id));detail.append(preview);}detail.setAttribute('aria-live','polite');detail.append(element('h3','',selected.name),element('p','',selected.description.replace(/^Enter the ruins\. /,'')));briefing.append(detail);
  const fieldset=element('fieldset','menu-fieldset');fieldset.append(element('legend','','Difficulty'));
  const choices=element('div','difficulty-options'),personalBest=element('p','operation-best');personalBest.setAttribute('role','status');personalBest.setAttribute('aria-label','Personal best for selected operation and difficulty');
  function updatePersonalBest(){const record=status().personalBests?.[operationRecordKey({mission:'campaign',operation:selected.id,difficulty,remix:false})];personalBest.replaceChildren();personalBest.hidden=false;if(!Number.isFinite(record?.elapsed)){personalBest.append(element('span','','Personal best'),element('strong','','—'));}else{personalBest.append(element('span','','Personal best'),element('strong','',formatDuration(record.elapsed)));if(Number.isFinite(record.kills))personalBest.append(element('small','',`${Math.max(0,Math.floor(record.kills))} kills`));if(Number.isFinite(record.exploration))personalBest.append(element('small','',`${Math.round(Math.max(0,Math.min(100,record.exploration)))}% mapped`));}}
  for(const option of DIFFICULTIES){const label=element('label',`difficulty-option${difficulty===option.id?' selected':''}`),input=element('input');label.dataset.difficulty=option.id;input.type='radio';input.name='operation-difficulty';input.value=option.id;input.checked=difficulty===option.id;input.addEventListener('change',()=>{if(!input.checked)return;difficulty=option.id;for(const row of choices.children)row.className=`difficulty-option${row.dataset.difficulty===difficulty?' selected':''}`;updatePersonalBest();});input.setAttribute('aria-label',option.name);const check=element('span','difficulty-check','✓');check.setAttribute('aria-hidden','true');label.append(input,element('strong','',option.name),check);choices.append(label);}
  updatePersonalBest();fieldset.append(choices,personalBest);briefing.append(fieldset);
  const deployActions=element('div','menu-actions');briefing.append(deployActions);deployActions.append(button('Deploy',()=>{if(!isCampaignOperationUnlocked(operation,status().completedOperations??[])){notice('Complete the previous operation before deploying here.');return;}action(onNewGame,[{mission:'campaign',difficulty,operation,remix:false}]);},'menu-button primary'),button('Armory',()=>prepareView('armory','campaign-map'),'menu-button secondary'));
 }
 function drawSlots(mode,current){
  const saving=mode==='save';heading('','Saved games');
  if(!saving&&current.checkpoint){
   const checkpoint=current.checkpoint;const article=element('article','save-slot checkpoint-slot');const copy=element('div','slot-copy');
   copy.append(element('strong','slot-name',checkpoint.name??'Automatic checkpoint'),element('small','slot-meta',formatTime(checkpoint.time)));
   if(checkpoint.summary)copy.append(element('span','slot-summary',String(checkpoint.summary)));
   article.append(copy,button('Load checkpoint',()=>action(onLoadCheckpoint),'menu-button primary'));content.append(article);
  }
  const slots=Array.isArray(current.slots)?current.slots:[];
  const grid=element('div','save-slots');
  for(let slot=1;slot<=3;slot++){
   const save=slots.find(item=>item&&Number(item.slot)===slot)??(slots[slot-1]?.slot===undefined?slots[slot-1]:null);
   const article=element('article','save-slot');const copy=element('div','slot-copy');
   copy.append(element('strong','slot-name',`Slot ${slot} · ${save?.name??'Empty slot'}`));
   if(save){const missionName=MISSIONS.find(m=>m.id===save.mission)?.name??String(save.mission??'Operation');const diffName=DIFFICULTIES.find(d=>d.id===save.difficulty)?.name??String(save.difficulty??'Operator');copy.append(element('span','slot-meta',`${missionName} · ${diffName}`),element('small','slot-meta',formatTime(save.time)));if(save.summary)copy.append(element('span','slot-summary',String(save.summary)));}

   const controls=element('div','slot-actions');if(current.active){const saveButton=button(save?'Overwrite':'Save here',()=>action(onSave,[slot],{close:false,message:`Operation saved to slot ${slot}.`}),'menu-button secondary');saveButton.dataset.focusKey=`save-${slot}`;saveButton.setAttribute('aria-label',`Save operation to slot ${slot}`);controls.append(saveButton);}const loadButton=button('Load',()=>action(onLoad,[slot]),'menu-button secondary');loadButton.disabled=!save;loadButton.setAttribute('aria-label',`Load operation from slot ${slot}`);loadButton.dataset.focusKey=`load-${slot}`;controls.append(loadButton);article.append(copy,controls);grid.append(article);
  }
  content.append(grid);drawBackup();if(saving&&!current.active)content.append(element('p','menu-description','Start or load an operation before saving.'));
 }
 async function downloadBackup(){const text=await onExportBackup();const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='nulldelve-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return {message:'Backup downloaded.'};}
 function drawPersistenceWarning(current){if(!current.persistenceWarning)return;const panel=element('section','persistence-warning');panel.setAttribute('role','status');panel.append(element('strong','','Session only'),element('span','',typeof current.persistenceWarning==='string'?current.persistenceWarning:'Download a backup before closing this page.'));if(onExportBackup){const download=button('Download backup',()=>action(downloadBackup,[],{close:false}),'menu-button secondary');download.dataset.focusKey='warning-backup';panel.append(download);}shell.append(panel);}
 function drawBackup(){
  if(!onExportBackup&&!onPreviewBackup)return;
  const panel=element('section','backup-panel');panel.append(element('h3','','Progress backup'),element('p','menu-description','Checkpoint, purchases and skills.'));
  const row=element('div','menu-actions backup-actions');
  function backupButton(label,kind,callback){const control=button('',callback,'menu-button secondary');const icon=element('span','backup-icon backup-icon-'+kind);icon.setAttribute('aria-hidden','true');control.append(icon,element('span','',label));return control;}
  if(onExportBackup){const download=backupButton('Download','download',()=>action(downloadBackup,[],{close:false}));download.dataset.focusKey='backup-download';row.append(download);}
  if(onPreviewBackup){const input=element('input');input.type='file';input.hidden=true;input.accept='.json,application/json';input.setAttribute('aria-label','Backup file');input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;backupPreview=null;backupFilename=file.name??'';if(file.size>10*1024*1024){render(false);notice('Choose a backup smaller than 10 MB.');return;}await action(async()=>{const preview=await onPreviewBackup(await file.text());if(!preview||preview.ok===false||!(Number.isInteger(preview.id)&&preview.id>0||typeof preview.id==='string'&&preview.id.length>0))return {ok:false,message:preview?.message??'This backup could not be verified.'};backupPreview=preview;return {message:'Ready to restore.'};},[],{close:false});});const restore=backupButton('Restore','restore',()=>input.click());restore.setAttribute('aria-label','Choose a backup file to preview');restore.dataset.focusKey='backup-file';row.append(restore);panel.append(input);}panel.append(row);
  if(backupFilename){const name=element('p','backup-file-name',backupFilename);name.title=backupFilename;panel.append(name);}
  if(backupPreview){const preview=element('div','backup-preview');preview.append(element('strong','','Restore backup?'),element('p','menu-description','Replaces current progress.'));const confirm=button('Restore this backup',()=>action(async()=>{const result=await onImportBackup?.(backupPreview.id);if(result?.ok!==false){backupPreview=null;backupFilename='';}return result;},[],{close:false}),'menu-button danger');confirm.dataset.focusKey='backup-confirm';const controls=element('div','backup-confirm-actions');controls.append(confirm,button('Cancel',()=>{backupPreview=null;backupFilename='';render(false);},'menu-button secondary'));preview.append(controls);panel.append(preview);}content.append(panel);
 }

 function drawArmory(current){
  heading('','Armory');
  if(current.armory?.available===false){content.append(element('p','shop-status',current.armory.reason||'Available before deployment.'));return;}
  renderShop(content,{...current.armory,medkitHealing:fieldSkillEffects(current.fieldSkill).medkitHealing,bindings:settings.bindings},id=>action(onPurchase,[id],{close:false,message:'Armory updated.'}),{group:shopTab,onGroupChange:group=>{shopTab=group;render(false);},selectedWeapon:shopSelectedWeapon,onWeaponSelect:id=>{shopSelectedWeapon=id;shopDetailTab='upgrades';render(false);},detailTab:shopDetailTab,onDetailTab:tab=>{shopDetailTab=tab;render(false);}});
  if(shopTab==='skills'){
   const completed=current.completedOperations??[],state=current.skillState??{learned:[],selected:current.fieldSkill??'none'};
   selectedSkill=[...SKILL_NODES,{id:'none'}].some(node=>node.id===selectedSkill)?selectedSkill:(current.fieldSkill??'none');
   const skills=element('div','skill-tree'),map=element('div','skill-map'),details=element('section','skill-detail');
   const toolbar=element('div','skill-toolbar');skills.append(toolbar);const points=trainingPoints(state,completed),allPointsEarned=CAMPAIGN_OPERATIONS.every(operation=>completed.includes(operation.id));toolbar.append(element('p','training-balance',`${points} training points`));if(allPointsEarned&&points===0)toolbar.append(element('p','skill-requirement','All operation points earned · Reset training to try another branch'));if(onRespecFieldSkills&&state.learned.length){const reset=element('div','training-reset');if(confirmTrainingReset){reset.append(element('p','','Reset learned skills and return all training points? Your weapons and purchases stay.'),button('Reset training',()=>action(async()=>{const result=await onRespecFieldSkills();if(result?.ok!==false)confirmTrainingReset=false;return result;},[],{close:false}),'menu-button secondary'),button('Cancel',()=>{confirmTrainingReset=false;render(false);},'menu-button secondary'));}else reset.append(button('Reset training',()=>{confirmTrainingReset=true;render(false);},'menu-button secondary'));toolbar.append(reset);}
   const nodeButton=(node,tier)=>{
    const learned=node.id==='none'||state.learned.includes(node.id),available=node.id==='none'||skillLearnable(node.id,state,completed),equipped=current.fieldSkill===node.id;
    const control=button('',()=>{selectedSkill=node.id;selectedSkillBranch=SKILL_BRANCHES.find(branch=>branch.nodes.includes(node.id))?.id??selectedSkillBranch;revealSkillDetails=compactSkills();render(false);},'skill-circle'+(learned?' developed':'')+(available&&!learned?' available':'')+(equipped?' equipped':'')+(!learned&&!available?' locked':''));
    control.dataset.focusKey='skill-node-'+node.id;control.setAttribute('aria-pressed',String(selectedSkill===node.id));control.setAttribute('aria-label',`${node.name}, ${equipped?'equipped':learned?'developed':available?'available':'locked'}`);control.setAttribute('aria-controls','skill-detail');
    control.append(skillIcon(node));const badge=element('span','skill-circle-badge',equipped?'✓':!learned&&!available?'⌑':String(tier));badge.setAttribute('aria-hidden','true');control.append(badge);
    return control;
   };
   const standard=FIELD_SKILLS.find(node=>node.id==='none'),root=element('div','skill-root');root.append(nodeButton(standard,0),element('span','','Standard kit'));
   selectedSkillBranch=SKILL_BRANCHES.some(branch=>branch.id===selectedSkillBranch)?selectedSkillBranch:(SKILL_BRANCHES.find(branch=>branch.nodes.includes(selectedSkill))?.id??SKILL_BRANCHES[0].id);
   const filters=element('div','skill-branch-filters');filters.setAttribute('aria-label','Skill branches');for(const branch of SKILL_BRANCHES){const filter=button(branch.name,()=>{selectedSkillBranch=branch.id;selectedSkill=branch.nodes[0];render(false);},'skill-branch-filter');filter.setAttribute('aria-pressed',String(branch.id===selectedSkillBranch));filter.dataset.focusKey='skill-branch-'+branch.id;filters.append(filter);}map.append(filters,root);
   const branches=element('div','skill-branches');for(const branch of SKILL_BRANCHES){
    const lane=element('section','skill-branch'+(branch.id===selectedSkillBranch?' active-branch':''));lane.setAttribute('aria-label',branch.name+' branch');lane.append(element('h3','',branch.name));
    const nodes=branch.nodes.map(id=>SKILL_NODES.find(node=>node.id===id)).filter(Boolean),depth=node=>node.requires&&nodes.some(parent=>parent.id===node.requires)?1+depth(nodes.find(parent=>parent.id===node.requires)):1,maxDepth=Math.max(...nodes.map(depth));
    for(let tier=1;tier<=maxDepth;tier++){
     const tierNodes=nodes.filter(node=>depth(node)===tier),row=element('div','skill-tier'+(tierNodes.length>1?' skill-fork':''));row.dataset.depth=String(tier);row.setAttribute('style','--fork-count:'+tierNodes.length);
     for(const node of tierNodes){const holder=element('div','skill-node-wrap'+(node.requires&&state.learned.includes(node.requires)?' parent-developed':''));if(node.requires)holder.dataset.requires=node.requires;holder.append(nodeButton(node,tier),element('span','skill-node-name',node.name));row.append(holder);}lane.append(row);
    }branches.append(lane);
   }map.append(branches);
   const node=selectedSkill==='none'?standard:SKILL_NODES.find(n=>n.id===selectedSkill),learned=node.id==='none'||state.learned.includes(node.id),canLearn=skillLearnable(node.id,state,completed);
   details.id='skill-detail';details.dataset.focusKey='skill-detail';details.tabIndex=-1;details.setAttribute('aria-label','Selected skill');details.append(skillIcon(node),element('h3','',node.name),element('p','',node.description));
   const treeReturn=button('← Tree',()=>{revealSkillTree=true;render(false);},'skill-tree-return');treeReturn.dataset.focusKey='skill-tree-return';treeReturn.setAttribute('aria-label','Return to selected skill in tree');details.append(treeReturn);
   details.append(element('span','skill-equipped-summary',`Equipped: ${[...FIELD_SKILLS,...SKILL_NODES].find(skill=>skill.id===current.fieldSkill)?.name??'Standard kit'}`));
   const requirement=!fieldSkillUnlocked(node.id,completed)?`Complete ${node.unlockAfter}`:node.requires&&!state.learned.includes(node.requires)?`Develop ${SKILL_NODES.find(n=>n.id===node.requires).name} first`:points<1?(allPointsEarned?'Reset training to try another branch':'Earn a training point from your next first clear'):'1 training point';
   if(!learned)details.append(element('p','skill-requirement',requirement));
   const activate=button(current.fieldSkill===node.id?'Equipped':learned?'Equip':'Develop · 1 point',()=>{revealSkillDetails=compactSkills();return action(onFieldSkill,[learned?node.id:'learn:'+node.id],{close:false});},'menu-button skill-activate');activate.disabled=current.fieldSkill===node.id||!learned&&!canLearn;activate.dataset.focusKey='skill-activate';details.append(activate,element('small','','One skill equipped. First clears earn training points.'));
   skills.append(map,details);content.append(skills);
  }


 }
 function persist(){try{compatibleStorage(localStorage).setItem(SETTINGS_KEY,JSON.stringify(settings));}catch{}try{onSettings({...settings});}catch{notice('The display settings could not be applied.');}}
 function drawSettings(){
  heading('','Settings');
  const tabs=element('div','menu-tabs');tabs.setAttribute('aria-label','Settings categories');for(const [id,label] of [['controls','Controls'],['audio','Audio'],['display','Display'],['progress','Progress']]){const tab=button(label,()=>{settingsTab=id;render(false);},`menu-button secondary${settingsTab===id?' selected':''}`);tab.dataset.focusKey='settings-'+id;tab.setAttribute('aria-pressed',String(settingsTab===id));tabs.append(tab);}content.append(tabs);
  const grid=element('div','settings-grid');
  function range(key,title,min,max,step,format){const label=element('label','setting-row'),id=`game-setting-${key}`;label.htmlFor=id;const input=element('input');input.id=id;input.type='range';input.min=min;input.max=max;input.step=step;input.value=settings[key];const output=element('output','',format(settings[key]));output.htmlFor=id;input.addEventListener('input',()=>{settings[key]=Number(input.value);output.textContent=format(settings[key]);persist();});label.append(element('span','',title),input,output);grid.append(label);}
  function choice(key,title,options){const row=element('label','setting-row'),id=`game-setting-${key}`;row.htmlFor=id;const select=element('select');select.id=id;for(const [value,text] of options){const option=element('option','',text);option.value=value;select.append(option);}select.value=settings[key];select.addEventListener('change',()=>{settings[key]=select.value;persist();});row.append(element('span','',title),select);grid.append(row);}
  function toggle(key,title){const row=element('label','setting-row'),id=`game-setting-${key}`;row.htmlFor=id;const input=element('input');input.id=id;input.type='checkbox';input.checked=settings[key];input.addEventListener('change',()=>{settings[key]=input.checked;persist();});row.append(element('span','',title),input);grid.append(row);}
  const section=title=>{const h=element('h3','settings-section-title',title);grid.append(h);};
  if(settingsTab==='display'){range('brightness','Brightness',.7,1.5,.05,value=>`${Math.round(value*100)}%`);
  choice('quality','Graphics',[['low','Battery saver'],['medium','Balanced'],['high','Sharp']]);
  range('zoom','Camera view size',14,32,1,value=>`${value} · ${value<22?'closer':'wider'}`);
  range('hudScale','Desktop HUD size',.85,1.5,.05,value=>`${Math.round(value*100)}%`);toggle('showMinimap','Show minimap');toggle('reducedEffects','Reduce flashes and effects');}
  if(settingsTab==='audio'){toggle('muted','Mute all sound');
  for(const [key,title] of [['masterVolume','Master volume'],['sfxVolume','Effects volume'],['musicVolume','Music volume']])range(key,title,0,1,.05,value=>`${Math.round(value*100)}%`);}
  if(settingsTab==='progress')drawBackup();
  if(settingsTab==='controls'){choice('touchHandedness','Movement stick',[['right','Right side'],['left','Left side']]);choice('touchSize','Touch control size',[['normal','Normal'],['large','Large']]);choice('touchControls','Touch controls',[['auto','Automatic'],['on','On'],['off','Off']]);choice('aimMode','Desktop aiming',[['auto','Mouse + keyboard'],['mouse','Mouse only'],['keyboard','Keyboard only']]);
  const keyboard=element('details','keyboard-controls');if(keyboardOpen===null)keyboardOpen=!(settings.touchControls==='on'||settings.touchControls!=='off'&&(globalThis.matchMedia?.('(pointer: coarse)')?.matches||globalThis.navigator?.maxTouchPoints>0));keyboard.open=keyboardOpen;keyboard.addEventListener('toggle',()=>{keyboardOpen=keyboard.open;});keyboard.append(element('summary','','Keyboard controls'));
  const note=element('p','settings-controls-note','Select a control, then press a key. Esc cancels.');keyboard.append(note);
  const bindings=element('div','binding-grid');
  for(const key of BINDING_ACTIONS){const row=element('div','binding-row');row.append(element('span','',ACTION_LABELS[key]));const control=button(formatKey(settings.bindings[key]),()=>{captureAction=key;for(const other of bindings.querySelectorAll('button'))other.classList.remove('capturing');control.classList.add('capturing');control.textContent='Press a key…';notice(`Choose a key for ${ACTION_LABELS[key].toLowerCase()}. Escape cancels.`);},'menu-button secondary binding-button');control.dataset.action=key;control.dataset.focusKey='binding-'+key;control.setAttribute('aria-label',`Change ${ACTION_LABELS[key].toLowerCase()} key, currently ${formatKey(settings.bindings[key])}`);row.append(control);bindings.append(row);}
  keyboard.append(bindings);grid.append(keyboard);}content.append(grid);
  const settingsActions=actions();if(settingsTab!=='progress')settingsActions.append(button('Restore defaults',()=>{captureAction=null;const defaults=normalizeSettings();const keys=settingsTab==='controls'?['bindings','aimMode','touchControls','touchHandedness','touchSize']:settingsTab==='audio'?['muted','masterVolume','sfxVolume','musicVolume']:['brightness','quality','zoom','hudScale','showMinimap','reducedEffects'];for(const key of keys)if(key in defaults)settings[key]=defaults[key];persist();render(false);},'menu-button secondary'));
 }

 function render(focus=true){
  if(!open)return;for(const node of content?.querySelectorAll('nav')??[])if(node.dataset.scrollKey)nestedScrollPositions.set(node.dataset.scrollKey,{left:node.scrollLeft,top:node.scrollTop});const oldFocus=document.activeElement,oldScroll=content?.scrollTop??0;const focusKey=oldFocus?.dataset?.focusKey??oldFocus?.dataset?.offerId??oldFocus?.dataset?.action??oldFocus?.id;const focusIndex=shell?[...shell.querySelectorAll('button,input,select,summary')].indexOf(oldFocus):-1;captureAction=null;const current=status();overlay.replaceChildren();overlay.classList.add('menu-overlay');
  shell=element('div','game-menu');shell.dataset.view=view;shell.setAttribute('role','dialog');shell.setAttribute('aria-modal','true');shell.setAttribute('aria-label','Nulldelve game menu');
  if(view==='main'||view==='pause'){const brand=element('header','menu-brand');brand.append(element('h1','','NULLDELVE'));shell.append(brand);}else{
   const navigation=element('nav','menu-navigation');navigation.setAttribute('aria-label','Menu navigation');const control=button('',()=>back(),'menu-button menu-back-control'),arrow=element('span','menu-back-arrow');arrow.setAttribute('aria-hidden','true');control.append(arrow,element('span','','Back'));control.dataset.focusKey='navigation-back';navigation.append(control,element('h2','menu-navigation-title',{'missions':'New operation','campaign-map':'Facility descent','armory':'Armory','settings':'Settings','field-notes':'Field notes','save':'Save','load':'Load','saves':'Checkpoints'}[view]??'Menu'));shell.append(navigation);
  }drawPersistenceWarning(current);
  const layout=element('div','menu-layout');content=element('main','menu-content');content.setAttribute('aria-label',view==='pause'?'Pause menu':view==='main'?'Main menu':view==='saves'?'Saved games':view);layout.append(content);shell.append(layout);
  if(view==='field-notes')drawFieldNotes();else if(view==='pause')drawPause();else if(view==='missions')drawMissions();else if(view==='campaign-map')drawCampaignMap();else if(['save','load','saves'].includes(view))drawSlots(view,current);else if(view==='settings')drawSettings();else if(view==='armory')drawArmory(current);else drawMain(current);
  statusNode=element('p','menu-status',statusText);statusNode.setAttribute('role','status');statusNode.setAttribute('aria-live','polite');shell.append(statusNode);
  const footer=element('footer','preview-footer');footer.append(element('span','','EARLY PREVIEW · r47'));const feedback=element('a','','Report an issue ↗');feedback.href='https://github.com/ajavadinezhad/nulldelve/issues/new?template=bug_report.yml';feedback.target='_blank';feedback.rel='noopener noreferrer';feedback.setAttribute('aria-label','Report an issue on GitHub (opens a new tab)');footer.append(feedback);shell.append(footer);overlay.append(shell);overlay.style.display='flex';
  for(const node of content.querySelectorAll('nav')){const saved=nestedScrollPositions.get(node.dataset.scrollKey);if(saved){node.scrollLeft=saved.left;node.scrollTop=saved.top;}}
  const candidates=[...shell.querySelectorAll('button:not(:disabled),input,select,summary')];let target=focus?candidates[0]:candidates.find(node=>focusKey&&(node.dataset.focusKey===focusKey||node.dataset.offerId===focusKey||node.dataset.action===focusKey||node.id===focusKey))??candidates[Math.max(0,Math.min(focusIndex,candidates.length-1))];if(!focus)content.scrollTop=oldScroll;target?.focus({preventScroll:true});
  if(view==='armory'&&shopTab==='skills'&&(revealSkillDetails||revealSkillTree)){
   const detail=revealSkillDetails,revealTarget=detail?[...content.querySelectorAll('section')].find(node=>node.id==='skill-detail'):[...content.querySelectorAll('button')].find(node=>node.dataset.focusKey==='skill-node-'+selectedSkill);
   revealSkillDetails=revealSkillTree=false;revealTarget?.focus?.({preventScroll:true});revealTarget?.scrollIntoView?.({block:detail?'nearest':'center'});
  }
 }
 function show(next='main'){
  if(!open)previousFocus=document.activeElement;
  if(next==='campaign-map'){const current=status(),done=current.completedOperations??[];operation=CAMPAIGN_OPERATIONS.find(item=>!done.includes(item.id)&&isCampaignOperationUnlocked(item.id,done))?.id??operation;if(['easy','normal','hard'].includes(current.config?.difficulty))difficulty=current.config.difficulty;}
  clearConfirmations();open=true;busy=false;view=['main','pause','missions','campaign-map','save','load','saves','settings','armory'].includes(next)?next:'main';returnView=next==='pause'?'pause':status().active?'pause':'main';statusText='';render();
 }
 function back(){if(!open)return false;if(busy)return true;if(captureAction){captureAction=null;render(false);notice('Key change cancelled.');return true;}if(backupPreview||confirmTrainingReset){clearConfirmations();render(false);notice('Cancelled.');return true;}if(view==='pause')action(onResume);else if(view==='campaign-map')changeView('missions');else if(view!=='main')changeView(returnView);else if(status().active)changeView('pause');else return false;return true;}
 function hide(){clearConfirmations();captureAction=null;open=false;overlay.style.display='none';overlay.classList.remove('menu-overlay');if(previousFocus?.isConnected)previousFocus.focus?.({preventScroll:true});onClose();}
 overlay.addEventListener('keydown',event=>{
  if(!open)return;
  if(event.code==='Escape'){event.preventDefault();event.stopImmediatePropagation();back();return;}
  if(!captureAction)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(event.code==='Escape'){captureAction=null;render(false);notice('Key change cancelled.');return;}
  if(event.repeat)return;
  const result=validateBinding(settings.bindings,captureAction,event.code);
  if(!result.ok){notice(result.message);return;}
  settings.bindings[captureAction]=event.code;captureAction=null;persist();render(false);notice(result.message);
 },true);
 // Keep keyboard focus inside the modal while it is visible. Gameplay key filtering
 // belongs to the owner, which can query isOpen() before processing input.
 overlay.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;const panel=open?overlay:overlay.querySelector('.result-panel');if(!panel)return;
  const controls=[...panel.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),summary,iframe,a[href]')].filter(node=>!node.hidden&&node.getAttribute?.('aria-hidden')!=='true'&&(!node.getClientRects||node.getClientRects().length>0));if(!controls.length)return;
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&(document.activeElement===first||!panel.contains(document.activeElement))){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&(document.activeElement===last||!panel.contains(document.activeElement))){event.preventDefault();first.focus();}
 });
 show('main');
 return {show,hide,back,refresh:()=>render(false),isOpen:()=>open,settings};
}
