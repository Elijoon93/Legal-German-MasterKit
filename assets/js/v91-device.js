"use strict";
(function(){
  const VERSION="9.1.0";
  const PROFILES=[
    {id:"iphone-se",label:"iPhone SE",width:375,height:667,platform:"iOS"},
    {id:"iphone-14",label:"iPhone 14 / 15",width:390,height:844,platform:"iOS"},
    {id:"iphone-max",label:"iPhone Pro Max",width:430,height:932,platform:"iOS"},
    {id:"android",label:"Android Phone",width:360,height:800,platform:"Android"},
    {id:"ipad-mini",label:"iPad Mini Portrait",width:768,height:1024,platform:"iPadOS"},
    {id:"ipad-landscape",label:"iPad Landscape",width:1024,height:768,platform:"iPadOS"},
    {id:"android-tablet",label:"Android Tablet",width:800,height:1280,platform:"Android"},
    {id:"desktop",label:"Desktop",width:1366,height:768,platform:"Desktop"},
    {id:"wide",label:"Wide Desktop",width:1920,height:1080,platform:"Desktop"}
  ];
  const metric=(label,value,detail="")=>`<article class="v91-metric"><small>${label}</small><strong>${value}</strong>${detail?`<span>${detail}</span>`:""}</article>`;
  const head=(title,desc)=>`<header class="v91-page-head"><div><span>DEVICE ACCEPTANCE</span><h2>${title}</h2><p>${desc}</p></div><div class="v91-head-actions"><button id="v91RunDeviceMatrix">اجرای ماتریس ۹ دستگاه</button></div></header>`;
  function collect(doc,profile){
    const win=doc.defaultView,root=doc.documentElement,body=doc.body,top=doc.querySelector(".topbar"),sidebar=doc.querySelector(".v90-sidebar"),mobile=doc.querySelector(".v90-mobile-nav"),shell=doc.querySelector(".app-shell"),active=doc.querySelector(".view.active");
    const width=win.innerWidth,isMobile=width<=1024,navCount=mobile?.querySelectorAll("button[data-view]").length||0;
    const inputs=[...doc.querySelectorAll("input,select,textarea")].filter(x=>{const s=win.getComputedStyle(x);return s.display!=="none"&&s.visibility!=="hidden"});
    const minFont=inputs.length?Math.min(...inputs.map(x=>parseFloat(win.getComputedStyle(x).fontSize)||99)):16;
    const checks={
      noHorizontalOverflow:root.scrollWidth<=root.clientWidth+1&&body.scrollWidth<=body.clientWidth+1,
      shellWithinViewport:!shell||shell.getBoundingClientRect().right<=width+1,
      fiveMobileTabs:!isMobile||navCount===5,
      correctNavigation:isMobile?win.getComputedStyle(mobile).display!=="none":win.getComputedStyle(sidebar).display!=="none",
      oppositeNavigationHidden:isMobile?win.getComputedStyle(sidebar).display==="none":win.getComputedStyle(mobile).display==="none",
      nonStickyHeader:!top||win.getComputedStyle(top).position!=="sticky",
      iosInputFont:!isMobile||minFont>=15.9,
      contentRendered:Boolean(active&&active.textContent.trim().length>20),
      viewportFit:Boolean(doc.querySelector('meta[name="viewport"]')?.content.includes("viewport-fit=cover")),
      releaseVisible:Boolean(doc.querySelector("#v90ReleaseBadge")?.textContent.includes(VERSION)),
      v91ArchitectureVisible:Boolean(doc.querySelector(".v91-page-head,.v91-welcome,.v91-list-item"))
    };
    return{profile:profile?.id||"current",label:profile?.label||"دستگاه فعلی",platform:profile?.platform||navigator.platform||"Browser",width,height:win.innerHeight,checks,pass:Object.values(checks).every(Boolean),timestamp:new Date().toISOString()};
  }
  function profileRun(profile){
    return new Promise(resolve=>{
      const frame=document.createElement("iframe");
      frame.title=`v9.1 QA ${profile.label}`;frame.width=String(profile.width);frame.height=String(profile.height);
      frame.style.cssText=`position:fixed;left:-12000px;top:0;width:${profile.width}px;height:${profile.height}px;border:0;opacity:.01;pointer-events:none;`;
      const timer=setTimeout(()=>{frame.remove();resolve({...profile,checks:{load:false},pass:false,error:"timeout"})},9000);
      frame.onload=()=>setTimeout(()=>{try{const doc=frame.contentDocument;frame.contentWindow?.go?.("dashboard");const result=collect(doc,profile);clearTimeout(timer);frame.remove();resolve(result)}catch(error){clearTimeout(timer);frame.remove();resolve({...profile,checks:{access:false},pass:false,error:error.message})}},750);
      frame.src=`./?v=910&qa91=${encodeURIComponent(profile.id)}&t=${Date.now()}`;document.body.appendChild(frame);
    });
  }
  async function runMatrix(){
    state.deviceAcceptance=state.deviceAcceptance||{manual:{},lastMatrix:[],lastRun:null,current:null};state.deviceAcceptance.manual=state.deviceAcceptance.manual||{};state.deviceAcceptance.lastMatrix=[];state.deviceAcceptance.lastRun=new Date().toISOString();save();render("deviceAcceptance");
    const rows=[];for(const profile of PROFILES){const row=await profileRun(profile);rows.push(row);state.deviceAcceptance.lastMatrix=[...rows];save();render("deviceAcceptance")}
    if(typeof v82Toast==="function")v82Toast(rows.every(x=>x.pass)?"ماتریس v9.1 PASS شد.":"حداقل یک پروفایل v9.1 شکست خورد.",!rows.every(x=>x.pass));return rows;
  }
  function renderDevice(el){
    state.deviceAcceptance=state.deviceAcceptance||{manual:{},lastMatrix:[],lastRun:null,current:null};state.deviceAcceptance.manual=state.deviceAcceptance.manual||{};
    const current=collect(document,{id:"current",label:"دستگاه فعلی",platform:navigator.platform||"Browser"});state.deviceAcceptance.current=current;save();
    const rows=state.deviceAcceptance.lastMatrix||[],map=new Map(rows.map(x=>[x.profile,x]));
    el.innerHTML=`${head("پذیرش واقعی v9.1","معماری، نشان نسخه، ناوبری، سرریز، فرم‌های iOS و محتوای فعال روی پروفایل‌های هدف کنترل می‌شوند.")}<section class="v91-hub-summary">${metric("Viewport",`${current.width}×${current.height}`,current.pass?"PASS":"FAIL")}${metric("Runtime",`v${VERSION}`,document.documentElement.dataset.release===VERSION?"PASS":"FAIL")}${metric("PWA",navigator.serviceWorker?.controller?"فعال":"کنترل شود")}${metric("ماتریس",`${rows.length}/${PROFILES.length}`,rows.length===PROFILES.length&&rows.every(x=>x.pass)?"PASS":"PENDING")}</section><section class="v91-panel"><div class="v90-check-grid">${Object.entries(current.checks).map(([key,value])=>`<article class="${value?"pass":"fail"}"><b>${value?"PASS":"FAIL"}</b><span>${key}</span></article>`).join("")}</div></section><section class="v91-panel"><div class="v90-device-table"><div class="head"><b>پروفایل</b><b>اندازه</b><b>خودکار</b><b>مشاهده واقعی</b></div>${PROFILES.map(profile=>{const result=map.get(profile.id),manual=Boolean(state.deviceAcceptance.manual[profile.id]);return`<div><span><b>${profile.label}</b><small>${profile.platform}</small></span><code>${profile.width}×${profile.height}</code><strong class="${result?.pass?"pass":result?"fail":"pending"}">${result?.pass?"PASS":result?"FAIL":"PENDING"}</strong><label><input type="checkbox" data-v91-physical="${profile.id}" ${manual?"checked":""}> تأیید واقعی</label></div>`}).join("")}</div></section><section class="v91-panel"><h3>Gate نهایی</h3><p class="v91-note">نتیجه خودکار کافی نیست. iPhone و iPad واقعی باید با نشان v9.1.0، بدون هم‌پوشانی Header و Bottom Navigation و بدون Zoom ناخواسته فرم‌ها تأیید شوند.</p></section>`;
  }
  const previousRender=render;
  render=function(view){if(view==="deviceAcceptance")return renderDevice(document.getElementById(view));return previousRender(view)};
  document.body.addEventListener("click",event=>{if(event.target.closest("#v91RunDeviceMatrix")){event.preventDefault();runMatrix()}},true);
  document.body.addEventListener("change",event=>{const input=event.target.closest("[data-v91-physical]");if(!input)return;state.deviceAcceptance.manual[input.dataset.v91Physical]=input.checked;save();render("deviceAcceptance")});
  window.LGMK_V91_DEVICE={version:VERSION,profiles:PROFILES,collect,runMatrix};
})();
