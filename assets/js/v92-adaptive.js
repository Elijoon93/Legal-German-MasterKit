"use strict";
(function(){
  const VERSION="9.2.0";
  const CACHE="lgmk-v9-2-adaptive-shell-20260728a";
  let raf=0;
  function classify(){
    const vv=window.visualViewport;
    const width=Math.round(vv?.width||window.innerWidth||document.documentElement.clientWidth);
    const height=Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight);
    const coarse=window.matchMedia?.("(pointer: coarse)")?.matches||false;
    let mode="desktop";
    if(width<700)mode="phone";
    else if(width<1100||(coarse&&width<1280))mode="tablet";
    else if(width<1360)mode="compact";
    const orientation=width>=height?"landscape":"portrait";
    const keyboard=(window.innerHeight-height)>150;
    const root=document.documentElement;
    root.dataset.deviceMode=mode;
    root.dataset.orientation=orientation;
    root.dataset.keyboard=keyboard?"open":"closed";
    root.dataset.release=VERSION;
    root.dataset.shell="adaptive-v92";
    root.style.setProperty("--v92-vw",`${width}px`);
    root.style.setProperty("--v92-vh",`${height}px`);
    root.style.setProperty("--v92-sidebar",width>=1600?"280px":"264px");
    return{width,height,mode,orientation,coarse,keyboard};
  }
  function normalizeShell(){
    const nav=document.querySelector("#mainNav");
    if(!nav)return;
    document.querySelectorAll(".v90-sidebar").forEach((node,index)=>{if(index>0)node.remove()});
    nav.querySelectorAll(".v90-nav-groups button").forEach(button=>{
      const label=button.querySelector("b")?.textContent?.trim();
      if(label&&!button.title)button.title=label;
      button.removeAttribute("style");
    });
    const topbar=document.querySelector(".topbar");
    topbar?.style.setProperty("height","auto","important");
    topbar?.style.setProperty("right","auto","important");
    topbar?.style.setProperty("left","auto","important");
    let badge=document.querySelector("#v92ModeBadge");
    if(!badge){
      badge=document.createElement("span");
      badge.id="v92ModeBadge";
      badge.setAttribute("aria-live","polite");
      document.querySelector("#v90ReleaseBadge")?.insertAdjacentElement("beforebegin",badge);
    }
    const info=classify();
    badge.textContent=info.mode.toUpperCase();
    badge.title=`${info.width}×${info.height} · ${info.orientation}`;
    badge.style.display=info.mode==="phone"?"none":"inline-flex";
    const release=document.querySelector("#v90ReleaseBadge");
    if(release)release.textContent=`v${VERSION}`;
    const brand=document.querySelector(".v90-brand small");
    if(brand)brand.textContent=`MasterKit · v${VERSION}`;
  }
  function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(normalizeShell)}
  const previousBuildNav=window.buildNav;
  if(typeof previousBuildNav==="function")window.buildNav=function(){previousBuildNav();normalizeShell()};
  const previousGo=window.go;
  if(typeof previousGo==="function")window.go=function(view){previousGo(view);schedule()};
  window.addEventListener("resize",schedule,{passive:true});
  window.addEventListener("orientationchange",()=>setTimeout(schedule,120),{passive:true});
  window.visualViewport?.addEventListener("resize",schedule,{passive:true});
  window.visualViewport?.addEventListener("scroll",schedule,{passive:true});
  document.addEventListener("DOMContentLoaded",schedule,{once:true});
  if(document.readyState!=="loading")schedule();
  if("ResizeObserver" in window)new ResizeObserver(schedule).observe(document.documentElement);
  async function refresh(){
    try{localStorage.setItem("lgmk_runtime_release",VERSION)}catch{}
    if("caches" in window){try{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("lgmk-")&&k!==CACHE).map(k=>caches.delete(k)))}catch{}}
    if("serviceWorker" in navigator){try{const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.update().catch(()=>null)))}catch{}}
  }
  refresh();
  window.LGMK_V92={version:VERSION,cache:CACHE,classify,normalizeShell};
})();
