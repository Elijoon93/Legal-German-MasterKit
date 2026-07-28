import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const required=[
  'index.html','manifest.webmanifest','service-worker.js','release-final.json','package.json','playwright.config.mjs',
  'assets/css/final-ops.css','assets/js/final-startup.js','assets/js/final-ops.js','assets/js/app-views2.js',
  'assets/js/v87-legal-evidence-data.js','assets/js/v88-deep-lessons-data.js','tests/visual-acceptance.spec.mjs','.github/workflows/qa-v87.yml'
];
let failed=0;
const pass=(name,detail='')=>console.log(`PASS ${name}${detail?` — ${detail}`:''}`);
const fail=(name,detail='')=>{failed++;console.error(`FAIL ${name}${detail?` — ${detail}`:''}`)};
for(const file of required)fs.existsSync(file)?pass('file',file):fail('file missing',file);

const index=fs.readFileSync('index.html','utf8');
const scripts=[...index.matchAll(/<script([^>]*)src="([^"?]+)(?:\?[^\"]*)?"([^>]*)><\/script>/g)].map(match=>({attrs:`${match[1]} ${match[3]}`,file:match[2]}));
for(const {file} of scripts){
  if(!fs.existsSync(file)){fail('loaded JS missing',file);continue}
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('syntax',file):fail('syntax',`${file}: ${result.stderr||result.stdout}`);
}
for(const file of ['playwright.config.mjs','tests/visual-acceptance.spec.mjs','scripts/qa-v940.mjs']){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('node syntax',file):fail('node syntax',`${file}: ${result.stderr||result.stdout}`);
}

for(const token of ['Legal German MasterKit v9.4.0','manifest.webmanifest?v=940','LGMK_RELEASE_VERSION="9.4.0"','LGMK_CACHE_NAME="lgmk-v9-4-0-final-20260729a"','final-ops.css?v=940','final-startup.js?v=940','final-ops.js?v=940'])index.includes(token)?pass('index token',token):fail('index token',token);
const staleActive=['v92-adaptive-shell.css','v931-visual-acceptance.css','v932-startup.css','v933-runtime-stability.css','v934-acceptance.css','v92-adaptive.js','v92-device.js','v93-cache-repair.js','v931-visual-guard.js','v932-startup.js','v933-stability.js','v934-acceptance-automation.js','v934-physical-version.js','v934-sw-register-final2.js','manifest-v934.webmanifest'];
for(const stale of staleActive)!index.includes(stale)?pass('obsolete runtime removed',stale):fail('obsolete runtime still active',stale);
const cssLinks=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
cssLinks.length===10?pass('stylesheet count','10'):fail('stylesheet count',String(cssLinks.length));
new Set(cssLinks).size===cssLinks.length?pass('stylesheet uniqueness','10 unique'):fail('duplicate stylesheets');
new Set(scripts.map(x=>x.file)).size===scripts.length?pass('script uniqueness',String(scripts.length)):fail('duplicate scripts');
const parserBlocking=scripts.filter(tag=>tag.file!=='assets/js/final-startup.js'&&!/\bdefer\b/.test(tag.attrs));
parserBlocking.length===0?pass('parser blocking scripts','startup only'):fail('unexpected blocking scripts',parserBlocking.map(x=>x.file).join(', '));
index.indexOf('final-ops.css?v=940')>index.indexOf('v93-learning-os.css?v=930')?pass('final CSS precedence'):fail('final CSS precedence');
index.indexOf('final-ops.js?v=940')>index.indexOf('v93-learning-os.js?v=930')?pass('final runtime precedence'):fail('final runtime precedence');

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

const release=JSON.parse(fs.readFileSync('release-final.json','utf8'));
release.version==='9.4.0'?pass('release version',release.version):fail('release version',release.version);
release.consolidation?.removed_from_active_runtime?.length===14?pass('consolidated obsolete assets','14'):fail('consolidated obsolete assets',String(release.consolidation?.removed_from_active_runtime?.length));
release.automated_acceptance?.profiles===13?pass('automated profiles','13'):fail('automated profiles',String(release.automated_acceptance?.profiles));
release.physical_acceptance?.required_evidence?.length===5?pass('physical evidence contract','5'):fail('physical evidence contract');
release.preservation?.state_reset===false?pass('state preservation'):fail('state preservation');

const startup=fs.readFileSync('assets/js/final-startup.js','utf8');
for(const token of ['window.LGMK_RELEASE_VERSION||"9.4.0"','recoveryAttempts>=1','document.querySelector(".view.active")','?v=940','setTimeout(finalCheck,9000)'])startup.includes(token)?pass('startup token',token):fail('startup token',token);
!startup.includes('MutationObserver')&&!startup.includes('ResizeObserver')&&!startup.includes('setInterval')?pass('startup no persistent observer'):fail('startup persistent observer');

const ops=fs.readFileSync('assets/js/final-ops.js','utf8');
for(const token of ['shortSide<600','final-adaptive-shell','const PROFILES=[','lgmk-final-acceptance-report/v2','const PHYSICAL=[','service-worker.js?v=','lgmk:stable','FINAL ACCEPTED'])ops.includes(token)?pass('final ops token',token):fail('final ops token',token);
const profileBlock=ops.match(/const PROFILES=\[(.*?)\];/s)?.[1]||'';
(profileBlock.match(/\{id:/g)||[]).length===13?pass('device definitions','13'):fail('device definitions',String((profileBlock.match(/\{id:/g)||[]).length));
const physicalBlock=ops.match(/const PHYSICAL=\[(.*?)\];/s)?.[1]||'';
(physicalBlock.match(/\{id:/g)||[]).length===5?pass('physical definitions','5'):fail('physical definitions',String((physicalBlock.match(/\{id:/g)||[]).length));
for(const forbidden of ['MutationObserver','ResizeObserver','setInterval','localStorage.clear(','indexedDB.deleteDatabase('])!ops.includes(forbidden)?pass('forbidden runtime absent',forbidden):fail('forbidden runtime present',forbidden);
!ops.includes('setTimeout(poll')?pass('acceptance polling removed'):fail('acceptance polling remains');

const appViews=fs.readFileSync('assets/js/app-views2.js','utf8');
!appViews.includes('serviceWorker.register')?pass('single service worker registration'):fail('legacy service worker registration remains');
for(const token of ['?v=940','v9.4.0-backup.json','window.LGMK_RELEASE_VERSION||"9.4.0"'])appViews.includes(token)?pass('core boot token',token):fail('core boot token',token);

const css=fs.readFileSync('assets/css/final-ops.css','utf8');
for(const token of ['--final-rail:88px','grid-template-columns:var(--final-rail)','font-size:16px!important','env(safe-area-inset-bottom','data-device-mode="phone"','data-device-mode="tablet"','data-device-mode="compact"','data-device-mode="desktop"','.final-acceptance'])css.includes(token)?pass('final CSS token',token):fail('final CSS token',token);

const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
manifest.name.includes('v9.4.0')?pass('manifest version',manifest.name):fail('manifest version',manifest.name);
manifest.start_url.includes('9.4.0')?pass('manifest start URL',manifest.start_url):fail('manifest start URL',manifest.start_url);
manifest.display==='standalone'?pass('manifest display','standalone'):fail('manifest display',manifest.display);

const sw=fs.readFileSync('service-worker.js','utf8');
for(const token of ['lgmk-v9-4-0-final-20260729a','manifest.webmanifest?v=940','release-final.json','final-ops.css?v=940','final-startup.js?v=940','final-ops.js?v=940'])sw.includes(token)?pass('service worker token',token):fail('service worker token',token);
for(const stale of staleActive)!sw.includes(stale)?pass('obsolete cache removed',stale):fail('obsolete cache retained',stale);

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version==='9.4.0'?pass('package version',pkg.version):fail('package version',pkg.version);
pkg.scripts?.['qa:source']==='node scripts/qa-v940.mjs'?pass('source test script'):fail('source test script');

const tests=fs.readFileSync('tests/visual-acceptance.spec.mjs','utf8');
for(const token of ["const VERSION='9.4.0'",'?v=940&visual=','studyHub','practiceHub','researchHub','iphone-landscape','ipad-landscape','lgmk-final-acceptance-report/v2'])tests.includes(token)?pass('visual test token',token):fail('visual test token',token);

const workflow=fs.readFileSync('.github/workflows/qa-v87.yml','utf8');
for(const token of ['node scripts/qa-v940.mjs','npm run qa:visual','Wait for GitHub Pages 9.4.0','LGMK_BASE_URL','final-acceptance-9.4.0'])workflow.includes(token)?pass('workflow token',token):fail('workflow token',token);

if(failed){console.error(`\n${failed} final 9.4.0 gate(s) failed.`);process.exit(1)}
console.log('\nAll final 9.4.0 source, consolidation, state, PWA and acceptance gates passed.');
