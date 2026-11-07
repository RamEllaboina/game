import React from 'react';
import { GAME_STATES } from '../game/constants.js';

export const GameHUD = ({
  score,
  bestScore,
  isPaused,
  isMuted,
  gameState,
  onTogglePause,
  onToggleSound
}) => {
  // Only show HUD during PLAYING and PAUSED states
  if (gameState !== GAME_STATES.PLAYING && gameState !== GAME_STATES.PAUSED) {
    return null;
  }

  return (
    <div className="game-hud-container">
      {/* Top Left: Best Score Pill */}
      <div className="hud-best-chip">
        <svg className="hud-trophy-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 4.89 5.4.78-3.9 3.8 0.92 5.38L12 14.31l-4.82 2.54 0.92-5.38-3.9-3.8 5.4-.78L12 2z" />
        </svg>
        <span className="hud-best-label">BEST</span>
        <span className="hud-best-val">{Math.max(score, bestScore)}</span>
      </div>

      {/* Top Center: Current Live Score */}
      <div className="hud-center-score">
        <span className="score-number">{score}</span>
      </div>

      {/* Top Right: Actions (Pause & Audio Toggle) */}
      <div className="hud-actions">
        {/* Audio Mute/Unmute */}
        <button
          className="hud-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSound();
          }}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Pause / Resume */}
        <button
          className={`hud-btn ${isPaused ? 'btn-active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePause();
          }}
          title={isPaused ? 'Resume Game' : 'Pause Game'}
          aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
        >
          {isPaused ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>
      </div>

      {/* Paused Overlay Banner */}
      {isPaused && (
        <div className="pause-modal-backdrop">
          <div className="pause-card glass-panel">
            <h2 className="pause-title">GAME PAUSED</h2>
            <p className="pause-subtitle">Take a breather</p>
            <button
              className="btn-primary resume-btn"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePause();
              }}
            >
              RESUME GAME
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHUD;

