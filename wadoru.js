let answer;
let typed = "";
let currentTry = 0;
const ROUNDS = 6;

async function treatButton(event) {
  let key = event.key;
  if (key == "Enter") {
    await treatEnter();
  } else if (key == "Backspace") {
    treatBackspace();
  } else if (/^[a-zA-Z]$/.test(key)) {
    treatLetter(key.toLowerCase());
  }
}

async function treatEnter() {
  if (typed.length !== answer.length) {
    return;
  }

  if (typed === answer) {
    treatCorrect();
  } else {
    isWord = await isAWord(typed);
    if (!isWord) {
      treatNotAWord();
      return;
    }
    treatIncorrect();
  }

  treatTry();
}

function treatTry() {
  let letterCounter = {};
  let labelledIndexes = [];
  for (let i = 0; i < answer.length; i++) {
    letterCounter[answer[i]] = (letterCounter[answer[i]] || 0) + 1;
  }

  for (let i = 0; i < answer.length; i++) {
    if (answer[i] === typed[i]) {
      treatCorrectLetter(i);
      letterCounter[typed[i]]--;
      labelledIndexes.push(i);
    }
  }

  for (let i = 0; i < answer.length; i++) {
    if (labelledIndexes.includes(i)) {
      continue;
    }

    if (answer.includes(typed[i]) && letterCounter[typed[i]] > 0) {
      treatPartialCorrectLetter(i);
      letterCounter[typed[i]]--;
      labelledIndexes.push(i);
    }
  }

  for (let i = 0; i < answer.length; i++) {
    if (labelledIndexes.includes(i)) {
      continue;
    }
    treatIncorrectLetter(i);
  }

  currentTry++;
  typed = "";
}

function treatCorrectLetter(index) {
  let currentWord = document.querySelectorAll(".word")[currentTry];
  let letters = currentWord.querySelectorAll(".letter");
  letters[index].classList.add("correctLetter");
}

function treatPartialCorrectLetter(index) {
  let currentWord = document.querySelectorAll(".word")[currentTry];
  let letters = currentWord.querySelectorAll(".letter");
  letters[index].classList.add("partialCorrectLetter");
}

function treatIncorrectLetter(index) {
  let currentWord = document.querySelectorAll(".word")[currentTry];
  let letters = currentWord.querySelectorAll(".letter");
  letters[index].classList.add("incorrectLetter");
}

async function isAWord(word) {
  toggleLoading(false);
  let validateResponse = await fetch(
    "https://words.dev-apis.com/validate-word",
    {
      method: "POST",
      body: JSON.stringify({ word: word }),
    }
  );
  let validate = await validateResponse.json();
  toggleLoading(true);
  return validate["validWord"];
}

function treatNotAWord() {
  words = document.querySelectorAll(".word");
  for (let letter of words[currentTry].querySelectorAll(".letter")) {
    letter.classList.add("notAWord");
    setTimeout(function () {
      letter.classList.remove("notAWord");
    }, 500);
  }
}

function treatCorrect() {
  alert("ご正解おめでとうございます！");
  words = document.querySelectorAll(".word");
  document.removeEventListener("keydown", treatButton);
}

function treatIncorrect() {
  words = document.querySelectorAll(".word");
  if (currentTry == ROUNDS - 1) {
    alert(`残念でした。正解は${answer}です。`);
    document.removeEventListener("keydown", treatButton);
  }
}

function treatLetter(letter) {
  if (typed.length < answer.length) {
    typed += letter;
    addDisplay();
  }
}

function treatBackspace() {
  if (typed.length > 0) {
    typed = typed.slice(0, -1);
    deleteDisplay();
  }
}

async function retreiveAnswer() {
  let wordResponse = await fetch("https://words.dev-apis.com/word-of-the-day");
  let word = await wordResponse.json();
  answer = word["word"];
  toggleLoading(true);
}

function toggleLoading(isLoaded) {
  let loading = document.querySelector("#loading");
  loading.classList.toggle("hidden", isLoaded);
}

function addDisplay() {
  let currentLetter = document.querySelector(".untyped");
  currentLetter.classList.toggle("untyped", false);
  currentLetter.textContent = typed[typed.length - 1];
}

function deleteDisplay() {
  let letters = document.querySelectorAll(".letter:not(.untyped)");
  let currentLetter = letters[letters.length - 1];
  currentLetter.classList.toggle("untyped", true);
  currentLetter.textContent = "";
}

async function main() {
  toggleLoading(false);
  await retreiveAnswer();
  document.addEventListener("keydown", treatButton);
  for (let letter of document.querySelectorAll(".letter")) {
    letter.classList.add("untyped");
  }
}

main();
