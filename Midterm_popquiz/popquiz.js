"use strict";

const qa = [
  { question: "Which planet is closest to the Sun?", answer: "Mercury" },
  { question: "Which planet is the hottest due to greenhouse effect?", answer: "Venus" },
  { question: "Which planet has abundant surface water and known life?", answer: "Earth" },
  { question: "Which planet is known as the Red Planet?", answer: "Mars" },
  { question: "Which is the largest planet in the Solar System?", answer: "Jupiter" }
]; 

console.log(qa.length);
console.log(qa[0].question);
console.log(qa[0].answer);

const questionEl = document.getElementById("question");
const formEl = document.getElementById("optionsForm");
const submitBtn = document.getElementById("submit");
const resultEl = document.getElementById("result");

let current = null;           
let score = 0;
let awaitingAnswer = true;    

let questionPop = getQuestion();
console.log(questionPop);
console.log(qa.length);
current = questionPop;
renderCurrent();

function getQuestion() {
  let popQuestion = qa.pop();
  return popQuestion;
}

function renderCurrent() {
  if (!current) {
    questionEl.textContent = "Quiz Complete!";
    resultEl.textContent = `Your score: ${score} / 5`;
    formEl.style.display = "none";
    submitBtn.textContent = "Restart";
    return;
  }

  questionEl.textContent = current.question;
  resultEl.textContent = "";
  clearSelection();
  enableOptions(true);
  submitBtn.textContent = "Submit";
  awaitingAnswer = true;
}

function clearSelection() {
  const inputs = formEl.querySelectorAll('input[name="option"]');
  inputs.forEach(i => (i.checked = false));
}

function getSelectedValue() {
  const checked = formEl.querySelector('input[name="option"]:checked');
  return checked ? checked.value : null;
}

function enableOptions(enabled) {
  const inputs = formEl.querySelectorAll('input[name="option"]');
  inputs.forEach(i => (i.disabled = !enabled));
}

submitBtn.addEventListener("click", () => {
  if (!current && submitBtn.textContent === "Restart") {
    location.reload();
    return;
  }

  if (awaitingAnswer) {
    const chosen = getSelectedValue();
    if (!chosen) {
      resultEl.textContent = "Please select an answer.";
      return;
    }
    if (chosen === current.answer) {
      score++;
      resultEl.textContent = "Correct!";
    } else {
      resultEl.textContent = "Incorrect.";
    }

    awaitingAnswer = false;
    enableOptions(false);
    submitBtn.textContent = qa.length ? "Next" : "See Score";
  } else {
    current = getQuestion() || null;
    renderCurrent();
  }
});
