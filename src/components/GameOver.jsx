import React, { useEffect } from 'react';
import VideoBackground from './VideoBackground.jsx';

export const GameOver = ({
  score,
  bestScore,
  onRestart,
  onMainMenu
}) => {
  const isNewHigh = score > 0 && score >= bestScore;

  // Allow pressing Space to quickly restart
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  // Compute award tier
  let medalTier = null;
  if (score >= 40) {
    medalTier = { name: 'Platinum Pilot', color: '#38bdf8', icon: '💎' };
  } else if (score >= 20) {
    medalTier = { name: 'Gold Ace', color: '#f59e0b', icon: '🥇' };
  } else if (score >= 10) {
    medalTier = { name: 'Silver Wing', color: '#94a3b8', icon: '🥈' };
  } else if (score >= 5) {
    medalTier = { name: 'Bronze Rookie', color: '#b45309', icon: '🥉' };
  }

  return (
    <div className="game-over-overlay fade-in">
      {/* 1. Custom Video Background (Bottom Layer) */}
      <VideoBackground
        active={true}
        src="/background/gameover.mp4"
        className="gameover-video-background"
      />

      {/* 2. Subtle Dark Transparent Overlay */}
      <div className="gameover-overlay" />

      {/* 3. Existing Game Over Panel & UI Elements (Transparent Panel, Thick Black Typography) */}
      <div className="game-over-card bounce-entrance">
        {/* Banner */}
        <div className="game-over-header">
          <span className="game-over-sub">ROUND CONCLUDED</span>
          <h2 className="game-over-title">GAME OVER</h2>
        </div>

        {/* Score Board */}
        <div className="score-summary-board">
          {/* New High Score celebration tag */}
          {isNewHigh && (
            <div className="new-record-chip">
              <span className="record-sparkle">✨</span>
              <span>NEW PERSONAL BEST!</span>
            </div>
          )}

          <div className="score-stats-grid">
            <div className="stat-column">
              <span className="stat-label">SCORE</span>
              <span className="stat-value current-score-val">{score}</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-column">
              <span className="stat-label">BEST</span>
              <span className="stat-value best-score-val">{bestScore}</span>
            </div>
          </div>

          {/* Optional Tier Medal */}
          {medalTier && (
            <div className="medal-badge" style={{ borderColor: medalTier.color }}>
              <span className="medal-emoji">{medalTier.icon}</span>
              <span className="medal-name" style={{ color: medalTier.color }}>
                {medalTier.name}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="game-over-actions">
          <button
            className="btn-primary play-again-btn"
            onClick={onRestart}
            autoFocus
          >
            <span className="btn-shine" />
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>PLAY AGAIN</span>
          </button>

          <button
            className="btn-secondary menu-btn"
            onClick={onMainMenu}
          >
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>MAIN MENU</span>
          </button>
        </div>

        <p className="restart-hint">Press <kbd className="mini-kbd">SPACE</kbd> to quickly restart</p>
      </div>
    </div>
  );
};

export default GameOver;
