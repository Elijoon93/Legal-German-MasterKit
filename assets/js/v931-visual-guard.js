"use strict";
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.3.1";
  let scheduled=0;

  function apply(){
    const root=document.documentElement;
    if(root.dataset.release!==VERSION)root.dataset.release=VERSION;
    if(root.dataset.visualAcceptance!=="v931")root.dataset.visualAcceptance="v931";
    const badge=document.querySelector("#v90ReleaseBadge");
    if(badge&&badge.textContent!==`v${VERSION}`)badge.textContent=`v${VERSION}`;
    const brand=document.querySelector(".v90-brand small");
    if(brand&&brand.textContent!==`MasterKit · v${VERSION}`)brand.textContent=`MasterKit · v${VERSION}`;
    const title=document.querySelector(".topbar h1");
    if(title&&title.textContent!==`Legal German MasterKit v${VERSION}`)title.textContent=`Legal German MasterKit v${VERSION}`;
  }
  function schedule(){
    clearTimeout(scheduled);
    scheduled=setTimeout(apply,0);
  }
  const previousBuildNav=window.buildNav;
  if(typeof previousBuildNav==="function")window.buildNav=function(){previousBuildNav();schedule()};
  const previousGo=window.go;
  if(typeof previousGo==="function")window.go=function(view){previousGo(view);schedule()};
  const start=()=>{
    apply();
    setTimeout(apply,250);
    setTimeout(apply,1200);
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
  window.LGMK_V931={version:VERSION,apply,schedule};
})();
