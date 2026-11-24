import {PLAYER_AVATARS,avatarPath} from './player-identity.js?v=operator-profile-r58';
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
/** Account actions live inside the existing scrollable, focus-trapped menu. */
export function renderAccount(host,{state={},draft={},onAction=()=>{}}={}){
 const panel=el('section');panel.className='account-panel';panel.setAttribute('aria-label','Account and cloud progress');host.append(panel);
 const p=text=>panel.append(el('p',text));
 const action=(text,id,disabled=false)=>{const b=el('button',text);b.type='button';b.className='menu-button secondary';b.disabled=disabled||!!state.pending;b.onclick=()=>onAction(id,{email:draft.email??'',code:draft.code??''});panel.append(b);return b;};
 panel.append(el('h3',!state.configured?'Account':!state.signedIn?'Welcome to Nulldelve':state.profile?'Your operator':'Create your operator')); 
 if(!state.configured){p('Cloud saves are not available in this build. Your checkpoints stay on this device.');return;}
 if(!state.signedIn){
  p('Your operator. Your progress.');
  if(state.status&&state.status!=='Sign in to sync your progress.')p(state.status);
  action('Continue with Google','google').className='menu-button primary';
  p('Google handles sign-in. We never ask for your Google password.');
  const privacy=el('a','Privacy policy');privacy.href='privacy.html';privacy.target='_blank';privacy.rel='noopener noreferrer';panel.append(privacy);
 }else{
  if(state.profileLoaded===false){p('Loading your operator…');action('Retry connection','reconnect');action('Sign out','signout');return;}
  if(state.profileLoaded===true&&(!state.profile||draft.editProfile)){
   if(state.profile)panel.append(el('h4','Edit operator'));
   const form=el('form');form.className='account-form identity-form';
   const input=(label,key,max)=>{const wrapper=el('label',label),field=el('input');field.type='text';field.required=true;field.maxLength=max;field.value=draft[key]??state.profile?.[key]??'';field.autocomplete=key==='username'?'username':'nickname';field.oninput=()=>draft[key]=field.value;wrapper.append(field);form.append(wrapper);return field;};
   const username=input('Username','username',20);username.minLength=3;username.pattern='[a-zA-Z][a-zA-Z0-9_]{2,19}';username.setAttribute('aria-describedby','username-help');const help=el('small','3–20 letters, numbers or underscores. Starts with a letter.');help.id='username-help';form.append(help);
   const display=input('Display name','displayName',48);draft.avatar=draft.avatar??state.profile?.avatar??PLAYER_AVATARS[0];
   const avatars=el('fieldset'),legend=el('legend','Choose an avatar'),grid=el('div');grid.className='avatar-grid';avatars.append(legend,grid);const buttons=[];
   for(const id of PLAYER_AVATARS){const choice=el('button');choice.type='button';choice.className='avatar-option';choice.setAttribute('aria-label',id[0].toUpperCase()+id.slice(1));choice.setAttribute('aria-pressed',String(draft.avatar===id));const image=el('img');image.src=avatarPath(id);image.alt='';image.width=56;image.height=56;choice.append(image);choice.onclick=()=>{draft.avatar=id;for(const [key,node]of buttons)node.setAttribute('aria-pressed',String(key===id));};choice.disabled=!!state.pending;buttons.push([id,choice]);grid.append(choice);}form.append(avatars);
   const save=el('button',state.profile?'Save operator':'Enter Nulldelve');save.type='submit';save.className='menu-button primary';save.disabled=!!state.pending;form.append(save);form.onsubmit=event=>{event.preventDefault();if(form.reportValidity&&!form.reportValidity())return;onAction('profile',{username:username.value,displayName:display.value,avatar:draft.avatar});};panel.append(form);action('Sign out','signout');return;
  }
  if(state.profile){const card=el('div');card.className='operator-card';const avatar=el('img');avatar.src=avatarPath(state.profile.avatar);avatar.alt='';avatar.width=56;avatar.height=56;const names=el('div');names.append(el('strong',state.profile.displayName),el('small','@'+state.profile.username));card.append(avatar,names);panel.append(card);action('Edit operator','edit-profile');}
  p(state.email??'Signed in');p(state.needsChoice?'Choose progress before cloud saving starts.':state.lastSaved?'Checkpoint saved to cloud.':'Checkpoints save automatically when online.');
  if(state.error){const message=el('p',state.error);message.setAttribute('role','status');panel.append(message);}
  if(state.needsChoice){
   if(state.hasRemote)action(draft.cloudConfirm?'Confirm: replace local with cloud':'Continue cloud progress',draft.cloudConfirm?'cloud':'confirm-cloud');
   action(draft.replaceConfirm?'Confirm: replace cloud with this device':'Keep this device’s progress',draft.replaceConfirm?'device':'confirm-device');
  }else if(state.error)action('Reconnect cloud saves','reconnect');
  action('Sign out','signout');
  const deletion=el('details'),summary=el('summary','Delete account');deletion.append(summary,el('p','Permanently deletes your account and cloud progress. The local checkpoint stays on this device.'));
  const confirm=el('input');confirm.placeholder='Type DELETE';confirm.setAttribute('aria-label','Type DELETE to confirm account deletion');confirm.autocomplete='off';const remove=el('button','Permanently delete account');remove.type='button';remove.className='menu-button secondary';remove.disabled=true;confirm.oninput=()=>remove.disabled=confirm.value!=='DELETE'||!!state.pending;remove.onclick=()=>onAction('delete');deletion.append(confirm,remove);panel.append(deletion);
 }
}
