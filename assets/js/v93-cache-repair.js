"use strict";
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.3.0";
  const CACHE=window.LGMK_CACHE_NAME||"lgmk-v9-3-dual-reference-learning-os-20260728a";
  let started=false;

  function assets(){
    const discovered=[...document.querySelectorAll('link[rel="stylesheet"][href],script[src],link[rel="icon"][href],link[rel="manifest"][href]')]
      .map(node=>node.getAttribute("href")||node.getAttribute("src"))
      .filter(Boolean);
    const releaseFiles=[`./release-v${VERSION}.json`,`./release-v${VERSION.split('.').slice(0,2).join('.')}.json`];
    return [...new Set(['./','./index.html',...releaseFiles,...discovered])];
  }
  async function repair(){
    if(started)return window.LGMK_CACHE_REPAIR||{supported:"pending"};
    started=true;
    if(!("caches" in window))return{supported:false,total:0,cached:0};
    const cache=await caches.open(CACHE),list=assets();
    let cached=0;
    for(const url of list){
      try{
        const hit=await cache.match(url);
        if(!hit)await cache.add(new Request(url,{cache:"reload"}));
        cached++;
      }catch{}
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    document.documentElement.dataset.offlineCache=CACHE;
    const result={version:VERSION,cache:CACHE,supported:true,total:list.length,cached};
    window.LGMK_CACHE_REPAIR=result;
    return result;
  }
  function schedule(){
    const run=()=>repair().catch(()=>null);
    if("requestIdleCallback" in window)requestIdleCallback(run,{timeout:8000});
    else setTimeout(run,3500);
  }
  function afterReady(){
    if(document.documentElement.dataset.appReady==="true")schedule();
    else window.addEventListener("lgmk:ready",schedule,{once:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",afterReady,{once:true});else afterReady();
  window.LGMK_CACHE_REPAIR_API={version:VERSION,cache:CACHE,repair};
})();
