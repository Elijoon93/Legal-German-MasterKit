import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const required=[
  'assets/js/v89-architecture.js',
  'assets/css/v89-architecture.css',
  'release-v8.9.json',
  'index.html',
  'manifest.webmanifest',
  'service-worker.js'
];
let failures=0;
const pass=(name,detail='')=>console.log(`PASS ${name}${detail?` — ${detail}`:''}`);
const fail=(name,detail='')=>{failures++;console.error(`FAIL ${name}${detail?` — ${detail}`:''}`)};

for(const file of required)fs.existsSync(file)?pass('file',file):fail('missing file',file);
for(const file of ['assets/js/v89-architecture.js','assets/js/v86-force-refresh.js']){
  if(!fs.existsSync(file))continue;
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('syntax',file):fail('syntax',`${file}: ${result.stderr||result.stdout}`);
}

try{
  const index=fs.readFileSync('index.html','utf8');
  for(const token of [
    'Legal German MasterKit v8.9.0',
    'v89-architecture.css?v=890',
    'v89-architecture.js?v=890',
    'id="researchHub"',
    'manifest.webmanifest?v=890'
  ])index.includes(token)?pass('index token',token):fail('index token',token);
  const cssPosition=index.indexOf('v89-architecture.css?v=890');
  const priorCssPosition=index.indexOf('v88-deep.css?v=880');
  cssPosition>priorCssPosition?pass('CSS precedence','v8.9 loaded last'):fail('CSS precedence','v8.9 must load after v8.8');
}catch(error){fail('index inspection',error.message)}

try{
  const js=fs.readFileSync('assets/js/v89-architecture.js','utf8');
  for(const token of [
    '["dashboard","خانه","DB"]',
    '["studyHub","تحصیل","ST"]',
    '["skillsHub","یادگیری","LG"]',
    '["practiceHub","تمرین","PR"]',
    '["researchHub","پژوهش","RS"]',
    'grid-template-columns:repeat(5'
  ]){
    if(token.includes('grid-template'))continue;
    js.includes(token)?pass('architecture token',token):fail('architecture token',token);
  }
  const primaryMatch=js.match(/const PRIMARY=\[(.*?)\];/s);
  const primaryCount=primaryMatch?(primaryMatch[1].match(/\["/g)||[]).length:0;
  primaryCount===5?pass('primary hubs','5'):fail('primary hubs',String(primaryCount));
  js.includes('renderResearchHubV89')?pass('research hub renderer','present'):fail('research hub renderer','missing');
  js.includes('document.documentElement.dataset.architecture="pflege-inspired-v89"')?pass('architecture marker','present'):fail('architecture marker','missing');
}catch(error){fail('architecture inspection',error.message)}

try{
  const css=fs.readFileSync('assets/css/v89-architecture.css','utf8');
  for(const token of [
    'grid-template-columns:260px minmax(0,1fr)',
    '.v89-mobile-nav{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))',
    '@media(max-width:1024px)',
    'env(safe-area-inset-bottom,0px)',
    'input,select,textarea{font-size:16px!important}',
    '--v89-brand:#0f766e'
  ])css.includes(token)?pass('CSS token',token):fail('CSS token',token);
  /emoji-navigation/.test(css)?fail('emoji navigation','unexpected design token'):pass('emoji navigation','not used in CSS');
}catch(error){fail('CSS inspection',error.message)}

try{
  const release=JSON.parse(fs.readFileSync('release-v8.9.json','utf8'));
  release.version==='8.9.0'?pass('release version',release.version):fail('release version',release.version);
  release.information_architecture?.primary_hubs?.length===5?pass('manifest hubs','5'):fail('manifest hubs',String(release.information_architecture?.primary_hubs?.length));
  release.design_reference?.copied_domain_data===false?pass('domain isolation','true'):fail('domain isolation','nursing data must not be copied');
  release.responsive_acceptance?.mobile_tablet_breakpoint_px===1024?pass('responsive breakpoint','1024'):fail('responsive breakpoint',String(release.responsive_acceptance?.mobile_tablet_breakpoint_px));
  release.preserved?.user_state===true?pass('state preservation','true'):fail('state preservation','false');
}catch(error){fail('release manifest',error.message)}

try{
  const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
  manifest.name.includes('v8.9.0')?pass('PWA manifest',manifest.name):fail('PWA manifest',manifest.name);
  manifest.start_url.includes('8.9.0')?pass('PWA start URL',manifest.start_url):fail('PWA start URL',manifest.start_url);
}catch(error){fail('PWA manifest parse',error.message)}

try{
  const sw=fs.readFileSync('service-worker.js','utf8');
  for(const token of [
    'lgmk-v8-9-pflege-architecture',
    'release-v8.9.json',
    'v89-architecture.css?v=890',
    'v89-architecture.js?v=890',
    'v86-force-refresh.js?v=890'
  ])sw.includes(token)?pass('PWA cache token',token):fail('PWA cache token',token);
}catch(error){fail('service worker inspection',error.message)}

if(failures){console.error(`\n${failures} v8.9 quality gate(s) failed.`);process.exit(1)}
console.log('\nAll v8.9 architecture quality gates passed.');
