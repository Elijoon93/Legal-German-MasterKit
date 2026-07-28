"use strict";
(function(){
  const VERSION="9.1.0";
  const CACHE="lgmk-v9-1-architecture-fidelity-20260728a";
  const DATA87=window.LGMK_V87_DATA||{norms:[],cases:[]};
  const DATA88=window.LGMK_V88_DATA||{lessons:[],submissionChecklist:[]};
  const safe=(fn,fallback)=>{try{return typeof fn==="function"?fn():fallback}catch{return fallback}};
  const esc91=value=>typeof esc==="function"?esc(String(value??"")):String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
  const pct=value=>Math.max(0,Math.min(100,Number(value)||0));
  const completedCount=obj=>Object.values(obj||{}).filter(Boolean).length;
  const courseById=id=>typeof v85CourseById==="function"?v85CourseById(id):(DATA.courses||[]).find(x=>x.id===id);
  const courseProgress=id=>typeof v85CourseProgress==="function"?v85CourseProgress(id):{percent:0,done:0,total:8};
  const tabs={
    study:[["courses","دروس"],["lessons","واحدهای عمیق"],["semester","نیم‌سال"],["books","کتاب‌ها"]],
    skills:[["overview","چهار مهارت"],["reading","متون"],["vocabulary","واژگان"],["review","مرور"]],
    practice:[["cases","پرونده‌ها"],["exams","آزمون‌ها"],["norms","مواد"],["briefs","Case Brief"]],
    research:[["workflow","گردش‌کار"],["sources","منابع"],["citations","استناد"],["submission","تحویل"]]
  };
  Object.assign(state,{v91Tabs:{study:"courses",skills:"overview",practice:"cases",research:"workflow",...(state.v91Tabs||{})}});

  function titleBlock(kicker,title,description,actions=""){
    return `<header class="v91-page-head"><div><span>${kicker}</span><h2>${title}</h2><p>${description}</p></div>${actions?`<div class="v91-head-actions">${actions}</div>`:""}</header>`;
  }
  function tabBar(group){
    const active=state.v91Tabs[group];
    return `<nav class="v91-tabs" aria-label="تب‌های ${group}">${tabs[group].map(([id,label])=>`<button type="button" class="${active===id?"active":""}" data-v91-tab="${group}" data-tab="${id}">${label}</button>`).join("")}</nav>`;
  }
  function metric(label,value,detail=""){
    return `<article class="v91-metric"><small>${label}</small><strong>${value}</strong>${detail?`<span>${detail}</span>`:""}</article>`;
  }
  function quick(view,code,title,description,meta=""){
    return `<button class="v91-quick" data-view="${view}"><span>${code}</span><div><b>${title}</b><small>${description}</small></div>${meta?`<em>${meta}</em>`:""}</button>`;
  }
  function listItem({index,title,subtitle="",meta="",view="",action="",status="",code=""}){
    const attrs=view?`data-view="${view}"`:action;
    return `<button type="button" class="v91-list-item" ${attrs}><span class="v91-list-index">${code||String(index).padStart(2,"0")}</span><span class="v91-list-copy"><b>${title}</b>${subtitle?`<small>${subtitle}</small>`:""}</span><span class="v91-list-meta">${meta?`<em>${meta}</em>`:""}${status?`<i>${status}</i>`:""}<strong>‹</strong></span></button>`;
  }
  function progress(value){return `<div class="v91-progress"><i style="width:${pct(value)}%"></i></div>`}
  function empty(text){return `<div class="v91-empty"><b>داده‌ای ثبت نشده است.</b><p>${text}</p></div>`}

  function selectedCourse(){return courseById(state.courseWorkspace?.selected)||(DATA.courses||[])[0]}
  function dashboard(el){
    const daily=safe(window.v83GenerateDailyPlan,null),done=daily?state.dailyDone?.[daily.date]||{}:{},next=daily?.tasks?.find(x=>!done[x.id]);
    const course=selectedCourse(),cp=course?courseProgress(course.id):{percent:0,done:0,total:8};
    const review=safe(window.v83ReviewStats,{due:0,retention:0,mature:0}),submission=typeof v88ChecklistStatus==="function"?v88ChecklistStatus():{requiredDone:0,required:12,ready:false};
    const today=(daily?.tasks||[]).slice(0,5);
    el.innerHTML=`<section class="v91-welcome"><div><span>LEGAL GERMAN · LL.M. JENA</span><h2>${next?"فعالیت بعدی آماده است":"برنامه امروز تکمیل شده است"}</h2><p>${next?`${next.title}، حدود ${next.minutes} دقیقه.`:"از یکی از مسیرهای اصلی ادامه دهید."}</p><div class="v91-welcome-actions"><button ${next?`data-v90-daily="${daily.tasks.indexOf(next)}"`:`data-view="studyHub"`}>${next?"شروع فعالیت":"مرکز تحصیل"}</button><button class="secondary" data-view="globalSearch">جست‌وجوی محتوا</button></div></div><aside><div class="v91-ring" style="--p:${percent()}"><span>${percent()}%</span></div><small>پیشرفت ثبت‌شده</small></aside></section>
    <section class="v91-quick-grid">${quick("courseWorkspace","CW","ادامه درس",course?.title||"درس انتخاب نشده",`${cp.percent}%`)}${quick("reviewCenter","RV","مرور امروز",`${review.due||0} اصطلاح سررسیدشده`,`${review.retention||0}%`)}${quick("deepLessons","DL","واحدهای عمیق","یادداشت و پاسخ اجباری",`${DATA88.lessons.length}`)}${quick("submissionPackage","SB","پرونده تحویل",submission.ready?"Gateهای اصلی کامل‌اند":"نیازمند تکمیل",`${submission.requiredDone}/${submission.required}`)}</section>
    <section class="v91-dashboard-grid"><article class="v91-panel">${titleBlock("TODAY","برنامه امروز","فقط فعالیت‌های ضروری و قابل انجام.",`<span class="v91-count">${completedCount(done)}/${daily?.tasks?.length||0}</span>`)}<div class="v91-list">${today.length?today.map((task,i)=>listItem({index:i+1,title:task.title,subtitle:task.reason,meta:`${task.minutes} دقیقه`,action:`data-v90-daily="${i}"`,status:done[task.id]?"انجام شد":"شروع"})).join(""):empty("برنامه روزانه هنوز تولید نشده است.")}</div></article>
    <aside class="v91-side-stack"><article class="v91-panel">${titleBlock("ACTIVE COURSE","درس فعال","مسیر مطالعه فعلی.",`<button data-view="courseWorkspace">باز کردن</button>`)}<h3>${course?.title||"—"}</h3>${progress(cp.percent)}<p class="v91-note">${cp.done}/${cp.total} مرحله ثبت شده است.</p></article><article class="v91-panel">${titleBlock("SEMESTER","وضعیت نیم‌سال","برنامه و رویدادهای نزدیک.",`<button data-view="semesterOps">تقویم</button>`)}<div class="v91-inline-metrics">${metric("هفته‌ها",state.plan?.length||0)}${metric("رویدادها",state.semesterEvents?.length||0)}</div></article></aside></section>
    <section class="v91-panel">${titleBlock("LEARNING HUBS","چهار مسیر اصلی","هر مسیر با یک جریان ثابت: فهرست، جزئیات، تمرین و خروجی.")}<div class="v91-hub-grid">${quick("studyHub","ST","تحصیل","درس، نیم‌سال و منابع")}${quick("skillsHub","LG","یادگیری","چهار مهارت و زبان حقوقی")}${quick("practiceHub","PR","تمرین","پرونده، آزمون و مواد")}${quick("researchHub","RS","پژوهش","منبع، استناد و تحویل")}</div></section>`;
  }

  function studyContent(){
    const active=state.v91Tabs.study,courses=DATA.courses||[],lessons=DATA88.lessons||[],books=DATA.books||[];
    if(active==="courses")return `<div class="v91-list">${courses.map((c,i)=>{const p=courseProgress(c.id);return listItem({index:i+1,title:c.title,subtitle:c.outcome||c.area||"",meta:`${p.percent}%`,action:`data-v91-course="${c.id}"`,status:`${p.done}/${p.total}`})}).join("")}</div>`;
    if(active==="lessons")return `<div class="v91-list">${lessons.slice(0,30).map((l,i)=>listItem({index:i+1,title:l.title||`Lesson ${i+1}`,subtitle:courseById(l.courseId)?.title||l.courseId,meta:l.level||"",view:"deepLessons",status:state.deepLessons?.completed?.[l.id]?"کامل":"باز"})).join("")||empty("Lesson Unit در دسترس نیست.")}</div>`;
    if(active==="semester")return `<div class="v91-list">${(state.plan||[]).map((w,i)=>{const done=(w.tasks||[]).filter(x=>x.done).length;return listItem({index:i+1,title:`هفته ${w.week}: ${w.theme}`,subtitle:(w.tasks||[]).map(x=>x.cat).join(" · "),meta:`${done}/${w.tasks?.length||0}`,view:"planner",status:done===w.tasks?.length?"کامل":"فعال"})}).join("")||empty("ابتدا برنامه ترم را تولید کنید.")}</div>`;
    return `<div class="v91-list">${books.map((b,i)=>listItem({index:i+1,title:b.title,subtitle:`${b.author} · ${b.area}`,meta:b.level,view:"library",status:"منبع"})).join("")||empty("کتابی ثبت نشده است.")}</div>`;
  }
  function studyHub(el){
    const course=selectedCourse(),p=course?courseProgress(course.id):{percent:0};
    el.innerHTML=`${titleBlock("STUDY HUB","تحصیل با مسیر روشن","درس‌ها، واحدهای عمیق، برنامه نیم‌سال و کتاب‌ها در یک مرکز.",`<button data-view="courseWorkspace">ادامه ${esc91(course?.title||"درس")}</button>`)}${tabBar("study")}<section class="v91-hub-summary">${metric("دروس",DATA.courses?.length||0)}${metric("واحدهای عمیق",DATA88.lessons.length)}${metric("پیشرفت درس فعال",`${p.percent}%`)}${metric("کتاب‌ها",DATA.books?.length||0)}</section><section class="v91-panel v91-list-panel">${studyContent()}</section>`;
  }

  function skillsContent(){
    const active=state.v91Tabs.skills,readings=DATA.readings||[],vocab=DATA.vocab||[];
    if(active==="overview")return `<div class="v91-module-grid">${quick("reading","RD","خواندن","متن، واژگان و درک مطلب",`${readings.length}`)}${quick("listening","LS","شنیدن","صوت، Transcript و ارزیابی")}${quick("speaking","SP","گفتار","ارائه و استدلال شفاهی")}${quick("writing","WR","نگارش","Gutachtenstil و متن دانشگاهی")}</div>`;
    if(active==="reading")return `<div class="v91-list">${readings.map((r,i)=>listItem({index:i+1,title:r.title,subtitle:`${r.area||"حقوق"} · ${r.level||""}`,meta:`${r.questions?.length||0} سؤال`,view:"reading",status:state.readingDone?.[r.id]?"مطالعه شد":"باز"})).join("")}</div>`;
    if(active==="vocabulary")return `<div class="v91-list">${vocab.slice(0,30).map((v,i)=>listItem({index:i+1,title:v.term,subtitle:v.meaning||v.fa||v.definition||"",meta:v.area||v.category||"",view:"language",status:state.mastered?.[i]?"مسلط":"مرور"})).join("")}</div>`;
    const stats=safe(window.v83ReviewStats,{due:0,mature:0,retention:0});return `<div class="v91-review-card"><div>${metric("سررسید",stats.due||0)}${metric("کارت بالغ",stats.mature||0)}${metric("نگهداشت",`${stats.retention||0}%`)}</div><button data-view="reviewCenter">شروع مرور فاصله‌دار</button></div>`;
  }
  function skillsHub(el){
    el.innerHTML=`${titleBlock("LEARNING HUB","یادگیری زبان حقوقی","هر جلسه از ورودی زبانی به یک خروجی حقوقی می‌رسد.",`<button data-view="reviewCenter">مرور امروز</button>`)}${tabBar("skills")}<section class="v91-hub-summary">${metric("اصطلاحات",DATA.vocab?.length||0)}${metric("قالب جمله",DATA.sentences?.length||0)}${metric("متون",DATA.readings?.length||0)}${metric("مهارت‌ها","4")}</section><section class="v91-panel v91-list-panel">${skillsContent()}</section>`;
  }

  function practiceContent(){
    const active=state.v91Tabs.practice,cases=DATA.cases||[],norms=DATA87.norms||[],briefs=DATA87.cases||[],courses=DATA.courses||[];
    if(active==="cases")return `<div class="v91-list">${cases.map((c,i)=>listItem({index:i+1,title:c.title,subtitle:c.question||c.area||"",meta:c.area||"",view:"caseLab",status:(state.caseAnswers?.[c.id]?.length||0)>120?"حل شده":"باز"})).join("")}</div>`;
    if(active==="exams")return `<div class="v91-list">${courses.map((c,i)=>listItem({index:i+1,title:c.title,subtitle:"آزمون تفکیک‌شده درس",meta:state.examByCourse?.[c.subject]??"—",view:"exam",status:"آزمون"})).join("")}</div>`;
    if(active==="norms")return `<div class="v91-list">${norms.map((n,i)=>listItem({index:i+1,title:`${n.cite} ${n.code} — ${n.title}`,subtitle:n.ruleFa,meta:n.courseId,action:`data-v91-norm="${n.id}"`,status:state.legalEvidence?.reviewed?.[n.id]?"مرور شد":"رسمی"})).join("")}</div>`;
    return `<div class="v91-list">${briefs.map((c,i)=>listItem({index:i+1,title:c.title,subtitle:c.issueDe,meta:c.caseNo,action:`data-v91-brief="${c.id}"`,status:state.caseBriefs?.completed?.[c.id]?"کامل":"باز"})).join("")}</div>`;
  }
  function practiceHub(el){
    el.innerHTML=`${titleBlock("PRACTICE HUB","تمرین حقوقی","قاعده، پرونده، آزمون و رأی در یک مسیر عملی.",`<button data-view="caseLab">شروع پرونده</button>`)}${tabBar("practice")}<section class="v91-hub-summary">${metric("پرونده‌ها",DATA.cases?.length||0)}${metric("آزمون‌های درسی",DATA.courses?.length||0)}${metric("مواد رسمی",DATA87.norms.length)}${metric("Case Brief",DATA87.cases.length)}</section><section class="v91-panel v91-list-panel">${practiceContent()}</section>`;
  }

  function researchContent(){
    const active=state.v91Tabs.research,steps=DATA.researchSteps||[],sources=state.sourceMatrix||[],checklist=DATA88.submissionChecklist||[];
    if(active==="workflow")return `<div class="v91-list">${steps.map((s,i)=>listItem({index:i+1,title:s.title,subtitle:s.desc,meta:s.output||"",view:"research",status:state.researchDone?.[s.id]?"ثبت شد":"مرحله"})).join("")}</div>`;
    if(active==="sources")return sources.length?`<div class="v91-list">${sources.map((s,i)=>listItem({index:i+1,title:s.title||"منبع بدون عنوان",subtitle:[s.author,s.year].filter(Boolean).join(" · "),meta:s.type||"",view:"sourceMatrix",status:s.verified?"تأیید":"بازبینی"})).join("")}</div>`:empty("منابع BibTeX/RIS یا دستی را به ماتریس اضافه کنید.");
    if(active==="citations")return `<div class="v91-module-grid">${quick("citationBuilder","CT","Citation Builder","پیش‌نویس Fußnote و کتابنامه")}${quick("citationAudit","QA","ممیزی استناد","خطا، هشدار و تطابق")}${quick("referenceImport","IM","ورود منابع","BibTeX و RIS")}${quick("sourceMatrix","SM","ماتریس ادعا–منبع","ادعا، صفحه و وضعیت")}</div>`;
    return `<div class="v91-list">${checklist.map((item,i)=>listItem({index:i+1,title:item.title,subtitle:item.desc||item.description||"",meta:item.required?"اجباری":"توصیه‌شده",view:"submissionPackage",status:state.submissionPackage?.checks?.[item.id]?"کامل":"باز"})).join("")}</div>`;
  }
  function researchHub(el){
    const status=typeof v88ChecklistStatus==="function"?v88ChecklistStatus():{requiredDone:0,required:12};
    el.innerHTML=`${titleBlock("RESEARCH HUB","پژوهش و تحویل دانشگاهی","از پرسش پژوهش تا کنترل نهایی تحویل، بدون مسیر پراکنده.",`<button data-view="submissionPackage">پرونده تحویل</button>`)}${tabBar("research")}<section class="v91-hub-summary">${metric("مراحل پژوهش",DATA.researchSteps?.length||0)}${metric("منابع",state.sourceMatrix?.length||0)}${metric("نسخه‌ها",state.submissionPackage?.versions?.length||0)}${metric("Gate اجباری",`${status.requiredDone}/${status.required}`)}</section><section class="v91-panel v91-list-panel">${researchContent()}</section>`;
  }

  const previousBuildNav=buildNav;
  buildNav=function(){
    previousBuildNav();
    const qa=document.querySelector("#v90QA");if(qa)qa.remove();
    const search=document.querySelector("#v90Search");if(search){search.textContent="جست‌وجو";search.setAttribute("aria-label","جست‌وجوی کل برنامه")}
    const badge=document.querySelector("#v90ReleaseBadge");if(badge)badge.textContent=`v${VERSION}`;
    document.querySelector(".v90-brand small")?.replaceChildren(document.createTextNode(`MasterKit · v${VERSION}`));
  };

  const previousGo=go;
  go=function(view){previousGo(view);const badge=document.querySelector("#v90ReleaseBadge");if(badge)badge.textContent=`v${VERSION}`;document.documentElement.dataset.release=VERSION};

  const previousRender=render;
  render=function(view){
    const el=document.getElementById(view);
    if(view==="dashboard")return dashboard(el);
    if(view==="studyHub")return studyHub(el);
    if(view==="skillsHub")return skillsHub(el);
    if(view==="practiceHub")return practiceHub(el);
    if(view==="researchHub")return researchHub(el);
    return previousRender(view);
  };

  document.body.addEventListener("click",event=>{
    const tab=event.target.closest("[data-v91-tab]");
    if(tab){state.v91Tabs[tab.dataset.v91Tab]=tab.dataset.tab;save();render(`${tab.dataset.v91Tab}Hub`);return}
    const course=event.target.closest("[data-v91-course]");
    if(course){if(typeof v85SelectCourse==="function")v85SelectCourse(course.dataset.v91Course);else{state.courseWorkspace=state.courseWorkspace||{};state.courseWorkspace.selected=course.dataset.v91Course;save()}go("courseWorkspace");return}
    const norm=event.target.closest("[data-v91-norm]");
    if(norm){if(typeof v87SelectNorm==="function")v87SelectNorm(norm.dataset.v91Norm);go("legalEvidence");return}
    const brief=event.target.closest("[data-v91-brief]");
    if(brief){if(typeof v87SelectCase==="function")v87SelectCase(brief.dataset.v91Brief);go("caseBriefs");return}
  },true);

  async function refresh(){
    document.documentElement.dataset.release=VERSION;
    try{localStorage.setItem("lgmk_runtime_release",VERSION)}catch{}
    if("caches" in window){try{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("lgmk-")&&k!==CACHE).map(k=>caches.delete(k)))}catch{}}
    if("serviceWorker" in navigator){try{const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.update().catch(()=>null)))}catch{}}
  }
  refresh();
  window.LGMK_V91={version:VERSION,architecture:"hub-list-detail-output",reference:"PflegeDeutsch Pro information architecture only"};
})();
