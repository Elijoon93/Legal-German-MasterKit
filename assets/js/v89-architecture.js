"use strict";
(function(){
  const VERSION="8.9.0";
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
    ["ساختار و ابزار",[["curriculum","ساختار دوره","CU"],["subjects","سرفصل‌ها","SJ"],["library","کتابخانه","LB"],["globalSearch","جست‌وجوی کل","GS"],["reportCenter","گزارش و داده","RP"],["progressView","پیشرفت","PG"]]]
  ];
  const META={
    dashboard:["داشبورد","کار بعدی، مسیرهای اصلی و وضعیت مطالعه"],
    studyHub:["مرکز تحصیل","درس، برنامه نیم‌سال و منابع در یک مسیر"],
    courseWorkspace:["کارگاه درس","مسیر هشت‌مرحله‌ای هر درس"],
    deepLessons:["درس‌های عمیق","واحدهای واقعی با خروجی اجباری"],
    planner:["برنامه ترم","نقشه ۱۲ هفته‌ای متناسب با زمان مطالعه"],
    semesterOps:["تقویم نیم‌سال","کلاس، آزمون، ارائه و مهلت تحویل"],
    curriculum:["ساختار دوره","الزامات LL.M. و نقشه پیشنهادی"],
    subjects:["سرفصل‌ها","اهداف، قوانین و تمرین هر درس"],
    library:["کتابخانه","کتاب‌ها و منابع درس‌محور"],
    skillsHub:["مرکز یادگیری","چهار مهارت و بانک زبان حقوقی"],
    language:["واژگان و جمله","اصطلاحات، Collocation و قالب‌های دانشگاهی"],
    reading:["خواندن","متون حقوقی سطح‌بندی‌شده"],
    listening:["شنیدن","فهم شنیداری و Transcript کنترل‌شده"],
    speaking:["گفتار","ارائه، استدلال و تمرین شفاهی"],
    writing:["نگارش","Gutachtenstil و نوشتار دانشگاهی"],
    reviewCenter:["مرور هوشمند","مرور فاصله‌دار اصطلاحات"],
    practiceHub:["مرکز تمرین","پرونده، آزمون و شواهد حقوقی"],
    caseLab:["حل پرونده","Sachverhalt تا Ergebnis"],
    exam:["آزمون‌ها","ارزیابی تفکیک‌شده هر درس"],
    legalEvidence:["بانک مواد","قاعده، عناصر آزمون و منبع رسمی"],
    caseBriefs:["Case Brief","رأی، Ratio و اهمیت علمی"],
    adaptive:["تحلیل ضعف","اولویت مطالعه بر اساس عملکرد واقعی"],
    researchHub:["مرکز پژوهش","منبع، استناد، نسخه و تحویل دانشگاهی"],
    research:["گردش‌کار پژوهش","Seminararbeit و Magisterarbeit"],
    sourceMatrix:["ماتریس منابع","اتصال هر ادعا به منبع قابل کنترل"],
    referenceImport:["ورود منابع","BibTeX و RIS با کنترل تکرار"],
    citationBuilder:["ساخت ارجاع","پیش‌نویس Fußnote و Literaturverzeichnis"],
    citationAudit:["ممیزی استناد","کنترل ادعا، منبع و کتابنامه"],
    submissionPackage:["پرونده تحویل","Gateهای اجباری و تاریخچه نسخه"],
    globalSearch:["جست‌وجوی کل","دسترسی مستقیم به تمام محتوای برنامه"],
    reportCenter:["گزارش و داده","چاپ، پشتیبان و انتقال اطلاعات"],
    progressView:["پیشرفت","شاخص‌های ثبت‌شده مطالعه"]
  };

  const ensureResearchHub=()=>{
    const main=document.querySelector("main.app-shell");
    if(main&&!document.getElementById("researchHub")){
      const section=document.createElement("section");section.id="researchHub";section.className="view";main.appendChild(section);
    }
  };
  const safe=(fn,fallback)=>{try{return typeof fn==="function"?fn():fallback}catch{return fallback}};
  const countTrue=obj=>Object.values(obj||{}).filter(Boolean).length;
  const average=obj=>{const rows=Object.values(obj||{}).map(Number).filter(Number.isFinite);return rows.length?Math.round(rows.reduce((a,b)=>a+b,0)/rows.length):0};
  const routeButton=([view,label,code])=>`<button type="button" data-view="${view}"><span>${code}</span><b>${label}</b></button>`;
  const hubCard=(view,code,title,desc,metric="")=>`<button class="v89-module" data-view="${view}"><span>${code}</span><div><b>${title}</b><p>${desc}</p></div>${metric?`<em>${metric}</em>`:""}</button>`;
  const sectionTitle=(kicker,title,action="")=>`<div class="v89-section-title"><div><span>${kicker}</span><h2>${title}</h2></div>${action}</div>`;
  const progressBar=value=>`<div class="v89-progress"><i style="width:${Math.max(0,Math.min(100,Number(value)||0))}%"></i></div>`;

  const previousBuild=buildNav;
  buildNav=function(){
    ensureResearchHub();
    previousBuild();
    const nav=document.querySelector("#mainNav"),top=document.querySelector(".topbar");
    if(!nav)return;
    nav.innerHTML=`<div class="v84-desktop-nav v89-sidebar"><div class="v89-brand"><div>§</div><span><b>Legal German</b><small>MasterKit · v${VERSION}</small></span></div><div class="v89-nav-groups">${GROUPS.map(([title,items])=>`<section><h4>${title}</h4>${items.map(routeButton).join("")}</section>`).join("")}</div><footer><b>${esc(state.profile?.name||"دانشجو")}</b><span>${esc(state.profile?.level||"B2")} · ${esc(state.profile?.semester||"")}</span></footer></div><div class="v84-mobile-nav v89-mobile-nav">${PRIMARY.map(routeButton).join("")}</div>`;
    nav.onclick=event=>{const button=event.target.closest("button[data-view]");if(button)go(button.dataset.view)};
    if(top){
      top.innerHTML=`<div class="v89-title"><span class="v89-kicker">LL.M. OEC. · JENA</span><h1>داشبورد</h1><p>کار بعدی، مسیرهای اصلی و وضعیت مطالعه</p></div><div class="v89-top-actions"><button id="v89Search" type="button">جست‌وجو</button><span class="v89-profile">${esc(state.profile?.level||"B2")}</span><button id="installBtn" type="button" hidden>نصب</button></div>`;
    }
  };

  go=function(view){
    ensureResearchHub();
    const target=document.getElementById(view)?view:"dashboard";
    state.view=target;save();
    document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id===target));
    document.querySelectorAll("#mainNav [data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===target));
    const meta=META[target]||[target,""];const title=document.querySelector(".v89-title");
    if(title)title.innerHTML=`<span class="v89-kicker">LL.M. OEC. · JENA</span><h1>${meta[0]}</h1><p>${meta[1]}</p>`;
    render(target);window.scrollTo({top:0,left:0,behavior:"auto"});
  };

  function renderDashboardV89(el){
    const daily=safe(window.v83GenerateDailyPlan,null),done=daily?state.dailyDone?.[daily.date]||{}:{},next=daily?.tasks?.find(task=>!done[task.id]);
    const course=typeof v85CourseById==="function"?v85CourseById(state.courseWorkspace?.selected):DATA.courses?.[0];
    const courseProgress=course&&typeof v85CourseProgress==="function"?v85CourseProgress(course.id):{percent:0,done:0,total:8};
    const review=safe(window.v83ReviewStats,{due:0,mature:0,retention:0}),weak=safe(window.v83Weaknesses,[]),submission=typeof v88ChecklistStatus==="function"?v88ChecklistStatus():{requiredDone:0,required:12,ready:false};
    const todayTasks=daily?.tasks?.slice(0,5)||[];
    el.innerHTML=`<section class="v89-welcome"><div><span>GUTEN TAG, ${esc(state.profile?.name||"دانشجو")}</span><h2>${next?"کار بعدی شما مشخص است":"برنامه امروز تکمیل شده است"}</h2><p>${next?`${next.title} · ${next.minutes} دقیقه`:"برای ادامه، یک مسیر اصلی را انتخاب کنید."}</p><div class="v89-hero-actions"><button ${next?`data-v89-daily="${daily.tasks.indexOf(next)}"`:`data-view="studyHub"`}>${next?"شروع فعالیت":"باز کردن مرکز تحصیل"}</button><button class="secondary" data-view="globalSearch">جست‌وجوی محتوا</button></div></div><aside><div class="v89-ring" style="--p:${percent()}"><span>${percent()}%</span></div><small>پیشرفت ثبت‌شده</small></aside></section>
    <section class="v89-quick">${hubCard("courseWorkspace","CW","ادامه درس",course?.title||"درس منتخب",`${courseProgress.percent}%`)}${hubCard("reviewCenter","RV","مرور امروز",`${review.due} اصطلاح سررسیدشده`,`${review.retention||0}%`)}${hubCard("deepLessons","DL","درس عمیق","واحدهای دارای خروجی اجباری",`${safe(()=>v88LessonProgress(course?.id),{done:0,total:3}).done}/3`)}${hubCard("submissionPackage","SB","پرونده تحویل",submission.ready?"Gateهای اجباری کامل‌اند":"نیازمند تکمیل Gateها",`${submission.requiredDone}/${submission.required}`)}</section>
    <section class="v89-dashboard-grid"><article class="v89-card">${sectionTitle("TODAY","برنامه امروز",`<b>${countTrue(done)}/${daily?.tasks?.length||0}</b>`)}<div class="v89-agenda">${todayTasks.map((task,index)=>`<button data-v89-daily="${index}" class="${done[task.id]?"done":""}"><i>${String(index+1).padStart(2,"0")}</i><span><b>${task.title}</b><small>${task.reason} · ${task.minutes} دقیقه</small></span><em>${done[task.id]?"انجام شد":"شروع"}</em></button>`).join("")||"<p class='muted'>برنامه روزانه هنوز تولید نشده است.</p>"}</div></article><aside class="v89-stack"><article class="v89-card">${sectionTitle("COURSE IN FOCUS","درس فعال",`<button data-view="courseWorkspace">باز کردن</button>`)}<h3>${course?.title||"درس انتخاب نشده"}</h3>${progressBar(courseProgress.percent)}<p>${courseProgress.done}/${courseProgress.total} مرحله تکمیل شده است.</p></article><article class="v89-card">${sectionTitle("PRIORITY","اولویت علمی",`<button data-view="adaptive">تحلیل</button>`)}${weak[0]?`<h3>${weak[0].subject}</h3>${progressBar(weak[0].score)}<p>امتیاز ترکیبی ${weak[0].score}%</p>`:"<p class='muted'>هنوز داده کافی برای تحلیل ضعف وجود ندارد.</p>"}</article></aside></section>
    <section class="v89-card">${sectionTitle("LEARNING HUBS","مسیرهای اصلی")}<div class="v89-hub-grid">${hubCard("studyHub","ST","تحصیل","درس، برنامه ترم و منابع")}${hubCard("skillsHub","LG","یادگیری","چهار مهارت و بانک زبان")}${hubCard("practiceHub","PR","تمرین","پرونده، آزمون و مواد")}${hubCard("researchHub","RS","پژوهش","منبع، استناد و تحویل")}</div></section>`;
  }

  function renderStudyHubV89(el){
    const course=typeof v85CourseById==="function"?v85CourseById(state.courseWorkspace?.selected):DATA.courses?.[0],p=course&&typeof v85CourseProgress==="function"?v85CourseProgress(course.id):{percent:0};
    el.innerHTML=`<section class="v89-hub-head"><div><span>STUDY HUB</span><h2>از انتخاب درس تا خروجی نیم‌سال</h2><p>هر مرحله فقط یک هدف روشن دارد: انتخاب، مطالعه، تمرین و ثبت خروجی.</p></div><button data-view="courseWorkspace">ادامه ${course?.title||"درس"}</button></section><section class="v89-hub-grid">${hubCard("courseWorkspace","CW","کارگاه درس","هشت مرحله متصل برای هر درس",`${p.percent}%`)}${hubCard("deepLessons","DL","درس‌های عمیق","سه واحد واقعی برای هر درس","30 واحد")}${hubCard("planner","PL","برنامه ترم","نقشه ۱۲ هفته‌ای شخصی")}${hubCard("semesterOps","SC","تقویم نیم‌سال","کلاس، آزمون و مهلت")}${hubCard("subjects","SJ","سرفصل‌ها","اهداف و قوانین هر درس",`${DATA.courses?.length||0} درس`)}${hubCard("library","LB","کتابخانه","منابع و ترتیب مطالعه",`${DATA.books?.length||0} کتاب`)}</section><section class="v89-card">${sectionTitle("STUDY FLOW","ترتیب کار پیشنهادی")}<div class="v89-flow"><article><i>01</i><b>درس را انتخاب کنید</b><p>هدف و مواد اصلی را مشخص کنید.</p></article><article><i>02</i><b>یک واحد عمیق بخوانید</b><p>یادداشت و پاسخ اجباری ثبت کنید.</p></article><article><i>03</i><b>پرونده و آزمون انجام دهید</b><p>ضعف واقعی را شناسایی کنید.</p></article><article><i>04</i><b>خروجی دانشگاهی بسازید</b><p>نگارش، منبع و نسخه را ثبت کنید.</p></article></div></section>`;
  }

  function renderSkillsHubV89(el){
    const scores={reading:average(state.readingScores),listening:average(state.listeningScores),speaking:average(state.speakingScores),writing:average(state.writingScores)};
    el.innerHTML=`<section class="v89-hub-head"><div><span>LEGAL LANGUAGE</span><h2>چهار مهارت، یک جریان یادگیری</h2><p>ورودی زبانی باید به استدلال حقوقی و خروجی دانشگاهی منتهی شود.</p></div><button data-view="reviewCenter">مرور امروز</button></section><section class="v89-skill-grid">${hubCard("reading","RD","خواندن","متن، کلیدواژه و درک مطلب",`${scores.reading}%`)}${hubCard("listening","LS","شنیدن","صوت، Transcript و سؤال",`${scores.listening}%`)}${hubCard("speaking","SP","گفتار","ارائه و استدلال شفاهی",`${scores.speaking}%`)}${hubCard("writing","WR","نگارش","Gutachtenstil و متن دانشگاهی",`${scores.writing}%`)}</section><section class="v89-dashboard-grid"><article class="v89-card">${sectionTitle("LANGUAGE BANK","بانک زبان")}<div class="v89-link-list">${hubCard("language","LX","واژگان حقوقی","معنی، مثال، Collocation و قانون",`${DATA.vocab?.length||0}`)}${hubCard("language","ST","قالب‌های جمله","Obersatz، Subsumtion و نتیجه",`${DATA.sentences?.length||0}`)}${hubCard("reviewCenter","RV","مرور فاصله‌دار","صف روزانه بر اساس سررسید")}</div></article><article class="v89-card">${sectionTitle("SESSION FLOW","الگوی هر جلسه")}<ol class="v89-session"><li><b>۵ واژه</b><span>فعال‌سازی زبان موضوع</span></li><li><b>یک متن یا صوت</b><span>دریافت ورودی معتبر</span></li><li><b>یک پاسخ</b><span>گفتاری یا نوشتاری</span></li><li><b>ثبت بازخورد</b><span>انتقال نتیجه به مسیر تطبیقی</span></li></ol></article></section>`;
  }

  function renderPracticeHubV89(el){
    const caseDone=Object.keys(state.caseScores||{}).length,examDone=Object.keys(state.examByCourse||{}).length,normReviewed=countTrue(state.legalEvidence?.reviewed),briefDone=countTrue(state.caseBriefs?.completed);
    el.innerHTML=`<section class="v89-hub-head"><div><span>PRACTICE HUB</span><h2>از قاعده تا حل مسئله</h2><p>پرونده، آزمون، ماده و رأی در یک مسیر عملی قرار گرفته‌اند.</p></div><button data-view="caseLab">شروع پرونده</button></section><section class="v89-hub-grid">${hubCard("caseLab","CA","حل پرونده","Sachverhalt تا Ergebnis",`${caseDone} ثبت`)}${hubCard("exam","EX","آزمون درس","سؤال و تحلیل خطا",`${examDone} درس`)}${hubCard("legalEvidence","NV","بانک مواد","قاعده، عناصر و منبع رسمی",`${normReviewed} مرور`)}${hubCard("caseBriefs","CB","Case Brief","رأی، Ratio و اهمیت",`${briefDone} کامل`)}${hubCard("adaptive","AN","تحلیل ضعف","ترکیب عملکرد همه فعالیت‌ها")}${hubCard("courseWorkspace","CW","بازگشت به درس","اتصال تمرین به مسیر درس")}</section>`;
  }

  function renderResearchHubV89(el){
    const sources=state.sourceMatrix?.length||0,audit=state.citationAudit?.last,submission=typeof v88ChecklistStatus==="function"?v88ChecklistStatus():{requiredDone:0,required:12,ready:false},versions=state.submissionPackage?.versions?.length||0;
    el.innerHTML=`<section class="v89-hub-head"><div><span>RESEARCH HUB</span><h2>از پرسش پژوهش تا پرونده تحویل</h2><p>منبع، ارجاع، ممیزی، نسخه و Gateهای تحویل در یک جریان روشن قرار دارند.</p></div><button data-view="submissionPackage">پرونده تحویل</button></section><section class="v89-quick">${hubCard("sourceMatrix","SM","منابع",`${sources} منبع ثبت‌شده`)}${hubCard("citationAudit","QA","آخرین ممیزی",audit?`امتیاز ${audit.score}`:"هنوز اجرا نشده")}${hubCard("submissionPackage","SB","Gateهای تحویل",submission.ready?"آماده":"نیازمند تکمیل",`${submission.requiredDone}/${submission.required}`)}${hubCard("submissionPackage","VS","نسخه‌ها",`${versions} Snapshot`)}</section><section class="v89-hub-grid">${hubCard("research","WF","گردش‌کار پژوهش","موضوع، سؤال و مراحل کار")}${hubCard("sourceMatrix","SM","ماتریس ادعا–منبع","هر ادعا به یک منبع متصل شود")}${hubCard("referenceImport","IM","ورود منابع","BibTeX و RIS")}${hubCard("citationBuilder","CT","Citation Builder","پیش‌نویس Fußnote و کتابنامه")}${hubCard("citationAudit","QA","ممیزی استناد","خطا، هشدار و تطابق منابع")}${hubCard("submissionPackage","SB","پرونده تحویل","Formalien، نسخه‌ها و Gateها")}</section><section class="v89-card">${sectionTitle("SUBMISSION FLOW","مسیر تحویل علمی")}<div class="v89-flow"><article><i>01</i><b>پرسش و ساختار</b><p>موضوع، سؤال و Gliederung را قطعی کنید.</p></article><article><i>02</i><b>منبع و ادعا</b><p>هر بند را به منبع و صفحه وصل کنید.</p></article><article><i>03</i><b>ممیزی و نسخه</b><p>خطاها را رفع و Snapshot ثبت کنید.</p></article><article><i>04</i><b>Gate تحویل</b><p>Formalien و دستور کرسی را کنترل کنید.</p></article></div></section>`;
  }

  const previousRender=render;
  render=function(view){
    const el=document.getElementById(view);
    if(view==="dashboard")return renderDashboardV89(el);
    if(view==="studyHub")return renderStudyHubV89(el);
    if(view==="skillsHub")return renderSkillsHubV89(el);
    if(view==="practiceHub")return renderPracticeHubV89(el);
    if(view==="researchHub")return renderResearchHubV89(el);
    return previousRender(view);
  };

  const previousWire=wire;
  wire=function(){
    previousWire();
    document.body.addEventListener("click",event=>{
      const search=event.target.closest("#v89Search");if(search){event.preventDefault();go("globalSearch");return}
      const task=event.target.closest("[data-v89-daily]");if(task){const plan=safe(window.v83GenerateDailyPlan,null),item=plan?.tasks?.[Number(task.dataset.v89Daily)];if(item){event.preventDefault();if(typeof v83OpenDailyTask==="function")v83OpenDailyTask(item);else go(item.view||"dashboard")}}
    },true);
  };

  document.documentElement.dataset.architecture="pflege-inspired-v89";
})();
