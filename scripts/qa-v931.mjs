import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const required=[
  'package.json','playwright.config.mjs','tests/visual-acceptance.spec.mjs',
  'assets/js/v931-visual-guard.js','assets/css/v931-visual-acceptance.css','release-v9.3.1.json',
  'assets/js/v93-learning-os.js','assets/js/v93-cache-repair.js','assets/css/v93-learning-os.css',
  'assets/js/v92-adaptive.js','assets/js/v92-device.js','assets/css/v92-adaptive-shell.css',
  'assets/js/v87-legal-evidence-data.js','assets/js/v88-deep-lessons-data.js',
  'index.html','manifest.webmanifest','service-worker.js','.github/workflows/qa-v87.yml'
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
for(const file of ['playwright.config.mjs','tests/visual-acceptance.spec.mjs','scripts/qa-v931.mjs']){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('node syntax',file):fail('node syntax',`${file}: ${result.stderr||result.stdout}`);
}

for(const token of [
  'Legal German MasterKit v9.3.1','manifest.webmanifest?v=931','LGMK_RELEASE_VERSION="9.3.1"',
  'LGMK_CACHE_NAME="lgmk-v9-3-1-visual-acceptance-20260728a"',
  'v931-visual-acceptance.css?v=931','v931-visual-guard.js?v=931','v93-cache-repair.js?v=930'
])index.includes(token)?pass('index token',token):fail('index token',token);
const cssLinks=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
cssLinks.length===11?pass('stylesheet count','11'):fail('stylesheet count',String(cssLinks.length));
new Set(cssLinks).size===cssLinks.length?pass('stylesheet uniqueness','11 unique'):fail('duplicate stylesheets');
index.indexOf('v931-visual-acceptance.css?v=931')>index.indexOf('v93-learning-os.css?v=930')?pass('visual CSS final precedence'):fail('visual CSS precedence');
index.indexOf('v931-visual-guard.js?v=931')>index.indexOf('v93-cache-repair.js?v=930')?pass('release guard final precedence'):fail('release guard precedence');

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

const release=JSON.parse(fs.readFileSync('release-v9.3.1.json','utf8'));
release.version==='9.3.1'?pass('release version',release.version):fail('release version',release.version);
release.engines?.playwright_test==='1.61.1'?pass('Playwright pin','1.61.1'):fail('Playwright pin',release.engines?.playwright_test);
release.profiles?.length===13?pass('release profiles','13'):fail('release profiles',String(release.profiles?.length));
release.assertions?.length>=15?pass('acceptance assertions',String(release.assertions.length)):fail('acceptance assertions',String(release.assertions?.length));
release.evidence_artifacts?.dashboard_screenshots===13&&release.evidence_artifacts?.focus_session_screenshots===13&&release.evidence_artifacts?.competency_screenshots===13?pass('screenshot evidence','39'):fail('screenshot evidence');
release.release_gates?.state_reset===false?pass('state preservation'):fail('state preservation');

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version==='9.3.1'?pass('package version',pkg.version):fail('package version',pkg.version);
pkg.devDependencies?.['@playwright/test']==='1.61.1'?pass('package Playwright pin','1.61.1'):fail('package Playwright pin');
pkg.scripts?.['qa:visual']==='playwright test'?pass('visual test script'):fail('visual test script');

const testFile=fs.readFileSync('tests/visual-acceptance.spec.mjs','utf8');
const profileBlock=testFile.match(/const PROFILES=\[(.*?)\];/s)?.[1]||'';
(profileBlock.match(/\{id:/g)||[]).length===13?pass('test profile definitions','13'):fail('test profile definitions',String((profileBlock.match(/\{id:/g)||[]).length));
for(const token of [
  "const VERSION='9.3.1'","engine:'webkit'","engine:'chromium'",'oldTitlePresent','rootScrollWidth',
  'focusCtaCount','mobileTabCount','v93FocusOverlay','.v93-competency','visual-acceptance-summary.json'
])testFile.includes(token)?pass('visual test token',token):fail('visual test token',token);

const guard=fs.readFileSync('assets/js/v931-visual-guard.js','utf8');
for(const token of ['const VERSION="9.3.1"','dataset.visualAcceptance="v931"','MutationObserver','LGMK_V931'])guard.includes(token)?pass('release guard token',token):fail('release guard token',token);
!guard.includes('localStorage.clear(')&&!guard.includes('indexedDB.deleteDatabase(')?pass('guard state preservation'):fail('guard destructive call');

const css=fs.readFileSync('assets/css/v931-visual-acceptance.css','utf8');
for(const token of ['scrollbar-gutter:stable','max-width:100%','data-device-mode="phone"','data-device-mode="tablet"','data-device-mode="compact"','safe-area-inset-bottom','100svh','font-size:16px!important'])css.includes(token)?pass('visual hardening token',token):fail('visual hardening token',token);

const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
manifest.name.includes('v9.3.1')?pass('manifest version',manifest.name):fail('manifest version',manifest.name);
manifest.start_url.includes('9.3.1')?pass('manifest start URL',manifest.start_url):fail('manifest start URL',manifest.start_url);
manifest.display==='standalone'?pass('manifest display','standalone'):fail('manifest display',manifest.display);

const sw=fs.readFileSync('service-worker.js','utf8');
for(const token of ['lgmk-v9-3-1-visual-acceptance','release-v9.3.1.json','v931-visual-acceptance.css?v=931','v931-visual-guard.js?v=931'])sw.includes(token)?pass('cache token',token):fail('cache token',token);

const workflow=fs.readFileSync('.github/workflows/qa-v87.yml','utf8');
for(const token of ['node scripts/qa-v931.mjs','playwright install --with-deps chromium webkit','npm run qa:visual','actions/upload-artifact@v4','visual-acceptance-v9.3.1'])workflow.includes(token)?pass('workflow token',token):fail('workflow token',token);

if(failed){console.error(`\n${failed} cumulative v9.3.1 gate(s) failed.`);process.exit(1)}
console.log('\nAll cumulative v9.3.1 source, visual harness, content, cache and adaptive-device gates passed.');
