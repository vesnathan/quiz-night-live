import type { BadgeDefinition } from './types';

/**
 * Champion Badge
 * Awarded when a player wins 10 quiz sets
 */
const badge: BadgeDefinition = {
  id: 'wins_10',
  name: 'Champion',
  description: 'Win 10 quiz sets',
  icon: '🏆',
  checkCondition: (stats) => stats.setsWon >= 10,
};

export default badge;
