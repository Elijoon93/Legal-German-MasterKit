"use strict";
(function(){
  const root=document.documentElement;
  const body=document.body;
  const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  const isStandalone=window.matchMedia?.("(display-mode: standalone)").matches||navigator.standalone===true;
  root.classList.toggle("v86-ios",isIOS);
  body.classList.toggle("v86-standalone",isStandalone);
  let baseHeight=Math.max(window.innerHeight,document.documentElement.clientHeight||0);
  function resetBaseHeight(){baseHeight=Math.max(window.innerHeight,document.documentElement.clientHeight||0)}
  function updateViewport(){
    const vv=window.visualViewport;
    const height=Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight);
    root.style.setProperty("--v86-vh",`${height}px`);
    if(!vv||window.innerWidth>1024){body.classList.remove("v86-keyboard");return}
    baseHeight=Math.max(baseHeight,window.innerHeight,height);
    const focused=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||"");
    const keyboardOpen=focused&&height<baseHeight*.78;
    body.classList.toggle("v86-keyboard",keyboardOpen);
  }
  updateViewport();
  window.addEventListener("resize",updateViewport,{passive:true});
  window.addEventListener("orientationchange",()=>setTimeout(()=>{resetBaseHeight();updateViewport()},180),{passive:true});
  window.visualViewport?.addEventListener("resize",updateViewport,{passive:true});
  window.visualViewport?.addEventListener("scroll",updateViewport,{passive:true});
  document.addEventListener("focusin",()=>setTimeout(updateViewport,80));
  document.addEventListener("focusout",()=>setTimeout(()=>{resetBaseHeight();updateViewport()},180));
  document.addEventListener("click",event=>{
    const navTarget=event.target.closest("#mainNav [data-view]");
    if(navTarget){
      document.querySelector("#v84More")?.classList.remove("open");
      body.classList.remove("v84-lock");
      setTimeout(()=>window.scrollTo({top:0,left:0,behavior:"auto"}),0);
    }
    if(body.classList.contains("v84-lock")&&!event.target.closest("#v84More")&&!event.target.closest("[data-v84-more]")){
      document.querySelector("#v84More")?.classList.remove("open");
      body.classList.remove("v84-lock");
    }
  },true);
  window.addEventListener("pageshow",()=>{resetBaseHeight();updateViewport()},{passive:true});
})();
