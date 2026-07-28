function renderReading(el){
 el.innerHTML=`<div class="panel"><h3>کتابخانه متون سطح‌بندی‌شده</h3>${DATA.readings.map((r,i)=>`<details class="accordion"><summary>${i+1}. ${r.title} <span class="pill">${r.level}</span> <span class="pill">${r.area}</span></summary><div><div class="box de">${r.de}</div><button class="btn secondary" data-speak-reading="${i}">شنیدن متن</button><details><summary>ترجمه مفهومی</summary><div class="feedback">${r.fa}</div></details><h4>سؤال‌های درک مطلب</h4><ol>${r.questions.map(q=>`<li>${q}</li>`).join("")}</ol><button class="btn ${state.readingDone[r.id]?"good":"secondary"}" data-reading-done="${r.id}">${state.readingDone[r.id]?"مطالعه ثبت شد":"ثبت تکمیل متن"}</button></div></details>`).join("")}</div>`
}
function renderResearch(el){
 const p=state.researchProject;
 el.innerHTML=`<div class="hero"><h2>Seminararbeit & Magisterarbeit</h2><p>راهنمای مرحله‌ای مطابق اسناد عمومی دانشکده؛ دستور اختصاصی استاد یا کرسی همواره مقدم است.</p></div>
 <div class="panel"><h3>پرونده پژوهش شخصی</h3><div class="grid two"><label>موضوع کاری<input id="rpTopic" class="input" value="${esc(p.topic)}"></label><label>مهلت<input id="rpDeadline" type="date" class="input" value="${esc(p.deadline)}"></label><label>پرسش پژوهش<textarea id="rpQuestion">${esc(p.question)}</textarea></label><label>یادداشت منابع و تصمیم‌ها<textarea id="rpNotes">${esc(p.notes)}</textarea></label></div><button class="btn" data-save-research-project>ذخیره پرونده پژوهش</button></div>
 <div class="panel"><h3>گردش‌کار ۱۰ مرحله‌ای</h3>${DATA.researchSteps.map(s=>`<label class="task"><input type="checkbox" data-research-step="${s.id}" ${state.researchDone[s.id]?"checked":""}><span><b>${s.title}</b><br>${s.desc}<br><small><b>خروجی:</b> ${s.output}</small></span></label>`).join("")}</div>
 <div class="feedback warn"><b>کنترل اجباری پیش از تحویل:</b> راهنمای Formalien دانشکده، شیوه اختصاصی کرسی، Eigenständigkeitserklärung، سازگاری Fußnoten و Literaturverzeichnis، و مستندسازی استفاده مجاز از ابزارهای هوش مصنوعی.</div>`
}
function renderCases(el){
 const i=Math.max(0,Math.min(state.caseIndex,DATA.cases.length-1)),c=DATA.cases[i],text=state.caseAnswers[c.id]||"";
 el.innerHTML=`<div class="panel"><div class="toolbar"><select id="caseSelect">${DATA.cases.map((x,j)=>`<option value="${j}" ${j===i?"selected":""}>${j+1}. ${x.title}</option>`).join("")}</select><span class="pill">${c.area}</span></div><h3>${c.title}</h3><div class="box de">${c.facts}</div><p><b>Rechtsfrage:</b> ${c.question}</p><p class="de"><b>Normen:</b> ${c.norms.join(" · ")}</p><textarea id="caseAnswer" placeholder="Obersatz – Definition – Subsumtion – Ergebnis">${esc(text)}</textarea><button class="btn" data-evaluate-case>ارزیابی ساختاری</button><div id="caseFeedback"></div><details class="accordion"><summary>عناصر مورد انتظار</summary><div><ul>${c.checks.map(x=>`<li>${x}</li>`).join("")}</ul></div></details><details class="accordion"><summary>پاسخ نمونه</summary><div class="de">${c.model}</div></details></div>`
}
function evaluateCase(text,c){const patterns=[["Obersatz",/könnte|zu prüfen/i],["Norm",/§|art\./i],["Definition/معیار",/setzt|voraus|ist ein|liegt vor/i],["Subsumtion",/im vorliegenden fall|hier|damit|weil|da /i],["Ergebnis",/im ergebnis|folglich|somit|besteht|rechtswidrig/i]];return patterns.map(([l,r])=>({l,ok:r.test(text)}))}
function renderExam(el){
 el.innerHTML=`<div class="panel"><h3>آزمون جامع Semester Pack</h3><form id="quizForm">${DATA.quiz.map((q,i)=>`<fieldset class="box"><legend>${i+1}. ${q.q}</legend>${q.options.map((o,j)=>`<label class="task"><input type="radio" name="q${i}" value="${j}"><span>${o}</span></label>`).join("")}<div id="ex${i}"></div></fieldset>`).join("")}<button class="btn" type="submit">تصحیح و تحلیل</button></form><div id="quizResult"></div></div>`
}
function renderProgress(el){
 const planTasks=state.plan.flatMap(x=>x.tasks),planDone=planTasks.filter(x=>x.done).length;
 el.innerHTML=`<div class="grid four"><div class="card"><h3>پیشرفت کل</h3><div class="metric">${percent()}٪</div><div class="progress"><span style="width:${percent()}%"></span></div></div><div class="card"><h3>برنامه ترم</h3><div class="metric">${planDone}/${planTasks.length||0}</div></div><div class="card"><h3>واژگان</h3><div class="metric">${Object.keys(state.mastered).length}/60</div></div><div class="card"><h3>متون</h3><div class="metric">${Object.keys(state.readingDone).length}/8</div></div><div class="card"><h3>پژوهش</h3><div class="metric">${Object.keys(state.researchDone).length}/10</div></div><div class="card"><h3>پرونده‌ها</h3><div class="metric">${Object.keys(state.caseAnswers).filter(k=>state.caseAnswers[k]?.length>120).length}/6</div></div><div class="card"><h3>آخرین آزمون</h3><div class="metric">${state.examScores.at(-1)?.score??"—"}</div></div><div class="card"><h3>زمان ثبت‌شده</h3><div class="metric">${state.minutes} دقیقه</div></div></div><button class="btn secondary" data-backup>دریافت پشتیبان JSON</button>`
}
function updateLanguageFilters(){
 state.languageQuery=document.querySelector("#languageSearch")?.value||"";
 state.languageCat=document.querySelector("#languageCat")?.value||"همه";save();render("language")
}
function wire(){
 if(window.__LGMK_WIRED)return;window.__LGMK_WIRED=true;
 document.body.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.open)go(b.dataset.open);
  if(b.hasAttribute("data-save-profile")){state.profile={name:document.querySelector("#pName").value,level:document.querySelector("#pLevel").value,hours:Number(document.querySelector("#pHours").value),focus:document.querySelector("#pFocus").value,semester:document.querySelector("#pSemester").value};generatePlan()}
  if(b.dataset.completeCourse){state.completed[b.dataset.completeCourse]=!state.completed[b.dataset.completeCourse];state.minutes+=20;save();render("subjects")}
  if(b.dataset.speakVocab!==undefined){const x=DATA.vocab[Number(b.dataset.speakVocab)];speak(`${x.term}. ${x.example}`,.85)}
  if(b.dataset.masterVocab!==undefined){state.mastered[b.dataset.masterVocab]=!state.mastered[b.dataset.masterVocab];state.minutes+=1;save();render("language")}
  if(b.dataset.speakSentence!==undefined)speak(DATA.sentences[Number(b.dataset.speakSentence)].de,.85);
  if(b.dataset.saveSentence!==undefined){state.savedSentences[b.dataset.saveSentence]=!state.savedSentences[b.dataset.saveSentence];save();render("language")}
  if(b.dataset.languageTab){state.languageTab=b.dataset.languageTab;state.languageCat="همه";save();render("language")}
  if(b.dataset.speakReading!==undefined)speak(DATA.readings[Number(b.dataset.speakReading)].de,.82);
  if(b.dataset.readingDone){state.readingDone[b.dataset.readingDone]=!state.readingDone[b.dataset.readingDone];state.minutes+=10;save();render("reading")}
  if(b.hasAttribute("data-save-research-project")){state.researchProject={topic:document.querySelector("#rpTopic").value,question:document.querySelector("#rpQuestion").value,deadline:document.querySelector("#rpDeadline").value,notes:document.querySelector("#rpNotes").value};save();alert("پرونده پژوهش ذخیره شد.")}
  if(b.hasAttribute("data-evaluate-case")){const c=DATA.cases[state.caseIndex],text=document.querySelector("#caseAnswer").value;state.caseAnswers[c.id]=text;state.minutes+=10;save();const r=evaluateCase(text,c);document.querySelector("#caseFeedback").innerHTML=r.map(x=>`<div class="feedback ${x.ok?"good":"warn"}">${x.ok?"✓":"○"} ${x.l}</div>`).join("")}
  if(b.hasAttribute("data-backup")){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="Legal-German-MasterKit-v9.3.3-backup.json";a.click();URL.revokeObjectURL(a.href)}
 });
 document.body.addEventListener("change",e=>{
  if(e.target.matches("[data-plan-task]")){for(const w of state.plan){const t=w.tasks.find(x=>x.id===e.target.dataset.planTask);if(t){t.done=e.target.checked;if(t.done)state.minutes+=Math.round(t.hours*60);break}}save()}
  if(e.target.matches("[data-research-step]")){state.researchDone[e.target.dataset.researchStep]=e.target.checked;save()}
  if(e.target.id==="subjectArea")render("subjects");
  if(e.target.id==="languageCat")updateLanguageFilters();
  if(e.target.id==="caseSelect"){state.caseIndex=Number(e.target.value);save();render("caseLab")}
 });
 document.body.addEventListener("input",e=>{if(e.target.id==="subjectSearch")render("subjects");if(e.target.id==="bookSearch")render("library");if(e.target.id==="languageSearch")updateLanguageFilters()});
 document.body.addEventListener("submit",e=>{if(e.target.id!=="quizForm")return;e.preventDefault();let score=0;DATA.quiz.forEach((q,i)=>{const v=e.target.elements[`q${i}`]?.value;const ok=Number(v)===q.answer;if(ok)score++;document.querySelector(`#ex${i}`).innerHTML=`<div class="feedback ${ok?"good":"warn"}">${ok?"✓ درست":"○ نیاز به مرور"} — ${q.explanation}</div>`});state.examScores.push({score:`${score}/${DATA.quiz.length}`,date:new Date().toISOString()});state.minutes+=20;save();document.querySelector("#quizResult").innerHTML=`<div class="feedback ${score>=16?"good":"warn"}"><b>امتیاز: ${score} از ${DATA.quiz.length}</b></div>`});
 const retry=document.querySelector("#retryBtn");if(retry)retry.onclick=()=>location.replace(`${location.pathname}?v=933&t=${Date.now()}`)
}
function setupInstall(){
 if(window.__LGMK_INSTALL_WIRED)return;window.__LGMK_INSTALL_WIRED=true;
 const b=document.querySelector("#installBtn");if(!b)return;
 window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;b.hidden=false});
 b.onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;b.hidden=true}
}
function boot(){
 if(window.__LGMK_BOOT_STATE==="running"||window.__LGMK_BOOT_STATE==="ready")return;
 window.__LGMK_BOOT_STATE="running";
 try{
  buildNav();wire();setupInstall();if(!state.plan.length)generatePlan();go(state.view);
  if("serviceWorker" in navigator)navigator.serviceWorker.register("service-worker.js?v=933").catch(()=>{});
  window.__LGMK_BOOT_STATE="ready";
  window.dispatchEvent(new CustomEvent("lgmk:ready",{detail:{version:window.LGMK_RELEASE_VERSION||"9.3.3"}}));
 }catch(err){
  window.__LGMK_BOOT_STATE="failed";console.error(err);
  const text=document.querySelector("#bootErrorText"),panel=document.querySelector("#bootError");
  if(text)text.textContent=err?.stack||err?.message||String(err);
  if(panel){panel.hidden=false;panel.style.display="grid"}
  window.LGMK_STARTUP?.record?.("boot",err)
 }
}
window.boot=boot;
if(document.readyState==="complete")queueMicrotask(boot);else document.addEventListener("DOMContentLoaded",boot,{once:true});
