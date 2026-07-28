"use strict";
(function(){
  if(!("serviceWorker" in navigator))return;
  const register=async()=>{
    try{
      const registration=await navigator.serviceWorker.register("service-worker-v934b.js?v=9341",{scope:"./",updateViaCache:"none"});
      await registration.update().catch(()=>null);
      if(registration.waiting)registration.waiting.postMessage("SKIP_WAITING");
      window.LGMK_SW_V934={registered:true,scope:registration.scope,installing:Boolean(registration.installing),waiting:Boolean(registration.waiting),active:Boolean(registration.active)};
    }catch(error){window.LGMK_SW_V934={registered:false,error:error?.message||String(error)}}
  };
  if(document.readyState==="complete")register();else window.addEventListener("load",register,{once:true});
})();
