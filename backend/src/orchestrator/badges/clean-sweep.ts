import type { BadgeDefinition } from './types';

/**
 * Clean Sweep Badge
 * Awarded when a player answers all questions correctly in a set (perfect set)
 * This badge is repeatable - earn one for each perfect set!
 */
const badge: BadgeDefinition = {
  id: 'clean_sweep',
  name: 'Clean Sweep',
  description: 'Answer all questions correctly in a set',
  icon: '🧹',
  checkCondition: (stats) => stats.perfectSets >= 1,
  repeatable: true,
};

export default badge;
