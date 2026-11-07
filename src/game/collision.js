import { PLAYABLE_HEIGHT } from './constants.js';

/**
 * Precision circle vs axis-aligned bounding box (AABB) intersection check.
 * Includes a subtle hitbox tuning factor for fair and satisfying arcade feel.
 *
 * @param {Object} circle - { x, y, radius }
 * @param {Object} rect - { x, y, width, height }
 * @returns {boolean}
 */
export function checkCircleRectCollision(circle, rect) {
  // Effective hitbox radius with small forgiveness margin for fair play
  const effectiveRadius = circle.radius * 0.92;

  // Find closest point on rectangle to circle center
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  // Compute distance from closest point to circle center
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;

  return (dx * dx + dy * dy) < (effectiveRadius * effectiveRadius);
}

/**
 * Checks if the bird collided with the ground or ceiling boundaries.
 *
 * @param {Object} bird
 * @param {number} groundY
 * @returns {boolean}
 */
export function checkBoundaryCollision(bird, groundY = PLAYABLE_HEIGHT) {
  // Hit ceiling
  if (bird.y - bird.radius <= 0) {
    return true;
  }
  // Hit ground
  if (bird.y + bird.radius >= groundY) {
    return true;
  }
  return false;
}

/**
 * Checks if the bird collides with any active obstacle pipes.
 *
 * @param {Object} bird
 * @param {Array} obstacles
 * @returns {boolean}
 */
export function checkObstacleCollisions(bird, obstacles) {
  const circle = {
    x: bird.x,
    y: bird.y,
    radius: bird.radius
  };

  for (let i = 0; i < obstacles.length; i++) {
    const pipe = obstacles[i];

    // Optimization: Skip checking pipes that are far away from bird's horizontal area
    if (pipe.x > bird.x + 60 || pipe.x + pipe.width < bird.x - 60) {
      continue;
    }

    // Top pipe bounding box
    const topRect = {
      x: pipe.x,
      y: 0,
      width: pipe.width,
      height: pipe.topHeight
    };

    if (checkCircleRectCollision(circle, topRect)) {
      return true;
    }

    // Bottom pipe bounding box
    const bottomRect = {
      x: pipe.x,
      y: pipe.bottomY,
      width: pipe.width,
      height: pipe.bottomHeight
    };

    if (checkCircleRectCollision(circle, bottomRect)) {
      return true;
    }
  }

  return false;
}

