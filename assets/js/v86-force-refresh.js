"use strict";
(function(){
  const RELEASE="8.9.0";
  const EXPECTED_CACHE="lgmk-v8-9-pflege-architecture-20260728a";
  const RELOAD_GUARD="lgmk_v890_controller_reload";
  function ensureBadge(){
    const current=document.getElementById("v86ReleaseBadge");
    if(current){current.textContent=`v${RELEASE}`;current.setAttribute("aria-label",`نسخه ${RELEASE}`);return}
    const topbar=document.querySelector(".topbar");if(!topbar)return;
    const badge=document.createElement("span");badge.id="v86ReleaseBadge";badge.textContent=`v${RELEASE}`;badge.setAttribute("aria-label",`نسخه ${RELEASE}`);
    badge.style.cssText="direction:ltr;unicode-bidi:isolate;flex:0 0 auto;padding:5px 8px;border-radius:999px;background:#0f766e;color:#fff;font:700 11px/1 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.04em;box-shadow:0 2px 8px rgba(15,118,110,.18)";
    const actions=topbar.querySelector('.v89-top-actions');(actions||topbar).appendChild(badge);
  }
  async function purgeOldCaches(){if(!("caches" in window))return;const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith("lgmk-")&&key!==EXPECTED_CACHE).map(key=>caches.delete(key)))}
  async function refreshWorkers(){if(!("serviceWorker" in navigator))return;const registrations=await navigator.serviceWorker.getRegistrations();await Promise.all(registrations.map(registration=>registration.update().catch(()=>null)))}
  document.documentElement.dataset.release=RELEASE;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ensureBadge,{once:true});else ensureBadge();setTimeout(ensureBadge,500);
  Promise.allSettled([purgeOldCaches(),refreshWorkers()]).finally(()=>{try{localStorage.setItem("lgmk_runtime_release",RELEASE)}catch{}});
  navigator.serviceWorker?.addEventListener("controllerchange",()=>{if(sessionStorage.getItem(RELOAD_GUARD))return;sessionStorage.setItem(RELOAD_GUARD,"1");location.reload()});
})();
