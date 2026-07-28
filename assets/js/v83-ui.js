"use strict";

function v83Metric(label,value,sub=""){
  return `<article><small>${label}</small><strong>${value}</strong>${sub?`<p>${sub}</p>`:""}</article>`;
}
function v83ScoreClass(score){return score>=75?"good":score>=55?"mid":"weak"}

renderDashboard=function(el){
  const review=v83ReviewStats(),daily=v83DailyCompletion(),weak=v83Weaknesses(),lowest=weak[0],plan=v83GenerateDailyPlan();
  el.innerHTML=`<section class="v82-head v83-hero"><div><span>ADAPTIVE LEGAL LEARNING · 8.3</span><h2>مرکز عملیات هوشمند تحصیل حقوق</h2><p>مرور فاصله‌دار، برنامه روزانه مبتنی بر ضعف، تحلیل آزمون و نسخه‌بندی نگارش.</p></div><div class="v83-hero-actions"><button class="btn" data-open="adaptive">برنامه امروز</button><button class="btn secondary" data-open="reviewCenter">مرور واژگان</button></div></section>
  <section class="v83-metrics">${v83Metric("پیشرفت واقعی",`${percent()}%`,"بر پایه فعالیت و نمره")}${v83Metric("مرور سررسید",review.due,"اصطلاح")}${v83Metric("تکالیف امروز",`${daily.done}/${daily.total}`,`${plan.tasks.reduce((s,t)=>s+t.minutes,0)} دقیقه`)}${v83Metric("حوزه نیازمند تقویت",lowest?.score!=null?`${lowest.score}%`:"—",lowest?.subject||"")}</section>
  <section class="v83-dashboard-grid"><div class="panel"><div class="v83-title-row"><div><small>DAILY EXECUTION</small><h3>برنامه امروز</h3></div><button class="btn secondary" data-v83-regenerate>بازسازی</button></div>${plan.tasks.slice(0,4).map((t,i)=>`<div class="v83-task-row ${state.dailyDone[plan.date]?.[t.id]?"done":""}"><div><b>${t.title}</b><small>${t.reason} · ${t.minutes} دقیقه</small></div><button class="btn secondary" data-v83-open-task="${i}">شروع</button></div>`).join("")}<button class="v83-link" data-open="adaptive">مشاهده کل برنامه و تحلیل ضعف ←</button></div>
  <div class="panel"><div class="v83-title-row"><div><small>WEAKNESS MODEL</small><h3>سه اولویت اصلی</h3></div></div>${weak.slice(0,3).map(x=>`<div class="v83-weak-row"><div><b>${x.subject}</b><small>آزمون ${x.components.exam}% · پرونده ${x.components.cases}% · واژگان ${x.components.vocab}%</small></div><strong class="${v83ScoreClass(x.score)}">${x.score}%</strong></div>`).join("")}</div></section>`;
};

function renderAdaptive(el){
  const plan=v83GenerateDailyPlan(),done=state.dailyDone[plan.date]||(state.dailyDone[plan.date]={}),weak=v83Weaknesses();
  el.innerHTML=`<section class="v82-head"><div><span>ADAPTIVE STUDY ENGINE</span><h2>مسیر تطبیقی و برنامه روزانه</h2><p>اولویت فعالیت‌ها از نتایج آزمون، خواندن، شنیدن، پرونده و مرور واژگان استخراج می‌شود.</p></div><button class="btn" data-v83-regenerate>تولید مجدد برنامه</button></section>
  <div class="v83-adaptive-layout"><section class="panel"><div class="v83-title-row"><div><small>${plan.date}</small><h3>برنامه اجرایی امروز</h3></div><b>${Object.values(done).filter(Boolean).length}/${plan.tasks.length}</b></div>${plan.tasks.map((t,i)=>`<article class="v83-daily-task ${done[t.id]?"done":""}"><label><input type="checkbox" data-v83-daily-done="${i}" ${done[t.id]?"checked":""}><span><b>${t.title}</b><small>${t.reason}</small></span></label><div><span>${t.minutes} دقیقه</span><button class="btn secondary" data-v83-open-task="${i}">باز کردن</button></div></article>`).join("")}</section>
  <section class="panel"><h3>ماتریس ضعف دروس</h3><div class="v83-weakness-table"><div class="head"><span>درس</span><span>کل</span><span>آزمون</span><span>خواندن</span><span>شنیدن</span><span>پرونده</span></div>${weak.map(x=>`<div><b>${x.subject}</b><strong class="${v83ScoreClass(x.score)}">${x.score}%</strong><span>${x.components.exam}%</span><span>${x.components.reading}%</span><span>${x.components.listening}%</span><span>${x.components.cases}%</span></div>`).join("")}</div><p class="v83-note">امتیاز پایین لزوماً به معنی شکست نیست؛ فعالیت ارزیابی‌نشده نیز برای جلوگیری از نادیده‌گرفتن درس، با امتیاز پایه محافظه‌کارانه وارد مدل می‌شود.</p></section></div>`;
}

function renderReviewCenter(el){
  const s=v83StartReview(),stats=v83ReviewStats(),index=v83CurrentReview();
  if(index==null){el.innerHTML=`<section class="v82-head"><div><span>SPACED REPETITION</span><h2>مرور امروز تمام شد</h2><p>${s.correct} پاسخ خوب یا آسان در این جلسه ثبت شد.</p></div><button class="btn" data-v83-new-review>کنترل دوباره سررسیدها</button></section><section class="v83-metrics">${v83Metric("مرور شده",stats.reviewed,`از ${DATA.vocab.length}`)}${v83Metric("کارت بالغ",stats.mature,"فاصله حداقل ۲۱ روز")}${v83Metric("نرخ حفظ",`${stats.retention}%`,"آخرین پاسخ خوب/آسان")}</section>`;return}
  const v=DATA.vocab[index],r=v83SrsRecord(index),remaining=s.queue.length-s.position;
  el.innerHTML=`<section class="v82-head"><div><span>SMART SRS</span><h2>مرور فاصله‌دار اصطلاحات</h2><p>هدف روزانه قابل تنظیم است و فاصله مرور بر اساس کیفیت پاسخ تغییر می‌کند.</p></div><label class="v83-goal">هدف روزانه<input id="v83ReviewGoal" type="number" min="5" max="60" value="${state.reviewGoal}"></label></section>
  <section class="v83-review-summary"><span>باقی‌مانده جلسه <b>${remaining}</b></span><span>کل سررسید <b>${stats.due}</b></span><span>فاصله فعلی <b>${r.interval||0} روز</b></span><span>خطاها <b>${r.lapses||0}</b></span></section>
  <article class="v83-review-card ${s.revealed?"revealed":""}"><header><small>${v.area}</small><span>${s.position+1}/${s.queue.length}</span></header><div class="front"><h2 class="de">${v.term}</h2><p class="de">${v.definition||"معنی و کاربرد حقوقی را به خاطر بیاورید."}</p><button class="btn secondary" data-v83-speak-review>تلفظ</button></div>${s.revealed?`<div class="back"><dl><dt>معنی</dt><dd>${v.fa}</dd><dt>جمع</dt><dd class="de">${v.plural}</dd><dt>Collocation</dt><dd class="de">${v.coll}</dd><dt>Beispiel</dt><dd class="de">${v.example}</dd><dt>قانون/حوزه</dt><dd class="de">${v.law}</dd></dl><div class="v83-ratings"><button data-v83-rate="0"><b>دوباره</b><small>۱ روز</small></button><button data-v83-rate="1"><b>سخت</b><small>فاصله کوتاه</small></button><button data-v83-rate="2"><b>خوب</b><small>فاصله استاندارد</small></button><button data-v83-rate="3"><b>آسان</b><small>فاصله بلند</small></button></div></div>`:`<button class="btn v83-reveal" data-v83-reveal>نمایش پاسخ</button>`}</article>`;
}

function v83HistoryHtml(mode){
  const list=state.writingHistory[mode]||[],cmp=v83WritingComparison(mode);
  if(!list.length)return`<div class="v83-empty">هنوز نسخه‌ای ثبت نشده است.</div>`;
  return`<div class="v83-history-head"><b>${list.length} نسخه ذخیره‌شده</b>${cmp?`<span>تغییر امتیاز ${cmp.scoreDelta>=0?"+":""}${cmp.scoreDelta} · تغییر واژه ${cmp.wordDelta>=0?"+":""}${cmp.wordDelta}</span>`:""}</div><div class="v83-history">${[...list].reverse().slice(0,8).map((x,i)=>`<details ${i===0?"open":""}><summary><span>${new Date(x.date).toLocaleString("fa-IR")}</span><b>${x.score}% · ${x.words} واژه</b></summary><p class="de">${esc(x.text)}</p></details>`).join("")}</div>${cmp?`<div class="v83-comparison"><div><b>${cmp.added}</b><span>واژه جدید</span></div><div><b>${cmp.removed}</b><span>واژه حذف‌شده</span></div><div><b>${cmp.scoreDelta>=0?"+":""}${cmp.scoreDelta}</b><span>تغییر امتیاز</span></div></div>`:""}`;
}

renderWriting=function(el){
  const t=DATA.writingTasks.find(x=>x.id===state.writingMode)||DATA.writingTasks[0],text=state.writingDrafts[t.id]||"";
  el.innerHTML=`<section class="v82-head"><div><span>VERSIONED WRITING STUDIO</span><h2>نگارش حقوقی و علمی</h2><p>تحلیل ساختاری همراه ذخیره نسخه‌ها و مقایسه روند پیشرفت.</p></div></section><div class="v83-writing-layout"><section class="panel"><div class="v82-selector"><select id="v82WritingSelect">${DATA.writingTasks.map(x=>`<option value="${x.id}" ${x.id===t.id?"selected":""}>${x.title}</option>`).join("")}</select><span>حداقل ${t.min} واژه</span></div><div class="v82-assignment"><b>Aufgabe</b><p>${t.prompt}</p><small>${t.required.join(" · ")}</small></div><textarea id="v82WritingText" class="de">${esc(text)}</textarea><div class="v82-editor-foot"><span id="v82WordCount">${v82Words(text).length} واژه</span><div><button class="btn secondary" data-v83-save-writing>ذخیره نسخه</button><button class="btn" data-v82-score-writing>تحلیل و ثبت</button></div></div><div id="v82WritingFeedback">${state.writingScores[t.id]!=null?`<div class="feedback good">آخرین امتیاز: ${state.writingScores[t.id]}%</div>`:""}</div></section><aside class="panel"><h3>تاریخچه و مقایسه</h3>${v83HistoryHtml(t.id)}</aside></div>`;
};

renderExam=function(el){
  const subjects=Object.keys(DATA.exams),sub=state.examSubject&&DATA.exams[state.examSubject]?state.examSubject:subjects[0];state.examSubject=sub;const qs=DATA.exams[sub],an=v83ExamAnalytics(sub);
  el.innerHTML=`<section class="v82-head"><div><span>COURSE EXAMINATION & ERROR ANALYSIS</span><h2>آزمون تفکیک‌شده هر درس</h2><p>هر تلاش ثبت می‌شود و خطاهای پرتکرار وارد برنامه تطبیقی می‌شوند.</p></div></section><div class="v83-exam-layout"><section class="panel"><div class="v82-selector"><select id="v82ExamSelect">${subjects.map(x=>`<option ${x===sub?"selected":""}>${x}</option>`).join("")}</select><span>${qs.length} سؤال</span></div><form id="v82ExamForm">${qs.map((q,i)=>`<fieldset class="v82-exam-q"><legend>${i+1}. ${q.q}</legend>${q.o.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"><span>${o}</span></label>`).join("")}<div id="v82Ex${i}"></div></fieldset>`).join("")}<button class="btn" type="submit">تصحیح و ثبت تلاش</button><div id="v82ExamResult"></div></form></section><aside class="panel"><h3>تحلیل عملکرد درس</h3><div class="v83-exam-stats">${v83Metric("تعداد تلاش",an.attempts)}${v83Metric("آخرین",an.last==null?"—":`${an.last}%`)}${v83Metric("بهترین",an.best==null?"—":`${an.best}%`)}${v83Metric("میانگین",an.average==null?"—":`${an.average}%`)}</div><h4>خطاهای پرتکرار</h4>${an.errors.length?an.errors.slice(0,6).map(([e,n])=>`<div class="v83-error-row"><span>${e}</span><b>${n}×</b></div>`).join(""):`<div class="v83-empty">پس از اولین آزمون، خطاها اینجا تحلیل می‌شوند.</div>`}</aside></div>`;
};

function renderReportCenter(el){
  const report=v83ReportSnapshot(),weak=report.weaknesses,review=report.review;
  el.innerHTML=`<section class="v82-head"><div><span>REPORTING & DATA PORTABILITY</span><h2>گزارش، پشتیبان و بازیابی</h2><p>گزارش چاپی، خروجی تحلیلی و انتقال کامل داده میان دستگاه‌ها.</p></div><div class="v83-hero-actions"><button class="btn" data-v83-print>چاپ / ذخیره PDF</button><button class="btn secondary" data-v83-export-csv>خروجی CSV</button></div></section><article id="v83PrintableReport" class="panel v83-report"><header><div><small>LEGAL GERMAN MASTERKIT · v8.3</small><h2>گزارش پیشرفت تحصیلی و زبان حقوقی</h2></div><div><b>${esc(state.profile.name)}</b><span>${esc(state.profile.semester)}</span></div></header><section class="v83-report-kpis">${v83Metric("پیشرفت کل",`${report.overall}%`)}${v83Metric("زمان ثبت‌شده",`${report.minutes} دقیقه`)}${v83Metric("اصطلاح مرورشده",review.reviewed)}${v83Metric("کارت بالغ",review.mature)}</section><h3>اولویت‌های بهبود</h3><table><thead><tr><th>درس</th><th>امتیاز ترکیبی</th><th>آزمون</th><th>خواندن</th><th>شنیدن</th><th>پرونده</th></tr></thead><tbody>${weak.map(x=>`<tr><td>${x.subject}</td><td>${x.score}%</td><td>${x.components.exam}%</td><td>${x.components.reading}%</td><td>${x.components.listening}%</td><td>${x.components.cases}%</td></tr>`).join("")}</tbody></table><h3>یادداشت گزارش</h3><textarea id="v83ReportNotes">${esc(state.reportNotes)}</textarea><p class="v83-disclaimer">این گزارش ابزار برنامه‌ریزی و خودارزیابی است و جایگزین نمره، گواهی یا ارزیابی رسمی دانشگاه نیست.</p></article><section class="panel v83-data-actions"><div><h3>انتقال کامل داده</h3><p>فایل JSON شامل برنامه، مرورها، پاسخ‌ها، نسخه‌های نگارش و تاریخچه آزمون است.</p></div><div><button class="btn" data-v83-backup>دریافت پشتیبان کامل</button><button class="btn secondary" data-v83-restore>بازیابی از فایل</button><input id="v83RestoreInput" type="file" accept="application/json" hidden></div></section>`;
}

renderProgress=function(el){renderReportCenter(el)};

render=function(view){
  const el=document.getElementById(view);if(!el)return;
  if(view==="dashboard")renderDashboard(el);if(view==="planner")renderPlanner(el);if(view==="adaptive")renderAdaptive(el);if(view==="reviewCenter")renderReviewCenter(el);if(view==="curriculum")renderCurriculum(el);if(view==="subjects")renderSubjects(el);if(view==="library")renderLibrary(el);if(view==="language")renderLanguage(el);if(view==="reading")renderReading(el);if(view==="listening")renderListening(el);if(view==="speaking")renderSpeaking(el);if(view==="writing")renderWriting(el);if(view==="research")renderResearch(el);if(view==="caseLab")renderCases(el);if(view==="exam")renderExam(el);if(view==="reportCenter"||view==="progressView")renderReportCenter(el);
};

const v83OldWire=wire;
wire=function(){
  v83OldWire();
  document.body.addEventListener("click",event=>{
    const b=event.target.closest("button");if(!b)return;
    if(b.hasAttribute("data-v83-regenerate")){v83GenerateDailyPlan(true);render(state.view)}
    if(b.dataset.v83OpenTask!==undefined){const p=v83GenerateDailyPlan(),t=p.tasks[Number(b.dataset.v83OpenTask)];if(t)v83OpenDailyTask(t)}
    if(b.hasAttribute("data-v83-reveal")){v83RevealReview();render("reviewCenter")}
    if(b.hasAttribute("data-v83-speak-review")){const i=v83CurrentReview();if(i!=null)speak(`${DATA.vocab[i].term}. ${DATA.vocab[i].example}`,.82)}
    if(b.dataset.v83Rate!==undefined){const i=v83CurrentReview();if(i!=null){v83RateReview(i,Number(b.dataset.v83Rate));render("reviewCenter")}}
    if(b.hasAttribute("data-v83-new-review")){v83StartReview(true);render("reviewCenter")}
    if(b.hasAttribute("data-v83-save-writing")){const mode=state.writingMode,text=document.querySelector("#v82WritingText")?.value||"",score=state.writingScores[mode]||0;if(v83SaveWritingVersion(mode,text,score,"manual")){state.writingDrafts[mode]=text;save();v82Toast("نسخه نگارش ذخیره شد.");render("writing")}else v82Toast("متن جدیدی برای ذخیره وجود ندارد.",true)}
    if(b.hasAttribute("data-v82-score-writing")){setTimeout(()=>{const mode=state.writingMode,text=state.writingDrafts[mode]||document.querySelector("#v82WritingText")?.value||"";v83SaveWritingVersion(mode,text,state.writingScores[mode]||0,"analysis")},0)}
    if(b.hasAttribute("data-v83-print")){state.reportNotes=document.querySelector("#v83ReportNotes")?.value||state.reportNotes;save();window.print()}
    if(b.hasAttribute("data-v83-backup"))v83Backup();
    if(b.hasAttribute("data-v83-restore"))document.querySelector("#v83RestoreInput")?.click();
    if(b.hasAttribute("data-v83-export-csv"))v83ExportCsv();
  });
  document.body.addEventListener("change",event=>{
    const t=event.target;
    if(t.dataset.v83DailyDone!==undefined){const p=v83GenerateDailyPlan(),task=p.tasks[Number(t.dataset.v83DailyDone)],done=state.dailyDone[p.date]||(state.dailyDone[p.date]={});done[task.id]=t.checked;if(t.checked)state.minutes+=task.minutes;save();render("adaptive")}
    if(t.id==="v83ReviewGoal"){state.reviewGoal=v83Clamp(Number(t.value)||20,5,60);v83StartReview(true);save();render("reviewCenter")}
    if(t.id==="v83RestoreInput"&&t.files?.[0])v83Restore(t.files[0]).catch(err=>v82Toast(err.message,true));
  });
  document.body.addEventListener("input",event=>{if(event.target.id==="v83ReportNotes"){state.reportNotes=event.target.value;save()}});
  document.body.addEventListener("submit",event=>{if(event.target.id==="v82ExamForm"){setTimeout(()=>{const attempt=v83RecordExamAttempt(state.examSubject,event.target);v82Toast(`تلاش آزمون با امتیاز ${attempt.percent}% ثبت شد.`)},0)}});
};