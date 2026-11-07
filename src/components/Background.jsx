import React, { useRef, useEffect } from 'react';
import { GAME_STATES } from '../game/constants.js';

export const DEFAULT_GAMEPLAY_VIDEO = '/background/game-background.mp4';

/**
 * Background Component
 * 
 * Manages game background states:
 * 1. MENU: Displays existing static cyber-dusk vector artwork with soft atmosphere vignette.
 * 2. PLAYING: ONLY the custom video fits the full screen with 100% clarity and zero darkening washes.
 * 3. PAUSED: Paused video background.
 * 4. GAME_OVER: Gameplay video is paused while GameOver screen displays its dedicated video.
 *
 * @param {string} gameState - Current game state (MENU | PLAYING | PAUSED | GAME_OVER)
 * @param {string} videoSrc - Path to gameplay MP4 video
 * @param {string} imageSrc - Optional custom image URL for static background
 * @param {number} overlayOpacity - Vignette overlay opacity for menu background (0 to 1)
 */
export const Background = ({
  gameState = GAME_STATES.MENU,
  videoSrc = DEFAULT_GAMEPLAY_VIDEO,
  imageSrc = null,
  overlayOpacity = 0.22
}) => {
  const gameplayVideoRef = useRef(null);

  const isPlaying = gameState === GAME_STATES.PLAYING;
  const isPaused = gameState === GAME_STATES.PAUSED;
  const isGameplayActive = isPlaying || isPaused;

  useEffect(() => {
    const video = gameplayVideoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
      if (gameState === GAME_STATES.MENU) {
        try {
          video.currentTime = 0;
        } catch {}
      }
    }
  }, [gameState, isPlaying]);

  const handleCanPlay = () => {
    if (isPlaying && gameplayVideoRef.current) {
      const playPromise = gameplayVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  };

  return (
    <div className="game-background-container" aria-hidden="true">
      {/* 1. Base Static Background (Active on Main Menu) */}
      <div
        className={`game-background-media game-background-default ${
          isGameplayActive ? 'bg-faded' : 'bg-active'
        }`}
      >
        {imageSrc ? (
          <div
            className="game-background-image"
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
        ) : (
          <>
            {/* Sky Gradient with atmospheric color stop */}
            <div className="bg-sky-layer" />

            {/* Distant celestial orb / sun */}
            <div className="bg-celestial-orb" />

            {/* Parallax distant mountain peaks */}
            <svg className="bg-mountains-layer" viewBox="0 0 1000 400" preserveAspectRatio="none">
              <path
                d="M0,400 L0,220 L120,160 L260,260 L400,140 L550,250 L680,130 L820,240 L940,150 L1000,190 L1000,400 Z"
                fill="url(#mountainGradFar)"
              />
              <path
                d="M0,400 L0,290 L180,210 L340,310 L520,220 L680,320 L840,230 L1000,290 L1000,400 Z"
                fill="url(#mountainGradNear)"
                opacity="0.9"
              />
              <defs>
                <linearGradient id="mountainGradFar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#251e47" />
                  <stop offset="100%" stopColor="#14112e" />
                </linearGradient>
                <linearGradient id="mountainGradNear" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#18153b" />
                  <stop offset="100%" stopColor="#0b091f" />
                </linearGradient>
              </defs>
            </svg>

            {/* Modern Skyline Silhouette with ambient glowing window hints */}
            <div className="bg-skyline-silhouette" />

            {/* Ambient star speckles */}
            <div className="bg-stars-field" />
          </>
        )}
      </div>

      {/* 2. Gameplay Video Background Layer (Fits screen completely, active during PLAYING & PAUSED) */}
      <div
        className={`game-video-container ${isGameplayActive ? 'video-visible' : 'video-hidden'}`}
      >
        <video
          ref={gameplayVideoRef}
          className="game-video-player"
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onCanPlay={handleCanPlay}
        />
      </div>

      {/* 3. Contrast Overlay (Active ONLY on Main Menu; disabled during gameplay so only the video fits the screen) */}
      {!isGameplayActive && (
        <div
          className="game-background-overlay"
          style={{ backgroundColor: `rgba(10, 15, 29, ${overlayOpacity})` }}
        />
      )}
    </div>
  );
};

export default Background;
