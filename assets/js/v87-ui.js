"use strict";
(function(){
  const PACK=window.LGMK_V87_DATA;
  const NEW_VIEWS=["legalEvidence","caseBriefs","citationAudit","referenceImport"];
  const META={
    legalEvidence:["بانک شواهد حقوقی","مواد رسمی، عناصر آزمون و یادداشت Evidence"],
    caseBriefs:["Case Brief Lab","رأی، قاعده، تحلیل، نتیجه و اهمیت علمی"],
    citationAudit:["ممیزی استناد","کنترل ماده، رأی، منبع، نشانگر و کتابنامه"],
    referenceImport:["ورود منابع","ورود BibTeX و RIS با تشخیص رکورد تکراری"]
  };
  const ensureSections=()=>{const main=document.querySelector("main.app-shell");NEW_VIEWS.forEach(id=>{if(!document.getElementById(id)){const s=document.createElement("section");s.id=id;s.className="view";main.appendChild(s)}})};
  const escAttr=x=>esc(String(x||""));
  const progress=p=>`<div class="v87-progress"><i style="width:${Math.max(0,Math.min(100,p))}%"></i></div>`;
  const courseOptions=selected=>DATA.courses.map(c=>`<option value="${c.id}" ${c.id===selected?"selected":""}>${c.title}</option>`).join("");
  const stage=(id,key,no,title,desc,done,route,automatic=false)=>`<article class="v87-stage ${done?"done":""}"><header><i>${no}</i><span><b>${title}</b><small>${desc}</small></span></header><footer><button data-${route.prefix}-route="${route.type}" data-id="${route.id??""}" data-course="${id}">باز کردن</button>${automatic?`<span>${done?"تأیید خودکار":"نیازمند فعالیت واقعی"}</span>`:`<button class="secondary" data-v85-stage="${key}" data-course="${id}">${done?"ثبت شده":"ثبت تکمیل"}</button>`}</footer></article>`;

  const baseBuildNav=buildNav;
  buildNav=function(){
    ensureSections();baseBuildNav();
    const desktop=document.querySelector(".v84-desktop-nav"),more=document.querySelector("#v84More");
    if(desktop&&!desktop.querySelector("[data-v87-nav]")){
      const section=document.createElement("section");section.dataset.v87Nav="";section.innerHTML=`<h4>LEGAL EVIDENCE</h4><button type="button" data-view="legalEvidence"><span>NV</span><b>بانک مواد</b></button><button type="button" data-view="caseBriefs"><span>CB</span><b>Case Brief</b></button><button type="button" data-view="citationAudit"><span>QA</span><b>ممیزی استناد</b></button><button type="button" data-view="referenceImport"><span>IM</span><b>ورود منابع</b></button>`;
      desktop.insertBefore(section,desktop.querySelector("footer"));
    }
    if(more&&!more.querySelector("[data-v87-more]")){
      const section=document.createElement("section");section.dataset.v87More="";section.innerHTML=`<h4>شواهد و تحویل علمی</h4><button type="button" data-view="legalEvidence"><span>NV</span><b>بانک مواد</b></button><button type="button" data-view="caseBriefs"><span>CB</span><b>Case Brief</b></button><button type="button" data-view="citationAudit"><span>QA</span><b>ممیزی استناد</b></button><button type="button" data-view="referenceImport"><span>IM</span><b>ورود منابع</b></button>`;more.appendChild(section);
    }
  };

  const baseGo=go;
  go=function(view){
    if(!NEW_VIEWS.includes(view))return baseGo(view);
    ensureSections();state.view=view;save();document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id===view));document.querySelectorAll("#mainNav [data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===view));
    const top=document.querySelector(".topbar"),[title,sub]=META[view];if(top)top.querySelector("div").innerHTML=`<span class="v84-kicker">LL.M. OEC. · JENA · v8.7</span><h1>${title}</h1><p>${sub}</p>`;render(view);window.scrollTo({top:0,left:0,behavior:"auto"});
  };

  function renderCourseWorkspaceV87(el){
    const id=state.courseWorkspace.selected||DATA.courses[0].id,a=v85CourseAssets(id),p=v85CourseProgress(id),n=v85NextCourseAction(id),s=p.stages;
    const firstV=a.vocab[0],firstR=a.readings[0],firstC=a.cases[0],norms=v87NormsForCourse(id),briefs=v87CasesForCourse(id),np=v87NormProgress(id),bp=v87CaseBriefProgress(id);
    el.innerHTML=`<section class="v85-course-head v87-course-head"><div><span>COURSE WORKSPACE · 8 STAGES</span><select id="v85CourseSelect">${courseOptions(id)}</select><h2>${a.course.title}</h2><p>${a.course.outcome}</p></div><aside><strong>${p.percent}%</strong><small>${p.done} از ${p.total} مرحله</small>${progress(p.percent)}<button data-v87-next-course data-course="${id}" data-type="${n.type}" data-id="${n.id??""}">${n.label}</button></aside></section>
    <section class="v85-course-meta"><article><small>سطح</small><b>${a.course.level}</b></article><article><small>مواد متصل</small><b>${norms.length}</b></article><article><small>Case Brief</small><b>${briefs.length}</b></article><article><small>آزمون</small><b>${state.examByCourse?.[a.subject]??"—"}%</b></article></section>
    <section class="v84-panel"><div class="v84-section-head"><div><span>VERIFIED LEARNING PATH</span><h3>گردش‌کار هشت‌مرحله‌ای</h3></div><b>${p.done}/${p.total}</b></div><div class="v87-stage-grid">
      ${stage(id,"orientation","01","شناخت درس","هدف، سرفصل و مواد اصلی",s.orientation,{prefix:"v85",type:"subjects"})}
      ${stage(id,"vocabulary","02","زبان تخصصی","حداقل پنج اصطلاح مرتبط",s.vocabulary,{prefix:"v85",type:"vocab",id:firstV?.index})}
      ${stage(id,"input","03","ورودی علمی","Reading یا Listening مرتبط",s.input,{prefix:"v85",type:"reading",id:firstR?.id})}
      ${stage(id,"application","04","کاربرد حقوقی","حل پرونده و Subsumtion",s.application,{prefix:"v85",type:"case",id:firstC?.id})}
      ${stage(id,"writing","05","خروجی نوشتاری","تحلیل یا Gutachten کوتاه",s.writing,{prefix:"v85",type:"writing"})}
      ${stage(id,"exam","06","ارزیابی درس","آزمون تفکیک‌شده و تحلیل خطا",s.exam,{prefix:"v85",type:"exam"})}
      ${stage(id,"evidence","07","Norm Evidence","مرور حداقل دو ماده رسمی و ثبت یادداشت",s.evidence,{prefix:"v87",type:"evidence"},true)}
      ${stage(id,"caseBrief","08","Case Brief","تکمیل خلاصه ساختاری یک رأی یا Lehrfall",s.caseBrief,{prefix:"v87",type:"caseBrief"},true)}
    </div></section>
    <section class="v87-evidence-summary"><article><span>NORMEN</span><b>${np.reviewed}/${np.total}</b><p>ماده مرورشده برای این درس</p><button data-v87-route="evidence" data-course="${id}">بانک مواد</button></article><article><span>CASE BRIEF</span><b>${bp.done}/${bp.total}</b><p>Brief کامل‌شده برای این درس</p><button data-v87-route="caseBrief" data-course="${id}">Case Brief Lab</button></article><article><span>OFFICIAL SOURCES</span><b>${norms.filter(x=>x.sourceType==="official").length}</b><p>رکورد دارای پیوند مرجع رسمی</p><button data-view="citationAudit">ممیزی استناد</button></article></section>
    <section class="v85-assets"><div class="v84-panel"><div class="v84-section-head"><div><span>CONNECTED CONTENT</span><h3>محتوای متصل</h3></div></div><div class="v85-asset-list"><button data-v85-route="vocab" data-id="${firstV?.index??""}" data-course="${id}"><b>${a.vocab.length} اصطلاح</b><span>${a.vocab.slice(0,4).map(x=>x.term).join(" · ")||"در حال تکمیل"}</span></button><button data-v85-route="reading" data-id="${firstR?.id??""}" data-course="${id}"><b>${a.readings.length} متن</b><span>${a.readings.slice(0,2).map(x=>x.title).join(" · ")||"متن عمومی"}</span></button><button data-v87-route="evidence" data-course="${id}"><b>${norms.length} ماده رسمی</b><span>${norms.slice(0,4).map(x=>`${x.cite} ${x.code}`).join(" · ")}</span></button><button data-v87-route="caseBrief" data-course="${id}"><b>${briefs.length} Brief</b><span>${briefs.slice(0,2).map(x=>x.title).join(" · ")}</span></button></div></div><div class="v84-panel"><div class="v84-section-head"><div><span>COURSE NOTES</span><h3>یادداشت عملیاتی</h3></div></div><textarea id="v85CourseNotes" placeholder="نکات استاد، مواد مهم، اختلاف نظر و برنامه جلسه بعد">${escAttr(state.courseWorkspace.notes[id]||"")}</textarea><button data-v85-save-notes data-course="${id}">ذخیره یادداشت</button><h4>تمرین پیشنهادی</h4><p>${a.course.practice}</p></div></section>`;
  }

  function renderLegalEvidence(el){
    const rows=v87FilteredNorms(),selected=rows.find(x=>x.id===state.legalEvidence.selected)||v87FindNorm(state.legalEvidence.selected)||rows[0],codes=["همه",...new Set(PACK.norms.map(x=>x.code))];if(selected&&selected.id!==state.legalEvidence.selected)v87SelectNorm(selected.id);
    el.innerHTML=`<section class="v84-hero"><div><span>OFFICIAL NORM EVIDENCE</span><h2>مواد قانونی باید به منبع رسمی، عناصر و نتیجه متصل باشند</h2><p>${PACK.norms.length} رکورد ساختاری · آخرین کنترل مجموعه: ${PACK.verifiedAt}</p></div><a class="v87-hero-link" href="${selected?.officialUrl||"#"}" target="_blank" rel="noopener">منبع رسمی ↗</a></section>
    <section class="v87-filterbar"><input id="v87NormSearch" placeholder="جست‌وجو: Zugang، Sachmangel، Verwaltungsakt..." value="${escAttr(state.legalEvidence.query)}"><select id="v87NormCode">${codes.map(x=>`<option ${x===state.legalEvidence.code?"selected":""}>${x}</option>`).join("")}</select><select id="v87NormCourse"><option value="همه">همه درس‌ها</option>${courseOptions(state.legalEvidence.course)}</select></section>
    <section class="v87-evidence-layout"><div class="v87-norm-list">${rows.map(n=>`<button class="${n.id===selected?.id?"active":""} ${state.legalEvidence.reviewed[n.id]?"reviewed":""}" data-v87-norm="${n.id}"><span>${n.code}</span><b>${n.cite} · ${n.title}</b><small>${n.ruleFa}</small></button>`).join("")||`<div class="v84-panel"><p>نتیجه‌ای پیدا نشد.</p></div>`}</div>${selected?`<article class="v87-norm-detail"><header><div><span>${selected.code} · OFFICIAL</span><h2>${selected.cite} — ${selected.title}</h2><small>آخرین کنترل: ${selected.lastChecked}</small></div><a href="${selected.officialUrl}" target="_blank" rel="noopener">باز کردن متن رسمی ↗</a></header><section><h3>Kurzregel</h3><p class="de">${selected.ruleDe}</p><p>${selected.ruleFa}</p></section><section><h3>Prüfungselemente</h3><ol>${selected.elements.map(x=>`<li class="de">${x}</li>`).join("")}</ol></section><section><h3>Rechtsfolge / Bedeutung</h3><p class="de">${selected.consequence}</p></section><section><h3>Evidence Note</h3><textarea id="v87NormNote" placeholder="نکته استاد، اختلاف دیدگاه، مثال یا ارجاع پرونده">${escAttr(state.legalEvidence.notes[selected.id]||"")}</textarea><div class="v87-actions"><button data-v87-save-norm-note="${selected.id}">ذخیره یادداشت</button><button class="secondary" data-v87-review-norm="${selected.id}">${state.legalEvidence.reviewed[selected.id]?"مرور ثبت شده":"ثبت مرور واقعی"}</button></div></section></article>`:""}</section>`;
  }

  function renderCaseBriefs(el){
    const c=v87SelectedCase(),d=v87BriefDraft(c.id),a=v87BriefAssessment(d),course=v85CourseById(c.courseId);
    el.innerHTML=`<section class="v84-hero"><div><span>CASE BRIEF LAB</span><h2>از خواندن رأی تا استخراج Ratio و اهمیت علمی</h2><p>${PACK.cases.filter(x=>x.kind!=="Lehrfall").length} رأی رسمی اتحادیه اروپا + ${PACK.cases.filter(x=>x.kind==="Lehrfall").length} Lehrfall درس‌محور</p></div><select id="v87CaseSelect">${PACK.cases.map(x=>`<option value="${x.id}" ${x.id===c.id?"selected":""}>${x.title} · ${x.caseNo}</option>`).join("")}</select></section>
    <section class="v87-brief-layout"><article class="v84-panel v87-case-source"><div class="v84-section-head"><div><span>${c.kind||"JUDGMENT"}</span><h3>${c.title}</h3></div><b>${c.caseNo}</b></div><dl><dt>درس</dt><dd>${course?.title||c.courseId}</dd><dt>مرجع</dt><dd>${c.court}</dd>${c.date?`<dt>تاریخ</dt><dd>${c.date}</dd>`:""}${c.ecli?`<dt>ECLI</dt><dd class="de">${c.ecli}</dd>`:""}</dl><h4>Rechtsfrage</h4><p class="de">${c.issueDe}</p><h4>Kernaussage</h4><p class="de">${c.holdingDe}</p><p>${c.holdingFa}</p><h4>Bedeutung</h4><p class="de">${c.significance}</p><h4>Prüfungsstruktur</h4><ol>${c.schema.map(x=>`<li class="de">${x}</li>`).join("")}</ol>${c.officialUrl?`<a class="v87-source-button" href="${c.officialUrl}" target="_blank" rel="noopener">EUR-Lex / منبع رسمی ↗</a>`:`<p class="v87-method-note">این مورد Lehrfall آموزشی است و رأی قضایی واقعی محسوب نمی‌شود.</p>`}</article>
    <form id="v87BriefForm" class="v84-panel v87-brief-form"><input type="hidden" name="id" value="${c.id}"><div class="v84-section-head"><div><span>YOUR ANALYSIS</span><h3>Brief ساختاری</h3></div><b>${a.score}%</b></div>${progress(a.score)}<label>Facts / Sachverhalt<textarea name="facts" placeholder="وقایع لازم و مرتبط، بدون حاشیه">${escAttr(d.facts)}</textarea></label><label>Issue / Rechtsfrage<textarea name="issue" placeholder="پرسش حقوقی دقیق و قابل پاسخ">${escAttr(d.issue)}</textarea></label><label>Rule / Normen<textarea name="rule" placeholder="قاعده، ماده، رأی و منبع رسمی">${escAttr(d.rule)}</textarea></label><label>Analysis / Subsumtion<textarea name="analysis" placeholder="اتصال قاعده به وقایع، استدلال موافق و مخالف">${escAttr(d.analysis)}</textarea></label><label>Conclusion / Ergebnis<textarea name="conclusion">${escAttr(d.conclusion)}</textarea></label><label>Significance / Bedeutung<textarea name="significance" placeholder="اثر رأی بر آزمون، پژوهش یا پرونده‌های بعدی">${escAttr(d.significance)}</textarea></label><label>یادداشت شخصی<textarea name="notes">${escAttr(d.notes)}</textarea></label><div class="v87-actions"><button type="submit">ذخیره و ارزیابی</button><button type="button" class="secondary" data-v87-complete-brief="${c.id}">${state.caseBriefs.completed[c.id]?"Brief تأیید شده":"تأیید تکمیل"}</button></div>${a.missing.length?`<div class="v87-issues"><b>موارد باقی‌مانده:</b><ul>${a.missing.map(x=>`<li>${x}</li>`).join("")}</ul></div>`:`<div class="v87-ok">تمام اجزای حداقلی Brief تکمیل شده‌اند.</div>`}</form></section>`;
  }

  function renderCitationAudit(el){
    const r=state.citationAudit.last;
    el.innerHTML=`<section class="v84-hero"><div><span>ACADEMIC SUBMISSION CONTROL</span><h2>ممیزی ادعا، ماده، رأی، منبع و کتابنامه</h2><p>این کنترل جایگزین دستور استاد یا راهنمای دانشکده نیست؛ خطاهای ساختاری و شواهد ناقص را پیش از تحویل آشکار می‌کند.</p></div><button data-view="sourceMatrix">ماتریس منابع</button></section><section class="v87-audit-layout"><form id="v87AuditForm" class="v84-panel"><label>متن علمی / فصل مورد بررسی<textarea name="text" class="v87-tall" placeholder="متن Seminararbeit یا Magisterarbeit را وارد کنید...">${escAttr(state.citationAudit.text)}</textarea></label><label>Fußnoten یا Literaturverzeichnis<textarea name="bibliography" placeholder="مدخل‌های شماره‌دار مانند [1] ... یا کتابنامه را وارد کنید">${escAttr(state.citationAudit.bibliography)}</textarea></label><div class="v87-actions"><button type="submit">اجرای ممیزی سختگیرانه</button>${r?`<button type="button" class="secondary" data-v87-export-audit>خروجی گزارش</button>`:""}</div></form><section class="v84-panel v87-audit-result">${r?`<div class="v87-score"><strong>${r.score}</strong><span>امتیاز کنترل ساختاری</span></div><div class="v87-check-grid">${r.checks.map(x=>`<article class="${x.status}"><small>${x.label}</small><b>${x.value}</b></article>`).join("")}</div><h3>خطاهای الزام‌آور</h3>${r.issues.length?`<ul class="v87-error-list">${r.issues.map(x=>`<li>${x}</li>`).join("")}</ul>`:`<p class="v87-ok">خطای الزام‌آور ساختاری شناسایی نشد.</p>`}<h3>هشدارهای نیازمند بازبینی</h3>${r.warnings.length?`<ul class="v87-warning-list">${r.warnings.map(x=>`<li>${x}</li>`).join("")}</ul>`:`<p class="v87-ok">هشدار باز وجود ندارد.</p>`}<p class="muted">مواد شناسایی‌شده: ${r.normMentions} · منابع ماتریس: ${r.sourceTotal}</p>`:`<div class="v87-empty"><b>هنوز ممیزی اجرا نشده است.</b><p>متن و کتابنامه را وارد کنید. موتور منابع ناقص، تکراری، نشانگرهای بدون مدخل و مواد بدون رکورد رسمی را بررسی می‌کند.</p></div>`}</section></section>`;
  }

  function renderReferenceImport(el){
    const last=state.importCenter.last;
    el.innerHTML=`<section class="v84-hero"><div><span>REFERENCE IMPORT</span><h2>BibTeX و RIS را به ماتریس پژوهش وارد کنید</h2><p>رکوردها قبل از ورود با نویسنده، عنوان و سال Deduplicate می‌شوند و بدون تأیید علمی علامت‌گذاری خواهند شد.</p></div><button data-view="sourceMatrix">مشاهده ماتریس</button></section><section class="v87-import-layout"><form id="v87ImportForm" class="v84-panel"><div class="v87-import-top"><label>فرمت<select name="format" id="v87ImportFormat"><option value="bibtex" ${state.importCenter.format==="bibtex"?"selected":""}>BibTeX</option><option value="ris" ${state.importCenter.format==="ris"?"selected":""}>RIS</option></select></label><label>فایل<input id="v87ImportFile" type="file" accept=".bib,.bibtex,.ris,.txt,text/plain"></label></div><label>محتوای ورودی<textarea name="text" id="v87ImportText" class="v87-tall" placeholder="رکورد BibTeX یا RIS را اینجا Paste کنید">${escAttr(state.importCenter.text)}</textarea></label><button type="submit">تحلیل و ورود به ماتریس</button></form><aside class="v84-panel"><div class="v84-section-head"><div><span>IMPORT GATE</span><h3>کنترل پیش از ورود</h3></div></div><ol class="v87-gate"><li>عنوان خالی وارد نمی‌شود.</li><li>نویسنده + عنوان + سال برای تشخیص تکرار استفاده می‌شود.</li><li>رکورد واردشده «تأییدشده» محسوب نمی‌شود.</li><li>ادعا و صفحه باید بعداً در ماتریس تکمیل شود.</li><li>راهنمای استاد و دانشکده بر خروجی خودکار مقدم است.</li></ol>${last?`<div class="v87-import-result"><b>${last.created} رکورد وارد شد</b><span>${last.skipped} رکورد تکراری یا ناقص کنار گذاشته شد</span></div>`:""}</aside></section>`;
  }

  const baseRender=render;
  render=function(view){
    const el=document.getElementById(view);if(view==="courseWorkspace")return renderCourseWorkspaceV87(el);if(view==="legalEvidence")return renderLegalEvidence(el);if(view==="caseBriefs")return renderCaseBriefs(el);if(view==="citationAudit")return renderCitationAudit(el);if(view==="referenceImport")return renderReferenceImport(el);return baseRender(view);
  };

  function routeV87(type,id,course){
    if(type==="evidence"){v87SetEvidenceFilters({course:course||"همه",query:"",code:"همه"});const first=v87NormsForCourse(course)[0];if(first)v87SelectNorm(first.id);return go("legalEvidence")}
    if(type==="caseBrief"){const first=v87CasesForCourse(course)[0];if(first)v87SelectCase(first.id);return go("caseBriefs")}
    if(type==="review")return go("reviewCenter");
    return v85OpenAsset(type,id,course);
  }

  const baseWire=wire;
  wire=function(){baseWire();
    document.body.addEventListener("click",e=>{
      const b=e.target.closest("button,a");if(!b)return;
      if(b.dataset.v87Route){e.preventDefault();routeV87(b.dataset.v87Route,b.dataset.id,b.dataset.course)}
      if(b.hasAttribute("data-v87-next-course")){e.preventDefault();routeV87(b.dataset.type,b.dataset.id,b.dataset.course)}
      if(b.dataset.v87Norm){v87SelectNorm(b.dataset.v87Norm);render("legalEvidence")}
      if(b.dataset.v87ReviewNorm){v87ToggleNormReviewed(b.dataset.v87ReviewNorm);render("legalEvidence")}
      if(b.dataset.v87SaveNormNote){v87SaveNormNote(b.dataset.v87SaveNormNote,document.querySelector("#v87NormNote")?.value||"");v82Toast("Evidence Note ذخیره شد.")}
      if(b.dataset.v87CompleteBrief){const a=v87CompleteCaseBrief(b.dataset.v87CompleteBrief);render("caseBriefs");v82Toast(a.complete?"Case Brief تأیید شد.":"Brief هنوز حداقل‌های اجباری را ندارد.",!a.complete)}
      if(b.hasAttribute("data-v87-export-audit")){const r=state.citationAudit.last;if(!r)return;const blob=new Blob([JSON.stringify({release:"8.7.0",generatedAt:new Date().toISOString(),result:r},null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="Legal-German-Citation-Audit-v8.7.json";a.click();URL.revokeObjectURL(a.href)}
    },true);
    document.body.addEventListener("change",e=>{
      if(e.target.id==="v87NormCode"){v87SetEvidenceFilters({code:e.target.value});render("legalEvidence")}
      if(e.target.id==="v87NormCourse"){v87SetEvidenceFilters({course:e.target.value});render("legalEvidence")}
      if(e.target.id==="v87CaseSelect"){v87SelectCase(e.target.value);render("caseBriefs")}
      if(e.target.id==="v87ImportFile"){const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const area=document.querySelector("#v87ImportText");if(area)area.value=String(reader.result||"")};reader.readAsText(file)}
    });
    document.body.addEventListener("input",e=>{if(e.target.id==="v87NormSearch"){v87SetEvidenceFilters({query:e.target.value});render("legalEvidence");const input=document.querySelector("#v87NormSearch");input?.focus();input?.setSelectionRange(input.value.length,input.value.length)}});
    document.body.addEventListener("submit",e=>{
      if(e.target.id==="v87BriefForm"){e.preventDefault();const data=Object.fromEntries(new FormData(e.target)),a=v87SaveCaseBrief(data.id,data);render("caseBriefs");v82Toast(a.complete?"Brief ذخیره شد و حداقل‌ها کامل‌اند.":"Brief ذخیره شد؛ موارد ناقص باقی مانده است.",false)}
      if(e.target.id==="v87AuditForm"){e.preventDefault();const data=Object.fromEntries(new FormData(e.target));v87CitationAudit(data.text,data.bibliography);render("citationAudit");v82Toast("ممیزی استناد اجرا شد.")}
      if(e.target.id==="v87ImportForm"){e.preventDefault();const data=Object.fromEntries(new FormData(e.target));try{const r=v87ImportReferences(data.format,data.text);render("referenceImport");v82Toast(`${r.created.length} منبع وارد شد؛ ${r.skipped.length} مورد کنار گذاشته شد.`)}catch(err){v82Toast(err.message,true)}}
    });
  };
})();
