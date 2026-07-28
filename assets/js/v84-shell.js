"use strict";
(function(){
  const V84_VERSION="8.4";
  const V84_VIEWS=["dashboard","studyHub","skillsHub","practiceHub","planner","adaptive","reviewCenter","curriculum","subjects","library","language","reading","listening","speaking","writing","research","caseLab","exam","reportCenter"];
  const META={
    dashboard:["داشبورد","نمای کلی مطالعه و کار بعدی"],studyHub:["مرکز تحصیل","برنامه، سرفصل، کتاب و مسیر نیم‌سال"],skillsHub:["آکادمی زبان حقوقی","چهار مهارت و بانک زبان در یک مسیر"],practiceHub:["مرکز تمرین","پرونده، آزمون و مرور هوشمند"],planner:["برنامه ترم","برنامه ۱۲ هفته‌ای شخصی"],adaptive:["مسیر تطبیقی","اولویت‌ها بر اساس ضعف واقعی"],reviewCenter:["مرور هوشمند","مرور فاصله‌دار اصطلاحات حقوقی"],curriculum:["ساختار LL.M.","الزامات دوره و نقشه پیشنهادی"],subjects:["سرفصل دروس","درس‌ها، قوانین و خروجی‌های یادگیری"],library:["کتاب و منابع","کتابخانه درس‌محور و منابع رسمی"],language:["زبان حقوقی","اصطلاحات و قالب‌های جمله"],reading:["خواندن","تحلیل متون حقوقی سطح‌بندی‌شده"],listening:["شنیدن","درک شنیداری و Transcript کنترل‌شده"],speaking:["گفتار","تمرین ارائه و استدلال شفاهی"],writing:["نگارش","Gutachtenstil، Seminararbeit و Exposé"],research:["پژوهش","گردش‌کار Seminararbeit و Magisterarbeit"],caseLab:["پرونده","حل ساختاری پرونده‌های حقوقی"],exam:["آزمون‌ها","آزمون تفکیک‌شده هر درس"],reportCenter:["گزارش و داده","گزارش، پشتیبان و انتقال داده"]
  };
  const GROUPS=[
    ["خانه",[["dashboard","خانه","DB"]]],
    ["تحصیل",[["studyHub","مرکز تحصیل","ST"],["planner","برنامه ترم","PL"],["curriculum","ساختار دوره","CU"],["subjects","سرفصل دروس","SJ"],["library","کتاب و منابع","LB"]]],
    ["یادگیری",[["skillsHub","آکادمی زبان","AC"],["language","زبان حقوقی","LX"],["reviewCenter","مرور هوشمند","SR"]]],
    ["چهار مهارت",[["reading","خواندن","RD"],["listening","شنیدن","LS"],["speaking","گفتار","SP"],["writing","نگارش","WR"]]],
    ["تمرین و پژوهش",[["practiceHub","مرکز تمرین","PR"],["caseLab","پرونده","FL"],["exam","آزمون‌ها","EX"],["research","پژوهش","RS"],["adaptive","مسیر تطبیقی","AD"],["reportCenter","گزارش و داده","RP"]]]
  ];

  function ensureV84Sections(){
    const main=document.querySelector("main.app-shell");
    ["studyHub","skillsHub","practiceHub"].forEach(id=>{if(!document.getElementById(id)){const s=document.createElement("section");s.id=id;s.className="view";main.appendChild(s)}});
  }
  function safeWeak(){try{return typeof v83Weaknesses==="function"?v83Weaknesses():[]}catch{return []}}
  function safeDaily(){try{return typeof v83GenerateDailyPlan==="function"?v83GenerateDailyPlan():null}catch{return null}}
  function trueCount(obj){return Object.keys(obj||{}).filter(k=>obj[k]).length}
  function avg(obj){const a=Object.values(obj||{}).map(Number).filter(Number.isFinite);return a.length?Math.round(a.reduce((s,x)=>s+x,0)/a.length):0}
  function cardProgress(label,value,total,view,sub){const p=total?Math.round(value/total*100):0;return `<article class="v84-stat"><header><span>${label}</span><b>${value}/${total}</b></header><div class="v84-progress"><i style="width:${Math.min(100,p)}%"></i></div><p>${sub||`${p}% تکمیل`}</p><button data-view="${view}">ادامه</button></article>`}
  function navButton([view,label,code]){return `<button type="button" data-view="${view}"><span>${code}</span><b>${label}</b></button>`}
  function closeMore(){document.querySelector("#v84More")?.classList.remove("open");document.body.classList.remove("v84-lock")}

  ensureV84Sections();
  NAV.splice(0,NAV.length,...V84_VIEWS.map(v=>[v,(META[v]?.[0]||v).slice(0,2),META[v]?.[0]||v]));

  buildNav=function(){
    ensureV84Sections();
    const nav=document.querySelector("#mainNav"),main=document.querySelector("main.app-shell"),top=document.querySelector(".topbar"),error=document.querySelector("#bootError");
    if(!document.querySelector(".v84-layout")){
      const layout=document.createElement("div"),content=document.createElement("div");layout.className="v84-layout";content.className="v84-content";
      nav.parentNode.insertBefore(layout,nav);layout.append(nav,content);content.append(top,error,main);
    }
    nav.innerHTML=`<div class="v84-desktop-nav"><div class="v84-brand"><div>§</div><span><b>Legal German</b><small>MasterKit · ${V84_VERSION}</small></span></div>${GROUPS.map(([title,items])=>`<section><h4>${title}</h4>${items.map(navButton).join("")}</section>`).join("")}<footer><b>${esc(state.profile?.name||"سهیل")}</b><span>${esc(state.profile?.level||"B2")} · ${esc(state.profile?.semester||"")}</span></footer></div><div class="v84-mobile-nav">${[["dashboard","خانه","⌂"],["studyHub","تحصیل","▣"],["skillsHub","یادگیری","A"],["practiceHub","تمرین","§"]].map(navButton).join("")}<button type="button" data-v84-more><span>•••</span><b>بیشتر</b></button></div><div id="v84More" class="v84-more"><header><b>همه بخش‌ها</b><button type="button" data-v84-close>×</button></header>${GROUPS.slice(1).map(([title,items])=>`<section><h4>${title}</h4>${items.map(navButton).join("")}</section>`).join("")}</div>`;
    nav.onclick=e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.view){closeMore();go(b.dataset.view)}if(b.hasAttribute("data-v84-more")){document.querySelector("#v84More").classList.add("open");document.body.classList.add("v84-lock")}if(b.hasAttribute("data-v84-close"))closeMore()};
    const install=document.querySelector("#installBtn");if(install)install.textContent="نصب برنامه";
  };

  go=function(view){
    ensureV84Sections();const target=V84_VIEWS.includes(view)?view:"dashboard";state.view=target;save();
    document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id===target));
    document.querySelectorAll("#mainNav [data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===target));
    const [title,sub]=META[target]||[target,""];const top=document.querySelector(".topbar");
    if(top)top.querySelector("div").innerHTML=`<span class="v84-kicker">LL.M. OEC. · JENA</span><h1>${title}</h1><p>${sub}</p>`;
    render(target);window.scrollTo({top:0,behavior:"smooth"});
  };

  function renderStudyHub(el){
    const completed=trueCount(state.completed),req=DATA.officialRequirements||[],courses=DATA.courses||[];
    el.innerHTML=`<section class="v84-hero"><div><span>STUDIUM ORGANIZER</span><h2>نقشه تحصیل، نه فهرست منوها</h2><p>همه اجزای دانشگاه در چهار جریان روشن سازمان‌دهی شده‌اند: برنامه نیم‌سال، دروس، منابع و خروجی‌های قابل تحویل.</p></div><button data-view="planner">باز کردن برنامه ترم</button></section><div class="v84-grid four">${cardProgress("دروس مطالعه‌شده",completed,courses.length,"subjects")}${cardProgress("الزامات دوره",req.length,req.length,"curriculum","ساختار رسمی قابل مشاهده")}${cardProgress("کتاب‌های منتخب",DATA.books.length,DATA.books.length,"library","کتابخانه درس‌محور")}${cardProgress("مراحل پژوهش",trueCount(state.researchDone),DATA.researchSteps.length,"research")}</div><section class="v84-panel"><div class="v84-section-head"><div><span>مسیر پیشنهادی</span><h3>از نیم‌سال تا خروجی دانشگاهی</h3></div></div><div class="v84-step-grid"><button data-view="curriculum"><i>01</i><b>ساختار دوره</b><span>الزامات، SWS، سمینار و کارآموزی</span></button><button data-view="subjects"><i>02</i><b>دروس و سرفصل‌ها</b><span>اهداف، قوانین، کتاب و تمرین هر درس</span></button><button data-view="planner"><i>03</i><b>برنامه شخصی</b><span>تقسیم ۱۲ هفته‌ای بر اساس زمان واقعی</span></button><button data-view="research"><i>04</i><b>خروجی دانشگاهی</b><span>Seminararbeit، ارائه و Magisterarbeit</span></button></div></section><section class="v84-panel"><div class="v84-section-head"><div><span>SEMESTER MAP</span><h3>چهار نیم‌سال</h3></div><button data-view="curriculum">جزئیات کامل</button></div><div class="v84-semesters">${DATA.programme.map((s,i)=>`<article><small>SEMESTER ${i+1}</small><h4>${s.title}</h4><p>${s.courses.slice(0,3).join(" · ")}</p><b>${s.outputs[0]||"خروجی آموزشی"}</b></article>`).join("")}</div></section>`;
  }

  function skillCard(title,de,view,score,desc){return `<button class="v84-skill" data-view="${view}"><span>${de}</span><strong>${title}</strong><p>${desc}</p><footer><i style="--p:${score}"></i><b>${score}%</b></footer></button>`}
  function renderSkillsHub(el){
    const rs=avg(state.readingScores),ls=avg(state.listeningScores),ss=avg(state.speakingScores),ws=avg(state.writingScores),review=typeof v83ReviewStats==="function"?v83ReviewStats():{due:0};
    el.innerHTML=`<section class="v84-hero"><div><span>LEGAL LANGUAGE ACADEMY</span><h2>چهار مهارت در یک جریان یادگیری</h2><p>هر مهارت به متن، واژگان، پرونده و نگارش متصل است؛ فعالیت‌ها دیگر جزیره‌ای نمایش داده نمی‌شوند.</p></div><button data-view="reviewCenter">${review.due} مرور سررسیدشده</button></section><div class="v84-skill-grid">${skillCard("خواندن","LESEN","reading",rs,"متن حقوقی، کلیدواژه و درک مطلب")}${skillCard("شنیدن","HÖREN","listening",ls,"پخش کنترل‌شده و Transcript")}${skillCard("گفتار","SPRECHEN","speaking",ss,"ارائه، استدلال و بازخورد")}${skillCard("نگارش","SCHREIBEN","writing",ws,"Gutachtenstil و نگارش دانشگاهی")}</div><section class="v84-two"><div class="v84-panel"><div class="v84-section-head"><div><span>LANGUAGE SYSTEM</span><h3>بانک زبان و مرور</h3></div></div><div class="v84-action-list"><button data-view="language"><b>${DATA.vocab.length} اصطلاح حقوقی</b><span>تعریف، مثال، Collocation و قانون مرتبط</span></button><button data-view="language"><b>${DATA.sentences.length} قالب جمله</b><span>Obersatz، Subsumtion، نتیجه و پژوهش</span></button><button data-view="reviewCenter"><b>مرور فاصله‌دار</b><span>صف روزانه بر اساس زمان سررسید</span></button></div></div><div class="v84-panel"><div class="v84-section-head"><div><span>LEARNING FLOW</span><h3>ترتیب پیشنهادی هر جلسه</h3></div></div><ol class="v84-flow"><li><b>واژه</b><span>۵ اصطلاح مرتبط با موضوع</span></li><li><b>ورودی</b><span>یک متن یا فایل شنیداری</span></li><li><b>کاربرد</b><span>پاسخ شفاهی یا نگارشی</span></li><li><b>بازخورد</b><span>ثبت امتیاز و انتقال به مسیر تطبیقی</span></li></ol></div></section>`;
  }

  function renderPracticeHub(el){
    const weak=safeWeak(),first=weak[0],caseDone=Object.keys(state.caseScores||{}).length,examDone=Object.keys(state.examByCourse||{}).length;
    el.innerHTML=`<section class="v84-hero"><div><span>PRACTICE CENTER</span><h2>تمرین مبتنی بر ضعف، نه انتخاب تصادفی</h2><p>${first?`اولویت فعلی: ${first.subject} با امتیاز ${first.score}٪.`:"برای تولید اولویت، یک آزمون یا متن را انجام دهید."}</p></div><button data-view="adaptive">مشاهده تحلیل ضعف</button></section><div class="v84-grid three">${cardProgress("پرونده‌ها",caseDone,DATA.cases.length,"caseLab")}${cardProgress("آزمون‌های درسی",examDone,Object.keys(DATA.exams).length,"exam")}${cardProgress("مرور اصطلاحات",Object.keys(state.srs||{}).length,DATA.vocab.length,"reviewCenter")}</div><section class="v84-panel"><div class="v84-section-head"><div><span>QUICK PRACTICE</span><h3>شروع سریع</h3></div></div><div class="v84-practice-actions"><button data-view="caseLab"><span>FALL</span><b>حل پرونده</b><small>ساختار Obersatz تا Ergebnis</small></button><button data-view="exam"><span>TEST</span><b>آزمون درس</b><small>تحلیل پاسخ غلط و ضعف موضوعی</small></button><button data-view="writing"><span>TEXT</span><b>نگارش</b><small>ثبت نسخه و مقایسه پیشرفت</small></button><button data-view="reviewCenter"><span>SRS</span><b>مرور هوشمند</b><small>فاصله‌گذاری بر اساس کیفیت یادآوری</small></button></div></section>`;
  }

  const baseRender=render;
  render=function(view){const el=document.getElementById(view);if(view==="studyHub")return renderStudyHub(el);if(view==="skillsHub")return renderSkillsHub(el);if(view==="practiceHub")return renderPracticeHub(el);return baseRender(view)};

  renderDashboard=function(el){
    const daily=safeDaily(),done=daily?state.dailyDone?.[daily.date]||{}:{},doneN=Object.values(done).filter(Boolean).length,total=daily?.tasks?.length||0,weak=safeWeak(),next=daily?.tasks?.find(t=>!done[t.id]),review=typeof v83ReviewStats==="function"?v83ReviewStats():{due:0,mature:0,retention:0};
    el.innerHTML=`<section class="v84-welcome"><div><span>GUTEN TAG, ${esc(state.profile?.name||"سهیل")}</span><h2>امروز روی چه چیزی باید کار کنید؟</h2><p>${next?`کار بعدی: ${next.title}`:"برنامه امروز تکمیل شده است."}</p><div><button data-view="${next?.view||"studyHub"}">${next?"شروع کار بعدی":"مرور مسیر تحصیل"}</button><button class="secondary" data-view="adaptive">چرا این فعالیت؟</button></div></div><aside><div class="v84-ring" style="--p:${percent()}"><span>${percent()}%</span></div><small>پیشرفت ثبت‌شده</small></aside></section><div class="v84-dashboard"><section class="v84-panel v84-agenda"><div class="v84-section-head"><div><span>TODAY</span><h3>برنامه امروز</h3></div><b>${doneN}/${total}</b></div>${daily?.tasks?.map((t,i)=>`<button data-view="${t.view}" class="${done[t.id]?"done":""}"><i>${String(i+1).padStart(2,"0")}</i><span><b>${t.title}</b><small>${t.reason} · ${t.minutes} دقیقه</small></span><em>${done[t.id]?"انجام شد":"شروع"}</em></button>`).join("")||"<p>برنامه روزانه هنوز تولید نشده است.</p>"}</section><aside class="v84-stack"><section class="v84-panel"><div class="v84-section-head"><div><span>SMART REVIEW</span><h3>مرور اصطلاحات</h3></div></div><div class="v84-review-metric"><b>${review.due}</b><span>سررسید امروز</span></div><p>${review.mature} اصطلاح بالغ · نگهداشت ${review.retention}%</p><button data-view="reviewCenter">شروع مرور</button></section><section class="v84-panel"><div class="v84-section-head"><div><span>WEAKEST AREA</span><h3>اولویت علمی</h3></div></div>${weak[0]?`<b class="v84-weak-title">${weak[0].subject}</b><div class="v84-progress"><i style="width:${weak[0].score}%"></i></div><p>امتیاز ترکیبی ${weak[0].score}%</p>`:"<p>هنوز داده کافی وجود ندارد.</p>"}<button data-view="adaptive">تحلیل کامل</button></section></aside></div><section class="v84-panel"><div class="v84-section-head"><div><span>QUICK ACCESS</span><h3>دسترسی سریع</h3></div></div><div class="v84-quick"><button data-view="studyHub"><span>ST</span><b>مرکز تحصیل</b><small>نیم‌سال، درس و کتاب</small></button><button data-view="skillsHub"><span>AC</span><b>آکادمی زبان</b><small>چهار مهارت یکپارچه</small></button><button data-view="practiceHub"><span>PR</span><b>مرکز تمرین</b><small>پرونده و آزمون</small></button><button data-view="research"><span>RS</span><b>پژوهش</b><small>سمینار و پایان‌نامه</small></button></div></section>`;
  };

  const oldWire=wire;
  wire=function(){oldWire();document.body.addEventListener("click",e=>{if(e.target.closest(".v84-more")&&!e.target.closest("button"))return;const b=e.target.closest("[data-view]");if(b&&b.closest("main")){e.preventDefault();go(b.dataset.view)}})};
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMore()});
})();
