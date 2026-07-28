"use strict";
const DATA=window.LGMK_DATA;
const KEY="lgmk-v810";
const DEFAULT={
 view:"dashboard",profile:{name:"سهیل",level:"B2",hours:10,focus:"balanced",semester:"WiSe 2026/27"},
 plan:[],completed:{},mastered:{},savedSentences:{},readingDone:{},researchDone:{},caseAnswers:{},caseIndex:0,
 examScores:[],minutes:0,researchProject:{topic:"",question:"",deadline:"",notes:""}
};
let state=mergeState(DEFAULT,loadRaw());
let deferredInstall=null;
const NAV=[
 ["dashboard","⌂","داشبورد"],["planner","▣","برنامه ترم"],["curriculum","◎","ساختار LL.M."],["subjects","§","سرفصل دروس"],
 ["library","▤","کتاب و منابع"],["language","A","زبان حقوقی"],["reading","◫","متون"],["research","✎","سمینار/پایان‌نامه"],
 ["caseLab","⚖","پرونده"],["exam","✓","آزمون"],["progressView","◔","پیشرفت"]
];
function mergeState(a,b){return {...a,...b,profile:{...a.profile,...(b.profile||{})},researchProject:{...a.researchProject,...(b.researchProject||{})}}}
function loadRaw(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function speak(text,rate=.9){if(!("speechSynthesis" in window))return alert("مرورگر از تلفظ پشتیبانی نمی‌کند.");speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="de-DE";u.rate=rate;speechSynthesis.speak(u)}
function go(view){state.view=NAV.some(x=>x[0]===view)?view:"dashboard";save();document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id===state.view));document.querySelectorAll("#mainNav button").forEach(x=>x.classList.toggle("active",x.dataset.view===state.view));render(state.view)}
function buildNav(){const n=document.querySelector("#mainNav");n.innerHTML=NAV.map(([id,ic,l])=>`<button type="button" data-view="${id}"><b>${ic}</b>${l}</button>`).join("");n.onclick=e=>{const b=e.target.closest("button[data-view]");if(b)go(b.dataset.view)}}
function officialCompleted(){return Object.keys(state.completed).length}
function percent(){const course=Math.min(1,officialCompleted()/20),vocab=Math.min(1,Object.keys(state.mastered).length/60),read=Math.min(1,Object.keys(state.readingDone).length/8),research=Math.min(1,Object.keys(state.researchDone).length/10),cases=Math.min(1,Object.keys(state.caseAnswers).filter(k=>state.caseAnswers[k]?.length>120).length/6);return Math.round((course*.25+vocab*.25+read*.15+research*.2+cases*.15)*100)}
function generatePlan(){
 const p=state.profile,h=Number(p.hours)||8;
 const weights=p.focus==="private"?[.42,.18,.15,.15,.1]:p.focus==="public"?[.18,.42,.15,.15,.1]:p.focus==="research"?[.2,.2,.1,.4,.1]:[.28,.25,.17,.2,.1];
 const cats=["Privatrecht","Öffentliches Recht","Europarecht","Forschung","Wiederholung"];
 const weekThemes=[
 "Grundbegriffe, Studienordnung und Gutachtenstil","Willenserklärung, Vertragsschluss und Anspruch","Leistungsstörungen und Kaufrecht",
 "Verwaltungsakt, Anhörung und Rechtsschutz","Grundfreiheiten und Verhältnismäßigkeit","Handels- und Gesellschaftsrecht",
 "Literaturrecherche und Zitierweise","Zwischenprüfung: Fälle und Sprachtest","Wirtschaftsverwaltungsrecht und Regulierung",
 "Kartell- und Beihilfenrecht","Seminarentwurf, Vortrag und Peer-Review","Gesamtwiederholung und Lernbericht"
 ];
 state.plan=weekThemes.map((theme,i)=>({
  week:i+1,theme,
  tasks:cats.map((cat,j)=>({id:`w${i+1}-${j}`,cat,hours:Math.max(.5,Math.round(h*weights[j]*2)/2),done:false,
  task:taskFor(cat,i)}))
 }));
 save();render("planner")
}
function taskFor(cat,i){
 const pools={
 "Privatrecht":["BGB AT: Angebot und Annahme","Schuldrecht AT: Fälligkeit und Verzug","Kaufrecht: Sachmangel und Nacherfüllung","Handelsrecht: Kaufmann und Prokura"],
 "Öffentliches Recht":["Verwaltungsakt und formelle Rechtmäßigkeit","Anhörung, Begründung und Heilung","Gewerbeuntersagung und Verhältnismäßigkeit","Rechtsschutz: Widerspruch und Klage"],
 "Europarecht":["Grundfreiheiten-Schema","Warenverkehrsfreiheit","Dienstleistungs- und Niederlassungsfreiheit","Art. 101 AEUV"],
 "Forschung":["Forschungsfrage formulieren","Literaturmatrix anlegen","Gliederung und Argumentationslinie","Fußnoten und Quellenkontrolle"],
 "Wiederholung":["۱۵ واژه و ۵ جمله مرور شود","یک پرونده در ۲۰ دقیقه حل شود","ارائه دو دقیقه‌ای ضبط شود","خطاهای هفته ثبت و اصلاح شود"]
 };const a=pools[cat];return a[i%a.length]
}
function render(view){
 const el=document.getElementById(view);
 if(view==="dashboard")renderDashboard(el);
 if(view==="planner")renderPlanner(el);
 if(view==="curriculum")renderCurriculum(el);
 if(view==="subjects")renderSubjects(el);
 if(view==="library")renderLibrary(el);
 if(view==="language")renderLanguage(el);
 if(view==="reading")renderReading(el);
 if(view==="research")renderResearch(el);
 if(view==="caseLab")renderCases(el);
 if(view==="exam")renderExam(el);
 if(view==="progressView")renderProgress(el)
}
