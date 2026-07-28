"use strict";
(function(){
  if(!("serviceWorker" in navigator))return;
  const register=async()=>{
    try{
      const registration=await navigator.serviceWorker.register("service-worker-v934.js?v=934",{scope:"./"});
      await registration.update().catch(()=>null);
      const registrations=await navigator.serviceWorker.getRegistrations();
      for(const item of registrations){
        const active=item.active?.scriptURL||item.waiting?.scriptURL||item.installing?.scriptURL||"";
        if(item.scope===registration.scope&&active&&!active.includes("service-worker-v934.js"))await item.unregister().catch(()=>false);
      }
      window.LGMK_SW_V934={registered:true,scope:registration.scope};
    }catch(error){window.LGMK_SW_V934={registered:false,error:error?.message||String(error)}}
  };
  if(document.readyState==="complete")register();else window.addEventListener("load",register,{once:true});
})();
