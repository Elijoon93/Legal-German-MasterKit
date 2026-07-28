function renderDashboard(el){
 const next=state.plan.flatMap(w=>w.tasks.map(t=>({...t,week:w.week}))).find(t=>!t.done);
 el.innerHTML=`<div class="hero"><h2>دستیار واقعی تحصیل LL.M. oec.</h2><p>برنامه ترمی، سرفصل تفصیلی، ۶۰ اصطلاح، ۴۹ قالب جمله، ۸ متن، ۱۳ کتاب، راهنمای پژوهش، ۶ پرونده و آزمون ۲۰ سؤالی.</p><button class="btn" data-open="planner">تولید یا ادامه برنامه</button></div>
 <div class="grid four"><div class="card"><h3>پیشرفت کل</h3><div class="metric">${percent()}٪</div><div class="progress"><span style="width:${percent()}%"></span></div></div>
 <div class="card"><h3>واژگان</h3><div class="metric">${Object.keys(state.mastered).length}/60</div></div>
 <div class="card"><h3>متون</h3><div class="metric">${Object.keys(state.readingDone).length}/8</div></div>
 <div class="card"><h3>پژوهش</h3><div class="metric">${Object.keys(state.researchDone).length}/10</div></div></div>
 ${next?`<div class="panel"><h3>کار بعدی</h3><p>هفته ${next.week}: <b>${next.cat}</b> — ${next.task} (${next.hours} ساعت)</p><button class="btn" data-open="planner">باز کردن برنامه</button></div>`:""}
 <div class="panel"><h3>اطلاعیه‌های ترمی قابل کنترل</h3>${DATA.currentOffers.map(x=>`<div class="box"><span class="pill badge-current">${x.term}</span><b class="de">${x.title}</b><div>${x.time}</div><small>${x.note}</small></div>`).join("")}</div>`
}
function renderPlanner(el){
 const p=state.profile;
 el.innerHTML=`<div class="panel"><h3>پروفایل و تولید برنامه ۱۲ هفته‌ای</h3><div class="grid two">
 <label>نام<input class="input" id="pName" value="${esc(p.name)}"></label>
 <label>سطح<select id="pLevel"><option ${p.level==="B2"?"selected":""}>B2</option><option ${p.level==="C1"?"selected":""}>C1</option><option ${p.level==="C2"?"selected":""}>C2</option></select></label>
 <label>ساعت مطالعه هفتگی<input class="input" id="pHours" type="number" min="3" max="40" value="${p.hours}"></label>
 <label>تمرکز<select id="pFocus"><option value="balanced" ${p.focus==="balanced"?"selected":""}>متعادل</option><option value="private" ${p.focus==="private"?"selected":""}>حقوق خصوصی</option><option value="public" ${p.focus==="public"?"selected":""}>حقوق عمومی</option><option value="research" ${p.focus==="research"?"selected":""}>سمینار و پژوهش</option></select></label>
 <label>نیم‌سال<input class="input" id="pSemester" value="${esc(p.semester)}"></label></div>
 <button class="btn" data-save-profile>ذخیره و تولید برنامه</button></div>
 ${state.plan.length?`<div class="panel"><h3>برنامه ۱۲ هفته‌ای</h3>${state.plan.map(w=>`<details class="accordion" ${w.week===1?"open":""}><summary>هفته ${w.week}: ${w.theme}</summary><div>${w.tasks.map(t=>`<label class="task"><input type="checkbox" data-plan-task="${t.id}" ${t.done?"checked":""}><span><b>${t.cat}</b><br>${t.task}</span><span class="pill">${t.hours} ساعت</span></label>`).join("")}</div></details>`).join("")}</div>`:`<div class="feedback warn">هنوز برنامه‌ای تولید نشده است.</div>`}`
}
function renderCurriculum(el){
 el.innerHTML=`<div class="hero"><h2>ساختار رسمی و نقشه پیشنهادی</h2><p>الزامات ثابت از صفحه رسمی دانشگاه گرفته شده‌اند؛ تقسیم درس‌ها میان چهار نیم‌سال در این برنامه یک پیشنهاد آموزشی است و جای Friedolin/Moodle را نمی‌گیرد.</p></div>
 <div class="grid four">${DATA.officialRequirements.map(([a,b])=>`<div class="card"><h3 class="de">${a}</h3><p>${b}</p></div>`).join("")}</div>
 <div class="panel"><h3>نقشه چهار نیم‌سال</h3>${DATA.programme.map(s=>`<details class="accordion"><summary>${s.semester} — ${s.title}</summary><div><span class="pill">${s.status}</span><h4>درس‌ها</h4><ul>${s.courses.map(x=>`<li>${x}</li>`).join("")}</ul><h4>خروجی قابل سنجش</h4><ul>${s.outputs.map(x=>`<li>${x}</li>`).join("")}</ul></div></details>`).join("")}</div>`
}
function renderSubjects(el){
 const query=(document.querySelector("#subjectSearch")?.value||"").toLowerCase();
 const area=document.querySelector("#subjectArea")?.value||"همه";
 const list=DATA.courses.filter(c=>(area==="همه"||c.area===area)&&JSON.stringify(c).toLowerCase().includes(query));
 const areas=["همه",...new Set(DATA.courses.map(c=>c.area))];
 el.innerHTML=`<div class="panel"><h3>سرفصل تفصیلی دروس</h3><div class="toolbar"><input id="subjectSearch" class="input" placeholder="جست‌وجو در درس، سرفصل، قانون یا کتاب" value="${esc(query)}"><select id="subjectArea">${areas.map(a=>`<option ${a===area?"selected":""}>${a}</option>`).join("")}</select></div>
 ${list.map(c=>`<details class="accordion"><summary><b class="de">${c.title}</b> <span class="pill">${c.level}</span> <span class="pill">${c.area}</span></summary><div><p>${c.outcome}</p><h4>سرفصل‌ها</h4><ol>${c.units.map(u=>`<li>${u}</li>`).join("")}</ol><h4>قوانین</h4><p class="de">${c.statutes.join(" · ")}</p><h4>کتاب‌ها</h4><ul>${c.books.map(b=>`<li>${b}</li>`).join("")}</ul><div class="feedback good"><b>تمرین:</b> ${c.practice}</div><button class="btn ${state.completed[c.id]?"good":"secondary"}" data-complete-course="${c.id}">${state.completed[c.id]?"مطالعه ثبت شده":"ثبت مطالعه این درس"}</button></div></details>`).join("")||`<div class="search-empty">نتیجه‌ای یافت نشد.</div>`}</div>`
}
function renderLibrary(el){
 const query=(document.querySelector("#bookSearch")?.value||"").toLowerCase();
 const books=DATA.books.filter(b=>JSON.stringify(b).toLowerCase().includes(query));
 el.innerHTML=`<div class="panel"><h3>کتابخانه درس‌محور</h3><input id="bookSearch" class="input" placeholder="نام کتاب، نویسنده یا حوزه" value="${esc(query)}"><div class="grid two">${books.map(b=>`<div class="card book"><span class="pill">${b.cat}</span><h3 class="de">${b.author}: ${b.title}</h3><p><b>کاربرد:</b> ${b.use}</p><p class="small"><b>روش استفاده:</b> ${b.note}</p><span class="pill">${b.level}</span></div>`).join("")}</div></div>
 <div class="panel"><h3>منابع رسمی و پایگاه‌ها</h3><div class="grid two">${DATA.resources.map(r=>`<div class="card link-card"><span class="pill badge-official">${r.kind}</span><h3>${r.title}</h3><p>${r.use}</p><a href="${r.url}" target="_blank" rel="noopener">باز کردن منبع رسمی ↗</a></div>`).join("")}</div></div>`
}
function renderLanguage(el){
 const tab=state.languageTab||"vocab";
 const q=(state.languageQuery||"").toLowerCase(),cat=state.languageCat||"همه";
 const cats=["همه",...new Set((tab==="vocab"?DATA.vocab:DATA.sentences).map(x=>tab==="vocab"?x.area:x.cat))];
 const items=(tab==="vocab"?DATA.vocab:DATA.sentences).filter(x=>(cat==="همه"||(tab==="vocab"?x.area:x.cat)===cat)&&JSON.stringify(x).toLowerCase().includes(q));
 el.innerHTML=`<div class="panel"><h3>بانک زبان حقوقی</h3><div class="toolbar"><button class="btn ${tab==="vocab"?"":"secondary"}" data-language-tab="vocab">۶۰ اصطلاح</button><button class="btn ${tab==="sentences"?"":"secondary"}" data-language-tab="sentences">۴۹ قالب جمله</button><input id="languageSearch" class="input" placeholder="جست‌وجوی فارسی یا آلمانی" value="${esc(q)}"><select id="languageCat">${cats.map(x=>`<option ${x===cat?"selected":""}>${x}</option>`).join("")}</select></div>
 ${tab==="vocab"?`<div class="table-wrap"><table class="data-table"><thead><tr><th>اصطلاح</th><th>جمع</th><th>معنی</th><th>Collocation و مثال</th><th>حوزه/قانون</th><th>عملیات</th></tr></thead><tbody>${items.map((x,i)=>{const idx=DATA.vocab.indexOf(x);return `<tr><td class="de term">${x.term}</td><td class="de">${x.plural}</td><td>${x.fa}</td><td><div class="de"><b>${x.coll}</b><br>${x.example}</div></td><td>${x.area}<br><span class="pill de">${x.law}</span></td><td><button class="btn secondary" data-speak-vocab="${idx}">🔊</button><button class="btn ${state.mastered[idx]?"good":"secondary"}" data-master-vocab="${idx}">${state.mastered[idx]?"ثبت":"بلدم"}</button></td></tr>`}).join("")}</tbody></table></div>`:
 `<div>${items.map(x=>{const idx=DATA.sentences.indexOf(x);return `<div class="box"><span class="pill">${x.cat}</span><b class="de">${x.de}</b><p>${x.fa}</p><button class="btn secondary" data-speak-sentence="${idx}">🔊 تلفظ</button><button class="btn ${state.savedSentences[idx]?"good":"secondary"}" data-save-sentence="${idx}">${state.savedSentences[idx]?"ذخیره شد":"ذخیره"}</button></div>`}).join("")}</div>`}</div>`
}
