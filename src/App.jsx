import React from 'react';
import { useGame } from './hooks/useGame.js';
import { GAME_STATES } from './game/constants.js';
import Background from './components/Background.jsx';
import GameCanvas from './components/GameCanvas.jsx';
import MainMenu from './components/MainMenu.jsx';
import GameHUD from './components/GameHUD.jsx';
import GameOver from './components/GameOver.jsx';

import './styles/game.css';
import './styles/menu.css';
import './styles/hud.css';

export function App() {
  const {
    canvasRef,
    gameState,
    score,
    bestScore,
    isMuted,
    jump,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    goToMenu,
    toggleSound
  } = useGame();

  const handleTogglePause = () => {
    if (gameState === GAME_STATES.PLAYING) {
      pauseGame();
    } else if (gameState === GAME_STATES.PAUSED) {
      resumeGame();
    }
  };

  return (
    <main className="game-viewport">
      {/* 
        Dedicated Background Layer Component
        Synchronized with gameState: Displays existing static background on MENU,
        and displays full-screen custom MP4 video during gameplay (PLAYING).
      */}
      <Background
        gameState={gameState}
        videoSrc="/background/game-background.mp4"
        overlayOpacity={0.22}
      />

      {/* HTML5 Canvas Gameplay Layer */}
      <GameCanvas
        canvasRef={canvasRef}
        onJump={jump}
        gameState={gameState}
        onTogglePause={handleTogglePause}
      />

      {/* In-Game Heads-Up Display (Live Score, Best Score, Pause, Mute) */}
      <GameHUD
        score={score}
        bestScore={bestScore}
        isPaused={gameState === GAME_STATES.PAUSED}
        isMuted={isMuted}
        gameState={gameState}
        onTogglePause={handleTogglePause}
        onToggleSound={toggleSound}
      />

      {/* Main Start Menu */}
      {gameState === GAME_STATES.MENU && (
        <MainMenu
          onPlay={startGame}
          bestScore={bestScore}
        />
      )}

      {/* Game Over Screen */}
      {gameState === GAME_STATES.GAME_OVER && (
        <GameOver
          score={score}
          bestScore={bestScore}
          onRestart={restartGame}
          onMainMenu={goToMenu}
        />
      )}
    </main>
  );
}

export default App;

