# Modern Flappy Bird Browser Game

A polished, responsive browser flying game inspired by the classic Flappy Bird, built with modern frontend architecture in **React**, **Vite**, **HTML5 Canvas**, and **Modular CSS**.

---

## 🎮 Features

- **Core Gameplay**:
  - High-precision arcade physics (gravity, jump impulse, terminal velocity, velocity-based aerodynamic tilting).
  - Procedural wing flapping animation synced with flight physics.
  - Mathematical collision detection (AABB circle-rectangle algorithm with tuned forgiveness).
  - Ceiling, ground, and obstacle boundary collisions.
  - Difficulty scaling: obstacle speed increases and gap size progressively adjusts as score climbs.
  - Procedural Web Audio API sound synthesizer: zero-latency jump chirps, crystal score chimes, impact thuds, and game-over jingles with audio mute toggle.
  - Persistent High Score saved across sessions via `localStorage`.

- **Modern Visual Redesign**:
  - Classic green pipes redesigned as sleek dark-metal conduits with rounded neon glowing caps, glowing rim lighting, and depth drop-shadows.
  - Modern aerodynamic bird with glowing eye, warm gradients, expressive beak, and motion trail particles.
  - Floating `+1` score indicators and celebration spark particles.
  - Parallax ground striping and atmospheric horizon glow.

- **Responsive & High-DPI Ready**:
  - Canvas scales dynamically to `window.devicePixelRatio` for retina clarity.
  - Responsive layout adapts across mobile phones, tablets, and desktop displays.
  - Input support for **Spacebar** (with page scroll prevention), **mouse click**, and **touchscreen tap**.

---

## 🏗️ Architecture & Project Structure

```
src/
├── components/
│   ├── Background.jsx     # Dedicated background component (Static + Future Video)
│   ├── GameCanvas.jsx     # HTML5 Canvas viewport & input bindings
│   ├── GameHUD.jsx        # Live score counter, high score chip, pause & sound buttons
│   ├── GameOver.jsx       # Game over score card, high score badge, restart & menu buttons
│   └── MainMenu.jsx       # Start screen, logo emblem, personal best, and instructions
├── game/
│   ├── audio.js           # Web Audio API sound synthesizer
│   ├── collision.js       # Circle-rect & boundary collision detection
│   ├── constants.js       # Physics, obstacles, colors, and game configuration
│   ├── gameEngine.js      # Main requestAnimationFrame loop & canvas renderer
│   ├── obstacles.js       # Dynamic obstacle generation, movement, and scoring
│   └── physics.js         # Bird gravity, jump impulse, velocity clamp & rotation
├── hooks/
│   └── useGame.js         # React hook coordinating engine state, inputs, and localStorage
├── styles/
│   ├── game.css           # Viewport layout, background, responsive containers
│   ├── hud.css            # Floating HUD, pause modal, and game over screen
│   └── menu.css           # Glassmorphism cards, badges, and button animations
├── App.jsx                # Root game coordinator
└── main.jsx               # React entry point
```

---

## 🎬 Video Background Integration

The game features dual synchronized video backgrounds for an arcade experience:

- **MAIN MENU**: Displays the serene cyber-dusk vector artwork.
- **PLAYING**: The gameplay video (`/background/game-background.mp4`) loops smoothly full-screen.
- **PAUSED**: The gameplay video pauses in place.
- **GAME OVER**: The dedicated game-over video (`/background/gameover.mp4`) plays and loops seamlessly behind the Game Over score panel and dark overlay.
- **RESTART**: Clicking "PLAY AGAIN" immediately stops the game-over video and resumes the gameplay video from the beginning.
- **MAIN MENU**: Clicking "MAIN MENU" immediately stops the game-over video and restores the main menu background.

### Video Files & Locations
```
public/background/game-background.mp4  # Gameplay background
public/background/gameover.mp4         # Game Over screen background
```

---

## 🚀 Running the Project

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

### 3. Build for production
```bash
npm run build
```

### 4. Preview production build
```bash
npm run preview
```

