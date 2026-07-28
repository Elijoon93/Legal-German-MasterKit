"use strict";
(function(){
  const PACK=window.LGMK_V87_DATA;
  if(!PACK)throw new Error("LGMK v8.7 evidence data is not loaded.");
  const normText=value=>String(value||"").toLowerCase().replace(/[{}"']/g," ").replace(/\s+/g," ").trim();
  const uid=prefix=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

  Object.assign(state,{
    legalEvidence:state.legalEvidence||{query:"",code:"همه",course:"همه",selected:PACK.norms[0]?.id||"",reviewed:{},notes:{}},
    caseBriefs:state.caseBriefs||{selected:PACK.cases[0]?.id||"",drafts:{},completed:{}},
    citationAudit:state.citationAudit||{text:"",bibliography:"",last:null},
    importCenter:state.importCenter||{format:"bibtex",text:"",last:null},
    v87Migration:1
  });
  state.legalEvidence.reviewed=state.legalEvidence.reviewed||{};
  state.legalEvidence.notes=state.legalEvidence.notes||{};
  state.caseBriefs.drafts=state.caseBriefs.drafts||{};
  state.caseBriefs.completed=state.caseBriefs.completed||{};
  if(!PACK.norms.some(x=>x.id===state.legalEvidence.selected))state.legalEvidence.selected=PACK.norms[0]?.id||"";
  if(!PACK.cases.some(x=>x.id===state.caseBriefs.selected))state.caseBriefs.selected=PACK.cases[0]?.id||"";

  function legalNormsForCourse(courseId){return PACK.norms.filter(n=>n.courseId===courseId)}
  function legalCasesForCourse(courseId){return PACK.cases.filter(c=>c.courseId===courseId)}
  function findNorm(id){return PACK.norms.find(n=>n.id===id)||PACK.norms[0]}
  function findCase(id){return PACK.cases.find(c=>c.id===id)||PACK.cases[0]}
  function setEvidenceFilters({query,code,course}={}){
    if(query!==undefined)state.legalEvidence.query=String(query);
    if(code!==undefined)state.legalEvidence.code=String(code);
    if(course!==undefined)state.legalEvidence.course=String(course);
    save();
  }
  function filteredNorms(){
    const q=normText(state.legalEvidence.query),code=state.legalEvidence.code,course=state.legalEvidence.course;
    return PACK.norms.filter(n=>(code==="همه"||n.code===code)&&(course==="همه"||n.courseId===course)&&(!q||normText(`${n.cite} ${n.title} ${n.ruleDe} ${n.ruleFa} ${n.elements.join(" ")} ${n.keywords.join(" ")}`).includes(q)));
  }
  function selectNorm(id){if(PACK.norms.some(n=>n.id===id)){state.legalEvidence.selected=id;save()}}
  function toggleNormReviewed(id){state.legalEvidence.reviewed[id]=!state.legalEvidence.reviewed[id];save();return state.legalEvidence.reviewed[id]}
  function saveNormNote(id,text){state.legalEvidence.notes[id]=String(text||"");save()}
  function normProgress(courseId){const rows=legalNormsForCourse(courseId),reviewed=rows.filter(n=>state.legalEvidence.reviewed[n.id]).length;return{total:rows.length,reviewed,complete:rows.length>0&&reviewed>=Math.min(2,rows.length)}}

  function selectedCase(){return findCase(state.caseBriefs.selected)}
  function selectCase(id){if(PACK.cases.some(c=>c.id===id)){state.caseBriefs.selected=id;save()}}
  function briefDraft(id){return state.caseBriefs.drafts[id]||{facts:"",issue:"",rule:"",analysis:"",conclusion:"",significance:"",notes:""}}
  function briefAssessment(draft){
    const rules=[
      ["facts",80,"خلاصه وقایع حداقل ۸۰ نویسه"],["issue",30,"مسئله حقوقی حداقل ۳۰ نویسه"],["rule",60,"قاعده و منبع حداقل ۶۰ نویسه"],
      ["analysis",120,"تحلیل و Subsumtion حداقل ۱۲۰ نویسه"],["conclusion",30,"نتیجه حداقل ۳۰ نویسه"],["significance",30,"اهمیت رأی حداقل ۳۰ نویسه"]
    ];
    const missing=rules.filter(([key,min])=>String(draft[key]||"").trim().length<min).map(([, ,label])=>label);
    return{complete:missing.length===0,missing,score:Math.round((rules.length-missing.length)/rules.length*100)};
  }
  function saveCaseBrief(id,data){
    const draft={facts:String(data.facts||""),issue:String(data.issue||""),rule:String(data.rule||""),analysis:String(data.analysis||""),conclusion:String(data.conclusion||""),significance:String(data.significance||""),notes:String(data.notes||""),updatedAt:Date.now()};
    state.caseBriefs.drafts[id]=draft;const assessment=briefAssessment(draft);if(!assessment.complete)state.caseBriefs.completed[id]=false;save();return assessment;
  }
  function completeCaseBrief(id){const a=briefAssessment(briefDraft(id));state.caseBriefs.completed[id]=a.complete;save();return a}
  function caseBriefProgress(courseId){const rows=legalCasesForCourse(courseId),done=rows.filter(c=>state.caseBriefs.completed[c.id]).length;return{total:rows.length,done,complete:rows.length?done>=1:false}}

  const baseCourseProgress=window.v85CourseProgress;
  if(typeof baseCourseProgress==="function")window.v85CourseProgress=function(id){
    const base=baseCourseProgress(id),evidence=normProgress(id).complete,caseBrief=caseBriefProgress(id).complete;
    const stages={...base.stages,evidence,caseBrief};
    return{...base,stages,done:Object.values(stages).filter(Boolean).length,total:8,percent:Math.round(Object.values(stages).filter(Boolean).length/8*100)};
  };
  const baseNextCourseAction=window.v85NextCourseAction;
  if(typeof baseNextCourseAction==="function")window.v85NextCourseAction=function(id){
    const p=window.v85CourseProgress(id),base=baseNextCourseAction(id);
    if(["orientation","vocabulary","input","application","writing","exam"].some(k=>!p.stages[k]))return base;
    if(!p.stages.evidence)return{stage:"evidence",label:"مرور مواد و ثبت Evidence Note",type:"evidence"};
    if(!p.stages.caseBrief)return{stage:"caseBrief",label:"تکمیل یک Case Brief",type:"caseBrief"};
    return{stage:"review",label:"مرور تثبیتی درس",type:"review"};
  };

  function parseBibTeX(text){
    const source=String(text||"").replace(/\r/g,"");
    const starts=[...source.matchAll(/(^|\n)\s*@([a-zA-Z]+)\s*\{/g)];
    const entries=[];
    starts.forEach((m,index)=>{
      const start=m.index+(m[1]?.length||0),end=index+1<starts.length?starts[index+1].index:source.length,block=source.slice(start,end).trim();
      const head=block.match(/^@([a-zA-Z]+)\s*\{\s*([^,]+),/);if(!head)return;
      const body=block.slice(head[0].length).replace(/}\s*$/,""),fields={};
      const fieldRegex=/([a-zA-Z]+)\s*=\s*(?:\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|"([^"]*)")\s*,?/g;let f;
      while((f=fieldRegex.exec(body)))fields[f[1].toLowerCase()]=(f[2]??f[3]??"").replace(/[{}]/g,"").trim();
      entries.push({type:head[1].toLowerCase(),key:head[2].trim(),fields});
    });
    return entries;
  }
  function parseRIS(text){
    const blocks=String(text||"").replace(/\r/g,"").split(/\nER\s*-\s*\n?/).map(x=>x.trim()).filter(Boolean),entries=[];
    blocks.forEach(block=>{const tags={};block.split("\n").forEach(line=>{const m=line.match(/^([A-Z0-9]{2})\s*-\s*(.*)$/);if(!m)return;(tags[m[1]]||(tags[m[1]]=[])).push(m[2].trim())});if(Object.keys(tags).length)entries.push(tags)});
    return entries;
  }
  function sourceFingerprint(x){return normText(`${x.author}|${x.title}|${x.year}`)}
  function importReferences(format,text){
    const created=[],skipped=[],existing=new Set((state.sourceMatrix||[]).map(sourceFingerprint));
    const add=row=>{const fp=sourceFingerprint(row);if(!row.title||existing.has(fp)){skipped.push(row.title||"بدون عنوان");return}existing.add(fp);state.sourceMatrix.push({...row,id:uid("src"),course:"",claim:"",notes:"Imported in v8.7",verified:false,createdAt:Date.now()});created.push(row.title)};
    if(format==="ris")parseRIS(text).forEach(tags=>add({type:(tags.TY?.[0]||"").toUpperCase()==="JOUR"?"مقاله":"کتاب",author:(tags.AU||tags.A1||[]).join("; "),title:tags.TI?.[0]||tags.T1?.[0]||"",year:(tags.PY?.[0]||tags.Y1?.[0]||"").slice(0,4),citation:[tags.JO?.[0]||tags.JF?.[0],tags.VL?.[0]&&`Vol. ${tags.VL[0]}`,tags.IS?.[0]&&`No. ${tags.IS[0]}`].filter(Boolean).join(", "),page:[tags.SP?.[0],tags.EP?.[0]].filter(Boolean).join("-"),url:tags.UR?.[0]||""}));
    else parseBibTeX(text).forEach(entry=>{const f=entry.fields;add({type:entry.type==="article"?"مقاله":entry.type==="online"?"وب‌سایت":"کتاب",author:f.author||f.editor||"",title:f.title||"",year:f.year||f.date?.slice(0,4)||"",citation:[f.journal||f.booktitle,f.publisher,f.volume&&`Vol. ${f.volume}`,f.number&&`No. ${f.number}`].filter(Boolean).join(", "),page:f.pages||"",url:f.url||f.doi&&`https://doi.org/${f.doi}`||""})});
    state.importCenter={format,text,last:{date:Date.now(),created:created.length,skipped:skipped.length}};save();return{created,skipped};
  }

  function citationAudit(text,bibliography){
    const body=String(text||""),bib=String(bibliography||""),issues=[],warnings=[],checks=[];
    const matrix=state.sourceMatrix||[];
    const sourceAudit=typeof v85SourceAudit==="function"?v85SourceAudit():{total:matrix.length,verified:0,incomplete:0,rows:[]};
    checks.push({label:"منابع ثبت‌شده",value:matrix.length,status:matrix.length?"ok":"warn"});
    checks.push({label:"منابع تأییدشده",value:sourceAudit.verified,status:sourceAudit.verified?"ok":"warn"});
    if(sourceAudit.incomplete)issues.push(`${sourceAudit.incomplete} منبع در ماتریس، اطلاعات پایه ناقص دارد.`);
    if(matrix.some(x=>!x.verified))warnings.push(`${matrix.filter(x=>!x.verified).length} منبع هنوز تأیید نشده است.`);

    const seen=new Map();matrix.forEach(x=>{const fp=sourceFingerprint(x);if(!fp)return;seen.set(fp,(seen.get(fp)||0)+1)});const duplicates=[...seen.values()].filter(n=>n>1).length;if(duplicates)issues.push(`${duplicates} گروه منبع تکراری شناسایی شد.`);

    const normMentions=[];const collect=(regex,codeIndex,numIndex)=>{let m;while((m=regex.exec(body)))normMentions.push({raw:m[0],code:m[codeIndex].toUpperCase(),num:m[numIndex]})};
    collect(/§{1,2}\s*(\d+[a-z]?)\s*(?:Abs\.\s*\d+\s*)?(BGB|VwVfG|HGB|VwGO)/gi,2,1);
    collect(/Art\.\s*(\d+[a-z]?)\s*(?:Abs\.\s*\d+\s*)?(AEUV|EUV|GG)/gi,2,1);
    const uniqueNorms=[...new Map(normMentions.map(x=>[`${x.code}-${x.num}`,x])).values()];
    const missingNorms=uniqueNorms.filter(m=>!PACK.norms.some(n=>n.code.toUpperCase()===m.code&&n.cite.replace(/\D/g,"")===m.num.replace(/\D/g,"")));
    if(missingNorms.length)warnings.push(`برای ${missingNorms.map(x=>x.raw).join("، ")} رکورد رسمی داخلی وجود ندارد؛ منبع رسمی را جداگانه کنترل کنید.`);
    checks.push({label:"مواد قانونی شناسایی‌شده",value:uniqueNorms.length,status:"ok"});

    const markers=[...body.matchAll(/\[(\d+)\]/g)].map(m=>m[1]),bibEntries=[...bib.matchAll(/^\s*\[(\d+)\]/gm)].map(m=>m[1]);
    const missingEntries=[...new Set(markers.filter(x=>!bibEntries.includes(x)))];
    const unusedEntries=[...new Set(bibEntries.filter(x=>!markers.includes(x)))];
    if(missingEntries.length)issues.push(`برای نشانگرهای [${missingEntries.join("], [")}] مدخل کتابنامه پیدا نشد.`);
    if(unusedEntries.length)warnings.push(`مدخل‌های [${unusedEntries.join("], [")}] در متن استفاده نشده‌اند.`);

    const uncited=matrix.filter(x=>{const a=normText(x.author).split(/[;,]/)[0].split(" ").filter(Boolean).at(-1)||"",t=normText(x.title).slice(0,22);return body&&!(a.length>3&&normText(body).includes(a))&&!(t.length>8&&normText(body).includes(t))});
    if(body&&uncited.length)warnings.push(`${uncited.length} منبع ثبت‌شده با روش تقریبی در متن قابل شناسایی نبود.`);
    if(!/§|Art\.|ECLI|BGH|EuGH|BVerfG/i.test(body))warnings.push("در متن هیچ ارجاع قانونی یا قضایی قابل شناسایی نیست.");
    if(body.length<300)warnings.push("متن برای ممیزی عمیق بسیار کوتاه است.");

    const result={date:Date.now(),issues,warnings,checks,score:Math.max(0,100-issues.length*15-warnings.length*6),normMentions:uniqueNorms.length,sourceTotal:matrix.length};
    state.citationAudit={text:body,bibliography:bib,last:result};save();return result;
  }

  const baseSearchAll=window.v85SearchAll;
  if(typeof baseSearchAll==="function")window.v85SearchAll=function(query){
    const base=baseSearchAll(query),q=normText(query),extra=[];
    if(q.length>=2){
      PACK.norms.forEach(n=>{if(normText(`${n.code} ${n.cite} ${n.title} ${n.ruleDe} ${n.ruleFa} ${n.keywords.join(" ")}`).includes(q))extra.push({type:"ماده قانونی",title:`${n.cite} ${n.code} — ${n.title}`,sub:n.ruleFa,view:"legalEvidence",action:{kind:"norm",id:n.id}})});
      PACK.cases.forEach(c=>{if(normText(`${c.title} ${c.caseNo} ${c.ecli} ${c.issueDe} ${c.holdingDe}`).includes(q))extra.push({type:"رأی",title:`${c.title} · ${c.caseNo}`,sub:c.significance,view:"caseBriefs",action:{kind:"caseLaw",id:c.id}})});
    }
    return [...base,...extra].slice(0,80);
  };
  const baseOpenSearchResult=window.v85OpenSearchResult;
  if(typeof baseOpenSearchResult==="function")window.v85OpenSearchResult=function(result){
    if(result?.action?.kind==="norm"){selectNorm(result.action.id);return go("legalEvidence")}
    if(result?.action?.kind==="caseLaw"){selectCase(result.action.id);return go("caseBriefs")}
    return baseOpenSearchResult(result);
  };

  Object.assign(window,{v87NormsForCourse:legalNormsForCourse,v87CasesForCourse:legalCasesForCourse,v87FindNorm:findNorm,v87FindCase:findCase,v87SetEvidenceFilters:setEvidenceFilters,v87FilteredNorms:filteredNorms,v87SelectNorm:selectNorm,v87ToggleNormReviewed:toggleNormReviewed,v87SaveNormNote:saveNormNote,v87NormProgress:normProgress,v87SelectCase:selectCase,v87SelectedCase:selectedCase,v87BriefDraft:briefDraft,v87BriefAssessment:briefAssessment,v87SaveCaseBrief:saveCaseBrief,v87CompleteCaseBrief:completeCaseBrief,v87CaseBriefProgress:caseBriefProgress,v87ParseBibTeX:parseBibTeX,v87ParseRIS:parseRIS,v87ImportReferences:importReferences,v87CitationAudit:citationAudit});
})();
