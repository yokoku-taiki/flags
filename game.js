const socket = new WebSocket("ws://localhost:3000");

let gameState = {
  players: {},
  currentCountry: null,
  activePlayer: null,
};

let playerId = null;
let playerName = "";

// UI要素取得
const loginForm = document.getElementById("loginForm");
const playerNameInput = document.getElementById("playerName");
const joinGameButton = document.getElementById("joinGame");

const gameContainer = document.getElementById("gameContainer");
const flagImage = document.getElementById("flagImage");
const countryName = document.getElementById("countryName");
const activePlayerDisplay = document.getElementById("activePlayer");
const playerButton = document.getElementById("playerButton");
const showAnswerButton = document.getElementById("showAnswer");
const correctButton = document.getElementById("correctButton");
const wrongButton = document.getElementById("wrongButton");
const scoreBoard = document.getElementById("scoreBoard");

// **🚀 プレイヤーがゲームに参加**
joinGameButton.addEventListener("click", () => {
  playerName = playerNameInput.value.trim();
  if (playerName === "") {
    alert("プレイヤー名を入力してください");
    return;
  }

  socket.send(JSON.stringify({ type: "join", playerName }));

  loginForm.style.display = "none";
  gameContainer.style.display = "block";
});

// **🎯 WebSocket メッセージ受信**
socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "sync") {
    gameState = data.gameState;
    if (playerId !== null) updateGameUI(); // ✅ `playerId` がセットされるまで UI を更新しない
  } else if (data.type === "assignId") {
    playerId = data.playerId;
    console.log(`🎮 あなたのプレイヤーID: ${playerId}`);
    updateGameUI(); // ✅ `playerId` がセットされたら UI を更新
  }
});

// **✅ ゲームUIを更新する**
function updateGameUI() {
  if (!gameState.currentCountry) {
    console.error("❌ 国旗データがありません");
    return;
  }

  let flagSrc = `http://localhost:3000/flags/${gameState.currentCountry}.jpg`;
  console.log("🖼 画像のパス：", flagSrc);

  flagImage.src = flagSrc;
  countryName.textContent = gameState.currentCountry;
  countryName.style.display = "none"; // 最初は非表示

  activePlayerDisplay.textContent = gameState.activePlayer
    ? `解答権: ${gameState.players[gameState.activePlayer]?.name || "不明"}`
    : "まだ決まっていません";

  // **スコアボード更新**
  let playerEntries = Object.entries(gameState.players);
  scoreBoard.innerHTML = "<h3>スコアボード</h3>";

  let tableHTML = "";
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      let index = i * 2 + j;
      if (index < playerEntries.length) {
        const [id, player] = playerEntries[index];
        tableHTML += `<div class="score-cell">${player.name}: ${player.score}点</div>`;
      } else {
        tableHTML += `<div class="score-cell"></div>`; // 空のセル
      }
    }
  }

  scoreBoard.innerHTML += tableHTML;

  // **自分のボタンのみ表示**
  if (gameState.players[playerId]) {
    playerButton.style.display = "block";
    playerButton.disabled = gameState.activePlayer !== null;
  } else {
    playerButton.style.display = "none";
  }

  showAnswerButton.disabled = gameState.activePlayer === null;
  correctButton.disabled = gameState.activePlayer === null;
  wrongButton.disabled = gameState.activePlayer === null;
}

// **✅ 答えを見るボタンの処理**
function showAnswer() {
  console.log("🔍 [DEBUG] 答えを見るボタンが押されました");
  countryName.style.display = "block"; // 🔥 これで答えが表示される
}

// **ボタンイベント**
playerButton.addEventListener("click", () => {
  socket.send(JSON.stringify({ type: "buzzIn", playerId }));
});

showAnswerButton.addEventListener("click", showAnswer);

correctButton.addEventListener("click", () => {
  socket.send(JSON.stringify({ type: "submitAnswer", isCorrect: true }));
});

wrongButton.addEventListener("click", () => {
  socket.send(JSON.stringify({ type: "submitAnswer", isCorrect: false }));
});
