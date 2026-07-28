import fs from 'node:fs';
import path from 'node:path';
import {test,expect,chromium,webkit} from '@playwright/test';

const VERSION='9.3.2';
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
    const visible=element=>Boolean(element&&getComputedStyle(element).display!=='none'&&getComputedStyle(element).visibility!=='hidden');
    const rect=selector=>{const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
    const sidebar=document.querySelector('.v90-sidebar'),mobile=document.querySelector('.v90-mobile-nav');
    const content=document.querySelector('.v90-content'),shell=document.querySelector('.app-shell');
    const mobileMode=['phone','tablet'].includes(root.dataset.deviceMode);
    const bodyStyle=getComputedStyle(body);
    const focusButtons=[...document.querySelectorAll('#v93StartFocus')].filter(visible);
    const advancedGroups=[...document.querySelectorAll('.v93-advanced-group')].filter(visible);
    return{
      mode:root.dataset.deviceMode,
      orientation:root.dataset.orientation,
      release:root.dataset.release,
      learningOs:root.dataset.learningOs,
      shellMarker:root.dataset.shell,
      appReady:root.dataset.appReady,
      bootState:window.__LGMK_BOOT_STATE,
      startupVisible:visible(document.querySelector('#startupStatus')),
      startupErrors:window.LGMK_STARTUP_DIAGNOSTICS?.errors||[],
      title:document.title,
      viewport:{width:innerWidth,height:innerHeight},
      rootScrollWidth:root.scrollWidth,
      bodyScrollWidth:body.scrollWidth,
      bodyPaddingLeft:parseFloat(bodyStyle.paddingLeft)||0,
      bodyPaddingRight:parseFloat(bodyStyle.paddingRight)||0,
      mainNavCount:document.querySelectorAll('#mainNav').length,
      sidebarCount:document.querySelectorAll('.v90-sidebar').length,
      sidebarVisible:visible(sidebar),
      mobileNavVisible:visible(mobile),
      mobileTabCount:mobile?.querySelectorAll('button[data-view]').length||0,
      focusCtaCount:focusButtons.length,
      oldTitlePresent:document.body.innerText.includes('MASTERKIT 8.2'),
      advancedGroupVisible:advancedGroups.length>0,
      contentRect:rect('.v90-content'),
      shellRect:rect('.app-shell'),
      topbarRect:rect('.topbar'),
      expectedMode,
      expectedRelease:version,
      expectedMobile:mobileMode,
      activeText:(document.querySelector('.view.active')?.textContent||'').trim().length
    };
  },{expectedMode:profile.mode,version:VERSION});
}

for(const profile of PROFILES){
  test(`${profile.label} — startup, shell, learning flow and screenshots`,async({baseURL})=>{
    const browserType=profile.engine==='webkit'?webkit:chromium;
    const browser=await browserType.launch({headless:true});
    const context=await browser.newContext({
      viewport:{width:profile.width,height:profile.height},
      deviceScaleFactor:profile.scale,
      isMobile:profile.isMobile,
      hasTouch:profile.hasTouch,
      locale:'fa-IR',
      colorScheme:'light',
      reducedMotion:'reduce'
    });
    const page=await context.newPage();
    const pageErrors=[];
    const consoleErrors=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    page.on('console',message=>{
      if(message.type()==='error'&&!/Failed to load resource|favicon/i.test(message.text()))consoleErrors.push(message.text());
    });
    const root=String(baseURL||'').replace(/\/$/,'');
    await page.goto(`${root}/?v=932&visual=${profile.id}`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.appReady==='true',{timeout:15_000});
    await page.waitForFunction(()=>document.documentElement.dataset.learningOs==='dual-reference-v93');
    await expect(page.locator('.v93-home')).toBeVisible();
    await expect(page.locator('#startupStatus')).toHaveCount(0);
    await expect(page.locator('#v90ReleaseBadge')).toContainText(VERSION);
    await page.screenshot({path:path.join(SCREENSHOT_ROOT,`${profile.id}-dashboard.png`),fullPage:true});

    const metrics=await inspect(page,profile);
    writeMetric(profile,{metrics,pageErrors,consoleErrors});
    expect(metrics.appReady).toBe('true');
    expect(metrics.bootState).toBe('ready');
    expect(metrics.startupVisible).toBeFalsy();
    expect(metrics.startupErrors).toEqual([]);
    expect(metrics.mode).toBe(profile.mode);
    expect(metrics.release).toBe(VERSION);
    expect(metrics.learningOs).toBe('dual-reference-v93');
    expect(metrics.shellMarker).toBe('adaptive-v92');
    expect(metrics.title).toContain(`v${VERSION}`);
    expect(metrics.mainNavCount).toBe(1);
    expect(metrics.sidebarCount).toBe(1);
    expect(metrics.oldTitlePresent).toBeFalsy();
    expect(metrics.advancedGroupVisible).toBeFalsy();
    expect(metrics.bodyPaddingLeft).toBeLessThan(1);
    expect(metrics.bodyPaddingRight).toBeLessThan(1);
    expect(metrics.rootScrollWidth).toBeLessThanOrEqual(profile.width+1);
    expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(profile.width+1);
    expect(metrics.focusCtaCount).toBe(1);
    expect(metrics.activeText).toBeGreaterThan(100);
    expect(metrics.contentRect?.right||0).toBeLessThanOrEqual(profile.width+1);
    expect(metrics.contentRect?.x||0).toBeGreaterThanOrEqual(-1);
    if(['phone','tablet'].includes(profile.mode)){
      expect(metrics.mobileNavVisible).toBeTruthy();
      expect(metrics.sidebarVisible).toBeFalsy();
      expect(metrics.mobileTabCount).toBe(5);
    }else{
      expect(metrics.sidebarVisible).toBeTruthy();
      expect(metrics.mobileNavVisible).toBeFalsy();
    }

    await page.locator('#v93StartFocus').click();
    await expect(page.locator('#v93FocusOverlay')).toBeVisible();
    await expect(page.locator('.v93-focus-dialog>nav i')).toHaveCount(5);
    await page.screenshot({path:path.join(SCREENSHOT_ROOT,`${profile.id}-focus.png`),fullPage:false});
    await page.locator('#v93CloseFocus').click();
    await expect(page.locator('#v93FocusOverlay')).toHaveCount(0);

    await page.evaluate(()=>window.go('skillsHub'));
    await expect(page.locator('.v93-competency')).toHaveCount(8);
    await page.screenshot({path:path.join(SCREENSHOT_ROOT,`${profile.id}-competencies.png`),fullPage:true});
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    await context.close();
    await browser.close();
  });
}

test.afterAll(()=>{
  const rows=PROFILES.map(profile=>{
    const file=path.join(METRIC_ROOT,`${profile.id}.json`);
    return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{profile,status:'missing'};
  });
  fs.writeFileSync(path.join(ARTIFACT_ROOT,'visual-acceptance-summary.json'),JSON.stringify({version:VERSION,generatedAt:new Date().toISOString(),profiles:rows},null,2));
});
