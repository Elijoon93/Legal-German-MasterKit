"use strict";
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.3.3";
  let settled=false;

  function converge(){
    if(settled)return;
    const root=document.documentElement;
    const nav=document.querySelector("#mainNav");
    if(!nav)return;

    const sidebars=[...document.querySelectorAll(".v90-sidebar")];
    sidebars.slice(1).forEach(node=>node.remove());
    try{window.LGMK_V92?.normalizeShell?.(true)}catch{}
    try{window.LGMK_V931?.apply?.()}catch{}

    const active=document.querySelector(".view.active");
    const contentLength=(active?.textContent||"").trim().length;
    const ready=Boolean(document.querySelector(".v90-layout")&&sidebars.length>=1&&contentLength>60);
    if(!ready)return;

    settled=true;
    root.dataset.runtimeStable="true";
    root.dataset.release=VERSION;
    const badge=document.querySelector("#v90ReleaseBadge");
    if(badge&&badge.textContent!==`v${VERSION}`)badge.textContent=`v${VERSION}`;
    const startup=document.querySelector("#startupStatus");
    if(startup)startup.remove();
    window.LGMK_RUNTIME_STABILITY={
      version:VERSION,
      stable:true,
      settledAt:Date.now(),
      sidebars:document.querySelectorAll(".v90-sidebar").length,
      activeView:active?.id||null,
      contentLength
    };
  }
  function schedule(){
    requestAnimationFrame(()=>requestAnimationFrame(converge));
    setTimeout(converge,350);
    setTimeout(converge,1200);
  }
  window.addEventListener("lgmk:ready",schedule,{once:true});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
  window.LGMK_V933={version:VERSION,converge};
})();
