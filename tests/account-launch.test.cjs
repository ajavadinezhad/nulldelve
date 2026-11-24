const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {shouldShowWelcome,markWelcomeSeen}=require('../src/player-identity.js');
const main=fs.readFileSync('src/main.js','utf8'),start=main.indexOf("void(async()=>{try{const response=await fetch('backend-config.json'"),end=main.indexOf('})();',start)+5,source=main.slice(start,end).replace(/^void/,'');
async function launch({signedIn=false,profile=null,active=false,seen=false}={}){
 const shown=[],calls=[];const state={configured:true,signedIn,profile,profileLoaded:true};const values=new Map(seen?[['nulldelve.welcome.seen.v1','1']]:[]),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};let paused=false;
 const context={shouldShowWelcome,markWelcomeSeen,browserStorage:()=>storage,active,paused:false,fetch:async()=>({ok:true,json:async()=>({supabaseUrl:'test',publishableKey:'public'})}),cloudAccount:{init:async()=>{},consumeSignInLink:async()=>{},getState:()=>state,fetchProfile:async()=>{calls.push('profile');return profile;}},updatePlayerIdentity:()=>{},cloudSync:{connect:async()=>calls.push('sync')},menu:{show:view=>shown.push(view),isOpen:()=>true,refresh:()=>{}},pauseRun:()=>{paused=true;},latestSnapshot:()=>{throw Error('Existing checkpoint must not skip sign-in');}};
 vm.createContext(context);await vm.runInContext(source,context);return {shown,calls,paused};
}
test('unsigned launches go straight to Google entry even when local progress already exists',async()=>{const result=await launch();assert.deepEqual(result.shown,['welcome']);assert.equal(result.paused,false);assert.deepEqual(result.calls,[]);});
test('direct mission links pause safely behind first-time sign-in instead of bypassing it',async()=>{const result=await launch({active:true});assert.deepEqual(result.shown,['welcome']);assert.equal(result.paused,true);});
test('new Google accounts open operator creation while returning completed identities go to cloud sync',async()=>{assert.deepEqual((await launch({signedIn:true})).shown,['welcome']);const result=await launch({signedIn:true,profile:{username:'operator',displayName:'Operator',avatar:'raven'}});assert.deepEqual(result.shown,[]);assert.deepEqual(result.calls,['profile','sync']);});

test('refreshing after seeing welcome does not repeatedly ask unsigned players to sign in',async()=>{const result=await launch({seen:true});assert.deepEqual(result.shown,[]);assert.deepEqual(result.calls,[]);});
