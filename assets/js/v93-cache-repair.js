"use strict";
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.3.0";
  const CACHE=window.LGMK_CACHE_NAME||"lgmk-v9-3-dual-reference-learning-os-20260728a";
  function assets(){
    const discovered=[...document.querySelectorAll('link[rel="stylesheet"][href],script[src],link[rel="icon"][href],link[rel="manifest"][href]')].map(node=>node.getAttribute("href")||node.getAttribute("src")).filter(Boolean);
    return [...new Set(['./','./index.html',`./release-v${VERSION.slice(0,3)}.json`,...discovered])];
  }
  async function repair(){
    if(!("caches" in window))return{supported:false,total:0,cached:0};
    const cache=await caches.open(CACHE),list=assets();let cached=0;
    for(const url of list){
      try{const hit=await cache.match(url);if(!hit)await cache.add(new Request(url,{cache:"reload"}));cached++}catch{}
    }
    document.documentElement.dataset.offlineCache=CACHE;
    return{supported:true,total:list.length,cached};
  }
  const run=()=>setTimeout(()=>repair().then(result=>{window.LGMK_CACHE_REPAIR={version:VERSION,cache:CACHE,...result}}),50);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();
