import React from 'react';

export const MainMenu = ({ onPlay, bestScore }) => {
  return (
    <div className="menu-overlay menu-fade-in">
      <div className="menu-card glass-panel">
        {/* Game Logo & Emblem */}
        <div className="logo-container">
          <div className="emblem-orb">
            <svg
              className="emblem-feather"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M40 8C30 10 18 20 12 34C11 36 10 38 10 40C12 40 14 39 16 38C28 32 38 20 40 8Z"
                fill="url(#featherGrad)"
              />
              <path
                d="M26 22L16 38"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeOpacity="0.8"
              />
              <defs>
                <linearGradient id="featherGrad" x1="40" y1="8" x2="10" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8" />
                  <stop offset="0.5" stopColor="#818cf8" />
                  <stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="game-title">
            FLAPPY<span className="title-accent">MODERN</span>
          </h1>
          <p className="game-tagline">ARCADE REIMAGINED</p>
        </div>

        {/* High Score Badge */}
        <div className="best-score-badge">
          <svg className="badge-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="badge-label">PERSONAL BEST</span>
          <span className="badge-value">{bestScore}</span>
        </div>

        {/* Play Action Button */}
        <button
          className="btn-primary play-btn"
          onClick={onPlay}
          autoFocus
          aria-label="Start Game"
        >
          <span className="btn-shine" />
          <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="btn-text">PLAY NOW</span>
        </button>

        {/* Gameplay Instructions */}
        <div className="instructions-section">
          <div className="instruction-row">
            <span className="keycap">SPACE</span>
            <span className="separator">or</span>
            <span className="keycap">CLICK</span>
            <span className="instruction-desc">Fly Upward</span>
          </div>
          <div className="instruction-mobile-hint">
            <span className="touch-dot" /> Tap screen on mobile to flap
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;

