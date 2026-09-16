// js/obstacles.js
// Defines obstacle types per level and provides a factory to create obstacle elements.

export const obstacleConfig = {
  1: ['structural-block'], // Level 1
  2: ['laser-grid'],        // Level 2
  3: ['drone'],            // Level 3 (placeholder)
};

/**
 * Returns a random obstacle type name for the given level.
 * @param {number} level - Current game level.
 * @returns {string} obstacle type class name.
 */
export function getRandomObstacleType(level) {
  const types = obstacleConfig[level] || obstacleConfig[1];
  const index = Math.floor(Math.random() * types.length);
  return types[index];
}

/**
 * Creates a DOM element for an obstacle of the specified type.
 * @param {string} type - Obstacle type class (e.g., 'laser-grid').
 * @returns {HTMLElement} obstacle element ready to be appended.
 */
export function createObstacle(type) {
  const obs = document.createElement('div');
  obs.classList.add('obstacle', type);
  obs.id = 'obstacle'; // keep a consistent id for collision detection
  return obs;
}
