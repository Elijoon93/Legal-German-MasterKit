"use strict";
(function(){
  if(!("serviceWorker" in navigator))return;
  const register=()=>navigator.serviceWorker.register("service-worker.js?v=934").then(reg=>reg.update().catch(()=>null)).catch(()=>null);
  if(document.readyState==="complete")register();else window.addEventListener("load",register,{once:true});
})();
