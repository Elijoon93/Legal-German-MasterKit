"use strict";
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.3.4";
  function lock(){
    state.deviceAcceptance=state.deviceAcceptance||{};
    if(state.deviceAcceptance.physicalVersion!==VERSION){
      state.deviceAcceptance.manual={};
      state.deviceAcceptance.physicalVersion=VERSION;
      save();
    }
  }
  document.body.addEventListener("click",event=>{
    if(!event.target.closest("#v934Clear"))return;
    state.deviceAcceptance=state.deviceAcceptance||{};
    state.deviceAcceptance.manual={};
    state.deviceAcceptance.physicalVersion=VERSION;
    save();
  },true);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",lock,{once:true});else lock();
  window.LGMK_V934_PHYSICAL={version:VERSION,lock};
})();
