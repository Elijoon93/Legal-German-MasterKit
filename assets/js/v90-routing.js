"use strict";
(function(){
  if(document.documentElement.dataset.v90Routing==="1")return;
  document.documentElement.dataset.v90Routing="1";
  document.body.addEventListener("click",event=>{
    const route=event.target.closest("[data-view]");
    if(!route||route.closest("#mainNav"))return;
    const view=route.dataset.view;
    if(!view||typeof go!=="function")return;
    event.preventDefault();
    go(view);
  },true);
})();
