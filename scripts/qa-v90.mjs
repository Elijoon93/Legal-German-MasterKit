import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const required=[
  'assets/js/v90-shell.js','assets/js/v90-routing.js','assets/css/v90-foundation.css','release-v9.0.json','release-v8.7.json','release-v8.8.json',
  'assets/js/v87-legal-evidence-data.js','assets/js/v88-deep-lessons-data.js','index.html','manifest.webmanifest','service-worker.js'
];
let failed=0;
const pass=(name,detail='')=>console.log(`PASS ${name}${detail?` — ${detail}`:''}`);
const fail=(name,detail='')=>{failed++;console.error(`FAIL ${name}${detail?` — ${detail}`:''}`)};
for(const file of required)fs.existsSync(file)?pass('file',file):fail('file',file);

const index=fs.readFileSync('index.html','utf8');
const jsFiles=[...index.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"/g)].map(x=>x[1]);
for(const file of jsFiles){
  if(!fs.existsSync(file)){fail('loaded JS missing',file);continue}
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('syntax',file):fail('syntax',`${file}: ${result.stderr||result.stdout}`);
}

for(const token of ['Legal German MasterKit v9.0.0','v90-foundation.css?v=900','v90-shell.js?v=900','v90-routing.js?v=900','id="deviceAcceptance"','id="researchHub"'])index.includes(token)?pass('index token',token):fail('index token',token);
for(const removed of ['v84-pflege-inspired.css','v86-mobile-acceptance.css','v86-mobile-hotfix.css','v89-architecture.css','v84-shell.js','v84-hotfix.js','v89-architecture.js','v86-force-refresh.js'])!index.includes(removed)?pass('legacy removed',removed):fail('legacy still loaded',removed);
const cssLinks=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
cssLinks.length===7?pass('stylesheet count','7'):fail('stylesheet count',String(cssLinks.length));
new Set(cssLinks).size===cssLinks.length?pass('stylesheet uniqueness','7 unique'):fail('duplicate stylesheets');

try{
  const context={window:{}};vm.createContext(context);
  vm.runInContext(fs.readFileSync('assets/js/v87-legal-evidence-data.js','utf8'),context,{filename:'v87-legal-evidence-data.js'});
  const evidence=context.window.LGMK_V87_DATA;
  evidence?.norms?.length===24?pass('v8.7 norm count','24'):fail('v8.7 norm count',String(evidence?.norms?.length));
  evidence?.cases?.length===13?pass('v8.7 case count','13'):fail('v8.7 case count',String(evidence?.cases?.length));
  evidence?.norms?.every(x=>/^https:\/\//.test(x.officialUrl)&&x.lastChecked)?pass('v8.7 official metadata','complete'):fail('v8.7 official metadata');
}catch(error){fail('v8.7 data evaluation',error.message)}

try{
  const context={window:{}};vm.createContext(context);
  vm.runInContext(fs.readFileSync('assets/js/v88-deep-lessons-data.js','utf8'),context,{filename:'v88-deep-lessons-data.js'});
  const lessons=context.window.LGMK_V88_DATA;
  lessons?.lessons?.length===30?pass('v8.8 lesson count','30'):fail('v8.8 lesson count',String(lessons?.lessons?.length));
  new Set(lessons?.lessons?.map(x=>x.courseId)).size===10?pass('v8.8 course coverage','10'):fail('v8.8 course coverage');
  lessons?.submissionChecklist?.length===13?pass('v8.8 checklist count','13'):fail('v8.8 checklist count',String(lessons?.submissionChecklist?.length));
  lessons?.submissionChecklist?.filter(x=>x.required).length===12?pass('v8.8 required gates','12'):fail('v8.8 required gates');
}catch(error){fail('v8.8 data evaluation',error.message)}

const release=JSON.parse(fs.readFileSync('release-v9.0.json','utf8'));
release.version==='9.0.0'?pass('release version',release.version):fail('release version',release.version);
release.device_acceptance?.profiles===9?pass('device profiles','9'):fail('device profiles',String(release.device_acceptance?.profiles));
release.architecture?.mobile_primary_tabs===5?pass('mobile primary tabs','5'):fail('mobile primary tabs',String(release.architecture?.mobile_primary_tabs));
release.release_gates?.state_reset===false?pass('state preservation','locked'):fail('state preservation','not locked');
release.release_gates?.public_runtime_verification===true?pass('public runtime gate','required'):fail('public runtime gate');
Array.isArray(release.architecture?.final_runtime)&&release.architecture.final_runtime.length===2?pass('final runtime modules','2'):fail('final runtime modules');

const shell=fs.readFileSync('assets/js/v90-shell.js','utf8');
for(const token of ['const VERSION="9.0.0"','const PROFILES=[','deviceAcceptance','runMatrix','collectMetrics','v90-mobile-nav'])shell.includes(token)?pass('runtime token',token):fail('runtime token',token);
index.includes('viewport-fit=cover')?pass('viewport-fit cover'):fail('viewport-fit cover');
!shell.includes('localStorage.clear(')?pass('no localStorage.clear'):fail('forbidden localStorage.clear');
!shell.includes('indexedDB.deleteDatabase(')?pass('no indexedDB.deleteDatabase'):fail('forbidden indexedDB.deleteDatabase');
const routing=fs.readFileSync('assets/js/v90-routing.js','utf8');
routing.includes('route.closest("#mainNav")')&&routing.includes('go(view)')?pass('independent internal routing','present'):fail('independent internal routing');
!routing.includes('localStorage.clear(')&&!routing.includes('indexedDB.deleteDatabase(')?pass('routing preserves state'):fail('routing destructive call');
const primaryBlock=shell.match(/const PRIMARY=\[(.*?)\];/s)?.[1]||'';
(primaryBlock.match(/\["/g)||[]).length===5?pass('primary route count','5'):fail('primary route count',String((primaryBlock.match(/\["/g)||[]).length));
const profileBlock=shell.match(/const PROFILES=\[(.*?)\];/s)?.[1]||'';
(profileBlock.match(/\{id:/g)||[]).length===9?pass('profile definition count','9'):fail('profile definition count',String((profileBlock.match(/\{id:/g)||[]).length));

const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
manifest.name.includes('v9.0.0')?pass('manifest version',manifest.name):fail('manifest version',manifest.name);
manifest.start_url.includes('9.0.0')?pass('manifest start_url',manifest.start_url):fail('manifest start_url',manifest.start_url);
manifest.display==='standalone'?pass('manifest display','standalone'):fail('manifest display',manifest.display);

const sw=fs.readFileSync('service-worker.js','utf8');
for(const token of ['lgmk-v9-0-consolidated','release-v9.0.json','v90-foundation.css?v=900','v90-shell.js?v=900','v90-routing.js?v=900'])sw.includes(token)?pass('cache token',token):fail('cache token',token);
for(const removed of ['v89-architecture.css','v89-architecture.js','v86-mobile-acceptance.js','v86-force-refresh.js'])!sw.includes(removed)?pass('obsolete cache removed',removed):fail('obsolete cache retained',removed);

const css=fs.readFileSync('assets/css/v90-foundation.css','utf8');
for(const token of ['grid-template-columns:repeat(5','env(safe-area-inset-bottom','font-size:16px!important','v90-keyboard-open','@media(max-width:1024px)'])css.includes(token)?pass('responsive token',token):fail('responsive token',token);

if(failed){console.error(`\n${failed} cumulative v9.0 gate(s) failed.`);process.exit(1)}
console.log('\nAll cumulative v9.0 content, consolidation and device gates passed.');
