const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {normalizePlayerIdentity,PLAYER_AVATARS,avatarPath}=require('../src/player-identity.js');
test('identity normalization supports Unicode display names but rejects markup, controls, long names and arbitrary image URLs',()=>{
 assert.deepEqual(normalizePlayerIdentity({username:'  AJ_123 ',display_name:' احمد ',avatar:'raven'}),{username:'aj_123',displayName:'احمد',avatar:'raven'});
 const base={username:'operator',displayName:'Operative',avatar:'sentinel'};
 for(const username of ['ab','1name','a name','a'.repeat(21),'<script>'])assert.equal(normalizePlayerIdentity({...base,username}),null);
 for(const displayName of ['','<img src=x>','name\u202ereverse','a'.repeat(25),'\u0000'])assert.equal(normalizePlayerIdentity({...base,displayName}),null);
 assert.equal(normalizePlayerIdentity({...base,avatar:'https://tracker.example/'}),null);assert.equal(PLAYER_AVATARS.length,8);
 for(const id of PLAYER_AVATARS){assert.ok(fs.existsSync(avatarPath(id)));assert.doesNotMatch(fs.readFileSync(avatarPath(id),'utf8'),/script|https?:\/\/[^w]/);}
 assert.equal(avatarPath('../secret'),'./assets/avatars/sentinel.svg');
});
test('profile schema reserves usernames atomically and only exposes the authenticated owners profile',()=>{const s=fs.readFileSync('supabase/migrations/202611240002_player_profiles.sql','utf8');for(const pattern of [/username text not null unique/,/on delete cascade/,/enable row level security/,/revoke all on table public.player_profiles from anon, authenticated/,/using \(\(select auth.uid\(\)\)=user_id\)/,/owner_id uuid := auth.uid\(\)/,/security definer set search_path = ''/,/exception when unique_violation then return jsonb_build_object\('error','USERNAME_TAKEN'\)/])assert.match(s,pattern);assert.doesNotMatch(s,/p_user_id|grant (insert|update|all) on table/);});

test('mandatory account access ignores the old welcome-seen flag and requires Google plus a valid completed profile',()=>{const {operatorAccessReady,shouldShowWelcome}=require('../src/player-identity.js'),profile={username:'operator',displayName:'Operator',avatar:'raven'},ready={configured:true,signedIn:true,googleVerified:true,profileLoaded:true,profile};assert.equal(operatorAccessReady(ready),true);assert.equal(shouldShowWelcome(ready),false);for(const key of ['configured','signedIn','googleVerified','profileLoaded']){assert.equal(operatorAccessReady({...ready,[key]:false}),false);assert.equal(shouldShowWelcome({...ready,[key]:false},{getItem:()=> '1'}),true);}assert.equal(operatorAccessReady({...ready,profile:null}),false);});
