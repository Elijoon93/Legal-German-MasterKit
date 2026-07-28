import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const VERSION='9.3.4';
const required=[
  'index.html','manifest-v934.webmanifest','service-worker-v934.js','release-v9.3.4.json',
  'assets/js/v934-acceptance-automation.js','assets/js/v934-sw-register-final.js','assets/css/v934-acceptance.css',
  'assets/js/v933-stability.js','assets/css/v933-runtime-stability.css','assets/js/v932-startup.js',
  'assets/js/v931-visual-guard.js','assets/js/v92-adaptive.js','assets/js/v92-device.js',
  'assets/js/v93-learning-os.js','assets/js/v87-legal-evidence-data.js','assets/js/v88-deep-lessons-data.js',
  'tests/visual-acceptance.spec.mjs','playwright.config.mjs','package.json'
];
let failed=0;
const pass=(name,detail='')=>console.log(`PASS ${name}${detail?` — ${detail}`:''}`);
const fail=(name,detail='')=>{failed++;console.error(`FAIL ${name}${detail?` — ${detail}`:''}`)};
for(const file of required)fs.existsSync(file)?pass('file',file):fail('file missing',file);

const index=fs.readFileSync('index.html','utf8');
const externalTags=[...index.matchAll(/<script([^>]*)src="([^"?]+)(?:\?[^\"]*)?"([^>]*)><\/script>/g)].map(match=>({attrs:`${match[1]} ${match[3]}`,file:match[2]}));
for(const {file} of externalTags){
  if(!fs.existsSync(file)){fail('loaded JS missing',file);continue}
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('syntax',file):fail('syntax',`${file}: ${result.stderr||result.stdout}`);
}
for(const file of ['tests/visual-acceptance.spec.mjs','playwright.config.mjs','scripts/qa-v933.mjs']){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('node syntax',file):fail('node syntax',`${file}: ${result.stderr||result.stdout}`);
}

for(const token of [
  'Legal German MasterKit v9.3.4','manifest-v934.webmanifest','LGMK_RELEASE_VERSION="9.3.4"',
  'lgmk-v9-3-4-acceptance-automation-20260728a','v934-acceptance.css?v=934',
  'v934-acceptance-automation.js?v=934','v934-sw-register-final.js?v=934','v92-device.js?v=934'
])index.includes(token)?pass('index token',token):fail('index token',token);
const parserBlocking=externalTags.filter(tag=>tag.file!=='assets/js/v932-startup.js'&&!/\bdefer\b/.test(tag.attrs));
parserBlocking.length===0?pass('parser-blocking external scripts','0'):fail('parser-blocking external scripts',parserBlocking.map(x=>x.file).join(', '));
new Set(externalTags.map(x=>x.file)).size===externalTags.length?pass('script uniqueness',String(externalTags.length)):fail('duplicate external scripts');
const cssLinks=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
cssLinks.length===14?pass('stylesheet count','14'):fail('stylesheet count',String(cssLinks.length));
new Set(cssLinks).size===cssLinks.length?pass('stylesheet uniqueness','14 unique'):fail('duplicate stylesheets');
index.indexOf('v934-acceptance.css?v=934')>index.indexOf('v933-runtime-stability.css?v=933')?pass('v9.3.4 CSS final precedence'):fail('v9.3.4 CSS precedence');
index.indexOf('v934-acceptance-automation.js?v=934')>index.indexOf('v92-device.js?v=934')?pass('acceptance runtime precedence'):fail('acceptance runtime precedence');

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

const release=JSON.parse(fs.readFileSync('release-v9.3.4.json','utf8'));
release.version===VERSION?pass('release version',release.version):fail('release version',release.version);
release.automation?.profiles===13?pass('automation profiles','13'):fail('automation profiles');
release.automation?.waits_for_app_ready===true&&release.automation?.waits_for_runtime_stable===true?pass('stable automation sampling'):fail('stable automation sampling');
release.evidence_package?.schema==='lgmk-device-acceptance-report/v1'?pass('evidence schema'):fail('evidence schema');
release.acceptance_logic?.final_acceptance_requires==='automated pass and physical pass'?pass('final acceptance contract'):fail('final acceptance contract');
release.release_gates?.state_reset===false?pass('state preservation'):fail('state preservation');

const automation=fs.readFileSync('assets/js/v934-acceptance-automation.js','utf8');
for(const token of ['const VERSION=window.LGMK_RELEASE_VERSION||"9.3.4"','acceptanceAutomation','runAutomated','downloadReport','lgmk-device-acceptance-report/v1','finalAccepted','params.get(AUTO_PARAM)==="auto"','!params.has("qa")'])automation.includes(token)?pass('automation token',token):fail('automation token',token);
!automation.includes('localStorage.clear(')&&!automation.includes('indexedDB.deleteDatabase(')?pass('automation state preservation'):fail('automation destructive call');

const device=fs.readFileSync('assets/js/v92-device.js','utf8');
for(const token of ['runtimeStable','appReady','currentRows','waitForStable','failingChecks'])device.includes(token)?pass('stable device token',token):fail('stable device token',token);
const adaptive=fs.readFileSync('assets/js/v92-adaptive.js','utf8');
!adaptive.includes('ResizeObserver')?pass('adaptive ResizeObserver absent'):fail('adaptive ResizeObserver remains');
const guard=fs.readFileSync('assets/js/v931-visual-guard.js','utf8');
!guard.includes('MutationObserver')?pass('visual MutationObserver absent'):fail('visual MutationObserver remains');
const stability=fs.readFileSync('assets/js/v933-stability.js','utf8');
!stability.includes('setInterval')&&!stability.includes('MutationObserver')&&!stability.includes('ResizeObserver')?pass('one-shot stability preserved'):fail('persistent stability observer found');

const manifest=JSON.parse(fs.readFileSync('manifest-v934.webmanifest','utf8'));
manifest.name.includes(VERSION)?pass('manifest version',manifest.name):fail('manifest version',manifest.name);
manifest.start_url.includes(VERSION)?pass('manifest start URL',manifest.start_url):fail('manifest start URL',manifest.start_url);
const sw=fs.readFileSync('service-worker-v934.js','utf8');
for(const token of ['lgmk-v9-3-4-acceptance-automation','release-v9.3.4.json','manifest-v934.webmanifest','v934-acceptance.css?v=934','v934-acceptance-automation.js?v=934','v934-sw-register-final.js?v=934'])sw.includes(token)?pass('service worker token',token):fail('service worker token',token);
const swRegister=fs.readFileSync('assets/js/v934-sw-register-final.js','utf8');
for(const token of ['service-worker-v934.js?v=934','getRegistrations','unregister','LGMK_SW_V934'])swRegister.includes(token)?pass('SW registration token',token):fail('SW registration token',token);

const testFile=fs.readFileSync('tests/visual-acceptance.spec.mjs','utf8');
const profileBlock=testFile.match(/const PROFILES=\[(.*?)\];/s)?.[1]||'';
(profileBlock.match(/\{id:/g)||[]).length===13?pass('visual profiles','13'):fail('visual profiles',String((profileBlock.match(/\{id:/g)||[]).length));
for(const token of ["const VERSION='9.3.4'",'?v=934&visual=','window.LGMK_V934?.report','#deviceAcceptance .v934-acceptance','lgmk-device-acceptance-report/v1'])testFile.includes(token)?pass('visual automation token',token):fail('visual automation token',token);

if(failed){console.error(`\n${failed} cumulative v9.3.4 gate(s) failed.`);process.exit(1)}
console.log('\nAll cumulative v9.3.4 acceptance automation, evidence, stability, content and device gates passed.');
