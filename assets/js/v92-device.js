"use strict";
(function(){
  const VERSION="9.2.0";
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
  function collect(doc,profile){
    const win=doc.defaultView,root=doc.documentElement,body=doc.body,nav=doc.querySelector("#mainNav"),sidebar=doc.querySelector(".v90-sidebar"),mobile=doc.querySelector(".v90-mobile-nav"),layout=doc.querySelector(".v90-layout"),content=doc.querySelector(".v90-content"),shell=doc.querySelector(".app-shell"),active=doc.querySelector(".view.active");
    const width=win.innerWidth,height=win.innerHeight,mode=root.dataset.deviceMode||expectedMode(width),isMobile=mode==="phone"||mode==="tablet";
    const style=x=>x?win.getComputedStyle(x):null;
    const pseudo=nav?win.getComputedStyle(nav,"::before").content:"none";
    const navCount=mobile?.querySelectorAll("button[data-view]").length||0;
    const inputs=[...doc.querySelectorAll("input,select,textarea")].filter(x=>{const s=style(x);return s&&s.display!=="none"&&s.visibility!=="hidden"});
    const minFont=inputs.length?Math.min(...inputs.map(x=>parseFloat(style(x).fontSize)||99)):16;
    const shellWidth=shell?.getBoundingClientRect().width||0;
    const contentWidth=content?.getBoundingClientRect().width||0;
    const minUsable=isMobile?width-44:Math.max(640,width-(mode==="compact"?150:360));
    const bodyStyle=style(body);
    const checks={
      singleMainNav:doc.querySelectorAll("#mainNav").length===1,
      singleSidebar:doc.querySelectorAll(".v90-sidebar").length===1,
      legacyTitleRemoved:pseudo==="none"||pseudo==="normal"||pseudo==='""',
      bodyOffsetRemoved:parseFloat(bodyStyle.paddingLeft)<1&&parseFloat(bodyStyle.paddingRight)<1,
      modeMatches:mode===(profile?.type||expectedMode(width)),
      noHorizontalOverflow:root.scrollWidth<=root.clientWidth+1&&body.scrollWidth<=body.clientWidth+1,
      contentUsable:contentWidth>=minUsable&&shellWidth>0,
      correctNavigation:isMobile?style(mobile)?.display!=="none":style(sidebar)?.display!=="none",
      oppositeNavigationHidden:isMobile?style(sidebar)?.display==="none":style(mobile)?.display==="none",
      fiveMobileTabs:!isMobile||navCount===5,
      layoutPresent:Boolean(layout&&content&&shell),
      iosInputFont:!isMobile||minFont>=15.9,
      contentRendered:Boolean(active&&active.textContent.trim().length>20),
      viewportFit:Boolean(doc.querySelector('meta[name="viewport"]')?.content.includes("viewport-fit=cover")),
      releaseVisible:Boolean(doc.querySelector("#v90ReleaseBadge")?.textContent.includes(VERSION)),
      adaptiveMarker:root.dataset.shell==="adaptive-v92"
    };
    return{profile:profile?.id||"current",label:profile?.label||"دستگاه فعلی",width,height,mode,contentWidth:Math.round(contentWidth),checks,pass:Object.values(checks).every(Boolean),timestamp:new Date().toISOString()};
  }
  function runProfile(profile){
    return new Promise(resolve=>{
      const frame=document.createElement("iframe");frame.title=`v9.2 QA ${profile.label}`;frame.width=String(profile.width);frame.height=String(profile.height);frame.style.cssText=`position:fixed;left:-16000px;top:0;width:${profile.width}px;height:${profile.height}px;border:0;opacity:.01;pointer-events:none;`;
      const timer=setTimeout(()=>{frame.remove();resolve({...profile,checks:{load:false},pass:false,error:"timeout"})},10000);
      frame.onload=()=>setTimeout(()=>{try{frame.contentWindow?.go?.("dashboard");const result=collect(frame.contentDocument,profile);clearTimeout(timer);frame.remove();resolve(result)}catch(error){clearTimeout(timer);frame.remove();resolve({...profile,checks:{access:false},pass:false,error:error.message})}},900);
      frame.src=`./?v=920&qa92=${encodeURIComponent(profile.id)}&t=${Date.now()}`;document.body.appendChild(frame);
    });
  }
  async function runMatrix(){
    state.deviceAcceptance=state.deviceAcceptance||{manual:{},lastMatrix:[],lastRun:null,current:null};state.deviceAcceptance.manual=state.deviceAcceptance.manual||{};state.deviceAcceptance.lastMatrix=[];state.deviceAcceptance.lastRun=new Date().toISOString();save();render("deviceAcceptance");
    const rows=[];for(const profile of PROFILES){const row=await runProfile(profile);rows.push(row);state.deviceAcceptance.lastMatrix=[...rows];save();render("deviceAcceptance")}
    if(typeof v82Toast==="function")v82Toast(rows.every(x=>x.pass)?"ماتریس تطبیقی v9.2 PASS شد.":"حداقل یک پروفایل تطبیقی شکست خورد.",!rows.every(x=>x.pass));
  }
  function renderDevice(el){
    state.deviceAcceptance=state.deviceAcceptance||{manual:{},lastMatrix:[],lastRun:null,current:null};state.deviceAcceptance.manual=state.deviceAcceptance.manual||{};
    const current=collect(document,{id:"current",label:"دستگاه فعلی",type:document.documentElement.dataset.deviceMode});state.deviceAcceptance.current=current;save();
    const rows=state.deviceAcceptance.lastMatrix||[],map=new Map(rows.map(x=>[x.profile,x]));
    el.innerHTML=`<header class="v91-page-head"><div><span>ADAPTIVE DEVICE ACCEPTANCE</span><h2>پذیرش Windows، Tablet و Phone</h2><p>وجود فقط یک Shell، حذف کامل Offset نسخه 8.2، فضای قابل استفاده محتوا، حالت ناوبری و نشان v9.2 کنترل می‌شوند.</p></div><div class="v91-head-actions"><button id="v92RunMatrix">اجرای ماتریس ۱۳ دستگاه</button></div></header><section class="v91-hub-summary">${metric("حالت فعلی",current.mode.toUpperCase(),`${current.width}×${current.height}`)}${metric("عرض محتوا",`${current.contentWidth}px`,current.pass?"PASS":"FAIL")}${metric("Runtime",`v${VERSION}`,document.documentElement.dataset.shell==="adaptive-v92"?"Adaptive":"FAIL")}${metric("ماتریس",`${rows.length}/${PROFILES.length}`,rows.length===PROFILES.length&&rows.every(x=>x.pass)?"PASS":"PENDING")}</section><section class="v91-panel"><div class="v90-check-grid">${Object.entries(current.checks).map(([key,value])=>`<article class="${value?"pass":"fail"}"><b>${value?"PASS":"FAIL"}</b><span>${key}</span></article>`).join("")}</div></section><section class="v91-panel"><div class="v90-device-table"><div class="head"><b>پروفایل</b><b>اندازه / حالت</b><b>خودکار</b><b>تأیید واقعی</b></div>${PROFILES.map(profile=>{const result=map.get(profile.id),manual=Boolean(state.deviceAcceptance.manual[profile.id]);return`<div><span><b>${profile.label}</b><small>${result?.mode||profile.type}</small></span><code>${profile.width}×${profile.height}</code><strong class="${result?.pass?"pass":result?"fail":"pending"}">${result?.pass?"PASS":result?"FAIL":"PENDING"}</strong><label><input type="checkbox" data-v92-physical="${profile.id}" ${manual?"checked":""}> مشاهده واقعی</label></div>`}).join("")}</div></section>`;
  }
  const previousRender=window.render;
  window.render=function(view){if(view==="deviceAcceptance")return renderDevice(document.getElementById(view));return previousRender(view)};
  document.body.addEventListener("click",event=>{if(event.target.closest("#v92RunMatrix")){event.preventDefault();runMatrix()}},true);
  document.body.addEventListener("change",event=>{const input=event.target.closest("[data-v92-physical]");if(!input)return;state.deviceAcceptance.manual[input.dataset.v92Physical]=input.checked;save();render("deviceAcceptance")});
  window.LGMK_V92_DEVICE={version:VERSION,profiles:PROFILES,collect,runMatrix};
})();
