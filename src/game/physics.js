import { PHYSICS, BIRD, PLAYABLE_HEIGHT } from './constants.js';

/**
 * Creates the initial bird state.
 */
export function createBird() {
  return {
    x: BIRD.START_X,
    y: BIRD.START_Y,
    vy: 0,
    rotation: 0,
    wingPhase: 0,
    isFlapping: false,
    radius: BIRD.RADIUS,
    width: BIRD.DRAW_WIDTH,
    height: BIRD.DRAW_HEIGHT
  };
}

/**
 * Updates bird physics for a single game step.
 * @param {Object} bird - Bird state object
 * @param {number} deltaRatio - Multiplier for variable frame rates (1.0 at 60fps)
 */
export function updateBirdPhysics(bird, deltaRatio = 1) {
  // Apply gravity
  bird.vy += PHYSICS.GRAVITY * deltaRatio;

  // Clamp fall speed
  if (bird.vy > PHYSICS.MAX_FALL_SPEED) {
    bird.vy = PHYSICS.MAX_FALL_SPEED;
  }

  // Update position
  bird.y += bird.vy * deltaRatio;

  // Calculate target rotation based on vertical velocity
  let targetAngle = 0;
  if (bird.vy < 0) {
    // Upward pitch: snappy and responsive
    targetAngle = PHYSICS.MAX_UP_ANGLE;
  } else {
    // Downward dive: smooth blend based on descent speed
    const normalizedVy = Math.min(bird.vy / PHYSICS.MAX_FALL_SPEED, 1.0);
    targetAngle = normalizedVy * PHYSICS.MAX_DOWN_ANGLE;
  }

  // Smooth rotation transition
  const lerpFactor = bird.vy < 0 ? 0.25 : PHYSICS.ROTATION_LERP;
  bird.rotation += (targetAngle - bird.rotation) * lerpFactor;

  // Update wing flap cycle
  if (bird.vy < 0) {
    bird.wingPhase += BIRD.FLAP_ANIMATION_SPEED * 1.8 * deltaRatio;
  } else {
    bird.wingPhase += BIRD.FLAP_ANIMATION_SPEED * 0.5 * deltaRatio;
  }
}

/**
 * Triggers a flap / jump on the bird.
 * @param {Object} bird - Bird state object
 */
export function jumpBird(bird) {
  bird.vy = PHYSICS.JUMP_FORCE;
  bird.wingPhase = 0;
  bird.isFlapping = true;
}
