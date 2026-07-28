"use strict";

Object.assign(state,{
  srs:state.srs||{},
  reviewGoal:Number(state.reviewGoal)||20,
  reviewSession:state.reviewSession||null,
  reviewHistory:state.reviewHistory||[],
  dailyPlans:state.dailyPlans||{},
  dailyDone:state.dailyDone||{},
  writingHistory:state.writingHistory||{},
  examAttempts:state.examAttempts||{},
  errorLog:state.errorLog||{},
  reportNotes:state.reportNotes||"",
  migrationVersion:3
});

NAV.splice(0,NAV.length,
  ["dashboard","DB","داشبورد"],
  ["planner","PL","برنامه ترم"],
  ["adaptive","AD","مسیر تطبیقی"],
  ["reviewCenter","SR","مرور هوشمند"],
  ["curriculum","CU","ساختار دوره"],
  ["subjects","SJ","سرفصل دروس"],
  ["library","LB","کتاب و منابع"],
  ["language","LX","زبان حقوقی"],
  ["reading","RD","خواندن"],
  ["listening","LS","شنیدن"],
  ["speaking","SP","گفتار"],
  ["writing","WR","نگارش"],
  ["research","RS","پژوهش"],
  ["caseLab","FL","پرونده"],
  ["exam","EX","آزمون‌ها"],
  ["reportCenter","RP","گزارش و داده"]
);

function v83DateKey(date=new Date()){
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function v83DayStart(date=new Date()){const x=new Date(date);x.setHours(0,0,0,0);return x.getTime()}
function v83AddDays(ts,days){const d=new Date(ts);d.setDate(d.getDate()+days);d.setHours(0,0,0,0);return d.getTime()}
function v83Clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function v83Average(values,fallback=0){const a=values.filter(Number.isFinite);return a.length?Math.round(a.reduce((s,x)=>s+x,0)/a.length):fallback}
function v83TrueCount(obj){return Object.keys(obj||{}).filter(k=>obj[k]).length}

function v83SrsRecord(index){
  return state.srs[index]||{reps:0,ease:2.5,interval:0,due:0,lapses:0,last:0,lastGrade:null};
}
function v83DueIndices(){
  const now=v83DayStart();
  return DATA.vocab.map((_,i)=>i).filter(i=>{const r=state.srs[i];return !r||!r.due||r.due<=now}).sort((a,b)=>{
    const ra=state.srs[a],rb=state.srs[b];
    if(!ra&&!rb)return a-b;if(!ra)return 1;if(!rb)return -1;return (ra.due||0)-(rb.due||0);
  });
}
function v83StartReview(force=false){
  const today=v83DateKey();
  if(!force&&state.reviewSession&&state.reviewSession.date===today&&state.reviewSession.position<state.reviewSession.queue.length)return state.reviewSession;
  const queue=v83DueIndices().slice(0,v83Clamp(Number(state.reviewGoal)||20,5,60));
  state.reviewSession={date:today,queue,position:0,revealed:false,correct:0};
  save();
  return state.reviewSession;
}
function v83CurrentReview(){const s=v83StartReview();return s.queue[s.position]}
function v83RevealReview(){const s=v83StartReview();s.revealed=true;save()}
function v83RateReview(index,grade){
  const old=v83SrsRecord(index),now=v83DayStart();
  let reps=old.reps,ease=old.ease,interval=old.interval,lapses=old.lapses;
  if(grade===0){reps=0;interval=1;ease=Math.max(1.3,ease-.2);lapses+=1}
  if(grade===1){reps+=1;interval=reps<=1?1:Math.max(2,Math.round(Math.max(1,interval)*1.35));ease=Math.max(1.3,ease-.08)}
  if(grade===2){reps+=1;interval=reps===1?1:reps===2?3:Math.max(3,Math.round(Math.max(1,interval)*ease))}
  if(grade===3){reps+=1;interval=reps===1?4:Math.max(5,Math.round(Math.max(1,interval)*(ease+.25)));ease=Math.min(3,ease+.08)}
  state.srs[index]={reps,ease:Number(ease.toFixed(2)),interval,due:v83AddDays(now,interval),lapses,last:Date.now(),lastGrade:grade};
  const s=v83StartReview();if(grade>=2)s.correct+=1;s.position+=1;s.revealed=false;
  state.reviewHistory.push({date:Date.now(),index,grade,interval});
  if(state.reviewHistory.length>2000)state.reviewHistory=state.reviewHistory.slice(-2000);
  state.minutes+=1;save();
}
function v83ReviewStats(){
  const records=Object.values(state.srs||{}),due=v83DueIndices().length;
  return{due,reviewed:records.length,mature:records.filter(r=>r.interval>=21).length,retention:records.length?Math.round(records.filter(r=>r.lastGrade>=2).length/records.length*100):0};
}

const V83_SUBJECT_RULES=[
  ["BGB Allgemeiner Teil",["BGB Allgemeiner Teil","Vertragsrecht","Willenserklärung","Anfechtung"]],
  ["Schuldrecht Allgemeiner Teil",["Schuldrecht Allgemeiner Teil","Schuldrecht","Verzug","Unmöglichkeit"]],
  ["Kauf- und Verbraucherrecht",["Kauf- und Verbraucherrecht","Kaufrecht","Verbraucherrecht","Sachmangel"]],
  ["Handelsrecht",["Handelsrecht","Kaufmann","Prokura"]],
  ["Gesellschaftsrecht",["Gesellschaftsrecht","Gesellschaft","GmbH","AG"]],
  ["Allgemeines Verwaltungsrecht",["Allgemeines Verwaltungsrecht","Verwaltungsrecht","Verwaltungsakt","VwVfG"]],
  ["Wirtschaftsverwaltungs- und Vergaberecht",["Wirtschaftsverwaltungs","Vergaberecht","Gewerbe","Genehmigung"]],
  ["Europäisches Wirtschaftsrecht",["Europäisches Wirtschaftsrecht","Europarecht","Grundfreiheit","Warenverkehr"]],
  ["Wettbewerbs-, Arbeits- und Immaterialgüterrecht",["Wettbewerb","Kartell","Arbeitsrecht","Immaterial","Urheber"]],
  ["Juristische Methodik und Forschung",["Methodik","Forschung","Gutachtenstil","Seminar","Magister"]]
];
function v83SubjectFor(value){
  const s=String(value||"").toLowerCase();
  const hit=V83_SUBJECT_RULES.find(([,keys])=>keys.some(k=>s.includes(k.toLowerCase())));
  return hit?hit[0]:"Juristische Methodik und Forschung";
}
function v83ScoresBySubject(){
  const subjects=Object.keys(DATA.exams),result={};
  subjects.forEach(subject=>{
    const exam=Number(state.examByCourse?.[subject]);
    const reading=Object.entries(state.readingScores||{}).filter(([id])=>v83SubjectFor(DATA.readings.find(r=>String(r.id)===String(id))?.area)===subject).map(([,x])=>Number(x));
    const listening=Object.entries(state.listeningScores||{}).filter(([id])=>v83SubjectFor(DATA.readings.find(r=>String(r.id)===String(id))?.area)===subject).map(([,x])=>Number(x));
    const cases=Object.entries(state.caseScores||{}).filter(([id])=>v83SubjectFor(DATA.cases.find(c=>String(c.id)===String(id))?.area)===subject).map(([,x])=>Number(x));
    const vocabIndices=DATA.vocab.map((v,i)=>({v,i})).filter(x=>v83SubjectFor(x.v.area)===subject);
    const vocabScores=vocabIndices.map(x=>{const r=state.srs[x.i];return r?Math.min(100,25+r.reps*12+Math.min(35,r.interval)):state.mastered?.[x.i]?65:20});
    const components={
      exam:Number.isFinite(exam)?exam:35,
      reading:v83Average(reading,35),
      listening:v83Average(listening,35),
      cases:v83Average(cases,35),
      vocab:v83Average(vocabScores,25)
    };
    const score=Math.round(components.exam*.38+components.reading*.14+components.listening*.12+components.cases*.18+components.vocab*.18);
    result[subject]={subject,score,components,assessed:Number.isFinite(exam)||reading.length||listening.length||cases.length};
  });
  return result;
}
function v83Weaknesses(){return Object.values(v83ScoresBySubject()).sort((a,b)=>a.score-b.score)}
function v83FindReadingFor(subject,mode){
  const scores=mode==="listening"?(state.listeningScores||{}):(state.readingScores||{});
  const list=DATA.readings.filter(r=>v83SubjectFor(r.area)===subject);
  return list.sort((a,b)=>(Number(scores[a.id])||-1)-(Number(scores[b.id])||-1))[0]||DATA.readings[0];
}
function v83FindCaseFor(subject){return DATA.cases.find(c=>v83SubjectFor(c.area)===subject)||DATA.cases[0]}
function v83GenerateDailyPlan(force=false){
  const date=v83DateKey();if(!force&&state.dailyPlans[date])return state.dailyPlans[date];
  const weak=v83Weaknesses(),first=weak[0]?.subject||Object.keys(DATA.exams)[0],second=weak[1]?.subject||first;
  const rd=v83FindReadingFor(first,"reading"),ls=v83FindReadingFor(second,"listening"),cs=v83FindCaseFor(first),due=v83DueIndices().length;
  const tasks=[
    {id:`${date}-srs`,type:"srs",view:"reviewCenter",minutes:Math.max(10,Math.min(30,state.reviewGoal)),title:`مرور ${Math.min(state.reviewGoal,due||state.reviewGoal)} اصطلاح سررسیدشده`,reason:"مرور فاصله‌دار"},
    {id:`${date}-exam`,type:"exam",view:"exam",minutes:20,title:`آزمون درس ${first}`,reason:`کمترین امتیاز فعلی: ${weak[0]?.score??0}%`,subject:first},
    {id:`${date}-read`,type:"reading",view:"reading",minutes:20,title:`تحلیل متن: ${rd.title}`,reason:first,itemId:rd.id},
    {id:`${date}-listen`,type:"listening",view:"listening",minutes:15,title:`شنیدن: ${ls.title}`,reason:second,itemId:ls.id},
    {id:`${date}-case`,type:"case",view:"caseLab",minutes:30,title:`حل پرونده: ${cs.title}`,reason:first,itemId:cs.id},
    {id:`${date}-write`,type:"writing",view:"writing",minutes:25,title:"ثبت یک نسخه جدید از تمرین نگارش",reason:"تقویت استدلال و زبان رسمی"}
  ];
  state.dailyPlans[date]={date,generatedAt:Date.now(),tasks};save();return state.dailyPlans[date];
}
function v83DailyCompletion(){const p=v83GenerateDailyPlan(),done=state.dailyDone[p.date]||{};return{done:Object.values(done).filter(Boolean).length,total:p.tasks.length}}
function v83OpenDailyTask(task){
  if(task.type==="exam")state.examSubject=task.subject;
  if(task.type==="reading")state.readingIndex=Math.max(0,DATA.readings.findIndex(x=>x.id===task.itemId));
  if(task.type==="listening")state.listeningIndex=Math.max(0,DATA.readings.findIndex(x=>x.id===task.itemId));
  if(task.type==="case")state.caseIndex=Math.max(0,DATA.cases.findIndex(x=>x.id===task.itemId));
  save();go(task.view);
}

function v83SaveWritingVersion(mode,text,score,source="manual"){
  const clean=String(text||"").trim();if(!clean)return false;
  const list=state.writingHistory[mode]||(state.writingHistory[mode]=[]),last=list.at(-1);
  if(last&&last.text===clean&&last.score===score)return false;
  list.push({date:Date.now(),text:clean,score:Number(score)||0,words:v82Words(clean).length,source});
  if(list.length>20)state.writingHistory[mode]=list.slice(-20);save();return true;
}
function v83WritingComparison(mode){
  const list=state.writingHistory[mode]||[];if(list.length<2)return null;
  const a=list.at(-2),b=list.at(-1),aw=new Set(v83NormWords(a.text)),bw=new Set(v83NormWords(b.text));
  const added=[...bw].filter(x=>!aw.has(x)).length,removed=[...aw].filter(x=>!bw.has(x)).length;
  return{a,b,wordDelta:b.words-a.words,scoreDelta:b.score-a.score,added,removed};
}
function v83NormWords(text){return v82Norm(text).split(" ").filter(x=>x.length>2)}

function v83RecordExamAttempt(subject,form){
  const qs=DATA.exams[subject]||[];let correct=0;const wrong=[];const answers=[];
  qs.forEach((q,i)=>{const raw=form.elements[`q${i}`]?.value,selected=raw===""||raw==null?null:Number(raw),ok=selected===q.a;if(ok)correct++;else wrong.push({question:q.q,explanation:q.e,selected});answers.push(selected)});
  const percent=Math.round(correct/Math.max(1,qs.length)*100),attempt={date:Date.now(),correct,total:qs.length,percent,answers,wrong};
  (state.examAttempts[subject]||(state.examAttempts[subject]=[])).push(attempt);if(state.examAttempts[subject].length>30)state.examAttempts[subject]=state.examAttempts[subject].slice(-30);
  wrong.forEach(w=>{const k=w.explanation;(state.errorLog[subject]||(state.errorLog[subject]={}))[k]=(state.errorLog[subject][k]||0)+1});save();return attempt;
}
function v83ExamAnalytics(subject){
  const a=state.examAttempts[subject]||[],scores=a.map(x=>x.percent),errors=Object.entries(state.errorLog[subject]||{}).sort((x,y)=>y[1]-x[1]);
  return{attempts:a.length,last:scores.at(-1)??state.examByCourse?.[subject]??null,best:scores.length?Math.max(...scores):null,average:v83Average(scores,null),errors};
}

function v83ReportSnapshot(){
  const review=v83ReviewStats(),daily=v83DailyCompletion(),weak=v83Weaknesses();
  return{
    generatedAt:new Date().toISOString(),version:"8.3.0",profile:state.profile,overall:percent(),minutes:state.minutes,
    review,daily,weaknesses:weak,readingScores:state.readingScores,listeningScores:state.listeningScores,
    speakingScores:state.speakingScores,writingScores:state.writingScores,caseScores:state.caseScores,
    examByCourse:state.examByCourse,examAttempts:state.examAttempts,researchDone:state.researchDone
  };
}
function v83Download(name,content,type="application/json"){
  const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function v83Backup(){v83Download(`Legal-German-MasterKit-v8.3-${v83DateKey()}.json`,JSON.stringify({schema:"lgmk-v83",state},null,2))}
function v83ExportCsv(){
  const rows=[["Subject","Score","Exam","Reading","Listening","Cases","Vocabulary"]];
  v83Weaknesses().forEach(x=>rows.push([x.subject,x.score,x.components.exam,x.components.reading,x.components.listening,x.components.cases,x.components.vocab]));
  const csv="\ufeff"+rows.map(r=>r.map(x=>`"${String(x??"").replaceAll('"','""')}"`).join(",")).join("\n");v83Download(`LGMK-v8.3-analytics-${v83DateKey()}.csv`,csv,"text/csv;charset=utf-8");
}
async function v83Restore(file){
  const text=await file.text(),parsed=JSON.parse(text),incoming=parsed?.state||parsed;
  if(!incoming||typeof incoming!=="object"||!incoming.profile)throw new Error("ساختار فایل پشتیبان معتبر نیست.");
  state=mergeState(DEFAULT,incoming);Object.assign(state,{srs:state.srs||{},dailyPlans:state.dailyPlans||{},dailyDone:state.dailyDone||{},writingHistory:state.writingHistory||{},examAttempts:state.examAttempts||{},errorLog:state.errorLog||{}});save();location.reload();
}

percent=function(){
  const s=v83ReviewStats(),srs=Math.min(1,(s.reviewed/DATA.vocab.length)*.55+(s.mature/DATA.vocab.length)*.45);
  const skills=[...Object.values(state.readingScores||{}),...Object.values(state.listeningScores||{}),...Object.values(state.speakingScores||{}),...Object.values(state.writingScores||{})];
  const skill=Math.min(1,v83Average(skills,0)/100),cases=Math.min(1,v83Average(Object.values(state.caseScores||{}),0)/100),exams=Math.min(1,v83Average(Object.values(state.examByCourse||{}),0)/100);
  const research=Math.min(1,v83TrueCount(state.researchDone)/Math.max(1,DATA.researchSteps.length)),daily=v83DailyCompletion(),plan=daily.total?daily.done/daily.total:0;
  return Math.round((srs*.25+skill*.22+cases*.15+exams*.18+research*.1+plan*.1)*100);
};