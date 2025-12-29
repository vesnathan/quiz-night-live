import type { BadgeDefinition } from './types';

/**
 * Dedicated Player Badge
 * Awarded when a player plays 50 quiz sets
 */
const badge: BadgeDefinition = {
  id: 'sets_50',
  name: 'Dedicated Player',
  description: 'Play 50 quiz sets',
  icon: '🎯',
  checkCondition: (stats) => stats.setsPlayed >= 50,
};

export default badge;
