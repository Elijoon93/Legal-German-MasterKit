"use strict";
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.3.2";
  const errors=[];
  const startedAt=Date.now();
  let recoveryAttempts=0;
  let recoveryRunning=false;
  let ready=false;

  function messageOf(value){
    if(!value)return"خطای نامشخص";
    if(value instanceof Error)return value.stack||value.message;
    return String(value.reason||value.message||value);
  }
  function record(type,value,source=""){
    const text=messageOf(value);
    errors.push({type,text,source,time:new Date().toISOString()});
    window.LGMK_STARTUP_DIAGNOSTICS={version:VERSION,startedAt,errors:[...errors],recoveryAttempts,ready};
  }
  window.addEventListener("error",event=>record("error",event.error||event.message,event.filename||""),true);
  window.addEventListener("unhandledrejection",event=>record("rejection",event.reason),true);

  function statusElement(){return document.querySelector("#startupStatus")}
  function setStatus(title,detail="",failed=false){
    const box=statusElement();
    if(!box)return;
    box.classList.toggle("failed",failed);
    const heading=box.querySelector("[data-startup-title]");
    const text=box.querySelector("[data-startup-detail]");
    if(heading&&heading.textContent!==title)heading.textContent=title;
    if(text&&text.textContent!==detail)text.textContent=detail;
  }
  function showBootError(error){
    const panel=document.querySelector("#bootError");
    const text=document.querySelector("#bootErrorText");
    if(text)text.textContent=messageOf(error);
    if(panel){
      panel.hidden=false;
      panel.style.cssText="display:grid!important;position:relative!important;z-index:50!important;margin:12px!important;padding:14px!important;background:#fff1f2!important;color:#881337!important;border:1px solid #fecdd3!important;border-radius:14px!important";
    }
    setStatus("راه‌اندازی برنامه متوقف شد",messageOf(error),true);
  }
  function shellReady(){
    const layout=document.querySelector(".v90-layout");
    const nav=document.querySelector("#mainNav .v90-sidebar,#mainNav .v90-mobile-nav");
    const active=document.querySelector(".view.active");
    const content=(active?.textContent||"").trim();
    return Boolean(layout&&nav&&content.length>60);
  }
  function markReady(){
    if(ready)return;
    ready=true;
    document.documentElement.dataset.appReady="true";
    document.documentElement.dataset.release=VERSION;
    const loading=statusElement();
    if(loading)loading.remove();
    const panel=document.querySelector("#bootError");
    if(panel){panel.hidden=true;panel.removeAttribute("style")}
    window.LGMK_STARTUP_DIAGNOSTICS={version:VERSION,startedAt,ready:true,recoveryAttempts,errors:[...errors],readyAt:Date.now(),durationMs:Date.now()-startedAt};
  }
  function attemptRecovery(reason){
    if(ready||shellReady())return markReady();
    if(recoveryRunning||recoveryAttempts>=1)return;
    recoveryRunning=true;
    recoveryAttempts++;
    setStatus("در حال بازیابی راه‌اندازی",`${reason} · تلاش ${recoveryAttempts}`);
    try{
      if(typeof window.buildNav==="function"&&typeof window.go==="function"){
        window.buildNav();
        const target=document.querySelector(".view.active")?.id||window.state?.view||"dashboard";
        window.go(target);
      }else if(typeof window.boot==="function"){
        window.boot();
      }
    }catch(error){record("recovery",error);showBootError(error)}
    setTimeout(()=>{
      recoveryRunning=false;
      if(shellReady())markReady();
    },450);
  }
  function finalCheck(){
    if(shellReady())return markReady();
    const last=errors.length?errors[errors.length-1]:null;
    const detail=last?.text||"فایل‌های برنامه کامل اجرا نشدند. صفحه را یک‌بار بازآوری کنید.";
    showBootError(detail);
    const retry=document.querySelector("#retryBtn");
    if(retry)retry.onclick=()=>location.replace(`${location.pathname}?v=933&t=${Date.now()}`);
  }

  window.addEventListener("lgmk:ready",markReady,{once:true});
  document.addEventListener("DOMContentLoaded",()=>{
    setStatus("در حال ساخت محیط مطالعه","فایل‌ها دریافت شده‌اند؛ راه‌اندازی نهایی در حال انجام است.");
    setTimeout(()=>{if(shellReady())markReady();else attemptRecovery("کنترل اولیه")},900);
    setTimeout(()=>{if(shellReady())markReady();else setStatus("بارگذاری ادامه دارد","در حال تکمیل رابط و داده‌های برنامه.")},3500);
    setTimeout(finalCheck,9000);
  },{once:true});
  window.LGMK_STARTUP={version:VERSION,attemptRecovery,markReady,record,shellReady};
})();
