import {createClient} from 'npm:@supabase/supabase-js@2.49.8';

// These environment variables are server-only. Never copy the service-role key
// into backend-config.js, an APK, the web repository, or a client request.
Deno.serve(async request=>{
 const allowed=(Deno.env.get('ALLOWED_ORIGINS')??'https://ajavadinezhad.github.io,https://appassets.androidplatform.net').split(',').map(value=>value.trim()).filter(Boolean);
 const origin=request.headers.get('Origin'),cors={'Vary':'Origin',...(origin&&allowed.includes(origin)?{'Access-Control-Allow-Origin':origin}:{})};
 const reply=(status:number,value:Record<string,unknown>)=>new Response(JSON.stringify(value),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(origin&&!allowed.includes(origin))return reply(403,{error:'Origin not allowed'});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Max-Age':'600'}});
 if(request.method!=='POST')return reply(405,{error:'Method not allowed'});
 const authorization=request.headers.get('Authorization')??'';
 if(!/^Bearer [^\s]+$/.test(authorization))return reply(401,{error:'Sign in required'});
 const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!anon||!service)return reply(503,{error:'Account deletion is unavailable'});
 try{
  const caller=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:authorization}}});
  // Validate with Auth; never trust a decoded JWT, submitted email, or body ID.
  const {data,error}=await caller.auth.getUser(authorization.slice(7));
  if(error||!data.user?.id)return reply(401,{error:'Sign in required'});
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const deleted=await admin.auth.admin.deleteUser(data.user.id,false);
  if(deleted.error)return reply(503,{error:'Account deletion could not be completed'});
  // cloud_saves is removed by its auth.users ON DELETE CASCADE foreign key.
  return reply(200,{ok:true});
 }catch{return reply(503,{error:'Account deletion could not be completed'});}
});
