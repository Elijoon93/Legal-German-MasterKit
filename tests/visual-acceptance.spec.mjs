import fs from 'node:fs';
import path from 'node:path';
import {test,expect,chromium,webkit} from '@playwright/test';

const VERSION='9.4.0';
const ARTIFACT_ROOT=path.resolve('artifacts');
const SCREENSHOT_ROOT=path.join(ARTIFACT_ROOT,'screenshots');
const METRIC_ROOT=path.join(ARTIFACT_ROOT,'metrics');
fs.mkdirSync(SCREENSHOT_ROOT,{recursive:true});
fs.mkdirSync(METRIC_ROOT,{recursive:true});

const PROFILES=[
  {id:'iphone-se',label:'iPhone SE',engine:'webkit',width:375,height:667,mode:'phone',isMobile:true,hasTouch:true,scale:2},
  {id:'iphone-15',label:'iPhone 15',engine:'webkit',width:393,height:852,mode:'phone',isMobile:true,hasTouch:true,scale:3},
  {id:'iphone-max',label:'iPhone Pro Max',engine:'webkit',width:430,height:932,mode:'phone',isMobile:true,hasTouch:true,scale:3},
  {id:'android-small',label:'Android Compact',engine:'chromium',width:360,height:800,mode:'phone',isMobile:true,hasTouch:true,scale:3},
  {id:'android-modern',label:'Android Modern',engine:'chromium',width:412,height:915,mode:'phone',isMobile:true,hasTouch:true,scale:2.625},
  {id:'ipad-portrait',label:'iPad Portrait',engine:'webkit',width:768,height:1024,mode:'tablet',isMobile:true,hasTouch:true,scale:2},
  {id:'ipad-landscape',label:'iPad Landscape',engine:'webkit',width:1024,height:768,mode:'tablet',isMobile:true,hasTouch:true,scale:2},
  {id:'android-tablet',label:'Android Tablet',engine:'chromium',width:800,height:1280,mode:'tablet',isMobile:true,hasTouch:true,scale:2},
  {id:'windows-split',label:'Windows Split View',engine:'chromium',width:960,height:900,mode:'tablet',isMobile:false,hasTouch:false,scale:1},
  {id:'windows-compact',label:'Windows Compact',engine:'chromium',width:1280,height:800,mode:'compact',isMobile:false,hasTouch:false,scale:1},
  {id:'windows-laptop',label:'Windows Laptop',engine:'chromium',width:1366,height:768,mode:'desktop',isMobile:false,hasTouch:false,scale:1},
  {id:'windows-desktop',label:'Windows Desktop',engine:'chromium',width:1536,height:864,mode:'desktop',isMobile:false,hasTouch:false,scale:1},
  {id:'wide-desktop',label:'Wide Desktop',engine:'chromium',width:1920,height:1080,mode:'desktop',isMobile:false,hasTouch:false,scale:1}
];

function writeMetric(profile,data){
  fs.writeFileSync(path.join(METRIC_ROOT,`${profile.id}.json`),JSON.stringify({profile,...data},null,2));
}
async function inspect(page,profile){
  return page.evaluate(({expectedMode,version})=>{
    const root=document.documentElement,body=document.body;
    const visible=element=>Boolean(element&&getComputedStyle(element).display!=='none'&&getComputedStyle(element).visibility!=='hidden'&&element.getBoundingClientRect().width>0&&element.getBoundingClientRect().height>0);
    const rect=selector=>{const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
    const sidebar=document.querySelector('.v90-sidebar'),mobile=document.querySelector('.v90-mobile-nav'),content=document.querySelector('.v90-content');
    const bodyStyle=getComputedStyle(body),compactLabels=[...document.querySelectorAll('#mainNav .v90-nav-groups button b')].filter(visible);
    return{
      mode:root.dataset.deviceMode,orientation:root.dataset.orientation,release:root.dataset.release,runtimeStable:root.dataset.runtimeStable,
      learningOs:root.dataset.learningOs,shellMarker:root.dataset.shell,appReady:root.dataset.appReady,bootState:window.__LGMK_BOOT_STATE,
      startupVisible:visible(document.querySelector('#startupStatus')),startupErrors:window.LGMK_STARTUP_DIAGNOSTICS?.errors||[],
      finalRuntime:Boolean(window.LGMK_FINAL_SHELL&&window.LGMK_FINAL_DEVICE&&window.LGMK_FINAL_ACCEPTANCE),
      serviceWorker:window.LGMK_SERVICE_WORKER||null,title:document.title,viewport:{width:innerWidth,height:innerHeight},
      rootScrollWidth:root.scrollWidth,bodyScrollWidth:body.scrollWidth,bodyPaddingLeft:parseFloat(bodyStyle.paddingLeft)||0,bodyPaddingRight:parseFloat(bodyStyle.paddingRight)||0,
      mainNavCount:document.querySelectorAll('#mainNav').length,sidebarCount:document.querySelectorAll('.v90-sidebar').length,
      sidebarVisible:visible(sidebar),mobileNavVisible:visible(mobile),mobileTabCount:mobile?.querySelectorAll('button[data-view]').length||0,
      compactVisibleLabels:compactLabels.length,focusCtaCount:[...document.querySelectorAll('#v93StartFocus')].filter(visible).length,
      oldTitlePresent:document.body.innerText.includes('MASTERKIT 8.2'),advancedGroupVisible:[...document.querySelectorAll('.v93-advanced-group')].some(visible),
      sidebarRect:rect('.v90-sidebar'),contentRect:rect('.v90-content'),expectedMode,expectedRelease:version,
      activeText:(document.querySelector('.view.active')?.textContent||'').trim().length
    };
  },{expectedMode:profile.mode,version:VERSION});
}
async function assertRoute(page,view,minText=60){
  await page.evaluate(target=>window.go(target),view);
  await expect(page.locator(`#${view}.active`)).toBeVisible();
  const length=await page.locator(`#${view}.active`).evaluate(el=>(el.textContent||'').trim().length);
  expect(length).toBeGreaterThan(minText);
}
async function assertNoOverflow(page){
  const values=await page.evaluate(()=>({root:document.documentElement.scrollWidth,width:innerWidth,body:document.body.scrollWidth}));
  expect(values.root).toBeLessThanOrEqual(values.width+1);
  expect(values.body).toBeLessThanOrEqual(values.width+1);
}

for(const profile of PROFILES){
  test(`${profile.label} — final 9.4.0 runtime routes and visual acceptance`,async({baseURL})=>{
    const browserType=profile.engine==='webkit'?webkit:chromium;
    const browser=await browserType.launch({headless:true});
    const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},deviceScaleFactor:profile.scale,isMobile:profile.isMobile,hasTouch:profile.hasTouch,locale:'fa-IR',colorScheme:'light',reducedMotion:'reduce'});
    const page=await context.newPage();
    const pageErrors=[];const consoleErrors=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    page.on('console',message=>{if(message.type()==='error'&&!/Failed to load resource|favicon/i.test(message.text()))consoleErrors.push(message.text())});
    const root=String(baseURL||'').replace(/\/$/,'');
    await page.goto(`${root}/?v=940&visual=${profile.id}`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.appReady==='true',{timeout:20_000});
    await page.waitForFunction(()=>document.documentElement.dataset.runtimeStable==='true',{timeout:20_000});
    await page.waitForFunction(()=>document.documentElement.dataset.learningOs==='dual-reference-v93');
    await page.waitForFunction(()=>Boolean(window.LGMK_FINAL_ACCEPTANCE?.report));
    await expect(page.locator('.v93-home')).toBeVisible();
    await expect(page.locator('#startupStatus')).toHaveCount(0);
    await expect(page.locator('#v90ReleaseBadge')).toContainText(VERSION);
    await page.screenshot({path:path.join(SCREENSHOT_ROOT,`${profile.id}-dashboard.png`),fullPage:true});

    const metrics=await inspect(page,profile);writeMetric(profile,{metrics,pageErrors,consoleErrors});
    expect(metrics.appReady).toBe('true');expect(metrics.runtimeStable).toBe('true');expect(metrics.bootState).toBe('ready');
    expect(metrics.startupVisible).toBeFalsy();expect(metrics.startupErrors).toEqual([]);expect(metrics.mode).toBe(profile.mode);
    expect(metrics.release).toBe(VERSION);expect(metrics.learningOs).toBe('dual-reference-v93');expect(metrics.shellMarker).toBe('final-adaptive-shell');
    expect(metrics.finalRuntime).toBeTruthy();expect(metrics.title).toContain(`v${VERSION}`);expect(metrics.mainNavCount).toBe(1);expect(metrics.sidebarCount).toBe(1);
    expect(metrics.oldTitlePresent).toBeFalsy();expect(metrics.advancedGroupVisible).toBeFalsy();expect(metrics.bodyPaddingLeft).toBeLessThan(1);expect(metrics.bodyPaddingRight).toBeLessThan(1);
    expect(metrics.rootScrollWidth).toBeLessThanOrEqual(profile.width+1);expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(profile.width+1);
    expect(metrics.focusCtaCount).toBe(1);expect(metrics.activeText).toBeGreaterThan(100);expect(metrics.contentRect?.right||0).toBeLessThanOrEqual(profile.width+1);expect(metrics.contentRect?.x||0).toBeGreaterThanOrEqual(-1);
    if(profile.mode==='compact'){expect(metrics.compactVisibleLabels).toBe(0);expect(metrics.sidebarRect?.width||0).toBeGreaterThanOrEqual(86);expect(metrics.sidebarRect?.width||0).toBeLessThanOrEqual(90)}
    if(['phone','tablet'].includes(profile.mode)){expect(metrics.mobileNavVisible).toBeTruthy();expect(metrics.sidebarVisible).toBeFalsy();expect(metrics.mobileTabCount).toBe(5)}else{expect(metrics.sidebarVisible).toBeTruthy();expect(metrics.mobileNavVisible).toBeFalsy()}

    await page.locator('#v93StartFocus').click();await expect(page.locator('#v93FocusOverlay')).toBeVisible();await expect(page.locator('.v93-focus-dialog>nav i')).toHaveCount(5);
    await page.screenshot({path:path.join(SCREENSHOT_ROOT,`${profile.id}-focus.png`),fullPage:false});await page.locator('#v93CloseFocus').click();await expect(page.locator('#v93FocusOverlay')).toHaveCount(0);

    await assertRoute(page,'studyHub');await page.screenshot({path:path.join(SCREENSHOT_ROOT,`${profile.id}-study.png`),fullPage:true});
    await assertRoute(page,'skillsHub');await expect(page.locator('#skillsHub .v93-competency')).toHaveCount(8);await page.screenshot({path:path.join(SCREENSHOT_ROOT,`${profile.id}-competencies.png`),fullPage:true});
    await assertRoute(page,'practiceHub');await assertRoute(page,'researchHub');
    await assertRoute(page,'deviceAcceptance');await expect(page.locator('#deviceAcceptance .v90-check-grid article.fail')).toHaveCount(0);await expect(page.locator('#deviceAcceptance .final-acceptance')).toBeVisible();
    const widthMetric=page.locator('#deviceAcceptance .v91-hub-summary .v91-metric').filter({hasText:'عرض محتوا'});const runtimeMetric=page.locator('#deviceAcceptance .v91-hub-summary .v91-metric').filter({hasText:'Runtime'});
    await expect(widthMetric).toContainText('PASS');await expect(runtimeMetric).toContainText('PASS');
    const evidence=await page.evaluate(()=>window.LGMK_FINAL_ACCEPTANCE.report());
    expect(evidence.schema).toBe('lgmk-final-acceptance-report/v2');expect(evidence.version).toBe(VERSION);expect(evidence.runtime.appReady).toBeTruthy();expect(evidence.runtime.runtimeStable).toBeTruthy();
    await page.screenshot({path:path.join(SCREENSHOT_ROOT,`${profile.id}-device-acceptance.png`),fullPage:true});

    if(profile.id==='iphone-15'){
      await page.setViewportSize({width:852,height:393});
      await page.waitForFunction(()=>document.documentElement.dataset.orientation==='landscape'&&document.documentElement.dataset.deviceMode==='phone');
      await assertRoute(page,'dashboard');await assertNoOverflow(page);await page.screenshot({path:path.join(SCREENSHOT_ROOT,'iphone-landscape-dashboard.png'),fullPage:true});
    }
    expect(pageErrors).toEqual([]);expect(consoleErrors).toEqual([]);
    await context.close();await browser.close();
  });
}

test.afterAll(()=>{
  const rows=PROFILES.map(profile=>{const file=path.join(METRIC_ROOT,`${profile.id}.json`);return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{profile,status:'missing'}});
  const completed=rows.filter(row=>row.metrics).length;
  const chromiumRows=rows.filter(row=>row.profile?.engine==='chromium');const webkitRows=rows.filter(row=>row.profile?.engine==='webkit');
  const automatedPass=completed===PROFILES.length&&rows.every(row=>row.metrics?.appReady==='true'&&row.metrics?.runtimeStable==='true'&&row.pageErrors?.length===0&&row.consoleErrors?.length===0);
  const report={schema:'lgmk-ci-final-acceptance/v1',version:VERSION,generatedAt:new Date().toISOString(),automated:{profiles:PROFILES.length,completed,pass:automatedPass,chromium:{profiles:chromiumRows.length,pass:chromiumRows.every(row=>row.metrics&&row.pageErrors.length===0&&row.consoleErrors.length===0)},webkit:{profiles:webkitRows.length,pass:webkitRows.every(row=>row.metrics&&row.pageErrors.length===0&&row.consoleErrors.length===0)}},physical:{required:['windows-compact','iphone-portrait','iphone-landscape','ipad-portrait','ipad-landscape'],confirmed:[],pass:false},finalAccepted:false,profiles:rows};
  fs.writeFileSync(path.join(ARTIFACT_ROOT,'visual-acceptance-summary.json'),JSON.stringify({version:VERSION,generatedAt:report.generatedAt,profiles:rows},null,2));
  fs.writeFileSync(path.join(ARTIFACT_ROOT,'FINAL_ACCEPTANCE_REPORT.json'),JSON.stringify(report,null,2));
});
