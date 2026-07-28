import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const required=[
  'assets/js/v92-adaptive.js','assets/js/v92-device.js','assets/css/v92-adaptive-shell.css','release-v9.2.json',
  'assets/js/v91-architecture.js','assets/css/v91-fidelity.css','assets/js/v90-shell.js','assets/js/v90-routing.js',
  'assets/js/v87-legal-evidence-data.js','assets/js/v88-deep-lessons-data.js','index.html','manifest.webmanifest','service-worker.js'
];
let failed=0;
const pass=(name,detail='')=>console.log(`PASS ${name}${detail?` — ${detail}`:''}`);
const fail=(name,detail='')=>{failed++;console.error(`FAIL ${name}${detail?` — ${detail}`:''}`)};
for(const file of required)fs.existsSync(file)?pass('file',file):fail('file missing',file);

const index=fs.readFileSync('index.html','utf8');
const jsFiles=[...index.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"/g)].map(x=>x[1]);
for(const file of jsFiles){
  if(!fs.existsSync(file)){fail('loaded JS missing',file);continue}
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('syntax',file):fail('syntax',`${file}: ${result.stderr||result.stdout}`);
}
for(const token of ['Legal German MasterKit v9.2.0','manifest.webmanifest?v=920','v92-adaptive-shell.css?v=920','v92-adaptive.js?v=920','v92-device.js?v=920','id="deviceAcceptance"'])index.includes(token)?pass('index token',token):fail('index token',token);
!index.includes('v91-device.js')?pass('stale device runtime removed'):fail('stale v91 device runtime loaded');
const cssLinks=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
cssLinks.length===9?pass('stylesheet count','9'):fail('stylesheet count',String(cssLinks.length));
new Set(cssLinks).size===cssLinks.length?pass('stylesheet uniqueness','9 unique'):fail('duplicate stylesheets');
index.indexOf('v92-adaptive-shell.css?v=920')>index.indexOf('v91-fidelity.css?v=910')?pass('adaptive CSS final precedence'):fail('adaptive CSS precedence');
index.indexOf('v92-device.js?v=920')>index.indexOf('v92-adaptive.js?v=920')?pass('device runtime final precedence'):fail('device runtime precedence');

try{
  const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('assets/js/v87-legal-evidence-data.js','utf8'),context);
  const evidence=context.window.LGMK_V87_DATA;
  evidence?.norms?.length===24?pass('legal norm count','24'):fail('legal norm count',String(evidence?.norms?.length));
  evidence?.cases?.length===13?pass('case count','13'):fail('case count',String(evidence?.cases?.length));
}catch(error){fail('legal data evaluation',error.message)}
try{
  const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('assets/js/v88-deep-lessons-data.js','utf8'),context);
  const deep=context.window.LGMK_V88_DATA;
  deep?.lessons?.length===30?pass('deep lesson count','30'):fail('deep lesson count',String(deep?.lessons?.length));
  new Set(deep?.lessons?.map(x=>x.courseId)).size===10?pass('course coverage','10'):fail('course coverage');
}catch(error){fail('lesson data evaluation',error.message)}

const release=JSON.parse(fs.readFileSync('release-v9.2.json','utf8'));
release.version==='9.2.0'?pass('release version',release.version):fail('release version',release.version);
release.root_cause?.confirmed===true?pass('root cause confirmed'):fail('root cause not confirmed');
Object.keys(release.adaptive_modes||{}).length===4?pass('adaptive modes','4'):fail('adaptive modes',String(Object.keys(release.adaptive_modes||{}).length));
release.runtime_detection?.uses_user_agent===false?pass('viewport-first detection'):fail('user-agent detection enabled');
release.acceptance_matrix?.profiles===13?pass('acceptance profiles','13'):fail('acceptance profiles',String(release.acceptance_matrix?.profiles));
release.release_gates?.single_shell_only===true?pass('single shell gate'):fail('single shell gate');
release.release_gates?.state_reset===false?pass('state preservation'):fail('state preservation');

const adaptive=fs.readFileSync('assets/js/v92-adaptive.js','utf8');
for(const token of ['const VERSION="9.2.0"','visualViewport','dataset.deviceMode','deviceMode=mode','mode="phone"','mode="tablet"','mode="compact"','mode="desktop"','v92ModeBadge','adaptive-v92'])adaptive.includes(token)?pass('adaptive token',token):fail('adaptive token',token);
!adaptive.includes('navigator.userAgent')?pass('no user-agent layout branching'):fail('user-agent layout branching found');
!adaptive.includes('localStorage.clear(')&&!adaptive.includes('indexedDB.deleteDatabase(')?pass('adaptive state preservation'):fail('adaptive destructive call');

const device=fs.readFileSync('assets/js/v92-device.js','utf8');
for(const token of ['const VERSION="9.2.0"','singleMainNav','singleSidebar','legacyTitleRemoved','bodyOffsetRemoved','contentUsable','adaptiveMarker','v92RunMatrix'])device.includes(token)?pass('device token',token):fail('device token',token);
const profileBlock=device.match(/const PROFILES=\[(.*?)\];/s)?.[1]||'';
(profileBlock.match(/\{id:/g)||[]).length===13?pass('device profile definitions','13'):fail('device profile definitions',String((profileBlock.match(/\{id:/g)||[]).length));
!device.includes('9.1.0')&&!device.includes('9.0.0')?pass('no stale release badge'):fail('stale release badge found');
!device.includes('localStorage.clear(')&&!device.includes('indexedDB.deleteDatabase(')?pass('device state preservation'):fail('device destructive call');

const css=fs.readFileSync('assets/css/v92-adaptive-shell.css','utf8');
for(const token of ['html,body{width:100%','padding:0!important','main-nav::before{content:none!important','data-device-mode="desktop"','data-device-mode="compact"','data-device-mode="tablet"','data-device-mode="phone"','grid-template-columns:var(--v92-rail)','repeat(5,minmax(0,1fr))','font-size:16px!important'])css.includes(token)?pass('shell isolation token',token):fail('shell isolation token',token);
const legacy=fs.readFileSync('assets/css/v82-professional.css','utf8');
legacy.includes('padding-left:250px!important')&&legacy.includes('MASTERKIT 8.2')?pass('legacy conflict fixture detected'):fail('legacy conflict fixture changed');

const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
manifest.name.includes('v9.2.0')?pass('manifest version',manifest.name):fail('manifest version',manifest.name);
manifest.start_url.includes('9.2.0')?pass('manifest start URL',manifest.start_url):fail('manifest start URL',manifest.start_url);
manifest.display==='standalone'?pass('manifest display','standalone'):fail('manifest display',manifest.display);
const sw=fs.readFileSync('service-worker.js','utf8');
for(const token of ['lgmk-v9-2-adaptive-shell','release-v9.2.json','v92-adaptive-shell.css?v=920','v92-adaptive.js?v=920','v92-device.js?v=920'])sw.includes(token)?pass('cache token',token):fail('cache token',token);
!sw.includes('v91-device.js')?pass('stale device cache removed'):fail('stale device cache retained');

if(failed){console.error(`\n${failed} cumulative v9.2 gate(s) failed.`);process.exit(1)}
console.log('\nAll cumulative v9.2 shell isolation, content and adaptive device gates passed.');
