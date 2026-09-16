// js/game.js
// Core game loop for the cyberpunk endless runner with level progression, scoring, and UI.

import { getRandomObstacleType, createObstacle } from "./obstacles.js";

(() => {
  // Elements
  const player = document.getElementById('player');
  const container = document.querySelector('.game-container');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('high-score');
  const levelEl = document.getElementById('level');
  const flashEl = document.getElementById('level-flash');
  const intelEl = document.getElementById('mission-intel');
  const gameOverEl = document.getElementById('game-over');
  const finalScoreEl = document.getElementById('final-score');
  const restartBtn = document.getElementById('restart-btn');

  // Game constants
  const GRAVITY = 0.6; // px/frame²
  const JUMP_VELOCITY = -12; // initial upward velocity
  const MAX_JUMPS = 2; // double‑jump allowed
  const OBSTACLE_INTERVAL = 2000; // ms between spawns

  // State
  let velocityY = 0;
  let jumpsUsed = 0;
  let isGameOver = false;
  let score = 0;
  let level = 1;
  const levelThresholds = { 2: 500, 3: 1200 };
  const missionTexts = { 2: "Night‑Market Patrol", 3: "Skyline Infiltration" };
  let obstacleTimer = null;

  // Initialise high score
  const storedHigh = localStorage.getItem('cyberpunk-highscore');
  const highScore = storedHigh ? parseInt(storedHigh) : 0;
  highScoreEl.textContent = `High Score: ${highScore}`;

  // Helper UI updates
  const updateScore = () => {
    scoreEl.textContent = `Score: ${score}`;
    if (score > highScore) {
      highScoreEl.textContent = `High Score: ${score}`;
    }
  };

  const updateLevel = () => {
    levelEl.textContent = `Level: ${level}`;
  };

  const flashLevel = () => {
    flashEl.classList.add('active');
    setTimeout(() => flashEl.classList.remove('active'), 300); // 300ms flash
  };

  const showMissionIntel = (text) => {
    intelEl.textContent = text;
    intelEl.classList.add('show');
    setTimeout(() => intelEl.classList.remove('show'), 2000);
  };

  const checkLevelUp = () => {
    if (level < 3 && score >= levelThresholds[level + 1]) {
      level++;
      updateLevel();
      flashLevel();
      showMissionIntel(missionTexts[level] || "");
    }
  };

  // Ground detection
  const groundY = () => window.innerHeight - player.offsetHeight;

  // Player update (gravity & jump handling)
  const updatePlayer = () => {
    velocityY += GRAVITY;
    let newTop = player.offsetTop + velocityY;
    if (newTop >= groundY()) {
      newTop = groundY();
      velocityY = 0;
      jumpsUsed = 0; // reset jumps on ground
    }
    player.style.top = `${newTop}px`;
  };

  // Collision detection against *all* obstacles present in the container
  const checkCollision = () => {
    const pBox = player.getBoundingClientRect();
    const obstacles = container.querySelectorAll('.obstacle');
    for (const obs of obstacles) {
      const oBox = obs.getBoundingClientRect();
      // Shrink obstacle hit‑box to 70% for fairness (same as before)
      const shrink = 0.7;
      const wShr = oBox.width * (1 - shrink) / 2;
      const hShr = oBox.height * (1 - shrink) / 2;
      const shrunk = {
        left: oBox.left + wShr,
        right: oBox.right - wShr,
        top: oBox.top + hShr,
        bottom: oBox.bottom - hShr,
      };
      const intersect = !(pBox.right < shrunk.left ||
                         pBox.left > shrunk.right ||
                         pBox.bottom < shrunk.top ||
                         pBox.top > shrunk.bottom);
      if (intersect) {
        endGame();
        break;
      }
    }
  };

  const endGame = () => {
    isGameOver = true;
    clearInterval(obstacleTimer);
    finalScoreEl.textContent = `Your Score: ${score}`;
    // Persist high score
    if (score > highScore) {
      localStorage.setItem('cyberpunk-highscore', score);
    }
    gameOverEl.classList.remove('hidden');
  };

  // Obstacle spawning
  const spawnObstacle = () => {
    const type = getRandomObstacleType(level);
    const obs = createObstacle(type);
    container.appendChild(obs);
    // Remove after animation (3s)
    setTimeout(() => {
      if (obs.parentNode) obs.parentNode.removeChild(obs);
    }, 3000);
  };

  // Main game loop
  const gameLoop = () => {
    if (isGameOver) return;
    updatePlayer();
    checkCollision();
    // Increment score gradually – one point per frame (~60fps)
    score++;
    updateScore();
    checkLevelUp();
    requestAnimationFrame(gameLoop);
  };

  // Start the game once DOM is ready
  window.addEventListener('load', () => {
    // Position player on ground initially
    player.style.top = `${groundY()}px`;
    // Kick off obstacle spawning
    obstacleTimer = setInterval(spawnObstacle, OBSTACLE_INTERVAL);
    // Start main loop
    gameLoop();
  });

  // Jump handler – space bar
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isGameOver) {
      if (jumpsUsed < MAX_JUMPS) {
        velocityY = JUMP_VELOCITY;
        jumpsUsed++;
      }
      e.preventDefault();
    }
  });

  // Restart button simply reloads the page
  restartBtn.addEventListener('click', () => {
    location.reload();
  });
})();
