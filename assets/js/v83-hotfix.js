"use strict";
state.dailyCredited=state.dailyCredited||{};
v83StartReview=function(force=false){
  const today=v83DateKey();
  if(!force&&state.reviewSession&&state.reviewSession.date===today)return state.reviewSession;
  const queue=v83DueIndices().slice(0,v83Clamp(Number(state.reviewGoal)||20,5,60));
  state.reviewSession={date:today,queue,position:0,revealed:false,correct:0};
  save();return state.reviewSession;
};
const v83WireBeforeHotfix=wire;
wire=function(){
  v83WireBeforeHotfix();
  document.body.addEventListener("change",event=>{
    const t=event.target;if(t.dataset.v83DailyDone===undefined)return;
    const p=v83GenerateDailyPlan(),task=p.tasks[Number(t.dataset.v83DailyDone)],done=state.dailyDone[p.date]||{};
    t.dataset.v83MinutesBefore=String(state.minutes||0);
    t.dataset.v83WasCredited=(state.dailyCredited[task.id]||done[task.id])?"1":"0";
  },true);
  document.body.addEventListener("change",event=>{
    const t=event.target;if(t.dataset.v83DailyDone===undefined)return;
    const p=v83GenerateDailyPlan(),task=p.tasks[Number(t.dataset.v83DailyDone)],was=t.dataset.v83WasCredited==="1",before=Number(t.dataset.v83MinutesBefore)||0;
    if(t.checked){if(was)state.minutes=before;state.dailyCredited[task.id]=true;save()}
    delete t.dataset.v83WasCredited;delete t.dataset.v83MinutesBefore;
  });
};