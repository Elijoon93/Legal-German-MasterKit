"use strict";
(function(){
  const VERSION="9.0.0";
  const CACHE="lgmk-v9-0-consolidated-20260728a";
  const PRIMARY=[
    ["dashboard","خانه","DB"],
    ["studyHub","تحصیل","ST"],
    ["skillsHub","یادگیری","LG"],
    ["practiceHub","تمرین","PR"],
    ["researchHub","پژوهش","RS"]
  ];
  const GROUPS=[
    ["خانه",[["dashboard","داشبورد","DB"]]],
    ["تحصیل",[["studyHub","مرکز تحصیل","ST"],["courseWorkspace","کارگاه درس","CW"],["deepLessons","درس‌های عمیق","DL"],["planner","برنامه ترم","PL"],["semesterOps","تقویم نیم‌سال","SC"]]],
    ["زبان حقوقی",[["skillsHub","مرکز یادگیری","LG"],["language","واژگان و جمله","LX"],["reading","خواندن","RD"],["listening","شنیدن","LS"],["speaking","گفتار","SP"],["writing","نگارش","WR"],["reviewCenter","مرور هوشمند","RV"]]],
    ["تمرین حقوقی",[["practiceHub","مرکز تمرین","PR"],["caseLab","حل پرونده","CA"],["exam","آزمون‌ها","EX"],["legalEvidence","بانک مواد","NV"],["caseBriefs","Case Brief","CB"],["adaptive","تحلیل ضعف","AN"]]],
    ["پژوهش و تحویل",[["researchHub","مرکز پژوهش","RS"],["research","گردش‌کار پژوهش","WF"],["sourceMatrix","ماتریس منابع","SM"],["referenceImport","ورود منابع","IM"],["citationBuilder","ساخت ارجاع","CT"],["citationAudit","ممیزی استناد","QA"],["submissionPackage","پرونده تحویل","SB"]]],
    ["ساختار و ابزار",[["curriculum","ساختار دوره","CU"],["subjects","سرفصل‌ها","SJ"],["library","کتابخانه","LB"],["globalSearch","جست‌وجوی کل","GS"],["reportCenter","گزارش و داده","RP"],["progressView","پیشرفت","PG"],["deviceAcceptance","پذیرش دستگاه","DV"]]]
  ];
  const META={
    dashboard:["داشبورد","کار بعدی، مسیرهای اصلی و وضعیت مطالعه"],studyHub:["مرکز تحصیل","درس، برنامه نیم‌سال و منابع در یک مسیر"],courseWorkspace:["کارگاه درس","مسیر یکپارچه و قابل سنجش هر درس"],deepLessons:["درس‌های عمیق","واحدهای واقعی با خروجی اجباری"],planner:["برنامه ترم","نقشه ۱۲ هفته‌ای بر اساس زمان واقعی"],semesterOps:["تقویم نیم‌سال","کلاس، آزمون، ارائه و مهلت تحویل"],curriculum:["ساختار دوره","الزامات LL.M. و نقشه پیشنهادی"],subjects:["سرفصل‌ها","اهداف، قوانین و تمرین هر درس"],library:["کتابخانه","کتاب‌ها و منابع درس‌محور"],skillsHub:["مرکز یادگیری","چهار مهارت و بانک زبان حقوقی"],language:["واژگان و جمله","اصطلاحات، Collocation و قالب‌های دانشگاهی"],reading:["خواندن","متون حقوقی سطح‌بندی‌شده"],listening:["شنیدن","فهم شنیداری و Transcript کنترل‌شده"],speaking:["گفتار","ارائه، استدلال و تمرین شفاهی"],writing:["نگارش","Gutachtenstil و نوشتار دانشگاهی"],reviewCenter:["مرور هوشمند","مرور فاصله‌دار اصطلاحات"],practiceHub:["مرکز تمرین","پرونده، آزمون و شواهد حقوقی"],caseLab:["حل پرونده","از Sachverhalt تا Ergebnis"],exam:["آزمون‌ها","ارزیابی تفکیک‌شده هر درس"],legalEvidence:["بانک مواد","قاعده، عناصر آزمون و منبع رسمی"],caseBriefs:["Case Brief","رأی، Ratio و اهمیت علمی"],adaptive:["تحلیل ضعف","اولویت مطالعه بر اساس عملکرد واقعی"],researchHub:["مرکز پژوهش","منبع، استناد، نسخه و تحویل دانشگاهی"],research:["گردش‌کار پژوهش","Seminararbeit و Magisterarbeit"],sourceMatrix:["ماتریس منابع","اتصال هر ادعا به منبع قابل کنترل"],referenceImport:["ورود منابع","BibTeX و RIS با کنترل تکرار"],citationBuilder:["ساخت ارجاع","پیش‌نویس Fußnote و Literaturverzeichnis"],citationAudit:["ممیزی استناد","کنترل ادعا، منبع و کتابنامه"],submissionPackage:["پرونده تحویل","Gateهای اجباری و تاریخچه نسخه"],globalSearch:["جست‌وجوی کل","دسترسی مستقیم به محتوای برنامه"],reportCenter:["گزارش و داده","چاپ، پشتیبان و انتقال اطلاعات"],progressView:["پیشرفت","شاخص‌های ثبت‌شده مطالعه"],deviceAcceptance:["پذیرش دستگاه","آزمون Responsive، PWA و Runtime روی پروفایل‌های هدف"]
  };
  const PROFILES=[
    {id:"iphone-se",label:"iPhone SE",width:375,height:667,class:"iOS"},
    {id:"iphone-14",label:"iPhone 14 / 15",width:390,height:844,class:"iOS"},
    {id:"iphone-max",label:"iPhone Pro Max",width:430,height:932,class:"iOS"},
    {id:"android",label:"Android Phone",width:360,height:800,class:"Android"},
    {id:"ipad-mini",label:"iPad Mini Portrait",width:768,height:1024,class:"iPadOS"},
    {id:"ipad-landscape",label:"iPad Landscape",width:1024,height:768,class:"iPadOS"},
    {id:"android-tablet",label:"Android Tablet",width:800,height:1280,class:"Android"},
    {id:"desktop",label:"Desktop",width:1366,height:768,class:"Desktop"},
    {id:"wide",label:"Wide Desktop",width:1920,height:1080,class:"Desktop"}
  ];
  const safe=(fn,fallback)=>{try{return typeof fn==="function"?fn():fallback}catch{return fallback}};
  const countTrue=obj=>Object.values(obj||{}).filter(Boolean).length;
  const average=obj=>{const rows=Object.values(obj||{}).map(Number).filter(Number.isFinite);return rows.length?Math.round(rows.reduce((a,b)=>a+b,0)/rows.length):0};
  const escSafe=value=>typeof esc==="function"?esc(String(value||"")):String(value||"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
  const routeButton=([view,label,code])=>`<button type="button" data-view="${view}"><span>${code}</span><b>${label}</b></button>`;
  const hubCard=(view,code,title,desc,metric="")=>`<button class="v90-module" data-view="${view}"><span>${code}</span><div><b>${title}</b><p>${desc}</p></div>${metric?`<em>${metric}</em>`:""}</button>`;
  const sectionTitle=(kicker,title,action="")=>`<div class="v90-section-title"><div><span>${kicker}</span><h2>${title}</h2></div>${action}</div>`;
  const progressBar=value=>`<div class="v90-progress"><i style="width:${Math.max(0,Math.min(100,Number(value)||0))}%"></i></div>`;
  const toast=(message,error=false)=>{if(typeof v82Toast==="function")v82Toast(message,error);else console[error?"error":"log"](message)};

  Object.assign(state,{deviceAcceptance:state.deviceAcceptance||{manual:{},lastMatrix:[],lastRun:null,current:null}});
  state.deviceAcceptance.manual=state.deviceAcceptance.manual||{};

  function ensureSections(){
    const main=document.querySelector("main.app-shell");
    ["researchHub","deviceAcceptance"].forEach(id=>{if(main&&!document.getElementById(id)){const section=document.createElement("section");section.id=id;section.className="view";main.appendChild(section)}});
  }
  function ensureLayout(){
    ensureSections();
    const nav=document.querySelector("#mainNav"),main=document.querySelector("main.app-shell"),top=document.querySelector(".topbar"),error=document.querySelector("#bootError");
    if(!nav||!main||!top)return;
    let layout=document.querySelector(".v90-layout"),content=document.querySelector(".v90-content");
    if(!layout){layout=document.createElement("div");content=document.createElement("div");layout.className="v90-layout";content.className="v90-content";nav.parentNode.insertBefore(layout,nav);layout.append(nav,content);content.append(top,error,main)}
  }
  function buildShell(){
    ensureLayout();
    const nav=document.querySelector("#mainNav"),top=document.querySelector(".topbar");if(!nav||!top)return;
    nav.innerHTML=`<aside class="v90-sidebar"><div class="v90-brand"><div>§</div><span><b>Legal German</b><small>MasterKit · v${VERSION}</small></span></div><div class="v90-nav-groups">${GROUPS.map(([title,items])=>`<section><h4>${title}</h4>${items.filter(([view])=>document.getElementById(view)).map(routeButton).join("")}</section>`).join("")}</div><footer><b>${escSafe(state.profile?.name||"دانشجو")}</b><span>${escSafe(state.profile?.level||"B2")} · ${escSafe(state.profile?.semester||"")}</span></footer></aside><div class="v90-mobile-nav">${PRIMARY.map(routeButton).join("")}</div>`;
    nav.onclick=event=>{const button=event.target.closest("button[data-view]");if(button)go(button.dataset.view)};
    top.innerHTML=`<div class="v90-title"><span class="v90-kicker">LL.M. OEC. · JENA</span><h1>داشبورد</h1><p>کار بعدی، مسیرهای اصلی و وضعیت مطالعه</p></div><div class="v90-top-actions"><button id="v90Search" type="button">جست‌وجو</button><button id="v90QA" type="button">QA</button><span class="v90-profile">${escSafe(state.profile?.level||"B2")}</span><span id="v90ReleaseBadge">v${VERSION}</span><button id="installBtn" type="button" hidden>نصب</button></div>`;
  }
  buildNav=buildShell;

  go=function(view){
    ensureSections();
    const target=document.getElementById(view)?view:"dashboard";state.view=target;save();
    document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id===target));
    document.querySelectorAll("#mainNav [data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===target));
    const meta=META[target]||[target,""];const title=document.querySelector(".v90-title");
    if(title)title.innerHTML=`<span class="v90-kicker">LL.M. OEC. · JENA</span><h1>${meta[0]}</h1><p>${meta[1]}</p>`;
    render(target);
    const active=document.getElementById(target);if(active&&!active.textContent.trim())active.innerHTML=`<section class="v90-empty"><b>این مسیر بارگذاری نشد.</b><p>Route: ${escSafe(target)}. این وضعیت در پذیرش v9.0 خطا محسوب می‌شود.</p><button data-view="dashboard">بازگشت به داشبورد</button></section>`;
    window.scrollTo({top:0,left:0,behavior:"auto"});
  };

  function renderDashboard(el){
    const daily=safe(window.v83GenerateDailyPlan,null),done=daily?state.dailyDone?.[daily.date]||{}:{},next=daily?.tasks?.find(task=>!done[task.id]);
    const course=typeof v85CourseById==="function"?v85CourseById(state.courseWorkspace?.selected):DATA.courses?.[0];
    const courseProgress=course&&typeof v85CourseProgress==="function"?v85CourseProgress(course.id):{percent:0,done:0,total:10};
    const review=safe(window.v83ReviewStats,{due:0,mature:0,retention:0}),weak=safe(window.v83Weaknesses,[]),submission=typeof v88ChecklistStatus==="function"?v88ChecklistStatus():{requiredDone:0,required:12,ready:false};
    const lesson=course&&typeof v88LessonProgress==="function"?v88LessonProgress(course.id):{done:0,total:3};
    const tasks=daily?.tasks?.slice(0,5)||[];
    el.innerHTML=`<section class="v90-welcome"><div><span>GUTEN TAG, ${escSafe(state.profile?.name||"دانشجو")}</span><h2>${next?"کار بعدی شما مشخص است":"برنامه امروز تکمیل شده است"}</h2><p>${next?`${next.title} · ${next.minutes} دقیقه`:"برای ادامه، یک مسیر اصلی را انتخاب کنید."}</p><div><button ${next?`data-v90-daily="${daily.tasks.indexOf(next)}"`:`data-view="studyHub"`}>${next?"شروع فعالیت":"مرکز تحصیل"}</button><button class="secondary" data-view="globalSearch">جست‌وجوی محتوا</button></div></div><aside><div class="v90-ring" style="--p:${percent()}"><span>${percent()}%</span></div><small>پیشرفت ثبت‌شده</small></aside></section>
    <section class="v90-quick">${hubCard("courseWorkspace","CW","ادامه درس",course?.title||"درس منتخب",`${courseProgress.percent}%`)}${hubCard("reviewCenter","RV","مرور امروز",`${review.due} اصطلاح سررسیدشده`,`${review.retention||0}%`)}${hubCard("deepLessons","DL","درس عمیق","واحدهای دارای خروجی اجباری",`${lesson.done}/${lesson.total}`)}${hubCard("submissionPackage","SB","پرونده تحویل",submission.ready?"Gateهای اجباری کامل‌اند":"نیازمند تکمیل",`${submission.requiredDone}/${submission.required}`)}</section>
    <section class="v90-dashboard-grid"><article class="v90-card">${sectionTitle("TODAY","برنامه امروز",`<b>${countTrue(done)}/${daily?.tasks?.length||0}</b>`)}<div class="v90-agenda">${tasks.map((task,index)=>`<button data-v90-daily="${index}" class="${done[task.id]?"done":""}"><i>${String(index+1).padStart(2,"0")}</i><span><b>${task.title}</b><small>${task.reason} · ${task.minutes} دقیقه</small></span><em>${done[task.id]?"انجام شد":"شروع"}</em></button>`).join("")||"<p class='muted'>برنامه روزانه هنوز تولید نشده است.</p>"}</div></article><aside class="v90-stack"><article class="v90-card">${sectionTitle("COURSE IN FOCUS","درس فعال",`<button data-view="courseWorkspace">باز کردن</button>`)}<h3>${course?.title||"درس انتخاب نشده"}</h3>${progressBar(courseProgress.percent)}<p>${courseProgress.done}/${courseProgress.total} مرحله تکمیل شده است.</p></article><article class="v90-card">${sectionTitle("PRIORITY","اولویت علمی",`<button data-view="adaptive">تحلیل</button>`)}${weak[0]?`<h3>${weak[0].subject}</h3>${progressBar(weak[0].score)}<p>امتیاز ترکیبی ${weak[0].score}%</p>`:"<p class='muted'>هنوز داده کافی برای تحلیل ضعف وجود ندارد.</p>"}</article></aside></section>
    <section class="v90-card">${sectionTitle("LEARNING HUBS","مسیرهای اصلی",`<button data-view="deviceAcceptance">پذیرش دستگاه</button>`)}<div class="v90-hub-grid">${hubCard("studyHub","ST","تحصیل","درس، برنامه ترم و منابع")}${hubCard("skillsHub","LG","یادگیری","چهار مهارت و بانک زبان")}${hubCard("practiceHub","PR","تمرین","پرونده، آزمون و مواد")}${hubCard("researchHub","RS","پژوهش","منبع، استناد و تحویل")}</div></section>`;
  }
  function renderStudyHub(el){
    const course=typeof v85CourseById==="function"?v85CourseById(state.courseWorkspace?.selected):DATA.courses?.[0],p=course&&typeof v85CourseProgress==="function"?v85CourseProgress(course.id):{percent:0};
    el.innerHTML=`<section class="v90-hub-head"><div><span>STUDY HUB</span><h2>از انتخاب درس تا خروجی نیم‌سال</h2><p>هر مرحله یک هدف روشن دارد: انتخاب، مطالعه، تمرین و ثبت خروجی.</p></div><button data-view="courseWorkspace">ادامه ${course?.title||"درس"}</button></section><section class="v90-hub-grid">${hubCard("courseWorkspace","CW","کارگاه درس","مسیر متصل و قابل سنجش",`${p.percent}%`)}${hubCard("deepLessons","DL","درس‌های عمیق","سه واحد واقعی برای هر درس","30 واحد")}${hubCard("planner","PL","برنامه ترم","نقشه ۱۲ هفته‌ای شخصی")}${hubCard("semesterOps","SC","تقویم نیم‌سال","کلاس، آزمون و مهلت")}${hubCard("subjects","SJ","سرفصل‌ها","اهداف و قوانین هر درس",`${DATA.courses?.length||0} درس`)}${hubCard("library","LB","کتابخانه","منابع و ترتیب مطالعه",`${DATA.books?.length||0} کتاب`)}</section><section class="v90-card">${sectionTitle("STUDY FLOW","ترتیب کار پیشنهادی")}<div class="v90-flow"><article><i>01</i><b>درس را انتخاب کنید</b><p>هدف و مواد اصلی را مشخص کنید.</p></article><article><i>02</i><b>یک واحد عمیق بخوانید</b><p>یادداشت و پاسخ اجباری ثبت کنید.</p></article><article><i>03</i><b>پرونده و آزمون انجام دهید</b><p>ضعف واقعی را شناسایی کنید.</p></article><article><i>04</i><b>خروجی دانشگاهی بسازید</b><p>نگارش، منبع و نسخه را ثبت کنید.</p></article></div></section>`;
  }
  function renderSkillsHub(el){
    const scores={reading:average(state.readingScores),listening:average(state.listeningScores),speaking:average(state.speakingScores),writing:average(state.writingScores)};
    el.innerHTML=`<section class="v90-hub-head"><div><span>LEGAL LANGUAGE</span><h2>چهار مهارت، یک جریان یادگیری</h2><p>ورودی زبانی باید به استدلال حقوقی و خروجی دانشگاهی منتهی شود.</p></div><button data-view="reviewCenter">مرور امروز</button></section><section class="v90-skill-grid">${hubCard("reading","RD","خواندن","متن، کلیدواژه و درک مطلب",`${scores.reading}%`)}${hubCard("listening","LS","شنیدن","صوت، Transcript و سؤال",`${scores.listening}%`)}${hubCard("speaking","SP","گفتار","ارائه و استدلال شفاهی",`${scores.speaking}%`)}${hubCard("writing","WR","نگارش","Gutachtenstil و متن دانشگاهی",`${scores.writing}%`)}</section><section class="v90-dashboard-grid"><article class="v90-card">${sectionTitle("LANGUAGE BANK","بانک زبان")}<div class="v90-link-list">${hubCard("language","LX","واژگان حقوقی","معنی، مثال، Collocation و قانون",`${DATA.vocab?.length||0}`)}${hubCard("language","ST","قالب‌های جمله","Obersatz، Subsumtion و نتیجه",`${DATA.sentences?.length||0}`)}${hubCard("reviewCenter","RV","مرور فاصله‌دار","صف روزانه بر اساس سررسید")}</div></article><article class="v90-card">${sectionTitle("SESSION FLOW","الگوی هر جلسه")}<ol class="v90-session"><li><b>۵ واژه</b><span>فعال‌سازی زبان موضوع</span></li><li><b>یک متن یا صوت</b><span>دریافت ورودی معتبر</span></li><li><b>یک پاسخ</b><span>گفتاری یا نوشتاری</span></li><li><b>ثبت بازخورد</b><span>انتقال نتیجه به مسیر تطبیقی</span></li></ol></article></section>`;
  }
  function renderPracticeHub(el){
    const caseDone=Object.keys(state.caseScores||{}).length,examDone=Object.keys(state.examByCourse||{}).length,normReviewed=countTrue(state.legalEvidence?.reviewed),briefDone=countTrue(state.caseBriefs?.completed);
    el.innerHTML=`<section class="v90-hub-head"><div><span>PRACTICE HUB</span><h2>از قاعده تا حل مسئله</h2><p>پرونده، آزمون، ماده و رأی در یک مسیر عملی قرار گرفته‌اند.</p></div><button data-view="caseLab">شروع پرونده</button></section><section class="v90-hub-grid">${hubCard("caseLab","CA","حل پرونده","Sachverhalt تا Ergebnis",`${caseDone} ثبت`)}${hubCard("exam","EX","آزمون درس","سؤال و تحلیل خطا",`${examDone} درس`)}${hubCard("legalEvidence","NV","بانک مواد","قاعده، عناصر و منبع رسمی",`${normReviewed} مرور`)}${hubCard("caseBriefs","CB","Case Brief","رأی، Ratio و اهمیت",`${briefDone} کامل`)}${hubCard("adaptive","AN","تحلیل ضعف","ترکیب عملکرد همه فعالیت‌ها")}${hubCard("courseWorkspace","CW","بازگشت به درس","اتصال تمرین به مسیر درس")}</section>`;
  }
  function renderResearchHub(el){
    const sources=state.sourceMatrix?.length||0,audit=state.citationAudit?.last,submission=typeof v88ChecklistStatus==="function"?v88ChecklistStatus():{requiredDone:0,required:12,ready:false},versions=state.submissionPackage?.versions?.length||0;
    el.innerHTML=`<section class="v90-hub-head"><div><span>RESEARCH HUB</span><h2>از پرسش پژوهش تا پرونده تحویل</h2><p>منبع، ارجاع، ممیزی، نسخه و Gateهای تحویل در یک جریان روشن قرار دارند.</p></div><button data-view="submissionPackage">پرونده تحویل</button></section><section class="v90-quick">${hubCard("sourceMatrix","SM","منابع",`${sources} منبع ثبت‌شده`)}${hubCard("citationAudit","QA","آخرین ممیزی",audit?`امتیاز ${audit.score}`:"هنوز اجرا نشده")}${hubCard("submissionPackage","SB","Gateهای تحویل",submission.ready?"آماده":"نیازمند تکمیل",`${submission.requiredDone}/${submission.required}`)}${hubCard("submissionPackage","VS","نسخه‌ها",`${versions} Snapshot`)}</section><section class="v90-hub-grid">${hubCard("research","WF","گردش‌کار پژوهش","موضوع، سؤال و مراحل کار")}${hubCard("sourceMatrix","SM","ماتریس ادعا–منبع","هر ادعا به منبع متصل شود")}${hubCard("referenceImport","IM","ورود منابع","BibTeX و RIS")}${hubCard("citationBuilder","CT","Citation Builder","پیش‌نویس Fußnote و کتابنامه")}${hubCard("citationAudit","QA","ممیزی استناد","خطا، هشدار و تطابق منابع")}${hubCard("submissionPackage","SB","پرونده تحویل","Formalien، نسخه‌ها و Gateها")}</section><section class="v90-card">${sectionTitle("SUBMISSION FLOW","مسیر تحویل علمی")}<div class="v90-flow"><article><i>01</i><b>پرسش و ساختار</b><p>موضوع، سؤال و Gliederung را قطعی کنید.</p></article><article><i>02</i><b>منبع و ادعا</b><p>هر بند را به منبع و صفحه وصل کنید.</p></article><article><i>03</i><b>ممیزی و نسخه</b><p>خطاها را رفع و Snapshot ثبت کنید.</p></article><article><i>04</i><b>Gate تحویل</b><p>Formalien و دستور کرسی را کنترل کنید.</p></article></div></section>`;
  }

  function collectMetrics(doc,profile){
    const win=doc.defaultView,root=doc.documentElement,body=doc.body,top=doc.querySelector(".topbar"),sidebar=doc.querySelector(".v90-sidebar"),mobileNav=doc.querySelector(".v90-mobile-nav"),shell=doc.querySelector(".app-shell"),active=doc.querySelector(".view.active");
    const width=win.innerWidth,mobile=width<=1024,navButtons=mobileNav?.querySelectorAll("button[data-view]").length||0;
    const visibleInputs=[...doc.querySelectorAll("input,select,textarea")].filter(x=>{const s=win.getComputedStyle(x);return s.display!=="none"&&s.visibility!=="hidden"});
    const minInput=visibleInputs.length?Math.min(...visibleInputs.map(x=>parseFloat(win.getComputedStyle(x).fontSize)||99)):16;
    const checks={
      noHorizontalOverflow:root.scrollWidth<=root.clientWidth+1&&body.scrollWidth<=root.clientWidth+1,
      shellWithinViewport:!shell||shell.getBoundingClientRect().right<=width+1,
      correctNavigation:mobile?win.getComputedStyle(mobileNav).display!=="none"&&navButtons===5:win.getComputedStyle(sidebar).display!=="none",
      oppositeNavigationHidden:mobile?win.getComputedStyle(sidebar).display==="none":win.getComputedStyle(mobileNav).display==="none",
      headerMode:!top||(mobile?win.getComputedStyle(top).position!=="sticky":win.getComputedStyle(top).position==="sticky"),
      inputFont:!mobile||minInput>=15.9,
      contentRendered:Boolean(active&&active.textContent.trim().length>20),
      viewportFit:Boolean(doc.querySelector('meta[name="viewport"]')?.content.includes("viewport-fit=cover")),
      releaseVisible:Boolean(doc.querySelector("#v90ReleaseBadge")?.textContent.includes(VERSION))
    };
    return{profile:profile?.id||"current",label:profile?.label||"دستگاه فعلی",width,height:win.innerHeight,class:profile?.class||"Current",checks,pass:Object.values(checks).every(Boolean),timestamp:new Date().toISOString()};
  }
  async function runProfile(profile){
    return new Promise(resolve=>{
      const frame=document.createElement("iframe");frame.className="v90-test-frame";frame.title=`QA ${profile.label}`;frame.width=String(profile.width);frame.height=String(profile.height);frame.style.cssText=`position:fixed;left:-12000px;top:0;width:${profile.width}px;height:${profile.height}px;border:0;opacity:.01;pointer-events:none;`;
      const timer=setTimeout(()=>{frame.remove();resolve({profile:profile.id,label:profile.label,width:profile.width,height:profile.height,class:profile.class,checks:{load:false},pass:false,error:"timeout"})},9000);
      frame.onload=()=>setTimeout(()=>{try{const doc=frame.contentDocument;if(frame.contentWindow?.go)frame.contentWindow.go("dashboard");const result=collectMetrics(doc,profile);clearTimeout(timer);frame.remove();resolve(result)}catch(error){clearTimeout(timer);frame.remove();resolve({profile:profile.id,label:profile.label,width:profile.width,height:profile.height,class:profile.class,checks:{access:false},pass:false,error:error.message})}},700);
      frame.src=`./?v=900&qa-frame=${encodeURIComponent(profile.id)}&t=${Date.now()}`;document.body.appendChild(frame);
    });
  }
  async function runMatrix(){
    const results=[];state.deviceAcceptance.lastMatrix=[];state.deviceAcceptance.lastRun=new Date().toISOString();save();render("deviceAcceptance");
    for(let i=0;i<PROFILES.length;i++){const result=await runProfile(PROFILES[i]);results.push(result);state.deviceAcceptance.lastMatrix=[...results];save();render("deviceAcceptance")}
    toast(results.every(x=>x.pass)?"ماتریس Responsive با موفقیت عبور کرد.":"حداقل یک پروفایل Responsive شکست خورد.",!results.every(x=>x.pass));
    return results;
  }
  function renderDeviceAcceptance(el){
    const current=collectMetrics(document,{id:"current",label:"دستگاه فعلی",class:navigator.platform||"Browser"});state.deviceAcceptance.current=current;save();
    const results=state.deviceAcceptance.lastMatrix||[],map=new Map(results.map(x=>[x.profile,x]));
    const currentChecks=Object.entries(current.checks);
    el.innerHTML=`<section class="v90-hub-head"><div><span>DEVICE ACCEPTANCE</span><h2>ماتریس پذیرش Responsive و Runtime</h2><p>قبولی خودکار جای تست فیزیکی آیفون و آیپد را نمی‌گیرد؛ اما سرریز، ناوبری، Header، فونت فرم و محتوای خالی را قبل از تحویل شناسایی می‌کند.</p></div><button id="v90RunMatrix">اجرای ماتریس ۹ دستگاه</button></section>
    <section class="v90-device-summary"><article><small>Viewport فعلی</small><b>${current.width}×${current.height}</b><span>${current.pass?"PASS":"FAIL"}</span></article><article><small>نسخه Runtime</small><b>v${VERSION}</b><span>${document.documentElement.dataset.release===VERSION?"PASS":"FAIL"}</span></article><article><small>PWA Controller</small><b>${navigator.serviceWorker?.controller?"فعال":"فعال نیست"}</b><span>${navigator.serviceWorker?.controller?"PASS":"CHECK"}</span></article><article><small>اجرای ماتریس</small><b>${results.length}/${PROFILES.length}</b><span>${results.length===PROFILES.length&&results.every(x=>x.pass)?"PASS":"PENDING"}</span></article></section>
    <section class="v90-card">${sectionTitle("CURRENT DEVICE","کنترل دستگاه فعلی")}<div class="v90-check-grid">${currentChecks.map(([key,value])=>`<article class="${value?"pass":"fail"}"><b>${value?"PASS":"FAIL"}</b><span>${key}</span></article>`).join("")}</div></section>
    <section class="v90-card">${sectionTitle("RESPONSIVE MATRIX","پروفایل‌های هدف",results.length?`<b>${results.filter(x=>x.pass).length}/${PROFILES.length} PASS</b>`:"<b>اجرا نشده</b>")}<div class="v90-device-table"><div class="head"><b>پروفایل</b><b>اندازه</b><b>خودکار</b><b>تأیید فیزیکی</b></div>${PROFILES.map(profile=>{const r=map.get(profile.id),manual=Boolean(state.deviceAcceptance.manual[profile.id]);return`<div><span><b>${profile.label}</b><small>${profile.class}</small></span><code>${profile.width}×${profile.height}</code><strong class="${r?.pass?"pass":r?"fail":"pending"}">${r?.pass?"PASS":r?"FAIL":"PENDING"}</strong><label><input type="checkbox" data-v90-manual="${profile.id}" ${manual?"checked":""}> مشاهده واقعی</label></div>`}).join("")}</div></section>
    <section class="v90-card">${sectionTitle("RELEASE GATE","شرط تحویل v9.0")}<ul class="v90-gate-list"><li>تمام ۹ پروفایل شبیه‌سازی‌شده PASS شوند.</li><li>iPhone و iPad واقعی با نشان v9.0.0 مشاهده و دستی تأیید شوند.</li><li>هیچ مسیر اصلی صفحه خالی تولید نکند.</li><li>داده‌های کاربر بدون Reset باقی بمانند.</li><li>Service Worker نسخه v9.0 را کنترل کند.</li></ul></section>`;
  }

  const previousRender=render;
  render=function(view){
    const el=document.getElementById(view);
    if(view==="dashboard")return renderDashboard(el);if(view==="studyHub")return renderStudyHub(el);if(view==="skillsHub")return renderSkillsHub(el);if(view==="practiceHub")return renderPracticeHub(el);if(view==="researchHub")return renderResearchHub(el);if(view==="deviceAcceptance")return renderDeviceAcceptance(el);return previousRender(view);
  };

  const previousWire=wire;
  wire=function(){
    previousWire();if(document.body.dataset.v90Wired)return;document.body.dataset.v90Wired="1";
    document.body.addEventListener("click",event=>{
      const search=event.target.closest("#v90Search");if(search){event.preventDefault();go("globalSearch");return}
      const qa=event.target.closest("#v90QA");if(qa){event.preventDefault();go("deviceAcceptance");return}
      const task=event.target.closest("[data-v90-daily]");if(task){const plan=safe(window.v83GenerateDailyPlan,null),item=plan?.tasks?.[Number(task.dataset.v90Daily)];if(item){event.preventDefault();if(typeof v83OpenDailyTask==="function")v83OpenDailyTask(item);else go(item.view||"dashboard")}return}
      if(event.target.closest("#v90RunMatrix")){event.preventDefault();runMatrix();return}
    },true);
    document.body.addEventListener("change",event=>{const input=event.target.closest("[data-v90-manual]");if(input){state.deviceAcceptance.manual[input.dataset.v90Manual]=input.checked;save();render("deviceAcceptance")}});
  };

  function updateViewport(){
    const vv=window.visualViewport;const height=vv?.height||window.innerHeight;document.documentElement.style.setProperty("--v90-vh",`${height}px`);const keyboard=(window.innerHeight-height)>150;document.documentElement.classList.toggle("v90-keyboard-open",keyboard);
  }
  async function refreshRuntime(){
    document.documentElement.dataset.release=VERSION;document.documentElement.dataset.architecture="consolidated-v90";
    updateViewport();window.visualViewport?.addEventListener("resize",updateViewport);window.addEventListener("orientationchange",()=>setTimeout(updateViewport,120));
    if("caches" in window){try{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith("lgmk-")&&key!==CACHE).map(key=>caches.delete(key)))}catch{}}
    if("serviceWorker" in navigator){try{const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.update().catch(()=>null)))}catch{}}
    try{localStorage.setItem("lgmk_runtime_release",VERSION)}catch{}
  }
  refreshRuntime();
  navigator.serviceWorker?.addEventListener("controllerchange",()=>{const key="lgmk_v900_controller_reload";if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,"1");location.reload()});
  window.LGMK_V90={version:VERSION,profiles:PROFILES,collectMetrics,runMatrix};
})();
