"use strict";
const KEY="lgmk-v760";
const DEFAULT={view:"today",done:{},vocab:{},skills:{},caseText:"",writing:"",examScores:[],minutes:0};
let state={...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||"{}")};
let deferredInstall=null;
const NAV=[
  ["today","⌂","امروز"],["courses","§","دروس حقوقی"],["vocab","A","واژگان و تلفظ"],["skills","◫","چهار مهارت"],
  ["caseLab","⚖","حل پرونده"],["writingLab","✎","نگارش علمی"],["exam","✓","آزمون"],["progressView","◔","پیشرفت"]
];
const COURSES=[
  {id:"contract",title:"Vertragsrecht",level:"B2",tasks:["§ 433 BGB و تعهدات طرفین","Angebot und Annahme","Obersatz و Subsumtion","آزمون کوتاه"]},
  {id:"defects",title:"Sachmangel und Käuferrechte",level:"B2/C1",tasks:["§§ 434–439 BGB","Nacherfüllung","Rücktritt und Minderung","پرونده عیب کالا"]},
  {id:"admin",title:"Wirtschaftsverwaltungsrecht",level:"C1",tasks:["Verwaltungsakt","Anhörung","formelle Rechtmäßigkeit","پرونده مجوز"]},
  {id:"eu",title:"EU-Wirtschaftsrecht",level:"C1",tasks:["Grundfreiheiten","Art. 101 AEUV","Diskriminierungsverbot","پرونده رقابت"]},
  {id:"academic",title:"Wissenschaftliches Arbeiten",level:"C1",tasks:["Seminararbeit","Magisterarbeit","Zitierweise","Präsentation"]}
];
const WORDS=[
  ["der Anspruch","حق مطالبه","K hat einen Anspruch auf Lieferung."],["das Angebot","ایجاب","K gibt ein Angebot ab."],["die Annahme","قبول","V nimmt das Angebot an."],["der Sachmangel","عیب مادی","Die Sache ist mangelhaft."],["die Nacherfüllung","اجرای اصلاحی","Der Käufer verlangt Nacherfüllung."],["der Rücktritt","فسخ","Der Käufer tritt vom Vertrag zurück."],["die Minderung","کاهش ثمن","Der Kaufpreis wird gemindert."],["der Verwaltungsakt","تصمیم اداری","Der Bescheid ist ein Verwaltungsakt."],["die Anhörung","استماع اظهارات","Die Anhörung ist erforderlich."],["die Verhältnismäßigkeit","تناسب","Die Maßnahme muss verhältnismäßig sein."]
];
const QUIZ=[
  ["کدام عبارت یک Obersatz است؟",["K könnte gegen V einen Anspruch haben.","K kauft gestern.","Das ist unfair."],0],
  ["قرارداد از چه تشکیل می‌شود؟",["Angebot und Annahme","فاکتور و رسید","پرداخت و تحویل"],0],
  ["حق اولیه خریدار در عیب چیست؟",["Nacherfüllung","Rücktritt فوری","هیچ حقی ندارد"],0],
  ["Anhörung در کدام بخش بررسی می‌شود؟",["Verfahren","Zuständigkeit","Ergebnis"],0],
  ["عبارت نتیجه‌گیری مناسب کدام است؟",["Im Ergebnis ist festzuhalten, dass …","Ich glaube …","Vielleicht …"],0]
];
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function speak(text,rate=.9){if(!speechSynthesis)return alert("تلفظ در این مرورگر پشتیبانی نمی‌شود.");speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="de-DE";u.rate=rate;speechSynthesis.speak(u);}
function go(view){state.view=NAV.some(x=>x[0]===view)?view:"today";save();document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id===state.view));document.querySelectorAll("#mainNav button").forEach(x=>x.classList.toggle("active",x.dataset.view===state.view));render(state.view);}
function buildNav(){const n=document.querySelector("#mainNav");n.innerHTML=NAV.map(([id,ic,l])=>`<button type="button" data-view="${id}"><b>${ic}</b>${l}</button>`).join("");n.onclick=e=>{const b=e.target.closest("button[data-view]");if(b)go(b.dataset.view);};}
function percent(){const courseDone=Object.keys(state.done).length/COURSES.length;const vocabDone=Object.keys(state.vocab).length/WORDS.length;const skillsDone=Object.keys(state.skills).length/4;const outputs=(state.caseText.length>120?1:0)+(state.writing.length>120?1:0);return Math.min(100,Math.round((courseDone*.3+vocabDone*.25+skillsDone*.2+outputs/2*.15+(state.examScores.length?1:0)*.1)*100));}
function render(view){const el=document.getElementById(view);if(view==="today"){
  const tasks=[
    ["۱۵ دقیقه درس حقوق قراردادها","courses"],["مرور ۵ واژه با تلفظ","vocab"],["نوشتن یک Obersatz","writingLab"],["حل یک پرونده کوتاه","caseLab"]
  ];
  el.innerHTML=`<div class="hero"><h2>برنامه امروز سهیل</h2><p>هر دکمه یک فعالیت واقعی را باز می‌کند؛ منوهای توضیحی حذف شده‌اند.</p></div><div class="grid">${tasks.map((t,i)=>`<div class="card"><h3>${i+1}. ${t[0]}</h3><button class="btn" data-open="${t[1]}">شروع فعالیت</button></div>`).join("")}</div>`;
}
if(view==="courses")el.innerHTML=`<div class="panel"><h3>دروس حقوقی</h3>${COURSES.map(c=>`<div class="box"><b class="de">${c.title}</b> <span class="pill">${c.level}</span><ul>${c.tasks.map(x=>`<li>${x}</li>`).join("")}</ul><button class="btn ${state.done[c.id]?"good":"secondary"}" data-course="${c.id}">${state.done[c.id]?"تکمیل ثبت شده":"ثبت پایان درس"}</button></div>`).join("")}</div>`;
if(view==="vocab")el.innerHTML=`<div class="panel"><h3>واژگان و تلفظ</h3>${WORDS.map((w,i)=>`<div class="box"><strong class="de">${w[0]}</strong><p>${w[1]}</p><div class="de">${w[2]}</div><button class="btn" data-speak="${i}" data-rate=".7">آهسته</button><button class="btn" data-speak="${i}" data-rate="1">طبیعی</button><button class="btn ${state.vocab[i]?"good":"secondary"}" data-word="${i}">${state.vocab[i]?"ثبت شده":"بلدم"}</button></div>`).join("")}</div>`;
if(view==="skills"){
 const items=[
  ["Lesen","متن § 433 BGB را بخوانید و سه تعهد استخراج کنید."],["Hören","جمله نمونه را پخش کنید و کلیدواژه‌ها را یادداشت کنید."],["Schreiben","یک Obersatz و یک Ergebnis بنویسید."],["Sprechen","مسئله پرونده را در ۶۰ ثانیه به آلمانی توضیح دهید."]
 ];el.innerHTML=`<div class="grid">${items.map(([n,t])=>`<div class="card"><h3>${n}</h3><p>${t}</p>${n==="Hören"||n==="Sprechen"?`<button class="btn" data-skill-audio="${n}">پخش نمونه</button>`:""}<button class="btn ${state.skills[n]?"good":"secondary"}" data-skill="${n}">${state.skills[n]?"انجام شد":"ثبت انجام"}</button></div>`).join("")}</div>`;
}
if(view==="caseLab")el.innerHTML=`<div class="panel"><h3>حل پرونده: Kaufvertrag</h3><div class="box de">K bestellt einen Laptop für 900 Euro. V bestätigt die Bestellung, liefert aber nicht.</div><p>بررسی کنید آیا K بر اساس § 433 Abs. 1 BGB حق مطالبه تحویل دارد.</p><textarea id="caseText">${state.caseText}</textarea><button class="btn" data-check="case">ارزیابی پاسخ</button><div id="caseFeedback"></div></div>`;
if(view==="writingLab")el.innerHTML=`<div class="panel"><h3>نگارش علمی</h3><p>این جمله محاوره‌ای را به زبان حقوقی تبدیل کنید:</p><div class="box de">Ich finde, V muss den Laptop geben.</div><textarea id="writingText">${state.writing}</textarea><button class="btn" data-check="writing">تحلیل متن</button><div id="writingFeedback"></div></div>`;
if(view==="exam")el.innerHTML=`<div class="panel"><h3>آزمون حقوقی-زبانی</h3><form id="quizForm">${QUIZ.map((q,i)=>`<fieldset class="box"><legend>${i+1}. ${q[0]}</legend>${q[1].map((o,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}"> ${o}</label>`).join("")}</fieldset>`).join("")}<button class="btn" type="submit">تصحیح آزمون</button></form><div id="quizResult"></div></div>`;
if(view==="progressView")el.innerHTML=`<div class="grid"><div class="card"><h3>پیشرفت کل</h3><div class="metric">${percent()}٪</div><div class="progress"><span style="width:${percent()}%"></span></div></div><div class="card"><h3>دروس تکمیل‌شده</h3><div class="metric">${Object.keys(state.done).length}/${COURSES.length}</div></div><div class="card"><h3>واژگان ثبت‌شده</h3><div class="metric">${Object.keys(state.vocab).length}/${WORDS.length}</div></div><div class="card"><h3>مهارت‌ها</h3><div class="metric">${Object.keys(state.skills).length}/4</div></div><div class="card"><h3>آخرین آزمون</h3><div class="metric">${state.examScores.at(-1)??"—"}</div></div></div>`;
}
function feedback(text,type){const checks=type==="case"?[["Obersatz",/könnte|zu prüfen/i],["§ 433",/§\s*433/i],["Angebot/Annahme",/angebot|annahme/i],["Subsumtion",/damit|somit|weil/i],["Ergebnis",/im ergebnis|folglich|besteht/i]]:[["حداقل ۲۰ واژه",text.trim().split(/\s+/).length>=20],["لحن رسمی",!/ich finde|quatsch|cool/i.test(text)],["رابط استدلالی",/weil|daher|somit|folglich/i.test(text)],["اصطلاح حقوقی",/anspruch|vertrag|vorschrift|norm/i.test(text)]];return checks.map(([l,t])=>({l,ok:typeof t==="boolean"?t:t.test(text)}));}
function wire(){document.body.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.open)go(b.dataset.open);if(b.dataset.course){state.done[b.dataset.course]=!state.done[b.dataset.course];save();render("courses");}if(b.dataset.word!==undefined){state.vocab[b.dataset.word]=!state.vocab[b.dataset.word];save();render("vocab");}if(b.dataset.speak!==undefined){const w=WORDS[Number(b.dataset.speak)];speak(`${w[0]}. ${w[2]}`,Number(b.dataset.rate));}if(b.dataset.skill){state.skills[b.dataset.skill]=true;state.minutes+=5;save();render("skills");}if(b.dataset.skillAudio){speak(b.dataset.skillAudio==="Hören"?"Ein Kaufvertrag kommt durch Angebot und Annahme zustande.":"Zu prüfen ist, ob K einen Anspruch auf Lieferung hat.",.85);}if(b.dataset.check){const id=b.dataset.check==="case"?"caseText":"writingText";const text=document.getElementById(id).value;state[b.dataset.check==="case"?"caseText":"writing"]=text;save();document.getElementById(b.dataset.check+"Feedback").innerHTML=feedback(text,b.dataset.check).map(x=>`<div class="feedback">${x.ok?"✓":"○"} ${x.l}</div>`).join("");}});
document.body.addEventListener("submit",e=>{if(e.target.id!=="quizForm")return;e.preventDefault();let s=0;QUIZ.forEach((q,i)=>{const v=e.target.elements[`q${i}`].value;if(Number(v)===q[2])s++;});state.examScores.push(`${s}/${QUIZ.length}`);save();document.getElementById("quizResult").innerHTML=`<div class="feedback">امتیاز: ${s} از ${QUIZ.length}</div>`;});document.getElementById("retryBtn").onclick=()=>location.reload();}
function setupInstall(){const b=document.getElementById("installBtn");window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;b.hidden=false;});b.onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;b.hidden=true;};}
function boot(){try{buildNav();wire();setupInstall();go(state.view);if("serviceWorker" in navigator)navigator.serviceWorker.register("service-worker.js?v=760").catch(()=>{});}catch(err){document.getElementById("bootErrorText").textContent=err.message;document.getElementById("bootError").hidden=false;}}
document.addEventListener("DOMContentLoaded",boot);
