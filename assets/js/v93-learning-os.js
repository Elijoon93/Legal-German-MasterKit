"use strict";
(function(){
  const VERSION="9.3.0";
  const PACK87=window.LGMK_V87_DATA||{norms:[],cases:[]};
  const COMPETENCIES=[
    {id:"method",code:"JM",title:"روش‌شناسی حقوقی",desc:"Obersatz، Definition، Subsumtion و Ergebnis",view:"writing",prerequisites:[]},
    {id:"vocabulary",code:"LX",title:"زبان و واژگان حقوقی",desc:"اصطلاح، Collocation و قالب جمله",view:"reviewCenter",prerequisites:[]},
    {id:"reading",code:"RD",title:"خواندن حقوقی",desc:"تشخیص مسئله، قاعده و استدلال در متن",view:"reading",prerequisites:["vocabulary"]},
    {id:"listening",code:"LS",title:"شنیدن دانشگاهی",desc:"فهم ارائه، توضیح استاد و بحث حقوقی",view:"listening",prerequisites:["vocabulary"]},
    {id:"case",code:"CA",title:"حل پرونده",desc:"انتقال قاعده به Sachverhalt",view:"caseLab",prerequisites:["method","reading"]},
    {id:"exam",code:"EX",title:"کاربرد در آزمون",desc:"پاسخ دقیق تحت محدودیت زمان",view:"exam",prerequisites:["case"]},
    {id:"writing",code:"WR",title:"نگارش دانشگاهی",desc:"تحلیل منسجم و استنادپذیر",view:"writing",prerequisites:["method","reading"]},
    {id:"research",code:"RS",title:"پژوهش و شواهد",desc:"ادعا، منبع، استناد و تحویل",view:"researchHub",prerequisites:["writing"]}
  ];
  const STAGES=[
    {id:"context",label:"هدف"},{id:"rule",label:"قاعده"},{id:"analysis",label:"تحلیل"},{id:"output",label:"خروجی"},{id:"review",label:"بازبینی"}
  ];
  const safe=(fn,fallback)=>{try{return typeof fn==="function"?fn():fallback}catch{return fallback}};
  const clamp=n=>Math.max(0,Math.min(100,Math.round(Number(n)||0)));
  const avg=(values,fallback=0)=>{const rows=values.map(Number).filter(Number.isFinite);return rows.length?Math.round(rows.reduce((a,b)=>a+b,0)/rows.length):fallback};
  const esc93=value=>typeof esc==="function"?esc(String(value??"")):String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
  const toast=(message,error=false)=>typeof v82Toast==="function"?v82Toast(message,error):console[error?"error":"log"](message);
  Object.assign(state,{v93:state.v93||{learningTab:"path",diagnostic:{},focus:null,sessions:{},evidence:[],toolsOpen:false}});
  state.v93.diagnostic=state.v93.diagnostic||{};state.v93.sessions=state.v93.sessions||{};state.v93.evidence=Array.isArray(state.v93.evidence)?state.v93.evidence:[];

  function percentOfObject(obj){return avg(Object.values(obj||{}),0)}
  function courseAverage(){return avg((DATA.courses||[]).map(c=>safe(()=>v85CourseProgress(c.id).percent,0)),0)}
  function writingAverage(){
    const versions=Object.values(state.writingHistory||{}).flat();
    const recent=versions.slice(-12).map(x=>Number(x.score));
    const direct=Object.values(state.writingScores||{}).map(Number);
    return avg([...recent,...direct],direct.length||recent.length?0:25);
  }
  function researchScore(){
    const sources=state.sourceMatrix||[],verified=sources.filter(x=>x.verified).length;
    const sourceScore=sources.length?verified/sources.length*100:20;
    const submission=safe(window.v88ChecklistStatus,{percent:0,requiredDone:0,required:12});
    const audit=Number(state.citationAudit?.last?.score);
    return avg([sourceScore,submission.percent,Number.isFinite(audit)?audit:25],20);
  }
  function evidenceScores(){
    const review=safe(window.v83ReviewStats,{retention:0,reviewed:0,due:0});
    const methodInputs=[...Object.values(state.caseScores||{}),...Object.values(state.examByCourse||{})].map(Number);
    const examAttempts=Object.values(state.examAttempts||{}).flat().map(x=>Number(x.percent));
    return{
      method:avg(methodInputs,25),
      vocabulary:review.reviewed?avg([review.retention,Math.min(100,review.reviewed/Math.max(1,DATA.vocab?.length||1)*160)],25):25,
      reading:percentOfObject(state.readingScores)||25,
      listening:percentOfObject(state.listeningScores)||25,
      case:percentOfObject(state.caseScores)||25,
      exam:avg([...Object.values(state.examByCourse||{}),...examAttempts],25),
      writing:writingAverage(),
      research:researchScore(),
      course:courseAverage()
    };
  }
  function competencyRows(){
    const evidence=evidenceScores();
    return COMPETENCIES.map(item=>{
      const self=Number(state.v93.diagnostic[item.id]);
      const hasSelf=Number.isFinite(self)&&self>0;
      const score=clamp(hasSelf?evidence[item.id]*.85+(self*20)*.15:evidence[item.id]);
      const prereqReady=item.prerequisites.every(id=>{
        const raw=COMPETENCIES.find(x=>x.id===id);if(!raw)return true;
        const rawSelf=Number(state.v93.diagnostic[id]),rawScore=clamp(Number.isFinite(rawSelf)&&rawSelf>0?evidence[id]*.85+(rawSelf*20)*.15:evidence[id]);
        return rawScore>=45;
      });
      return{...item,score,self:hasSelf?self:null,prereqReady,status:score>=80?"ready":score>=45?"active":"foundation",evidence:competencyEvidence(item.id)};
    });
  }
  function competencyEvidence(id){
    if(id==="vocabulary")return{count:Object.keys(state.srs||{}).length,label:"مرور ثبت‌شده"};
    if(id==="reading")return{count:Object.keys(state.readingScores||{}).length,label:"متن ارزیابی‌شده"};
    if(id==="listening")return{count:Object.keys(state.listeningScores||{}).length,label:"شنیدار ارزیابی‌شده"};
    if(id==="case")return{count:Object.keys(state.caseScores||{}).length,label:"پرونده حل‌شده"};
    if(id==="exam")return{count:Object.values(state.examAttempts||{}).flat().length||Object.keys(state.examByCourse||{}).length,label:"آزمون ثبت‌شده"};
    if(id==="writing")return{count:Object.values(state.writingHistory||{}).flat().length,label:"نسخه نگارش"};
    if(id==="research")return{count:(state.sourceMatrix||[]).length,label:"منبع پژوهشی"};
    return{count:Object.keys(state.caseScores||{}).length+Object.keys(state.examByCourse||{}).length,label:"شاهد روش‌شناختی"};
  }
  function weakest(){return [...competencyRows()].sort((a,b)=>a.score-b.score)[0]}
  function todayPlan(){return safe(window.v83GenerateDailyPlan,null)}
  function nextTask(){
    const plan=todayPlan();if(plan){const done=state.dailyDone?.[plan.date]||{},task=plan.tasks.find(x=>!done[x.id]);if(task)return{...task,date:plan.date}}
    const weak=weakest();return{id:`fallback-${weak.id}`,type:weak.id,view:weak.view,minutes:25,title:`تمرین ${weak.title}`,reason:`کمترین شایستگی فعلی: ${weak.score}%`,date:"manual"};
  }
  function coachReasons(task){
    const weak=weakest(),review=safe(window.v83ReviewStats,{due:0}),reasons=[];
    reasons.push(`این فعالیت به شایستگی «${weak.title}» مربوط است که امتیاز فعلی آن ${weak.score}% است.`);
    if(review.due>0)reasons.push(`${review.due} اصطلاح برای مرور فاصله‌دار سررسید شده است.`);
    if(task.subject)reasons.push(`درس هدف: ${task.subject}.`);
    reasons.push("انتخاب بر اساس شواهد ثبت‌شده انجام شده است؛ خودارزیابی فقط ۱۵٪ وزن دارد.");
    return reasons;
  }
  function taskResource(task){
    if(task.type==="reading"||task.type==="listening")return DATA.readings?.find(x=>String(x.id)===String(task.itemId));
    if(task.type==="case")return DATA.cases?.find(x=>String(x.id)===String(task.itemId));
    if(task.subject){
      const course=(DATA.courses||[]).find(c=>c.title===task.subject||c.area===task.subject||c.id===task.subject);
      if(course)return course;
    }
    return null;
  }
  function relevantNorms(task){
    const resource=taskResource(task),text=`${task.subject||""} ${task.title||""} ${resource?.area||""}`.toLowerCase();
    const course=(DATA.courses||[]).find(c=>text.includes(String(c.title||"").toLowerCase())||text.includes(String(c.area||"").toLowerCase()));
    const rows=PACK87.norms.filter(n=>course?n.courseId===course.id:text.includes(String(n.courseId||"").toLowerCase()));
    return rows.slice(0,3);
  }
  function sessionRecord(task){
    return state.v93.sessions[task.id]||(state.v93.sessions[task.id]={analysis:"",output:"",checks:{rule:false,structure:false,conclusion:false},startedAt:Date.now(),stage:0});
  }
  function startFocus(task=nextTask()){
    state.v93.focus={task:{...task},stage:0};sessionRecord(task);save();renderFocus();
  }
  function closeFocus(){state.v93.focus=null;save();document.querySelector("#v93FocusOverlay")?.remove()}
  function canAdvance(task,stage){
    const row=sessionRecord(task);
    if(stage===2)return row.analysis.trim().length>=40;
    if(stage===3)return row.output.trim().length>=80;
    if(stage===4)return Object.values(row.checks||{}).every(Boolean);
    return true;
  }
  function focusBody(task,stage){
    const row=sessionRecord(task),resource=taskResource(task),norms=relevantNorms(task);
    if(stage===0)return `<section class="v93-focus-intro"><span>${esc93(task.type||"activity")}</span><h3>${esc93(task.title)}</h3><p>${esc93(task.reason||"فعالیت پیشنهادی مربی")}</p><div>${coachReasons(task).map(x=>`<p>• ${esc93(x)}</p>`).join("")}</div></section>`;
    if(stage===1)return `<section class="v93-focus-rule"><h3>قاعده و منبع کار</h3>${resource?`<article><b>${esc93(resource.title||resource.term||"منبع مرتبط")}</b><p>${esc93(resource.question||resource.outcome||resource.bodyFa||resource.fa||resource.area||"")}</p></article>`:""}${norms.length?norms.map(n=>`<article><b class="de">${esc93(n.cite)} ${esc93(n.code)} — ${esc93(n.title)}</b><p>${esc93(n.ruleFa)}</p></article>`).join(""):`<article><b>کنترل منبع</b><p>قاعده مرتبط را در بانک مواد یا منابع درس کنترل کنید و سپس تحلیل را بنویسید.</p></article>`}</section>`;
    if(stage===2)return `<section class="v93-focus-write"><h3>تحلیل اولیه</h3><p>مسئله، قاعده و نحوه انطباق را با حداقل ۴۰ نویسه ثبت کنید.</p><textarea id="v93Analysis" rows="9" placeholder="Problem → Rule → Application...">${esc93(row.analysis)}</textarea><small>${row.analysis.trim().length}/40 حداقل</small></section>`;
    if(stage===3)return `<section class="v93-focus-write"><h3>خروجی قابل استفاده</h3><p>یک پاسخ منسجم با حداقل ۸۰ نویسه بنویسید که نتیجه روشن داشته باشد.</p><textarea id="v93Output" rows="11" placeholder="Obersatz, Subsumtion, Ergebnis...">${esc93(row.output)}</textarea><small>${row.output.trim().length}/80 حداقل</small></section>`;
    return `<section class="v93-focus-review"><h3>بازبینی قبل از ثبت</h3><label><input type="checkbox" data-v93-check="rule" ${row.checks.rule?"checked":""}> قاعده یا منبع مرتبط کنترل شده است.</label><label><input type="checkbox" data-v93-check="structure" ${row.checks.structure?"checked":""}> ساختار پاسخ روشن و مرحله‌ای است.</label><label><input type="checkbox" data-v93-check="conclusion" ${row.checks.conclusion?"checked":""}> نتیجه نهایی صریح و قابل دفاع است.</label><aside><b>تحلیل:</b><p>${esc93(row.analysis)}</p><b>خروجی:</b><p>${esc93(row.output)}</p></aside></section>`;
  }
  function renderFocus(){
    const focus=state.v93.focus;if(!focus)return closeFocus();const task=focus.task,row=sessionRecord(task),stage=focus.stage;
    let overlay=document.querySelector("#v93FocusOverlay");if(!overlay){overlay=document.createElement("div");overlay.id="v93FocusOverlay";overlay.className="v93-overlay";document.body.appendChild(overlay)}
    overlay.innerHTML=`<section class="v93-focus-dialog" role="dialog" aria-modal="true" aria-label="جلسه تمرکز"><header><button id="v93CloseFocus" aria-label="بستن">×</button><div><b>جلسه تمرکز حقوقی</b><small>${esc93(task.title)} · ${task.minutes||25} دقیقه</small></div><span>${stage+1}/${STAGES.length}</span></header><nav>${STAGES.map((s,i)=>`<i class="${i<stage?"done":i===stage?"current":""}"><span>${i+1}</span><b>${s.label}</b></i>`).join("")}</nav><main>${focusBody(task,stage)}</main><footer><button id="v93BackFocus" class="secondary" ${stage===0?"disabled":""}>مرحله قبل</button><button id="v93NextFocus" class="primary">${stage===STAGES.length-1?"ثبت خروجی":"ادامه"}</button></footer></section>`;
  }
  function completeFocus(){
    const focus=state.v93.focus,task=focus.task,row=sessionRecord(task);if(!canAdvance(task,4)){toast("سه کنترل بازبینی باید تکمیل شود.",true);return}
    if(task.date&&task.date!=="manual"){state.dailyDone[task.date]=state.dailyDone[task.date]||{};state.dailyDone[task.date][task.id]=true}
    state.v93.evidence.unshift({id:`ev-${Date.now()}`,taskId:task.id,type:task.type,title:task.title,analysis:row.analysis,output:row.output,date:Date.now()});
    state.v93.evidence=state.v93.evidence.slice(0,100);state.minutes=(Number(state.minutes)||0)+(Number(task.minutes)||20);row.completedAt=Date.now();save();closeFocus();toast("خروجی جلسه ثبت شد.");go("dashboard");
  }

  function competencyNode(row,index){return `<button class="v93-competency ${row.status} ${row.prereqReady?"":"locked"}" data-view="${row.view}"><span>${row.code}</span><div><b>${index+1}. ${row.title}</b><small>${row.desc}</small><em>${row.evidence.count} ${row.evidence.label}</em></div><strong>${row.score}%</strong></button>`}
  function dashboard(el){
    const task=nextTask(),plan=todayPlan(),done=plan?state.dailyDone?.[plan.date]||{}:{},rows=competencyRows(),weak=weakest(),today=(plan?.tasks||[]).slice(0,3);
    el.innerHTML=`<section class="v93-home"><header class="v93-welcome"><div><span>LEGAL GERMAN · LL.M. OEC.</span><h2>سلام ${esc93(state.profile?.name||"دانشجو")}</h2><p>امروز فقط روی یک خروجی مشخص تمرکز کنید.</p></div><i>${esc93(state.profile?.level||"B2")}</i></header><article class="v93-focus-card"><span class="v93-kicker">NEXT BEST ACTION</span><h1>${esc93(task.title)}</h1><p>${esc93(task.reason||`تقویت ${weak.title}`)}</p><button id="v93StartFocus"><div><b>شروع جلسه تمرکز</b><small>${task.minutes||25} دقیقه · پنج مرحله · خروجی ذخیره‌شونده</small></div><strong>←</strong></button><details><summary>چرا این فعالیت انتخاب شد؟</summary>${coachReasons(task).map(x=>`<p>${esc93(x)}</p>`).join("")}</details></article><section class="v93-today"><header><h2>برنامه کوتاه امروز</h2><button data-view="planner">مشاهده برنامه</button></header><div>${today.map((item,i)=>`<article class="${done[item.id]?"done":""}"><span>${String(i+1).padStart(2,"0")}</span><div><b>${esc93(item.title)}</b><small>${esc93(item.reason)} · ${item.minutes} دقیقه</small></div><button data-v93-task="${i}">${done[item.id]?"انجام شد":"تمرکز"}</button></article>`).join("")||"<p class='muted'>برنامه امروز تولید نشده است.</p>"}</div></section><section class="v93-path"><header><div><span>COMPETENCY PATH</span><h2>مسیر شایستگی حقوقی</h2><p>امتیازها از فعالیت واقعی محاسبه می‌شوند؛ خودارزیابی حداکثر ۱۵٪ وزن دارد.</p></div><button data-view="skillsHub">مشاهده کامل</button></header><div>${rows.slice(0,4).map(competencyNode).join("")}</div></section><section class="v93-quick-grid"><button data-view="studyHub"><span>ST</span><b>تحصیل</b><small>درس و نیم‌سال</small></button><button data-view="skillsHub"><span>LG</span><b>یادگیری</b><small>مهارت و مسیر</small></button><button data-view="practiceHub"><span>PR</span><b>تمرین</b><small>پرونده و آزمون</small></button><button data-view="researchHub"><span>RS</span><b>پژوهش</b><small>منبع و تحویل</small></button></section></section>`;
  }
  function skillsHub(el){
    const tab=state.v93.learningTab||"path",rows=competencyRows(),review=safe(window.v83ReviewStats,{due:0,mature:0,retention:0});
    const tabs=[['path','مسیر من'],['skills','چهار مهارت'],['review','مرور'],['diagnostic','ارزیابی تشخیصی']];
    let content="";
    if(tab==="path")content=`<section class="v93-competency-list">${rows.map(competencyNode).join("")}</section>`;
    if(tab==="skills")content=`<section class="v93-skill-actions"><button data-view="reading"><span>RD</span><div><b>خواندن</b><small>${Object.keys(state.readingScores||{}).length} ارزیابی ثبت‌شده</small></div></button><button data-view="listening"><span>LS</span><div><b>شنیدن</b><small>${Object.keys(state.listeningScores||{}).length} ارزیابی ثبت‌شده</small></div></button><button data-view="speaking"><span>SP</span><div><b>گفتار</b><small>ارائه و استدلال شفاهی</small></div></button><button data-view="writing"><span>WR</span><div><b>نگارش</b><small>${Object.values(state.writingHistory||{}).flat().length} نسخه ثبت‌شده</small></div></button></section>`;
    if(tab==="review")content=`<section class="v93-review"><div><article><small>سررسید</small><b>${review.due}</b></article><article><small>کارت بالغ</small><b>${review.mature}</b></article><article><small>نگهداشت</small><b>${review.retention}%</b></article></div><button data-view="reviewCenter">شروع مرور فاصله‌دار</button></section>`;
    if(tab==="diagnostic")content=`<form id="v93Diagnostic" class="v93-diagnostic"><p>این بخش خودارزیابی است و گواهی رسمی محسوب نمی‌شود. برای هر شایستگی از ۱ تا ۵ امتیاز ثبت کنید.</p>${COMPETENCIES.map(item=>`<label><span><b>${item.title}</b><small>${item.desc}</small></span><select name="${item.id}"><option value="0">ثبت نشده</option>${[1,2,3,4,5].map(n=>`<option value="${n}" ${Number(state.v93.diagnostic[item.id])===n?"selected":""}>${n}</option>`).join("")}</select></label>`).join("")}<button type="submit">ذخیره خودارزیابی</button></form>`;
    el.innerHTML=`<header class="v91-page-head"><div><span>ADAPTIVE LEARNING</span><h2>مسیر شایستگی و مربی تطبیقی</h2><p>اولویت‌ها با ترکیب شواهد فعالیت و خودارزیابی اختیاری تعیین می‌شوند.</p></div><div class="v91-head-actions"><button id="v93FocusWeak">تمرین نقطه‌ضعف</button></div></header><nav class="v91-tabs">${tabs.map(([id,label])=>`<button class="${tab===id?"active":""}" data-v93-learning-tab="${id}">${label}</button>`).join("")}</nav><section class="v93-coach-strip"><div><span>پیشنهاد مربی</span><b>${weakest().title}</b><small>امتیاز فعلی ${weakest().score}% · ${weakest().evidence.count} شاهد</small></div><button data-v93-focus-weak>شروع تمرین</button></section>${content}`;
  }
  function advancedDrawer(){
    let overlay=document.querySelector("#v93ToolsOverlay");if(!overlay){overlay=document.createElement("div");overlay.id="v93ToolsOverlay";overlay.className="v93-tools-overlay";document.body.appendChild(overlay)}
    overlay.innerHTML=`<aside class="v93-tools"><header><div><span>ADVANCED TOOLS</span><h2>ابزارهای پیشرفته</h2></div><button id="v93CloseTools">×</button></header><p>این ابزارها از مسیر اصلی یادگیری جدا شده‌اند تا رابط دانشجو خلوت بماند.</p><div><button data-view="globalSearch"><span>GS</span><b>جست‌وجوی کل</b></button><button data-view="reportCenter"><span>RP</span><b>گزارش و داده</b></button><button data-view="progressView"><span>PG</span><b>پیشرفت</b></button><button data-view="deviceAcceptance"><span>DV</span><b>پذیرش دستگاه</b></button><button data-view="curriculum"><span>CU</span><b>ساختار دوره</b></button><button data-view="library"><span>LB</span><b>کتابخانه</b></button></div></aside>`;
    state.v93.toolsOpen=true;save();
  }
  function closeTools(){state.v93.toolsOpen=false;save();document.querySelector("#v93ToolsOverlay")?.remove()}
  function enhanceShell(){
    const group=[...document.querySelectorAll(".v90-nav-groups section")].find(s=>s.querySelector("h4")?.textContent.includes("ساختار و ابزار"));if(group)group.classList.add("v93-advanced-group");
    if(!document.querySelector("#v93Tools")){const button=document.createElement("button");button.id="v93Tools";button.type="button";button.textContent="ابزارها";document.querySelector(".v90-top-actions")?.prepend(button)}
    const badge=document.querySelector("#v90ReleaseBadge");if(badge)badge.textContent=`v${VERSION}`;
    const brand=document.querySelector(".v90-brand small");if(brand)brand.textContent=`MasterKit · v${VERSION}`;
    document.documentElement.dataset.release=VERSION;document.documentElement.dataset.learningOs="dual-reference-v93";
  }
  const previousBuildNav=window.buildNav;if(typeof previousBuildNav==="function")window.buildNav=function(){previousBuildNav();enhanceShell()};
  const previousGo=window.go;if(typeof previousGo==="function")window.go=function(view){previousGo(view);enhanceShell()};
  const previousRender=window.render;
  window.render=function(view){const el=document.getElementById(view);if(view==="dashboard")return dashboard(el);if(view==="skillsHub")return skillsHub(el);return previousRender(view)};

  document.body.addEventListener("input",event=>{
    const focus=state.v93.focus;if(!focus)return;const row=sessionRecord(focus.task);
    if(event.target.id==="v93Analysis"){row.analysis=event.target.value;save()}
    if(event.target.id==="v93Output"){row.output=event.target.value;save()}
  });
  document.body.addEventListener("change",event=>{
    const input=event.target.closest("[data-v93-check]");if(input&&state.v93.focus){const row=sessionRecord(state.v93.focus.task);row.checks[input.dataset.v93Check]=input.checked;save()}
  });
  document.body.addEventListener("submit",event=>{
    if(event.target.id!=="v93Diagnostic")return;event.preventDefault();const form=new FormData(event.target);COMPETENCIES.forEach(item=>state.v93.diagnostic[item.id]=Number(form.get(item.id))||0);save();toast("خودارزیابی ذخیره شد.");render("skillsHub");
  });
  document.body.addEventListener("click",event=>{
    const tab=event.target.closest("[data-v93-learning-tab]");if(tab){state.v93.learningTab=tab.dataset.v93LearningTab;save();render("skillsHub");return}
    if(event.target.closest("#v93Tools")){advancedDrawer();return}
    if(event.target.closest("#v93CloseTools")||event.target.id==="v93ToolsOverlay"){closeTools();return}
    const drawerRoute=event.target.closest("#v93ToolsOverlay [data-view]");if(drawerRoute){closeTools();return}
    if(event.target.closest("#v93StartFocus")){startFocus();return}
    const taskButton=event.target.closest("[data-v93-task]");if(taskButton){const plan=todayPlan(),task=plan?.tasks?.[Number(taskButton.dataset.v93Task)];if(task)startFocus({...task,date:plan.date});return}
    if(event.target.closest("#v93FocusWeak")||event.target.closest("[data-v93-focus-weak]")){const weak=weakest();startFocus({id:`weak-${weak.id}-${Date.now()}`,type:weak.id,view:weak.view,minutes:25,title:`تمرین ${weak.title}`,reason:`کمترین امتیاز شایستگی: ${weak.score}%`,date:"manual"});return}
    if(event.target.closest("#v93CloseFocus")){closeFocus();return}
    if(event.target.closest("#v93BackFocus")&&state.v93.focus){state.v93.focus.stage=Math.max(0,state.v93.focus.stage-1);save();renderFocus();return}
    if(event.target.closest("#v93NextFocus")&&state.v93.focus){const focus=state.v93.focus;if(!canAdvance(focus.task,focus.stage)){toast(focus.stage===2?"تحلیل باید حداقل ۴۰ نویسه باشد.":focus.stage===3?"خروجی باید حداقل ۸۰ نویسه باشد.":"کنترل‌های بازبینی را کامل کنید.",true);return}if(focus.stage===STAGES.length-1)return completeFocus();focus.stage+=1;save();renderFocus();return}
  },true);
  document.addEventListener("keydown",event=>{if(event.key==="Escape"){if(document.querySelector("#v93FocusOverlay"))closeFocus();else closeTools()}});
  function boot(){enhanceShell();if(state.v93.focus)renderFocus()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  window.LGMK_V93={version:VERSION,competencies:COMPETENCIES,competencyRows,nextTask,startFocus};
})();
