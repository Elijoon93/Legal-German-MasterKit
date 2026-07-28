"use strict";
(function(){
  const VERSION="9.3.1";
  const apply=()=>{
    const root=document.documentElement;
    root.dataset.release=VERSION;
    root.dataset.visualAcceptance="v931";
    const badge=document.querySelector("#v90ReleaseBadge");
    if(badge&&badge.textContent!==`v${VERSION}`)badge.textContent=`v${VERSION}`;
    const brand=document.querySelector(".v90-brand small");
    if(brand)brand.textContent=`MasterKit · v${VERSION}`;
    const title=document.querySelector(".topbar h1");
    if(title)title.textContent=`Legal German MasterKit v${VERSION}`;
  };
  const previousBuildNav=window.buildNav;
  if(typeof previousBuildNav==="function")window.buildNav=function(){previousBuildNav();apply()};
  const previousGo=window.go;
  if(typeof previousGo==="function")window.go=function(view){previousGo(view);apply()};
  const observer=new MutationObserver(()=>apply());
  const start=()=>{apply();const target=document.querySelector("#mainNav")||document.body;observer.observe(target,{subtree:true,childList:true,characterData:true})};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
  window.LGMK_V931={version:VERSION,apply};
})();
