import {
  VIRTUAL_WIDTH,
  DEFAULT_VIRTUAL_HEIGHT,
  PLAYABLE_HEIGHT as DEFAULT_PLAYABLE_HEIGHT,
  GROUND_HEIGHT,
  GAME_STATES,
  STORAGE_KEYS
} from './constants.js';
import { createBird, updateBirdPhysics, jumpBird } from './physics.js';
import { checkBoundaryCollision, checkObstacleCollisions } from './collision.js';
import { updateObstacles, createObstacle, calculateSpeed } from './obstacles.js';
import { AudioManager } from './audio.js';

export class GameEngine {
  constructor({
    canvas,
    onScoreUpdate,
    onGameOver,
    onStateChange,
    initialBestScore = 0,
    initialMuted = false
  }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onScoreUpdate = onScoreUpdate || (() => {});
    this.onGameOver = onGameOver || (() => {});
    this.onStateChange = onStateChange || (() => {});

    this.audio = new AudioManager(initialMuted);
    this.state = GAME_STATES.MENU;
    this.score = 0;
    this.bestScore = initialBestScore;

    // Viewport & Dynamic Height
    this.scale = 1;
    this.virtualHeight = DEFAULT_VIRTUAL_HEIGHT;
    this.playableHeight = DEFAULT_PLAYABLE_HEIGHT;
    this.groundY = DEFAULT_PLAYABLE_HEIGHT;

    // Game objects
    this.bird = createBird();
    this.obstacles = [];
    this.particles = [];
    this.floatingTexts = [];

    // Animation & Loop
    this.animationFrameId = null;
    this.lastTimestamp = 0;
    this.groundOffset = 0;
    this.parallaxOffset = 0;

    this.setupViewport();
  }

  /**
   * Adjusts canvas resolution for sharp High-DPI screens and calculates scale.
   * Handles desktop, mobile, tablet and orientation changes dynamically.
   */
  setupViewport() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || window.innerWidth || 480;
    const height = rect.height || window.innerHeight || 720;

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);

    // Full-bleed virtual resolution: fixed 480 width, dynamic height
    this.scale = (width * dpr) / VIRTUAL_WIDTH;
    this.virtualHeight = (height * dpr) / this.scale;
    this.groundY = this.virtualHeight - GROUND_HEIGHT;
    this.playableHeight = this.groundY;
  }

  /**
   * Resets game entities to starting values.
   */
  resetGame() {
    this.bird = createBird();
    this.bird.y = this.playableHeight * 0.45;
    this.obstacles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.score = 0;
    this.groundOffset = 0;
    this.parallaxOffset = 0;
    this.onScoreUpdate(this.score);
  }

  /**
   * Start a new game session.
   */
  start() {
    this.resetGame();
    // Pre-populate with first obstacle
    this.obstacles.push(createObstacle(VIRTUAL_WIDTH + 140, 0, this.playableHeight));
    this.setState(GAME_STATES.PLAYING);
    this.jump();
  }

  /**
   * Set game state and notify React hook.
   */
  setState(newState) {
    this.state = newState;
    this.onStateChange(newState);
  }

  pause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.setState(GAME_STATES.PAUSED);
    }
  }

  resume() {
    if (this.state === GAME_STATES.PAUSED) {
      this.lastTimestamp = performance.now();
      this.setState(GAME_STATES.PLAYING);
    }
  }

  /**
   * Trigger player flap/jump action.
   */
  jump() {
    if (this.state === GAME_STATES.PLAYING) {
      jumpBird(this.bird);
      this.audio.playJump();
      this.emitJumpParticles();
    } else if (this.state === GAME_STATES.MENU) {
      this.start();
    }
  }

  /**
   * Emits subtle feather & glow particles when bird flaps.
   */
  emitJumpParticles() {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: this.bird.x - 14 + (Math.random() * 6 - 3),
        y: this.bird.y + (Math.random() * 8 - 4),
        vx: -(Math.random() * 2 + 1),
        vy: (Math.random() * 2 - 1) + 1.2,
        size: Math.random() * 3.5 + 2,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.03,
        color: Math.random() > 0.5 ? '#38bdf8' : '#fbbf24'
      });
    }
  }

  /**
   * Emits impact explosion particles on collision.
   */
  emitImpactParticles() {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 1.5;
      this.particles.push({
        x: this.bird.x,
        y: this.bird.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02,
        color: ['#f59e0b', '#ef4444', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 4)]
      });
    }
  }

  /**
   * Spawns floating "+1" score popup at a given coordinate.
   */
  spawnScorePopup(x, y) {
    this.floatingTexts.push({
      text: '+1',
      x,
      y,
      alpha: 1.0,
      vy: -1.8,
      life: 1.0
    });
  }

  /**
   * Primary game loop executed via requestAnimationFrame.
   */
  loop = (timestamp) => {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const elapsed = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Normalizing delta time for standard 60 FPS
    const deltaRatio = Math.min(Math.max(elapsed / 16.666, 0.5), 2.5);

    if (this.state === GAME_STATES.PLAYING) {
      this.update(deltaRatio);
    } else if (this.state === GAME_STATES.MENU) {
      // Gentle floating animation in menu
      this.bird.y = (this.playableHeight * 0.45) + Math.sin(timestamp * 0.0035) * 14;
      this.bird.rotation = Math.sin(timestamp * 0.003) * 0.08;
      this.bird.wingPhase += 0.08;
      this.groundOffset = (this.groundOffset + 1.2 * deltaRatio) % 36;
      this.parallaxOffset = (this.parallaxOffset + 0.4 * deltaRatio) % VIRTUAL_WIDTH;
    }

    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Update game simulation.
   */
  update(deltaRatio) {
    // 1. Update bird physics
    updateBirdPhysics(this.bird, deltaRatio);

    // 2. Update obstacles and score
    const obstacleResult = updateObstacles(
      this.obstacles,
      this.bird,
      this.score,
      deltaRatio,
      this.playableHeight
    );
    this.obstacles = obstacleResult.obstacles;

    if (obstacleResult.pointsAwarded > 0) {
      this.score += obstacleResult.pointsAwarded;
      this.onScoreUpdate(this.score);
      this.audio.playScore();
      this.spawnScorePopup(this.bird.x + 20, this.bird.y - 25);

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        try {
          localStorage.setItem(STORAGE_KEYS.BEST_SCORE, String(this.bestScore));
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    }

    // 3. Update ground parallax
    const currentSpeed = calculateSpeed(this.score);
    this.groundOffset = (this.groundOffset + currentSpeed * deltaRatio) % 36;
    this.parallaxOffset = (this.parallaxOffset + currentSpeed * 0.3 * deltaRatio) % VIRTUAL_WIDTH;

    // 4. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * deltaRatio;
      p.y += p.vy * deltaRatio;
      p.life -= p.decay * deltaRatio;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 5. Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * deltaRatio;
      ft.alpha -= 0.025 * deltaRatio;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 6. Check collisions
    const hitBoundary = checkBoundaryCollision(this.bird, this.groundY);
    const hitObstacle = checkObstacleCollisions(this.bird, this.obstacles);

    if (hitBoundary || hitObstacle) {
      this.handleGameOver();
    }
  }

  /**
   * Handles player death & transition to GAME_OVER.
   */
  handleGameOver() {
    this.emitImpactParticles();
    this.audio.playHit();
    setTimeout(() => {
      this.audio.playGameOver();
    }, 180);

    this.setState(GAME_STATES.GAME_OVER);
    this.onGameOver({
      score: this.score,
      bestScore: this.bestScore
    });
  }

  /**
   * Main render dispatch.
   */
  render() {
    const ctx = this.ctx;
    if (!ctx) return;

    // Clear entire screen
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Save and transform canvas to virtual coordinate space
    ctx.save();
    ctx.scale(this.scale, this.scale);

    // Enable smooth rendering
    ctx.imageSmoothingEnabled = true;

    // 1. Atmosphere - left transparent so the custom video background is 100% visible
    this.renderAtmosphere(ctx);

    // 2. Draw modern obstacle pipes
    this.renderObstacles(ctx);

    // 3. Draw particles
    this.renderParticles(ctx);

    // 4. Draw bird
    this.renderBird(ctx);

    // 5. Draw floating "+1" popups
    this.renderFloatingTexts(ctx);

    // 6. Draw ground with modern tech striping
    this.renderGround(ctx);

    ctx.restore();
  }

  /**
   * Atmosphere glow - kept transparent so custom video background shines through cleanly.
   */
  renderAtmosphere(ctx) {
    // Left empty intentionally so video background is completely unobstructed
  }

  /**
   * Modern redesign of classic pipes:
   * Sleek dark metal body, rounded glowing caps, neon edge-lighting, depth shadows.
   */
  renderObstacles(ctx) {
    const time = performance.now() * 0.003;

    for (let i = 0; i < this.obstacles.length; i++) {
      const pipe = this.obstacles[i];
      const capHeight = 24;
      const capOverhang = 5;

      // Glow intensity modulation
      const pulse = Math.sin(time + pipe.pulseOffset) * 0.15 + 0.85;

      // --- TOP PIPE ---
      this.drawModernPipeSegment(
        ctx,
        pipe.x,
        0,
        pipe.width,
        pipe.topHeight,
        true,
        capHeight,
        capOverhang,
        pulse
      );

      // --- BOTTOM PIPE ---
      this.drawModernPipeSegment(
        ctx,
        pipe.x,
        pipe.bottomY,
        pipe.width,
        pipe.bottomHeight,
        false,
        capHeight,
        capOverhang,
        pulse
      );
    }
  }

  /**
   * Draws a single modern pipe segment (top or bottom).
   */
  drawModernPipeSegment(ctx, x, y, width, height, isTop, capHeight, capOverhang, pulse) {
    if (height <= 0) return;

    ctx.save();

    // Subtle drop shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;

    // Pipe Body Gradient (Rich dark slate/indigo with metallic sheen)
    const bodyGrad = ctx.createLinearGradient(x, 0, x + width, 0);
    bodyGrad.addColorStop(0, '#0f172a');
    bodyGrad.addColorStop(0.2, '#1e293b');
    bodyGrad.addColorStop(0.5, '#334155');
    bodyGrad.addColorStop(0.8, '#1e293b');
    bodyGrad.addColorStop(1, '#090d16');

    // Body rectangle
    const bodyY = isTop ? y : y + capHeight;
    const bodyH = Math.max(0, height - capHeight);

    ctx.fillStyle = bodyGrad;
    ctx.fillRect(x, bodyY, width, bodyH);

    // Inner vertical glow seam
    ctx.fillStyle = `rgba(56, 189, 248, ${0.2 * pulse})`;
    ctx.fillRect(x + width * 0.46, bodyY, 3, bodyH);

    // Modern Cap (with rounded rim and neon status line)
    const capX = x - capOverhang;
    const capW = width + (capOverhang * 2);
    const capY = isTop ? (y + height - capHeight) : y;

    // Cap Gradient
    const capGrad = ctx.createLinearGradient(capX, 0, capX + capW, 0);
    capGrad.addColorStop(0, '#0f172a');
    capGrad.addColorStop(0.3, '#334155');
    capGrad.addColorStop(0.5, '#475569');
    capGrad.addColorStop(0.7, '#334155');
    capGrad.addColorStop(1, '#090d16');

    // Cap shape
    ctx.fillStyle = capGrad;
    this.roundRect(ctx, capX, capY, capW, capHeight, 6);
    ctx.fill();

    // Cap border / neon rim
    ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
    ctx.shadowBlur = 8 * pulse;
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.9 * pulse})`;
    this.roundRect(ctx, capX, capY, capW, capHeight, 6);
    ctx.stroke();

    // Glowing energy strip on the cap opening
    const lipY = isTop ? (capY + capHeight - 4) : (capY + 2);
    ctx.fillStyle = `rgba(56, 189, 248, ${0.95 * pulse})`;
    ctx.fillRect(capX + 4, lipY, capW - 8, 2.5);

    ctx.restore();
  }

  /**
   * Renders the stylish modern bird.
   */
  renderBird(ctx) {
    const { x, y, rotation, wingPhase } = this.bird;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Bird drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // 1. Tail Feathers
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(-16, -2);
    ctx.lineTo(-24, -8);
    ctx.lineTo(-20, 0);
    ctx.lineTo(-25, 6);
    ctx.lineTo(-15, 4);
    ctx.closePath();
    ctx.fill();

    // 2. Main Body (Aerodynamic smooth egg shape with vibrant gradient)
    const bodyGrad = ctx.createRadialGradient(-2, -4, 2, 0, 0, 20);
    bodyGrad.addColorStop(0, '#fef08a');
    bodyGrad.addColorStop(0.35, '#f59e0b');
    bodyGrad.addColorStop(0.95, '#d97706');
    bodyGrad.addColorStop(1, '#b45309');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Belly (Soft golden cream)
    ctx.fillStyle = 'rgba(254, 243, 199, 0.75)';
    ctx.beginPath();
    ctx.ellipse(-1, 5, 12, 7, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // 4. Sleek Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(8, -5, 6.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark iris
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(9.5, -5, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Specular eye gleam
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(11, -6.5, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // 5. Modern Aerodynamic Beak
    const beakGrad = ctx.createLinearGradient(12, -2, 24, 2);
    beakGrad.addColorStop(0, '#fb923c');
    beakGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = beakGrad;

    ctx.beginPath();
    ctx.moveTo(13, -3);
    ctx.lineTo(23, 1.5);
    ctx.lineTo(13, 6);
    ctx.closePath();
    ctx.fill();

    // 6. Wing with smooth procedural flapping sine wave
    const wingFlapOffset = Math.sin(wingPhase) * 6;
    const wingGrad = ctx.createLinearGradient(-10, -6, 2, 8);
    wingGrad.addColorStop(0, '#fde047');
    wingGrad.addColorStop(1, '#f59e0b');

    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(-5, 0 + wingFlapOffset * 0.3, 11, 7 - Math.abs(wingFlapOffset) * 0.2, -0.25 - wingFlapOffset * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Wing edge stroke
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#b45309';
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Renders feather, trail, and impact particles.
   */
  renderParticles(ctx) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Renders floating "+1" score indicators.
   */
  renderFloatingTexts(ctx) {
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  /**
   * Modern ground platform:
   * Keeps ground body transparent so the custom video background is 100% visible,
   * while rendering a crisp glowing neon hazard boundary line.
   */
  renderGround(ctx) {
    const groundY = this.groundY;

    ctx.save();

    // 1. Sleek glowing neon boundary line (Cyan)
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, groundY, VIRTUAL_WIDTH, 3.5);
    ctx.shadowBlur = 0;

    // 2. Subtle translucent animated hazard ticks below boundary line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 2;

    const stripeSpacing = 36;
    for (let x = -this.groundOffset; x < VIRTUAL_WIDTH + stripeSpacing; x += stripeSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 3.5);
      ctx.lineTo(x + 12, groundY + 20);
      ctx.stroke();
    }

    // 3. Very subtle soft transparent bottom wash that does not block the video
    const subGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 28);
    subGrad.addColorStop(0, 'rgba(15, 23, 42, 0.25)');
    subGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = subGrad;
    ctx.fillRect(0, groundY + 3.5, VIRTUAL_WIDTH, 25);

    ctx.restore();
  }

  /**
   * Helper to draw rounded rectangle path.
   */
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Clean up loop and listeners.
   */
  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
