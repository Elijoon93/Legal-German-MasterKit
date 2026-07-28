import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const required=[
  'assets/js/v90-shell.js','assets/js/v90-routing.js','assets/js/v91-architecture.js',
  'assets/css/v90-foundation.css','assets/css/v91-fidelity.css',
  'release-v9.0.json','release-v9.1.json','release-v8.7.json','release-v8.8.json',
  'assets/js/v87-legal-evidence-data.js','assets/js/v88-deep-lessons-data.js',
  'index.html','manifest.webmanifest','service-worker.js'
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

for(const token of [
  'Legal German MasterKit v9.1.0','manifest.webmanifest?v=910','v91-fidelity.css?v=910',
  'v91-architecture.js?v=910','id="deviceAcceptance"','id="researchHub"'
])index.includes(token)?pass('index token',token):fail('index token',token);
const cssLinks=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
cssLinks.length===8?pass('stylesheet count','8'):fail('stylesheet count',String(cssLinks.length));
new Set(cssLinks).size===cssLinks.length?pass('stylesheet uniqueness','8 unique'):fail('duplicate stylesheets');
index.indexOf('v91-fidelity.css?v=910')>index.indexOf('v90-foundation.css?v=900')?pass('v9.1 CSS precedence'):fail('v9.1 CSS precedence');
index.indexOf('v91-architecture.js?v=910')>index.indexOf('v90-routing.js?v=900')?pass('v9.1 JS precedence'):fail('v9.1 JS precedence');

try{
  const context={window:{}};vm.createContext(context);
  vm.runInContext(fs.readFileSync('assets/js/v87-legal-evidence-data.js','utf8'),context);
  const evidence=context.window.LGMK_V87_DATA;
  evidence?.norms?.length===24?pass('legal norm count','24'):fail('legal norm count',String(evidence?.norms?.length));
  evidence?.cases?.length===13?pass('case brief count','13'):fail('case brief count',String(evidence?.cases?.length));
}catch(error){fail('v8.7 legal data',error.message)}
try{
  const context={window:{}};vm.createContext(context);
  vm.runInContext(fs.readFileSync('assets/js/v88-deep-lessons-data.js','utf8'),context);
  const deep=context.window.LGMK_V88_DATA;
  deep?.lessons?.length===30?pass('deep lesson count','30'):fail('deep lesson count',String(deep?.lessons?.length));
  new Set(deep?.lessons?.map(x=>x.courseId)).size===10?pass('course coverage','10'):fail('course coverage');
}catch(error){fail('v8.8 lesson data',error.message)}

const release=JSON.parse(fs.readFileSync('release-v9.1.json','utf8'));
release.version==='9.1.0'?pass('release version',release.version):fail('release version',release.version);
release.reference?.forbidden_transfer?.length===4?pass('nursing-content exclusion','locked'):fail('nursing-content exclusion');
release.architecture?.flow?.join('>')==='Hub>List>Detail>Practice>Output'?pass('architecture flow','locked'):fail('architecture flow');
release.architecture?.tabbed_hubs===4?pass('tabbed hubs','4'):fail('tabbed hubs',String(release.architecture?.tabbed_hubs));
release.architecture?.tabs_per_hub===4?pass('tabs per hub','4'):fail('tabs per hub',String(release.architecture?.tabs_per_hub));
release.release_gates?.state_reset===false?pass('state preservation','locked'):fail('state preservation');

const architecture=fs.readFileSync('assets/js/v91-architecture.js','utf8');
for(const token of ['const VERSION="9.1.0"','study:[[','skills:[[','practice:[[','research:[[','v91-page-head','v91-list-item','hub-list-detail-output'])architecture.includes(token)?pass('architecture token',token):fail('architecture token',token);
const tabDefinitions=[...architecture.matchAll(/\[\["[a-z]+","[^"]+"\],\["[a-z]+","[^"]+"\],\["[a-z]+","[^"]+"\],\["[a-z]+","[^"]+"\]\]/g)];
tabDefinitions.length===4?pass('four groups with four tabs','4'):fail('four groups with four tabs',String(tabDefinitions.length));
for(const forbidden of ['Pflegekraft','Patientenzimmer','Vitalzeichen','Medikamentengabe','Wundversorgung','Klinische Übergabe'])!architecture.includes(forbidden)?pass('no nursing data',forbidden):fail('nursing data leaked',forbidden);
!architecture.includes('localStorage.clear(')?pass('no localStorage.clear'):fail('forbidden localStorage.clear');
!architecture.includes('indexedDB.deleteDatabase(')?pass('no indexedDB.deleteDatabase'):fail('forbidden indexedDB.deleteDatabase');

const css=fs.readFileSync('assets/css/v91-fidelity.css','utf8');
for(const token of ['.v91-tabs','.v91-list-item','.v91-quick-grid','@media(max-width:1024px)','env(safe-area-inset-bottom','font-size:16px!important'])css.includes(token)?pass('presentation token',token):fail('presentation token',token);
css.includes('.v90-hub-head{display:none!important}')?pass('legacy dark hub hidden'):fail('legacy dark hub hidden');

const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
manifest.name.includes('v9.1.0')?pass('manifest version',manifest.name):fail('manifest version',manifest.name);
manifest.start_url.includes('9.1.0')?pass('manifest start URL',manifest.start_url):fail('manifest start URL',manifest.start_url);
manifest.display==='standalone'?pass('manifest display','standalone'):fail('manifest display',manifest.display);

const sw=fs.readFileSync('service-worker.js','utf8');
for(const token of ['lgmk-v9-1-architecture-fidelity','release-v9.1.json','v91-fidelity.css?v=910','v91-architecture.js?v=910'])sw.includes(token)?pass('cache token',token):fail('cache token',token);

if(failed){console.error(`\n${failed} cumulative v9.1 gate(s) failed.`);process.exit(1)}
console.log('\nAll cumulative v9.1 architecture, content and responsive gates passed.');
