import {
  VIRTUAL_WIDTH,
  PLAYABLE_HEIGHT as DEFAULT_PLAYABLE_HEIGHT,
  OBSTACLES
} from './constants.js';

let obstacleCounter = 0;

/**
 * Calculates current game speed based on player score.
 * Gradually increases difficulty.
 *
 * @param {number} score
 * @returns {number}
 */
export function calculateSpeed(score = 0) {
  const bonus = score * OBSTACLES.SPEED_INCREASE_PER_SCORE;
  return Math.min(OBSTACLES.MAX_SPEED, OBSTACLES.BASE_SPEED + bonus);
}

/**
 * Calculates current obstacle vertical gap size based on score.
 *
 * @param {number} score
 * @returns {number}
 */
export function calculateGap(score = 0) {
  const shrink = score * OBSTACLES.GAP_SHRINK_PER_SCORE;
  return Math.max(OBSTACLES.MIN_GAP, OBSTACLES.INITIAL_GAP - shrink);
}

/**
 * Creates a new obstacle pair at a given horizontal position.
 *
 * @param {number} startX - Initial X position
 * @param {number} score - Current player score for difficulty scaling
 * @param {number} playableHeight - Dynamic height of playable area
 * @returns {Object}
 */
export function createObstacle(startX, score = 0, playableHeight = DEFAULT_PLAYABLE_HEIGHT) {
  obstacleCounter += 1;
  const gap = calculateGap(score);
  const minPipe = OBSTACLES.MIN_PIPE_HEIGHT;
  const availableRange = Math.max(60, playableHeight - gap - (minPipe * 2));

  // Randomize top height within safe bounds
  const topHeight = minPipe + Math.random() * availableRange;
  const bottomY = topHeight + gap;
  const bottomHeight = Math.max(20, playableHeight - bottomY);

  return {
    id: `pipe_${obstacleCounter}_${Date.now()}`,
    x: startX,
    width: OBSTACLES.PIPE_WIDTH,
    topHeight,
    bottomY,
    bottomHeight,
    gap,
    passed: false,
    pulseOffset: Math.random() * Math.PI * 2
  };
}

/**
 * Updates all active obstacles: moves them, checks if passed bird,
 * spawns new ones with uniform spacing, and prunes off-screen obstacles.
 *
 * @param {Array} obstacles - Active obstacles array
 * @param {Object} bird - Bird state
 * @param {number} score - Current score
 * @param {number} deltaRatio - Frame delta ratio
 * @param {number} playableHeight - Dynamic height of playable area
 * @returns {{ obstacles: Array, pointsAwarded: number }}
 */
export function updateObstacles(obstacles, bird, score, deltaRatio = 1, playableHeight = DEFAULT_PLAYABLE_HEIGHT) {
  const currentSpeed = calculateSpeed(score);
  const movement = currentSpeed * deltaRatio;
  let pointsAwarded = 0;

  // 1. Move existing obstacles
  for (let i = 0; i < obstacles.length; i++) {
    const pipe = obstacles[i];
    pipe.x -= movement;

    // Check if bird passed this pipe
    if (!pipe.passed && (pipe.x + pipe.width) < bird.x) {
      pipe.passed = true;
      pointsAwarded += 1;
    }
  }

  // 2. Remove offscreen obstacles
  const remainingObstacles = obstacles.filter(pipe => (pipe.x + pipe.width) > -60);

  // 3. Spawn new obstacles with mathematically uniform spacing
  if (remainingObstacles.length === 0) {
    remainingObstacles.push(createObstacle(VIRTUAL_WIDTH + 140, score, playableHeight));
  } else {
    const lastPipe = remainingObstacles[remainingObstacles.length - 1];
    if (lastPipe.x <= VIRTUAL_WIDTH) {
      const nextX = lastPipe.x + OBSTACLES.SPAWN_INTERVAL_DISTANCE;
      remainingObstacles.push(createObstacle(nextX, score, playableHeight));
    }
  }

  return {
    obstacles: remainingObstacles,
    pointsAwarded
  };
}
