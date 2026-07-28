"use strict";

const DEFAULT_STATE={view:"home",lesson:0,step:0,done:[],cards:{},skills:{},caseText:"",writing:"",minutes:0,history:[]};
const DB_NAME="lgmk-core";
const STORE_NAME="state";
let db=null;
let state={...DEFAULT_STATE};
let deferredInstall=null;

const lessons=[
  {title:"Kaufvertrag und Anspruch",level:"B2",steps:[
    ["Introduction","قرارداد خرید تعهدات اصلی دو طرف را ایجاد می‌کند.","Der Kaufvertrag begründet gegenseitige Hauptpflichten."],
    ["Vocabulary","Anspruch، Angebot، Annahme، Übergabe، Übereignung","K hat einen Anspruch auf Lieferung."],
    ["Pronunciation","عبارت Obersatz را بشنوید و تکرار کنید.","K könnte gegen V einen Anspruch aus § 433 BGB haben."],
    ["Grammar","Konjunktiv II برای احتمال حقوقی.","K könnte einen Anspruch haben."],
    ["Reading","K bestellt einen Laptop. V bestätigt, liefert aber nicht.","Welche Willenserklärungen liegen vor?"],
    ["Listening","کلیدواژه‌ها را پس از شنیدن ثبت کنید.","Ein Kaufvertrag kommt durch Angebot und Annahme zustande."],
    ["Speaking","مسئله را شفاهی بیان کنید.","Zu prüfen ist, ob K Lieferung verlangen kann."],
    ["Writing","یک Obersatz و Subsumtion بنویسید.","Damit liegen Angebot und Annahme vor."],
    ["Case Study","ODSE را اعمال کنید.","Obersatz – Definition – Subsumtion – Ergebnis"],
    ["Quiz","مبنای مطالبه چیست؟","§ 433 Abs. 1 BGB"],
    ["Summary","قرارداد از Angebot و Annahme تشکیل می‌شود.","Im Ergebnis besteht der Anspruch."],
    ["Review","واژگان به مرور فاصله‌دار می‌روند.","Anspruch · Angebot · Annahme"]
  ]},
  {title:"Sachmangel und Käuferrechte",level:"B2/C1",steps:[
    ["Introduction","عدم انطباق کالا می‌تواند Sachmangel باشد.","Die Sache ist mangelhaft."],
    ["Vocabulary","Sachmangel، Nacherfüllung، Rücktritt، Minderung","Der Käufer verlangt Nacherfüllung."],
    ["Pronunciation","حقوق خریدار را تکرار کنید.","Nacherfüllung, Rücktritt und Minderung."],
    ["Grammar","Modalverben برای حق و الزام.","Der Käufer kann Nacherfüllung verlangen."],
    ["Reading","کالا با مشخصات توافقی منطبق نیست.","Liegt ein Sachmangel vor?"],
    ["Listening","مهلت مناسب را بشنوید.","Der Käufer setzt eine angemessene Frist."],
    ["Speaking","ترتیب حقوق خریدار را توضیح دهید.","Zunächst kommt Nacherfüllung in Betracht."],
    ["Writing","عدم انطباق را Subsumtion کنید.","Die vereinbarte Beschaffenheit fehlt."],
    ["Case Study","عیب، مهلت و حقوق ثانویه.","Mangel – Frist – Rücktritt"],
    ["Quiz","حق اولیه چیست؟","Nacherfüllung"],
    ["Summary","حقوق ثانویه شروط بیشتری دارند.","Sekundärrechte setzen weitere Voraussetzungen voraus."],
    ["Review","واژگان عیب مرور می‌شوند.","Sachmangel · Fristsetzung · Rücktritt"]
  ]},
  {title:"Verwaltungsakt und Anhörung",level:"C1",steps:[
    ["Introduction","قانونی بودن شکلی شامل صلاحیت، تشریفات و شکل است.","Zuständigkeit, Verfahren und Form."],
    ["Vocabulary","Verwaltungsakt، Anhörung، Begründung، Heilung","Die Anhörung ist erforderlich."],
    ["Pronunciation","عبارت رسمی را تکرار کنید.","Der Verwaltungsakt ist formell rechtmäßig."],
    ["Grammar","Passiv در متن اداری.","Der Betroffene wird angehört."],
    ["Reading","مجوز بدون استماع رد می‌شود.","Ist das Verfahren ordnungsgemäß?"],
    ["Listening","ساختار بررسی را بشنوید.","Zunächst ist die Zuständigkeit zu prüfen."],
    ["Speaking","نقص تشریفات را توضیح دهید.","Die Anhörung ist unterblieben."],
    ["Writing","نتیجه محتاطانه بنویسید.","Es bestehen Zweifel an der Rechtmäßigkeit."],
    ["Case Study","صلاحیت، استماع، شکل، جبران.","Zuständigkeit – Anhörung – Heilung"],
    ["Quiz","Anhörung کجا بررسی می‌شود؟","Verfahren"],
    ["Summary","نقص تشریفات ممکن است قابل جبران باشد.","Der Fehler könnte heilbar sein."],
    ["Review","واژگان اداری مرور می‌شوند.","Anhörung · Begründung · Heilung"]
  ]}
];

const deck=[
  ["der Anspruch","حق مطالبه","K hat einen Anspruch."],
  ["das Angebot","ایجاب","K gibt ein Angebot ab."],
  ["die Annahme","قبول","V nimmt das Angebot an."],
  ["der Sachmangel","عیب مادی","Die Sache ist mangelhaft."],
  ["die Nacherfüllung","اجرای اصلاحی","Der Käufer verlangt Nacherfüllung."],
  ["die Fristsetzung","تعیین مهلت","Eine Frist wird gesetzt."],
  ["der Verwaltungsakt","تصمیم اداری","Der Bescheid ist ein Verwaltungsakt."],
  ["die Anhörung","استماع","Die Anhörung ist unterblieben."]
];

const views=["home","path","lesson","review","skills","case","writing","stats"];
const navLabels={home:["⌂","خانه"],path:["⌁","مسیر"],lesson:["▤","درس"],review:["⟳","مرور"],skills:["◫","مهارت"],case:["⚖","پرونده"],writing:["✎","نگارش"],stats:["◔","آمار"]};

function showBootError(error){
  const box=document.querySelector("#bootError");
  document.querySelector("#bootErrorText").textContent=error?.message||String(error);
  box.hidden=false;
}

function openDatabase(){
  return new Promise((resolve,reject)=>{
    if(!("indexedDB" in window)){resolve(null);return;}
    const request=indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE_NAME))request.result.createObjectStore(STORE_NAME);};
    request.onsuccess=()=>{db=request.result;resolve(db);};
    request.onerror=()=>reject(request.error);
  });
}

function loadState(){
  if(!db){
    try{return Promise.resolve({...DEFAULT_STATE,...JSON.parse(localStorage.getItem("lgmk-fallback")||"{}")});}catch{return Promise.resolve({...DEFAULT_STATE});}
  }
  return new Promise(resolve=>{
    const req=db.transaction(STORE_NAME).objectStore(STORE_NAME).get("main");
    req.onsuccess=()=>resolve({...DEFAULT_STATE,...(req.result||{})});
    req.onerror=()=>resolve({...DEFAULT_STATE});
  });
}

function saveState(eventName){
  if(eventName)state.history.push({event:eventName,time:Date.now()});
  localStorage.setItem("lgmk-fallback",JSON.stringify(state));
  if(!db)return Promise.resolve();
  return new Promise(resolve=>{
    const tx=db.transaction(STORE_NAME,"readwrite");
    tx.objectStore(STORE_NAME).put(state,"main");
    tx.oncomplete=resolve;
    tx.onerror=resolve;
  });
}

function buildNav(){
  const nav=document.querySelector("#mainNav");
  nav.innerHTML=views.map(v=>`<button type="button" data-view="${v}"><b>${navLabels[v][0]}</b>${navLabels[v][1]}</button>`).join("");
  nav.addEventListener("click",event=>{
    const button=event.target.closest("button[data-view]");
    if(button)go(button.dataset.view);
  });
}

function go(view){
  state.view=views.includes(view)?view:"home";
  document.querySelectorAll(".view").forEach(el=>el.classList.toggle("active",el.id===state.view));
  document.querySelectorAll("#mainNav button").forEach(el=>el.classList.toggle("active",el.dataset.view===state.view));
  render(state.view);
  saveState();
}

function speak(text,rate=.9){
  if(!("speechSynthesis" in window)){alert("مرورگر شما از پخش تلفظ پشتیبانی نمی‌کند.");return;}
  speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang="de-DE";
  utterance.rate=rate;
  speechSynthesis.speak(utterance);
}

function mastery(){
  const done=state.done.length/(lessons.length*12);
  const cards=Object.keys(state.cards).length/deck.length;
  const skills=Object.keys(state.skills).length/4;
  const outputs=((state.caseText.length>100?1:0)+(state.writing.length>100?1:0))/2;
  return Math.min(100,Math.round((done*.45+cards*.25+skills*.15+outputs*.15)*100));
}

function isDue(index){const card=state.cards[index];return !card||!card.next||card.next<=Date.now();}

async function rateCard(index,quality){
  const prev=state.cards[index]||{reps:0,ease:2.5,interval:0};
  const interval=quality===0?0:prev.reps?Math.max(1,Math.round(prev.interval*(quality===2?prev.ease:1.8))):(quality===2?4:1);
  state.cards[index]={reps:prev.reps+1,ease:Math.max(1.3,prev.ease+(quality===0?-.2:quality===2?.1:0)),interval,next:Date.now()+interval*86400000};
  state.minutes+=1;
  await saveState("review");
  render("review");
}

function render(view){
  const el=document.getElementById(view);
  if(view==="home"){
    el.innerHTML=`<div class="hero"><h2>برنامه با اجرای پایدار بارگذاری شد</h2><p>نسخه تفکیک‌شده HTML/CSS/JS با مسیر آموزشی، مرور، مهارت‌ها و ذخیره‌سازی.</p><button class="btn" data-action="open-path">شروع مسیر</button></div><div class="grid"><div class="card"><h3>تسلط</h3><div class="metric">${mastery()}٪</div><div class="progress"><span style="width:${mastery()}%"></span></div></div><div class="card"><h3>مرور امروز</h3><div class="metric">${deck.filter((_,i)=>isDue(i)).length}</div></div><div class="card"><h3>زمان ثبت‌شده</h3><div class="metric">${state.minutes} دقیقه</div></div></div>`;
  }
  if(view==="path"){
    el.innerHTML=`<div class="panel"><h3>مسیر آموزشی</h3>${lessons.map((lesson,i)=>{const count=[...Array(12).keys()].filter(j=>state.done.includes(`${i}-${j}`)).length;return `<div class="box"><b>${i+1}. ${lesson.title}</b> <span class="pill">${lesson.level}</span><div class="progress"><span style="width:${count/12*100}%"></span></div><small>${count}/12 مرحله</small><br><button class="btn secondary" data-open-lesson="${i}">باز کردن</button></div>`;}).join("")}</div>`;
  }
  if(view==="lesson"){
    const lesson=lessons[state.lesson]||lessons[0];
    const step=lesson.steps[state.step]||lesson.steps[0];
    const key=`${state.lesson}-${state.step}`;
    const audio=["Pronunciation","Listening","Speaking"].includes(step[0]);
    el.innerHTML=`<div class="panel"><span class="pill">${lesson.level}</span><span class="pill">${state.step+1}/12</span><h3>${lesson.title} — ${step[0]}</h3><p>${step[1]}</p><div class="box de">${step[2]}</div>${audio?`<button class="btn" data-speak="slow">آهسته</button><button class="btn" data-speak="normal">طبیعی</button>`:""}<div><button class="btn secondary" data-step="prev">قبلی</button><button class="btn good" data-complete="${key}">یاد گرفتم / بعدی</button></div></div>`;
  }
  if(view==="review"){
    const index=deck.findIndex((_,i)=>isDue(i));
    el.innerHTML=index<0?`<div class="panel"><h3>مرور امروز تمام شد</h3><p>کارت سررسیدشده‌ای باقی نمانده است.</p></div>`:`<div class="panel"><h3>مرور فاصله‌دار</h3><div class="box"><div class="de"><strong>${deck[index][0]}</strong><p>${deck[index][2]}</p></div><p>${deck[index][1]}</p></div><div class="rating"><button class="btn warn" data-rate="0" data-card="${index}">دوباره</button><button class="btn secondary" data-rate="1" data-card="${index}">متوسط</button><button class="btn good" data-rate="2" data-card="${index}">آسان</button></div></div>`;
  }
  if(view==="skills"){
    const items=[["Lesen","خواندن و تحلیل یک متن حقوقی"],["Hören","شنیدن و استخراج کلیدواژه"],["Schreiben","نوشتن یک پاراگراف حقوقی"],["Sprechen","بیان شفاهی یک Rechtsfrage"]];
    el.innerHTML=`<div class="grid">${items.map(([name,task])=>`<div class="card"><h3>${name}</h3><p>${task}</p><button class="btn ${state.skills[name]?"good":"secondary"}" data-skill="${name}">${state.skills[name]?"ثبت‌شده":"ثبت انجام"}</button></div>`).join("")}</div>`;
  }
  if(view==="case"){
    el.innerHTML=`<div class="panel"><h3>کلینیک پرونده</h3><div class="box de">K bestellt einen Laptop. V bestätigt die Bestellung, liefert aber nicht.</div><p>Prüfen Sie einen Anspruch aus § 433 Abs. 1 BGB.</p><textarea id="caseText">${state.caseText}</textarea><button class="btn" data-check="case">ارزیابی ساختاری</button><div id="caseFeedback"></div></div>`;
  }
  if(view==="writing"){
    el.innerHTML=`<div class="panel"><h3>آزمایشگاه نگارش</h3><p>یک پاراگراف علمی یا Gutachtenstil بنویسید.</p><textarea id="writingText">${state.writing}</textarea><button class="btn" data-check="writing">بررسی متن</button><div id="writingFeedback"></div></div>`;
  }
  if(view==="stats"){
    el.innerHTML=`<div class="grid"><div class="card"><h3>مراحل درس</h3><div class="metric">${state.done.length}/36</div></div><div class="card"><h3>کارت‌های مرورشده</h3><div class="metric">${Object.keys(state.cards).length}/8</div></div><div class="card"><h3>چهار مهارت</h3><div class="metric">${Object.keys(state.skills).length}/4</div></div></div>`;
  }
}

function evaluateText(text,type){
  const checks=type==="case"?[
    ["Obersatz",/könnte|zu prüfen/i],["مبنای قانونی",/§\s*433/i],["تعریف یا معیار",/voraus|kommt.*zustande|setzt/i],["Subsumtion",/im vorliegenden fall|damit|somit|weil/i],["Ergebnis",/im ergebnis|folglich|besteht/i]
  ]:[
    ["طول مناسب",text.trim().split(/\s+/).length>=25],["رابط استدلالی",/daher|folglich|jedoch|weil|somit/i.test(text)],["سبک رسمی",!/ich finde|quatsch|cool/i.test(text)],["اصطلاح حقوقی",/anspruch|norm|rechtsprechung|vertrag|vorschrift/i.test(text)]
  ];
  return checks.map(([label,test])=>({label,ok:typeof test==="boolean"?test:test.test(text)}));
}

function wireActions(){
  document.body.addEventListener("click",async event=>{
    const target=event.target.closest("button");
    if(!target)return;
    if(target.dataset.action==="open-path")go("path");
    if(target.dataset.openLesson!==undefined){state.lesson=Number(target.dataset.openLesson);state.step=0;await saveState();go("lesson");}
    if(target.dataset.step==="prev"){state.step=Math.max(0,state.step-1);await saveState();render("lesson");}
    if(target.dataset.complete){if(!state.done.includes(target.dataset.complete))state.done.push(target.dataset.complete);state.step=Math.min(11,state.step+1);state.minutes+=2;await saveState("lesson");render("lesson");}
    if(target.dataset.speak){const step=lessons[state.lesson].steps[state.step];speak(step[2],target.dataset.speak==="slow"?.7:1);}
    if(target.dataset.rate!==undefined)rateCard(Number(target.dataset.card),Number(target.dataset.rate));
    if(target.dataset.skill){state.skills[target.dataset.skill]=true;state.minutes+=5;await saveState("skill");render("skills");}
    if(target.dataset.check==="case"){
      const text=document.querySelector("#caseText").value;state.caseText=text;await saveState("case");const results=evaluateText(text,"case");document.querySelector("#caseFeedback").innerHTML=results.map(r=>`<div class="feedback">${r.ok?"✓":"○"} ${r.label}</div>`).join("");
    }
    if(target.dataset.check==="writing"){
      const text=document.querySelector("#writingText").value;state.writing=text;await saveState("writing");const results=evaluateText(text,"writing");document.querySelector("#writingFeedback").innerHTML=results.map(r=>`<div class="feedback">${r.ok?"✓":"○"} ${r.label}</div>`).join("");
    }
  });
  document.querySelector("#retryBtn").addEventListener("click",()=>location.reload());
}

function setupInstall(){
  const button=document.querySelector("#installBtn");
  window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstall=event;button.hidden=false;});
  button.addEventListener("click",async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;button.hidden=true;});
}

async function boot(){
  try{
    buildNav();
    wireActions();
    setupInstall();
    await openDatabase();
    state=await loadState();
    if(!views.includes(state.view))state.view="home";
    go(state.view);
    if("serviceWorker" in navigator)navigator.serviceWorker.register("service-worker.js?v=751").catch(()=>{});
  }catch(error){
    console.error(error);
    showBootError(error);
  }
}

document.addEventListener("DOMContentLoaded",boot);