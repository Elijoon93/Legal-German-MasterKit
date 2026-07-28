import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const required=[
  'assets/js/v90-shell.js',
  'assets/css/v90-foundation.css',
  'release-v9.0.json',
  'index.html',
  'manifest.webmanifest',
  'service-worker.js'
];
let failed=0;
const pass=(name,detail='')=>console.log(`PASS ${name}${detail?` — ${detail}`:''}`);
const fail=(name,detail='')=>{failed++;console.error(`FAIL ${name}${detail?` — ${detail}`:''}`)};
for(const file of required)fs.existsSync(file)?pass('file',file):fail('file',file);
for(const file of ['assets/js/v90-shell.js']){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  result.status===0?pass('syntax',file):fail('syntax',result.stderr||result.stdout);
}
const index=fs.readFileSync('index.html','utf8');
for(const token of ['Legal German MasterKit v9.0.0','v90-foundation.css?v=900','v90-shell.js?v=900','id="deviceAcceptance"'])index.includes(token)?pass('index token',token):fail('index token',token);
for(const removed of ['v84-pflege-inspired.css','v86-mobile-acceptance.css','v86-mobile-hotfix.css','v89-architecture.css','v84-shell.js','v84-hotfix.js','v89-architecture.js','v86-force-refresh.js'])!index.includes(removed)?pass('legacy removed',removed):fail('legacy still loaded',removed);
const cssLinks=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
cssLinks.length===7?pass('stylesheet count','7'):fail('stylesheet count',String(cssLinks.length));
const release=JSON.parse(fs.readFileSync('release-v9.0.json','utf8'));
release.version==='9.0.0'?pass('release version',release.version):fail('release version',release.version);
release.device_acceptance?.profiles===9?pass('device profiles','9'):fail('device profiles',String(release.device_acceptance?.profiles));
release.architecture?.mobile_primary_tabs===5?pass('mobile primary tabs','5'):fail('mobile primary tabs',String(release.architecture?.mobile_primary_tabs));
release.release_gates?.state_reset===false?pass('state preservation','locked'):fail('state preservation','not locked');
const shell=fs.readFileSync('assets/js/v90-shell.js','utf8');
for(const token of ['const VERSION="9.0.0"','const PROFILES=[','deviceAcceptance','runMatrix','collectMetrics','v90-mobile-nav'])shell.includes(token)?pass('shell token',token):fail('shell token',token);
!shell.includes('localStorage.clear(')?pass('no localStorage.clear'):fail('forbidden localStorage.clear');
!shell.includes('indexedDB.deleteDatabase(')?pass('no indexedDB.deleteDatabase'):fail('forbidden indexedDB.deleteDatabase');
const primaryBlock=shell.match(/const PRIMARY=\[(.*?)\];/s)?.[1]||'';
(primaryBlock.match(/\["/g)||[]).length===5?pass('primary route count','5'):fail('primary route count',String((primaryBlock.match(/\["/g)||[]).length));
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
manifest.name.includes('v9.0.0')?pass('manifest version',manifest.name):fail('manifest version',manifest.name);
manifest.start_url.includes('9.0.0')?pass('manifest start_url',manifest.start_url):fail('manifest start_url',manifest.start_url);
const sw=fs.readFileSync('service-worker.js','utf8');
for(const token of ['lgmk-v9-0-consolidated','release-v9.0.json','v90-foundation.css?v=900','v90-shell.js?v=900'])sw.includes(token)?pass('cache token',token):fail('cache token',token);
const css=fs.readFileSync('assets/css/v90-foundation.css','utf8');
for(const token of ['grid-template-columns:repeat(5','env(safe-area-inset-bottom','font-size:16px!important','v90-keyboard-open'])css.includes(token)?pass('responsive token',token):fail('responsive token',token);
if(failed){console.error(`\n${failed} v9.0 gate(s) failed.`);process.exit(1)}
console.log('\nAll v9.0 consolidation and device gates passed.');
