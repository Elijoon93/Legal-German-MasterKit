"use strict";
(function(){
  const style=document.createElement("style");
  style.textContent=".v84-ring{position:relative}";
  document.head.appendChild(style);
  document.addEventListener("click",function(e){
    const button=e.target.closest(".v84-agenda>button[data-view]");
    if(!button)return;
    const buttons=[...button.parentElement.querySelectorAll(":scope>button[data-view]")];
    const index=buttons.indexOf(button);
    const plan=typeof v83GenerateDailyPlan==="function"?v83GenerateDailyPlan():null;
    const task=plan?.tasks?.[index];
    if(!task)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    if(typeof v83OpenDailyTask==="function")v83OpenDailyTask(task);else go(task.view);
  },true);
})();
