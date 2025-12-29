import type { BadgeDefinition } from './types';

/**
 * First Win Badge
 * Awarded when a player wins their first quiz set
 */
const badge: BadgeDefinition = {
  id: 'first_win',
  name: 'First Victory',
  description: 'Win your first quiz set',
  icon: '🥇',
  checkCondition: (stats) => stats.setsWon >= 1,
};

export default badge;
