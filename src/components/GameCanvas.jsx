import React, { useEffect } from 'react';
import { GAME_STATES } from '../game/constants.js';

export const GameCanvas = ({
  canvasRef,
  onJump,
  gameState,
  onTogglePause
}) => {
  // Global keyboard input management
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Spacebar jump / start
      if (e.code === 'Space') {
        // Prevent browser page scroll on Space
        e.preventDefault();

        if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.MENU) {
          onJump();
        }
      }

      // 'P' or 'Escape' to pause/resume
      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        if (onTogglePause) {
          onTogglePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onJump, gameState, onTogglePause]);

  // Direct canvas pointer/tap handler
  const handlePointerDown = (e) => {
    // Only handle if clicking directly on canvas or gameplay area
    if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.MENU) {
      onJump();
    }
  };

  return (
    <div className="canvas-wrapper" onPointerDown={handlePointerDown}>
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-label="Flappy Modern Game Viewport"
      />
    </div>
  );
};

export default GameCanvas;

