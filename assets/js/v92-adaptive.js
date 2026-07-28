"use strict";
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.2.0";
  const CACHE=window.LGMK_CACHE_NAME||"lgmk-v9-2-adaptive-shell-20260728a";
  let raf=0;
  let lastSignature="";

  function setData(root,key,value){
    if(root.dataset[key]!==String(value))root.dataset[key]=String(value);
  }
  function setVar(root,name,value){
    if(root.style.getPropertyValue(name)!==value)root.style.setProperty(name,value);
  }
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
    setData(root,"deviceMode",mode);
    setData(root,"orientation",orientation);
    setData(root,"keyboard",keyboard?"open":"closed");
    setData(root,"release",VERSION);
    setData(root,"shell","adaptive-v92");
    setVar(root,"--v92-vw",`${width}px`);
    setVar(root,"--v92-vh",`${height}px`);
    setVar(root,"--v92-sidebar",width>=1600?"280px":"264px");
    return{width,height,mode,orientation,coarse,keyboard};
  }
  function normalizeShell(force=false){
    const nav=document.querySelector("#mainNav");
    if(!nav)return;
    const info=classify();
    const signature=[info.width,info.height,info.mode,info.orientation,info.keyboard,VERSION].join("|");
    if(!force&&signature===lastSignature)return;
    lastSignature=signature;

    const sidebars=document.querySelectorAll(".v90-sidebar");
    sidebars.forEach((node,index)=>{if(index>0)node.remove()});
    nav.querySelectorAll(".v90-nav-groups button").forEach(button=>{
      const label=button.querySelector("b")?.textContent?.trim();
      if(label&&button.title!==label)button.title=label;
      if(button.hasAttribute("style"))button.removeAttribute("style");
    });
    const topbar=document.querySelector(".topbar");
    if(topbar){
      topbar.style.setProperty("height","auto","important");
      topbar.style.setProperty("right","auto","important");
      topbar.style.setProperty("left","auto","important");
    }
    let badge=document.querySelector("#v92ModeBadge");
    if(!badge){
      badge=document.createElement("span");
      badge.id="v92ModeBadge";
      badge.setAttribute("aria-live","polite");
      document.querySelector("#v90ReleaseBadge")?.insertAdjacentElement("beforebegin",badge);
    }
    const modeText=info.mode.toUpperCase();
    if(badge.textContent!==modeText)badge.textContent=modeText;
    const title=`${info.width}×${info.height} · ${info.orientation}`;
    if(badge.title!==title)badge.title=title;
    const display=info.mode==="phone"?"none":"inline-flex";
    if(badge.style.display!==display)badge.style.display=display;
    const release=document.querySelector("#v90ReleaseBadge");
    if(release&&release.textContent!==`v${VERSION}`)release.textContent=`v${VERSION}`;
    const brand=document.querySelector(".v90-brand small");
    if(brand&&brand.textContent!==`MasterKit · v${VERSION}`)brand.textContent=`MasterKit · v${VERSION}`;
  }
  function schedule(force=false){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>normalizeShell(force));
  }
  const previousBuildNav=window.buildNav;
  if(typeof previousBuildNav==="function")window.buildNav=function(){previousBuildNav();schedule(true)};
  const previousGo=window.go;
  if(typeof previousGo==="function")window.go=function(view){previousGo(view);schedule(true)};
  window.addEventListener("resize",()=>schedule(false),{passive:true});
  window.addEventListener("orientationchange",()=>setTimeout(()=>schedule(true),120),{passive:true});
  window.visualViewport?.addEventListener("resize",()=>schedule(false),{passive:true});
  document.addEventListener("DOMContentLoaded",()=>schedule(true),{once:true});
  if(document.readyState!=="loading")schedule(true);

  async function refresh(){
    try{localStorage.setItem("lgmk_runtime_release",VERSION)}catch{}
    if("caches" in window){try{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("lgmk-")&&k!==CACHE).map(k=>caches.delete(k)))}catch{}}
    if("serviceWorker" in navigator){try{const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.update().catch(()=>null)))}catch{}}
  }
  refresh();
  window.LGMK_V92={version:VERSION,cache:CACHE,classify,normalizeShell,schedule};
})();
