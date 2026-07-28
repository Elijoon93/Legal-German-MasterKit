"use strict";
(function(){
  const COURSE_MAP={
    "bgb-at":"BGB Allgemeiner Teil",
    "schuld-at":"Schuldrecht Allgemeiner Teil",
    "schuld-bt":"Kauf- und Verbraucherrecht",
    "commercial":"Handelsrecht",
    "company":"Gesellschaftsrecht",
    "admin":"Allgemeines Verwaltungsrecht",
    "economic-admin":"Wirtschaftsverwaltungs- und Vergaberecht",
    "eu":"Europäisches Wirtschaftsrecht",
    "competition":"Wettbewerbs-, Arbeits- und Immaterialgüterrecht",
    "research":"Juristische Methodik und Forschung"
  };
  const COURSE_KEYS={
    "bgb-at":["BGB AT","Vertragsrecht","Willenserklärung","Anfechtung","Stellvertretung"],
    "schuld-at":["Schuldrecht","Verzug","Unmöglichkeit","Schadensersatz"],
    "schuld-bt":["Kaufrecht","Verbraucherrecht","Sachmangel","Nacherfüllung","Kaufvertrag","Deliktsrecht"],
    "commercial":["Handelsrecht","Kaufmann","Prokura","HGB"],
    "company":["Gesellschaftsrecht","Gesellschaft","GmbH","AG","OHG","KG"],
    "admin":["Verwaltungsrecht","Verwaltungsakt","VwVfG","Anhörung","Widerspruch"],
    "economic-admin":["Wirtschaftsverwaltungs","Vergaberecht","Gewerbe","Genehmigung","Regulierung"],
    "eu":["Europarecht","Grundfreiheit","Warenverkehr","Niederlassung","Dienstleistung","AEUV"],
    "competition":["Kartell","Wettbewerb","Beihilfe","Arbeitsrecht","Urheber","Immaterial"],
    "research":["Forschung","Methodik","Gutachtenstil","Seminar","Magister","Zitier"]
  };
  Object.assign(state,{
    courseWorkspace:state.courseWorkspace||{selected:DATA.courses?.[0]?.id||"bgb-at",sessions:{},notes:{}},
    semesterEvents:Array.isArray(state.semesterEvents)?state.semesterEvents:[],
    sourceMatrix:Array.isArray(state.sourceMatrix)?state.sourceMatrix:[],
    globalSearchQuery:state.globalSearchQuery||"",
    v85Migration:1
  });
  if(!state.courseWorkspace.sessions)state.courseWorkspace.sessions={};
  if(!state.courseWorkspace.notes)state.courseWorkspace.notes={};
  if(!DATA.courses.some(c=>c.id===state.courseWorkspace.selected))state.courseWorkspace.selected=DATA.courses?.[0]?.id||"bgb-at";

  function uid(prefix){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
  function norm(value){return String(value||"").toLowerCase().replace(/\s+/g," ").trim()}
  function download(name,text,type="text/plain;charset=utf-8"){
    const blob=new Blob([text],{type}),a=document.createElement("a");
    a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href);
  }
  function courseById(id){return DATA.courses.find(c=>c.id===id)||DATA.courses[0]}
  function courseSubject(courseOrId){const c=typeof courseOrId==="string"?courseById(courseOrId):courseOrId;return COURSE_MAP[c?.id]||c?.title||Object.keys(DATA.exams)[0]}
  function matchesCourse(value,course,subject){
    const text=norm(typeof value==="string"?value:JSON.stringify(value)),keys=COURSE_KEYS[course.id]||[subject,course.area,course.title];
    return (typeof v83SubjectFor==="function"&&v83SubjectFor(value?.area||value)===subject)||keys.some(k=>text.includes(norm(k)));
  }
  function relevantByCourse(list,course,subject){return list.filter(x=>matchesCourse(x,course,subject))}
  function courseAssets(id){
    const course=courseById(id),subject=courseSubject(course);
    const vocab=DATA.vocab.map((x,index)=>({...x,index})).filter(x=>matchesCourse(x,course,subject));
    const readings=relevantByCourse(DATA.readings,course,subject);
    const cases=relevantByCourse(DATA.cases,course,subject);
    const books=DATA.books.filter(b=>norm(`${b.cat} ${b.title} ${b.use}`).includes(norm(course.area))||course.books.some(x=>norm(x).includes(norm(b.title))||norm(b.title).includes(norm(x.split(",")[0]))));
    return{course,subject,vocab:vocab.slice(0,30),readings,cases,books,exam:DATA.exams[subject]||[]};
  }
  function session(id){return state.courseWorkspace.sessions[id]||(state.courseWorkspace.sessions[id]={})}
  function courseProgress(id){
    const a=courseAssets(id),s=session(id),readingDone=a.readings.some(r=>Number.isFinite(Number(state.readingScores?.[r.id]))||Number.isFinite(Number(state.listeningScores?.[r.id]))),caseDone=a.cases.some(c=>Number.isFinite(Number(state.caseScores?.[c.id]))),vocabDone=a.vocab.filter(v=>state.mastered?.[v.index]||state.srs?.[v.index]?.reps>0).length>=5;
    const stages={orientation:Boolean(s.orientation||state.completed?.[id]),vocabulary:Boolean(s.vocabulary||vocabDone),input:Boolean(s.input||readingDone),application:Boolean(s.application||caseDone),writing:Boolean(s.writing),exam:Boolean(s.exam||Number.isFinite(Number(state.examByCourse?.[a.subject])))};
    return{stages,done:Object.values(stages).filter(Boolean).length,total:6,percent:Math.round(Object.values(stages).filter(Boolean).length/6*100)};
  }
  function toggleStage(courseId,stage){const s=session(courseId);s[stage]=!s[stage];save();return s[stage]}
  function selectCourse(id){if(courseById(id)){state.courseWorkspace.selected=id;save()}}
  function setCourseNotes(id,text){state.courseWorkspace.notes[id]=String(text||"");save()}
  function openAsset(type,id,courseId){
    const assets=courseAssets(courseId||state.courseWorkspace.selected);
    if(type==="vocab"){state.languageTab="vocab";state.languageQuery=DATA.vocab[id]?.term||"";state.languagePage=1;save();return go("language")}
    if(type==="reading"){state.readingIndex=Math.max(0,DATA.readings.findIndex(x=>String(x.id)===String(id)));save();return go("reading")}
    if(type==="listening"){state.listeningIndex=Math.max(0,DATA.readings.findIndex(x=>String(x.id)===String(id)));save();return go("listening")}
    if(type==="case"){state.caseIndex=Math.max(0,DATA.cases.findIndex(x=>String(x.id)===String(id)));save();return go("caseLab")}
    if(type==="exam"){state.examSubject=assets.subject;save();return go("exam")}
    if(type==="writing")return go("writing");
    if(type==="subjects")return go("subjects");
    if(type==="library")return go("library");
  }
  function nextCourseAction(id){
    const a=courseAssets(id),p=courseProgress(id),s=p.stages;
    if(!s.orientation)return{stage:"orientation",label:"مرور هدف و سرفصل درس",type:"subjects"};
    if(!s.vocabulary)return{stage:"vocabulary",label:"مطالعه ۵ اصطلاح مرتبط",type:"vocab",id:a.vocab[0]?.index};
    if(!s.input)return{stage:"input",label:"خواندن متن مرتبط",type:"reading",id:a.readings[0]?.id};
    if(!s.application)return{stage:"application",label:"حل پرونده مرتبط",type:"case",id:a.cases[0]?.id};
    if(!s.writing)return{stage:"writing",label:"نگارش یک تحلیل کوتاه",type:"writing"};
    if(!s.exam)return{stage:"exam",label:"آزمون درس",type:"exam"};
    return{stage:"orientation",label:"مرور دوباره و تثبیت",type:"review"};
  }

  function addEvent(data){
    const title=String(data.title||"").trim(),date=String(data.date||"").trim();if(!title||!date)throw new Error("عنوان و تاریخ رویداد الزامی است.");
    const event={id:uid("evt"),title,date,time:String(data.time||""),type:String(data.type||"درس"),course:String(data.course||""),notes:String(data.notes||""),done:false,createdAt:Date.now()};
    state.semesterEvents.push(event);save();return event;
  }
  function toggleEvent(id){const e=state.semesterEvents.find(x=>x.id===id);if(e){e.done=!e.done;save()}return e}
  function deleteEvent(id){state.semesterEvents=state.semesterEvents.filter(x=>x.id!==id);save()}
  function sortedEvents(){return [...state.semesterEvents].sort((a,b)=>`${a.date}T${a.time||"23:59"}`.localeCompare(`${b.date}T${b.time||"23:59"}`))}
  function icsEscape(s){return String(s||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n")}
  function icsDate(date,time){const d=String(date||"").replace(/-/g,"");return time?`${d}T${String(time).replace(":","")}00`:`${d}`}
  function exportICS(){
    const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Legal German MasterKit//Semester Operations//FA","CALSCALE:GREGORIAN"];
    sortedEvents().forEach(e=>{lines.push("BEGIN:VEVENT",`UID:${e.id}@legal-german-masterkit`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"")}`,`${e.time?"DTSTART":"DTSTART;VALUE=DATE"}:${icsDate(e.date,e.time)}`,`SUMMARY:${icsEscape(e.title)}`,`DESCRIPTION:${icsEscape([e.type,e.course,e.notes].filter(Boolean).join(" | "))}`,"END:VEVENT")});
    lines.push("END:VCALENDAR");download("Legal-German-Semester.ics",lines.join("\r\n"),"text/calendar;charset=utf-8");
  }

  function addSource(data){
    const title=String(data.title||"").trim();if(!title)throw new Error("عنوان منبع الزامی است.");
    const rawUrl=String(data.url||"").trim();if(rawUrl&&!/^https?:\/\//i.test(rawUrl))throw new Error("پیوند منبع باید با http:// یا https:// شروع شود.");
    const entry={id:uid("src"),type:String(data.type||"کتاب"),author:String(data.author||""),title,year:String(data.year||""),citation:String(data.citation||""),page:String(data.page||""),url:rawUrl,course:String(data.course||""),claim:String(data.claim||""),notes:String(data.notes||""),verified:false,createdAt:Date.now()};
    state.sourceMatrix.push(entry);save();return entry;
  }
  function toggleSource(id){const x=state.sourceMatrix.find(s=>s.id===id);if(x){x.verified=!x.verified;save()}return x}
  function deleteSource(id){state.sourceMatrix=state.sourceMatrix.filter(x=>x.id!==id);save()}
  function sourceAudit(){
    const rows=state.sourceMatrix.map(x=>({id:x.id,issues:[!x.author&&"نویسنده/مرجع",!x.year&&"سال",!x.citation&&"ارجاع کامل",!x.page&&x.type!=="وب‌سایت"&&"صفحه",!x.url&&x.type==="وب‌سایت"&&"پیوند",!x.claim&&"ادعای پشتیبانی‌شده"].filter(Boolean)}));
    return{total:rows.length,verified:state.sourceMatrix.filter(x=>x.verified).length,incomplete:rows.filter(x=>x.issues.length).length,rows};
  }
  function csvCell(s){return `"${String(s||"").replace(/"/g,'""')}"`}
  function exportSourcesCSV(){const head=["Type","Author","Title","Year","Citation","Page","URL","Course","Claim","Notes","Verified"],rows=state.sourceMatrix.map(x=>[x.type,x.author,x.title,x.year,x.citation,x.page,x.url,x.course,x.claim,x.notes,x.verified?"yes":"no"]);download("Legal-Research-Source-Matrix.csv","\ufeff"+[head,...rows].map(r=>r.map(csvCell).join(",")).join("\n"),"text/csv;charset=utf-8")}
  function bibKey(x,i){return norm(`${x.author||"source"}${x.year||"nd"}${i}`).replace(/[^a-z0-9]+/g,"")||`source${i}`}
  function exportBibTeX(){const text=state.sourceMatrix.map((x,i)=>`@${x.type==="مقاله"?"article":x.type==="وب‌سایت"?"online":"book"}{${bibKey(x,i)},\n  author = {${x.author}},\n  title = {${x.title}},\n  year = {${x.year}},\n  url = {${x.url}},\n  note = {${x.citation}${x.page?`, p. ${x.page}`:""}}\n}`).join("\n\n");download("Legal-Research-Sources.bib",text,"application/x-bibtex;charset=utf-8")}

  function searchAll(query){
    const q=norm(query);if(q.length<2)return[];const out=[],push=(type,title,sub,view,action)=>{if(norm(`${title} ${sub}`).includes(q))out.push({type,title,sub,view,action})};
    DATA.courses.forEach(c=>push("درس",c.title,`${c.area} · ${c.outcome} · ${c.units.join(" · ")} · ${c.statutes.join(" · ")}`,"courseWorkspace",{kind:"course",id:c.id}));
    DATA.vocab.forEach((v,i)=>push("اصطلاح",v.term,`${v.fa} · ${v.example}`,"language",{kind:"vocab",id:i}));
    DATA.sentences.forEach((s,i)=>push("قالب جمله",s.de,`${s.fa} · ${s.cat}`,"language",{kind:"sentence",id:i}));
    DATA.readings.forEach(r=>push("متن",r.title,`${r.area} · ${r.level}`,"reading",{kind:"reading",id:r.id}));
    DATA.cases.forEach(c=>push("پرونده",c.title,`${c.area} · ${c.question}`,"caseLab",{kind:"case",id:c.id}));
    DATA.books.forEach(b=>push("کتاب",`${b.author}: ${b.title}`,`${b.cat} · ${b.use}`,"library",{kind:"book",title:b.title}));
    DATA.resources.forEach(r=>push("منبع رسمی",r.title,`${r.kind} · ${r.use}`,"library",{kind:"resource",url:r.url}));
    state.semesterEvents.forEach(e=>push("رویداد",e.title,`${e.date} · ${e.type} · ${e.notes}`,"semesterOps",{kind:"event",id:e.id}));
    state.sourceMatrix.forEach(x=>push("منبع پژوهشی",x.title,`${x.author} · ${x.claim} · ${x.citation}`,"sourceMatrix",{kind:"source",id:x.id}));
    Object.entries(state.courseWorkspace.notes||{}).forEach(([id,text])=>push("یادداشت درس",courseById(id).title,text,"courseWorkspace",{kind:"note",id}));
    return out.slice(0,80);
  }
  function openSearchResult(result){
    const a=result.action||{};
    if(a.kind==="course"){selectCourse(a.id);return go("courseWorkspace")}
    if(a.kind==="vocab"){state.languageTab="vocab";state.languageQuery=DATA.vocab[a.id]?.term||"";state.languagePage=1;save();return go("language")}
    if(a.kind==="sentence"){state.languageTab="sentences";state.languageQuery=DATA.sentences[a.id]?.de||"";save();return go("language")}
    if(a.kind==="reading")return openAsset("reading",a.id);
    if(a.kind==="case")return openAsset("case",a.id);
    if(a.kind==="resource"&&a.url)return window.open(a.url,"_blank","noopener");
    if(a.kind==="event")return go("semesterOps");
    if(a.kind==="source")return go("sourceMatrix");
    if(a.kind==="note"){selectCourse(a.id);return go("courseWorkspace")}
    return go(result.view||"dashboard");
  }

  Object.assign(window,{v85CourseById:courseById,v85CourseSubject:courseSubject,v85CourseAssets:courseAssets,v85CourseProgress:courseProgress,v85ToggleStage:toggleStage,v85SelectCourse:selectCourse,v85SetCourseNotes:setCourseNotes,v85OpenAsset:openAsset,v85NextCourseAction:nextCourseAction,v85AddEvent:addEvent,v85ToggleEvent:toggleEvent,v85DeleteEvent:deleteEvent,v85SortedEvents:sortedEvents,v85ExportICS:exportICS,v85AddSource:addSource,v85ToggleSource:toggleSource,v85DeleteSource:deleteSource,v85SourceAudit:sourceAudit,v85ExportSourcesCSV:exportSourcesCSV,v85ExportBibTeX:exportBibTeX,v85SearchAll:searchAll,v85OpenSearchResult:openSearchResult});
})();