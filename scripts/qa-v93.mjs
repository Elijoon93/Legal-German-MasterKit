import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const required=[
  'assets/js/v93-learning-os.js','assets/js/v93-cache-repair.js','assets/css/v93-learning-os.css','release-v9.3.json',
  'assets/js/v92-adaptive.js','assets/js/v92-device.js','assets/css/v92-adaptive-shell.css',
  'assets/js/v91-architecture.js','assets/css/v91-fidelity.css','assets/js/v90-shell.js','assets/js/v90-routing.js',
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
for(const token of ['Legal German MasterKit v9.3.0','manifest.webmanifest?v=930','LGMK_RELEASE_VERSION="9.3.0"','LGMK_CACHE_NAME="lgmk-v9-3-dual-reference-learning-os-20260728a"','v93-learning-os.css?v=930','v93-learning-os.js?v=930','v93-cache-repair.js?v=930','id="deviceAcceptance"'])index.includes(token)?pass('index token',token):fail('index token',token);
const cssLinks=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
cssLinks.length===10?pass('stylesheet count','10'):fail('stylesheet count',String(cssLinks.length));
new Set(cssLinks).size===cssLinks.length?pass('stylesheet uniqueness','10 unique'):fail('duplicate stylesheets');
index.indexOf('v93-learning-os.css?v=930')>index.indexOf('v92-adaptive-shell.css?v=920')?pass('v9.3 CSS precedence'):fail('v9.3 CSS precedence');
index.indexOf('v93-cache-repair.js?v=930')>index.indexOf('v93-learning-os.js?v=930')?pass('cache repair final precedence'):fail('cache repair precedence');

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

const release=JSON.parse(fs.readFileSync('release-v9.3.json','utf8'));
release.version==='9.3.0'?pass('release version',release.version):fail('release version',release.version);
release.design_references?.DeutschWeg_FA?.subject_content_imported===false?pass('DeutschWeg content exclusion'):fail('DeutschWeg content exclusion');
release.design_references?.PflegeDeutsch_Pro?.subject_content_imported===false?pass('Pflege content exclusion'):fail('Pflege content exclusion');
release.learner_architecture?.dominant_cta_count===1?pass('one dominant CTA'):fail('dominant CTA count');
release.learner_architecture?.focus_session_stages?.length===5?pass('focus stages','5'):fail('focus stages',String(release.learner_architecture?.focus_session_stages?.length));
release.competency_engine?.competencies===8?pass('competencies','8'):fail('competencies',String(release.competency_engine?.competencies));
release.competency_engine?.evidence_weight_percent===85&&release.competency_engine?.optional_self_assessment_weight_percent===15?pass('evidence weighting','85/15'):fail('evidence weighting');
release.release_gates?.advanced_tools_outside_primary_navigation===true?pass('advanced tools disclosure'):fail('advanced tools disclosure');
release.release_gates?.state_reset===false?pass('state preservation'):fail('state preservation');
release.offline_repair?.enabled===true&&release.offline_repair?.deletes_user_data===false?pass('offline repair gate'):fail('offline repair gate');

const runtime=fs.readFileSync('assets/js/v93-learning-os.js','utf8');
for(const token of ['const VERSION="9.3.0"','const COMPETENCIES=[','const STAGES=[','evidence[item.id]*.85','(self*20)*.15','v93StartFocus','v93Diagnostic','v93ToolsOverlay','state.v93.evidence.unshift'])runtime.includes(token)?pass('learning OS token',token):fail('learning OS token',token);
const competencyBlock=runtime.match(/const COMPETENCIES=\[(.*?)\];/s)?.[1]||'';
(competencyBlock.match(/\{id:/g)||[]).length===8?pass('competency definitions','8'):fail('competency definitions',String((competencyBlock.match(/\{id:/g)||[]).length));
const stageBlock=runtime.match(/const STAGES=\[(.*?)\];/s)?.[1]||'';
(stageBlock.match(/\{id:/g)||[]).length===5?pass('stage definitions','5'):fail('stage definitions',String((stageBlock.match(/\{id:/g)||[]).length));
!runtime.includes('localStorage.clear(')&&!runtime.includes('indexedDB.deleteDatabase(')?pass('learning OS state preservation'):fail('learning OS destructive call');
for(const forbidden of ['Pflegekraft','Patientenzimmer','Medikamentengabe','Wundversorgung','A1-LISTENING','A2-GRAMMAR','Alltagssprache'])!runtime.includes(forbidden)?pass('no imported subject content',forbidden):fail('imported subject content',forbidden);

const adaptive=fs.readFileSync('assets/js/v92-adaptive.js','utf8');
adaptive.includes('window.LGMK_RELEASE_VERSION||"9.2.0"')&&adaptive.includes('window.LGMK_CACHE_NAME||')?pass('adaptive current-release inheritance'):fail('adaptive release inheritance');
const device=fs.readFileSync('assets/js/v92-device.js','utf8');
device.includes('window.LGMK_RELEASE_VERSION||"9.2.0"')&&device.includes('const BUILD=VERSION.replace')?pass('device current-release inheritance'):fail('device release inheritance');
const repair=fs.readFileSync('assets/js/v93-cache-repair.js','utf8');
for(const token of ['window.LGMK_CACHE_NAME||','document.querySelectorAll','caches.open(CACHE)','cache.add(new Request','LGMK_CACHE_REPAIR'])repair.includes(token)?pass('cache repair token',token):fail('cache repair token',token);
!repair.includes('localStorage.clear(')&&!repair.includes('indexedDB.deleteDatabase(')&&!repair.includes('caches.delete(')?pass('non-destructive cache repair'):fail('destructive cache repair');

const css=fs.readFileSync('assets/css/v93-learning-os.css','utf8');
for(const token of ['.v93-focus-card','.v93-competency','.v93-focus-dialog','.v93-tools-overlay','.v93-advanced-group{display:none!important}','@media(max-width:700px)','font-size:16px!important'])css.includes(token)?pass('learning OS style token',token):fail('learning OS style token',token);

const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
manifest.name.includes('v9.3.0')?pass('manifest version',manifest.name):fail('manifest version',manifest.name);
manifest.start_url.includes('9.3.0')?pass('manifest start URL',manifest.start_url):fail('manifest start URL',manifest.start_url);
manifest.display==='standalone'?pass('manifest display','standalone'):fail('manifest display',manifest.display);
const sw=fs.readFileSync('service-worker.js','utf8');
for(const token of ['lgmk-v9-3-dual-reference-learning-os','release-v9.3.json','v93-learning-os.css?v=930','v93-learning-os.js?v=930','v93-cache-repair.js?v=930'])sw.includes(token)?pass('cache token',token):fail('cache token',token);

if(failed){console.error(`\n${failed} cumulative v9.3 gate(s) failed.`);process.exit(1)}
console.log('\nAll cumulative v9.3 dual-reference learning OS, content, cache and adaptive device gates passed.');
