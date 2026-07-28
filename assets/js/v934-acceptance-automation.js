"use strict";
(function(){
  const VERSION=window.LGMK_RELEASE_VERSION||"9.3.4";
  const AUTO_PARAM="acceptance";
  let running=false;

  function ensureState(){
    state.acceptanceAutomation=state.acceptanceAutomation||{version:VERSION,lastReport:null,running:false,startedAt:null,finishedAt:null};
    if(state.acceptanceAutomation.version!==VERSION){
      state.acceptanceAutomation={version:VERSION,lastReport:null,running:false,startedAt:null,finishedAt:null};
    }
    return state.acceptanceAutomation;
  }
  function rows(){return window.LGMK_V92_DEVICE?.currentRows?.()||[]}
  function report(){
    const automation=ensureState();
    const matrix=rows();
    const physical=state.deviceAcceptance?.manual||{};
    const current=window.LGMK_V92_DEVICE?.collect?.(document,{id:"current",label:"دستگاه فعلی",type:document.documentElement.dataset.deviceMode})||null;
    const passed=matrix.filter(x=>x.pass).length;
    const failed=matrix.filter(x=>!x.pass).length;
    const physicalConfirmed=Object.values(physical).filter(Boolean).length;
    return{
      schema:"lgmk-device-acceptance-report/v1",
      version:VERSION,
      generatedAt:new Date().toISOString(),
      runtime:{
        release:document.documentElement.dataset.release||null,
        appReady:document.documentElement.dataset.appReady==="true",
        runtimeStable:document.documentElement.dataset.runtimeStable==="true",
        shell:document.documentElement.dataset.shell||null,
        deviceMode:document.documentElement.dataset.deviceMode||null
      },
      current,
      matrix:{total:13,executed:matrix.length,passed,failed,complete:matrix.length===13,pass:matrix.length===13&&failed===0,rows:matrix},
      physical:{required:13,confirmed:physicalConfirmed,complete:physicalConfirmed===13,profiles:physical},
      finalAccepted:matrix.length===13&&failed===0&&physicalConfirmed===13,
      automation:{startedAt:automation.startedAt,finishedAt:automation.finishedAt}
    };
  }
  function saveReport(){
    const automation=ensureState();
    automation.lastReport=report();
    automation.finishedAt=automation.lastReport.generatedAt;
    automation.running=false;
    save();
    return automation.lastReport;
  }
  function downloadReport(){
    const data=saveReport();
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const link=document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download=`Legal-German-MasterKit-${VERSION}-Device-Acceptance.json`;
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  }
  function clearResults(){
    state.deviceAcceptance=state.deviceAcceptance||{};
    state.deviceAcceptance.lastMatrix=[];
    state.deviceAcceptance.matrixVersion=VERSION;
    state.deviceAcceptance.lastRun=null;
    const automation=ensureState();
    automation.lastReport=null;automation.running=false;automation.startedAt=null;automation.finishedAt=null;
    save();
    if(state.view==="deviceAcceptance")render("deviceAcceptance");
  }
  async function runAutomated(){
    if(running)return;
    running=true;
    const automation=ensureState();
    automation.running=true;automation.startedAt=new Date().toISOString();automation.finishedAt=null;save();
    try{
      if(typeof go==="function")go("deviceAcceptance");
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      await window.LGMK_V92_DEVICE.runMatrix();
      const result=saveReport();
      if(typeof v82Toast==="function")v82Toast(result.matrix.pass?"ماتریس ۱۳ دستگاه بدون خطا تکمیل شد.":`ماتریس تکمیل شد؛ ${result.matrix.failed} شکست ثبت شد.`,!result.matrix.pass);
      if(state.view==="deviceAcceptance")render("deviceAcceptance");
      return result;
    }catch(error){
      automation.running=false;automation.finishedAt=new Date().toISOString();automation.error=error?.message||String(error);save();
      if(typeof v82Toast==="function")v82Toast("اجرای خودکار پذیرش متوقف شد.",true);
      throw error;
    }finally{running=false}
  }
  function automationPanel(){
    const data=report(),automation=ensureState();
    const status=automation.running?"RUNNING":data.matrix.pass?"AUTOMATED PASS":data.matrix.complete?"COMPLETED WITH FAIL":"NOT COMPLETE";
    return `<section class="v934-acceptance"><header><div><span>ACCEPTANCE AUTOMATION</span><h3>اجرای خودکار و بسته شواهد</h3><p>ماتریس فقط برای نسخه ${VERSION} محاسبه می‌شود و خروجی JSON قابل ممیزی تولید می‌کند.</p></div><strong class="${data.matrix.pass?"pass":automation.running?"running":"pending"}">${status}</strong></header><div class="v934-stats"><article><small>اجراشده</small><b>${data.matrix.executed}/13</b></article><article><small>PASS خودکار</small><b>${data.matrix.passed}</b></article><article><small>FAIL خودکار</small><b>${data.matrix.failed}</b></article><article><small>تأیید فیزیکی</small><b>${data.physical.confirmed}/13</b></article></div><div class="v934-actions"><button id="v934AutoRun" ${automation.running?"disabled":""}>${automation.running?"در حال اجرا…":"اجرای خودکار ۱۳ دستگاه"}</button><button id="v934Export" class="secondary">دریافت گزارش JSON</button><button id="v934Clear" class="ghost">پاک‌کردن نتایج این نسخه</button></div><p class="v934-final ${data.finalAccepted?"pass":"pending"}">${data.finalAccepted?"FINAL DEVICE ACCEPTANCE — PASS":"پذیرش نهایی فقط پس از ۱۳/۱۳ PASS خودکار و ۱۳/۱۳ تأیید فیزیکی بسته می‌شود."}</p></section>`;
  }
  function augment(){
    const el=document.querySelector("#deviceAcceptance");
    if(!el||document.querySelector("#deviceAcceptance .v934-acceptance"))return;
    el.insertAdjacentHTML("afterbegin",automationPanel());
  }
  const previousRender=window.render;
  window.render=function(view){
    const result=previousRender(view);
    if(view==="deviceAcceptance")queueMicrotask(augment);
    return result;
  };
  document.body.addEventListener("click",event=>{
    if(event.target.closest("#v934AutoRun")){event.preventDefault();runAutomated()}
    if(event.target.closest("#v934Export")){event.preventDefault();downloadReport()}
    if(event.target.closest("#v934Clear")){event.preventDefault();clearResults()}
  },true);
  function boot(){
    ensureState();
    const params=new URLSearchParams(location.search);
    if(params.get(AUTO_PARAM)==="auto"&&!params.has("qa")){
      const start=()=>setTimeout(()=>runAutomated(),250);
      if(document.documentElement.dataset.runtimeStable==="true")start();
      else window.addEventListener("lgmk:ready",start,{once:true});
    }
    if(state.view==="deviceAcceptance")queueMicrotask(augment);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  window.LGMK_V934={version:VERSION,runAutomated,report,downloadReport,clearResults};
})();
