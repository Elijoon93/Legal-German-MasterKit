import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const required=[
  'package.json','playwright.config.mjs','tests/visual-acceptance.spec.mjs',
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
for(const file of ['playwright.config.mjs','tests/visual-acceptance.spec.mjs','scripts/qa-v932.mjs']){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('node syntax',file):fail('node syntax',`${file}: ${result.stderr||result.stdout}`);
}

for(const token of [
  'Legal German MasterKit v9.3.2','manifest.webmanifest?v=932','LGMK_RELEASE_VERSION="9.3.2"',
  'LGMK_CACHE_NAME="lgmk-v9-3-2-startup-recovery-20260728a"','v932-startup.css?v=932',
  'v932-startup.js?v=932','id="startupStatus"','data-startup-title','app-views2.js?v=932'
])index.includes(token)?pass('index token',token):fail('index token',token);

const parserBlocking=externalTags.filter(tag=>tag.file!=='assets/js/v932-startup.js'&&!/\bdefer\b/.test(tag.attrs));
parserBlocking.length===0?pass('parser-blocking external scripts','0'):fail('parser-blocking external scripts',parserBlocking.map(x=>x.file).join(', '));
const startupTag=externalTags.find(tag=>tag.file==='assets/js/v932-startup.js');
startupTag&&!/\bdefer\b/.test(startupTag.attrs)?pass('startup watchdog executes early'):fail('startup watchdog placement');
const afterHead=index.slice(index.indexOf('</head>'));
!/<script[^>]+src=/.test(afterHead)?pass('no external scripts after head'):fail('external script remains after head');
new Set(externalTags.map(x=>x.file)).size===externalTags.length?pass('script uniqueness',String(externalTags.length)):fail('duplicate external scripts');

const cssLinks=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
cssLinks.length===12?pass('stylesheet count','12'):fail('stylesheet count',String(cssLinks.length));
new Set(cssLinks).size===cssLinks.length?pass('stylesheet uniqueness','12 unique'):fail('duplicate stylesheets');
index.indexOf('v932-startup.css?v=932')>index.indexOf('v931-visual-acceptance.css?v=931')?pass('startup CSS final precedence'):fail('startup CSS precedence');

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

const release=JSON.parse(fs.readFileSync('release-v9.3.2.json','utf8'));
release.version==='9.3.2'?pass('release version',release.version):fail('release version',release.version);
release.startup_architecture?.external_scripts==='deferred in document head'?pass('deferred startup architecture'):fail('deferred startup architecture');
release.startup_architecture?.boot_is_idempotent===true&&release.startup_architecture?.wire_is_idempotent===true?pass('idempotent startup'):fail('idempotent startup');
release.startup_architecture?.automatic_recovery_attempts===2?pass('recovery attempts','2'):fail('recovery attempts');
release.startup_architecture?.final_failure_timeout_ms===12000?pass('slow-network timeout','12000ms'):fail('slow-network timeout',String(release.startup_architecture?.final_failure_timeout_ms));
release.performance?.parser_blocking_external_scripts===0?pass('release parser-blocking gate','0'):fail('release parser-blocking gate');
release.release_gates?.blank_page_forbidden===true&&release.release_gates?.static_header_only_forbidden===true?pass('blank-page gate'):fail('blank-page gate');
release.release_gates?.state_reset===false?pass('state preservation'):fail('state preservation');

const startup=fs.readFileSync('assets/js/v932-startup.js','utf8');
for(const token of ['const VERSION="9.3.2"','unhandledrejection','LGMK_STARTUP_DIAGNOSTICS','attemptRecovery','shellReady','lgmk:ready','setTimeout(finalCheck,12000)','errors[errors.length-1]'])startup.includes(token)?pass('startup token',token):fail('startup token',token);
!startup.includes('localStorage.clear(')&&!startup.includes('indexedDB.deleteDatabase(')&&!startup.includes('caches.delete(')?pass('startup state preservation'):fail('startup destructive call');

const coreBoot=fs.readFileSync('assets/js/app-views2.js','utf8');
for(const token of ['__LGMK_WIRED','__LGMK_INSTALL_WIRED','__LGMK_BOOT_STATE','window.boot=boot','lgmk:ready','service-worker.js?v=932','document.readyState==="complete"'])coreBoot.includes(token)?pass('core boot token',token):fail('core boot token',token);

const guard=fs.readFileSync('assets/js/v931-visual-guard.js','utf8');
guard.includes('window.LGMK_RELEASE_VERSION||"9.3.1"')?pass('visual guard active-release inheritance'):fail('visual guard release inheritance');

const testFile=fs.readFileSync('tests/visual-acceptance.spec.mjs','utf8');
const profileBlock=testFile.match(/const PROFILES=\[(.*?)\];/s)?.[1]||'';
(profileBlock.match(/\{id:/g)||[]).length===13?pass('test profile definitions','13'):fail('test profile definitions',String((profileBlock.match(/\{id:/g)||[]).length));
for(const token of ["const VERSION='9.3.2'","dataset.appReady==='true'",'bootState','startupVisible','startupErrors','startupStatus','focusCtaCount','v93FocusOverlay','.v93-competency'])testFile.includes(token)?pass('visual startup token',token):fail('visual startup token',token);

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version==='9.3.2'?pass('package version',pkg.version):fail('package version',pkg.version);
pkg.scripts?.['qa:source']==='node scripts/qa-v932.mjs'?pass('source test script'):fail('source test script');
pkg.devDependencies?.['@playwright/test']==='1.61.1'?pass('Playwright pin','1.61.1'):fail('Playwright pin');

const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
manifest.name.includes('v9.3.2')?pass('manifest version',manifest.name):fail('manifest version',manifest.name);
manifest.start_url.includes('9.3.2')?pass('manifest start URL',manifest.start_url):fail('manifest start URL',manifest.start_url);
manifest.display==='standalone'?pass('manifest display','standalone'):fail('manifest display',manifest.display);

const sw=fs.readFileSync('service-worker.js','utf8');
for(const token of ['lgmk-v9-3-2-startup-recovery','release-v9.3.2.json','manifest.webmanifest?v=932','v932-startup.css?v=932','v932-startup.js?v=932','app-views2.js?v=932'])sw.includes(token)?pass('cache token',token):fail('cache token',token);

const workflow=fs.readFileSync('.github/workflows/qa-v87.yml','utf8');
for(const token of ['node scripts/qa-v932.mjs','playwright install --with-deps chromium webkit','npm run qa:visual','actions/upload-artifact@v4','startup-recovery-v9.3.2'])workflow.includes(token)?pass('workflow token',token):fail('workflow token',token);

if(failed){console.error(`\n${failed} cumulative v9.3.2 gate(s) failed.`);process.exit(1)}
console.log('\nAll cumulative v9.3.2 startup, blank-page prevention, content, cache and visual-device gates passed.');
