const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const activity=fs.readFileSync('android/app/src/main/java/com/ajavadinezhad/nulldelve/MainActivity.java','utf8');
test('native renderer death is handled without evaluating or overwriting the failed game',()=>{
 const start=activity.indexOf('private boolean recoverRenderer('),end=activity.indexOf('private void showRendererRecovery()',start),body=activity.slice(start,end);
 assert.match(activity,/boolean onRenderProcessGone\(WebView view, RenderProcessGoneDetail detail\)/);assert.match(body,/game = null/);assert.match(body,/fileResult = null/);assert.match(body,/pendingBackup = null/);assert.match(body,/removeView\(failed\)/);assert.match(body,/failed.destroy\(\)/);assert.match(body,/return true/);assert.doesNotMatch(body,/evaluateJavascript|localStorage|setItem|saveCheckpoint/);
 assert.match(activity,/setPositiveButton\("Restart game", \(dialog, which\) -> recreate\(\)\)/);assert.match(activity,/if \(game == null\) \{ showRendererRecovery\(\); return; \}/);assert.match(activity,/game != current/);assert.match(activity,/game != exportView/);assert.match(activity,/if \(view != game\)/);assert.match(activity,/if \(!foreground \|\|/);assert.match(activity,/else showRendererRecovery\(\)/);assert.match(activity,/if \(game != null\) \{\s*game.evaluateJavascript\("window.dispatchEvent\(new Event\('blur'\)\)/);
});
test('the actual pure-Java backend origin policy rejects scripts, other hosts and malformed config',t=>{
 const bin=name=>process.env.JAVA_HOME?path.join(process.env.JAVA_HOME,'bin',name):name;
 const available=spawnSync(bin('javac'),['-version'],{encoding:'utf8'});if(available.error?.code==='ENOENT'){t.skip('JDK required for native policy verification');return;}
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'nulldelve-policy-'));
 try{const compile=spawnSync(bin('javac'),['-d',temporary,'android/app/src/main/java/com/ajavadinezhad/nulldelve/BackendOriginPolicy.java','tests/fixtures/android/BackendOriginPolicyTest.java'],{encoding:'utf8'});assert.equal(compile.status,0,compile.stderr);const run=spawnSync(bin('java'),['-cp',temporary,'com.ajavadinezhad.nulldelve.BackendOriginPolicyTest'],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);assert.match(run.stdout,/checks passed/);}finally{fs.rmSync(temporary,{recursive:true,force:true});}
});
test('Android runtime packaging declares optional network access but excludes test tools and private sources',()=>{
 const manifest=fs.readFileSync('android/app/src/main/AndroidManifest.xml','utf8'),gradle=fs.readFileSync('android/app/build.gradle','utf8');assert.match(manifest,/android.permission.INTERNET/);assert.match(manifest,/usesCleartextTraffic="false"/);assert.match(gradle,/backend-config.json/);assert.match(gradle,/privacy.html/);assert.match(gradle,/account-deletion.html/);assert.match(gradle,/src\/runtime-\*\.js/);assert.match(gradle,/verifyReleaseSigning/);assert.doesNotMatch(gradle,/include ['"](?:docs|tests|\.codex|android)\//);
});
test('package verifier catches stale files, leaked tools and private backend credentials',()=>{
 const program=String.raw`
import tempfile, pathlib, zipfile, importlib.util, json, base64
spec=importlib.util.spec_from_file_location('verifier','tools/verify-android-assets.py'); module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
with tempfile.TemporaryDirectory(prefix='nulldelve-package-') as temporary:
 root=pathlib.Path(temporary);(root/'src').mkdir();(root/'styles').mkdir();(root/'assets').mkdir();(root/'vendor').mkdir()
 (root/'index.html').write_text('<canvas></canvas>');(root/'src/main.js').write_text('const version=1;');(root/'backend-config.json').write_text(json.dumps({'supabaseUrl':'','publishableKey':''}))
 artifact=root/'preview.apk'
 def package(extra=None):
  with zipfile.ZipFile(artifact,'w') as archive:
   for name in module.runtime_paths(root):archive.writestr('assets/game/'+name,(root/name).read_bytes())
   if extra:archive.writestr('assets/game/'+extra,'private')
 def rejected():
  try:module.verify(artifact,root)
  except ValueError:return
  raise AssertionError('invalid package accepted')
 package();assert module.verify(artifact,root)['exactSourceMatch']
 (root/'src/main.js').write_text('const version=2;');rejected()
 package('src/runtime-secret.js');rejected()
 package();encoded=base64.urlsafe_b64encode(b'{"role":"service_role"}').decode().rstrip('=')
 for key in ['sb_secret_do-not-bundle','header.'+encoded+'.signature']:
  (root/'backend-config.json').write_text(json.dumps({'supabaseUrl':'','publishableKey':key}));rejected()
 print('Package verifier fixtures passed')
`;
 const result=spawnSync('python3',['-c',program],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/fixtures passed/);
});
test('bundled privacy and account documents stay in a native document view without exporting the game bridge',()=>{
 const begin=activity.indexOf('private WebView createDocumentPopup('),end=activity.indexOf('private BackendOriginPolicy loadBackendPolicy()',begin),popup=activity.slice(begin,end);assert.ok(begin>0&&end>begin);assert.match(activity,/WebView popup = createDocumentPopup\(loader\)/);assert.match(popup,/loader.shouldInterceptRequest/);assert.match(popup,/if \(isLocal\(request.getUrl\(\)\)\)/);assert.match(popup,/R.string.back_to_game/);assert.match(popup,/popup.destroy\(\)/);assert.doesNotMatch(popup,/addJavascriptInterface/);assert.match(activity,/if \(documentDialog != null\) \{ closeDocument\(\); return; \}/);
});

test('all Android backup domains exclude account sessions and local game state on old and new Android versions',()=>{
 const manifest=fs.readFileSync('android/app/src/main/AndroidManifest.xml','utf8');assert.match(manifest,/allowBackup="false"/);assert.match(manifest,/fullBackupContent="@xml\/backup_rules"/);assert.match(manifest,/dataExtractionRules="@xml\/data_extraction_rules"/);
 for(const name of ['backup_rules','data_extraction_rules']){const xml=fs.readFileSync('android/app/src/main/res/xml/'+name+'.xml','utf8');for(const domain of ['root','file','database','sharedpref','external','device_root','device_file','device_database','device_sharedpref'])assert.ok(xml.includes('domain="'+domain+'" path="."'),domain+' must be excluded');if(name==='data_extraction_rules'){assert.match(xml,/<cloud-backup>/);assert.match(xml,/<device-transfer>/);}}
});
