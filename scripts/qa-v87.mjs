import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const requiredJs=[
  'assets/js/v87-legal-evidence-data.js',
  'assets/js/v87-engine.js',
  'assets/js/v87-ui.js',
  'assets/js/v86-mobile-acceptance.js',
  'assets/js/v86-force-refresh.js'
];
const requiredAssets=[
  ...requiredJs,
  'assets/css/v87-evidence.css',
  'release-v8.7.json',
  'manifest.webmanifest',
  'service-worker.js',
  'index.html'
];
const failures=[];
const pass=(name,detail='')=>console.log(`PASS ${name}${detail?` — ${detail}`:''}`);
const fail=(name,detail='')=>{failures.push({name,detail});console.error(`FAIL ${name}${detail?` — ${detail}`:''}`)};

for(const file of requiredAssets){fs.existsSync(file)?pass('file',file):fail('file missing',file)}
for(const file of requiredJs){
  if(!fs.existsSync(file))continue;
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('syntax',file):fail('syntax',`${file}: ${result.stderr||result.stdout}`);
}

try{
  const context={window:{}};vm.createContext(context);
  vm.runInContext(fs.readFileSync('assets/js/v87-legal-evidence-data.js','utf8'),context,{filename:'v87-legal-evidence-data.js'});
  const data=context.window.LGMK_V87_DATA;
  if(!data)throw new Error('LGMK_V87_DATA missing');
  data.norms.length===24?pass('norm count','24'):fail('norm count',String(data.norms.length));
  data.cases.length===13?pass('case count','13'):fail('case count',String(data.cases.length));
  data.cases.filter(x=>x.kind!=='Lehrfall').length===4?pass('official judgment count','4'):fail('official judgment count',String(data.cases.filter(x=>x.kind!=='Lehrfall').length));
  const courseIds=new Set(data.cases.map(x=>x.courseId));
  ['bgb-at','schuld-at','schuld-bt','commercial','company','admin','economic-admin','eu','competition','research'].every(x=>courseIds.has(x))?pass('case coverage','10 courses'):fail('case coverage',[...courseIds].join(','));
  data.norms.every(x=>/^https:\/\//.test(x.officialUrl)&&x.lastChecked)?pass('official norm metadata','all records'):fail('official norm metadata','missing URL or lastChecked');
}catch(error){fail('data evaluation',error.message)}

try{
  const index=fs.readFileSync('index.html','utf8');
  for(const token of ['Legal German MasterKit v8.7.0','v87-legal-evidence-data.js?v=870','v87-engine.js?v=870','v87-ui.js?v=870','v87-evidence.css?v=870','id="legalEvidence"','id="caseBriefs"','id="citationAudit"','id="referenceImport"'])index.includes(token)?pass('index token',token):fail('index token',token);
}catch(error){fail('index inspection',error.message)}

try{
  const release=JSON.parse(fs.readFileSync('release-v8.7.json','utf8'));
  release.version==='8.7.0'?pass('release version',release.version):fail('release version',release.version);
  release.modules?.course_workspace?.stages_per_course===8?pass('course stages','8'):fail('course stages',String(release.modules?.course_workspace?.stages_per_course));
  release.locked_baseline?.public_runtime_verification_required===true?pass('runtime gate','required'):fail('runtime gate','not required');
}catch(error){fail('release manifest',error.message)}

try{
  const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
  manifest.name.includes('v8.7.0')?pass('PWA manifest',manifest.name):fail('PWA manifest',manifest.name);
  manifest.start_url.includes('8.7.0')?pass('PWA start URL',manifest.start_url):fail('PWA start URL',manifest.start_url);
}catch(error){fail('PWA manifest parse',error.message)}

try{
  const sw=fs.readFileSync('service-worker.js','utf8');
  for(const token of ['lgmk-v8-7-legal-evidence','release-v8.7.json','v87-evidence.css?v=870','v87-legal-evidence-data.js?v=870','v87-engine.js?v=870','v87-ui.js?v=870'])sw.includes(token)?pass('PWA cache token',token):fail('PWA cache token',token);
}catch(error){fail('service worker inspection',error.message)}

if(failures.length){console.error(`\n${failures.length} quality gate(s) failed.`);process.exit(1)}
console.log('\nAll v8.7 quality gates passed.');
