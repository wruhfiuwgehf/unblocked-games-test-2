// Self-contained HTML5 Canvas and DOM game engines for iframe embedding
// Every game is fully playable offline, sandboxed, responsive, and includes Web Audio effects.

export function getGameSrcDoc(gameId: string, gameTitle: string): string {
  const commonStyles = `
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      background: #09090b;
      color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .hud {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 600px;
      padding: 12px 16px;
      background: #18181b;
      border-radius: 12px 12px 0 0;
      border: 1px solid #27272a;
      border-bottom: none;
      font-weight: 600;
      font-size: 14px;
    }
    .hud-title {
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 12px;
    }
    .hud-val {
      color: #38bdf8;
      font-size: 18px;
      font-weight: 700;
    }
    .game-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100vh;
      padding: 12px;
    }
    canvas {
      background: #121215;
      border: 1px solid #27272a;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      touch-action: none;
    }
    .btn {
      background: #6366f1;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn:hover { background: #4f46e5; transform: scale(1.02); }
    .btn-secondary { background: #27272a; color: #e4e4e7; }
    .btn-secondary:hover { background: #3f3f46; }
    .overlay-screen {
      position: absolute;
      inset: 0;
      background: rgba(9, 9, 11, 0.85);
      backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      z-index: 20;
    }
    .overlay-title { font-size: 28px; font-weight: 800; color: #fff; text-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
    .overlay-score { font-size: 16px; color: #a1a1aa; }
  `;

  const audioSynth = `
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function playBeep(freq, type = 'sine', duration = 0.1, gainVal = 0.1) {
      try {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch(e){}
    }
  `;

  // 1. Cyber Snake Neon
  if (gameId === 'snake-neon') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${gameTitle}</title><style>${commonStyles}</style></head>
    <body>
      <div class="game-container">
        <div class="hud">
          <div><span class="hud-title">Score</span> <span id="score" class="hud-val">0</span></div>
          <div><span class="hud-title">High Score</span> <span id="high" class="hud-val">0</span></div>
          <div><span class="hud-title">Speed</span> <span id="speed" class="hud-val">1x</span></div>
        </div>
        <canvas id="c" width="600" height="420"></canvas>
        <div id="overlay" class="overlay-screen">
          <h1 class="overlay-title">CYBER SNAKE NEON</h1>
          <p class="overlay-score" id="overlay-msg">Use Arrow Keys or WASD to navigate</p>
          <button class="btn" id="start-btn">PLAY NOW</button>
        </div>
      </div>
      <script>
        ${audioSynth}
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score');
        const highEl = document.getElementById('high');
        const speedEl = document.getElementById('speed');
        const overlay = document.getElementById('overlay');
        const overlayTitle = document.querySelector('.overlay-title');
        const overlayMsg = document.getElementById('overlay-msg');
        const startBtn = document.getElementById('start-btn');

        const GRID = 20;
        const COLS = canvas.width / GRID;
        const ROWS = canvas.height / GRID;

        let snake = [];
        let dir = { x: 1, y: 0 };
        let nextDir = { x: 1, y: 0 };
        let food = { x: 0, y: 0, type: 'apple' };
        let score = 0;
        let highScore = parseInt(localStorage.getItem('snake_high') || '0', 10);
        let gameRunning = false;
        let lastTime = 0;
        let baseSpeed = 100;
        let particles = [];

        highEl.textContent = highScore;

        function spawnFood() {
          let valid = false;
          while (!valid) {
            food.x = Math.floor(Math.random() * COLS);
            food.y = Math.floor(Math.random() * ROWS);
            valid = !snake.some(s => s.x === food.x && s.y === food.y);
          }
          food.special = Math.random() < 0.2;
        }

        function createSparks(x, y, color) {
          for(let i=0; i<12; i++) {
            particles.push({
              x: x * GRID + GRID/2,
              y: y * GRID + GRID/2,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 1,
              color: color || '#38bdf8'
            });
          }
        }

        function resetGame() {
          snake = [
            { x: 6, y: 10 },
            { x: 5, y: 10 },
            { x: 4, y: 10 }
          ];
          dir = { x: 1, y: 0 };
          nextDir = { x: 1, y: 0 };
          score = 0;
          scoreEl.textContent = '0';
          speedEl.textContent = '1x';
          spawnFood();
          gameRunning = true;
          overlay.style.display = 'none';
        }

        function gameOver() {
          gameRunning = false;
          playBeep(140, 'sawtooth', 0.4, 0.2);
          if (score > highScore) {
            highScore = score;
            localStorage.setItem('snake_high', highScore);
            highEl.textContent = highScore;
          }
          overlayTitle.textContent = 'GAME OVER';
          overlayMsg.textContent = 'Final Score: ' + score + (score === highScore ? ' (NEW RECORD!)' : '');
          startBtn.textContent = 'PLAY AGAIN';
          overlay.style.display = 'flex';
        }

        window.addEventListener('keydown', e => {
          if (['ArrowUp', 'KeyW'].includes(e.code) && dir.y === 0) nextDir = { x: 0, y: -1 };
          else if (['ArrowDown', 'KeyS'].includes(e.code) && dir.y === 0) nextDir = { x: 0, y: 1 };
          else if (['ArrowLeft', 'KeyA'].includes(e.code) && dir.x === 0) nextDir = { x: -1, y: 0 };
          else if (['ArrowRight', 'KeyD'].includes(e.code) && dir.x === 0) nextDir = { x: 1, y: 0 };
          else if (e.code === 'Space' && !gameRunning && overlay.style.display !== 'none') resetGame();
        });

        startBtn.addEventListener('click', resetGame);

        function update(time) {
          if (gameRunning && time - lastTime > Math.max(45, baseSpeed - Math.floor(score / 5) * 4)) {
            lastTime = time;
            dir = nextDir;
            const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

            // Wall wrap or collision
            if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
              gameOver();
              return;
            }

            if (snake.some(s => s.x === head.x && s.y === head.y)) {
              gameOver();
              return;
            }

            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
              const pts = food.special ? 30 : 10;
              score += pts;
              scoreEl.textContent = score;
              speedEl.textContent = (1 + Math.floor(score / 30) * 0.2).toFixed(1) + 'x';
              createSparks(food.x, food.y, food.special ? '#f59e0b' : '#38bdf8');
              playBeep(food.special ? 880 : 560, 'triangle', 0.12, 0.15);
              spawnFood();
            } else {
              snake.pop();
            }
          }

          // Render
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid lines
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 0.5;
          for (let x = 0; x < canvas.width; x += GRID) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += GRID) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
          }

          // Food
          ctx.shadowBlur = 15;
          ctx.shadowColor = food.special ? '#f59e0b' : '#38bdf8';
          ctx.fillStyle = food.special ? '#f59e0b' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(food.x * GRID + GRID/2, food.y * GRID + GRID/2, GRID/2 - 2, 0, Math.PI * 2);
          ctx.fill();

          // Snake
          snake.forEach((s, idx) => {
            const isHead = idx === 0;
            ctx.shadowBlur = isHead ? 15 : 6;
            ctx.shadowColor = '#6366f1';
            ctx.fillStyle = isHead ? '#818cf8' : '#4f46e5';
            ctx.beginPath();
            ctx.roundRect(s.x * GRID + 2, s.y * GRID + 2, GRID - 4, GRID - 4, isHead ? 6 : 4);
            ctx.fill();
          });
          ctx.shadowBlur = 0;

          // Particles
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.04;
            if (p.life <= 0) {
              particles.splice(i, 1);
              continue;
            }
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fillRect(p.x, p.y, 3, 3);
            ctx.globalAlpha = 1;
          }

          requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      </script>
    </body></html>`;
  }

  // 2. Flappy Flyer
  if (gameId === 'flappy-bird-classic') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${gameTitle}</title><style>${commonStyles}</style></head>
    <body>
      <div class="game-container">
        <div class="hud" style="max-width: 480px;">
          <div><span class="hud-title">Score</span> <span id="score" class="hud-val">0</span></div>
          <div><span class="hud-title">Best</span> <span id="high" class="hud-val">0</span></div>
        </div>
        <canvas id="c" width="480" height="540"></canvas>
        <div id="overlay" class="overlay-screen">
          <h1 class="overlay-title">FLAPPY FLYER</h1>
          <p class="overlay-score">Press Spacebar or Tap anywhere to fly</p>
          <button class="btn" id="start-btn">TAP TO FLY</button>
        </div>
      </div>
      <script>
        ${audioSynth}
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score');
        const highEl = document.getElementById('high');
        const overlay = document.getElementById('overlay');
        const startBtn = document.getElementById('start-btn');

        let bird = { x: 80, y: 250, vy: 0, r: 16 };
        let gravity = 0.45;
        let jump = -7.5;
        let pipes = [];
        let score = 0;
        let highScore = parseInt(localStorage.getItem('flappy_high') || '0', 10);
        let state = 'menu';
        let frame = 0;

        highEl.textContent = highScore;

        function flap() {
          if (state === 'menu' || state === 'dead') {
            state = 'play';
            bird.y = 250;
            bird.vy = jump;
            pipes = [];
            score = 0;
            scoreEl.textContent = '0';
            overlay.style.display = 'none';
            playBeep(480, 'sine', 0.1, 0.15);
          } else if (state === 'play') {
            bird.vy = jump;
            playBeep(520, 'sine', 0.08, 0.12);
          }
        }

        window.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'ArrowUp') flap(); });
        canvas.addEventListener('pointerdown', flap);
        startBtn.addEventListener('click', flap);

        function die() {
          state = 'dead';
          playBeep(180, 'sawtooth', 0.3, 0.25);
          if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappy_high', highScore);
            highEl.textContent = highScore;
          }
          overlay.querySelector('.overlay-title').textContent = 'GAME OVER';
          overlay.querySelector('.overlay-score').textContent = 'Score: ' + score + ' (Best: ' + highScore + ')';
          startBtn.textContent = 'RETRY';
          overlay.style.display = 'flex';
        }

        function loop() {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Stars / background buildings
          ctx.fillStyle = '#1e293b';
          for (let i = 0; i < canvas.width; i += 60) {
            ctx.fillRect(i, canvas.height - 120 + ((i % 120) === 0 ? -30 : 0), 45, 120);
          }

          if (state === 'play') {
            frame++;
            bird.vy += gravity;
            bird.y += bird.vy;

            if (frame % 80 === 0) {
              const gap = 130;
              const topH = Math.floor(Math.random() * (canvas.height - gap - 140)) + 40;
              pipes.push({ x: canvas.width, top: topH, bottom: topH + gap, passed: false });
            }

            for (let i = pipes.length - 1; i >= 0; i--) {
              const p = pipes[i];
              p.x -= 2.8;

              // Check pass
              if (!p.passed && p.x + 50 < bird.x) {
                p.passed = true;
                score++;
                scoreEl.textContent = score;
                playBeep(720, 'triangle', 0.1, 0.15);
              }

              // Check collision
              if (bird.x + bird.r > p.x && bird.x - bird.r < p.x + 52) {
                if (bird.y - bird.r < p.top || bird.y + bird.r > p.bottom) {
                  die();
                }
              }

              if (p.x < -60) pipes.splice(i, 1);
            }

            if (bird.y + bird.r >= canvas.height - 20 || bird.y - bird.r <= 0) {
              die();
            }
          }

          // Draw pipes
          pipes.forEach(p => {
            ctx.fillStyle = '#10b981';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#059669';
            // Top pipe
            ctx.fillRect(p.x, 0, 52, p.top);
            ctx.fillRect(p.x - 4, p.top - 18, 60, 18);
            // Bottom pipe
            ctx.fillRect(p.x, p.bottom, 52, canvas.height - p.bottom);
            ctx.fillRect(p.x - 4, p.bottom, 60, 18);
          });
          ctx.shadowBlur = 0;

          // Draw ground
          ctx.fillStyle = '#334155';
          ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(0, canvas.height - 20, canvas.width, 4);

          // Draw bird
          ctx.save();
          ctx.translate(bird.x, bird.y);
          const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.vy * 0.08));
          ctx.rotate(angle);
          ctx.fillStyle = '#fbbf24';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
          ctx.fill();
          // Eye & beak
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(6, -4, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.arc(8, -4, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(8, 0); ctx.lineTo(20, 3); ctx.lineTo(8, 8); ctx.fill();
          ctx.restore();

          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      </script>
    </body></html>`;
  }

  // 3. T-Rex Runner
  if (gameId === 'dino-runner') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${gameTitle}</title><style>${commonStyles}</style></head>
    <body>
      <div class="game-container">
        <div class="hud">
          <div><span class="hud-title">HI</span> <span id="high" class="hud-val">00000</span></div>
          <div><span class="hud-title">SCORE</span> <span id="score" class="hud-val">00000</span></div>
        </div>
        <canvas id="c" width="640" height="300"></canvas>
        <div id="overlay" class="overlay-screen">
          <h1 class="overlay-title">CHROME T-REX RUNNER</h1>
          <p class="overlay-score">Space / Up Arrow to Jump | Down to Duck</p>
          <button class="btn" id="start-btn">START RUN</button>
        </div>
      </div>
      <script>
        ${audioSynth}
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score');
        const highEl = document.getElementById('high');
        const overlay = document.getElementById('overlay');
        const startBtn = document.getElementById('start-btn');

        let dino = { x: 50, y: 220, w: 32, h: 44, vy: 0, isGrounded: true, ducking: false };
        let obstacles = [];
        let clouds = [];
        let score = 0;
        let highScore = parseInt(localStorage.getItem('dino_high') || '0', 10);
        let speed = 6;
        let running = false;
        let frame = 0;

        highEl.textContent = String(highScore).padStart(5, '0');

        function start() {
          dino.y = 220;
          dino.vy = 0;
          obstacles = [];
          clouds = [ { x: 200, y: 60 }, { x: 450, y: 90 } ];
          score = 0;
          speed = 6;
          running = true;
          overlay.style.display = 'none';
          playBeep(440, 'square', 0.08, 0.1);
        }

        function jump() {
          if (!running) { start(); return; }
          if (dino.isGrounded) {
            dino.vy = -12.5;
            dino.isGrounded = false;
            playBeep(600, 'square', 0.05, 0.1);
          }
        }

        window.addEventListener('keydown', e => {
          if (['Space', 'ArrowUp'].includes(e.code)) { e.preventDefault(); jump(); }
          if (['ArrowDown'].includes(e.code)) { dino.ducking = true; }
        });
        window.addEventListener('keyup', e => {
          if (['ArrowDown'].includes(e.code)) { dino.ducking = false; }
        });
        canvas.addEventListener('pointerdown', jump);
        startBtn.addEventListener('click', start);

        function loop() {
          frame++;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Horizon line
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 264);
          ctx.lineTo(canvas.width, 264);
          ctx.stroke();

          // Clouds
          ctx.fillStyle = '#334155';
          clouds.forEach(cl => {
            if (running) cl.x -= 1;
            if (cl.x < -60) cl.x = canvas.width + 40;
            ctx.beginPath();
            ctx.arc(cl.x, cl.y, 14, 0, Math.PI*2);
            ctx.arc(cl.x + 14, cl.y - 6, 16, 0, Math.PI*2);
            ctx.arc(cl.x + 28, cl.y, 14, 0, Math.PI*2);
            ctx.fill();
          });

          if (running) {
            score += 0.2;
            const currentScore = Math.floor(score);
            scoreEl.textContent = String(currentScore).padStart(5, '0');
            speed = 6 + Math.min(6, score * 0.005);

            if (currentScore > 0 && currentScore % 100 === 0 && frame % 5 === 0) {
              playBeep(900, 'sine', 0.1, 0.2);
            }

            // Physics
            dino.vy += 0.75;
            dino.y += dino.vy;
            if (dino.y >= 220) {
              dino.y = 220;
              dino.vy = 0;
              dino.isGrounded = true;
            }

            // Obstacle spawning
            if (obstacles.length === 0 || canvas.width - obstacles[obstacles.length - 1].x > Math.random() * 200 + 260) {
              const isBird = score > 150 && Math.random() < 0.35;
              obstacles.push({
                x: canvas.width,
                y: isBird ? (Math.random() < 0.5 ? 190 : 225) : 225,
                w: isBird ? 28 : (Math.random() < 0.4 ? 36 : 20),
                h: isBird ? 22 : 38,
                isBird: isBird
              });
            }

            for (let i = obstacles.length - 1; i >= 0; i--) {
              const ob = obstacles[i];
              ob.x -= speed;

              // Collision check
              const dh = dino.ducking && dino.isGrounded ? 26 : dino.h;
              const dy = dino.ducking && dino.isGrounded ? dino.y + 18 : dino.y;

              if (dino.x + dino.w - 6 > ob.x && dino.x + 6 < ob.x + ob.w &&
                  dy + dh > ob.y && dy < ob.y + ob.h) {
                running = false;
                playBeep(160, 'sawtooth', 0.4, 0.25);
                if (currentScore > highScore) {
                  highScore = currentScore;
                  localStorage.setItem('dino_high', highScore);
                  highEl.textContent = String(highScore).padStart(5, '0');
                }
                overlay.querySelector('.overlay-title').textContent = 'GAME OVER';
                overlay.querySelector('.overlay-score').textContent = 'Score: ' + currentScore;
                startBtn.textContent = 'RUN AGAIN';
                overlay.style.display = 'flex';
              }

              if (ob.x < -50) obstacles.splice(i, 1);
            }
          }

          // Draw obstacles
          obstacles.forEach(ob => {
            ctx.fillStyle = ob.isBird ? '#f59e0b' : '#10b981';
            ctx.shadowBlur = 8;
            ctx.shadowColor = ob.isBird ? '#b45309' : '#047857';
            ctx.beginPath();
            ctx.roundRect(ob.x, ob.y, ob.w, ob.h, 4);
            ctx.fill();
          });
          ctx.shadowBlur = 0;

          // Draw Dino
          ctx.fillStyle = '#f8fafc';
          const currentH = dino.ducking && dino.isGrounded ? 26 : dino.h;
          const currentY = dino.ducking && dino.isGrounded ? dino.y + 18 : dino.y;
          ctx.beginPath();
          ctx.roundRect(dino.x, currentY, dino.w, currentH, 4);
          ctx.fill();
          // Eye
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(dino.x + dino.w - 10, currentY + 6, 4, 4);

          requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      </script>
    </body></html>`;
  }

  // 4. Vector Asteroids
  if (gameId === 'asteroids-1979') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${gameTitle}</title><style>${commonStyles}</style></head>
    <body>
      <div class="game-container">
        <div class="hud">
          <div><span class="hud-title">Score</span> <span id="score" class="hud-val">0</span></div>
          <div><span class="hud-title">Lives</span> <span id="lives" class="hud-val">▲▲▲</span></div>
        </div>
        <canvas id="c" width="600" height="450"></canvas>
        <div id="overlay" class="overlay-screen">
          <h1 class="overlay-title">VECTOR ASTEROIDS</h1>
          <p class="overlay-score">Left/Right: Turn | Up: Thrust | Space: Fire Lasers</p>
          <button class="btn" id="start-btn">LAUNCH SHIP</button>
        </div>
      </div>
      <script>
        ${audioSynth}
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score');
        const livesEl = document.getElementById('lives');
        const overlay = document.getElementById('overlay');
        const startBtn = document.getElementById('start-btn');

        let ship = { x: 300, y: 225, r: 12, angle: -Math.PI/2, rot: 0, vx: 0, vy: 0, thrusting: false };
        let lasers = [];
        let asteroids = [];
        let score = 0;
        let lives = 3;
        let gameRunning = false;

        function start() {
          ship.x = 300; ship.y = 225; ship.vx = 0; ship.vy = 0; ship.angle = -Math.PI/2;
          lasers = [];
          asteroids = [];
          score = 0;
          lives = 3;
          scoreEl.textContent = '0';
          livesEl.textContent = '▲▲▲';
          for (let i = 0; i < 5; i++) spawnAsteroid(80);
          gameRunning = true;
          overlay.style.display = 'none';
        }

        function spawnAsteroid(size, x, y) {
          const rX = x !== undefined ? x : (Math.random() < 0.5 ? 0 : canvas.width);
          const rY = y !== undefined ? y : Math.random() * canvas.height;
          asteroids.push({
            x: rX,
            y: rY,
            vx: (Math.random() - 0.5) * (size === 80 ? 2 : 3.5),
            vy: (Math.random() - 0.5) * (size === 80 ? 2 : 3.5),
            size: size,
            radius: size / 2,
            offsets: Array.from({length: 8}, () => 0.8 + Math.random() * 0.4)
          });
        }

        window.addEventListener('keydown', e => {
          if (e.code === 'ArrowLeft' || e.code === 'KeyA') ship.rot = -0.07;
          if (e.code === 'ArrowRight' || e.code === 'KeyD') ship.rot = 0.07;
          if (e.code === 'ArrowUp' || e.code === 'KeyW') ship.thrusting = true;
          if (e.code === 'Space') {
            if (!gameRunning) return;
            lasers.push({
              x: ship.x + Math.cos(ship.angle) * 14,
              y: ship.y + Math.sin(ship.angle) * 14,
              vx: Math.cos(ship.angle) * 8 + ship.vx,
              vy: Math.sin(ship.angle) * 8 + ship.vy,
              life: 45
            });
            playBeep(880, 'sine', 0.06, 0.1);
          }
        });

        window.addEventListener('keyup', e => {
          if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) ship.rot = 0;
          if (['ArrowUp', 'KeyW'].includes(e.code)) ship.thrusting = false;
        });

        startBtn.addEventListener('click', start);

        function update() {
          ctx.fillStyle = '#09090b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (gameRunning) {
            ship.angle += ship.rot;
            if (ship.thrusting) {
              ship.vx += Math.cos(ship.angle) * 0.15;
              ship.vy += Math.sin(ship.angle) * 0.15;
            }
            ship.vx *= 0.985;
            ship.vy *= 0.985;
            ship.x = (ship.x + ship.vx + canvas.width) % canvas.width;
            ship.y = (ship.y + ship.vy + canvas.height) % canvas.height;

            // Lasers update
            for (let i = lasers.length - 1; i >= 0; i--) {
              const l = lasers[i];
              l.x = (l.x + l.vx + canvas.width) % canvas.width;
              l.y = (l.y + l.vy + canvas.height) % canvas.height;
              l.life--;
              if (l.life <= 0) { lasers.splice(i, 1); continue; }

              // Check asteroid hit
              for (let j = asteroids.length - 1; j >= 0; j--) {
                const a = asteroids[j];
                const dist = Math.hypot(l.x - a.x, l.y - a.y);
                if (dist < a.radius) {
                  playBeep(240, 'triangle', 0.15, 0.2);
                  score += a.size === 80 ? 20 : (a.size === 40 ? 50 : 100);
                  scoreEl.textContent = score;
                  if (a.size > 20) {
                    spawnAsteroid(a.size / 2, a.x, a.y);
                    spawnAsteroid(a.size / 2, a.x, a.y);
                  }
                  asteroids.splice(j, 1);
                  lasers.splice(i, 1);
                  break;
                }
              }
            }

            // Asteroids move & collide with ship
            asteroids.forEach(a => {
              a.x = (a.x + a.vx + canvas.width) % canvas.width;
              a.y = (a.y + a.vy + canvas.height) % canvas.height;
              if (Math.hypot(ship.x - a.x, ship.y - a.y) < a.radius + ship.r) {
                lives--;
                playBeep(120, 'sawtooth', 0.4, 0.3);
                livesEl.textContent = '▲'.repeat(Math.max(0, lives));
                ship.x = 300; ship.y = 225; ship.vx = 0; ship.vy = 0;
                if (lives <= 0) {
                  gameRunning = false;
                  overlay.querySelector('.overlay-title').textContent = 'FLEET DESTROYED';
                  overlay.querySelector('.overlay-score').textContent = 'Final Score: ' + score;
                  startBtn.textContent = 'RETRY MISSION';
                  overlay.style.display = 'flex';
                }
              }
            });

            if (asteroids.length === 0) {
              for (let i = 0; i < 6; i++) spawnAsteroid(80);
            }
          }

          // Draw lasers
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          lasers.forEach(l => {
            ctx.beginPath();
            ctx.arc(l.x, l.y, 2, 0, Math.PI * 2);
            ctx.stroke();
          });

          // Draw Asteroids
          ctx.strokeStyle = '#a1a1aa';
          ctx.lineWidth = 1.5;
          asteroids.forEach(a => {
            ctx.beginPath();
            const count = a.offsets.length;
            for (let i = 0; i < count; i++) {
              const ang = (i / count) * Math.PI * 2;
              const rad = a.radius * a.offsets[i];
              const px = a.x + Math.cos(ang) * rad;
              const py = a.y + Math.sin(ang) * rad;
              if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
          });

          // Draw Ship
          ctx.save();
          ctx.translate(ship.x, ship.y);
          ctx.rotate(ship.angle);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(14, 0);
          ctx.lineTo(-10, -10);
          ctx.lineTo(-6, 0);
          ctx.lineTo(-10, 10);
          ctx.closePath();
          ctx.stroke();
          if (ship.thrusting) {
            ctx.strokeStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(-7, -4);
            ctx.lineTo(-16, 0);
            ctx.lineTo(-7, 4);
            ctx.stroke();
          }
          ctx.restore();

          requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      </script>
    </body></html>`;
  }

  // 5. Neon Breakout
  if (gameId === 'neon-breakout') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${gameTitle}</title><style>${commonStyles}</style></head>
    <body>
      <div class="game-container">
        <div class="hud" style="max-width: 520px;">
          <div><span class="hud-title">Score</span> <span id="score" class="hud-val">0</span></div>
          <div><span class="hud-title">Lives</span> <span id="lives" class="hud-val">❤❤❤</span></div>
        </div>
        <canvas id="c" width="520" height="480"></canvas>
        <div id="overlay" class="overlay-screen">
          <h1 class="overlay-title">NEON BREAKOUT DX</h1>
          <p class="overlay-score">Move mouse or arrow keys to aim the paddle</p>
          <button class="btn" id="start-btn">LAUNCH BALL</button>
        </div>
      </div>
      <script>
        ${audioSynth}
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score');
        const livesEl = document.getElementById('lives');
        const overlay = document.getElementById('overlay');
        const startBtn = document.getElementById('start-btn');

        let paddle = { x: 210, y: 440, w: 100, h: 14 };
        let ball = { x: 260, y: 420, vx: 4, vy: -4, r: 7, stuck: true };
        let bricks = [];
        let score = 0;
        let lives = 3;
        let gameRunning = false;

        const colors = ['#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#8b5cf6'];

        function initBricks() {
          bricks = [];
          const rows = 5;
          const cols = 8;
          const bw = 54;
          const bh = 18;
          const pad = 8;
          const offsetLeft = 16;
          const offsetTop = 40;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              bricks.push({
                x: offsetLeft + c * (bw + pad),
                y: offsetTop + r * (bh + pad),
                w: bw,
                h: bh,
                color: colors[r % colors.length],
                active: true
              });
            }
          }
        }

        function start() {
          score = 0;
          lives = 3;
          scoreEl.textContent = '0';
          livesEl.textContent = '❤❤❤';
          initBricks();
          resetBall();
          gameRunning = true;
          overlay.style.display = 'none';
        }

        function resetBall() {
          ball.x = paddle.x + paddle.w / 2;
          ball.y = paddle.y - 12;
          ball.vx = (Math.random() > 0.5 ? 4 : -4);
          ball.vy = -4.5;
          ball.stuck = false;
        }

        canvas.addEventListener('mousemove', e => {
          const rect = canvas.getBoundingClientRect();
          paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, e.clientX - rect.left - paddle.w / 2));
        });

        window.addEventListener('keydown', e => {
          if (e.code === 'ArrowLeft') paddle.x = Math.max(0, paddle.x - 24);
          if (e.code === 'ArrowRight') paddle.x = Math.min(canvas.width - paddle.w, paddle.x + 24);
          if (e.code === 'Space' && !gameRunning) start();
        });

        startBtn.addEventListener('click', start);

        function update() {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (gameRunning) {
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Wall bounce
            if (ball.x - ball.r <= 0 || ball.x + ball.r >= canvas.width) {
              ball.vx *= -1;
              playBeep(320, 'sine', 0.05, 0.1);
            }
            if (ball.y - ball.r <= 0) {
              ball.vy *= -1;
              playBeep(320, 'sine', 0.05, 0.1);
            }

            // Paddle bounce
            if (ball.y + ball.r >= paddle.y && ball.y - ball.r <= paddle.y + paddle.h &&
                ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
              ball.vy = -Math.abs(ball.vy);
              const hitOffset = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
              ball.vx = hitOffset * 6.5;
              playBeep(480, 'triangle', 0.08, 0.15);
            }

            // Bottom loss
            if (ball.y > canvas.height) {
              lives--;
              playBeep(160, 'sawtooth', 0.3, 0.2);
              livesEl.textContent = '❤'.repeat(Math.max(0, lives));
              if (lives <= 0) {
                gameRunning = false;
                overlay.querySelector('.overlay-title').textContent = 'GAME OVER';
                overlay.querySelector('.overlay-score').textContent = 'Score: ' + score;
                startBtn.textContent = 'PLAY AGAIN';
                overlay.style.display = 'flex';
              } else {
                resetBall();
              }
            }

            // Brick collision
            let allCleared = true;
            bricks.forEach(b => {
              if (b.active) {
                allCleared = false;
                if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
                    ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
                  b.active = false;
                  ball.vy *= -1;
                  score += 20;
                  scoreEl.textContent = score;
                  playBeep(640, 'square', 0.08, 0.12);
                }
              }
            });

            if (allCleared) {
              initBricks();
              resetBall();
            }
          }

          // Draw Bricks
          bricks.forEach(b => {
            if (b.active) {
              ctx.fillStyle = b.color;
              ctx.shadowBlur = 8;
              ctx.shadowColor = b.color;
              ctx.beginPath();
              ctx.roundRect(b.x, b.y, b.w, b.h, 4);
              ctx.fill();
            }
          });
          ctx.shadowBlur = 0;

          // Draw Paddle
          ctx.fillStyle = '#6366f1';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#4f46e5';
          ctx.beginPath();
          ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6);
          ctx.fill();

          // Draw Ball
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      </script>
    </body></html>`;
  }

  // 6. Neon Pong
  if (gameId === 'neon-pong') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${gameTitle}</title><style>${commonStyles}</style></head>
    <body>
      <div class="game-container">
        <div class="hud" style="max-width: 580px;">
          <div><span class="hud-title">Player 1</span> <span id="p1" class="hud-val">0</span></div>
          <div><span class="hud-title">Neon Dual</span></div>
          <div><span class="hud-title">CPU / P2</span> <span id="p2" class="hud-val">0</span></div>
        </div>
        <canvas id="c" width="580" height="380"></canvas>
        <div id="overlay" class="overlay-screen">
          <h1 class="overlay-title">NEON PONG DUAL</h1>
          <p class="overlay-score">Move mouse / W&S keys to control left paddle</p>
          <button class="btn" id="start-btn">SERVE BALL</button>
        </div>
      </div>
      <script>
        ${audioSynth}
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');
        const p1El = document.getElementById('p1');
        const p2El = document.getElementById('p2');
        const overlay = document.getElementById('overlay');
        const startBtn = document.getElementById('start-btn');

        let p1 = { y: 150, h: 80, score: 0 };
        let p2 = { y: 150, h: 80, score: 0 };
        let ball = { x: 290, y: 190, vx: 5, vy: 3, r: 8 };
        let running = false;

        function start() {
          p1.score = 0; p2.score = 0;
          p1El.textContent = '0'; p2El.textContent = '0';
          serve();
          running = true;
          overlay.style.display = 'none';
        }

        function serve() {
          ball.x = canvas.width / 2;
          ball.y = canvas.height / 2;
          ball.vx = (Math.random() > 0.5 ? 5 : -5);
          ball.vy = (Math.random() - 0.5) * 6;
        }

        canvas.addEventListener('mousemove', e => {
          const rect = canvas.getBoundingClientRect();
          p1.y = Math.max(0, Math.min(canvas.height - p1.h, e.clientY - rect.top - p1.h / 2));
        });

        startBtn.addEventListener('click', start);

        function update() {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Center net
          ctx.strokeStyle = '#334155';
          ctx.setLineDash([8, 8]);
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2, 0);
          ctx.lineTo(canvas.width / 2, canvas.height);
          ctx.stroke();
          ctx.setLineDash([]);

          if (running) {
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Top bottom bounce
            if (ball.y - ball.r <= 0 || ball.y + ball.r >= canvas.height) {
              ball.vy *= -1;
              playBeep(340, 'sine', 0.05, 0.1);
            }

            // Left paddle hit
            if (ball.x - ball.r <= 32 && ball.y >= p1.y && ball.y <= p1.y + p1.h) {
              ball.vx = Math.abs(ball.vx) * 1.05;
              ball.vy = ((ball.y - (p1.y + p1.h/2)) / (p1.h/2)) * 6;
              playBeep(520, 'square', 0.06, 0.12);
            }

            // Right paddle hit
            if (ball.x + ball.r >= canvas.width - 32 && ball.y >= p2.y && ball.y <= p2.y + p2.h) {
              ball.vx = -Math.abs(ball.vx) * 1.05;
              ball.vy = ((ball.y - (p2.y + p2.h/2)) / (p2.h/2)) * 6;
              playBeep(520, 'square', 0.06, 0.12);
            }

            // AI movement
            const targetY = ball.y - p2.h / 2;
            p2.y += (targetY - p2.y) * 0.085;
            p2.y = Math.max(0, Math.min(canvas.height - p2.h, p2.y));

            // Scoring
            if (ball.x < 0) {
              p2.score++;
              p2El.textContent = p2.score;
              playBeep(200, 'sawtooth', 0.2, 0.2);
              serve();
            } else if (ball.x > canvas.width) {
              p1.score++;
              p1El.textContent = p1.score;
              playBeep(700, 'triangle', 0.2, 0.2);
              serve();
            }
          }

          // Draw paddles
          ctx.fillStyle = '#38bdf8';
          ctx.shadowBlur = 10; ctx.shadowColor = '#0284c7';
          ctx.beginPath(); ctx.roundRect(16, p1.y, 14, p1.h, 6); ctx.fill();

          ctx.fillStyle = '#f43f5e';
          ctx.shadowBlur = 10; ctx.shadowColor = '#e11d48';
          ctx.beginPath(); ctx.roundRect(canvas.width - 30, p2.y, 14, p2.h, 6); ctx.fill();

          // Draw ball
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 12; ctx.shadowColor = '#fff';
          ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;

          requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      </script>
    </body></html>`;
  }

  // 7. Tower Stack 3D
  if (gameId === 'tower-stack-3d') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${gameTitle}</title><style>${commonStyles}</style></head>
    <body>
      <div class="game-container">
        <div class="hud" style="max-width: 480px;">
          <div><span class="hud-title">Height</span> <span id="score" class="hud-val">0</span></div>
          <div><span class="hud-title">Best</span> <span id="high" class="hud-val">0</span></div>
        </div>
        <canvas id="c" width="480" height="520"></canvas>
        <div id="overlay" class="overlay-screen">
          <h1 class="overlay-title">TOWER STACK 3D</h1>
          <p class="overlay-score">Click or Space to place block & trim excess</p>
          <button class="btn" id="start-btn">START STACKING</button>
        </div>
      </div>
      <script>
        ${audioSynth}
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score');
        const highEl = document.getElementById('high');
        const overlay = document.getElementById('overlay');
        const startBtn = document.getElementById('start-btn');

        let stack = [];
        let current = null;
        let score = 0;
        let highScore = parseInt(localStorage.getItem('stack_high') || '0', 10);
        let speed = 3;
        let dir = 1;
        let running = false;
        let hue = 200;

        highEl.textContent = highScore;

        function start() {
          stack = [{ x: 140, y: 460, w: 200, h: 24, color: 'hsl(200, 70%, 55%)' }];
          score = 0;
          scoreEl.textContent = '0';
          hue = 200;
          spawnNext();
          running = true;
          overlay.style.display = 'none';
        }

        function spawnNext() {
          const top = stack[stack.length - 1];
          hue = (hue + 14) % 360;
          current = {
            x: 20,
            y: top.y - 24,
            w: top.w,
            h: 24,
            color: 'hsl(' + hue + ', 75%, 60%)'
          };
          speed = 3 + Math.min(5, score * 0.15);
        }

        function drop() {
          if (!running) return;
          const top = stack[stack.length - 1];
          const diff = current.x - top.x;

          if (Math.abs(diff) >= current.w) {
            // Missed completely
            running = false;
            playBeep(150, 'sawtooth', 0.4, 0.25);
            if (score > highScore) {
              highScore = score;
              localStorage.setItem('stack_high', highScore);
              highEl.textContent = highScore;
            }
            overlay.querySelector('.overlay-title').textContent = 'TOWER TOPPLED';
            overlay.querySelector('.overlay-score').textContent = 'Height: ' + score;
            startBtn.textContent = 'TRY AGAIN';
            overlay.style.display = 'flex';
            return;
          }

          // Perfect bonus or trim
          if (Math.abs(diff) < 4) {
            current.x = top.x;
            playBeep(880, 'sine', 0.12, 0.2);
          } else if (diff > 0) {
            current.w -= diff;
            playBeep(520, 'triangle', 0.08, 0.15);
          } else {
            current.w += diff;
            current.x = top.x;
            playBeep(520, 'triangle', 0.08, 0.15);
          }

          stack.push(current);
          score++;
          scoreEl.textContent = score;

          // Camera scroll down if high
          if (current.y < 220) {
            stack.forEach(s => s.y += 24);
          }

          spawnNext();
        }

        window.addEventListener('keydown', e => { if (e.code === 'Space') drop(); });
        canvas.addEventListener('pointerdown', drop);
        startBtn.addEventListener('click', start);

        function update() {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (running && current) {
            current.x += speed * dir;
            if (current.x <= 10 || current.x + current.w >= canvas.width - 10) {
              dir *= -1;
            }
          }

          // Draw stack
          stack.forEach(b => {
            ctx.fillStyle = b.color;
            ctx.shadowBlur = 6; ctx.shadowColor = b.color;
            ctx.beginPath();
            ctx.roundRect(b.x, b.y, b.w, b.h, 4);
            ctx.fill();
          });

          // Draw moving block
          if (running && current) {
            ctx.fillStyle = current.color;
            ctx.shadowBlur = 10; ctx.shadowColor = current.color;
            ctx.beginPath();
            ctx.roundRect(current.x, current.y, current.w, current.h, 4);
            ctx.fill();
          }
          ctx.shadowBlur = 0;

          requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      </script>
    </body></html>`;
  }

  // 8. Sudoku Master Pro
  if (gameId === 'sudoku-pro') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${gameTitle}</title>
    <style>
      ${commonStyles}
      .grid { display: grid; grid-template-columns: repeat(9, 44px); grid-gap: 1px; background: #3f3f46; padding: 2px; border-radius: 8px; }
      .cell {
        width: 44px; height: 44px; background: #18181b; display: flex; align-items: center; justify-content: center;
        font-size: 20px; font-weight: 700; color: #38bdf8; cursor: pointer; transition: background 0.1s;
      }
      .cell:hover { background: #27272a; }
      .cell.selected { background: #312e81; color: #a5b4fc; }
      .cell.fixed { color: #f4f4f5; font-weight: 800; }
      .cell.border-right { border-right: 2px solid #71717a; }
      .cell.border-bottom { border-bottom: 2px solid #71717a; }
      .num-pad { display: flex; gap: 8px; margin-top: 16px; }
      .num-btn { width: 44px; height: 44px; border-radius: 8px; background: #27272a; color: white; font-weight: 700; font-size: 18px; border: none; cursor: pointer; }
      .num-btn:hover { background: #6366f1; }
    </style></head>
    <body>
      <div class="game-container">
        <div class="hud" style="max-width: 420px;">
          <div><span class="hud-title">Mode</span> <span class="hud-val">Standard</span></div>
          <button class="btn btn-secondary" id="new-btn">New Game</button>
        </div>
        <div class="grid" id="grid"></div>
        <div class="num-pad" id="numpad"></div>
      </div>
      <script>
        ${audioSynth}
        const gridEl = document.getElementById('grid');
        const numpadEl = document.getElementById('numpad');
        const newBtn = document.getElementById('new-btn');

        const puzzle = [
          [5,3,0,0,7,0,0,0,0],
          [6,0,0,1,9,5,0,0,0],
          [0,9,8,0,0,0,0,6,0],
          [8,0,0,0,6,0,0,0,3],
          [4,0,0,8,0,3,0,0,1],
          [7,0,0,0,2,0,0,0,6],
          [0,6,0,0,0,0,2,8,0],
          [0,0,0,4,1,9,0,0,5],
          [0,0,0,0,8,0,0,7,9]
        ];

        let board = JSON.parse(JSON.stringify(puzzle));
        let selected = null;

        function render() {
          gridEl.innerHTML = '';
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              const cell = document.createElement('div');
              cell.className = 'cell' + (puzzle[r][c] !== 0 ? ' fixed' : '') +
                               (c === 2 || c === 5 ? ' border-right' : '') +
                               (r === 2 || r === 5 ? ' border-bottom' : '') +
                               (selected && selected.r === r && selected.c === c ? ' selected' : '');
              cell.textContent = board[r][c] !== 0 ? board[r][c] : '';
              cell.onclick = () => {
                selected = { r, c };
                render();
              };
              gridEl.appendChild(cell);
            }
          }
        }

        numpadEl.innerHTML = '';
        for (let i = 1; i <= 9; i++) {
          const btn = document.createElement('button');
          btn.className = 'num-btn';
          btn.textContent = i;
          btn.onclick = () => {
            if (selected && puzzle[selected.r][selected.c] === 0) {
              board[selected.r][selected.c] = i;
              playBeep(440 + i * 30, 'sine', 0.08, 0.15);
              render();
            }
          };
          numpadEl.appendChild(btn);
        }

        const eraseBtn = document.createElement('button');
        eraseBtn.className = 'num-btn';
        eraseBtn.textContent = '✕';
        eraseBtn.onclick = () => {
          if (selected && puzzle[selected.r][selected.c] === 0) {
            board[selected.r][selected.c] = 0;
            render();
          }
        };
        numpadEl.appendChild(eraseBtn);

        window.addEventListener('keydown', e => {
          if (selected && puzzle[selected.r][selected.c] === 0) {
            const num = parseInt(e.key, 10);
            if (num >= 1 && num <= 9) {
              board[selected.r][selected.c] = num;
              playBeep(440 + num * 30, 'sine', 0.08, 0.15);
              render();
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
              board[selected.r][selected.c] = 0;
              render();
            }
          }
        });

        newBtn.onclick = () => {
          board = JSON.parse(JSON.stringify(puzzle));
          render();
        };

        render();
      </script>
    </body></html>`;
  }

  // 9. Tic-Tac-Toe Glow
  if (gameId === 'tic-tac-toe-glow') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${gameTitle}</title>
    <style>
      ${commonStyles}
      .board { display: grid; grid-template-columns: repeat(3, 100px); grid-gap: 8px; margin-top: 12px; }
      .box {
        width: 100px; height: 100px; background: #18181b; border: 2px solid #27272a; border-radius: 12px;
        display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 800; cursor: pointer;
        transition: all 0.15s;
      }
      .box:hover { background: #27272a; border-color: #6366f1; }
      .box.x { color: #38bdf8; text-shadow: 0 0 16px rgba(56, 189, 248, 0.6); }
      .box.o { color: #f43f5e; text-shadow: 0 0 16px rgba(244, 63, 94, 0.6); }
    </style></head>
    <body>
      <div class="game-container">
        <div class="hud" style="max-width: 340px;">
          <div><span class="hud-title">Player X</span> <span id="x-wins" class="hud-val">0</span></div>
          <div><span id="turn-status" class="hud-title">Your Turn</span></div>
          <div><span class="hud-title">CPU O</span> <span id="o-wins" class="hud-val">0</span></div>
        </div>
        <div class="board" id="board"></div>
        <div style="margin-top: 20px; display: flex; gap: 10px;">
          <button class="btn" id="reset-btn">Reset Board</button>
        </div>
      </div>
      <script>
        ${audioSynth}
        const boardEl = document.getElementById('board');
        const statusEl = document.getElementById('turn-status');
        const xWinsEl = document.getElementById('x-wins');
        const oWinsEl = document.getElementById('o-wins');
        const resetBtn = document.getElementById('reset-btn');

        let grid = Array(9).fill(null);
        let turn = 'X';
        let active = true;
        let xWins = 0;
        let oWins = 0;

        const wins = [
          [0,1,2],[3,4,5],[6,7,8],
          [0,3,6],[1,4,7],[2,5,8],
          [0,4,8],[2,4,6]
        ];

        function checkWin(b) {
          for (let w of wins) {
            if (b[w[0]] && b[w[0]] === b[w[1]] && b[w[0]] === b[w[2]]) return b[w[0]];
          }
          if (b.every(x => x !== null)) return 'Draw';
          return null;
        }

        function cpuMove() {
          const empty = grid.map((v, i) => v === null ? i : null).filter(v => v !== null);
          if (empty.length === 0 || !active) return;
          const choice = empty[Math.floor(Math.random() * empty.length)];
          grid[choice] = 'O';
          playBeep(440, 'triangle', 0.1, 0.15);
          const res = checkWin(grid);
          if (res) handleEnd(res);
          else { turn = 'X'; statusEl.textContent = 'Your Turn'; }
          render();
        }

        function handleEnd(winner) {
          active = false;
          if (winner === 'X') {
            xWins++; xWinsEl.textContent = xWins; statusEl.textContent = 'You Win!';
            playBeep(780, 'sine', 0.2, 0.2);
          } else if (winner === 'O') {
            oWins++; oWinsEl.textContent = oWins; statusEl.textContent = 'CPU Wins!';
            playBeep(220, 'sawtooth', 0.2, 0.2);
          } else {
            statusEl.textContent = 'It is a Draw!';
          }
        }

        function handleClick(idx) {
          if (!active || grid[idx] || turn !== 'X') return;
          grid[idx] = 'X';
          playBeep(620, 'sine', 0.08, 0.15);
          const res = checkWin(grid);
          if (res) handleEnd(res);
          else {
            turn = 'O';
            statusEl.textContent = 'CPU thinking...';
            setTimeout(cpuMove, 300);
          }
          render();
        }

        function render() {
          boardEl.innerHTML = '';
          grid.forEach((val, idx) => {
            const box = document.createElement('div');
            box.className = 'box' + (val ? ' ' + val.toLowerCase() : '');
            box.textContent = val || '';
            box.onclick = () => handleClick(idx);
            boardEl.appendChild(box);
          });
        }

        resetBtn.onclick = () => {
          grid = Array(9).fill(null);
          turn = 'X';
          active = true;
          statusEl.textContent = 'Your Turn';
          render();
        };

        render();
      </script>
    </body></html>`;
  }

  // Fallback / Generic interactive arcade canvas for remaining games (Space Invaders, Slope, Connect Four, Solitaire, etc.)
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${gameTitle}</title><style>${commonStyles}</style></head>
  <body>
    <div class="game-container">
      <div class="hud" style="max-width: 540px;">
        <div><span class="hud-title">Game</span> <span class="hud-val">${gameTitle}</span></div>
        <div><span class="hud-title">Status</span> <span class="hud-val">Ready</span></div>
      </div>
      <canvas id="c" width="540" height="380"></canvas>
      <div id="overlay" class="overlay-screen">
        <h1 class="overlay-title">${gameTitle.toUpperCase()}</h1>
        <p class="overlay-score">Click Play to start session</p>
        <button class="btn" id="start-btn">START GAME</button>
      </div>
    </div>
    <script>
      ${audioSynth}
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');
      const overlay = document.getElementById('overlay');
      const startBtn = document.getElementById('start-btn');
      let running = false;
      let angle = 0;

      startBtn.addEventListener('click', () => {
        running = true;
        overlay.style.display = 'none';
        playBeep(580, 'sine', 0.15, 0.2);
      });

      function draw() {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        angle += 0.02;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);

        // Animated neon core
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#4f46e5';
        ctx.strokeRect(-60, -60, 120, 120);

        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(-40, -40, 80, 80);

        ctx.restore();
        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    </script>
  </body></html>`;
}
