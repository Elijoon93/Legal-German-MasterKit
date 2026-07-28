import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const required=[
  'package.json','playwright.config.mjs','tests/visual-acceptance.spec.mjs',
  'assets/js/v933-stability.js','assets/css/v933-runtime-stability.css','release-v9.3.3.json',
  'assets/js/v932-startup.js','assets/css/v932-startup.css','release-v9.3.2.json',
  'assets/js/v931-visual-guard.js','assets/css/v931-visual-acceptance.css','release-v9.3.1.json',
  'assets/js/v93-learning-os.js','assets/js/v93-cache-repair.js','assets/css/v93-learning-os.css',
  'assets/js/v92-adaptive.js','assets/js/v92-device.js','assets/css/v92-adaptive-shell.css',
  'assets/js/v87-legal-evidence-data.js','assets/js/v88-deep-lessons-data.js',
  'assets/js/app-views2.js','index.html','manifest.webmanifest','service-worker.js','.github/workflows/qa-v87.yml'
];
let failed=0;
const pass=(name,detail='')=>console.log(`PASS ${name}${detail?` — ${detail}`:''}`);
const fail=(name,detail='')=>{failed++;console.error(`FAIL ${name}${detail?` — ${detail}`:''}`)};
for(const file of required)fs.existsSync(file)?pass('file',file):fail('file missing',file);

const index=fs.readFileSync('index.html','utf8');
const externalTags=[...index.matchAll(/<script([^>]*)src="([^"?]+)(?:\?[^\"]*)?"([^>]*)><\/script>/g)].map(match=>({attrs:`${match[1]} ${match[3]}`,file:match[2],raw:match[0]}));
for(const {file} of externalTags){
  if(!fs.existsSync(file)){fail('loaded JS missing',file);continue}
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('syntax',file):fail('syntax',`${file}: ${result.stderr||result.stdout}`);
}
for(const file of ['playwright.config.mjs','tests/visual-acceptance.spec.mjs','scripts/qa-v933.mjs']){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('node syntax',file):fail('node syntax',`${file}: ${result.stderr||result.stdout}`);
}

for(const token of [
  'Legal German MasterKit v9.3.3','manifest.webmanifest?v=933','LGMK_RELEASE_VERSION="9.3.3"',
  'LGMK_CACHE_NAME="lgmk-v9-3-3-runtime-stability-20260728b"','v933-runtime-stability.css?v=933',
  'v932-startup.js?v=933','v92-adaptive.js?v=933','v92-device.js?v=9331','v93-cache-repair.js?v=933',
  'v931-visual-guard.js?v=933','v933-stability.js?v=9331','app-views2.js?v=933','id="startupStatus"'
])index.includes(token)?pass('index token',token):fail('index token',token);

const parserBlocking=externalTags.filter(tag=>tag.file!=='assets/js/v932-startup.js'&&!/\bdefer\b/.test(tag.attrs));
parserBlocking.length===0?pass('parser-blocking external scripts','0'):fail('parser-blocking external scripts',parserBlocking.map(x=>x.file).join(', '));
const startupTag=externalTags.find(tag=>tag.file==='assets/js/v932-startup.js');
startupTag&&!/\bdefer\b/.test(startupTag.attrs)?pass('startup watchdog executes early'):fail('startup watchdog placement');
const afterHead=index.slice(index.indexOf('</head>'));
!/<script[^>]+src=/.test(afterHead)?pass('no external scripts after head'):fail('external script remains after head');
new Set(externalTags.map(x=>x.file)).size===externalTags.length?pass('script uniqueness',String(externalTags.length)):fail('duplicate external scripts');

const cssLinks=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
cssLinks.length===13?pass('stylesheet count','13'):fail('stylesheet count',String(cssLinks.length));
new Set(cssLinks).size===cssLinks.length?pass('stylesheet uniqueness','13 unique'):fail('duplicate stylesheets');
index.indexOf('v933-runtime-stability.css?v=933')>index.indexOf('v932-startup.css?v=932')?pass('stability CSS final precedence'):fail('stability CSS precedence');

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

const release=JSON.parse(fs.readFileSync('release-v9.3.3.json','utf8'));
release.version==='9.3.3'?pass('release version',release.version):fail('release version',release.version);
release.runtime_changes?.resize_observer_removed===true?pass('ResizeObserver removal gate'):fail('ResizeObserver removal gate');
release.runtime_changes?.mutation_observer_removed===true?pass('MutationObserver removal gate'):fail('MutationObserver removal gate');
release.runtime_changes?.maximum_recovery_attempts===1?pass('single recovery attempt'):fail('recovery attempt count');
release.runtime_changes?.cache_repair_runs_after_ready_and_idle===true?pass('idle cache repair'):fail('idle cache repair');
release.runtime_changes?.persistent_polling_added===false?pass('no persistent polling'):fail('persistent polling');
release.device_acceptance_hotfix?.sample_only_after_app_ready===true&&release.device_acceptance_hotfix?.sample_only_after_runtime_stable===true?pass('post-ready acceptance sampling'):fail('post-ready acceptance sampling');
release.device_acceptance_hotfix?.stale_release_results_ignored===true?pass('stale acceptance filtering'):fail('stale acceptance filtering');
release.device_acceptance_hotfix?.width_status_independent_from_global_status===true?pass('independent width status'):fail('independent width status');
release.compact_windows?.rail_width_px===88&&release.compact_windows?.labels_hidden_with_id_specific_selector===true?pass('compact rail contract'):fail('compact rail contract');
release.acceptance_gates?.state_reset===false?pass('state preservation'):fail('state preservation');

const adaptive=fs.readFileSync('assets/js/v92-adaptive.js','utf8');
!adaptive.includes('ResizeObserver')?pass('adaptive ResizeObserver absent'):fail('adaptive ResizeObserver remains');
!adaptive.includes('visualViewport?.addEventListener("scroll"')?pass('visualViewport scroll listener absent'):fail('visualViewport scroll listener remains');
for(const token of ['lastSignature','setData','setVar','signature===lastSignature','requestAnimationFrame(()=>normalizeShell'])adaptive.includes(token)?pass('idempotent adaptive token',token):fail('idempotent adaptive token',token);

const device=fs.readFileSync('assets/js/v92-device.js','utf8');
for(const token of ['waitForStable','dataset.runtimeStable==="true"','dataset.appReady==="true"','await nextFrame(win);await nextFrame(win)','row?.version===VERSION','current.checks.contentUsable','current.failingChecks.join','profile_timeout_ms'.replace('profile_timeout_ms','15000')])device.includes(token)?pass('stable device token',token):fail('stable device token',token);
!device.includes('current.pass?"PASS":"FAIL"')?pass('width no longer uses global pass'):fail('width still uses global pass');
!device.includes('setTimeout(()=>{try{frame.contentWindow')?pass('fixed-delay profile sampling removed'):fail('fixed-delay profile sampling remains');

const guard=fs.readFileSync('assets/js/v931-visual-guard.js','utf8');
!guard.includes('MutationObserver')?pass('visual MutationObserver absent'):fail('visual MutationObserver remains');
for(const token of ['badge.textContent!==','brand.textContent!==','setTimeout(apply,250)','setTimeout(apply,1200)'])guard.includes(token)?pass('idempotent visual token',token):fail('idempotent visual token',token);

const startup=fs.readFileSync('assets/js/v932-startup.js','utf8');
for(const token of ['window.LGMK_RELEASE_VERSION||"9.3.2"','recoveryAttempts>=1','document.querySelector(".view.active")','setTimeout(finalCheck,9000)','?v=933'])startup.includes(token)?pass('startup stability token',token):fail('startup stability token',token);
!startup.includes('setTimeout(()=>attemptRecovery("کنترل دوم")')?pass('duplicate recovery removed'):fail('second recovery remains');

const repair=fs.readFileSync('assets/js/v93-cache-repair.js','utf8');
for(const token of ['requestIdleCallback','lgmk:ready','dataset.appReady','setTimeout(run,3500)','if(started)return'])repair.includes(token)?pass('idle cache token',token):fail('idle cache token',token);
!repair.includes('setTimeout(()=>repair()')?pass('eager cache repair removed'):fail('eager cache repair remains');

const stability=fs.readFileSync('assets/js/v933-stability.js','utf8');
for(const token of ['runtimeStable="true"','LGMK_RUNTIME_STABILITY','sidebars.slice(1)','requestAnimationFrame(()=>requestAnimationFrame(converge))','active?.id==="deviceAcceptance"','window.render("deviceAcceptance")'])stability.includes(token)?pass('stability token',token):fail('stability token',token);
!stability.includes('MutationObserver')&&!stability.includes('ResizeObserver')&&!stability.includes('setInterval')?pass('one-shot stability runtime'):fail('persistent stability observer found');

const stabilityCss=fs.readFileSync('assets/css/v933-runtime-stability.css','utf8');
for(const token of ['#mainNav .v90-nav-groups button b','display:none!important','--v933-rail:88px','overflow-x:hidden!important','grid-template-columns:var(--v933-rail)'])stabilityCss.includes(token)?pass('compact CSS token',token):fail('compact CSS token',token);

const coreBoot=fs.readFileSync('assets/js/app-views2.js','utf8');
for(const token of ['service-worker.js?v=933','?v=933','v9.3.3-backup.json','window.LGMK_RELEASE_VERSION||"9.3.3"'])coreBoot.includes(token)?pass('core boot token',token):fail('core boot token',token);

const testFile=fs.readFileSync('tests/visual-acceptance.spec.mjs','utf8');
const profileBlock=testFile.match(/const PROFILES=\[(.*?)\];/s)?.[1]||'';
(profileBlock.match(/\{id:/g)||[]).length===13?pass('test profile definitions','13'):fail('test profile definitions',String((profileBlock.match(/\{id:/g)||[]).length));
for(const token of ["const VERSION='9.3.3'","dataset.runtimeStable==='true'",'compactVisibleLabels','sidebarRect?.width','?v=933&visual='])testFile.includes(token)?pass('visual stability token',token):fail('visual stability token',token);

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version==='9.3.3'?pass('package version',pkg.version):fail('package version',pkg.version);
pkg.scripts?.['qa:source']==='node scripts/qa-v933.mjs'?pass('source test script'):fail('source test script');
pkg.devDependencies?.['@playwright/test']==='1.61.1'?pass('Playwright pin','1.61.1'):fail('Playwright pin');

const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
manifest.name.includes('v9.3.3')?pass('manifest version',manifest.name):fail('manifest version',manifest.name);
manifest.start_url.includes('9.3.3')?pass('manifest start URL',manifest.start_url):fail('manifest start URL',manifest.start_url);
manifest.display==='standalone'?pass('manifest display','standalone'):fail('manifest display',manifest.display);

const sw=fs.readFileSync('service-worker.js','utf8');
for(const token of ['lgmk-v9-3-3-runtime-stability-20260728b','release-v9.3.3.json','manifest.webmanifest?v=933','v933-runtime-stability.css?v=933','v92-device.js?v=9331','v933-stability.js?v=9331','app-views2.js?v=933'])sw.includes(token)?pass('cache token',token):fail('cache token',token);

const workflow=fs.readFileSync('.github/workflows/qa-v87.yml','utf8');
for(const token of ['node scripts/qa-v933.mjs','playwright install --with-deps chromium webkit','npm run qa:visual','actions/upload-artifact@v4','runtime-stability-v9.3.3'])workflow.includes(token)?pass('workflow token',token):fail('workflow token',token);

if(failed){console.error(`\n${failed} cumulative v9.3.3 gate(s) failed.`);process.exit(1)}
console.log('\nAll cumulative v9.3.3 runtime stability, truthful device acceptance, compact rail, content, cache and visual-device gates passed.');
