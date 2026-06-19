const LEVELS = {
  "3x2": { label: "3×2", rows: 2, cols: 3 },
  "4x3": { label: "4×3", rows: 3, cols: 4 },
  "4x4": { label: "4×4", rows: 4, cols: 4 },
  "5x4": { label: "5×4", rows: 4, cols: 5 },
  "6x5": { label: "6×5", rows: 5, cols: 6 }
};

const THEMES = {
  animals: ["🐶","🐱","🐰","🐼","🐸","🦊","🐵","🐧","🦁","🐯","🐮","🐷","🐨","🦆","🐢"],
  food: ["🍎","🍌","🍓","🍇","🍕","🍔","🍩","🍪","🥕","🍉","🍒","🥐","🧀","🍟","🍰"],
  tree: ["🌲","🌳","🌴","🌵","🌱","🌿","🍀","🍁","🍂","🌾","🌻","🌷","🌹","🍄","🌺"],
  mixed: ["🐶","🌲","🍔","⭐","🐱","🌻","🍎","🌙","🐰","🌵","🍕","☀️","🐸","🍄","🍩"]
};

let selectedLevel = "4x4";
let selectedTheme = "animals";
let cards = [];
let flippedIds = [];
let matchedIds = [];
let matchedPreviewIds = [];
let moves = 0;
let seconds = 0;
let timerId = null;
let isChecking = false;

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");
const board = document.getElementById("board");
const previewBoard = document.getElementById("previewBoard");
const timerText = document.getElementById("timerText");
const movesText = document.getElementById("movesText");
const pairsText = document.getElementById("pairsText");
const feedback = document.getElementById("feedback");

document.querySelectorAll(".level-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".level-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedLevel = btn.dataset.level;
    renderPreviewBoard();
  });
});

document.querySelectorAll(".theme-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".theme-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTheme = btn.dataset.theme;
  });
});

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("playAgainBtn").addEventListener("click", startGame);
document.getElementById("changeLevelBtn").addEventListener("click", showStart);
document.getElementById("resultPlayAgainBtn").addEventListener("click", startGame);
document.getElementById("resultChangeLevelBtn").addEventListener("click", showStart);

renderPreviewBoard();

function renderPreviewBoard() {
  const level = LEVELS[selectedLevel];
  previewBoard.style.gridTemplateColumns = `repeat(${level.cols}, clamp(50px, 7vw, 72px))`;
  previewBoard.innerHTML = "";

  const totalCards = level.rows * level.cols;

  for (let i = 0; i < totalCards; i++) {
    const tile = document.createElement("button");
    tile.className = "tile preview-tile";
    tile.disabled = true;
    previewBoard.appendChild(tile);
  }
}

function showStart() {
  stopTimer();
  startScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  renderPreviewBoard();
}

function showGame() {
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  resultScreen.classList.add("hidden");
}

function showResult() {
  stopTimer();

  const pairsFound = matchedIds.length / 2;
  const accuracy = moves === 0 ? 0 : Math.round((pairsFound / moves) * 100);

  document.getElementById("resultMoves").textContent = moves;
  document.getElementById("resultTime").textContent = formatTime(seconds);
  document.getElementById("resultAccuracy").textContent = accuracy + "%";
  document.getElementById("resultLevel").textContent = LEVELS[selectedLevel].label;

  document.getElementById("rankingBody").innerHTML = `
    <tr>
      <td>1</td>
      <td>2</td>
      <td>${Math.max(moves - 2, 1)}</td>
      <td>${formatTime(Math.max(seconds - 5, 0))}</td>
    </tr>
    <tr class="current">
      <td>2</td>
      <td>1</td>
      <td>${moves}</td>
      <td>${formatTime(seconds)}</td>
    </tr>
    <tr>
      <td>3</td>
      <td>3</td>
      <td>${moves + 5}</td>
      <td>${formatTime(seconds + 25)}</td>
    </tr>
  `;

  startScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
}

function startGame() {
  const level = LEVELS[selectedLevel];
  const pairCount = (level.rows * level.cols) / 2;
  const selectedSymbols = THEMES[selectedTheme].slice(0, pairCount);

  cards = shuffle([...selectedSymbols, ...selectedSymbols]).map((symbol, index) => ({
    id: index,
    symbol
  }));

  flippedIds = [];
  matchedIds = [];
  matchedPreviewIds = [];
  moves = 0;
  seconds = 0;
  isChecking = false;

  updateStats();
  renderBoard();
  showGame();
  startTimer();
}

function renderBoard() {
  const level = LEVELS[selectedLevel];
  board.style.gridTemplateColumns = `repeat(${level.cols}, clamp(50px, 7vw, 72px))`;
  board.innerHTML = "";

  cards.forEach((card) => {
    const tile = document.createElement("button");
    tile.className = "tile";

    const isFlipped = flippedIds.includes(card.id);
    const isMatchedPreview = matchedPreviewIds.includes(card.id);
    const isMatched = matchedIds.includes(card.id);

    if (isFlipped || isMatchedPreview || isMatched) {
      tile.textContent = card.symbol;
      tile.classList.add("visible");
    }

    if (isMatchedPreview) {
      tile.classList.add("matched");
    }

    if (isMatched) {
      tile.classList.add("disappear");
    }

    tile.addEventListener("click", () => handleCardClick(card.id));
    board.appendChild(tile);
  });
}

function handleCardClick(cardId) {
  if (
    isChecking ||
    flippedIds.includes(cardId) ||
    matchedIds.includes(cardId) ||
    matchedPreviewIds.includes(cardId) ||
    flippedIds.length >= 2
  ) {
    return;
  }

  flippedIds.push(cardId);
  renderBoard();

  if (flippedIds.length === 2) {
    moves++;
    isChecking = true;
    updateStats();

    const first = cards.find((c) => c.id === flippedIds[0]);
    const second = cards.find((c) => c.id === flippedIds[1]);

    if (first.symbol === second.symbol) {
      setFeedback("✅ You found a matching pair!", "good");

      matchedPreviewIds.push(first.id, second.id);
      renderBoard();

      setTimeout(() => {
        matchedIds.push(first.id, second.id);
        matchedPreviewIds = [];
        flippedIds = [];
        clearFeedback();
        isChecking = false;
        updateStats();
        renderBoard();

        if (matchedIds.length === cards.length) {
          setTimeout(showResult, 450);
        }
      }, 850);
    } else {
      setFeedback("❌ Not a match. Try again!", "bad");

      setTimeout(() => {
        flippedIds = [];
        clearFeedback();
        isChecking = false;
        renderBoard();
      }, 950);
    }
  }
}

function updateStats() {
  timerText.textContent = formatTime(seconds);
  movesText.textContent = moves;
  pairsText.textContent = matchedIds.length / 2;
}

function startTimer() {
  stopTimer();

  timerId = setInterval(() => {
    seconds++;
    updateStats();
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function setFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = "feedback " + type;
}

function clearFeedback() {
  feedback.textContent = "";
  feedback.className = "feedback";
}

function formatTime(totalSeconds) {
  const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const sec = String(totalSeconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}