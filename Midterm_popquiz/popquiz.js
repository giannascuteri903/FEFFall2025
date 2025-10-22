"use strict";

const qa = [
  {
    question: "Which planet is closest to the Sun?",
    answer: "Mercury"
  },
  {
    question: "Which planet is the hottest due to a runaway greenhouse effect?",
    answer: "Venus"
  },
  {
    question: "Which planet has abundant liquid water on the surface and known life?",
    answer: "Earth"
  },
  {
    question: "Which planet is known as the Red Planet?",
    answer: "Mars"
  },
  {
    question: "Which is the largest planet in the Solar System?",
    answer: "Jupiter"
  }
]; 

console.log(qa.length);
console.log(qa[0].question);
console.log(qa[0].answer);

let questionPop = getQuestion();
console.log(questionPop);
console.log(qa.length);

function getQuestion() {
  let popQuestion = qa.pop();
  return popQuestion;
}
