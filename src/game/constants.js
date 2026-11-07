/**
 * Game Constants & Configuration
 * Provides centralized settings for game dimensions, physics, obstacles, and states.
 */

export const GAME_STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

// Logical canvas coordinate space (virtual resolution)
export const VIRTUAL_WIDTH = 480;
export const DEFAULT_VIRTUAL_HEIGHT = 720;
export const GROUND_HEIGHT = 80;
export const PLAYABLE_HEIGHT = DEFAULT_VIRTUAL_HEIGHT - GROUND_HEIGHT;

// Physics constants
export const PHYSICS = {
  GRAVITY: 0.28,             // Reduced for gentler, smoother fall
  JUMP_FORCE: -6.4,          // Softer, more controlled upward impulse
  MAX_FALL_SPEED: 7.2,       // Capped lower for a less punishing fall rate
  ROTATION_LERP: 0.10,
  MAX_UP_ANGLE: -0.38,       // ~ -21 deg
  MAX_DOWN_ANGLE: 1.15,      // ~ 66 deg
  TERMINAL_VELOCITY_DECAY: 0.99
};

// Bird specification
export const BIRD = {
  START_X: 120,
  START_Y: 310,
  RADIUS: 17,               // Collision hitbox radius
  DRAW_WIDTH: 42,
  DRAW_HEIGHT: 32,
  FLAP_ANIMATION_SPEED: 0.16 // Adjusted for smoother wing flapping
};

// Obstacle (Pipes/Sticks) & Difficulty Configuration
export const OBSTACLES = {
  PIPE_WIDTH: 72,
  INITIAL_GAP: 200,          // Increased from 165px -> wider vertical passage between sticks
  MIN_GAP: 155,              // Increased from 125px -> stays comfortable even at high scores
  GAP_SHRINK_PER_SCORE: 0.5, // Gradual narrowing over time
  MIN_PIPE_HEIGHT: 60,
  SPAWN_INTERVAL_DISTANCE: 280, // Increased from 230px -> more horizontal breathing room between sticks
  BASE_SPEED: 1.9,           // Reduced from 2.5 -> calmer forward game flight speed
  MAX_SPEED: 3.6,            // Reduced from 4.8
  SPEED_INCREASE_PER_SCORE: 0.035
};

// Audio & Storage
export const STORAGE_KEYS = {
  BEST_SCORE: 'flappy_modern_best_score_v1',
  SOUND_MUTED: 'flappy_modern_sound_muted_v1'
};

// Modern Color Palette & Themes
export const THEME = {
  accent: '#6366f1',         // Indigo
  accentGlow: '#818cf8',
  birdBody: '#f59e0b',       // Amber gold
  birdWing: '#fbbf24',
  birdBelly: '#fef3c7',
  birdEye: '#0f172a',
  pipeBorder: '#3b82f6',     // Modern electric blue/cyan gradient
  pipeBodyLight: '#1e293b',
  pipeBodyDark: '#0f172a',
  pipeRimGlow: '#06b6d4',
  groundTop: '#10b981',      // Emerald accent
  groundBottom: '#064e3b'
};
