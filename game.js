(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const finalScoreEl = document.getElementById("final-score");
  const startScreen = document.getElementById("start-screen");
  const gameOverScreen = document.getElementById("game-over");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");

  // Grid settings
  const GRID = 20; // 20x20 grid
  let CELL;

  // Game state
  let snake, direction, nextDirection, food, score, best, running, lastTime, speed;

  // Load best score
  best = parseInt(localStorage.getItem("snake-best") || "0", 10);
  bestEl.textContent = best;

  function resize() {
    // Keep square and fit screen
    const maxSize = Math.min(window.innerWidth - 24, window.innerHeight * 0.65, 400);
    const size = Math.floor(maxSize / GRID) * GRID;
    canvas.width = size;
    canvas.height = size;
    CELL = size / GRID;
  }

  function init() {
    resize();
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    speed = 120; // ms per move
    scoreEl.textContent = "0";
    placeFood();
    running = false;
  }

  function placeFood() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID)
      };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  function draw() {
    // Background
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(canvas.width, i * CELL);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = "#ef4444";
    roundRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4, 6);

    // Snake
    snake.forEach((seg, i) => {
      const alpha = 1 - (i / snake.length) * 0.4;
      ctx.fillStyle = i === 0 ? "#22c55e" : `rgba(34, 197, 94, ${alpha})`;
      roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 5);
    });
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function update() {
    // Apply buffered direction (prevents 180° turns)
    if (
      (nextDirection.x !== -direction.x || nextDirection.x === 0) &&
      (nextDirection.y !== -direction.y || nextDirection.y === 0)
    ) {
      direction = nextDirection;
    }

    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };

    // Wall collision → wrap around (more fun offline)
    if (head.x < 0) head.x = GRID - 1;
    if (head.x >= GRID) head.x = 0;
    if (head.y < 0) head.y = GRID - 1;
    if (head.y >= GRID) head.y = 0;

    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      endGame();
      return;
    }

    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem("snake-best", best);
      }
      // Speed up slightly
      speed = Math.max(60, speed - 2);
      placeFood();
    } else {
      snake.pop();
    }
  }

  function gameLoop(timestamp) {
    if (!running) return;
    if (!lastTime) lastTime = timestamp;

    if (timestamp - lastTime >= speed) {
      update();
      draw();
      lastTime = timestamp;
    }
    requestAnimationFrame(gameLoop);
  }

  function startGame() {
    init();
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    running = true;
    lastTime = 0;
    draw();
    requestAnimationFrame(gameLoop);
  }

  function endGame() {
    running = false;
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove("hidden");
  }

  // Input handling
  function setDirection(dir) {
    const map = {
      up:    { x: 0, y: -1 },
      down:  { x: 0, y: 1 },
      left:  { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    if (map[dir]) nextDirection = map[dir];
  }

  // Keyboard
  window.addEventListener("keydown", e => {
    const keyMap = {
      ArrowUp: "up", w: "up", W: "up",
      ArrowDown: "down", s: "down", S: "down",
      ArrowLeft: "left", a: "left", A: "left",
      ArrowRight: "right", d: "right", D: "right"
    };
    if (keyMap[e.key]) {
      e.preventDefault();
      setDirection(keyMap[e.key]);
    }
    // Space / Enter to start
    if ((e.key === " " || e.key === "Enter") && !running) {
      startGame();
    }
  });

  // Touch / swipe
  let touchStartX = 0, touchStartY = 0;
  canvas.addEventListener("touchstart", e => {
    const t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  canvas.addEventListener("touchend", e => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      setDirection(dx > 0 ? "right" : "left");
    } else {
      setDirection(dy > 0 ? "down" : "up");
    }
  }, { passive: true });

  // D-pad buttons
  document.querySelectorAll(".dpad button").forEach(btn => {
    btn.addEventListener("click", () => setDirection(btn.dataset.dir));
    btn.addEventListener("touchstart", e => {
      e.preventDefault();
      setDirection(btn.dataset.dir);
    });
  });

  // Buttons
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);

  // Resize handling
  window.addEventListener("resize", () => {
    resize();
    draw();
  });

  // Initial draw
  init();
  draw();
})();
