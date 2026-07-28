"use strict";

/* Adaptive shell */
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.4.0";
  const CACHE=window.LGMK_CACHE_NAME||"lgmk-v9-4-0-final-20260729a";
  let raf=0,lastSignature="";
  const setData=(root,key,value)=>{if(root.dataset[key]!==String(value))root.dataset[key]=String(value)};
  const setVar=(root,name,value)=>{if(root.style.getPropertyValue(name)!==value)root.style.setProperty(name,value)};
  function classify(){
    const vv=window.visualViewport;
    const width=Math.round(vv?.width||window.innerWidth||document.documentElement.clientWidth);
    const height=Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight);
    const coarse=window.matchMedia?.("(pointer: coarse)")?.matches||false;
    const shortSide=Math.min(width,height);
    let mode="desktop";
    if(width<700||(coarse&&shortSide<600))mode="phone";
    else if(width<1100||(coarse&&width<1280))mode="tablet";
    else if(width<1360)mode="compact";
    const orientation=width>=height?"landscape":"portrait";
    const keyboard=(window.innerHeight-height)>150;
    const root=document.documentElement;
    setData(root,"deviceMode",mode);setData(root,"orientation",orientation);setData(root,"keyboard",keyboard?"open":"closed");
    setData(root,"release",VERSION);setData(root,"shell","final-adaptive-shell");
    setVar(root,"--v92-vw",`${width}px`);setVar(root,"--v92-vh",`${height}px`);setVar(root,"--v92-sidebar",width>=1600?"280px":"264px");
    return{width,height,mode,orientation,coarse,keyboard};
  }
  function normalizeShell(force=false){
    const nav=document.querySelector("#mainNav");if(!nav)return;
    const info=classify();
    const signature=[info.width,info.height,info.mode,info.orientation,info.keyboard,VERSION].join("|");
    if(!force&&signature===lastSignature)return;lastSignature=signature;
    document.querySelectorAll(".v90-sidebar").forEach((node,index)=>{if(index>0)node.remove()});
    nav.querySelectorAll(".v90-nav-groups button").forEach(button=>{
      const label=button.querySelector("b")?.textContent?.trim();if(label&&button.title!==label)button.title=label;if(button.hasAttribute("style"))button.removeAttribute("style");
    });
    const topbar=document.querySelector(".topbar");
    if(topbar){topbar.style.setProperty("height","auto","important");topbar.style.setProperty("right","auto","important");topbar.style.setProperty("left","auto","important")}
    let badge=document.querySelector("#v92ModeBadge");
    if(!badge){badge=document.createElement("span");badge.id="v92ModeBadge";badge.setAttribute("aria-live","polite");document.querySelector("#v90ReleaseBadge")?.insertAdjacentElement("beforebegin",badge)}
    const modeText=info.mode.toUpperCase();if(badge.textContent!==modeText)badge.textContent=modeText;
    badge.title=`${info.width}×${info.height} · ${info.orientation}`;badge.style.display=info.mode==="phone"?"none":"inline-flex";
    const release=document.querySelector("#v90ReleaseBadge");if(release&&release.textContent!==`v${VERSION}`)release.textContent=`v${VERSION}`;
    const brand=document.querySelector(".v90-brand small");if(brand&&brand.textContent!==`MasterKit · v${VERSION}`)brand.textContent=`MasterKit · v${VERSION}`;
  }
  function schedule(force=false){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>normalizeShell(force))}
  const previousBuildNav=window.buildNav;if(typeof previousBuildNav==="function")window.buildNav=function(){previousBuildNav();schedule(true)};
  const previousGo=window.go;if(typeof previousGo==="function")window.go=function(view){previousGo(view);schedule(true)};
  window.addEventListener("resize",()=>schedule(false),{passive:true});
  window.addEventListener("orientationchange",()=>setTimeout(()=>schedule(true),120),{passive:true});
  window.visualViewport?.addEventListener("resize",()=>schedule(false),{passive:true});
  document.addEventListener("DOMContentLoaded",()=>schedule(true),{once:true});if(document.readyState!=="loading")schedule(true);
  try{localStorage.setItem("lgmk_runtime_release",VERSION)}catch{}
  window.LGMK_FINAL_SHELL={version:VERSION,cache:CACHE,classify,normalizeShell,schedule};
})();

/* Device acceptance */
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.4.0";
  const BUILD=VERSION.replace(/\./g,"");
  const PROFILES=[
    {id:"iphone-se",label:"iPhone SE",width:375,height:667,type:"phone"},
    {id:"iphone-15",label:"iPhone 15",width:393,height:852,type:"phone"},
    {id:"iphone-max",label:"iPhone Pro Max",width:430,height:932,type:"phone"},
    {id:"android-small",label:"Android Compact",width:360,height:800,type:"phone"},
    {id:"android-modern",label:"Android Modern",width:412,height:915,type:"phone"},
    {id:"ipad-portrait",label:"iPad Portrait",width:768,height:1024,type:"tablet"},
    {id:"ipad-landscape",label:"iPad Landscape",width:1024,height:768,type:"tablet"},
    {id:"android-tablet",label:"Android Tablet",width:800,height:1280,type:"tablet"},
    {id:"windows-split",label:"Windows Split View",width:960,height:900,type:"tablet"},
    {id:"windows-compact",label:"Windows Compact",width:1280,height:800,type:"compact"},
    {id:"windows-laptop",label:"Windows Laptop",width:1366,height:768,type:"desktop"},
    {id:"windows-desktop",label:"Windows Desktop",width:1536,height:864,type:"desktop"},
    {id:"wide-desktop",label:"Wide Desktop",width:1920,height:1080,type:"desktop"}
  ];
  const metric=(label,value,detail="")=>`<article class="v91-metric"><small>${label}</small><strong>${value}</strong>${detail?`<span>${detail}</span>`:""}</article>`;
  const expectedMode=width=>width<700?"phone":width<1100?"tablet":width<1360?"compact":"desktop";
  const nextFrame=win=>new Promise(resolve=>typeof win?.requestAnimationFrame==="function"?win.requestAnimationFrame(()=>resolve()):setTimeout(resolve,16));
  function collect(doc,profile){
    const win=doc.defaultView;try{win.LGMK_FINAL_SHELL?.normalizeShell?.(true)}catch{}
    const root=doc.documentElement,body=doc.body,nav=doc.querySelector("#mainNav"),sidebar=doc.querySelector(".v90-sidebar"),mobile=doc.querySelector(".v90-mobile-nav"),layout=doc.querySelector(".v90-layout"),content=doc.querySelector(".v90-content"),shell=doc.querySelector(".app-shell"),active=doc.querySelector(".view.active");
    const width=win.innerWidth,height=win.innerHeight,mode=root.dataset.deviceMode||expectedMode(width),isMobile=mode==="phone"||mode==="tablet";
    const style=x=>x?win.getComputedStyle(x):null,pseudo=nav?win.getComputedStyle(nav,"::before").content:"none";
    const navCount=mobile?.querySelectorAll("button[data-view]").length||0;
    const inputs=[...doc.querySelectorAll("input,select,textarea")].filter(x=>{const s=style(x);return s&&s.display!=="none"&&s.visibility!=="hidden"});
    const minFont=inputs.length?Math.min(...inputs.map(x=>parseFloat(style(x).fontSize)||99)):16;
    const shellWidth=shell?.getBoundingClientRect().width||0,contentWidth=content?.getBoundingClientRect().width||0;
    const minUsable=isMobile?width-44:Math.max(640,width-(mode==="compact"?150:360));
    const bodyStyle=style(body),expected=profile?.type||expectedMode(width);
    const checks={
      appReady:root.dataset.appReady==="true",runtimeStable:root.dataset.runtimeStable==="true",
      singleMainNav:doc.querySelectorAll("#mainNav").length===1,singleSidebar:doc.querySelectorAll(".v90-sidebar").length===1,
      legacyTitleRemoved:pseudo==="none"||pseudo==="normal"||pseudo==='""',bodyOffsetRemoved:parseFloat(bodyStyle.paddingLeft)<1&&parseFloat(bodyStyle.paddingRight)<1,
      modeMatches:mode===expected,noHorizontalOverflow:root.scrollWidth<=root.clientWidth+1&&body.scrollWidth<=body.clientWidth+1,
      contentUsable:contentWidth>=minUsable&&shellWidth>0,correctNavigation:isMobile?style(mobile)?.display!=="none":style(sidebar)?.display!=="none",
      oppositeNavigationHidden:isMobile?style(sidebar)?.display==="none":style(mobile)?.display==="none",fiveMobileTabs:!isMobile||navCount===5,
      layoutPresent:Boolean(layout&&content&&shell),iosInputFont:!isMobile||minFont>=15.9,activeContentRendered:Boolean(active&&(active.textContent.trim().length>20||active.id==="deviceAcceptance")),
      viewportFit:Boolean(doc.querySelector('meta[name="viewport"]')?.content.includes("viewport-fit=cover")),releaseVisible:Boolean(doc.querySelector("#v90ReleaseBadge")?.textContent.includes(VERSION)),
      adaptiveMarker:root.dataset.shell==="final-adaptive-shell"
    };
    const failingChecks=Object.entries(checks).filter(([,value])=>!value).map(([key])=>key);
    return{version:VERSION,profile:profile?.id||"current",label:profile?.label||"دستگاه فعلی",width,height,mode,contentWidth:Math.round(contentWidth),minUsable:Math.round(minUsable),checks,failingChecks,pass:failingChecks.length===0,timestamp:new Date().toISOString()};
  }
  function waitForStable(frame,profile){
    return new Promise(resolve=>{
      let finished=false;
      const finish=async result=>{if(finished)return;finished=true;clearTimeout(timer);try{frame.contentWindow?.removeEventListener("lgmk:ready",check);frame.contentWindow?.removeEventListener("lgmk:stable",check)}catch{}resolve(result)};
      const check=async()=>{
        try{
          const win=frame.contentWindow,doc=frame.contentDocument;
          if(doc?.documentElement?.dataset?.appReady==="true"&&doc.documentElement.dataset.runtimeStable==="true"&&typeof win?.go==="function"){
            win.go("dashboard");await nextFrame(win);await nextFrame(win);return finish(collect(doc,profile));
          }
        }catch(error){return finish({...profile,version:VERSION,checks:{access:false},failingChecks:["access"],pass:false,error:error.message})}
      };
      const timer=setTimeout(()=>finish({...profile,version:VERSION,checks:{stableRuntime:false},failingChecks:["stableRuntime"],pass:false,error:"stable runtime timeout"}),15000);
      try{frame.contentWindow?.addEventListener("lgmk:ready",check);frame.contentWindow?.addEventListener("lgmk:stable",check)}catch{}
      check();
    });
  }
  function runProfile(profile){
    return new Promise(resolve=>{
      const frame=document.createElement("iframe");frame.title=`${VERSION} QA ${profile.label}`;frame.width=String(profile.width);frame.height=String(profile.height);
      frame.style.cssText=`position:fixed;left:-16000px;top:0;width:${profile.width}px;height:${profile.height}px;border:0;opacity:.01;pointer-events:none;`;
      let completed=false;const finish=result=>{if(completed)return;completed=true;frame.remove();resolve(result)};
      const timer=setTimeout(()=>finish({...profile,version:VERSION,checks:{load:false},failingChecks:["load"],pass:false,error:"timeout"}),17000);
      frame.onload=async()=>{const result=await waitForStable(frame,profile);clearTimeout(timer);finish(result)};
      frame.src=`./?v=${BUILD}&qa=${encodeURIComponent(profile.id)}&t=${Date.now()}`;document.body.appendChild(frame);
    });
  }
  function ensureState(){state.deviceAcceptance=state.deviceAcceptance||{lastMatrix:[],lastRun:null,current:null};return state.deviceAcceptance}
  function currentRows(){return (ensureState().lastMatrix||[]).filter(row=>row?.version===VERSION&&PROFILES.some(profile=>profile.id===row.profile))}
  async function runMatrix(){
    const store=ensureState();store.lastMatrix=[];store.matrixVersion=VERSION;store.lastRun=new Date().toISOString();save();render("deviceAcceptance");
    const rows=[];
    for(const profile of PROFILES){const row=await runProfile(profile);rows.push(row);store.lastMatrix=[...rows];save();render("deviceAcceptance")}
    if(typeof v82Toast==="function")v82Toast(rows.every(x=>x.pass)?`ماتریس ${VERSION} با ۱۳/۱۳ PASS تکمیل شد.`:`ماتریس تکمیل شد؛ ${rows.filter(x=>!x.pass).length} شکست ثبت شد.`,!rows.every(x=>x.pass));
    return rows;
  }
  function renderDevice(el){
    const store=ensureState();try{window.LGMK_FINAL_SHELL?.normalizeShell?.(true)}catch{}
    const current=collect(document,{id:"current",label:"دستگاه فعلی",type:document.documentElement.dataset.deviceMode||expectedMode(innerWidth)});store.current=current;
    const rows=currentRows(),map=new Map(rows.map(x=>[x.profile,x])),runtimePass=current.checks.releaseVisible&&current.checks.adaptiveMarker&&current.checks.runtimeStable&&current.checks.appReady;
    const matrixPass=rows.length===PROFILES.length&&rows.every(x=>x.pass);
    el.innerHTML=`<header class="v91-page-head"><div><span>FINAL DEVICE ACCEPTANCE</span><h2>پذیرش Windows، Tablet و Phone</h2><p>Shell، فضای محتوا، ناوبری، Runtime و نسخه ${VERSION} پس از Ready واقعی کنترل می‌شوند.</p></div><div class="v91-head-actions"><button id="finalRunMatrix">اجرای ماتریس ۱۳ دستگاه</button></div></header><section class="v91-hub-summary">${metric("حالت فعلی",current.mode.toUpperCase(),`${current.width}×${current.height}`)}${metric("عرض محتوا",`${current.contentWidth}px`,current.checks.contentUsable?`PASS · حداقل ${current.minUsable}px`:`FAIL · حداقل ${current.minUsable}px`)}${metric("Runtime",`v${VERSION}`,runtimePass?"PASS":"FAIL")}${metric("ماتریس",`${rows.length}/${PROFILES.length}`,matrixPass?"PASS":"PENDING")}</section><section class="v91-panel"><div class="v90-check-grid">${Object.entries(current.checks).map(([key,value])=>`<article class="${value?"pass":"fail"}"><b>${value?"PASS":"FAIL"}</b><span>${key}</span></article>`).join("")}</div>${current.failingChecks.length?`<p class="v91-note"><b>Check ناموفق:</b> ${current.failingChecks.join(" · ")}</p>`:""}</section><section class="v91-panel"><div class="v90-device-table"><div class="head"><b>پروفایل</b><b>اندازه / حالت</b><b>خودکار</b></div>${PROFILES.map(profile=>{const result=map.get(profile.id);return`<div><span><b>${profile.label}</b><small>${result?.mode||profile.type}${result?.failingChecks?.length?` · ${result.failingChecks.join(", ")}`:""}</small></span><code>${profile.width}×${profile.height}</code><strong class="${result?.pass?"pass":result?"fail":"pending"}">${result?.pass?"PASS":result?"FAIL":"PENDING"}</strong></div>`}).join("")}</div></section>`;
  }
  const previousRender=window.render;window.render=function(view){if(view==="deviceAcceptance")return renderDevice(document.getElementById(view));return previousRender(view)};
  document.body.addEventListener("click",event=>{if(event.target.closest("#finalRunMatrix")){event.preventDefault();runMatrix()}},true);
  window.LGMK_FINAL_DEVICE={version:VERSION,profiles:PROFILES,collect,runMatrix,currentRows};
})();

/* Version label and one-shot convergence */
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.4.0";let settled=false;
  function applyLabels(){
    const root=document.documentElement;root.dataset.release=VERSION;root.dataset.visualAcceptance="final";
    const badge=document.querySelector("#v90ReleaseBadge");if(badge&&badge.textContent!==`v${VERSION}`)badge.textContent=`v${VERSION}`;
    const brand=document.querySelector(".v90-brand small");if(brand&&brand.textContent!==`MasterKit · v${VERSION}`)brand.textContent=`MasterKit · v${VERSION}`;
    const title=document.querySelector(".topbar h1");if(title&&title.textContent!==`Legal German MasterKit v${VERSION}`)title.textContent=`Legal German MasterKit v${VERSION}`;
  }
  function converge(){
    if(settled)return;const root=document.documentElement,nav=document.querySelector("#mainNav");if(!nav)return;
    document.querySelectorAll(".v90-sidebar").forEach((node,index)=>{if(index>0)node.remove()});
    try{window.LGMK_FINAL_SHELL?.normalizeShell?.(true)}catch{}applyLabels();
    const active=document.querySelector(".view.active"),contentLength=(active?.textContent||"").trim().length;
    if(!document.querySelector(".v90-layout")||document.querySelectorAll(".v90-sidebar").length!==1||contentLength<=60)return;
    settled=true;root.dataset.runtimeStable="true";root.dataset.release=VERSION;
    document.querySelector("#startupStatus")?.remove();
    window.LGMK_RUNTIME_STABILITY={version:VERSION,stable:true,settledAt:Date.now(),sidebars:1,activeView:active?.id||null,contentLength};
    window.dispatchEvent(new CustomEvent("lgmk:stable",{detail:window.LGMK_RUNTIME_STABILITY}));
  }
  const previousBuildNav=window.buildNav;if(typeof previousBuildNav==="function")window.buildNav=function(){previousBuildNav();queueMicrotask(applyLabels)};
  const previousGo=window.go;if(typeof previousGo==="function")window.go=function(view){previousGo(view);queueMicrotask(applyLabels)};
  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(converge));setTimeout(converge,350);setTimeout(converge,1200)}
  window.addEventListener("lgmk:ready",schedule,{once:true});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
  window.LGMK_FINAL_STABILITY={version:VERSION,converge,applyLabels};
})();

/* Idle cache repair */
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.4.0",CACHE=window.LGMK_CACHE_NAME||"lgmk-v9-4-0-final-20260729a";let started=false;
  function assets(){const discovered=[...document.querySelectorAll('link[rel="stylesheet"][href],script[src],link[rel="icon"][href],link[rel="manifest"][href]')].map(node=>node.getAttribute("href")||node.getAttribute("src")).filter(Boolean);return[...new Set(["./","./index.html","./release-final.json",...discovered])]}
  async function repair(){
    if(started)return window.LGMK_CACHE_REPAIR||{supported:"pending"};started=true;if(!("caches" in window))return{supported:false,total:0,cached:0};
    const cache=await caches.open(CACHE),list=assets();let cached=0;
    for(const url of list){try{const hit=await cache.match(url);if(!hit)await cache.add(new Request(url,{cache:"reload"}));cached++}catch{}await new Promise(resolve=>setTimeout(resolve,0))}
    document.documentElement.dataset.offlineCache=CACHE;return window.LGMK_CACHE_REPAIR={version:VERSION,cache:CACHE,supported:true,total:list.length,cached};
  }
  function schedule(){const run=()=>repair().catch(()=>null);if("requestIdleCallback" in window)requestIdleCallback(run,{timeout:8000});else setTimeout(run,3500)}
  function afterReady(){if(document.documentElement.dataset.appReady==="true")schedule();else window.addEventListener("lgmk:ready",schedule,{once:true})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",afterReady,{once:true});else afterReady();
  window.LGMK_FINAL_CACHE={version:VERSION,cache:CACHE,repair};
})();

/* Acceptance evidence and physical sign-off */
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.4.0",AUTO_PARAM="acceptance";let running=false;
  const PHYSICAL=[
    {id:"windows-compact",label:"Windows Compact"},{id:"iphone-portrait",label:"iPhone عمودی"},{id:"iphone-landscape",label:"iPhone افقی"},{id:"ipad-portrait",label:"iPad عمودی"},{id:"ipad-landscape",label:"iPad افقی"}
  ];
  function ensureState(){
    state.finalAcceptance=state.finalAcceptance||{version:VERSION,lastReport:null,running:false,startedAt:null,finishedAt:null,physical:{}};
    if(state.finalAcceptance.version!==VERSION)state.finalAcceptance={version:VERSION,lastReport:null,running:false,startedAt:null,finishedAt:null,physical:{}};
    state.finalAcceptance.physical=state.finalAcceptance.physical||{};return state.finalAcceptance;
  }
  function report(){
    const automation=ensureState(),matrix=window.LGMK_FINAL_DEVICE?.currentRows?.()||[];
    const current=window.LGMK_FINAL_DEVICE?.collect?.(document,{id:"current",label:"دستگاه فعلی",type:document.documentElement.dataset.deviceMode})||null;
    const passed=matrix.filter(x=>x.pass).length,failed=matrix.filter(x=>!x.pass).length;
    const profiles=Object.fromEntries(PHYSICAL.map(item=>[item.id,Boolean(automation.physical[item.id])]));
    const confirmed=Object.values(profiles).filter(Boolean).length,physicalComplete=confirmed===PHYSICAL.length;
    return{
      schema:"lgmk-final-acceptance-report/v2",version:VERSION,generatedAt:new Date().toISOString(),
      runtime:{release:document.documentElement.dataset.release||null,appReady:document.documentElement.dataset.appReady==="true",runtimeStable:document.documentElement.dataset.runtimeStable==="true",shell:document.documentElement.dataset.shell||null,deviceMode:document.documentElement.dataset.deviceMode||null,bootState:window.__LGMK_BOOT_STATE||null,consoleErrors:window.LGMK_STARTUP_DIAGNOSTICS?.errors||[]},
      current,matrix:{total:13,executed:matrix.length,passed,failed,complete:matrix.length===13,pass:matrix.length===13&&failed===0,rows:matrix},
      physical:{required:PHYSICAL.length,confirmed,complete:physicalComplete,profiles},
      finalAccepted:matrix.length===13&&failed===0&&physicalComplete,
      automation:{startedAt:automation.startedAt,finishedAt:automation.finishedAt}
    };
  }
  function saveReport(){const automation=ensureState();automation.lastReport=report();automation.finishedAt=automation.lastReport.generatedAt;automation.running=false;save();return automation.lastReport}
  function downloadReport(){const data=saveReport(),blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download=`Legal-German-MasterKit-${VERSION}-FINAL-ACCEPTANCE.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),1000)}
  function clearResults(){
    state.deviceAcceptance=state.deviceAcceptance||{};state.deviceAcceptance.lastMatrix=[];state.deviceAcceptance.matrixVersion=VERSION;state.deviceAcceptance.lastRun=null;
    const automation=ensureState();automation.lastReport=null;automation.running=false;automation.startedAt=null;automation.finishedAt=null;automation.physical={};save();if(state.view==="deviceAcceptance")render("deviceAcceptance");
  }
  async function runAutomated(){
    if(running)return;running=true;const automation=ensureState();automation.running=true;automation.startedAt=new Date().toISOString();automation.finishedAt=null;save();
    try{
      if(typeof go==="function")go("deviceAcceptance");await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      await window.LGMK_FINAL_DEVICE.runMatrix();const result=saveReport();
      if(typeof v82Toast==="function")v82Toast(result.matrix.pass?"ماتریس ۱۳ دستگاه بدون خطا تکمیل شد.":`ماتریس تکمیل شد؛ ${result.matrix.failed} شکست ثبت شد.`,!result.matrix.pass);
      if(state.view==="deviceAcceptance")render("deviceAcceptance");return result;
    }catch(error){automation.running=false;automation.finishedAt=new Date().toISOString();automation.error=error?.message||String(error);save();if(typeof v82Toast==="function")v82Toast("اجرای خودکار پذیرش متوقف شد.",true);throw error}finally{running=false}
  }
  function panel(){
    const data=report(),automation=ensureState(),status=automation.running?"RUNNING":data.matrix.pass?"AUTOMATED PASS":data.matrix.complete?"COMPLETED WITH FAIL":"NOT COMPLETE";
    return `<section class="final-acceptance"><header><div><span>FINAL ACCEPTANCE</span><h3>ماتریس خودکار و شواهد فیزیکی</h3><p>نتایج فقط برای نسخه ${VERSION} محاسبه و در گزارش JSON ثبت می‌شوند.</p></div><strong class="${data.matrix.pass?"pass":automation.running?"running":"pending"}">${status}</strong></header><div class="final-stats"><article><small>اجراشده</small><b>${data.matrix.executed}/13</b></article><article><small>PASS خودکار</small><b>${data.matrix.passed}</b></article><article><small>FAIL خودکار</small><b>${data.matrix.failed}</b></article><article><small>شواهد فیزیکی</small><b>${data.physical.confirmed}/${data.physical.required}</b></article></div><div class="final-physical">${PHYSICAL.map(item=>`<label><input type="checkbox" data-final-physical="${item.id}" ${automation.physical[item.id]?"checked":""}> ${item.label}</label>`).join("")}</div><div class="final-actions"><button id="finalAutoRun" ${automation.running?"disabled":""}>${automation.running?"در حال اجرا…":"اجرای خودکار ۱۳ دستگاه"}</button><button id="finalExport" class="secondary">دریافت گزارش JSON</button><button id="finalClear" class="ghost">پاک‌کردن نتایج این نسخه</button></div><p class="final-result ${data.finalAccepted?"pass":"pending"}">${data.finalAccepted?"FINAL ACCEPTED — تمام Gateها بسته شدند.":"پذیرش نهایی به ۱۳/۱۳ PASS خودکار و ۵/۵ شاهد فیزیکی نیاز دارد."}</p></section>`;
  }
  function augment(){const el=document.querySelector("#deviceAcceptance");if(!el||el.querySelector(".final-acceptance"))return;el.insertAdjacentHTML("afterbegin",panel())}
  const previousRender=window.render;window.render=function(view){const result=previousRender(view);if(view==="deviceAcceptance")queueMicrotask(augment);return result};
  document.body.addEventListener("click",event=>{if(event.target.closest("#finalAutoRun")){event.preventDefault();runAutomated()}if(event.target.closest("#finalExport")){event.preventDefault();downloadReport()}if(event.target.closest("#finalClear")){event.preventDefault();clearResults()}},true);
  document.body.addEventListener("change",event=>{const input=event.target.closest("[data-final-physical]");if(!input)return;ensureState().physical[input.dataset.finalPhysical]=input.checked;save();if(state.view==="deviceAcceptance")render("deviceAcceptance")});
  function boot(){ensureState();const params=new URLSearchParams(location.search);if(params.get(AUTO_PARAM)==="auto"&&!params.has("qa")){const start=()=>setTimeout(()=>runAutomated(),250);if(document.documentElement.dataset.runtimeStable==="true")start();else window.addEventListener("lgmk:stable",start,{once:true})}if(state.view==="deviceAcceptance")queueMicrotask(augment)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  window.LGMK_FINAL_ACCEPTANCE={version:VERSION,physicalProfiles:PHYSICAL,runAutomated,report,downloadReport,clearResults};
})();

/* Canonical service worker registration */
(function(){
  if(!("serviceWorker" in navigator))return;
  const VERSION=window.LGMK_RELEASE_VERSION||"9.4.0";
  const register=async()=>{
    try{
      const registration=await navigator.serviceWorker.register(`service-worker.js?v=${VERSION.replace(/\./g,"")}`,{scope:"./",updateViaCache:"none"});
      await registration.update().catch(()=>null);if(registration.waiting)registration.waiting.postMessage("SKIP_WAITING");
      window.LGMK_SERVICE_WORKER={version:VERSION,registered:true,scope:registration.scope,installing:Boolean(registration.installing),waiting:Boolean(registration.waiting),active:Boolean(registration.active)};
    }catch(error){window.LGMK_SERVICE_WORKER={version:VERSION,registered:false,error:error?.message||String(error)}}
  };
  if(document.readyState==="complete")register();else window.addEventListener("load",register,{once:true});
})();
