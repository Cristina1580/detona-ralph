const state = {
  view: {
    squares: document.querySelectorAll(".square"),
    enemy: document.querySelector(".enemy"),
    timeLeft: document.querySelector("#time-left"),
    score: document.querySelector("#score"),
    lives: document.querySelector("#lives"),
    rankingList: document.querySelector("#ranking-list"),
  },
  values: {
    gameVelocity: 1000,
    hitPosition: 0,
    result: 0,
    currentTime: 60,
    lives: 3,
    tempoPerdaVida: 8000,
  },
  actions: {
    timerId: setInterval(randomSquare, 1000),
    countDownTimerId: setInterval(countDown, 1000),
    vidaTimerId: null,
  },
};

let jogoEncerrado = false;

function countDown() {
  state.values.currentTime--;
  state.view.timeLeft.textContent = state.values.currentTime;

  if (state.values.curretTime <= 0) {
    gameOver();
  }
}

function perderVidaComTempo() {
  state.actions.vidaTimerId = setTimeout(() => {
    state.values.lives--;
    if (state.values.lives < 0) state.values.lives = 0;

    state.view.lives.textContent = "x" + state.values.lives;
    playSound("lose-life");

    if (state.values.lives <= 0) {
      gameOver();
      return;
    }

    if (state.values.tempoPerdaVida > 4000) {
      state.values.tempoPerdaVida -= 200;
    }

    perderVidaComTempo();
  }, state.values.tempoPerdaVida);
}

function randomSquare() {
  state.view.squares.forEach((square) => {
    square.classList.remove("enemy");
  });

  let randomNumber = Math.floor(Math.random() * 9);
  let randomSquare = state.view.squares[randomNumber];
  randomSquare.classList.add("enemy");
  state.values.hitPosition = randomSquare.id;
}

function addListenerHitbox() {
  state.view.squares.forEach((square) => {
    square.addEventListener("mousedown", () => {
      if (square.id === state.values.hitPosition) {
        state.values.result++;
        state.view.score.textContent = state.values.result;
        state.values.hitPosition = null;
        playSound("hit");
      }
    });
  });
}

const volumes = {
  hit: 0.03,
  "lose-life": 0.1,
  "game-over": 0.7,
  "bg-music": 0.6,
};

function playSound(audioName) {
  let audio = new Audio(`./src/audios/${audioName}.m4a`);
  audio.volume = volumes[audioName] || 1.0;
  audio.play();
}

let bgMusic = new Audio("./src/audios/bg-music.m4a");
bgMusic.loop = true;
bgMusic.volume = 1.0;

function startBackgroundMusic() {
  bgMusic.play().catch(() => {
    console.log("Música aguardando interação do usuário.");
  });
}
function stopBackgroundMusic() {
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

function salvarNoRanking(nome, pontuacao) {
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  ranking.push({ nome, pontuacao });
  ranking.sort((a, b) => b.pontuacao - a.pontuacao);
  ranking = ranking.slice(0, 5);
  localStorage.setItem("ranking", JSON.stringify(ranking));
  exibirRanking();
}

function exibirRanking() {
  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  if (!state.view.rankingList) return;

  state.view.rankingList.innerHTML = "";
  ranking.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}º - ${item.nome}: ${item.pontuacao} pts`;
    state.view.rankingList.appendChild(li);
  });
}

function gameOver() {
  if (jogoEncerrado) return;
  jogoEncerrado = true;

  clearInterval(state.actions.countDownTimerId);
  clearInterval(state.actions.timerId);
  clearTimeout(state.actions.vidaTimerId);
  stopBackgroundMusic();
  playSound("game-over");

  state.values.lives = 0;
  if (state.view.lives) state.view.lives.textContent = "x0";

  setTimeout(() => {
    let nome = prompt("Digite seu nome para o ranking: ");
    if (!nome) nome = "Jogador";

    salvarNoRanking(nome, state.values.result);
    alert(`Game Over, ${nome}! Sua pontuação foi: ${state.values.result}`);
    location.reload();
  }, 100);
}

function initialize() {
  addListenerHitbox();
  perderVidaComTempo();
  exibirRanking();
}

document.addEventListener(
  "click",
  () => {
    startBackgroundMusic();
    state.actions.timerId = setInterval(randomSquare, 1000);
    state.actions.countDownTimerId = setInterval(countDown, 1000);
  },
  { once: true }
);

document.querySelector("#clear-ranking").addEventListener("click", () => {
  const confirmar = confirm("Tem certeza que deseja apagar o ranking?");
  if (confirmar) {
    localStorage.removeItem("ranking");
    state.view.rankingList.innerHTML = "";
    alert("Ranking limpo com sucesso!");
  }
});

initialize();
