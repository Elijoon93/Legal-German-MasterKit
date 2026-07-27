"use strict";

const modules = [
  { id: "private-law", title: "Privates Wirtschaftsrecht", text: "قراردادها، تعهدات، تجارت و حقوق شرکت‌ها." },
  { id: "public-law", title: "Öffentliches Wirtschaftsrecht", text: "حقوق اداری اقتصادی، تنظیم‌گری و حقوق اروپایی." },
  { id: "legal-writing", title: "Wissenschaftliches Schreiben", text: "Seminararbeit، Magisterarbeit، استناد و پژوهش حقوقی." },
  { id: "legal-grammar", title: "Juristische Grammatik", text: "Passiv، Nominalstil، Konjunktiv و ساختارهای رسمی." },
  { id: "case-training", title: "Fallbearbeitung", text: "Sachverhalt، Rechtsfrage، Subsumtion و Ergebnis." },
  { id: "exam-language", title: "DSH / TestDaF", text: "تمرین چهار مهارت با تمرکز بر زبان دانشگاهی." }
];

const phrases = {
  "طرح مسئله": [
    ["Es stellt sich die Frage, ob ...", "این پرسش مطرح می‌شود که آیا ..."],
    ["Zu prüfen ist, ob ...", "باید بررسی شود که آیا ..."]
  ],
  "استناد به قانون": [
    ["Gemäß § ... ist ...", "مطابق ماده ...، ..."],
    ["Nach dem Wortlaut der Vorschrift ...", "بر اساس عبارت صریح مقرره ..."]
  ],
  "تحلیل": [
    ["Dies setzt voraus, dass ...", "این امر مستلزم آن است که ..."],
    ["Im vorliegenden Fall spricht dafür, dass ...", "در پرونده حاضر، این امر مؤید آن است که ..."]
  ],
  "نتیجه‌گیری": [
    ["Daher ist davon auszugehen, dass ...", "بنابراین باید چنین فرض کرد که ..."],
    ["Im Ergebnis ist festzuhalten, dass ...", "در نتیجه باید بیان کرد که ..."]
  ],
  "نگارش علمی": [
    ["Nach überwiegender Auffassung in der Literatur ...", "بر اساس دیدگاه غالب در ادبیات حقوقی ..."],
    ["Die Gegenauffassung überzeugt nicht, weil ...", "دیدگاه مخالف قانع‌کننده نیست، زیرا ..."]
  ]
};

const storageKey = "legalGermanMasterKit.completedModules";
const moduleGrid = document.querySelector("#moduleGrid");
const phraseCategory = document.querySelector("#phraseCategory");
const phraseList = document.querySelector("#phraseList");
const progressValue = document.querySelector("#progressValue");
const progressBar = document.querySelector("#progressBar");

function loadCompleted() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

let completed = loadCompleted();

function saveCompleted() {
  localStorage.setItem(storageKey, JSON.stringify([...completed]));
}

function updateProgress() {
  const percent = Math.round((completed.size / modules.length) * 100);
  progressValue.textContent = `${percent}٪`;
  progressBar.style.width = `${percent}%`;
}

function renderModules() {
  moduleGrid.innerHTML = "";
  modules.forEach((module, index) => {
    const isComplete = completed.has(module.id);
    const article = document.createElement("article");
    article.className = "card module-card";
    article.innerHTML = `
      <span class="card__index">${String(index + 1).padStart(2, "0")}</span>
      <h3 lang="de">${module.title}</h3>
      <p>${module.text}</p>
      <div class="module-card__meta">
        <span class="module-card__status">${isComplete ? "ثبت‌شده" : "آماده شروع"}</span>
        <button type="button" data-module="${module.id}" data-complete="${isComplete}">${isComplete ? "لغو تکمیل" : "ثبت تکمیل"}</button>
      </div>`;
    moduleGrid.append(article);
  });
}

function renderPhrases(category) {
  phraseList.innerHTML = "";
  phrases[category].forEach(([de, fa]) => {
    const item = document.createElement("article");
    item.className = "phrase";
    item.innerHTML = `<strong lang="de">${de}</strong><p>${fa}</p>`;
    phraseList.append(item);
  });
}

Object.keys(phrases).forEach((category) => {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  phraseCategory.append(option);
});

moduleGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-module]");
  if (!button) return;
  const id = button.dataset.module;
  completed.has(id) ? completed.delete(id) : completed.add(id);
  saveCompleted();
  renderModules();
  updateProgress();
});

phraseCategory.addEventListener("change", () => renderPhrases(phraseCategory.value));

document.querySelector("#resetProgress").addEventListener("click", () => {
  completed = new Set();
  saveCompleted();
  renderModules();
  updateProgress();
});

document.querySelector("#year").textContent = new Date().getFullYear();
renderModules();
renderPhrases(Object.keys(phrases)[0]);
updateProgress();
